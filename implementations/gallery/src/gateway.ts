/**
 * Path-routed MCP gateway.
 *
 * Each registry app is mounted as its own `mcp-handler` 2.x handler (SDK v2,
 * stateless), created lazily and cached per instance. The gateway owns the
 * public-runtime envelope in front of the handler: method allowlist, origin
 * policy, request-size ceiling, per-app and global concurrency, the 15-second
 * application deadline with abort propagation, the response-size ceiling, and
 * sanitized logging. Failures never expose stack traces or echo user input.
 */
import { createMcpHandler } from "mcp-handler";
import { logRecord } from "./observability.js";
import type { GalleryAppRegistration } from "./registry.js";
import {
  MAX_RESOURCE_RESPONSE_BYTES,
  appSemaphore,
  globalSemaphore,
  readBoundedBody,
} from "./limits.js";

type FetchHandler = (request: Request) => Promise<Response>;

const handlerCache = new Map<string, FetchHandler>();

function handlerFor(app: GalleryAppRegistration): FetchHandler {
  let handler = handlerCache.get(app.slug);
  if (!handler) {
    handler = createMcpHandler(
      (server) => {
        app.register(server);
      },
      {
        serverInfo: { name: app.serverName, version: app.serverVersion },
        // Wave 1 serves bounded request/response exchanges only; listen-class
        // subscription streams are rejected before any SSE stream opens.
        maxSubscriptions: 0,
      },
    );
    handlerCache.set(app.slug, handler);
  }
  return handler;
}

/** Test hook: drop cached handlers (e.g. after simulating registration failures). */
export function resetHandlerCacheForTest(): void {
  handlerCache.clear();
}

const KNOWN_METHODS = new Set([
  "initialize",
  "notifications/initialized",
  "notifications/cancelled",
  "ping",
  "server/discover",
  "tools/list",
  "tools/call",
  "resources/list",
  "resources/read",
  "resources/templates/list",
  "prompts/list",
  "subscriptions/listen",
]);

interface ParsedBodyInfo {
  method: string;
  id: string | number | null;
}

function parseBodyInfo(body: Uint8Array): ParsedBodyInfo {
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(body));
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      const record = parsed as Record<string, unknown>;
      const method =
        typeof record.method === "string" && KNOWN_METHODS.has(record.method)
          ? record.method
          : "unknown";
      const id =
        typeof record.id === "string" || typeof record.id === "number"
          ? record.id
          : null;
      return { method, id };
    }
  } catch {
    // Malformed JSON is the handler's -32700 to report; log only the category.
  }
  return { method: "unknown", id: null };
}

const BASE_HEADERS: Record<string, string> = {
  "cache-control": "private, no-store",
  "x-content-type-options": "nosniff",
};

function jsonRpcError(
  status: number,
  code: number,
  message: string,
  id: string | number | null,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", error: { code, message }, id }),
    {
      status,
      headers: {
        "content-type": "application/json",
        ...BASE_HEADERS,
        ...extraHeaders,
      },
    },
  );
}

function allowedBrowserOrigins(
  env: Record<string, string | undefined>,
): Set<string> {
  const raw = env.GALLERY_ALLOWED_BROWSER_ORIGINS ?? "";
  return new Set(
    raw
      .split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
  );
}

const CORS_ALLOWED_HEADERS =
  "content-type, accept, authorization, last-event-id, mcp-session-id, mcp-protocol-version, mcp-method, mcp-name";

function corsHeaders(origin: string): Record<string, string> {
  return {
    "access-control-allow-origin": origin,
    "access-control-expose-headers": "mcp-session-id, mcp-protocol-version",
    vary: "Origin",
  };
}

export interface GatewayOptions {
  resolveApp: (slug: string) => GalleryAppRegistration | undefined;
  env?: Record<string, string | undefined>;
}

/**
 * Serve one MCP request for `/apps/:slug/mcp`.
 */
