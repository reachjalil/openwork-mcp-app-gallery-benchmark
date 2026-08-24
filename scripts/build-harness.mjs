/**
 * Build the upstream basic host (dev-only browser-test harness) into
 * upstream/ext-apps/basic-host/dist. Used exclusively by `pnpm test:browser`;
 * never deployed.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import react from "@vitejs/plugin-react";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const hostDir = path.join(root, "upstream", "ext-apps", "basic-host");

for (const input of ["index.html", "sandbox.html"]) {
  process.stdout.write(`building basic-host ${input}...\n`);
  await build({
    root: hostDir,
    configFile: false,
    logLevel: "warn",
    plugins: [react(), viteSingleFile()],
    build: {
      rollupOptions: { input: path.join(hostDir, input) },
      outDir: path.join(hostDir, "dist"),
      emptyOutDir: false,
      sourcemap: false,
      minify: true,
    },
  });
}
process.stdout.write("basic-host harness built\n");
