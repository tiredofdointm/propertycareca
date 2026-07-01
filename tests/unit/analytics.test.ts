import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackEvent, trackGoogleAdsConversion } from "@/lib/analytics";

describe("trackEvent", () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  afterEach(() => {
    delete window.dataLayer;
    delete window.gtag;
  });

  it("no-ops when dataLayer hasn't been initialized (analytics not configured)", () => {
    delete window.dataLayer;
    expect(() => trackEvent("generate_lead")).not.toThrow();
  });

  it("pushes a plain event object for GTM's custom-event trigger matching", () => {
    trackEvent("generate_lead", { service_slug: "lawn-care-landscaping" });
    expect(window.dataLayer).toContainEqual({
      event: "generate_lead",
      service_slug: "lawn-care-landscaping",
    });
  });

  it("also calls window.gtag when present, for the direct gtag.js fallback path", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    trackEvent("booking_created", { booking_id: 42 });
    expect(gtag).toHaveBeenCalledWith("event", "booking_created", { booking_id: 42 });
  });

  it("does not throw when window.gtag is undefined (GTM-only path)", () => {
    expect(window.gtag).toBeUndefined();
    expect(() => trackEvent("deposit_paid", { value: 25 })).not.toThrow();
  });
});

describe("trackGoogleAdsConversion", () => {
  const originalEnv = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;

  beforeEach(() => {
    window.dataLayer = [];
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID = originalEnv;
    delete window.dataLayer;
  });

  it("no-ops when the conversion id is unset", () => {
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID = "";
    trackGoogleAdsConversion("some-label");
    expect(window.dataLayer).toEqual([]);
  });

  it("no-ops when no label is passed", () => {
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID = "AW-123456789";
    trackGoogleAdsConversion(undefined);
    expect(window.dataLayer).toEqual([]);
  });

  it("pushes a conversion event with the combined send_to target", () => {
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID = "AW-123456789";
    trackGoogleAdsConversion("abc123", { value: 25, currency: "CAD" });
    expect(window.dataLayer).toContainEqual({
      event: "conversion",
      send_to: "AW-123456789/abc123",
      value: 25,
      currency: "CAD",
    });
  });
});
