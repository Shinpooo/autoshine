import { NextResponse } from "next/server";

const TIME_ZONE = "Europe/Brussels";

function required(value: string | null) {
  return Boolean(value && value.trim());
}

function escapeIcsText(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toIcsUtc(value: string): string {
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return "";
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const pack = searchParams.get("pack") || "Réservation";
  const vehicle = searchParams.get("vehicle") || "Véhicule";
  const address = searchParams.get("address") || "";

  if (!required(start) || !required(end)) {
    return NextResponse.json({ error: "Paramètres .ics manquants." }, { status: 400 });
  }

  const dtStart = toIcsUtc(start as string);
  const dtEnd = toIcsUtc(end as string);
  if (!dtStart || !dtEnd) {
    return NextResponse.json({ error: "Dates .ics invalides." }, { status: 400 });
  }

  const uid = `booking-${dtStart}-${Math.random().toString(36).slice(2, 10)}@lnautoshine`;
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const summary = escapeIcsText(`LN AutoShine - ${pack} - ${vehicle}`);
  const location = escapeIcsText(address);
  const description = escapeIcsText("Demande de réservation LN AutoShine.");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LN AutoShine//Booking//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `X-WR-TIMEZONE:${TIME_ZONE}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="reservation-lnautoshine.ics"',
      "Cache-Control": "no-store",
    },
  });
}
