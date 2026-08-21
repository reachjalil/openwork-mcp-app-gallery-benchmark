import { defineConfig } from "@playwright/test";

const protectionBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "tests/browser",
  timeout: 30_000,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173",
    extraHTTPHeaders: protectionBypass
      ? { "x-vercel-protection-bypass": protectionBypass }
      : undefined,
    browserName: "chromium",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev:test",
    env: {
      GALLERY_GIT_SHA: "0123456789abcdef0123456789abcdef01234567",
    },
    url: "http://127.0.0.1:4173/healthz",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
