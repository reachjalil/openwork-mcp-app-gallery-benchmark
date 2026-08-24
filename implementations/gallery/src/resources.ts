/**
 * Immutable bundled MCP App resource store.
 *
 * `scripts/bundle-mcp-app-resources.mjs` builds every app UI into
 * deterministic single-file HTML and collects it into
 * `generated/mcp-app-resources.json`, which `vercel.json` includes in the
 * function bundle. This module loads that file once per instance, verifies
 * every entry (exact MCP Apps MIME type, size ceiling, content digest), and
 * then freezes it. Nothing is fetched at runtime and nothing is written.
 *
 * Loading is lazy and failure is contained: an unreadable or invalid bundle
 * leaves `/readyz` red and every app resource read failing with a bounded
 * error, while `/healthz` and the rest of the gateway keep responding.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { MAX_RESOURCE_BYTES } from "./limits.js";

export const RESOURCE_BUNDLE_MIME = "text/html;profile=mcp-app";

export interface BundledResource {
  uri: string;
  mimeType: string;
  sha256: string;
  bytes: number;
  html: string;
}

export interface BundledSite {
  html: string;
  sha256: string;
  bytes: number;
}

export interface ResourceBundle {
  schemaVersion: number;
  upstreamCommit: string;
  builtAt: string;
  site: BundledSite;
  resources: Record<string, BundledResource>;
}

export type BundleState =
  | { state: "unloaded" }
  | { state: "ready"; bundle: ResourceBundle }
  | { state: "failed"; reason: string };

let bundleState: BundleState = { state: "unloaded" };

function candidatePaths(): string[] {
  // Reviewed configuration seam: an explicit path override replaces the
  // candidates entirely (used by local tooling and failure-path tests). It
  // cannot enable anything unreviewed — the loaded bundle is still digest-
  // validated and its slugs must match the checked-in registry.
  const override = process.env.GALLERY_RESOURCE_BUNDLE_PATH;
  if (override) return [override];
  const candidates = [
    path.join(process.cwd(), "generated", "mcp-app-resources.json"),
  ];
  try {
    candidates.push(
      fileURLToPath(
        new URL("../generated/mcp-app-resources.json", import.meta.url),
      ),
    );
  } catch {
    // import.meta.url may be unavailable in some bundling modes; cwd wins.
  }
  return candidates;
}

function validateBundle(parsed: unknown): ResourceBundle {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("bundle is not an object");
  }
  const bundle = parsed as ResourceBundle;
  if (bundle.schemaVersion !== 1) {
    throw new Error(`unsupported bundle schemaVersion ${bundle.schemaVersion}`);
  }
  if (!/^[0-9a-f]{40}$/.test(bundle.upstreamCommit)) {
    throw new Error("bundle upstreamCommit is not a full commit SHA");
  }
  if (typeof bundle.resources !== "object" || bundle.resources === null) {
    throw new Error("bundle carries no resources map");
  }
  const site = bundle.site;
  if (
    typeof site !== "object" ||
    site === null ||
    typeof site.html !== "string" ||
    !site.html.toLowerCase().includes("<!doctype html")
  ) {
    throw new Error("bundle carries no gallery site page");
  }
  if (Buffer.byteLength(site.html, "utf8") !== site.bytes) {
    throw new Error("site page byte count mismatch");
  }
  if (createHash("sha256").update(site.html).digest("hex") !== site.sha256) {
    throw new Error("site page digest mismatch");
  }
  for (const [slug, resource] of Object.entries(bundle.resources)) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
      throw new Error(`bundle slug ${JSON.stringify(slug)} is invalid`);
    }
    if (resource.mimeType !== RESOURCE_BUNDLE_MIME) {
      throw new Error(`resource ${slug} has MIME ${resource.mimeType}`);
    }
    if (!resource.uri.startsWith("ui://")) {
      throw new Error(`resource ${slug} URI must use the ui:// scheme`);
    }
    const bytes = Buffer.byteLength(resource.html, "utf8");
    if (bytes !== resource.bytes) {
      throw new Error(`resource ${slug} byte count mismatch`);
    }
    if (bytes > MAX_RESOURCE_BYTES) {
      throw new Error(
        `resource ${slug} is ${bytes} bytes, over the ${MAX_RESOURCE_BYTES}-byte ceiling`,
      );
    }
    const digest = createHash("sha256").update(resource.html).digest("hex");
    if (digest !== resource.sha256) {
      throw new Error(`resource ${slug} digest mismatch`);
    }
  }
  return bundle;
}

export function loadResourceBundle(): BundleState {
  if (bundleState.state !== "unloaded") return bundleState;
  let lastError = "generated/mcp-app-resources.json not found";
  for (const candidate of candidatePaths()) {
    let raw: string;
    try {
      raw = readFileSync(candidate, "utf8");
    } catch {
      continue;
    }
    try {
      const bundle = validateBundle(JSON.parse(raw));
      Object.freeze(bundle.resources);
      bundleState = { state: "ready", bundle: Object.freeze(bundle) };
      return bundleState;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      break;
    }
  }
  bundleState = { state: "failed", reason: lastError };
  return bundleState;
}

/** Test hook: reset the store so load failure paths can be exercised. */
export function resetResourceBundleForTest(): void {
  bundleState = { state: "unloaded" };
}

export function getBundledResourceHtml(slug: string): string {
  const state = loadResourceBundle();
  if (state.state !== "ready") {
    throw new Error("app resources are unavailable");
  }
  const resource = state.bundle.resources[slug];
  if (!resource) {
    throw new Error("app resources are unavailable");
  }
  return resource.html;
}

export function getSiteHtml(): string | null {
  const state = loadResourceBundle();
  if (state.state !== "ready") return null;
  return state.bundle.site.html;
}

export function bundleMeta(): {
  upstreamCommit: string;
  builtAt: string;
  slugs: string[];
} | null {
  const state = loadResourceBundle();
  if (state.state !== "ready") return null;
  return {
    upstreamCommit: state.bundle.upstreamCommit,
    builtAt: state.bundle.builtAt,
    slugs: Object.keys(state.bundle.resources).sort(),
  };
}
