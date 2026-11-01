import { expect, test, type Page } from "@playwright/test";

const FALLBACK = "https://cutler.easyweek.com.ua/";

// A stub of the EasyWeek widget: records how it was built and which methods were called.
const WIDGET_STUB = `
  window.__ew = { options: [], calls: [] };
  window.EasyWeekWidget = class {
    constructor(options) { window.__ew.options.push(options); }
    show() { window.__ew.calls.push("show"); }
    hide() {}
    destroy() { window.__ew.calls.push("destroy"); }
    setBranch(id) { window.__ew.calls.push("setBranch:" + id); }
    setUser() {}
    setProduct() {}
  };
`;

async function stubWidget(page: Page) {
  await page.route("**/widget.js", (route) =>
    route.fulfill({ contentType: "application/javascript", body: WIDGET_STUB }),
  );
}

const locales = [
  { path: "/", lang: "uk", book: "Записатися", headline: /Барбершоп/ },
  { path: "/en", lang: "en", book: "Book", headline: /Barbershop/ },
];

for (const { path, lang, book, headline } of locales) {
  test.describe(`home ${path}`, () => {
    test("shows the name, the offer and a booking button on the first screen", async ({ page }) => {
      await page.goto(path);
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toHaveText(headline);
      await expect(page.getByRole("img", { name: /CUTLER/ }).first()).toBeVisible();

      const button = page.getByRole("link", { name: book, exact: true }).last();
      await expect(button).toBeVisible();
      const box = await button.boundingBox();
      const viewport = page.viewportSize();
      expect(box && viewport && box.y + box.height <= viewport.height).toBe(true);
    });

    test("opens the widget in the right language when it is available", async ({ page }) => {
      await stubWidget(page);
      await page.goto(path);
      await page.getByRole("link", { name: book, exact: true }).last().click();
      await expect
        .poll(() =>
          page.evaluate(
            () => (window as never as { __ew?: { calls: string[] } }).__ew?.calls ?? [],
          ),
        )
        .toContain("show");
      const options = await page.evaluate(
        () => (window as never as { __ew: { options: { url: string }[] } }).__ew.options,
      );
      expect(options.at(-1)?.url).toContain(`lang=${lang}`);
      expect(options.at(-1)?.url).toContain("ref=website");
      expect(new URL(page.url()).pathname).toBe(path);
    });

    test("follows the plain link when the widget cannot load", async ({ page }) => {
      await page.route("**/widget.js", (route) => route.abort());
      await page.route(FALLBACK, (route) =>
        route.fulfill({ contentType: "text/html", body: "booking page" }),
      );
      await page.goto(path);
      await page.getByRole("link", { name: book, exact: true }).last().click();
      await expect(page).toHaveURL(FALLBACK);
    });

    test("never claims a booking was made", async ({ page }) => {
      await page.goto(path);
      const text = (await page.locator("body").innerText()).toLowerCase();
      expect(text).not.toMatch(/booked|confirmed|you are booked|записано|підтверджено|ви записані/);
    });
  });
}

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const { path, book } of locales) {
    test(`the booking button on ${path} is a working link to EasyWeek`, async ({ page }) => {
      await page.goto(path);
      const links = page.getByRole("link", { name: book, exact: true });
      await expect(links.last()).toHaveAttribute("href", FALLBACK);
    });
  }
});

test.describe("design rules", () => {
  for (const { path, book } of locales) {
    test(`the Book button shows the neon fill at rest, with no hover needed (${path})`, async ({
      page,
    }) => {
      await page.goto(path);
      const button = page.getByRole("link", { name: book, exact: true }).last();
      await expect(button).toHaveCSS("background-color", "rgb(237, 238, 27)");
      await expect(button).toHaveCSS("color", "rgb(34, 34, 34)");
    });
  }

  test("nothing scrolls sideways at 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const { path } of locales) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test("the header stays fixed to the top while scrolling", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 400));
    const box = await page.locator("header").boundingBox();
    expect(box?.y).toBe(0);
  });
});
