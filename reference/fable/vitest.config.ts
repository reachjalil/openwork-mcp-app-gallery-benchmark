import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/browser/**", "node_modules/**"],
    globalSetup: ["tests/global-setup.ts"],
    pool: "forks",
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
