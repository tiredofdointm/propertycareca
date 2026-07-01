"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * After a successful Stripe redirect, the webhook that flips the booking to
 * deposit_paid can land a second or two after the customer does. Poll a few
 * times so the page updates itself instead of showing a stale "pay now"
 * button to someone who already paid.
 */
export function PendingPaymentRefresher() {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= 5) clearInterval(interval);
    }, 2000);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
