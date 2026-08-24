import { Hono } from "hono";
import { resolveCanonicalBaseUrl } from "./base-url.js";
import {
  GALLERY_APPS,
  MODEL_NAMESPACE,
  PROTOCOL_ADAPTER_VERSION,
  UPSTREAM_COMMIT,
  parseDisabledSlugs,
} from "./catalog.js";
import { validateRegistrations } from "./apps.js";
import {
  GALLERY_CSS,
  GALLERY_CSS_PATH,
  GALLERY_JS,
  GALLERY_JS_PATH,
  publicAppsManifest,
  renderGalleryPage,
} from "./gallery-render.js";
import { createGateway } from "./gateway.js";
import { safeBuildSha } from "./observability.js";
import { validateResourceBundle } from "./resources.js";

function noStore(response: Response): Response {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export function createApplication(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): Hono {
  const app = new Hono();
  const gateway = createGateway({ environment });

  app.onError(() =>
    noStore(Response.json({ error: "Request failed safely" }, { status: 500 })),
  );
  app.get("/", (context) =>
    context.html(
      renderGalleryPage(resolveCanonicalBaseUrl(environment), environment),
    ),
  );
  app.get(GALLERY_CSS_PATH, (context) =>
    context.body(GALLERY_CSS, 200, {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    }),
  );
  app.get(GALLERY_JS_PATH, (context) =>
    context.body(GALLERY_JS, 200, {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    }),
  );
  app.get("/apps.json", (context) =>
    context.json(
      publicAppsManifest(resolveCanonicalBaseUrl(environment), environment),
      200,
      { "Cache-Control": "public, max-age=60, must-revalidate" },
    ),
  );
  app.get("/healthz", () => noStore(Response.json({ status: "ok" })));
  app.get("/readyz", () => {
    try {
      validateRegistrations();
      const resources = validateResourceBundle();
      const disabled = parseDisabledSlugs(environment.DISABLED_APP_SLUGS);
      const enabledSlugs = GALLERY_APPS.filter(
        (entry) => !disabled.has(entry.slug),
      ).map((entry) => entry.slug);
      if (
        new Set(enabledSlugs).size !== enabledSlugs.length ||
        enabledSlugs.length === 0
      )
        throw new Error("Registry is not ready");
      if (environment.VERCEL_ENV && safeBuildSha(environment) === "development")
        throw new Error("Production build metadata is missing");
      return noStore(
        Response.json({ status: "ready", enabledSlugs, ...resources }),
      );
    } catch {
      return noStore(Response.json({ status: "not-ready" }, { status: 503 }));
    }
  });
  app.get("/version", () => {
    const disabled = parseDisabledSlugs(environment.DISABLED_APP_SLUGS);
    return noStore(
      Response.json({
        gitSha: safeBuildSha(environment),
        upstreamCommit: UPSTREAM_COMMIT,
        modelNamespace: MODEL_NAMESPACE,
        protocolAdapterVersion: PROTOCOL_ADAPTER_VERSION,
        nodeVersion: process.version,
        enabledSlugs: GALLERY_APPS.filter(
          (entry) => !disabled.has(entry.slug),
        ).map((entry) => entry.slug),
        buildTime: environment.GALLERY_BUILD_TIME ?? null,
      }),
    );
  });
  app.all("/apps/:slug/mcp", (context) =>
    gateway(context.req.raw, context.req.param("slug")),
  );
  app.all("/apps/*", () =>
    noStore(Response.json({ error: "Not found" }, { status: 404 })),
  );
  app.notFound(() =>
    noStore(Response.json({ error: "Not found" }, { status: 404 })),
  );
  return app;
}

export const application = { app: createApplication() };
