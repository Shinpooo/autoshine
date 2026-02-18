import { getPackConfig, isBookablePack } from "@/app/lib/booking";
import { getGoogleAccessToken, loadGoogleCredentials } from "@/app/lib/googleAuth";
import { NextResponse } from "next/server";

const TIME_ZONE = "Europe/Brussels";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
const TRANSIT_BUFFER_MINUTES = 60;

type ReservePayload = {
  pack: string;
  vehicleModel: string;
  phone: string;
  address: string;
  houseNumber: string;
  date: string;
  timeSlot: string;
  timeSlotLabel?: string;
  notes?: string;
};

type GoogleFreeBusyResponse = {
  calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }>;
};

function required(value: string | undefined | null) {
  return Boolean(value && value.trim());
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

async function slotIsFree(
  accessToken: string,
  calendarId: string,
  serviceStartIso: string,
  serviceEndIso: string
): Promise<boolean> {
  const serviceStart = new Date(serviceStartIso);
  const serviceEnd = new Date(serviceEndIso);
  const checkEnd = addMinutes(serviceEnd, TRANSIT_BUFFER_MINUTES);

  const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: serviceStart.toISOString(),
      timeMax: checkEnd.toISOString(),
      timeZone: TIME_ZONE,
      items: [{ id: calendarId }],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as GoogleFreeBusyResponse;
  const busy = data.calendars?.[calendarId]?.busy || [];
  return !busy.some((item) => {
    const busyStart = new Date(item.start);
    const busyEnd = new Date(item.end);
    if (!Number.isFinite(busyStart.getTime()) || !Number.isFinite(busyEnd.getTime())) return true;
    const busyEndWithBuffer = addMinutes(busyEnd, TRANSIT_BUFFER_MINUTES);
    return serviceStart < busyEndWithBuffer && busyStart < serviceEnd;
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReservePayload;

    if (
      !required(body.pack) ||
      !required(body.vehicleModel) ||
      !required(body.phone) ||
      !required(body.address) ||
      !required(body.houseNumber) ||
      !required(body.timeSlot)
    ) {
      return NextResponse.json({ error: "Formulaire incomplet." }, { status: 400 });
    }

    if (!isBookablePack(body.pack)) {
      return NextResponse.json({ error: "Pack indisponible à la réservation." }, { status: 400 });
    }

    const start = new Date(body.timeSlot);
    if (!Number.isFinite(start.getTime()) || start <= new Date()) {
      return NextResponse.json({ error: "Créneau invalide." }, { status: 400 });
    }

    const durationMinutes = getPackConfig(body.pack).durationMinutes;
    const end = addMinutes(start, durationMinutes);

    const credentials = await loadGoogleCredentials();
    if (!credentials) {
      return NextResponse.json(
        { error: "Configuration Google Calendar manquante." },
        { status: 503 }
      );
    }

    const accessToken = await getGoogleAccessToken(credentials, CALENDAR_SCOPE);

    const isFree = await slotIsFree(
      accessToken,
      credentials.calendarId,
      start.toISOString(),
      end.toISOString()
    );

    if (!isFree) {
      return NextResponse.json(
        {
          error:
            "Ce créneau vient d'être réservé. Merci de choisir une autre heure disponible.",
        },
        { status: 409 }
      );
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        credentials.calendarId
      )}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: `Réservation - ${body.pack} - ${body.vehicleModel}`,
          description: [
            `Pack: ${body.pack}`,
            `Véhicule: ${body.vehicleModel}`,
            `Téléphone: ${body.phone}`,
            `Adresse: ${body.address} ${body.houseNumber}`,
            body.notes?.trim()
              ? `Informations complémentaires: ${body.notes.trim()}`
              : null,
            "Source: site vitrine (sans acompte)",
          ]
            .filter(Boolean)
            .join("\n"),
          location: `${body.address} ${body.houseNumber}`,
          start: {
            dateTime: start.toISOString(),
            timeZone: TIME_ZONE,
          },
          end: {
            dateTime: end.toISOString(),
            timeZone: TIME_ZONE,
          },
          extendedProperties: {
            private: {
              bookingSource: "website_no_deposit",
            },
          },
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return NextResponse.json(
        { error: err || "Impossible d'enregistrer la réservation dans Google Agenda." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Réservation envoyée. Vous recevrez une confirmation rapidement.",
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la confirmation de la réservation." },
      { status: 500 }
    );
  }
}
