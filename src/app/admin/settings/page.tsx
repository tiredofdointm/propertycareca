import {
  getBookingFeeCents,
  getServicePricing,
  getStripeSettingsStatus,
} from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [pricing, bookingFeeCents, stripe] = await Promise.all([
    getServicePricing(),
    getBookingFeeCents(),
    getStripeSettingsStatus(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-dark">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm text-foreground/60">
        Prices, fees, and your connected Stripe account &mdash; everything here
        takes effect immediately, no redeploy needed. Public pages never show
        these numbers; customers always get a custom estimate.
      </p>
      <div className="mt-8">
        <SettingsForm
          initialPricing={pricing}
          initialBookingFeeCents={bookingFeeCents}
          initialStripe={stripe}
        />
      </div>
    </div>
  );
}
