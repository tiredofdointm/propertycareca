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

export const objectiveStatusEnum = pgEnum("objective_status", [
  "not_started",
  "in_progress",
  "completed",
]);

export const leadPlanEnum = pgEnum("lead_plan", ["estimate", "enterprise"]);

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
  plan: leadPlanEnum("plan").notNull().default("estimate"),
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

// Free-form key/value store for owner-editable configuration (pricing
// overrides, fees, Stripe keys, integration ids) so the dashboard can change
// them without a redeploy. Values are strings; secrets are encrypted before
// being written (see src/lib/settings.ts).
export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 200 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Business objectives / roadmap items tracked from the admin dashboard:
// when work started, when it finished, and our own estimate of how done it is.
export const objectives = pgTable("objectives", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  details: text("details"),
  status: objectiveStatusEnum("status").notNull().default("not_started"),
  percentComplete: integer("percent_complete").notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
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
export type SiteSetting = typeof siteSettings.$inferSelect;
export type Objective = typeof objectives.$inferSelect;
export type NewObjective = typeof objectives.$inferInsert;
