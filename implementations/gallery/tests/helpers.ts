/**
 * Shared test helpers: application construction, modern (2026-07-28) and
 * legacy (2025-era stateless) protocol request builders, and SSE parsing.
 */
import type { Hono } from "hono";
import { createApplication } from "../src/application";
import type { GalleryAppRegistration } from "../src/registry";

export const RESOURCE_MIME = "text/html;profile=mcp-app";

export interface TestApplicationOptions {
  env?: Record<string, string | undefined>;
  extraApps?: GalleryAppRegistration[];
}

export function testApplication(options: TestApplicationOptions = {}): Hono {
  return createApplication({
    env: { ...process.env, ...options.env },
    extraApps: options.extraApps,
  }).app;
}

export const MODERN_PROTOCOL = "2026-07-28";

const MODERN_ENVELOPE = {
  "io.modelcontextprotocol/protocolVersion": MODERN_PROTOCOL,
  "io.modelcontextprotocol/clientCapabilities": {
    extensions: {
      "io.modelcontextprotocol/ui": { mimeTypes: [RESOURCE_MIME] },
    },
  },
};

export interface JsonRpcResponse {
  status: number;
  contentType: string | null;
  body: Record<string, unknown> | null;
  raw: string;
  headers: Headers;
}

function firstSseData(text: string): string | null {
  for (const line of text.split("\n")) {
    if (line.startsWith("data: ")) return line.slice("data: ".length);
  }
  return null;
}

async function decodeResponse(response: Response): Promise<JsonRpcResponse> {
  const raw = await response.text();
  const contentType = response.headers.get("content-type");
  let body: Record<string, unknown> | null = null;
  try {
    const payload = contentType?.includes("text/event-stream")
      ? firstSseData(raw)
      : raw;
    if (payload) body = JSON.parse(payload) as Record<string, unknown>;
  } catch {
    body = null;
  }
  return {
    status: response.status,
    contentType,
    body,
    raw,
    headers: response.headers,
  };
}

let requestId = 0;

/** Modern-era request: per-request envelope plus the cross-check headers. */
export async function modernRequest(
  app: Hono,
  slug: string,
  method: string,
  params: Record<string, unknown> = {},
  options: { name?: string; headers?: Record<string, string> } = {},
): Promise<JsonRpcResponse> {
  requestId += 1;
  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    "mcp-protocol-version": MODERN_PROTOCOL,
    "mcp-method": method,
    ...options.headers,
  };
  if (options.name) headers["mcp-name"] = options.name;
  const response = await app.request(`/apps/${slug}/mcp`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: requestId,
      method,
      params: { ...params, _meta: MODERN_ENVELOPE },
    }),
  });
  return decodeResponse(response);
}

/** Legacy 2025-era stateless request (SSE-framed responses). */
export async function legacyRequest(
  app: Hono,
  slug: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<JsonRpcResponse> {
  const response = await app.request(`/apps/${slug}/mcp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return decodeResponse(response);
}

export async function legacyInitialize(
  app: Hono,
  slug: string,
  protocolVersion = "2025-11-25",
): Promise<JsonRpcResponse> {
  requestId += 1;
  return legacyRequest(app, slug, {
    jsonrpc: "2.0",
    id: requestId,
    method: "initialize",
    params: {
      protocolVersion,
      capabilities: {
        extensions: {
          "io.modelcontextprotocol/ui": { mimeTypes: [RESOURCE_MIME] },
        },
      },
      clientInfo: { name: "gallery-contract-tests", version: "1.0.0" },
    },
  });
}

export async function legacyCall(
  app: Hono,
  slug: string,
  method: string,
  params: Record<string, unknown> = {},
): Promise<JsonRpcResponse> {
  requestId += 1;
  return legacyRequest(app, slug, {
    jsonrpc: "2.0",
    id: requestId,
    method,
    params,
  });
}

export function resultOf(response: JsonRpcResponse): Record<string, unknown> {
  if (!response.body || typeof response.body.result !== "object") {
    throw new Error(
      `expected a JSON-RPC result, got status ${response.status}: ${response.raw.slice(0, 300)}`,
    );
  }
  return response.body.result as Record<string, unknown>;
}
