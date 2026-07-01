import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Plans",
  description:
    "Two simple ways to work with PropertyCareCA: a free custom estimate for any job, or an Enterprise partnership for businesses, realtors, property managers, and construction firms that need us on call.",
};

const estimateIncludes = [
  "Free, no-obligation estimate for any service",
  "Priced for your property — location, scope, and how much needs doing",
  "One-time visits or recurring schedules",
  "Book online and hold your date with a small deposit",
];

const enterpriseIncludes = [
  "For realtors, landlords, property managers, builders & businesses",
  "Custom pricing based on volume, locations, and scope of work",
  "Priority scheduling and a dedicated point of contact",
  "Consolidated invoicing across all your properties",
  "Construction cleanup, make-ready, and turnover support",
];

export default function PlansPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-dark sm:text-4xl">
        Simple plans, custom pricing
      </h1>
      <p className="mt-3 max-w-2xl text-foreground/70">
        No two properties are the same, so we don&apos;t do
        one-size-fits-all price lists. Every engagement is quoted for your
        property, your location, and the work you actually need done.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-line bg-surface p-8 shadow-sm">
          <span className="w-fit rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark">
            Homes &amp; single properties
          </span>
          <h2 className="mt-4 text-2xl font-bold text-brand-dark">
            Estimate Plan
          </h2>
          <p className="mt-1 text-sm font-semibold text-foreground/60">
            Free custom estimate, per job
          </p>
          <p className="mt-4 text-sm text-foreground/70">
            Tell us what your property needs and we&apos;ll quote it — no
            out-of-the-box pricing, no surprises. Perfect for homeowners and
            anyone with a single property or a one-off project.
          </p>
          <ul className="mt-6 flex-1 space-y-3">
            {estimateIncludes.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm text-foreground/80"
              >
                <span
                  aria-hidden
                  className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand"
                />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="mt-8 block rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Request a Free Estimate
          </Link>
        </div>

        <div className="flex flex-col rounded-2xl border-2 border-brand-dark/30 bg-surface p-8 shadow-md">
          <span className="w-fit rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
            Ongoing partnership
          </span>
          <h2 className="mt-4 text-2xl font-bold text-brand-dark">
            Enterprise Plan
          </h2>
          <p className="mt-1 text-sm font-semibold text-foreground/60">
            Custom pricing &mdash; let&apos;s talk
          </p>
          <p className="mt-4 text-sm text-foreground/70">
            Built for businesses that need us constantly: real estate teams,
            property managers, landlords with portfolios, and construction
            firms. Pricing depends on where your properties are, what needs
            doing, and how much needs to be done each time &mdash; so we scope
            it together instead of quoting blind.
          </p>
          <ul className="mt-6 flex-1 space-y-3">
            {enterpriseIncludes.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm text-foreground/80"
              >
                <span
                  aria-hidden
                  className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent"
                />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/contact?plan=enterprise"
            className="mt-8 block rounded-full bg-brand-dark px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand"
          >
            Talk to Us About Enterprise
          </Link>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-foreground/60">
        Not sure which fits?{" "}
        <Link
          href="/contact"
          className="font-semibold text-brand hover:text-brand-dark"
        >
          Send us a note
        </Link>{" "}
        and we&apos;ll point you the right way.
      </p>
    </div>
  );
}
