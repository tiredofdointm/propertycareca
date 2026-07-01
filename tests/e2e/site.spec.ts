import { test, expect } from "@playwright/test";

test.describe("marketing site", () => {
  test("home page renders hero and services", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /property care that shows up/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /get a free quote/i }).first()).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: "Lawn Care & Landscaping" })
    ).toBeVisible();
  });

  test("services listing links to a service detail page", async ({ page }) => {
    await page.goto("/services");
    await page
      .getByRole("main")
      .getByRole("link", { name: "Snow Removal & Ice Management" })
      .click();
    await expect(page).toHaveURL(/\/services\/snow-removal/);
    await expect(page.getByRole("heading", { name: "Snow Removal & Ice Management" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book This Service" })).toBeVisible();
  });

  test("about page renders", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("quote request flow", () => {
  test("shows validation errors for an incomplete submission", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: /request free quote/i }).click();
    await expect(page.getByText(/please enter your full name/i)).toBeVisible();
  });

  test("submits a valid quote request", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Full name").fill("Playwright Test");
    await page.getByLabel("Email").fill(`pw-${Date.now()}@example.com`);
    await page.getByLabel("Phone").fill("555-123-4567");
    await page.getByLabel("Service").selectOption("lawn-care-landscaping");
    await page.getByLabel("Property address").fill("100 Test Ave, Testville, ON");

    await page.getByRole("button", { name: /request free quote/i }).click();

    await expect(page.getByText(/your quote request is in/i)).toBeVisible();
  });
});

test.describe("booking flow", () => {
  test("books a service and reaches the confirmation page", async ({ page }) => {
    await page.goto("/booking");
    await page.getByLabel("Full name").fill("Playwright Booker");
    await page.getByLabel("Email").fill(`pw-booking-${Date.now()}@example.com`);
    await page.getByLabel("Phone").fill("555-987-6543");
    await page.getByLabel("Service").selectOption("gutter-cleaning");
    await page.getByLabel("Property address").fill("200 Test Blvd, Testville, ON");

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    await page.getByLabel("Preferred date").fill(futureDate.toISOString().slice(0, 10));

    await page.getByRole("button", { name: /continue to booking/i }).click();

    await expect(page).toHaveURL(/\/booking\/\d+/);
    await expect(page.getByRole("heading", { name: /booking received/i })).toBeVisible();
    await expect(
      page.getByRole("main").getByText(/Gutter & Eavestrough Cleaning/i)
    ).toBeVisible();
  });
});
