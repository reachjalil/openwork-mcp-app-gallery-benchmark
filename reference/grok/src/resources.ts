import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { RESOURCE_BYTES, utf8Bytes } from "./limits.js";
import { REQUIRED_SLUGS, type AppSlug } from "./constants.js";
import { RESOURCE_MIME_TYPE } from "./mcp-app-adapter.js";

export type AppResourceRecord = {
  slug: AppSlug;
  uri: string;
  mimeType: string;
  sha256: string;
  html: string;
  bytes: number;
};

export type ResourceBundle = {
  generatedAt?: string;
  resources: Record<string, AppResourceRecord>;
};

export function digestText(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function loadResourceBundle(
  bundle: ResourceBundle | undefined = undefined,
): ResourceBundle {
  if (bundle) return validateBundle(bundle);
  const url = new URL("../generated/mcp-app-resources.json", import.meta.url);
  const path = fileURLToPath(url);
  const parsed = JSON.parse(readFileSync(path, "utf8")) as ResourceBundle;
  return validateBundle(parsed);
}

export function validateBundle(bundle: ResourceBundle): ResourceBundle {
  for (const slug of REQUIRED_SLUGS) {
    const record = bundle.resources[slug];
    if (!record) throw new Error(`Missing MCP App resource for ${slug}`);
    if (record.slug !== slug)
      throw new Error(`Resource slug mismatch for ${slug}`);
    if (record.mimeType !== RESOURCE_MIME_TYPE) {
      throw new Error(`Invalid MIME type for ${slug}`);
    }
    if (utf8Bytes(record.html) > RESOURCE_BYTES) {
      throw new Error(`Resource too large for ${slug}`);
    }
    const digest = digestText(record.html);
    if (digest !== record.sha256) {
      throw new Error(`Resource digest mismatch for ${slug}`);
    }
  }
  return bundle;
}

export function htmlFor(
  bundle: ResourceBundle,
  slug: AppSlug,
): AppResourceRecord {
  const record = bundle.resources[slug];
  if (!record) throw new Error(`Missing MCP App resource for ${slug}`);
  return record;
}
