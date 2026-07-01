import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { getServiceBySlug } from "@/lib/services-data";
import { getStripeClient } from "@/lib/stripe";
import { parseIdParam } from "@/lib/api-utils";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const bookingId = parseIdParam(id);
  if (bookingId === null) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Online payments are not currently available." },
      { status: 503 }
    );
  }

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "pending") {
    return NextResponse.json(
      { error: "This booking is not awaiting a deposit." },
      { status: 400 }
    );
  }

  // If a checkout session was already created for this booking (e.g. a
  // double-click, a second tab, or a retried request), reuse it instead of
  // creating a second live session that could result in a double charge.
  if (booking.stripeCheckoutSessionId) {
    const existing = await stripe.checkout.sessions.retrieve(
      booking.stripeCheckoutSessionId
    );
    if (existing.status === "open" && existing.url) {
      return NextResponse.json({ url: existing.url });
    }
  }

  const service = getServiceBySlug(booking.serviceSlug);
  if (!service) {
    return NextResponse.json(
      { error: "This service is no longer available. Please contact us." },
      { status: 409 }
    );
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: booking.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: booking.depositAmountCents,
          product_data: {
            name: `${service.name} — Booking Deposit`,
          },
        },
      },
    ],
    success_url: `${siteUrl}/booking/${booking.id}?paid=1`,
    cancel_url: `${siteUrl}/booking/${booking.id}`,
    metadata: { bookingId: String(booking.id) },
  });

  await db
    .update(bookings)
    .set({ stripeCheckoutSessionId: session.id, updatedAt: new Date() })
    .where(eq(bookings.id, bookingId));

  return NextResponse.json({ url: session.url });
}
