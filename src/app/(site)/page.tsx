import Link from "next/link";
import { services, formatCents } from "@/lib/services-data";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-brand-light to-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Serving homes &amp; businesses across Canada
          </p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-brand-dark sm:text-5xl">
            Property care that shows up, every season.
          </h1>
          <p className="max-w-xl text-lg text-foreground/70">
            Lawn care, snow removal, gutter cleaning, pressure washing, and
            handyman repairs &mdash; one dependable crew for everything your
            property needs, year-round.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Get a Free Quote
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-brand-dark/20 px-6 py-3 text-center text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-light"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-brand-dark">Our Services</h2>
          <Link
            href="/services"
            className="text-sm font-semibold text-brand hover:text-brand-dark"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group flex flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="w-fit rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark">
                {service.season}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-brand-dark group-hover:text-brand">
                {service.name}
              </h3>
              <p className="mt-2 flex-1 text-sm text-foreground/70">
                {service.shortDescription}
              </p>
              <p className="mt-4 text-sm font-semibold text-brand-dark">
                From {formatCents(service.startingPriceCents)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-brand-dark">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to cross it off your list?
          </h2>
          <p className="max-w-xl text-white/80">
            Tell us about your property and we&apos;ll follow up with a quote
            within one business day &mdash; or book a service online right
            now.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-light"
            >
              Request a Quote
            </Link>
            <Link
              href="/booking"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Book a Service
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
