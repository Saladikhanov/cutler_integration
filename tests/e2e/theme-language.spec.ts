import { expect, test } from "@playwright/test";

// The saved theme must survive a language change. The switch used to be a soft navigation that replaced the
// <html> element without re-running the pre-paint script, so the page fell back to the device theme.
for (const device of ["light", "dark"] as const) {
  test(`the chosen theme survives a language switch (device ${device})`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      colorScheme: device,
    });
    const page = await context.newPage();
    await page.goto("/");
    const chosen = device === "light" ? "dark" : "light"; // the opposite of the device, so a reset is visible
    await page.locator("header button").first().click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", chosen);

    await page.locator("header").getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("data-theme", chosen);

    await page.locator("header").getByRole("link", { name: "Українська" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("data-theme", chosen);
    await context.close();
  });
}
