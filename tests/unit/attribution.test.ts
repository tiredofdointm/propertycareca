import { beforeEach, describe, expect, it } from "vitest";
import { captureAttributionFromUrl, readAttribution } from "@/lib/attribution";

function navigateTo(url: string) {
  window.history.pushState({}, "", url);
}

describe("attribution capture", () => {
  beforeEach(() => {
    window.localStorage.clear();
    navigateTo("/");
  });

  it("captures utm params and gclid from the URL", () => {
    navigateTo(
      "/services?utm_source=google&utm_medium=cpc&utm_campaign=spring-lawn&gclid=abc123"
    );
    captureAttributionFromUrl();

    const attribution = readAttribution();
    expect(attribution.utmSource).toBe("google");
    expect(attribution.utmMedium).toBe("cpc");
    expect(attribution.utmCampaign).toBe("spring-lawn");
    expect(attribution.gclid).toBe("abc123");
  });

  it("records the landing page and referrer only once", () => {
    navigateTo("/services?utm_source=google");
    captureAttributionFromUrl();
    const first = readAttribution();
    expect(first.landingPage).toBe("/services");

    navigateTo("/contact?utm_source=facebook");
    captureAttributionFromUrl();
    const second = readAttribution();

    // Landing page stays the visitor's true entry point...
    expect(second.landingPage).toBe("/services");
    // ...but a fresh utm_source in the URL still overwrites (last touch).
    expect(second.utmSource).toBe("facebook");
  });

  it("keeps previously captured fields when a later page has no utm params", () => {
    navigateTo("/?utm_source=google&utm_campaign=spring-lawn");
    captureAttributionFromUrl();

    navigateTo("/services");
    captureAttributionFromUrl();

    const attribution = readAttribution();
    expect(attribution.utmSource).toBe("google");
    expect(attribution.utmCampaign).toBe("spring-lawn");
  });

  it("returns an empty object when nothing has been captured", () => {
    expect(readAttribution()).toEqual({});
  });
});
