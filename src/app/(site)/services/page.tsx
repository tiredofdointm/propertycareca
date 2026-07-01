import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Lawn care, gutter cleaning, pressure washing, handyman repairs, and seasonal cleanups for homes, rentals, and commercial properties across California.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-dark sm:text-4xl">
        Our Services
      </h1>
      <p className="mt-3 max-w-2xl text-foreground/70">
        Every service is available as a one-time visit or a recurring plan.
        Pick what your property needs, or request a quote and we&apos;ll
        recommend a plan.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="group flex flex-col rounded-2xl border border-line bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="w-fit rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark">
              {service.season}
            </span>
            <h2 className="mt-4 text-lg font-semibold text-brand-dark group-hover:text-brand">
              {service.name}
            </h2>
            <p className="mt-2 flex-1 text-sm text-foreground/70">
              {service.shortDescription}
            </p>
            <p className="mt-4 text-sm font-semibold text-brand-dark">
              Free custom estimate
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
