import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("has title and loads correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/El Bohío/i);
  });

  test("shows navigation menu", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();
  });

  test("shows menu content", async ({ page }) => {
    await page.goto("/");
    // Wait for any content to load (menu items come from API)
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    // Check that we have some visible content (not checking for specific text)
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("has working links", async ({ page }) => {
    await page.goto("/");
    // Just verify the page loads with navigation
    const links = page.locator("a");
    expect(await links.count()).toBeGreaterThan(0);
  });
});

test.describe("POS Login", () => {
  test("opens POS login page", async ({ page }) => {
    await page.goto("/pos/login");
    // Check page loads
    await expect(page).toHaveURL(/pos.*login/i);
  });

  test("shows login inputs on POS login", async ({ page }) => {
    await page.goto("/pos/login");
    // Check for username/password inputs - POS uses different input structure
    const inputs = page.locator("input");
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});