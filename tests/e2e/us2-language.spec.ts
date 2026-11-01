import { expect, test } from "@playwright/test";

test.describe("language", () => {
  test("the root is Ukrainian and /en is English", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "uk");
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("the browser language is not auto-detected", async ({ browser }) => {
    const context = await browser.newContext({
      locale: "en-US",
      extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
    });
    const page = await context.newPage();
    await page.goto("/");
    expect(new URL(page.url()).pathname).toBe("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "uk");
    await context.close();
  });
});

test.describe("language switcher", () => {
  test("opens the equivalent page in English, with hreflang and lang on the link", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const link = page.locator("header").getByRole("link", { name: "English" });
    await expect(link).toHaveAttribute("href", "/en");
    await expect(link).toHaveAttribute("hreflang", "en");
    await expect(link).toHaveAttribute("lang", "en");
    await link.click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("opens the equivalent page in Ukrainian from English", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en");
    const link = page.locator("header").getByRole("link", { name: "Українська" });
    await expect(link).toHaveAttribute("href", "/");
    await expect(link).toHaveAttribute("hreflang", "uk");
    await link.click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  });

  test("the switcher has a named group and a comfortable touch target", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.locator("header").getByRole("navigation", { name: "Мова" })).toBeVisible();
    const box = await page.locator("header").getByRole("link", { name: "English" }).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(43.5);
    expect(box!.width).toBeGreaterThanOrEqual(43.5);
  });

  test("the footer offers both languages, so tiny screens still have a switcher", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "English" })).toBeVisible();
    // The current language is shown but is not a link to itself.
    await expect(footer.getByRole("link", { name: "Українська" })).toHaveCount(0);
    await expect(footer.locator('[aria-current="true"]')).toContainText("UA");
  });
});

test.describe("not found", () => {
  test("an unknown path shows a Ukrainian 404 with a way home and a Book button", async ({
    page,
  }) => {
    const response = await page.goto("/no-such-page");
    expect(response!.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute("lang", "uk");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Сторінку не знайдено");
    await expect(page.getByRole("main").getByRole("link", { name: "На головну" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(
      page.getByRole("main").getByRole("link", { name: "Записатися", exact: true }),
    ).toBeVisible();
  });

  test("an unknown path under /en shows an English 404", async ({ page }) => {
    const response = await page.goto("/en/no-such-page");
    expect(response!.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    await expect(
      page.getByRole("main").getByRole("link", { name: "Back to home" }),
    ).toHaveAttribute("href", "/en");
    await expect(
      page.getByRole("main").getByRole("link", { name: "Book", exact: true }),
    ).toBeVisible();
  });

  test("the 404 is not indexed", async ({ page }) => {
    await page.goto("/no-such-page");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("on a page with no equivalent, the switcher opens the other language's home page", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/no-such-page");
    await expect(page.locator("header").getByRole("link", { name: "English" })).toHaveAttribute(
      "href",
      "/en",
    );
    await page.goto("/en/no-such-page");
    await expect(page.locator("header").getByRole("link", { name: "Українська" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
