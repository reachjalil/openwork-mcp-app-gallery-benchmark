import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  GALLERY_APPS,
  RESOURCE_MIME_TYPE,
  UPSTREAM_COMMIT,
  type GallerySlug,
} from "./catalog.js";
import { assertBounded, DEFAULT_RESULT_BYTES } from "./limits.js";

export type BundledResource = {
  slug: GallerySlug;
  uri: string;
  mimeType: typeof RESOURCE_MIME_TYPE;
  html: string;
  sha256: string;
  bytes: number;
};

type ResourceBundle = {
  schemaVersion: 1;
  upstreamCommit: string;
  resources: Record<GallerySlug, BundledResource>;
};

const resourceBundlePath = fileURLToPath(
  new URL("../generated/mcp-app-resources.json", import.meta.url),
);

function loadBundle(path = resourceBundlePath): ResourceBundle {
  const parsed = JSON.parse(readFileSync(path, "utf8")) as ResourceBundle;
  if (parsed.schemaVersion !== 1 || parsed.upstreamCommit !== UPSTREAM_COMMIT) {
    throw new Error("MCP App resource bundle provenance is invalid");
  }
  const expected = new Set(GALLERY_APPS.map((app) => app.slug));
  if (Object.keys(parsed.resources).length !== expected.size)
    throw new Error(
      "MCP App resource bundle must contain exactly six resources",
    );
  for (const app of GALLERY_APPS) {
    const resource = parsed.resources[app.slug];
    if (
      resource?.slug !== app.slug ||
      resource.uri !== app.resourceUri ||
      resource.mimeType !== RESOURCE_MIME_TYPE
    ) {
      throw new Error(`MCP App resource registration mismatch for ${app.slug}`);
    }
    assertBounded(resource.html, DEFAULT_RESULT_BYTES, `${app.slug} resource`);
    const bytes = Buffer.byteLength(resource.html, "utf8");
    const digest = createHash("sha256").update(resource.html).digest("hex");
    if (resource.bytes !== bytes || resource.sha256 !== digest)
      throw new Error(`MCP App resource digest mismatch for ${app.slug}`);
    expected.delete(app.slug);
  }
  if (expected.size !== 0)
    throw new Error("MCP App resource bundle is incomplete");
  return parsed;
}

let cachedBundle: ResourceBundle | undefined;

export function resourceFor(slug: GallerySlug): BundledResource {
  cachedBundle ??= loadBundle();
  return cachedBundle.resources[slug];
}

export function validateResourceBundle(): {
  resourceCount: number;
  resourceBytes: number;
} {
  cachedBundle = loadBundle();
  return {
    resourceCount: Object.keys(cachedBundle.resources).length,
    resourceBytes: Object.values(cachedBundle.resources).reduce(
      (sum, resource) => sum + resource.bytes,
      0,
    ),
  };
}

export function validateResourceBundleFile(path: string): {
  resourceCount: number;
  resourceBytes: number;
} {
  const bundle = loadBundle(path);
  return {
    resourceCount: Object.keys(bundle.resources).length,
    resourceBytes: Object.values(bundle.resources).reduce(
      (sum, resource) => sum + resource.bytes,
      0,
    ),
  };
}
