import { getPackConfig, isBookablePack } from "@/app/lib/booking";
import { getGoogleAccessToken, loadGoogleCredentials } from "@/app/lib/googleAuth";
import { NextResponse } from "next/server";

const TIME_ZONE = "Europe/Brussels";
const LOOKAHEAD_DAYS = 45;
const MAX_DAYS_RETURNED = 18;
const OPEN_HOUR = 8;
const CLOSE_HOUR = 20;
const SLOT_STEP_MINUTES = 30;
const MIN_NOTICE_MINUTES = 120;
const TRANSIT_BUFFER_MINUTES = 60;
const CALENDAR_READ_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

type BusyRange = {
  start: Date;
  end: Date;
};

type GoogleFreeBusyResponse = {
  calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }>;
};

function getZonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "00";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
) {
  const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  let guess = targetAsUtc;

  for (let i = 0; i < 4; i += 1) {
    const local = getZonedParts(new Date(guess), timeZone);
    const localAsUtc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute);
    const diff = targetAsUtc - localAsUtc;
    guess += diff;
    if (diff === 0) break;
  }

  return new Date(guess);
}

function localDateKey(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

function localDateLabel(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("fr-BE", {
    timeZone,
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}

function timeLabel(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("fr-BE", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

async function getBusyRanges(accessToken: string, calendarId: string, start: Date, end: Date) {
  const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      timeZone: TIME_ZONE,
      items: [{ id: calendarId }],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    const reason = data.error?.message || "Erreur Google Calendar freeBusy.";
    throw new Error(reason);
  }

  const data = (await response.json()) as GoogleFreeBusyResponse;
  const busy = data.calendars?.[calendarId]?.busy || [];

  return busy
    .map((item) => ({ start: new Date(item.start), end: new Date(item.end) }))
    .filter((item) => Number.isFinite(item.start.getTime()) && Number.isFinite(item.end.getTime()));
}

function buildAvailability(busyRanges: BusyRange[], durationMinutes: number) {
  const now = new Date();
  const minStart = addMinutes(now, MIN_NOTICE_MINUTES);
  const todayLocal = getZonedParts(now, TIME_ZONE);

  // Reserve 1h after each existing service for transit, so two bookings are never adjacent.
  const busyWithBuffer = busyRanges.map((busy) => ({
    start: busy.start,
    end: addMinutes(busy.end, TRANSIT_BUFFER_MINUTES),
  }));

  const days: Array<{
    date: string;
    label: string;
    slots: Array<{ start: string; end: string; label: string }>;
  }> = [];

  for (let i = 0; i <= LOOKAHEAD_DAYS; i += 1) {
    const dayAnchor = zonedDateTimeToUtc(
      todayLocal.year,
      todayLocal.month,
      todayLocal.day + i,
      0,
      0,
      TIME_ZONE
    );

    const dayParts = getZonedParts(dayAnchor, TIME_ZONE);
    const openAt = zonedDateTimeToUtc(
      dayParts.year,
      dayParts.month,
      dayParts.day,
      OPEN_HOUR,
      0,
      TIME_ZONE
    );
    const closeAt = zonedDateTimeToUtc(
      dayParts.year,
      dayParts.month,
      dayParts.day,
      CLOSE_HOUR,
      0,
      TIME_ZONE
    );

    const slots: Array<{ start: string; end: string; label: string }> = [];

    for (
      let cursor = new Date(openAt);
      addMinutes(cursor, durationMinutes) <= closeAt;
      cursor = addMinutes(cursor, SLOT_STEP_MINUTES)
    ) {
      const slotEnd = addMinutes(cursor, durationMinutes);
      if (cursor < minStart) continue;

      const isBusy = busyWithBuffer.some((busy) =>
        overlaps(cursor, slotEnd, busy.start, busy.end)
      );
      if (isBusy) continue;

      slots.push({
        start: cursor.toISOString(),
        end: slotEnd.toISOString(),
        label: `${timeLabel(cursor, TIME_ZONE)} - ${timeLabel(slotEnd, TIME_ZONE)}`,
      });
    }

    if (slots.length > 0) {
      days.push({
        date: localDateKey(openAt, TIME_ZONE),
        label: localDateLabel(openAt, TIME_ZONE),
        slots,
      });
    }

    if (days.length >= MAX_DAYS_RETURNED) break;
  }

  return days;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pack = (searchParams.get("pack") || "").trim();
    if (!isBookablePack(pack)) {
      return NextResponse.json({ error: "Pack indisponible à la réservation." }, { status: 400 });
    }
    const durationMinutes = getPackConfig(pack).durationMinutes;

    const credentials = await loadGoogleCredentials();
    if (!credentials) {
      return NextResponse.json(
        {
          error:
            "Configuration Google Calendar manquante. Ajoute GOOGLE_CALENDAR_ID et soit GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, soit un fichier JSON de service account dans le projet.",
        },
        { status: 503 }
      );
    }

    const accessToken = await getGoogleAccessToken(credentials, CALENDAR_READ_SCOPE);
    const now = new Date();
    const end = addMinutes(now, LOOKAHEAD_DAYS * 24 * 60);
    const busyRanges = await getBusyRanges(accessToken, credentials.calendarId, now, end);
    const days = buildAvailability(busyRanges, durationMinutes);

    return NextResponse.json({
      timeZone: TIME_ZONE,
      days,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Impossible de recuperer les disponibilites Google Agenda.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
