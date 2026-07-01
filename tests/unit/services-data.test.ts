import { describe, expect, it } from "vitest";
import { services, getServiceBySlug, formatCents } from "@/lib/services-data";

describe("services-data", () => {
  it("has unique slugs", () => {
    const slugs = services.map((service) => service.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("finds a service by slug", () => {
    expect(getServiceBySlug("lawn-care-landscaping")?.name).toBe(
      "Lawn Care & Landscaping"
    );
  });

  it("returns undefined for an unknown slug", () => {
    expect(getServiceBySlug("does-not-exist")).toBeUndefined();
  });

  it("formats cents as USD currency", () => {
    expect(formatCents(4500)).toBe("$45.00");
  });
});
