import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  date,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "quoted",
  "closed",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "deposit_paid",
  "confirmed",
  "completed",
  "cancelled",
]);

// Marketing-attribution columns captured from the URL a lead/booking was
// submitted from, so campaigns/ad sources can be compared later. Returns a
// fresh set of column builders each call — the same builder instances can't
// be shared across two pgTable() definitions.
function attributionColumns() {
  return {
    utmSource: varchar("utm_source", { length: 200 }),
    utmMedium: varchar("utm_medium", { length: 200 }),
    utmCampaign: varchar("utm_campaign", { length: 200 }),
    utmTerm: varchar("utm_term", { length: 200 }),
    utmContent: varchar("utm_content", { length: 200 }),
    gclid: varchar("gclid", { length: 200 }),
    referrer: text("referrer"),
    landingPage: text("landing_page"),
  };
}

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  address: text("address").notNull(),
  serviceSlug: varchar("service_slug", { length: 100 }).notNull(),
  message: text("message"),
  status: leadStatusEnum("status").notNull().default("new"),
  ...attributionColumns(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  address: text("address").notNull(),
  serviceSlug: varchar("service_slug", { length: 100 }).notNull(),
  preferredDate: date("preferred_date").notNull(),
  notes: text("notes"),
  depositAmountCents: integer("deposit_amount_cents").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  stripeCheckoutSessionId: varchar("stripe_checkout_session_id", {
    length: 255,
  }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  ...attributionColumns(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
