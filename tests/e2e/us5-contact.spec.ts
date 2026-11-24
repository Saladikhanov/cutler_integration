import { expect, test, type Page } from "@playwright/test";

// Reads the real dataset until the planned fixtures exist (T044): address, Mon to Sat hours, phone, Instagram.
const PHONE = "tel:+380976494909";

async function stubExternal(page: Page) {
  // The Next.js dev tools button floats over the bottom-left in `next dev` only; keep it out of the clicks.
  await page.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = "nextjs-portal { display: none !important; }";
    document.addEventListener("DOMContentLoaded", () => document.head.append(style));
  });
  await page.route(/googletagmanager\.com|google-analytics\.com/, (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.route("**/widget.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: "window.EasyWeekWidget=class{show(){}hide(){}destroy(){}setBranch(){}}",
    }),
  );
  // A tel: link has no handler in the test browser; keep the page where it is.
  await page.addInitScript(() => {
    document.addEventListener(
      "click",
      (event) => {
        const link = (event.target as Element).closest?.("a[href^='tel:']");
        if (link) event.preventDefault();
      },
      true,
    );
  });
}

const locales = [
  {
    path: "/",
    title: "Контакти",
    range: "Пн–Сб",
    closed: "Нд",
    closedText: "Зачинено",
    map: "Відкрити на мапі",
  },
  {
    path: "/en",
    title: "Contacts",
    range: "Mon–Sat",
    closed: "Sun",
    closedText: "Closed",
    map: "Open in maps",
  },
];

for (const { path, title, range, closed, closedText, map } of locales) {
  test.describe(`contact section ${path}`, () => {
    test("shows the address, hours as a list, the phone and the map link", async ({ page }) => {
      await page.goto(path);
      const section = page.getByRole("region", { name: title });
      await expect(section).toBeVisible();
      await expect(section).toContainText(/Ламана 18|Lamana St 18/);
      await expect(section).toContainText(range);
      await expect(section).toContainText("10:00 – 20:00");
      await expect(section.getByText(closed, { exact: true })).toBeVisible();
      await expect(section.getByText(closedText, { exact: true })).toBeVisible();

      const phone = section.getByRole("link", { name: "+380 97 649 49 09" });
      await expect(phone).toHaveAttribute("href", PHONE);

      const mapLink = section.getByRole("link", { name: map });
      await expect(mapLink).toHaveAttribute("target", "_blank");
      await expect(mapLink).toHaveAttribute("rel", /noopener/);
      await expect(section.getByRole("link", { name: "Instagram" })).toHaveAttribute(
        "href",
        /instagram\.com/,
      );
    });

    test("shows no reviews or ratings (FR-029)", async ({ page }) => {
      await page.goto(path);
      const text = (await page.locator("main").innerText()).toLowerCase();
      expect(text).not.toMatch(/відгук|review|rating|рейтинг|★/);
    });

    test("loads nothing from a map provider", async ({ page }) => {
      const hosts: string[] = [];
      page.on("request", (request) => hosts.push(new URL(request.url()).host));
      await page.goto(path);
      await page.waitForTimeout(800);
      expect(hosts.filter((h) => /maps\.google|google\.com\/maps|openstreetmap/.test(h))).toEqual(
        [],
      );
    });
  });
}

