import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceBySlug, services, formatCents } from "@/lib/services-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.shortDescription,
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <Link href="/services" className="text-sm font-semibold text-brand hover:text-brand-dark">
        &larr; All services
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <h1 className="text-3xl font-bold text-brand-dark sm:text-4xl">
          {service.name}
        </h1>
        <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark">
          {service.season}
        </span>
      </div>
      <p className="mt-4 text-lg text-foreground/70">{service.description}</p>

      <div className="mt-8 grid gap-8 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <h2 className="text-lg font-semibold text-brand-dark">
            What&apos;s included
          </h2>
          <ul className="mt-4 space-y-3">
            {service.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3 text-sm text-foreground/80">
                <span aria-hidden className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
        <aside className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-sm text-foreground/60">Starting at</p>
          <p className="text-2xl font-bold text-brand-dark">
            {formatCents(service.startingPriceCents)}
          </p>
          <p className="mt-1 text-xs text-foreground/50">
            Final price depends on property size and scope.
          </p>
          <Link
            href={`/booking?service=${service.slug}`}
            className="mt-6 block rounded-full bg-brand px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Book This Service
          </Link>
          <Link
            href={`/contact?service=${service.slug}`}
            className="mt-3 block rounded-full border border-brand-dark/20 px-4 py-2 text-center text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-light"
          >
            Request a Quote
          </Link>
        </aside>
      </div>
    </div>
  );
}
