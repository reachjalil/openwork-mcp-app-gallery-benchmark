import {
  CLIENT_CAPABILITIES_META_KEY,
  CLIENT_INFO_META_KEY,
  PROTOCOL_VERSION_META_KEY,
} from "@modelcontextprotocol/server";
import { createGalleryApplication } from "../../src/application.js";
import { fixtureBundle } from "./bundle.js";

export const CURRENT_PROTOCOL = "2026-07-28";
export const LEGACY_PROTOCOL = "2025-03-26";

export function testApp(
  overrides: Parameters<typeof createGalleryApplication>[0] = {},
) {
  return createGalleryApplication({
    ...overrides,
    resourceBundle: overrides.resourceBundle ?? fixtureBundle(),
    env: {
      BASE_URL: "http://127.0.0.1:8787",
      GALLERY_GIT_SHA: "testsha",
      BUILD_TIME: "2026-08-17T00:00:00Z",
      ...overrides.env,
    },
    now: overrides.now ?? (() => new Date("2026-08-17T12:00:00.000Z")),
  });
}

export function envelope(
  protocol: string,
  params: Record<string, unknown> = {},
): Record<string, unknown> {
  if (protocol !== CURRENT_PROTOCOL) return params;
  return {
    ...params,
    _meta: {
      [PROTOCOL_VERSION_META_KEY]: protocol,
      [CLIENT_CAPABILITIES_META_KEY]: {},
      [CLIENT_INFO_META_KEY]: { name: "gallery-test", version: "1.0.0" },
    },
  };
}

function mcpHeaders(
  body: unknown,
  protocolVersion: string,
  payload: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    "mcp-protocol-version": protocolVersion,
    "content-length": String(Buffer.byteLength(payload)),
  };
  if (
    protocolVersion !== CURRENT_PROTOCOL ||
    !body ||
    typeof body !== "object"
  ) {
    return headers;
  }
  const record = body as {
    method?: unknown;
    params?: { name?: unknown; uri?: unknown };
  };
  if (typeof record.method === "string") {
    headers["mcp-method"] = record.method;
  }
  const name = record.params?.name;
  const uri = record.params?.uri;
  if (typeof name === "string") headers["mcp-name"] = name;
  else if (typeof uri === "string") headers["mcp-name"] = uri;
  return headers;
}

export async function mcpPost(
  app: ReturnType<typeof createGalleryApplication>["app"],
  slug: string,
  body: unknown,
  protocolVersion = CURRENT_PROTOCOL,
  init: { signal?: AbortSignal } = {},
) {
  const payload = JSON.stringify(body);
  return app.request(`/apps/${slug}/mcp`, {
    method: "POST",
    headers: mcpHeaders(body, protocolVersion, payload),
    body: payload,
    signal: init.signal,
  });
}

export async function readMcp(response: Response): Promise<unknown> {
  const text = await response.text();
  const type = response.headers.get("content-type") ?? "";
  if (type.includes("text/event-stream")) {
    const blocks = text
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .filter((line) => line && line !== "[DONE]");
    return blocks.map((line) => JSON.parse(line) as unknown);
  }
  return JSON.parse(text) as unknown;
}
