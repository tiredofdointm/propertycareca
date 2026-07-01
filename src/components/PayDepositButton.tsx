"use client";

import { useState } from "react";

export function PayDepositButton({ bookingId }: { bookingId: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/checkout`, {
        method: "POST",
      });
      const body = await response.json().catch(() => null);

      if (response.ok && body?.url) {
        window.location.href = body.url;
        return;
      }

      setError(body?.error ?? "Unable to start checkout. Please try again.");
      setLoading(false);
    } catch {
      setError("Unable to start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Redirecting to secure checkout..." : "Pay Deposit Now"}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
