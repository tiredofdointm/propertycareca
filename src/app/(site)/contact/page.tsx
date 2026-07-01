import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteForm } from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Get a Free Quote",
  description:
    "Tell us about your property and we'll follow up with a free quote within one business day.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-dark sm:text-4xl">
        Get a Free Quote
      </h1>
      <p className="mt-3 text-foreground/70">
        Tell us a bit about your property and the service you need. We
        typically respond within one business day.
      </p>
      <div className="mt-8">
        <Suspense fallback={null}>
          <QuoteForm />
        </Suspense>
      </div>
    </div>
  );
}
