import { expect, test, type Page } from "@playwright/test";

// Needs NEXT_PUBLIC_GA_MEASUREMENT_ID set when the site was started or built (any value, for example G-TEST123456).
// Requests to Google are answered here, so the tests never send data to a real property.
const GOOGLE = /googletagmanager\.com|google-analytics\.com/;
const ALLOWED_PARAMS = new Set([
  "language",
  "page_type",
  "contact_method",
  "cta_location",
  "barber_slug",
]);

const WIDGET_STUB = `
  window.EasyWeekWidget = class {
    constructor() {}
    show() {}
    hide() {}
    destroy() {}
    setBranch() {}
    setUser() {}
    setProduct() {}
  };
`;

async function setUp(page: Page) {
  // The Next.js dev tools button floats over the bottom-left in `next dev` only; keep it out of the clicks.
  await page.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = "nextjs-portal { display: none !important; }";
    document.addEventListener("DOMContentLoaded", () => document.head.append(style));
  });
  const googleRequests: string[] = [];
  page.on("request", (request) => {
    if (GOOGLE.test(request.url())) googleRequests.push(request.url());
  });
  await page.route(GOOGLE, (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.route("**/widget.js", (route) =>
    route.fulfill({ contentType: "application/javascript", body: WIDGET_STUB }),
  );
  return googleRequests;
}

/** The events the page pushed to Google's data layer, as [name, params]. */
async function recordedEvents(page: Page) {
  return page.evaluate(() => {
    const layer = (window as never as { dataLayer?: unknown[] }).dataLayer ?? [];
    return layer.flatMap((entry) => {
      const items = Array.from(entry as ArrayLike<unknown>);
      return items[0] === "event"
        ? [[items[1], items[2] ?? {}] as [string, Record<string, string>]]
        : [];
    });
  });
}

const accept = (page: Page) => page.getByRole("button", { name: "Прийняти" });
const decline = (page: Page) => page.getByRole("button", { name: "Відхилити" });
// The home page's own main Book button: the header has none on a phone, so this works on every screen size.
const headerBook = (page: Page) =>
  page.locator("main").getByRole("link", { name: "Записатися", exact: true }).first();

test.describe("analytics and consent", () => {
  test("loads nothing from Google before the visitor chooses, and shows both choices", async ({
    page,
  }) => {
    const requests = await setUp(page);
    for (const path of ["/", "/barbers", "/en"]) {
      await page.goto(path);
      await expect(
        page.getByRole("region", { name: /Згода на cookie|Cookie consent/ }),
      ).toBeVisible();
      await page.waitForTimeout(1500);
    }
    expect(requests).toEqual([]);
    await page.goto("/");
    await expect(accept(page)).toBeVisible();
    await expect(decline(page)).toBeVisible();
  });

  test("Decline loads nothing, now or on the next visit, and the banner stays away", async ({
    page,
  }) => {
    const requests = await setUp(page);
    await page.goto("/");
    await decline(page).click();
    await expect(decline(page)).toBeHidden();
    await headerBook(page).click();
    await page.reload();
    await page.waitForTimeout(1500);
    expect(requests).toEqual([]);
    await expect(accept(page)).toBeHidden();
  });

  test("Accept loads Google Analytics and a Book click sends one clean event", async ({ page }) => {
    const requests = await setUp(page);
    await page.goto("/");
    await accept(page).click();
    await expect.poll(() => requests.some((url) => url.includes("gtag/js"))).toBe(true);

    await headerBook(page).click();
    await expect
      .poll(
        async () =>
          (await recordedEvents(page)).filter(([name]) => name === "booking_cta_click").length,
      )
      .toBe(1);

    const [, params] = (await recordedEvents(page)).find(([name]) => name === "booking_cta_click")!;
    expect(params).toMatchObject({ language: "uk", page_type: "home", cta_location: "hero" });
    for (const key of Object.keys(params)) expect(ALLOWED_PARAMS.has(key)).toBe(true);
  });

  test("a barber's Book button carries the barber's public name and nothing personal", async ({
    page,
  }) => {
    await setUp(page);
    await page.goto("/barbers");
    await accept(page).click();
    await page
      .locator("article")
      .getByRole("link", { name: "Записатися", exact: true })
      .first()
      .click();
    await expect
      .poll(async () => (await recordedEvents(page)).some(([name]) => name === "booking_cta_click"))
      .toBe(true);
    const [, params] = (await recordedEvents(page)).find(([name]) => name === "booking_cta_click")!;
    expect(params.cta_location).toBe("barbers_card");
    expect(params.barber_slug).toMatch(/^[a-z][a-z0-9-]+$/);
    for (const key of Object.keys(params)) expect(ALLOWED_PARAMS.has(key)).toBe(true);
  });

  test("declining after accepting stops events, and Cookie settings reopens the banner", async ({
    page,
  }) => {
    await setUp(page);
    await page.goto("/");
    await accept(page).click();
    await headerBook(page).click();
    await expect
      .poll(
        async () => (await recordedEvents(page)).filter(([n]) => n === "booking_cta_click").length,
      )
      .toBe(1);

    await page.getByRole("button", { name: "Налаштування cookie" }).click();
    await decline(page).click();
    await expect(decline(page)).toBeHidden();
    await headerBook(page).click();
    await page.waitForTimeout(1500);
    const clicks = (await recordedEvents(page)).filter(([n]) => n === "booking_cta_click");
    expect(clicks).toHaveLength(1);
  });

  test("never sends booking_completed while it is unverified", async ({ page }) => {
    await setUp(page);
    await page.goto("/");
    await accept(page).click();
    await page.evaluate(() => {
      window.postMessage(
        { type: "track", hitType: "pageview", path: "/cutler/1/2/thank-you" },
        "*",
      );
    });
    await page.waitForTimeout(800);
    const names = (await recordedEvents(page)).map(([name]) => name);
    expect(names).not.toContain("booking_completed");
  });
});
