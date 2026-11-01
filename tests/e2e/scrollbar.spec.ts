import { expect, test } from "@playwright/test";

// The real widget locks page scrolling when it opens (body overflow: hidden), which removes the scrollbar
// and would shift the page sideways by the scrollbar's width. Needs classic (non-overlay) scrollbars, so
// the browser is launched with scrollbars visible (Playwright hides them in headless Chrome by default).
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

test("opening the widget does not shift the page sideways", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "phones use overlay scrollbars");
  await page.route("**/widget.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `window.EasyWeekWidget = class {
        constructor() {}
        show() { document.body.style.overflow = "hidden"; }
        hide() { document.body.style.overflow = ""; }
        destroy() {}
        setBranch() { document.body.style.overflow = "hidden"; }
        setUser() {}
        setProduct() {}
      };`,
    }),
  );
  await page.goto("/");
  const bookInHeader = page.locator("header").getByRole("link").last();
  await expect(bookInHeader).toBeVisible();
  // Let the idle preload finish, so the click opens the widget straight away.
  await page.waitForTimeout(2500);
  const before = (await bookInHeader.boundingBox())!.x;
  const scrollbarBefore = await page.evaluate(
    () => window.innerWidth - document.documentElement.clientWidth,
  );
  expect(scrollbarBefore, "the test needs a visible scrollbar").toBeGreaterThan(0);

  await page.locator("main").getByRole("link").first().click();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  const after = (await bookInHeader.boundingBox())!.x;
  expect(Math.abs(after - before)).toBeLessThan(0.5);
});
