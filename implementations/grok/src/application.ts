import { Hono } from "hono";
import { CATALOG } from "./catalog.js";
import {
  MODEL_NAMESPACE,
  PROTOCOL_ADAPTER_VERSION,
  REQUIRED_SLUGS,
  UPSTREAM_COMMIT,
} from "./constants.js";
import { mountGateway } from "./gateway.js";
import { loadGalleryHtml } from "./gallery-page.js";
import { createRegistry, parseDisabledSlugs } from "./registry.js";
import { loadResourceBundle, type ResourceBundle } from "./resources.js";
import { applySecurityHeaders } from "./security-headers.js";
import { mcpUrl, resolvePublicOrigin } from "./urls.js";

export type ApplicationOptions = {
  env?: NodeJS.ProcessEnv;
  resourceBundle?: ResourceBundle;
  galleryHtml?: string;
  disabledSlugs?: Iterable<string>;
  throwingSlugs?: Iterable<string>;
  hangingSlugs?: Iterable<string>;
  now?: () => Date;
};

export type GalleryApplication = {
  app: Hono;
  ready: () => boolean;
  publicOrigin: string;
};

export function createGalleryApplication(
  options: ApplicationOptions = {},
): GalleryApplication {
  const env = options.env ?? process.env;
  const now = options.now ?? (() => new Date());
  const publicOrigin = resolvePublicOrigin(env);
  const app = new Hono();
  app.use("*", async (context, next) => {
    await next();
    applySecurityHeaders(context.res.headers);
  });
  let bundleError: string | undefined;
  let bundle: ResourceBundle | undefined;
  try {
    bundle = loadResourceBundle(options.resourceBundle);
  } catch (error) {
    bundleError =
      error instanceof Error ? error.message : "resource bundle failed";
  }

  const disabled = new Set([
    ...parseDisabledSlugs(env.DISABLED_APP_SLUGS),
    ...(options.disabledSlugs ?? []),
  ]);
  const apps = createRegistry({
    disabledSlugs: disabled,
    throwingSlugs: options.throwingSlugs,
    hangingSlugs: options.hangingSlugs,
  });
  const unique = new Set(apps.map((item) => item.slug));
  const registryValid =
    unique.size === REQUIRED_SLUGS.length &&
    REQUIRED_SLUGS.every((slug) => unique.has(slug));

  const ready = () =>
    Boolean(bundle) &&
    !bundleError &&
    registryValid &&
    Boolean(envProvenance(env).sha);

  let galleryHtml: string | undefined = options.galleryHtml;
  let galleryError: string | undefined;
  if (galleryHtml === undefined) {
    try {
      galleryHtml = loadGalleryHtml();
    } catch (error) {
      galleryError =
        error instanceof Error ? error.message : "gallery html failed";
    }
  }

  app.get("/", (context) => {
    if (!galleryHtml) {
      return context.text(galleryError ?? "gallery html missing", 503, {
        "cache-control": "private, no-store",
      });
    }
    return context.html(galleryHtml, 200, {
      "cache-control": "private, no-store",
    });
  });

  app.get("/healthz", (context) =>
    context.json({ ok: true }, 200, { "cache-control": "private, no-store" }),
  );

  app.get("/readyz", (context) => {
    if (!ready() || !bundle) {
      return context.json(
        { ok: false, error: bundleError ?? "not ready" },
        503,
        { "cache-control": "private, no-store" },
      );
    }
    return context.json(
      {
        ok: true,
        enabled: apps.filter((item) => item.enabled).map((item) => item.slug),
      },
      200,
      { "cache-control": "private, no-store" },
    );
  });

  app.get("/version", (context) => {
    const provenance = envProvenance(env);
    return context.json(
      {
        gallerySha: provenance.sha,
        upstreamCommit: UPSTREAM_COMMIT,
        modelNamespace: MODEL_NAMESPACE,
        protocolAdapterVersion: PROTOCOL_ADAPTER_VERSION,
        nodeVersion: process.version,
        enabledSlugs: apps
          .filter((item) => item.enabled)
          .map((item) => item.slug),
        buildTime: provenance.buildTime,
      },
      200,
      { "cache-control": "private, no-store" },
    );
  });

  if (bundle) {
    mountGateway(app, {
      apps,
      bundle,
      publicOrigin,
      now,
      allowedOrigins: (env.ALLOWED_BROWSER_ORIGINS ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
  } else {
    app.get("/apps.json", (context) =>
      context.json({ version: 1, origin: publicOrigin, apps: [] }, 503, {
        "cache-control": "private, no-store",
      }),
    );
  }

  return { app, ready, publicOrigin };
}

function envProvenance(env: NodeJS.ProcessEnv): {
  sha: string;
  buildTime?: string;
} {
  const sha =
    env.VERCEL_GIT_COMMIT_SHA ??
    env.GITHUB_SHA ??
    env.GALLERY_GIT_SHA ??
    "development";
  return { sha, buildTime: env.BUILD_TIME };
}

export function catalogUrls(origin: string) {
  return CATALOG.map((entry) => ({
    slug: entry.slug,
    mcpUrl: mcpUrl(origin, entry.slug),
  }));
}
