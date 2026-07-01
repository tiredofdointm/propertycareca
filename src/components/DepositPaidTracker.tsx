"use client";

import { useEffect } from "react";
import { trackEvent, trackGoogleAdsConversion } from "@/lib/analytics";

const FIRED_KEY_PREFIX = "pc_deposit_tracked_";

/**
 * Fires the deposit-paid conversion exactly once per booking, the first time
 * this page renders with status=deposit_paid — dedup'd in sessionStorage so
 * refreshing the confirmation page doesn't double-count the conversion.
 */
export function DepositPaidTracker({
  bookingId,
  valueCents,
}: {
  bookingId: number;
  valueCents: number;
}) {
  useEffect(() => {
    const key = `${FIRED_KEY_PREFIX}${bookingId}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // If storage isn't available, fire anyway — a rare duplicate event
      // beats losing the conversion entirely.
    }

    trackEvent("deposit_paid", {
      booking_id: bookingId,
      value: valueCents / 100,
      currency: "CAD",
    });
    trackGoogleAdsConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_DEPOSIT, {
      value: valueCents / 100,
      currency: "CAD",
    });
  }, [bookingId, valueCents]);

  return null;
}
