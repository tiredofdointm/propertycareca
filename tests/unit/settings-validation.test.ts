import { describe, expect, it } from "vitest";
import {
  objectiveCreateSchema,
  objectiveUpdateSchema,
  settingsUpdateSchema,
} from "@/lib/validation";

describe("settingsUpdateSchema", () => {
  it("accepts a pricing update", () => {
    const result = settingsUpdateSchema.safeParse({
      bookingFeeCents: 500,
      services: [
        {
          slug: "lawn-care-landscaping",
          depositCents: 3000,
          estimateBaseCents: 5000,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a secret key with the wrong prefix", () => {
    expect(
      settingsUpdateSchema.safeParse({ stripeSecretKey: "pk_test_oops" }).success
    ).toBe(false);
    expect(
      settingsUpdateSchema.safeParse({ stripeSecretKey: "sk_test_ok" }).success
    ).toBe(true);
    expect(settingsUpdateSchema.safeParse({ stripeSecretKey: "" }).success).toBe(
      true
    );
  });

  it("rejects negative amounts and unknown services", () => {
    expect(
      settingsUpdateSchema.safeParse({ bookingFeeCents: -1 }).success
    ).toBe(false);
    expect(
      settingsUpdateSchema.safeParse({
        services: [
          { slug: "not-a-service", depositCents: 100, estimateBaseCents: 100 },
        ],
      }).success
    ).toBe(false);
  });
});

describe("objective schemas", () => {
  it("requires a meaningful title", () => {
    expect(objectiveCreateSchema.safeParse({ title: "ab" }).success).toBe(false);
    expect(
      objectiveCreateSchema.safeParse({ title: "Launch the site" }).success
    ).toBe(true);
  });

  it("bounds percentComplete to 0-100", () => {
    expect(
      objectiveUpdateSchema.safeParse({ percentComplete: 101 }).success
    ).toBe(false);
    expect(
      objectiveUpdateSchema.safeParse({ percentComplete: 55 }).success
    ).toBe(true);
  });
});
