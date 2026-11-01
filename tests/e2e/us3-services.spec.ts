import { expect, test } from "@playwright/test";

const locales = [
  { path: "/", title: "Послуги", first: "Стрижка", book: "Записатися", price: /\d[\d  ]*\s?₴/ },
  { path: "/en", title: "Services", first: "Haircut", book: "Book", price: /₴\d[\d,]*/ },
];

// These read the real dataset until the planned fixtures (T044) exist: they expect the six Dnipro services.
for (const { path, title, first, book, price } of locales) {
  test.describe(`services ${path}`, () => {
    test("lists the services in order with their durations and prices", async ({ page }) => {
      await page.goto(path);
      const section = page.locator("section", {
        has: page.getByRole("heading", { level: 2, name: title }),
      });
      await expect(section).toBeVisible();
      const rows = section.getByRole("listitem");
      expect(await rows.count()).toBeGreaterThanOrEqual(1);
      await expect(rows.first()).toContainText(first);
      for (const row of await rows.all()) await expect(row).toContainText(price);
    });

    test("each row is a link that opens booking, and a Book button follows the list", async ({
      page,
    }) => {
      await page.route("**/widget.js", (route) =>
        route.fulfill({
          contentType: "application/javascript",
          body: `window.__calls=[];window.EasyWeekWidget=class{constructor(){}show(){window.__calls.push("show")}hide(){}destroy(){}setBranch(i){window.__calls.push("setBranch:"+i)}setUser(){}setProduct(a,b){window.__calls.push("setProduct:"+a)}};`,
        }),
      );
      await page.goto(path);
      await page.waitForTimeout(2500);
      const section = page.locator("section", {
        has: page.getByRole("heading", { level: 2, name: title }),
      });
      const row = section.getByRole("listitem").first().getByRole("link");
      await expect(row).toHaveAttribute("href", /^https:\/\/cutler\.easyweek\.com\.ua\/?$/);
      await expect(section.getByRole("link", { name: book, exact: true })).toBeVisible();
      await row.click();
      await expect
        .poll(() => page.evaluate(() => (window as never as { __calls: string[] }).__calls))
        .toEqual(expect.arrayContaining([expect.stringMatching(/^(show|setBranch:|setProduct:)/)]));
    });

    test("the rows have the content in the first HTML, without JavaScript", async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 2, name: title })).toBeVisible();
      await expect(page.getByText(first, { exact: false }).first()).toBeVisible();
      await context.close();
    });

    test("rows are comfortable touch targets", async ({ page }) => {
      await page.goto(path);
      const row = page.locator("section ul li a").first();
      expect((await row.boundingBox())!.height).toBeGreaterThanOrEqual(43.5);
    });
  });
}

test("a row lights up in the neon on hover and keeps the text readable", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "hover needs a mouse");
  await page.goto("/");
  const row = page.locator("section ul li a").first();
  await row.hover();
  await expect(row).toHaveCSS("background-color", "rgb(237, 238, 27)");
  await expect(row).toHaveCSS("color", "rgb(34, 34, 34)");
});
