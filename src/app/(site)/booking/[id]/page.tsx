import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { getServiceBySlug, formatCents } from "@/lib/services-data";
import { isStripeConfigured } from "@/lib/stripe";
import { parseIdParam } from "@/lib/api-utils";
import { PayDepositButton } from "@/components/PayDepositButton";
import { PendingPaymentRefresher } from "@/components/PendingPaymentRefresher";
import { DepositPaidTracker } from "@/components/DepositPaidTracker";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
};

const statusCopy: Record<string, { title: string; description: string }> = {
  pending: {
    title: "Booking received",
    description: "Secure your spot by paying the deposit below.",
  },
  deposit_paid: {
    title: "Deposit received",
    description: "We'll be in touch to confirm the exact arrival window.",
  },
  confirmed: {
    title: "Booking confirmed",
    description: "Your service is scheduled. We'll see you soon!",
  },
  completed: {
    title: "Service completed",
    description: "Thanks for choosing PropertyCareCA!",
  },
  cancelled: {
    title: "Booking cancelled",
    description: "This booking was cancelled. Contact us if that's a mistake.",
  },
};

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { paid } = await searchParams;
  const bookingId = parseIdParam(id);
  if (bookingId === null) notFound();

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) notFound();

  const service = getServiceBySlug(booking.serviceSlug);
  const copy = statusCopy[booking.status] ?? statusCopy.pending;
  const awaitingWebhook = paid === "1" && booking.status === "pending";
  const stripeConfigured = await isStripeConfigured();
  const depositPaid = booking.status !== "pending" && booking.status !== "cancelled";

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-dark">{copy.title}</h1>
      <p className="mt-2 text-foreground/70">{copy.description}</p>

      <div className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-foreground/50">Service</dt>
            <dd className="mt-1 text-sm text-foreground/80">{service?.name ?? booking.serviceSlug}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-foreground/50">Preferred date</dt>
            <dd className="mt-1 text-sm text-foreground/80">{booking.preferredDate}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-foreground/50">Address</dt>
            <dd className="mt-1 text-sm text-foreground/80">{booking.address}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-foreground/50">Deposit</dt>
            <dd className="mt-1 text-sm text-foreground/80">
              {formatCents(booking.depositAmountCents)}
            </dd>
          </div>
        </dl>
      </div>

      {depositPaid ? (
        <DepositPaidTracker
          bookingId={booking.id}
          valueCents={booking.depositAmountCents}
        />
      ) : null}

      <div className="mt-8">
        {awaitingWebhook ? (
          <>
            <p className="text-sm text-foreground/60">
              Payment received &mdash; finalizing your booking. This page will
              update automatically in a few seconds.
            </p>
            <PendingPaymentRefresher />
          </>
        ) : null}
        {!awaitingWebhook && booking.status === "pending" && stripeConfigured ? (
          <PayDepositButton bookingId={booking.id} />
        ) : null}
        {!awaitingWebhook && booking.status === "pending" && !stripeConfigured ? (
          <p className="text-sm text-foreground/60">
            Online payment is temporarily unavailable. We&apos;ll follow up
            by phone or email to arrange your deposit.
          </p>
        ) : null}
      </div>

      <Link href="/" className="mt-8 inline-block text-sm font-semibold text-brand hover:text-brand-dark">
        &larr; Back to home
      </Link>
    </div>
  );
}
