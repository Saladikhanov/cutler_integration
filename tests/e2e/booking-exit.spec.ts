import { expect, test, type Page } from "@playwright/test";

// A stub of the real widget's relevant behaviour: show() locks page scrolling, hide() unlocks it, and its
// own close button (not available to us) is simulated by calling hide() from the page.
const STUB = `
  window.__hidden = 0;
  window.EasyWeekWidget = class {
    constructor() {}
    show() { document.body.style.overflow = "hidden"; }
    hide() { document.body.style.overflow = ""; window.__hidden++; }
    destroy() {}
    setBranch() { document.body.style.overflow = "hidden"; }
    setUser() {}
    setProduct() {}
  };
`;

async function openBooking(page: Page) {
  await page.route("**/widget.js", (route) =>
    route.fulfill({ contentType: "application/javascript", body: STUB }),
  );
  await page.goto("/");
  await page.waitForTimeout(2500); // let the idle preload finish
  await page.locator("main").getByRole("link").first().click();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");
}

// The real widget on phones: a container that is hidden with a class; the page is not scroll-locked.
const PHONE_STUB = `
  window.EasyWeekWidget = class {
    constructor() {}
    box() {
      let el = document.querySelector(".EWBookingWidget");
      if (!el) { el = document.createElement("div"); el.className = "EWBookingWidget EWBookingWidget_hidden"; document.body.appendChild(el); }
      return el;
    }
    show() { this.box().classList.remove("EWBookingWidget_hidden"); }
    hide() { this.box().classList.add("EWBookingWidget_hidden"); }
    destroy() {}
    setBranch() { this.show(); }
    setUser() {}
    setProduct() {}
  };
`;

const locked = (page: Page) => page.evaluate(() => document.body.style.overflow === "hidden");

test("Escape closes the booking window and stays on the page", async ({ page }) => {
  await openBooking(page);
  await page.keyboard.press("Escape");
  await expect.poll(() => locked(page)).toBe(false);
  expect(new URL(page.url()).pathname).toBe("/");
});

test("the browser Back button closes the booking window instead of leaving the site", async ({
  page,
}) => {
  await openBooking(page);
  await page.goBack();
  await expect.poll(() => locked(page)).toBe(false);
  expect(new URL(page.url()).pathname).toBe("/");
  expect(page.url()).toContain("localhost");
});

test("closing with the widget's own button does not leave a dead Back step", async ({ page }) => {
  await openBooking(page);
  const before = await page.evaluate(() => history.length);
  await page.evaluate(() => {
    document.body.style.overflow = ""; // what the real widget does when its X is tapped
  });
  // Back must now go to the page before ours (about:blank here), not to a stale booking step.
  await page.waitForTimeout(500);
  await page.goBack();
  await page.waitForTimeout(500);
  expect(before).toBeGreaterThan(1);
  expect(page.url()).not.toContain("localhost");
});

test("opening twice does not stack extra history steps", async ({ page }) => {
  await openBooking(page);
  const first = await page.evaluate(() => history.length);
  await page.keyboard.press("Escape");
  await expect.poll(() => locked(page)).toBe(false);
  await page.locator("main").getByRole("link").first().click();
  await expect.poll(() => locked(page)).toBe(true);
  expect(await page.evaluate(() => history.length)).toBeLessThanOrEqual(first);
});

test("phones: closing with the widget's own button (class only) leaves no dead Back step", async ({
  page,
}) => {
  await page.route("**/widget.js", (route) =>
    route.fulfill({ contentType: "application/javascript", body: PHONE_STUB }),
  );
  await page.goto("about:blank");
  await page.goto("/");
  await page.waitForTimeout(2500);
  await page.locator("main").getByRole("link").first().click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          !document.querySelector(".EWBookingWidget")?.classList.contains("EWBookingWidget_hidden"),
      ),
    )
    .toBe(true);
  await page.evaluate(() =>
    document.querySelector(".EWBookingWidget")!.classList.add("EWBookingWidget_hidden"),
  );
  await page.waitForTimeout(500);
  await page.goBack();
  await page.waitForTimeout(500);
  expect(page.url(), "Back should leave our page, not stop on a dead step").not.toContain(
    "localhost",
  );
});

test("phones: Back closes a class-hidden widget and stays on the page", async ({ page }) => {
  await page.route("**/widget.js", (route) =>
    route.fulfill({ contentType: "application/javascript", body: PHONE_STUB }),
  );
  await page.goto("/");
  await page.waitForTimeout(2500);
  await page.locator("main").getByRole("link").first().click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          !document.querySelector(".EWBookingWidget")?.classList.contains("EWBookingWidget_hidden"),
      ),
    )
    .toBe(true);
  await page.goBack();
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.querySelector(".EWBookingWidget")!.classList.contains("EWBookingWidget_hidden"),
      ),
    )
    .toBe(true);
  expect(new URL(page.url()).pathname).toBe("/");
});
