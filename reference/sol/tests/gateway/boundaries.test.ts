import { describe, expect, it, vi } from "vitest";
import { GALLERY_APPS } from "../../src/catalog.js";
import { createGateway, type GatewayOptions } from "../../src/gateway.js";

const endpoint = "http://127.0.0.1:4173/apps/get-time/mcp";

function request(
  method: string,
  body?: string,
  headers: HeadersInit = {},
): Request {
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("accept"))
    requestHeaders.set("accept", "application/json, text/event-stream");
  if (!requestHeaders.has("content-type"))
    requestHeaders.set("content-type", "application/json");
  return new Request(endpoint, {
    method,
    body,
    headers: requestHeaders,
  });
}

function gateway(
  options: GatewayOptions = {},
): ReturnType<typeof createGateway> {
  return createGateway({
    environment: { BASE_URL: "http://127.0.0.1:4173" },
    ...options,
  });
}

describe("MCP gateway request boundaries", () => {
  it("routes GET to the stateless handler's intentional no-session response", async () => {
    const response = await gateway()(request("GET"), "get-time");
    expect(response.status).toBe(405);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("does not expose unknown, malformed, disabled, or traversal slugs", async () => {
    expect((await gateway()(request("POST", "{}"), "unknown")).status).toBe(
      404,
    );
    expect((await gateway()(request("POST", "{}"), "../get-time")).status).toBe(
      404,
    );
    const disabled = createGateway({
      environment: {
        BASE_URL: "http://127.0.0.1:4173",
        DISABLED_APP_SLUGS: "get-time",
      },
    });
    expect((await disabled(request("POST", "{}"), "get-time")).status).toBe(
      404,
    );
  });

  it("rejects spoofed hosts and browser origins", async () => {
    const badHost = new Request("http://attacker.invalid/apps/get-time/mcp", {
      method: "POST",
      body: "{}",
    });
    expect((await gateway()(badHost, "get-time")).status).toBe(421);
    expect(
      (
        await gateway()(
          request("POST", "{}", { origin: "https://attacker.invalid" }),
          "get-time",
        )
      ).status,
    ).toBe(403);
  });

  it("permits a configured CORS preflight and rejects originless preflights", async () => {
    const permitted = await gateway()(
      request("OPTIONS", undefined, { origin: "http://127.0.0.1:4173" }),
      "get-time",
    );
    expect(permitted.status).toBe(204);
    expect(permitted.headers.get("access-control-allow-origin")).toBe(
      "http://127.0.0.1:4173",
    );
    expect((await gateway()(request("OPTIONS"), "get-time")).status).toBe(400);
  });

  it("returns 405 with an explicit allowlist for other methods", async () => {
    const response = await gateway()(request("DELETE"), "get-time");
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, POST, OPTIONS");
  });

  it("rejects actual and advertised request bodies above the ceiling", async () => {
    const ceiling = GALLERY_APPS[0]!.requestBytes;
    const actual = request("POST", "x".repeat(ceiling + 1));
    expect((await gateway()(actual, "get-time")).status).toBe(413);
    const advertised = request("POST", "{}", {
      "content-length": String(ceiling + 1),
    });
    expect((await gateway()(advertised, "get-time")).status).toBe(413);
  });

  it("contains malformed JSON and malformed JSON-RPC without leaking internals", async () => {
    for (const body of [
      "{",
      JSON.stringify({ jsonrpc: "2.0", id: 7, method: "bad/method" }),
    ]) {
      const response = await gateway()(request("POST", body), "get-time");
      const text = await response.text();
      expect(text).toMatch(/"error":\{/u);
      expect(text).not.toMatch(/stack|node_modules|\/Users\//u);
    }
  });

  it("contains handler factory and response-ceiling failures", async () => {
    const failed = gateway({
      handlerFactory: () => async () =>
        Promise.reject(new Error("private detail")),
    });
    const failure = await failed(request("POST", "{}"), "get-time");
    expect(failure.status).toBe(500);
    expect(await failure.text()).not.toContain("private detail");

    const oversized = gateway({
      handlerFactory: () => async () =>
        new Response("x".repeat(GALLERY_APPS[0]!.resultBytes + 1)),
    });
    expect((await oversized(request("POST", "{}"), "get-time")).status).toBe(
      502,
    );
  });

  it("enforces the application deadline", async () => {
    const timed = gateway({
      deadlineMs: 5,
      handlerFactory: () => async (incoming) => {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(resolve, 1_000);
          incoming.signal.addEventListener("abort", () => {
            clearTimeout(timeout);
            reject(
              incoming.signal.reason instanceof Error
                ? incoming.signal.reason
                : new Error("Request aborted"),
            );
          });
        });
        return new Response("late");
      },
    });
    expect((await timed(request("POST", "{}"), "get-time")).status).toBe(504);
  });

  it("reports client cancellation distinctly", async () => {
    const controller = new AbortController();
    const cancelled = gateway({
      deadlineMs: 1_000,
      handlerFactory: () => async (incoming) => {
        controller.abort("test cancellation");
        incoming.signal.throwIfAborted();
        return new Response("unreachable");
      },
    });
    const incoming = new Request(endpoint, {
      method: "POST",
      body: "{}",
      signal: controller.signal,
    });
    expect((await cancelled(incoming, "get-time")).status).toBe(499);
  });

  it("returns retryable 429 responses above the per-app concurrency cap", async () => {
    const releases: (() => void)[] = [];
    const held = gateway({
      handlerFactory: () => async () => {
        await new Promise<void>((resolve) => releases.push(resolve));
        return Response.json({ ok: true });
      },
    });
    const requests = Array.from(
      { length: GALLERY_APPS[0]!.concurrentRequests },
      () => held(request("POST", "{}"), "get-time"),
    );
    await vi.waitFor(() =>
      expect(releases).toHaveLength(GALLERY_APPS[0]!.concurrentRequests),
    );
    const rejected = await held(request("POST", "{}"), "get-time");
    expect(rejected.status).toBe(429);
    expect(rejected.headers.get("retry-after")).toBe("1");
    releases.splice(0).forEach((release) => release());
    await Promise.all(requests);
  });
});
