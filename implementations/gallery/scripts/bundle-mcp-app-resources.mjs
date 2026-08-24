/**
 * Build every registry app's UI into deterministic single-file HTML and
 * collect the results into generated/mcp-app-resources.json, the immutable
 * resource store shipped inside the Vercel function bundle.
 *
 * Sources are the pinned copies under upstream/ext-apps only; nothing is
 * fetched from the network.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import react from "@vitejs/plugin-react";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const registryData = JSON.parse(
  await readFile(path.join(root, "src", "registry-data.json"), "utf8"),
);

// Must match MAX_RESOURCE_BYTES in src/limits.ts (see the recorded deviation
// note there: official React examples build to ~531 KiB single-file HTML).
const MAX_RESOURCE_BYTES = 1024 * 1024;
const RESOURCE_MIME_TYPE = "text/html;profile=mcp-app";

const resources = {};

for (const app of registryData.apps) {
  const appDir = path.join(root, "upstream", "ext-apps", app.upstreamDir);
  process.stdout.write(`building ${app.slug} (${app.upstreamDir})...\n`);
  await build({
    root: appDir,
    configFile: false,
    logLevel: "warn",
    plugins: [
      ...(app.framework === "react" ? [react()] : []),
      viteSingleFile(),
    ],
    build: {
      rollupOptions: { input: path.join(appDir, "mcp-app.html") },
      outDir: path.join(appDir, "dist"),
      emptyOutDir: true,
      sourcemap: false,
      cssMinify: true,
      minify: true,
    },
  });
  const html = await readFile(
    path.join(appDir, "dist", "mcp-app.html"),
    "utf8",
  );
  const bytes = Buffer.byteLength(html, "utf8");
  if (bytes > MAX_RESOURCE_BYTES) {
    throw new Error(
      `${app.slug} UI is ${bytes} bytes, over the ${MAX_RESOURCE_BYTES}-byte resource ceiling`,
    );
  }
  resources[app.slug] = {
    uri: app.resourceUri,
    mimeType: RESOURCE_MIME_TYPE,
    sha256: createHash("sha256").update(html).digest("hex"),
    bytes,
    html,
  };
}

// The committed gallery page ships inside the function bundle too: the
// framework preset's filesystem phase matches the function at "/" before any
// static index resolution, so the function itself must serve the landing
// page (assets and screenshots stay on the CDN).
const siteHtml = await readFile(
  path.join(root, "public", "index.html"),
  "utf8",
);

const bundle = {
  schemaVersion: 1,
  upstreamCommit: registryData.upstreamCommit,
  builtAt: new Date().toISOString(),
  site: {
    html: siteHtml,
    sha256: createHash("sha256").update(siteHtml).digest("hex"),
    bytes: Buffer.byteLength(siteHtml, "utf8"),
  },
  resources,
};

await mkdir(path.join(root, "generated"), { recursive: true });
await writeFile(
  path.join(root, "generated", "mcp-app-resources.json"),
  JSON.stringify(bundle),
);
const total = Object.values(resources).reduce((sum, r) => sum + r.bytes, 0);
process.stdout.write(
  `bundled ${Object.keys(resources).length} app resources (${total} bytes total)\n`,
);
