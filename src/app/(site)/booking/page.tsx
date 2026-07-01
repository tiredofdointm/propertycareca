import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/BookingForm";

export const metadata: Metadata = {
  title: "Book a Service",
  description:
    "Book lawn care, gutter cleaning, pressure washing, or any PropertyCareCA service online in minutes.",
};

export default function BookingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-dark sm:text-4xl">
        Book a Service
      </h1>
      <p className="mt-3 text-foreground/70">
        Choose your service and preferred date. We&apos;ll confirm your
        booking and, where applicable, collect a small deposit to hold your
        spot.
      </p>
      <div className="mt-8">
        <Suspense fallback={null}>
          <BookingForm />
        </Suspense>
      </div>
    </div>
  );
}
