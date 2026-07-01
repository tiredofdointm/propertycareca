import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "PropertyCareCA is a California property maintenance company serving homeowners, real estate professionals, and businesses with lawn care, repairs, and construction-adjacent services.",
};

const values = [
  {
    title: "Show up, on time",
    description:
      "We schedule around your life, confirm every visit, and show up when we say we will — no chasing us down.",
  },
  {
    title: "Fair, upfront pricing",
    description:
      "You get a clear quote before work starts. No surprise charges added after the job is done.",
  },
  {
    title: "One crew, every season",
    description:
      "The same trained crew handles your property through summer lawn care and winter snow removal alike.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-dark sm:text-4xl">
        Built for property owners who don&apos;t have time to chase
        contractors.
      </h1>
      <p className="mt-6 text-lg text-foreground/70">
        PropertyCareCA started with a simple frustration: booking a reliable
        crew for lawn care in the summer and snow removal in the winter meant
        juggling different companies, different quotes, and different
        schedules. We built a single team that handles property maintenance
        year-round, so our customers only need one number saved in their
        phone.
      </p>
      <p className="mt-4 text-lg text-foreground/70">
        Today we serve homeowners, landlords, and small businesses with lawn
        care, snow removal, gutter cleaning, pressure washing, handyman
        repairs, and seasonal cleanups &mdash; all bookable online, with
        upfront pricing and no long-term contracts required.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {values.map((value) => (
          <div key={value.title} className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-dark">{value.title}</h2>
            <p className="mt-2 text-sm text-foreground/70">{value.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-brand-light p-8 text-center">
        <h2 className="text-xl font-semibold text-brand-dark">
          Have a property you&apos;d like us to take care of?
        </h2>
        <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Get a Free Quote
          </Link>
          <Link
            href="/booking"
            className="rounded-full border border-brand-dark/20 px-6 py-3 text-sm font-semibold text-brand-dark transition-colors hover:bg-surface"
          >
            Book a Service
          </Link>
        </div>
      </div>
    </div>
  );
}
