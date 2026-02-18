import { centsToEuros, computeDepositCents, getPackConfig } from "@/app/lib/booking";
import Stripe from "stripe";

type CheckoutPayload = {
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

function required(value: string | undefined | null) {
  return Boolean(value && value.trim());
}

function resolveOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secret) {
      return Response.json(
        { error: "Configuration Stripe manquante: STRIPE_SECRET_KEY." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as CheckoutPayload;

    if (
      !required(body.pack) ||
      !required(body.vehicleModel) ||
      !required(body.phone) ||
      !required(body.address) ||
      !required(body.houseNumber) ||
      !required(body.timeSlot)
    ) {
      return Response.json({ error: "Formulaire incomplet." }, { status: 400 });
    }

    const stripe = new Stripe(secret);
    const packConfig = getPackConfig(body.pack);
    const depositCents = computeDepositCents(packConfig.totalPriceCents);
    const origin = resolveOrigin(request);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "bancontact"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            product_data: {
              name: `Acompte 20% - ${body.pack}`,
              description: `${body.vehicleModel} | ${body.timeSlotLabel || body.timeSlot}`,
            },
            unit_amount: depositCents,
          },
        },
      ],
      success_url: `${origin}/reservation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/reservation/cancel`,
      metadata: {
        pack: body.pack,
        vehicleModel: body.vehicleModel,
        phone: body.phone,
        address: body.address,
        houseNumber: body.houseNumber,
        date: body.date || "",
        timeSlot: body.timeSlot,
        timeSlotLabel: body.timeSlotLabel || "",
        durationMinutes: String(packConfig.durationMinutes),
        notes: (body.notes || "").slice(0, 450),
      },
      custom_text: {
        submit: {
          message: `Acompte de ${centsToEuros(depositCents)} EUR. Le solde sera regle sur place.`,
        },
      },
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      payment_intent_data: {
        metadata: {
          bookingPack: body.pack,
          bookingTimeSlot: body.timeSlot,
        },
      },
    });

    if (!session.url) {
      return Response.json({ error: "Impossible de creer la session Stripe." }, { status: 500 });
    }

    return Response.json({ checkoutUrl: session.url });
  } catch {
    return Response.json({ error: "Erreur lors de la creation du paiement." }, { status: 500 });
  }
}
