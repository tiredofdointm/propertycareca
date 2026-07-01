import { config } from "dotenv";

config({ path: ".env.local" });
config();

async function main() {
  const { db } = await import("../src/lib/db");
  const { leads, bookings } = await import("../src/lib/db/schema");

  await db.insert(leads).values([
    {
      name: "Jordan Smith",
      email: "jordan.smith@example.com",
      phone: "416-555-0134",
      address: "42 Maple Street, Toronto, ON",
      serviceSlug: "lawn-care-landscaping",
      message: "Looking for bi-weekly mowing starting in May.",
    },
    {
      name: "Priya Nair",
      email: "priya.nair@example.com",
      phone: "613-555-0192",
      address: "8 Birch Court, Ottawa, ON",
      serviceSlug: "snow-removal",
      message: "Need a seasonal snow removal contract for a duplex.",
    },
  ]);

  await db.insert(bookings).values([
    {
      name: "Alex Chen",
      email: "alex.chen@example.com",
      phone: "604-555-0177",
      address: "15 Cedar Ave, Vancouver, BC",
      serviceSlug: "gutter-cleaning",
      preferredDate: "2026-09-15",
      depositAmountCents: 2000,
    },
  ]);

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
