/**
 * The gallery's single Hono application: gallery diagnostics, the machine
 * manifest, and the path-routed MCP gateway. Static gallery assets under
 * `public/` are served by the Vercel CDN and never reach this function.
 */
import { Hono } from "hono";
import { createRequire } from "node:module";
import { endpointUrl, resolveBaseUrl } from "./base-url.js";
import { handleMcpRequest } from "./gateway.js";
import { logRecord } from "./observability.js";
import {
  UPSTREAM_COMMIT,
  UPSTREAM_REPOSITORY,
  enabledApps,
  getEnabledApp,
  registry,
  validateRegistry,
  type GalleryAppRegistration,
} from "./registry.js";
import { bundleMeta, getSiteHtml, loadResourceBundle } from "./resources.js";

// JSON is loaded through require so the transpiled output runs on Node's
// native ESM loader without import attributes.
const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as {
  name: string;
  version: string;
  dependencies: Record<string, string>;
};

const NO_STORE = "private, no-store";

const FUNCTION_HEADERS: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

export interface ApplicationOptions {
  /** Test hook: environment override (defaults to `process.env`). */
  env?: Record<string, string | undefined>;
  /** Test hook: additional apps visible to the gateway (fixture apps). */
  extraApps?: GalleryAppRegistration[];
}

export interface Application {
  app: Hono;
}

interface ReadinessReport {
  ready: boolean;
  reason?: string;
  apps?: string[];
}

function checkReadiness(
  env: Record<string, string | undefined>,
): ReadinessReport {
  try {
    validateRegistry();
  } catch (error) {
    return {
      ready: false,
      reason: error instanceof Error ? error.message : "registry invalid",
    };
  }
  const bundle = loadResourceBundle();
  if (bundle.state !== "ready") {
    return {
      ready: false,
      reason:
        bundle.state === "failed"
          ? `resource bundle: ${bundle.reason}`
          : "resource bundle not loaded",
    };
  }
  if (bundle.bundle.upstreamCommit !== UPSTREAM_COMMIT) {
    return {
      ready: false,
      reason: "resource bundle was built from a different upstream commit",
    };
  }
  const apps = enabledApps(env);
  const missing = apps
    .map((app) => app.slug)
    .filter((slug) => !bundle.bundle.resources[slug]);
  if (missing.length > 0) {
    return {
      ready: false,
      reason: `resource bundle is missing: ${missing.join(", ")}`,
    };
  }
  return { ready: true, apps: apps.map((app) => app.slug) };
}

export function createApplication(
  options: ApplicationOptions = {},
): Application {
  const env = options.env ?? process.env;
  const extraApps = options.extraApps ?? [];
  const app = new Hono();

  const resolveApp = (slug: string): GalleryAppRegistration | undefined => {
    const fixture = extraApps.find((candidate) => candidate.slug === slug);
    if (fixture) return fixture;
    return getEnabledApp(slug, env);
  };

  app.use("*", async (c, next) => {
    await next();
    for (const [key, value] of Object.entries(FUNCTION_HEADERS)) {
      c.res.headers.set(key, value);
    }
    if (!c.res.headers.has("cache-control")) {
      c.res.headers.set("cache-control", NO_STORE);
    }
  });

  app.get("/", (c) => {
    // The framework preset's filesystem phase matches this function at "/"
    // before any static index resolution, so the landing page is served from
    // the bundled immutable copy (assets and screenshots stay on the CDN).
    const html = getSiteHtml();
    if (!html) {
      return c.json({ error: "gallery_page_unavailable" }, 503);
    }
    c.header("cache-control", "public, max-age=300");
    return c.html(html);
  });

  app.get("/healthz", (c) => {
    // Liveness only: proves the function can respond, nothing more.
    return c.json({ ok: true, namespace: "fable" });
  });

  app.get("/readyz", (c) => {
    const report = checkReadiness(env);
    if (!report.ready) {
      logRecord({ event: "readyz", reason: report.reason, status: 503 });
      return c.json({ ready: false, reason: report.reason }, 503);
    }
    return c.json({ ready: true, apps: report.apps });
  });

  app.get("/version", (c) => {
    const sha = env.VERCEL_GIT_COMMIT_SHA ?? env.GALLERY_GIT_SHA;
    const meta = bundleMeta();
    return c.json({
      name: packageJson.name,
      implementation: "fable",
      galleryVersion: packageJson.version,
      gallerySha: sha && /^[0-9a-f]{7,40}$/.test(sha) ? sha : "unknown",
      upstream: {
        repository: UPSTREAM_REPOSITORY,
        commit: UPSTREAM_COMMIT,
      },
      protocolAdapter: {
        mcpHandler: packageJson.dependencies["mcp-handler"],
        mcpServerSdk: packageJson.dependencies["@modelcontextprotocol/server"],
        modernProtocol: "2026-07-28",
        legacyFallback: "stateless-2025",
      },
      nodeVersion: process.version,
      environment: env.VERCEL_ENV ?? "local",
      enabledApps: enabledApps(env).map((entry) => entry.slug),
      resourceBundleBuiltAt: meta?.builtAt ?? null,
    });
  });

  app.get("/apps.json", (c) => {
    const base = resolveBaseUrl(env);
    return c.json({
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      description:
        "Independent hosted adaptation of official MCP Apps examples. Not an official Model Context Protocol service.",
      baseUrl: base.origin,
      upstream: {
        repository: UPSTREAM_REPOSITORY,
        commit: UPSTREAM_COMMIT,
      },
      apps: registry.map((entry) => {
        const enabled = resolveApp(entry.slug) !== undefined;
        return {
          slug: entry.slug,
          displayName: entry.displayName,
          summary: entry.summary,
          interaction: entry.interaction,
          toolName: entry.toolName,
          resourceUri: entry.resourceUri,
          samplePrompt: entry.samplePrompt,
          dataNote: entry.dataNote,
          upstream: {
            repository: entry.upstream.repository,
            commit: entry.upstream.commit,
            path: entry.upstream.path,
          },
          enabled,
          endpoint: enabled ? endpointUrl(base.origin, entry.slug) : null,
        };
      }),
    });
  });

  app.all("/apps/:slug/mcp", (c) => {
    return handleMcpRequest(c.req.raw, c.req.param("slug"), {
      resolveApp,
      env,
    });
  });

  app.notFound((c) => c.json({ error: "not_found" }, 404));

  app.onError((error, c) => {
    logRecord({
      event: "app_error",
      reason: error instanceof Error ? error.name : "unknown",
      status: 500,
    });
    return c.json({ error: "internal_error" }, 500);
  });

  return { app };
}
