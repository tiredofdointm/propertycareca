import { describe, expect, it } from "vitest";
import {
  leadFormSchema,
  bookingFormSchema,
  adminLoginSchema,
} from "@/lib/validation";

describe("leadFormSchema", () => {
  const valid = {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "416-555-0100",
    address: "123 Main St, Toronto, ON",
    serviceSlug: "lawn-care-landscaping",
    message: "Please call ahead",
  };

  it("accepts a valid lead", () => {
    const result = leadFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = leadFormSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown service slug", () => {
    const result = leadFormSchema.safeParse({ ...valid, serviceSlug: "does-not-exist" });
    expect(result.success).toBe(false);
  });

  it("allows an empty optional message", () => {
    const result = leadFormSchema.safeParse({ ...valid, message: "" });
    expect(result.success).toBe(true);
  });
});

describe("bookingFormSchema", () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const valid = {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "416-555-0100",
    address: "123 Main St, Toronto, ON",
    serviceSlug: "snow-removal",
    preferredDate: futureDate.toISOString().slice(0, 10),
  };

  it("accepts a valid booking", () => {
    const result = bookingFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects a date in the past", () => {
    const result = bookingFormSchema.safeParse({
      ...valid,
      preferredDate: "2000-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed date", () => {
    const result = bookingFormSchema.safeParse({
      ...valid,
      preferredDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});

describe("adminLoginSchema", () => {
  it("requires an email and non-empty password", () => {
    expect(
      adminLoginSchema.safeParse({ email: "a@b.com", password: "x" }).success
    ).toBe(true);
    expect(
      adminLoginSchema.safeParse({ email: "not-an-email", password: "x" }).success
    ).toBe(false);
    expect(
      adminLoginSchema.safeParse({ email: "a@b.com", password: "" }).success
    ).toBe(false);
  });
});
