import { expect, test } from "@playwright/test";

// The barbers row on a phone: swipe, or use the buttons. Reads the real dataset until the fixtures exist (T044).
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("cutler-consent", "declined"));
  await page.setViewportSize({ width: 390, height: 800 });
});

test.describe("barbers row on a phone", () => {
  test("shows a counter, and a mouse can step with the buttons", async ({ page }, testInfo) => {
    // Touch devices swipe and do not show the arrows; they are for a mouse or trackpad in a narrow window.
    test.skip(testInfo.project.name === "mobile", "the arrows are hidden on touch devices");
    await page.goto("/barbers");
    const row = page.getByRole("group", { name: "Барбери" }).first();
    await expect(row).toBeVisible();
    const previous = page.getByRole("button", { name: "Попередній барбер" }).first();
    const next = page.getByRole("button", { name: "Наступний барбер" }).first();
    await expect(page.getByText(/^1 \/ \d+$/).first()).toBeVisible();
    await expect(previous).toBeDisabled();

    await next.click();
    await expect(page.getByText(/^2 \/ \d+$/).first()).toBeVisible();
    await expect(previous).toBeEnabled();
    await previous.click();
    await expect(page.getByText(/^1 \/ \d+$/).first()).toBeVisible();
  });

  test("touch devices show the counter but not the arrows", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "needs a touch device");
    await page.goto("/barbers");
    await expect(page.getByText(/^1 \/ \d+$/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Наступний барбер" }).first()).toBeHidden();
  });

  test("the counter has a spoken form", async ({ page }) => {
    await page.goto("/en/barbers");
    await expect(page.getByText(/^Barber 1 of \d+$/).first()).toBeAttached();
  });

  test("the page has one main heading", async ({ page }) => {
    await page.goto("/barbers");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("the page does not scroll sideways at 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/barbers");
    await page.waitForTimeout(500);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
});
