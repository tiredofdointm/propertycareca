import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { bookingFormSchema } from "@/lib/validation";
import { readJsonBody, zodFieldErrors } from "@/lib/api-utils";
import { getServiceBySlug } from "@/lib/services-data";
import { getDepositCentsForService } from "@/lib/settings";

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bookingFormSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please fix the highlighted fields.",
        fieldErrors: zodFieldErrors(parsed.error),
      },
      { status: 400 }
    );
  }

  const {
    name,
    email,
    phone,
    address,
    serviceSlug,
    preferredDate,
    notes,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    gclid,
    referrer,
    landingPage,
  } = parsed.data;

  const service = getServiceBySlug(serviceSlug);
  if (!service) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", fieldErrors: { serviceSlug: "Unknown service" } },
      { status: 400 }
    );
  }

  // Deposit comes from the owner's dashboard override when set, otherwise
  // the service default.
  const depositCents =
    (await getDepositCentsForService(serviceSlug)) ?? service.depositCents;

  const [booking] = await db
    .insert(bookings)
    .values({
      name,
      email,
      phone,
      address,
      serviceSlug,
      preferredDate,
      notes: notes || null,
      depositAmountCents: depositCents,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      gclid,
      referrer,
      landingPage,
    })
    .returning({ id: bookings.id });

  return NextResponse.json({ id: booking.id }, { status: 201 });
}
