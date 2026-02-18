import { createBookingEventInGoogleCalendar } from "@/app/lib/googleCalendar";
import Stripe from "stripe";

function buildStripeClient(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error("STRIPE_SECRET_KEY manquante.");
  }
  return new Stripe(secret);
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;

  const metadata = session.metadata || {};
  const startIso = metadata.timeSlot;
  const durationMinutes = Number(metadata.durationMinutes || "0");

  if (!startIso || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return;
  }

  await createBookingEventInGoogleCalendar({
    stripeSessionId: session.id,
    pack: metadata.pack || "Pack",
    vehicleModel: metadata.vehicleModel || "Vehicule",
    phone: metadata.phone || "",
    address: metadata.address || "",
    houseNumber: metadata.houseNumber || "",
    notes: metadata.notes || "",
    startIso,
    durationMinutes,
    customerEmail: session.customer_details?.email || undefined,
  });
}

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!webhookSecret) {
      return new Response("STRIPE_WEBHOOK_SECRET manquante", { status: 500 });
    }

    const stripe = buildStripeClient();
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Signature Stripe manquante", { status: 400 });
    }

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook error";
    return new Response(message, { status: 400 });
  }
}
