import { fileURLToPath } from "node:url";
import { build } from "vite";

await build({
  configFile: false,
  publicDir: false,
  logLevel: "warn",
  build: {
    target: "es2022",
    outDir: fileURLToPath(new URL("../.build/test-host", import.meta.url)),
    emptyOutDir: true,
    minify: true,
    rollupOptions: {
      input: fileURLToPath(
        new URL("../test-support/browser-host.ts", import.meta.url),
      ),
      output: {
        entryFileNames: "host.js",
        format: "es",
        inlineDynamicImports: true,
      },
    },
  },
});
