import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";
import { db } from "../../src/lib/db";
import { leads } from "../../src/lib/db/schema";

test.describe("ad/campaign attribution", () => {
  test("captures utm params + gclid from the landing page and persists them through a quote submission", async ({
    page,
  }) => {
    await page.goto(
      "/?utm_source=facebook&utm_medium=paid-social&utm_campaign=e2e-attribution-test&gclid=e2e-gclid-123"
    );
    await page.goto("/contact");

    const email = `attribution-${Date.now()}@example.com`;
    await page.getByLabel("Full name").fill("Attribution Test");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Phone").fill("555-222-3333");
    await page.getByLabel("Service").selectOption("pressure-washing");
    await page.getByLabel("Property address").fill("1 Attribution Way");

    const leadResponse = page.waitForResponse(
      (response) => response.url().includes("/api/leads") && response.request().method() === "POST"
    );
    await page.getByRole("button", { name: /request free quote/i }).click();
    const response = await leadResponse;
    expect(response.ok()).toBe(true);
    await expect(page.getByText(/your quote request is in/i)).toBeVisible();

    const [lead] = await db.select().from(leads).where(eq(leads.email, email)).limit(1);
    expect(lead?.utmSource).toBe("facebook");
    expect(lead?.utmMedium).toBe("paid-social");
    expect(lead?.utmCampaign).toBe("e2e-attribution-test");
    expect(lead?.gclid).toBe("e2e-gclid-123");
    expect(lead?.landingPage).toBe("/");
  });
});