export async function handleMcpRequest(
  request: Request,
  slug: string,
  options: GatewayOptions,
): Promise<Response> {
  const env = options.env ?? process.env;
  const started = Date.now();
  const method = request.method.toUpperCase();

  const app = options.resolveApp(slug);
  if (!app) {
    logRecord({
      event: "gateway_rejected",
      reason: "unknown-or-disabled-app",
      status: 404,
    });
    return new Response(JSON.stringify({ error: "unknown_app" }), {
      status: 404,
      headers: { "content-type": "application/json", ...BASE_HEADERS },
    });
  }

  const origins = allowedBrowserOrigins(env);
  const origin = request.headers.get("origin");
  const originAllowed = origin !== null && origins.has(origin);

  if (method === "OPTIONS") {
    // Bounded preflight, only for explicitly allowlisted browser origins.
    if (!originAllowed) {
      return jsonRpcError(403, -32000, "Origin not allowed.", null);
    }
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders(origin),
        "access-control-allow-methods": "GET, POST",
        "access-control-allow-headers": CORS_ALLOWED_HEADERS,
        "access-control-max-age": "600",
        ...BASE_HEADERS,
      },
    });
  }

  if (method === "DELETE") {
    // Stateless serving: there is no server-side session to terminate.
    return jsonRpcError(405, -32000, "Method not allowed.", null, {
      allow: "GET, POST",
    });
  }

  if (method !== "GET" && method !== "POST") {
    return jsonRpcError(405, -32000, "Method not allowed.", null, {
      allow: "GET, POST",
    });
  }

  if (origin !== null && !originAllowed) {
    // Native MCP clients send no Origin; browser callers need the allowlist.
    logRecord({
      event: "gateway_rejected",
      slug: app.slug,
      reason: "origin-not-allowed",
      status: 403,
    });
    return jsonRpcError(403, -32000, "Origin not allowed.", null);
  }

  let body = new Uint8Array<ArrayBuffer>(new ArrayBuffer(0));
  if (method === "POST") {
    const bounded = await readBoundedBody(request, app.limits.requestBytes);
    if (!bounded.ok) {
      const status = bounded.reason === "too-large" ? 413 : 400;
      logRecord({
        event: "mcp_request",
        slug: app.slug,
        method: "unknown",
        status,
        durationMs: Date.now() - started,
        requestBytes: 0,
        resultBytes: 0,
        outcome: "over-limit",
      });
      return jsonRpcError(
        status,
        -32000,
        bounded.reason === "too-large"
          ? "Request body exceeds the gallery size ceiling."
          : "Request body could not be read.",
        null,
      );
    }
    body = bounded.body;
  }
  const bodyInfo = parseBodyInfo(body);

  const perApp = appSemaphore(app.slug, app.limits.concurrentRequests);
  if (!globalSemaphore.tryAcquire()) {
    return overloaded(app.slug, bodyInfo, started, body.byteLength);
  }
  if (!perApp.tryAcquire()) {
    globalSemaphore.release();
    return overloaded(app.slug, bodyInfo, started, body.byteLength);
  }

  const deadline = AbortSignal.timeout(app.limits.timeoutMs);
  const signal = AbortSignal.any([request.signal, deadline]);

  try {
    const upstreamRequest = new Request(request.url, {
      method,
      headers: request.headers,
      body: method === "POST" ? body : undefined,
      signal,
    });

    const handler = handlerFor(app);
    const response = await raceWithSignal(handler(upstreamRequest), signal);
    // Responses are bounded (subscriptions are disabled), so buffering both
    // enforces the result ceiling and produces honest byte counts.
    const payload = await raceWithSignal(response.arrayBuffer(), signal);

    // resources/read carries the bundled App HTML, which has its own larger
    // (still hard-bounded) ceiling; every other response keeps the tool
    // result ceiling.
    const responseCeiling =
      bodyInfo.method === "resources/read"
        ? MAX_RESOURCE_RESPONSE_BYTES
        : app.limits.resultBytes;
    if (payload.byteLength > responseCeiling) {
      logRecord({
        event: "mcp_request",
        slug: app.slug,
        method: bodyInfo.method,
        status: 500,
        durationMs: Date.now() - started,
        requestBytes: body.byteLength,
        resultBytes: payload.byteLength,
        outcome: "over-limit",
      });
      return jsonRpcError(
        500,
        -32603,
        "Result exceeds the gallery size ceiling.",
        bodyInfo.id,
      );
    }

    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    const sessionId = response.headers.get("mcp-session-id");
    if (sessionId) headers.set("mcp-session-id", sessionId);
    const protocolVersion = response.headers.get("mcp-protocol-version");
    if (protocolVersion) headers.set("mcp-protocol-version", protocolVersion);
    const allow = response.headers.get("allow");
    if (allow) headers.set("allow", allow);
    for (const [key, value] of Object.entries(BASE_HEADERS)) {
      headers.set(key, value);
    }
    if (originAllowed && origin) {
      for (const [key, value] of Object.entries(corsHeaders(origin))) {
        headers.set(key, value);
      }
    }

    logRecord({
      event: "mcp_request",
      slug: app.slug,
      method: bodyInfo.method,
      status: response.status,
      durationMs: Date.now() - started,
      requestBytes: body.byteLength,
      resultBytes: payload.byteLength,
      outcome: response.ok ? "ok" : "error",
    });

    return new Response(payload.byteLength > 0 ? payload : null, {
      status: response.status,
      headers,
    });
  } catch (error) {
    if (deadline.aborted) {
      logRecord({
        event: "mcp_request",
        slug: app.slug,
        method: bodyInfo.method,
        status: 504,
        durationMs: Date.now() - started,
        requestBytes: body.byteLength,
        resultBytes: 0,
        outcome: "timeout",
      });
      return jsonRpcError(
        504,
        -32001,
        "Request deadline exceeded.",
        bodyInfo.id,
      );
    }
    if (request.signal.aborted) {
      // Client went away; the response is never delivered, but return a
      // bounded placeholder so the runtime can settle cleanly.
      return jsonRpcError(499, -32000, "Client closed request.", bodyInfo.id);
    }
    logRecord({
      event: "app_error",
      slug: app.slug,
      reason: error instanceof Error ? error.name : "unknown",
      status: 500,
    });
    return jsonRpcError(500, -32603, "Internal error.", bodyInfo.id);
  } finally {
    perApp.release();
    globalSemaphore.release();
  }
}

function overloaded(
  slug: string,
  bodyInfo: ParsedBodyInfo,
  started: number,
  requestBytes: number,
): Response {
  logRecord({
    event: "mcp_request",
    slug,
    method: bodyInfo.method,
    status: 429,
    durationMs: Date.now() - started,
    requestBytes,
    resultBytes: 0,
    outcome: "concurrency",
  });
  return jsonRpcError(
    429,
    -32000,
    "Too many concurrent requests. Retry shortly.",
    bodyInfo.id,
    { "retry-after": "1" },
  );
}

async function raceWithSignal<T>(
  work: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  let onAbort: (() => void) | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        onAbort = () => reject(new DOMException("Aborted", "AbortError"));
        signal.addEventListener("abort", onAbort, { once: true });
      }),
    ]);
  } finally {
    if (onAbort) signal.removeEventListener("abort", onAbort);
  }
}
