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

// The site follows the device setting live. A manual choice lasts only until the device switches.
test("follows the device setting live, and a manual choice resets when the device switches", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: "light",
  });
  const page = await context.newPage();
  await page.goto("/");
  const html = page.locator("html");
  const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  // No manual choice: the page follows the device when it changes.
  expect(await background()).toBe("rgb(254, 254, 254)");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(background).toBe("rgb(34, 34, 34)");

  // A manual choice (light while the device is dark) holds, even after a reload...
  await page.locator("header button").first().click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "light");

  // ...until the device switches: then the choice is dropped and the page follows the device again.
  await page.emulateMedia({ colorScheme: "light" });
  await expect(html).not.toHaveAttribute("data-theme", /.+/);
  expect(await background()).toBe("rgb(254, 254, 254)");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(background).toBe("rgb(34, 34, 34)");
  await context.close();
});

test("pressing back to the device's own theme returns to following the device", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: "dark",
  });
  const page = await context.newPage();
  await page.goto("/");
  const html = page.locator("html");
  await page.locator("header button").first().click(); // dark device -> light
  await expect(html).toHaveAttribute("data-theme", "light");
  await page.locator("header button").first().click(); // back to dark = the device
  await expect(html).not.toHaveAttribute("data-theme", /.+/);
  await page.emulateMedia({ colorScheme: "light" });
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
    .toBe("rgb(254, 254, 254)");
  await context.close();
});
