import { afterEach, describe, expect, it } from "vitest";
import { APP_DEADLINE_MS } from "../../src/limits.js";
import { GALLERY_SECURITY_HEADERS } from "../../src/security-headers.js";
import {
  CURRENT_PROTOCOL,
  LEGACY_PROTOCOL,
  envelope,
  mcpPost,
  readMcp,
  testApp,
} from "../helpers/app.js";

describe("protocol and safety", () => {
  afterEach(() => {
    delete process.env.GALLERY_DEADLINE_MS;
  });

  it("requires Mcp-Method on 2026-07-28 requests", async () => {
    const { app } = testApp();
    const payload = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: envelope(CURRENT_PROTOCOL, {}),
    });
    const response = await app.request("/apps/get-time/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "mcp-protocol-version": CURRENT_PROTOCOL,
        "content-length": String(Buffer.byteLength(payload)),
      },
      body: payload,
    });
    expect(response.status).toBe(400);
    const body = await response.text();
    expect(body.toLowerCase()).toContain("mcp-method");
  });

  it("answers server/discover on the current protocol", async () => {
    const { app } = testApp();
    const response = await mcpPost(
      app,
      "get-time",
      {
        jsonrpc: "2.0",
        id: 1,
        method: "server/discover",
        params: envelope(CURRENT_PROTOCOL, {}),
      },
      CURRENT_PROTOCOL,
    );
    expect(response.status).toBeLessThan(500);
    const parsed = await readMcp(response);
    const payload = (Array.isArray(parsed) ? parsed[0] : parsed) as Record<
      string,
      unknown
    >;
    expect(payload.error).toBeUndefined();
    expect(payload.result).toBeTruthy();
  });

  it("treats initialize as current-protocol method-not-found rather than a crash", async () => {
    const { app } = testApp();
    const response = await mcpPost(
      app,
      "get-time",
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: envelope(CURRENT_PROTOCOL, {
          protocolVersion: CURRENT_PROTOCOL,
          capabilities: {},
          clientInfo: { name: "gallery-test", version: "1.0.0" },
        }),
      },
      CURRENT_PROTOCOL,
    );
    expect(response.status).toBeLessThan(500);
    const parsed = await readMcp(response);
    const payload = (Array.isArray(parsed) ? parsed[0] : parsed) as Record<
      string,
      unknown
    >;
    expect(payload.error).toBeTruthy();
  });

  it("rejects malformed JSON-RPC without leaking internals", async () => {
    const { app } = testApp();
    const response = await mcpPost(
      app,
      "get-time",
      { jsonrpc: "2.0", id: 1, method: 12, params: {} },
      LEGACY_PROTOCOL,
    );
    const text = await response.text();
    expect(text.includes("createGalleryApplication")).toBe(false);
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("returns 499 when the client aborts before work starts", async () => {
    const { app } = testApp();
    const controller = new AbortController();
    controller.abort();
    const response = await mcpPost(
      app,
      "get-time",
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {},
      },
      LEGACY_PROTOCOL,
      { signal: controller.signal },
    );
    expect(response.status).toBe(499);
  });

  it("times out hanging tool work within the application deadline", async () => {
    process.env.GALLERY_DEADLINE_MS = "40";
    const { app } = testApp({ hangingSlugs: ["get-time"] });
    const started = Date.now();
    const response = await mcpPost(
      app,
      "get-time",
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "get-time", arguments: {} },
      },
      LEGACY_PROTOCOL,
    );
    const elapsed = Date.now() - started;
    const text = await response.text();
    expect(elapsed).toBeLessThan(APP_DEADLINE_MS);
    expect(text).not.toContain("2026-08-17T12:00:00.000Z");
    expect(
      response.status >= 400 ||
        text.includes("aborted") ||
        text.includes("timeout") ||
        text.includes("error"),
    ).toBe(true);
  });

  it("applies gallery security headers", async () => {
    const { app } = testApp();
    const response = await app.request("/healthz");
    for (const [key, value] of Object.entries(GALLERY_SECURITY_HEADERS)) {
      expect(response.headers.get(key)).toBe(value);
    }
  });
});
