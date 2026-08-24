import { createMcpHandler } from "mcp-handler";
import type { Hono } from "hono";
import {
  REQUEST_BYTES,
  GLOBAL_CONCURRENCY,
  Semaphore,
  utf8Bytes,
} from "./limits.js";
import { methodCategory, safeLog } from "./observability.js";
import { htmlFor, type ResourceBundle } from "./resources.js";
import { findApp, type RuntimeApp } from "./registry.js";
import { applySecurityHeaders } from "./security-headers.js";
import { mcpUrl } from "./urls.js";

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const globalConcurrency = new Semaphore(GLOBAL_CONCURRENCY);

export type GatewayOptions = {
  apps: RuntimeApp[];
  bundle: ResourceBundle;
  publicOrigin: string;
  now: () => Date;
  allowedOrigins: string[];
};

function jsonRpcError(
  status: number,
  message: string,
  id: null | string | number = null,
) {
  const headers = new Headers({ "cache-control": "private, no-store" });
  applySecurityHeaders(headers);
  return Response.json(
    { jsonrpc: "2.0", error: { code: -32600, message }, id },
    { status, headers },
  );
}

function originAllowed(
  origin: string | undefined,
  allowed: string[],
  publicOrigin: string,
): boolean {
  if (!origin) return true;
  return allowed.includes(origin) || origin === publicOrigin;
}

export function mountGateway(app: Hono, options: GatewayOptions): void {
  app.on("OPTIONS", "/apps/:slug/mcp", (context) => {
    const origin = context.req.header("origin");
    if (!originAllowed(origin, options.allowedOrigins, options.publicOrigin)) {
      return jsonRpcError(403, "Origin not allowed");
    }
    const headers = new Headers({
      "cache-control": "private, no-store",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers":
        "content-type, accept, mcp-protocol-version, mcp-method, mcp-name",
      "access-control-max-age": "600",
    });
    if (origin) headers.set("access-control-allow-origin", origin);
    return new Response(null, { status: 204, headers });
  });

  app.on(
    "DELETE",
    "/apps/:slug/mcp",
    () =>
      new Response(null, {
        status: 405,
        headers: {
          allow: "GET, POST, OPTIONS",
          "cache-control": "private, no-store",
        },
      }),
  );

  app.on(["GET", "POST"], "/apps/:slug/mcp", async (context) => {
    const started = Date.now();
    const slug = context.req.param("slug");
    const origin = context.req.header("origin");
    if (!originAllowed(origin, options.allowedOrigins, options.publicOrigin)) {
      return jsonRpcError(403, "Origin not allowed");
    }
    if (
      !SLUG_PATTERN.test(slug) ||
      slug.includes("..") ||
      slug.includes("/") ||
      slug.includes("\\")
    ) {
      return jsonRpcError(404, "Unknown app");
    }
    const runtime = findApp(options.apps, slug);
    if (!runtime || !runtime.enabled) {
      return jsonRpcError(404, "Unknown app");
    }

    const lengthHeader = context.req.header("content-length");
    if (lengthHeader && Number(lengthHeader) > REQUEST_BYTES) {
      safeLog("rate_or_size", {
        slug,
        status: 413,
        requestBytes: Number(lengthHeader),
      });
      return jsonRpcError(413, "Request too large");
    }

    if (context.req.method === "POST") {
      const rawBody = await context.req.raw.clone().arrayBuffer();
      if (rawBody.byteLength > REQUEST_BYTES) {
        return jsonRpcError(413, "Request too large");
      }
    }

    let releaseGlobal: (() => void) | undefined;
    let releaseApp: (() => void) | undefined;
    try {
      releaseGlobal = await globalConcurrency.acquire(context.req.raw.signal);
      releaseApp = await runtime.concurrency.acquire(context.req.raw.signal);
      const resource = htmlFor(options.bundle, runtime.slug);
      const handler = createMcpHandler(
        (server) => {
          runtime.register(server, resource.html, options.now);
        },
        {
          serverInfo: { name: runtime.catalog.serverName, version: "1.0.0" },
          verboseLogs: false,
          onEvent: (event) => {
            if ("method" in event && typeof event.method === "string") {
              safeLog("mcp", {
                slug,
                methodCategory: methodCategory(event.method),
                status:
                  "status" in event && event.status === "error" ? 500 : 200,
              });
            }
          },
        },
      );
      const response = await handler(context.req.raw);
      const headers = new Headers(response.headers);
      headers.set("cache-control", "private, no-store");
      applySecurityHeaders(headers);
      safeLog("mcp_complete", {
        slug,
        status: response.status,
        durationMs: Date.now() - started,
        resultBytes: utf8Bytes(await response.clone().text()),
      });
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      const aborted =
        (error instanceof DOMException && error.name === "AbortError") ||
        context.req.raw.signal.aborted;
      if (aborted) {
        safeLog("mcp_aborted", { slug, durationMs: Date.now() - started });
        return jsonRpcError(499, "Client disconnected");
      }
      safeLog("mcp_error", {
        slug,
        status: 500,
        durationMs: Date.now() - started,
      });
      return jsonRpcError(500, "Internal server error");
    } finally {
      releaseApp?.();
      releaseGlobal?.();
    }
  });

  app.get("/apps.json", (context) => {
    const enabled = options.apps.filter((item) => item.enabled);
    return context.json(
      {
        version: 1,
        origin: options.publicOrigin,
        cachePolicy:
          "private, no-store so disabled-app state cannot be hidden by CDN cache",
        apps: enabled.map((item) => ({
          slug: item.slug,
          name: item.catalog.displayName,
          summary: item.catalog.summary,
          mcpUrl: mcpUrl(options.publicOrigin, item.slug),
          enabled: item.enabled,
        })),
      },
      200,
      { "cache-control": "private, no-store" },
    );
  });
}
