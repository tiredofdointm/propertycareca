"use client";

import { useState, type FormEvent } from "react";
import type { ServicePricing, StripeSettingsStatus } from "@/lib/settings";

type Props = {
  initialPricing: ServicePricing[];
  initialBookingFeeCents: number;
  initialStripe: StripeSettingsStatus;
};

function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

function inputToCents(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

const sectionClass =
  "rounded-2xl border border-line bg-surface p-6 shadow-sm";
const fieldClass =
  "w-full rounded-lg border border-black/10 bg-white/60 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30";
const buttonClass =
  "rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60";

export function SettingsForm({
  initialPricing,
  initialBookingFeeCents,
  initialStripe,
}: Props) {
  const [pricing, setPricing] = useState(
    initialPricing.map((entry) => ({
      slug: entry.slug,
      name: entry.name,
      deposit: centsToInput(entry.depositCents),
      estimateBase: centsToInput(entry.estimateBaseCents),
    }))
  );
  const [bookingFee, setBookingFee] = useState(
    centsToInput(initialBookingFeeCents)
  );
  const [stripe, setStripe] = useState(initialStripe);
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  async function submit(payload: Record<string, unknown>) {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (response.ok) {
        if (body?.stripe) setStripe(body.stripe);
        setStripeSecretKey("");
        setStripePublishableKey("");
        setStripeWebhookSecret("");
        setMessage({ kind: "success", text: "Saved." });
        return true;
      }
      setMessage({
        kind: "error",
        text: body?.error ?? "Could not save settings.",
      });
      return false;
    } catch {
      setMessage({ kind: "error", text: "Network error — please try again." });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handlePricingSubmit(event: FormEvent) {
    event.preventDefault();
    const services = [];
    for (const entry of pricing) {
      const depositCents = inputToCents(entry.deposit);
      const estimateBaseCents = inputToCents(entry.estimateBase);
      if (depositCents === null || estimateBaseCents === null) {
        setMessage({
          kind: "error",
          text: `Please enter valid amounts for ${entry.name}.`,
        });
        return;
      }
      services.push({ slug: entry.slug, depositCents, estimateBaseCents });
    }
    const bookingFeeCents = inputToCents(bookingFee);
    if (bookingFeeCents === null) {
      setMessage({ kind: "error", text: "Please enter a valid booking fee." });
      return;
    }
    await submit({ services, bookingFeeCents });
  }

  async function handleStripeSubmit(event: FormEvent) {
    event.preventDefault();
    await submit({
      stripeSecretKey,
      stripePublishableKey,
      stripeWebhookSecret,
    });
  }

  async function handleStripeDisconnect() {
    if (
      !window.confirm(
        "Disconnect the dashboard Stripe account? Payments fall back to the STRIPE_SECRET_KEY environment variable if one is set."
      )
    ) {
      return;
    }
    await submit({ stripeDisconnect: true });
  }

  async function handleStripeTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch("/api/admin/stripe/test", {
        method: "POST",
      });
      const body = await response.json().catch(() => null);
      if (response.ok && body?.ok) {
        setTestResult(
          `Connected to ${body.businessName ?? body.accountId} (${
            body.livemode ? "LIVE mode" : "test mode"
          }).`
        );
      } else {
        setTestResult(`Connection failed: ${body?.error ?? "unknown error"}`);
      }
    } catch {
      setTestResult("Connection failed: network error.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-8">
      {message ? (
        <p
          role="alert"
          className={`text-sm font-medium ${
            message.kind === "success" ? "text-brand-dark" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <form onSubmit={handlePricingSubmit} className={sectionClass}>
        <h2 className="text-lg font-semibold text-brand-dark">
          Prices &amp; fees
        </h2>
        <p className="mt-1 text-sm text-foreground/60">
          Deposits are what customers pay online to hold a booking. The
          estimate base is your internal starting point when writing a custom
          quote &mdash; it is never shown publicly.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-xs uppercase text-foreground/50">
              <tr>
                <th className="py-2 pr-4">Service</th>
                <th className="py-2 pr-4">Booking deposit ($)</th>
                <th className="py-2">Estimate base ($, internal)</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map((entry, index) => (
                <tr key={entry.slug} className="border-t border-black/5">
                  <td className="py-2 pr-4 font-medium">{entry.name}</td>
                  <td className="py-2 pr-4">
                    <input
                      aria-label={`${entry.name} deposit`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={entry.deposit}
                      onChange={(event) =>
                        setPricing((current) =>
                          current.map((row, rowIndex) =>
                            rowIndex === index
                              ? { ...row, deposit: event.target.value }
                              : row
                          )
                        )
                      }
                      className={fieldClass}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      aria-label={`${entry.name} estimate base`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={entry.estimateBase}
                      onChange={(event) =>
                        setPricing((current) =>
                          current.map((row, rowIndex) =>
                            rowIndex === index
                              ? { ...row, estimateBase: event.target.value }
                              : row
                          )
                        )
                      }
                      className={fieldClass}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 max-w-xs">
          <label
            htmlFor="bookingFee"
            className="block text-sm font-medium text-foreground/80"
          >
            Flat booking fee ($, added at checkout; 0 = none)
          </label>
          <input
            id="bookingFee"
            type="number"
            min="0"
            step="0.01"
            value={bookingFee}
            onChange={(event) => setBookingFee(event.target.value)}
            className={`mt-1 ${fieldClass}`}
          />
        </div>
        <button type="submit" disabled={saving} className={`mt-5 ${buttonClass}`}>
          {saving ? "Saving..." : "Save prices & fees"}
        </button>
      </form>

      <form onSubmit={handleStripeSubmit} className={sectionClass}>
        <h2 className="text-lg font-semibold text-brand-dark">
          Stripe account
        </h2>
        <p className="mt-1 text-sm text-foreground/60">
          {stripe.configured ? (
            <>
              Connected via{" "}
              {stripe.source === "dashboard"
                ? "this dashboard"
                : "server environment variables"}
              {stripe.secretKeyLast4
                ? ` (secret key ending in ${stripe.secretKeyLast4})`
                : ""}
              . Paste new keys below to switch to a different Stripe account.
            </>
          ) : (
            <>
              No Stripe account connected yet. Paste your API keys from{" "}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand underline"
              >
                dashboard.stripe.com/apikeys
              </a>{" "}
              to accept deposits online.
            </>
          )}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="stripeSecretKey"
              className="block text-sm font-medium text-foreground/80"
            >
              Secret key (sk_...)
            </label>
            <input
              id="stripeSecretKey"
              type="password"
              autoComplete="off"
              placeholder="Leave blank to keep current"
              value={stripeSecretKey}
              onChange={(event) => setStripeSecretKey(event.target.value)}
              className={`mt-1 ${fieldClass}`}
            />
          </div>
          <div>
            <label
              htmlFor="stripePublishableKey"
              className="block text-sm font-medium text-foreground/80"
            >
              Publishable key (pk_...)
            </label>
            <input
              id="stripePublishableKey"
              type="text"
              autoComplete="off"
              placeholder="Leave blank to keep current"
              value={stripePublishableKey}
              onChange={(event) => setStripePublishableKey(event.target.value)}
              className={`mt-1 ${fieldClass}`}
            />
          </div>
          <div>
            <label
              htmlFor="stripeWebhookSecret"
              className="block text-sm font-medium text-foreground/80"
            >
              Webhook signing secret (whsec_...)
            </label>
            <input
              id="stripeWebhookSecret"
              type="password"
              autoComplete="off"
              placeholder="Leave blank to keep current"
              value={stripeWebhookSecret}
              onChange={(event) => setStripeWebhookSecret(event.target.value)}
              className={`mt-1 ${fieldClass}`}
            />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving} className={buttonClass}>
            {saving ? "Saving..." : "Save Stripe keys"}
          </button>
          <button
            type="button"
            onClick={handleStripeTest}
            disabled={testing || !stripe.configured}
            className="rounded-full border border-brand-dark/20 px-5 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {testing ? "Testing..." : "Test connection"}
          </button>
          {stripe.source === "dashboard" ? (
            <button
              type="button"
              onClick={handleStripeDisconnect}
              disabled={saving}
              className="rounded-full border border-red-300 px-5 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              Disconnect
            </button>
          ) : null}
        </div>
        {testResult ? (
          <p className="mt-3 text-sm font-medium text-foreground/80">
            {testResult}
          </p>
        ) : null}
      </form>

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-brand-dark">
          Tracking &amp; ads integrations
        </h2>
        <p className="mt-1 text-sm text-foreground/60">
          Google Tag Manager, GA4, and Google Ads conversion ids are build-time
          environment variables (they are baked into the public pages), so they
          are set in your hosting config rather than here. See{" "}
          <code className="rounded bg-background px-1">.env.example</code> and{" "}
          <code className="rounded bg-background px-1">
            docs/google-ads-campaign-plan.md
          </code>{" "}
          for the full walkthrough.
        </p>
      </div>
    </div>
  );
}
