import { services } from "@/lib/services-data";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://propertycareca.com";

/**
 * JSON-LD structured data so search engines understand what the business is
 * and which services it offers — this is what helps propertycareca.com show
 * up for property-maintenance, real-estate, and construction-related
 * searches in California.
 */
export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: "PropertyCareCA",
    url: siteUrl,
    description:
      "Property maintenance, repairs, and real-estate support services for homes, rentals, and commercial properties across California.",
    areaServed: {
      "@type": "State",
      name: "California",
    },
    priceRange: "Free custom estimates",
    telephone: "+1-800-555-0142",
    knowsAbout: [
      "property maintenance",
      "real estate services",
      "construction cleanup",
      "property management support",
      "lawn care",
      "gutter cleaning",
      "pressure washing",
      "handyman repairs",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Property care services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.shortDescription,
          url: `${siteUrl}/services/${service.slug}`,
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ServiceJsonLd({ slug }: { slug: string }) {
  const service = services.find((entry) => entry.slug === slug);
  if (!service) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: `${siteUrl}/services/${service.slug}`,
    areaServed: { "@type": "State", name: "California" },
    provider: {
      "@type": "HomeAndConstructionBusiness",
      name: "PropertyCareCA",
      url: siteUrl,
    },
    offers: {
      "@type": "Offer",
      description:
        "Free custom estimate — priced per job based on location, scope, and frequency.",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
