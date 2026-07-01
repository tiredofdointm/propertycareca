"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { services } from "@/lib/services-data";
import { Field, inputClass } from "@/components/form/Field";
import { readAttribution } from "@/lib/attribution";
import { trackEvent, trackGoogleAdsConversion } from "@/lib/analytics";

type FieldErrors = Partial<Record<
  "name" | "email" | "phone" | "address" | "serviceSlug" | "message",
  string
>>;

export function QuoteForm() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service") ?? "";
  const plan = searchParams.get("plan") === "enterprise" ? "enterprise" : "estimate";

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});
    setFormError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      serviceSlug: formData.get("serviceSlug"),
      message: formData.get("message"),
      plan,
      ...readAttribution(),
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
        trackEvent("generate_lead", {
          service_slug: payload.serviceSlug,
        });
        trackGoogleAdsConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_LEAD);
        return;
      }

      const body = await response.json().catch(() => null);
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

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-brand/20 bg-brand-light p-8 text-center">
        <h2 className="text-lg font-semibold text-brand-dark">
          Thanks &mdash; your quote request is in!
        </h2>
        <p className="mt-2 text-sm text-foreground/70">
          A member of our team will follow up within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {plan === "enterprise" ? (
        <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm text-foreground/80">
          <p className="font-semibold text-brand-dark">Enterprise inquiry</p>
          <p className="mt-1">
            Tell us about your portfolio or business below &mdash; pick the
            service you need most and use the message box for the rest.
            We&apos;ll follow up to scope a custom partnership and pricing.
          </p>
        </div>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={inputClass(Boolean(errors.name))}
          />
        </Field>
        <Field label="Email" name="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass(Boolean(errors.email))}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" name="phone" error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            className={inputClass(Boolean(errors.phone))}
          />
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
      <Field label="Property address" name="address" error={errors.address}>
        <input
          id="address"
          name="address"
          type="text"
          autoComplete="street-address"
          required
          className={inputClass(Boolean(errors.address))}
        />
      </Field>
      <Field label="Anything else we should know? (optional)" name="message" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={inputClass(Boolean(errors.message))}
        />
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
        {status === "submitting" ? "Sending..." : "Request Free Quote"}
      </button>
    </form>
  );
}
