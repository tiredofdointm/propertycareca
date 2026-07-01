import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@propertycareca.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "DevPassword123!";

test.describe("admin auth", () => {
  test("unauthenticated visitors are redirected to login", async ({ page }) => {
    await page.goto("/admin/leads");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("rejects an invalid password", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test("logs in and can update a lead's status", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/admin\/leads/);
    await expect(page.getByRole("heading", { name: /leads/i })).toBeVisible();

    await page.getByRole("link", { name: "Bookings" }).click();
    await expect(page).toHaveURL(/\/admin\/bookings/);
    await expect(page.getByRole("heading", { name: /bookings/i })).toBeVisible();

    await page.getByRole("button", { name: /log out/i }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("visiting the login page while already signed in redirects to the dashboard", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/admin\/leads/);

    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin\/leads/);

    await page.getByRole("button", { name: /log out/i }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("admin objectives & settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/admin\/leads/);
  });

  test("objectives board lists seeded roadmap and tracks a new objective", async ({ page }) => {
    await page.goto("/admin/objectives");
    await expect(
      page.getByText("Estimate & Enterprise plans (no public prices)")
    ).toBeVisible();

    const title = `E2E objective ${Date.now()}`;
    await page.getByLabel("Objective title").fill(title);
    await page.getByRole("button", { name: /add objective/i }).click();
    await expect(page.getByText(title)).toBeVisible();

    // Mark it in progress and confirm the status pill updates.
    await page.getByLabel(`${title} status`).selectOption("in_progress");
    await expect(
      page
        .locator("div")
        .filter({ hasText: title })
        .getByText("In progress")
        .first()
    ).toBeVisible();
  });

  test("settings page shows pricing table and stripe connection state", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page.getByRole("heading", { name: /prices & fees/i })).toBeVisible();
    await expect(page.getByLabel("Lawn Care & Landscaping deposit")).toBeVisible();
    await expect(page.getByRole("heading", { name: /stripe account/i })).toBeVisible();
    await expect(page.getByText(/no stripe account connected yet/i)).toBeVisible();

    // Change a deposit and save.
    await page.getByLabel("Lawn Care & Landscaping deposit").fill("31.50");
    await page.getByRole("button", { name: /save prices & fees/i }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("Lawn Care & Landscaping deposit")).toHaveValue("31.50");
  });
});
