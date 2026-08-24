import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { resolveCanonicalBaseUrl } from "../src/base-url.js";
import { GALLERY_APPS } from "../src/catalog.js";
import {
  GALLERY_CSS,
  GALLERY_CSS_PATH,
  GALLERY_JS,
  GALLERY_JS_PATH,
  publicAppsManifest,
  renderGalleryPage,
} from "../src/gallery-render.js";

const root = process.cwd();
const publicRoot = resolve(root, "public");
const generatedRoot = resolve(root, "generated");
await mkdir(resolve(publicRoot, "assets"), { recursive: true });
await mkdir(generatedRoot, { recursive: true });
const baseUrl = resolveCanonicalBaseUrl();
const appsJson = `${JSON.stringify(publicAppsManifest(baseUrl), null, 2)}\n`;

await writeFile(
  resolve(publicRoot, "index.html"),
  renderGalleryPage(baseUrl),
  "utf8",
);
await writeFile(resolve(publicRoot, "apps.json"), appsJson, "utf8");
await writeFile(resolve(generatedRoot, "apps.json"), appsJson, "utf8");
await writeFile(
  resolve(publicRoot, GALLERY_CSS_PATH.slice(1)),
  GALLERY_CSS,
  "utf8",
);
await writeFile(
  resolve(publicRoot, GALLERY_JS_PATH.slice(1)),
  GALLERY_JS,
  "utf8",
);

for (const app of GALLERY_APPS) {
  await copyFile(
    resolve(root, "upstream/ext-apps", app.upstreamDirectory, "screenshot.png"),
    resolve(
      publicRoot,
      "assets",
      `${app.slug}-${app.screenshotDigest.slice(0, 16)}.png`,
    ),
  );
}
