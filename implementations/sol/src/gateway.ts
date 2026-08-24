import type { GalleryAppDefinition } from "./catalog.js";
import { appBySlug, GALLERY_APPS, parseDisabledSlugs } from "./catalog.js";
import { allowedBrowserOrigins, allowedRequestHosts } from "./base-url.js";
import { APPLICATION_DEADLINE_MS, ConcurrencyGate } from "./limits.js";
import {
  createGalleryMcpHandler,
  type McpFetchHandler,
} from "./mcp-app-adapter.js";
import {
  methodCategory,
  observeRequest,
  safeBuildSha,
} from "./observability.js";

export type GatewayOptions = {
  environment?: Readonly<Record<string, string | undefined>>;
  handlerFactory?: (app: GalleryAppDefinition) => McpFetchHandler;
  deadlineMs?: number;
};

type RequestDetails = {
  requestBytes: number;
  category: string;
  id: string | number | null;
};

function jsonError(
  status: number,
  message: string,
  id: string | number | null = null,
  headers?: HeadersInit,
): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Cache-Control", "private, no-store");
  return Response.json(
    {
      jsonrpc: "2.0",
      id,
      error: {
        code: status === 429 ? -32003 : status === 413 ? -32002 : -32000,
        message,
      },
    },
    { status, headers: responseHeaders },
  );
}

async function inspectRequest(
  request: Request,
  ceiling: number,
): Promise<RequestDetails> {
  if (request.method !== "POST")
    return {
      requestBytes: 0,
      category: request.method === "GET" ? "discover" : "other",
      id: null,
    };
  const advertised = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(advertised) && advertised > ceiling)
    throw new RangeError("request-too-large");
  const bytes = new Uint8Array(await request.clone().arrayBuffer());
  if (bytes.byteLength > ceiling) throw new RangeError("request-too-large");
  let method: unknown;
  let id: unknown;
  try {
    const body = JSON.parse(new TextDecoder().decode(bytes)) as {
      method?: unknown;
      id?: unknown;
    };
    method = body.method;
    id = body.id;
  } catch {
    // The SDK returns the bounded parser error.
  }
  return {
    requestBytes: bytes.byteLength,
    category: methodCategory(method),
    id:
      typeof id === "string" || typeof id === "number" || id === null
        ? id
        : null,
  };
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "content-type, accept, mcp-protocol-version, mcp-session-id",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

export function createGateway(
  options: GatewayOptions = {},
): (request: Request, slug: string) => Promise<Response> {
  const environment = options.environment ?? process.env;
  const handlers = new Map(
    GALLERY_APPS.map((app) => [
      app.slug,
      (options.handlerFactory ?? createGalleryMcpHandler)(app),
    ]),
  );
  const disabled = parseDisabledSlugs(environment.DISABLED_APP_SLUGS);
  const hostAllowlist = allowedRequestHosts(environment);
  const originAllowlist = allowedBrowserOrigins(environment);
  const gate = new ConcurrencyGate();

  return async (request, rawSlug) => {
    const started = performance.now();
    const slug = /^[a-z0-9-]{1,48}$/u.test(rawSlug) ? rawSlug : "";
    const app = appBySlug(slug);
    if (!app || disabled.has(app.slug))
      return jsonError(404, "MCP App endpoint not found");
    if (!hostAllowlist.has(new URL(request.url).host))
      return jsonError(421, "Request host is not allowed");

    const origin = request.headers.get("origin");
    if (origin && !originAllowlist.has(origin))
      return jsonError(403, "Browser origin is not allowed");
    if (request.method === "OPTIONS") {
      if (!origin)
        return new Response(null, {
          status: 400,
          headers: { "Cache-Control": "private, no-store" },
        });
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders(origin),
          "Cache-Control": "private, no-store",
        },
      });
    }
    if (!["GET", "POST"].includes(request.method)) {
      return jsonError(405, "Method not allowed", null, {
        Allow: "GET, POST, OPTIONS",
      });
    }

    let details: RequestDetails;
    try {
      details = await inspectRequest(request, app.requestBytes);
    } catch (error) {
      if (error instanceof RangeError)
        return jsonError(413, "Request exceeds the configured body ceiling");
      return jsonError(400, "Request inspection failed");
    }

    const release = gate.tryAcquire(app.slug, app.concurrentRequests);
    if (!release)
      return jsonError(
        429,
        "Endpoint is temporarily at its concurrency limit",
        details.id,
        { "Retry-After": "1" },
      );

    const deadline = AbortSignal.timeout(
      options.deadlineMs ?? APPLICATION_DEADLINE_MS,
    );
    const signal = AbortSignal.any([request.signal, deadline]);
    let status = 500;
    let resultBytes = 0;
    try {
      const handler = handlers.get(app.slug);
      if (!handler)
        return jsonError(503, "App registration is unavailable", details.id, {
          "Retry-After": "5",
        });
      const response = await handler(new Request(request, { signal }));
      const body = new Uint8Array(await response.arrayBuffer());
      resultBytes = body.byteLength;
      if (resultBytes > app.resultBytes)
        return jsonError(
          502,
          "Response exceeded the configured result ceiling",
          details.id,
        );
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "private, no-store");
      if (origin)
        for (const [name, value] of Object.entries(corsHeaders(origin)))
          headers.set(name, value);
      status = response.status;
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch {
      if (deadline.aborted) {
        status = 504;
        return jsonError(
          504,
          "Request exceeded the application deadline",
          details.id,
        );
      }
      if (request.signal.aborted) {
        status = 499;
        return jsonError(499, "Client cancelled the request", details.id);
      }
      status = 500;
      return jsonError(500, "MCP request failed safely", details.id);
    } finally {
      release();
      observeRequest({
        modelNamespace: "sol",
        slug: app.slug,
        methodCategory: details.category,
        status,
        durationMs: Math.round(performance.now() - started),
        requestBytes: details.requestBytes,
        resultBytes,
        buildSha: safeBuildSha(environment),
      });
    }
  };
}
