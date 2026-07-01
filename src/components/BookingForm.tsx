"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { services } from "@/lib/services-data";
import { Field, inputClass } from "@/components/form/Field";
import { readAttribution } from "@/lib/attribution";
import { trackEvent, trackGoogleAdsConversion } from "@/lib/analytics";

type FieldErrors = Partial<Record<
  "name" | "email" | "phone" | "address" | "serviceSlug" | "preferredDate" | "notes",
  string
>>;

// Local calendar date (not UTC) so the picker's minimum matches the
// customer's own "today", not whatever date it already is in UTC.
const today = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service") ?? "";

  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      serviceSlug: formData.get("serviceSlug"),
      preferredDate: formData.get("preferredDate"),
      notes: formData.get("notes"),
      ...readAttribution(),
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => null);

      if (response.ok && body?.id) {
        trackEvent("booking_created", {
          service_slug: payload.serviceSlug,
          booking_id: body.id,
        });
        trackGoogleAdsConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_BOOKING);
        router.push(`/booking/${body.id}`);
        return;
      }

      if (body?.fieldErrors) {
        setErrors(body.fieldErrors);
      }
      setFormError(body?.error ?? "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setFormError("Something went wrong. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" error={errors.name}>
          <input id="name" name="name" type="text" autoComplete="name" required className={inputClass(Boolean(errors.name))} />
        </Field>
        <Field label="Email" name="email" error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass(Boolean(errors.email))} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" name="phone" error={errors.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" required className={inputClass(Boolean(errors.phone))} />
        </Field>
        <Field label="Service" name="serviceSlug" error={errors.serviceSlug}>
          <select
            id="serviceSlug"
            name="serviceSlug"
            required
            defaultValue={preselectedService}
            className={inputClass(Boolean(errors.serviceSlug))}
          >
            <option value="" disabled>
              Select a service
            </option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Property address" name="address" error={errors.address}>
          <input id="address" name="address" type="text" autoComplete="street-address" required className={inputClass(Boolean(errors.address))} />
        </Field>
        <Field label="Preferred date" name="preferredDate" error={errors.preferredDate}>
          <input
            id="preferredDate"
            name="preferredDate"
            type="date"
            min={today()}
            required
            className={inputClass(Boolean(errors.preferredDate))}
          />
        </Field>
      </div>
      <Field label="Notes (optional)" name="notes" error={errors.notes}>
        <textarea id="notes" name="notes" rows={4} className={inputClass(Boolean(errors.notes))} />
      </Field>

      {formError ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "Booking..." : "Continue to Booking"}
      </button>
    </form>
  );
}
