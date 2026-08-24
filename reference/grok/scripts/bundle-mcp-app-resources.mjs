import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { build } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const RESOURCE_BYTES = 1024 * 1024;
const MIME = "text/html;profile=mcp-app";

const APPS = [
  {
    slug: "get-time",
    dir: "basic-server-react",
    uri: "ui://get-time/mcp-app.html",
    react: true,
  },
  {
    slug: "budget-allocator",
    dir: "budget-allocator-server",
    uri: "ui://budget-allocator/mcp-app.html",
    react: false,
  },
  {
    slug: "cohort-heatmap",
    dir: "cohort-heatmap-server",
    uri: "ui://get-cohort-data/mcp-app.html",
    react: true,
  },
  {
    slug: "customer-segmentation",
    dir: "customer-segmentation-server",
    uri: "ui://customer-segmentation/mcp-app.html",
    react: false,
  },
  {
    slug: "scenario-modeler",
    dir: "scenario-modeler-server",
    uri: "ui://scenario-modeler/mcp-app.html",
    react: true,
  },
  {
    slug: "transcript",
    dir: "transcript-server",
    uri: "ui://transcript/mcp-app.html",
    react: false,
  },
];

const outDir = join(root, "generated");
await mkdir(outDir, { recursive: true });
const htmlOut = join(outDir, "html");
await rm(htmlOut, { recursive: true, force: true });
await mkdir(htmlOut, { recursive: true });

const resources = {};
for (const app of APPS) {
  const exampleDir = join(root, "upstream/ext-apps", app.dir);
  const dest = join(htmlOut, app.slug);
  await build({
    root: exampleDir,
    configFile: false,
    envDir: root,
    logLevel: "warn",
    esbuild: {
      legalComments: "none",
      drop: ["console", "debugger"],
    },
    plugins: app.react ? [react(), viteSingleFile()] : [viteSingleFile()],
    build: {
      cssCodeSplit: false,
      cssMinify: true,
      minify: true,
      sourcemap: false,
      assetsInlineLimit: 100_000_000,
      rollupOptions: {
        input: join(exampleDir, "mcp-app.html"),
      },
      outDir: dest,
      emptyOutDir: true,
    },
  });
  const html = await readFile(join(dest, "mcp-app.html"), "utf8");
  const bytes = Buffer.byteLength(html, "utf8");
  if (bytes > RESOURCE_BYTES) {
    throw new Error(
      `${app.slug} MCP App HTML is ${bytes} bytes; ceiling is ${RESOURCE_BYTES}`,
    );
  }
  const sha256 = createHash("sha256").update(html).digest("hex");
  resources[app.slug] = {
    slug: app.slug,
    uri: app.uri,
    mimeType: MIME,
    sha256,
    html,
    bytes,
  };
}

const bundle = {
  generatedAt: new Date().toISOString(),
  resources,
};
await writeFile(
  join(outDir, "mcp-app-resources.json"),
  JSON.stringify(bundle),
  "utf8",
);
console.log("bundled MCP App resources", Object.keys(resources));
