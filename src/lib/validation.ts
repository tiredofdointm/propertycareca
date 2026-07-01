import { z } from "zod";
import { services } from "./services-data";

const serviceSlugs = services.map((service) => service.slug) as [
  string,
  ...string[],
];

// Marketing-attribution fields, sent silently alongside every lead/booking
// submission (see src/lib/attribution.ts) — never shown to or required from
// the customer, so every field is optional and capped to the DB column size.
const attributionSchema = z.object({
  utmSource: z.string().trim().max(200).optional(),
  utmMedium: z.string().trim().max(200).optional(),
  utmCampaign: z.string().trim().max(200).optional(),
  utmTerm: z.string().trim().max(200).optional(),
  utmContent: z.string().trim().max(200).optional(),
  gclid: z.string().trim().max(200).optional(),
  referrer: z.string().trim().max(500).optional(),
  landingPage: z.string().trim().max(500).optional(),
});

export const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(200),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(30),
  address: z.string().trim().min(5, "Please enter your property address").max(500),
  serviceSlug: z.enum(serviceSlugs, {
    message: "Please select a service",
  }),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  // Which plan the inquiry is for: a one-off estimate (default) or an
  // Enterprise partnership inquiry from /plans.
  plan: z.enum(["estimate", "enterprise"]).optional(),
}).extend(attributionSchema.shape);

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const bookingFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(200),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(30),
  address: z.string().trim().min(5, "Please enter your property address").max(500),
  serviceSlug: z.enum(serviceSlugs, {
    message: "Please select a service",
  }),
  preferredDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date")
    .refine((value) => {
      const chosen = new Date(`${value}T00:00:00Z`);
      // The server clock is UTC while customers book from their own local
      // "today"; allow a day of slack in the past so a customer west of UTC
      // (whose local calendar date can trail the server's by up to a day)
      // isn't rejected for choosing their own today.
      const earliestAllowed = new Date();
      earliestAllowed.setUTCHours(0, 0, 0, 0);
      earliestAllowed.setUTCDate(earliestAllowed.getUTCDate() - 1);
      return chosen.getTime() >= earliestAllowed.getTime();
    }, "Please choose a date in the future"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
}).extend(attributionSchema.shape);

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

// Owner-editable settings (Admin → Settings). Stripe keys are optional — an
// empty string means "leave unchanged"; stripeDisconnect wipes the connected
// account so the env-var fallback (or nothing) applies again.
export const settingsUpdateSchema = z.object({
  bookingFeeCents: z.number().int().min(0).max(100_000).optional(),
  services: z
    .array(
      z.object({
        slug: z.enum(serviceSlugs),
        depositCents: z.number().int().min(0).max(1_000_000),
        estimateBaseCents: z.number().int().min(0).max(10_000_000),
      })
    )
    .optional(),
  stripePublishableKey: z
    .string()
    .trim()
    .max(300)
    .refine((value) => value === "" || value.startsWith("pk_"), {
      message: "Publishable keys start with pk_",
    })
    .optional(),
  stripeSecretKey: z
    .string()
    .trim()
    .max(300)
    .refine(
      (value) => value === "" || value.startsWith("sk_") || value.startsWith("rk_"),
      { message: "Secret keys start with sk_ (or rk_ for restricted keys)" }
    )
    .optional(),
  stripeWebhookSecret: z
    .string()
    .trim()
    .max(300)
    .refine((value) => value === "" || value.startsWith("whsec_"), {
      message: "Webhook secrets start with whsec_",
    })
    .optional(),
  stripeDisconnect: z.boolean().optional(),
});

export type SettingsUpdateValues = z.infer<typeof settingsUpdateSchema>;

export const objectiveCreateSchema = z.object({
  title: z.string().trim().min(3, "Please give the objective a title").max(300),
  details: z.string().trim().max(5000).optional().or(z.literal("")),
});

export const objectiveUpdateSchema = z.object({
  title: z.string().trim().min(3).max(300).optional(),
  details: z.string().trim().max(5000).optional().or(z.literal("")),
  status: z.enum(["not_started", "in_progress", "completed"]).optional(),
  percentComplete: z.number().int().min(0).max(100).optional(),
});

export const leadStatusSchema = z.object({
  status: z.enum(["new", "contacted", "quoted", "closed"]),
});

export const bookingStatusSchema = z.object({
  status: z.enum([
    "pending",
    "deposit_paid",
    "confirmed",
    "completed",
    "cancelled",
  ]),
});
