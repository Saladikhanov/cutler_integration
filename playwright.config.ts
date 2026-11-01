import { defineConfig, devices } from "@playwright/test";

const port = 3000;

// End-to-end tests run against a production build: `npm run build` first, then `npm run test:e2e`.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run start",
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
