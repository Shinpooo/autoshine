import { getGoogleAccessToken, loadGoogleCredentials } from "@/app/lib/googleAuth";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
const TIME_ZONE = "Europe/Brussels";

type GoogleEventsListResponse = {
  items?: Array<{ id?: string }>;
};

type GoogleEventInsertResponse = {
  id?: string;
};

export type CalendarBookingEventInput = {
  stripeSessionId: string;
  pack: string;
  vehicleModel: string;
  phone: string;
  address: string;
  houseNumber: string;
  notes?: string;
  startIso: string;
  durationMinutes: number;
  customerEmail?: string;
};

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

async function findExistingByStripeSession(
  accessToken: string,
  calendarId: string,
  stripeSessionId: string,
  startIso: string,
  endIso: string
): Promise<string | null> {
  const endpoint = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
  );
  endpoint.searchParams.set("privateExtendedProperty", `stripeSessionId=${stripeSessionId}`);
  endpoint.searchParams.set("timeMin", new Date(new Date(startIso).getTime() - 86_400_000).toISOString());
  endpoint.searchParams.set("timeMax", new Date(new Date(endIso).getTime() + 86_400_000).toISOString());
  endpoint.searchParams.set("singleEvents", "true");

  const response = await fetch(endpoint.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GoogleEventsListResponse;
  const first = data.items?.[0];
  return first?.id || null;
}

export async function createBookingEventInGoogleCalendar(
  input: CalendarBookingEventInput
): Promise<{ eventId: string | null }> {
  const credentials = await loadGoogleCredentials();
  if (!credentials) {
    throw new Error("Configuration Google Calendar manquante.");
  }

  const accessToken = await getGoogleAccessToken(credentials, CALENDAR_SCOPE);

  const start = new Date(input.startIso);
  const end = addMinutes(start, input.durationMinutes);
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  const existingId = await findExistingByStripeSession(
    accessToken,
    credentials.calendarId,
    input.stripeSessionId,
    startIso,
    endIso
  );
  if (existingId) {
    return { eventId: existingId };
  }

  const descriptionLines = [
    `Pack: ${input.pack}`,
    `Vehicule: ${input.vehicleModel}`,
    `Telephone: ${input.phone}`,
    `Adresse: ${input.address} ${input.houseNumber}`,
    `Stripe session: ${input.stripeSessionId}`,
  ];

  if (input.customerEmail) {
    descriptionLines.push(`Email client: ${input.customerEmail}`);
  }

  if (input.notes?.trim()) {
    descriptionLines.push(`Notes: ${input.notes.trim()}`);
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
        summary: `${input.pack} - ${input.vehicleModel}`,
        description: descriptionLines.join("\n"),
        location: `${input.address} ${input.houseNumber}`,
        start: {
          dateTime: startIso,
          timeZone: TIME_ZONE,
        },
        end: {
          dateTime: endIso,
          timeZone: TIME_ZONE,
        },
        extendedProperties: {
          private: {
            stripeSessionId: input.stripeSessionId,
          },
        },
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || "Creation evenement Google impossible.");
  }

  const data = (await response.json()) as GoogleEventInsertResponse;
  return { eventId: data.id || null };
}
