import { defineConfig } from "@playwright/test";

const GALLERY_PORT = 3999;

export default defineConfig({
  testDir: "tests/browser",
  globalSetup: "./tests/browser/playwright-global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"]] : [["list"]],
  use: {
    baseURL: `http://localhost:${GALLERY_PORT}`,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "pnpm exec tsx scripts/dev-server.ts",
      url: `http://localhost:${GALLERY_PORT}/healthz`,
      reuseExistingServer: false,
      env: {
        PORT: String(GALLERY_PORT),
        BASE_URL: `http://localhost:${GALLERY_PORT}`,
        GALLERY_ALLOWED_BROWSER_ORIGINS: "http://localhost:8080",
      },
      timeout: 60_000,
    },
    {
      command: "node tests/browser/harness-server.mjs",
      url: "http://localhost:8080/api/servers",
      reuseExistingServer: false,
      env: {
        HARNESS_GALLERY_ORIGIN: `http://localhost:${GALLERY_PORT}`,
      },
      timeout: 60_000,
    },
  ],
});
