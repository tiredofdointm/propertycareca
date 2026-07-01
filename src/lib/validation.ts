import { z } from "zod";
import { services } from "./services-data";

const serviceSlugs = services.map((service) => service.slug) as [
  string,
  ...string[],
];

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
});

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
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
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
