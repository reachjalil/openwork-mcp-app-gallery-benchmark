import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: { BASE_URL: "http://127.0.0.1:4173" },
    exclude: ["tests/browser/**", "node_modules/**"],
    fileParallelism: false,
  },
});
