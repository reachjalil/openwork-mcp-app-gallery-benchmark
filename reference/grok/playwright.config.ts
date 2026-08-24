import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/browser",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:8787",
    trace: "on-first-retry",
    permissions: ["clipboard-read", "clipboard-write"],
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "tsx src/dev.ts",
    url: "http://127.0.0.1:8787/healthz",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: "8787",
      HOST: "127.0.0.1",
      BASE_URL: "http://127.0.0.1:8787",
      GALLERY_GIT_SHA: process.env.GALLERY_GIT_SHA ?? "playwright-local",
    },
  },
});
