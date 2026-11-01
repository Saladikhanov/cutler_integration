import { expect, test } from "@playwright/test";

// Geometry is measured without the entrance animations (they move things for the first two seconds).
test.use({ reducedMotion: "reduce" });

test.describe("home hero: the place for the barbershop photo", () => {
  test("is there, decorative, and above the wordmark so the letters sit behind it", async ({
    page,
  }) => {
    await page.goto("/");
    const photo = page.locator('[data-placeholder="photo"]');
    await expect(photo).toBeVisible();
    await expect(photo).toHaveAttribute("aria-hidden", "true");
    expect((await photo.innerText()).trim()).toBe("");

    const wordmark = page.getByRole("img", { name: /CUTLER/ }).nth(1); // the hero wordmark (the header one is first)
    const w = (await wordmark.boundingBox())!;
    const p = (await photo.boundingBox())!;
    const overlapW = Math.min(w.x + w.width, p.x + p.width) - Math.max(w.x, p.x);
    const overlapH = Math.min(w.y + w.height, p.y + p.height) - Math.max(w.y, p.y);
    expect(overlapW, "the picture overlaps the wordmark").toBeGreaterThan(20);
    expect(overlapH, "the picture overlaps the wordmark").toBeGreaterThan(10);

    // At the middle of the overlap, the topmost element is the picture, not a letter.
    const cx = Math.max(w.x, p.x) + overlapW / 2;
    const cy = Math.max(w.y, p.y) + overlapH / 2;
    const topmostIsPhoto = await page.evaluate(
      ([x, y]) => !!document.elementFromPoint(x, y)?.closest('[data-placeholder="photo"]'),
      [cx, cy],
    );
    expect(topmostIsPhoto).toBe(true);
  });

  test("never covers the heading or the Book button", async ({ page }) => {
    await page.goto("/");
    for (const target of [
      page.getByRole("heading", { level: 1 }),
      page.locator("main").getByRole("link").first(),
    ]) {
      const b = (await target.boundingBox())!;
      const topmostIsTarget = await target.evaluate(
        (el, [x, y]) => {
          const hit = document.elementFromPoint(x, y);
          return !!hit && (el === hit || el.contains(hit));
        },
        [b.x + b.width / 2, b.y + b.height / 2],
      );
      expect(topmostIsTarget, "text and Book stay on top of the picture").toBe(true);
    }
  });
});