test.describe("phone bar", () => {
  test("shows Book and Call on a phone, with the right dial link", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/barbers");
    const bar = page.locator("div.fixed.bottom-0", {
      has: page.getByRole("link", { name: "Подзвонити" }),
    });
    await expect(bar).toBeVisible();
    await expect(bar.getByRole("link", { name: "Записатися", exact: true })).toBeVisible();
    await expect(bar.getByRole("link", { name: "Подзвонити" })).toHaveAttribute("href", PHONE);
  });

  test("steps aside while the home page's own Book button is on screen, then shows", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/");
    const call = page.getByRole("link", { name: "Подзвонити" });
    await expect(call).toBeHidden();
    await page.evaluate(() => window.scrollTo({ top: 1600, behavior: "instant" }));
    await expect(call).toBeVisible();
  });

  test("is hidden on wide screens", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Подзвонити" })).toBeHidden();
  });

  test("never covers the footer, and the consent banner sits above it", async ({ page }) => {
    // No entrance animation, so the banner is measured where it settles.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await stubExternal(page);
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/barbers");
    const bar = page.locator("div.fixed.bottom-0", {
      has: page.getByRole("link", { name: "Подзвонити" }),
    });
    const banner = page.getByRole("region", { name: "Згода на cookie" });
    await expect(banner).toBeVisible();
    const barBox = (await bar.boundingBox())!;
    const bannerBox = (await banner.boundingBox())!;
    expect(bannerBox.y + bannerBox.height).toBeLessThanOrEqual(barBox.y + 1);

    await page.getByRole("button", { name: "Відхилити" }).click();
    // Lazy content can grow the page while scrolling: keep jumping to the end until we are really there.
    await expect
      .poll(async () => {
        await page.evaluate(() =>
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
        );
        await page.waitForTimeout(150);
        return page.evaluate(
          () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1,
        );
      })
      .toBe(true);
    const footerLink = page.locator("footer").getByRole("link").last();
    const linkBox = (await footerLink.boundingBox())!;
    expect(linkBox.y + linkBox.height).toBeLessThanOrEqual(barBox.y + 1);
  });

  test("a call click records the method only, after the visitor accepted", async ({ page }) => {
    await stubExternal(page);
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/barbers");
    await page.getByRole("button", { name: "Прийняти" }).click();
    await page.getByRole("link", { name: "Подзвонити" }).click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          ((window as never as { dataLayer?: unknown[] }).dataLayer ?? [])
            .map((entry) => Array.from(entry as ArrayLike<unknown>))
            .filter((item) => item[0] === "event" && item[1] === "click_contact")
            .map((item) => JSON.stringify(item[2])),
        ),
      )
      .toEqual([JSON.stringify({ language: "uk", page_type: "barbers", contact_method: "phone" })]);
  });
});

// How many Book buttons a phone shows at once (see the 2026-11-01 review of the amount of buttons).
const bookInView = (page: Page) =>
  page.evaluate(() => {
    const links = [...document.querySelectorAll("a")].filter((a) =>
      a.innerText.trim().startsWith("Записатися"),
    );
    return links.filter((a) => {
      const style = getComputedStyle(a);
      const box = a.getBoundingClientRect();
      const bar = a.closest("div.fixed");
      const barVisible = !bar || getComputedStyle(bar).visibility !== "hidden";
      return (
        style.display !== "none" &&
        barVisible &&
        box.width > 0 &&
        box.bottom > 0 &&
        box.top < window.innerHeight
      );
    }).length;
  });

test.describe("Book buttons on a phone", () => {
  test.beforeEach(async ({ page }) => {
    // The Next.js dev tools button floats over the bottom-left in `next dev` only; keep it out of the clicks.
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal { display: none !important; }";
      document.addEventListener("DOMContentLoaded", () => document.head.append(style));
    });
    await page.setViewportSize({ width: 390, height: 800 });
  });

  test("the home page's first screen has exactly one", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => bookInView(page)).toBe(1);
    await expect(page.locator("header").getByRole("link", { name: "Записатися" })).toBeHidden();
  });

  test("a barber's page has exactly one, and it books that barber", async ({ page }) => {
    await page.route("**/widget.js", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `window.__calls = [];
          window.EasyWeekWidget = class {
            show() { window.__calls.push("show"); } hide() {} destroy() {}
            setBranch(id) { window.__calls.push("setBranch:" + id); }
            setUser(user, branch) { window.__calls.push("setUser:" + user + ":" + branch); }
          };`,
      }),
    );
    await page.goto("/barbers/ivan");
    await page.waitForTimeout(600);
    expect(await bookInView(page)).toBe(1);
    // Keyboard, like a real visitor who tabs to it: Playwright's scroll-into-view stalls on this fixed bar here.
    const barBook = page
      .locator("div.fixed.bottom-0")
      .getByRole("link", { name: /^Записатися · Іван$/ });
    await barBook.focus();
    await page.keyboard.press("Enter");
    await expect
      .poll(() => page.evaluate(() => (window as never as { __calls: string[] }).__calls))
      .toContain("setUser:22574:342005");
  });

  test("the barbers page shows the cards' buttons and the bar, not a header button", async ({
    page,
  }) => {
    await page.goto("/barbers");
    await expect(page.locator("header").getByRole("link", { name: "Записатися" })).toBeHidden();
    await expect(
      page.locator("div.fixed.bottom-0").getByRole("link", { name: "Записатися" }),
    ).toBeVisible();
  });
});
