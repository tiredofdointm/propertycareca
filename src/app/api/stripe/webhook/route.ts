import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { getStripeClient } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhooks are not configured." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = Number(session.metadata?.bookingId);

    if (Number.isInteger(bookingId) && bookingId > 0) {
      // Only transition a booking that is still pending on the checkout
      // session we actually created for it — this makes the handler safe
      // against Stripe's at-least-once webhook delivery (retries/replays)
      // and against a stale session completing after the booking moved on
      // (e.g. an admin already cancelled it, or a newer session replaced it).
      await db
        .update(bookings)
        .set({
          status: "deposit_paid",
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(bookings.id, bookingId),
            eq(bookings.status, "pending"),
            eq(bookings.stripeCheckoutSessionId, session.id)
          )
        );
    }
  }

  return NextResponse.json({ received: true });
}
