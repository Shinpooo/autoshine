import { getPackConfig, isBookablePack } from "@/app/lib/booking";
import { getGoogleAccessToken, loadGoogleCredentials } from "@/app/lib/googleAuth";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const TIME_ZONE = "Europe/Brussels";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
const TRANSIT_BUFFER_MINUTES = 60;

type ReservePayload = {
  pack: string;
  vehicleModel: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
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

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-BE", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

async function sendReservationEmail(args: {
  to: string;
  pack: string;
  vehicleModel: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  houseNumber: string;
  notes?: string;
  startIso: string;
  endIso: string;
}) {
  const smtpUser = (process.env.GMAIL_SMTP_USER || "").trim();
  const smtpAppPassword = (process.env.GMAIL_SMTP_APP_PASSWORD || "").trim();
  const fromEmail = (process.env.BOOKING_FROM_EMAIL || smtpUser).trim();
  if (!smtpUser || !smtpAppPassword || !fromEmail) {
    return { sent: false as const, reason: "missing_config" };
  }

  const eventUid = `booking-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@lnautoshine`;
  const toIcsUtc = (value: string) =>
    new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const escapeIcsText = (input: string) =>
    input
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");

  const dateText = formatDateTime(new Date(args.startIso));
  const notesLine = args.notes?.trim()
    ? `<p><strong>Informations complémentaires :</strong> ${args.notes.trim()}</p>`
    : "";

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LN AutoShine//Reservation//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${eventUid}`,
    `DTSTAMP:${toIcsUtc(new Date().toISOString())}`,
    `DTSTART:${toIcsUtc(args.startIso)}`,
    `DTEND:${toIcsUtc(args.endIso)}`,
    `SUMMARY:${escapeIcsText(`LN AutoShine - ${args.pack}`)}`,
    `DESCRIPTION:${escapeIcsText("Demande de réservation LN AutoShine")}`,
    `LOCATION:${escapeIcsText(`${args.address} ${args.houseNumber}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
      <h2>Votre demande de réservation LN AutoShine</h2>
      <p>Nous avons bien reçu votre demande.</p>
      <p><strong>Nom :</strong> ${args.firstName} ${args.lastName}</p>
      <p><strong>Date et heure :</strong> ${dateText}</p>
      <p><strong>Pack :</strong> ${args.pack}</p>
      <p><strong>Véhicule :</strong> ${args.vehicleModel}</p>
      <p><strong>Adresse :</strong> ${args.address} ${args.houseNumber}</p>
      <p><strong>Téléphone :</strong> ${args.phone}</p>
      ${notesLine}
      <p>Un fichier calendrier (.ics) est joint à cet email.</p>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpAppPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: args.to,
      subject: "LN AutoShine - Confirmation de votre demande",
      html,
      text: `Réservation reçue.\nDate: ${dateText}\nPack: ${args.pack}\nVéhicule: ${args.vehicleModel}\nAdresse: ${args.address} ${args.houseNumber}`,
      attachments: [
        {
          filename: "reservation-lnautoshine.ics",
          content: icsContent,
          contentType: "text/calendar; charset=utf-8; method=REQUEST",
        },
      ],
    });
    return { sent: true as const };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "send_failed";
    return { sent: false as const, reason };
  }
}

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
      !required(body.firstName) ||
      !required(body.lastName) ||
      !required(body.phone) ||
      !required(body.email) ||
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
            `Client: ${body.firstName} ${body.lastName}`,
            `Téléphone: ${body.phone}`,
            `Email: ${body.email}`,
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

    const emailResult = await sendReservationEmail({
      to: body.email,
      pack: body.pack,
      vehicleModel: body.vehicleModel,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      address: body.address,
      houseNumber: body.houseNumber,
      notes: body.notes,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
    });

    return NextResponse.json({
      ok: true,
      message: emailResult.sent
        ? "Réservation envoyée. Un email de confirmation vient d'être envoyé."
        : "Réservation envoyée. L'email de confirmation n'a pas pu être envoyé pour le moment.",
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la confirmation de la réservation." },
      { status: 500 }
    );
  }
}
