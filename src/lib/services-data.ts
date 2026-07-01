export type Service = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  startingPriceCents: number;
  depositCents: number;
  season: "Spring" | "Summer" | "Fall" | "Winter" | "Year-round";
};

export const services: Service[] = [
  {
    slug: "lawn-care-landscaping",
    name: "Lawn Care & Landscaping",
    shortDescription:
      "Mowing, edging, fertilizing, and garden bed maintenance to keep your property looking sharp all season.",
    description:
      "Our lawn care crews keep residential and commercial properties across the region looking their best from the first spring thaw through late fall. Every visit includes mowing at the ideal height for your grass type, crisp edging along walkways and beds, and clean-up of clippings so nothing is left behind. We also offer fertilization programs, weed control, and garden bed maintenance so your landscaping stays healthy between visits.",
    highlights: [
      "Weekly or bi-weekly mowing and edging",
      "Seasonal fertilization and weed control programs",
      "Garden bed weeding, mulching, and pruning",
      "One-time or recurring service plans",
    ],
    startingPriceCents: 4500,
    depositCents: 2500,
    season: "Summer",
  },
  {
    slug: "snow-removal",
    name: "Snow Removal & Ice Management",
    shortDescription:
      "Reliable driveway and walkway clearing so you never have to shovel before sunrise again.",
    description:
      "Canadian winters don't wait, and neither do we. Our snow removal service covers driveways, walkways, and entrances with priority dispatch as soon as accumulation hits your property's trigger depth. We apply ice melt and sand to keep high-traffic areas safe, and offer seasonal contracts so you have guaranteed coverage all winter, plus on-demand single-visit clearing for one-off storms.",
    highlights: [
      "Seasonal contracts with guaranteed priority dispatch",
      "Driveway, walkway, and entrance clearing",
      "Ice melt and sand application",
      "24/7 monitoring during active storms",
    ],
    startingPriceCents: 5500,
    depositCents: 3000,
    season: "Winter",
  },
  {
    slug: "gutter-cleaning",
    name: "Gutter & Eavestrough Cleaning",
    shortDescription:
      "Debris removal and a full downspout flush to protect your roof and foundation from water damage.",
    description:
      "Clogged gutters are one of the leading causes of roof leaks, fascia rot, and foundation damage. We clear leaves and debris by hand, flush downspouts to confirm free-flowing drainage, and do a visual check for loose brackets or visible damage so small problems get caught before they become expensive repairs.",
    highlights: [
      "Full debris removal by hand, not just a blow-out",
      "Downspout flush and flow test",
      "Visual inspection report with photos",
      "Recommended twice a year: spring and fall",
    ],
    startingPriceCents: 3500,
    depositCents: 2000,
    season: "Fall",
  },
  {
    slug: "pressure-washing",
    name: "Pressure Washing",
    shortDescription:
      "Driveways, decks, siding, and patios refreshed with professional-grade equipment.",
    description:
      "Years of grime, algae, and salt residue build up on exterior surfaces. Our pressure washing service restores driveways, walkways, decks, fences, and siding using equipment and pressure levels matched to each surface, so wood and softer materials are cleaned safely without damage.",
    highlights: [
      "Concrete driveways and walkways",
      "Wood and composite decks",
      "Vinyl and brick siding",
      "Surface-appropriate pressure and cleaning solution",
    ],
    startingPriceCents: 3000,
    depositCents: 1500,
    season: "Spring",
  },
  {
    slug: "handyman-repairs",
    name: "Handyman Repairs",
    shortDescription:
      "Small and medium repair jobs around the property, handled by one reliable crew.",
    description:
      "From a leaky faucet to fence board replacement, deck repairs, or hanging shelving, our handyman service is built for the jobs that pile up on a to-do list. Tell us what needs fixing and we'll quote a flat rate before we start, so there are no surprises.",
    highlights: [
      "Interior and exterior minor repairs",
      "Fence, deck, and railing fixes",
      "Fixture installation and mounting",
      "Upfront flat-rate quotes",
    ],
    startingPriceCents: 8000,
    depositCents: 4000,
    season: "Year-round",
  },
  {
    slug: "seasonal-yard-cleanup",
    name: "Seasonal Yard Cleanup",
    shortDescription:
      "Spring wake-up or fall leaf removal to get your property ready for the season ahead.",
    description:
      "Twice a year your property needs a deeper reset than a regular mow: spring cleanup clears winter debris, dead growth, and prepares beds for the season, while fall cleanup handles leaf removal and yard prep before the snow flies. Both include full yard-waste haul-away.",
    highlights: [
      "Full leaf and debris removal with haul-away",
      "Bed clearing and dead growth removal",
      "Lawn aeration add-on available",
      "Spring and fall packages",
    ],
    startingPriceCents: 6000,
    depositCents: 3000,
    season: "Fall",
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-CA");
}
