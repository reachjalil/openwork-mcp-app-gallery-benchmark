import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { build } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import {
  GALLERY_APPS,
  RESOURCE_MIME_TYPE,
  UPSTREAM_COMMIT,
} from "../src/catalog.js";
import { DEFAULT_RESULT_BYTES } from "../src/limits.js";

const root = process.cwd();
const buildRoot = resolve(root, ".build/mcp-apps");
await rm(buildRoot, { recursive: true, force: true });
await mkdir(buildRoot, { recursive: true });

const resources: Record<string, unknown> = {};
const reactApps = new Set<string>();
const adaptedApps = new Set(["get-time", "cohort-heatmap", "scenario-modeler"]);
const oversized: string[] = [];

for (const app of GALLERY_APPS) {
  const appRoot = adaptedApps.has(app.slug)
    ? resolve(root, "ui-adaptations", app.slug)
    : resolve(root, "upstream/ext-apps", app.upstreamDirectory);
  const outDir = resolve(buildRoot, app.slug);
  await build({
    root: appRoot,
    logLevel: "warn",
    resolve: {
      alias: {
        "chart.js": resolve(root, "src/ui/chart-shim.ts"),
      },
    },
    plugins: [...(reactApps.has(app.slug) ? [react()] : []), viteSingleFile()],
    build: {
      target: "es2022",
      cssMinify: true,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          module: true,
          passes: 5,
          pure_getters: true,
          toplevel: true,
        },
        ecma: 2020,
        format: { comments: false },
        mangle: { toplevel: true },
        module: true,
        toplevel: true,
      },
      sourcemap: false,
      emptyOutDir: true,
      outDir,
      rollupOptions: { input: resolve(appRoot, "mcp-app.html") },
    },
  });
  const html = await readFile(resolve(outDir, "mcp-app.html"), "utf8");
  const bytes = Buffer.byteLength(html, "utf8");
  console.info(`${app.slug}: ${bytes} bytes`);
  if (bytes > DEFAULT_RESULT_BYTES) oversized.push(`${app.slug}=${bytes}`);
  resources[app.slug] = {
    slug: app.slug,
    uri: app.resourceUri,
    mimeType: RESOURCE_MIME_TYPE,
    html,
    sha256: createHash("sha256").update(html).digest("hex"),
    bytes,
  };
}

if (oversized.length > 0)
  throw new Error(
    `MCP App resources exceed ${DEFAULT_RESULT_BYTES} bytes: ${oversized.join(", ")}`,
  );

await mkdir(resolve(root, "generated"), { recursive: true });
await writeFile(
  resolve(root, "generated/mcp-app-resources.json"),
  `${JSON.stringify({ schemaVersion: 1, upstreamCommit: UPSTREAM_COMMIT, resources }, null, 2)}\n`,
  "utf8",
);
