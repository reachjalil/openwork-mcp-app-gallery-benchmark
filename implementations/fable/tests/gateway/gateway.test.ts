/**
 * Gateway envelope tests: diagnostics, manifest honesty, method allowlist,
 * origin policy, malformed input, size ceilings, concurrency, deadline,
 * cancellation, and fault containment.
 */
import { describe, expect, it } from "vitest";
import { brokenApp, oversizedApp, slowApp } from "../fixtures";
import { legacyCall, legacyRequest, testApplication } from "../helpers";

describe("diagnostics", () => {
  const app = testApplication();

  it("serves the gallery page at the root from the bundled site", async () => {
    const response = await app.request("/");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    const html = await response.text();
    expect(html).toContain("MCP Apps Example Gallery");
    expect(html).toContain("Copy MCP URL");
  });

  it("healthz proves liveness only", async () => {
    const response = await app.request("/healthz");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, namespace: "fable" });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("readyz reports the six enabled apps", async () => {
    const response = await app.request("/readyz");
    expect(response.status).toBe(200);
    const body = (await response.json()) as { ready: boolean; apps: string[] };
    expect(body.ready).toBe(true);
    expect(body.apps.sort()).toEqual([
      "budget-allocator",
      "cohort-heatmap",
      "customer-segmentation",
      "get-time",
      "scenario-modeler",
      "transcript",
    ]);
  });

  it("version exposes only safe provenance", async () => {
    const response = await app.request("/version");
    expect(response.status).toBe(200);
    const raw = await response.text();
    const body = JSON.parse(raw) as Record<string, unknown>;
    expect(body.implementation).toBe("fable");
    expect(body.upstream).toMatchObject({
      commit: "10195ad91851502134930e9b80ec2c04e277a720",
    });
    expect(body.protocolAdapter).toMatchObject({
      mcpHandler: "2.1.1",
      mcpServerSdk: "2.0.0",
    });
    expect((body.enabledApps as string[]).length).toBe(6);
    // No secret-like or environment material.
    expect(raw).not.toMatch(/token|secret|password|authorization/i);
  });

  it("apps.json lists all apps with endpoints and cannot hide disabled state", async () => {
    const response = await app.request("/apps.json");
    const body = (await response.json()) as {
      apps: Array<{ slug: string; enabled: boolean; endpoint: string | null }>;
      description: string;
    };
    expect(body.apps).toHaveLength(6);
    expect(body.description.toLowerCase()).toContain(
      "independent hosted adaptation",
    );
    for (const entry of body.apps) {
      expect(entry.enabled).toBe(true);
      expect(entry.endpoint).toContain(`/apps/${entry.slug}/mcp`);
    }
  });

  it("unknown routes return bounded 404", async () => {
    const response = await app.request("/nope");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "not_found" });
  });
});

describe("disable override", () => {
  const app = testApplication({ env: { DISABLED_APP_SLUGS: "transcript" } });

  it("removes the slug from serving and shows it disabled in apps.json", async () => {
    const mcp = await legacyCall(app, "transcript", "tools/list");
    expect(mcp.status).toBe(404);

    const manifest = (await (await app.request("/apps.json")).json()) as {
      apps: Array<{ slug: string; enabled: boolean; endpoint: string | null }>;
    };
    const transcript = manifest.apps.find(
      (entry) => entry.slug === "transcript",
    );
    expect(transcript).toMatchObject({ enabled: false, endpoint: null });

    const others = await legacyCall(app, "get-time", "tools/list");
    expect(others.status).toBe(200);
  });

  it("cannot add an unreviewed app", async () => {
    const bogus = testApplication({
      env: { DISABLED_APP_SLUGS: "", ENABLED_APP_SLUGS: "evil-app" },
    });
    const response = await legacyCall(bogus, "evil-app", "tools/list");
    expect(response.status).toBe(404);
  });
});

describe("method and origin policy", () => {
  const app = testApplication({
    env: { GALLERY_ALLOWED_BROWSER_ORIGINS: "http://localhost:8080" },
  });

  it("unknown and traversal-shaped slugs return bounded 404", async () => {
    for (const slug of ["nope", "..%2F..%2Fetc", "UPPER", "a b"]) {
      const response = await app.request(`/apps/${slug}/mcp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      expect(response.status, slug).toBe(404);
      expect(await response.text()).toContain("unknown_app");
    }
  });

  it("DELETE returns 405 (stateless: no session to terminate)", async () => {
    const response = await app.request("/apps/get-time/mcp", {
      method: "DELETE",
    });
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, POST");
  });

  it("PUT and PATCH return 405", async () => {
    for (const method of ["PUT", "PATCH"]) {
      const response = await app.request("/apps/get-time/mcp", { method });
      expect(response.status).toBe(405);
    }
  });

  it("GET without a legacy session returns the handler's 405", async () => {
    const response = await app.request("/apps/get-time/mcp", {
      method: "GET",
      headers: { accept: "text/event-stream" },
    });
    expect(response.status).toBe(405);
  });

  it("OPTIONS preflight works only for allowlisted origins", async () => {
    const allowed = await app.request("/apps/get-time/mcp", {
      method: "OPTIONS",
      headers: { origin: "http://localhost:8080" },
    });
    expect(allowed.status).toBe(204);
    expect(allowed.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:8080",
    );
    expect(allowed.headers.get("access-control-allow-methods")).toBe(
      "GET, POST",
    );

    const denied = await app.request("/apps/get-time/mcp", {
      method: "OPTIONS",
      headers: { origin: "https://evil.example" },
    });
    expect(denied.status).toBe(403);
  });

  it("browser origins outside the allowlist are rejected on POST", async () => {
    const response = await legacyRequest(
      app,
      "get-time",
      { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
      { origin: "https://evil.example" },
    );
    expect(response.status).toBe(403);
  });

  it("allowlisted browser origins get CORS response headers", async () => {
    const response = await legacyRequest(
      app,
      "get-time",
      { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
      { origin: "http://localhost:8080" },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:8080",
    );
  });

  it("native clients without an Origin header stay supported", async () => {
    const noAllowlist = testApplication();
    const response = await legacyCall(noAllowlist, "get-time", "tools/list");
    expect(response.status).toBe(200);
  });
});

describe("malformed input", () => {
  const app = testApplication();

  it("malformed JSON returns -32700 without echoing input", async () => {
    const response = await legacyRequest(app, "get-time", "{not json");
    expect(response.status).toBe(400);
    expect(response.raw).toContain("-32700");
    expect(response.raw).not.toContain("{not json");
  });

  it("malformed JSON-RPC is rejected as a bounded error", async () => {
    const response = await legacyRequest(app, "get-time", {
      jsonrpc: "1.0",
      id: 1,
      method: "tools/list",
    });
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });

  it("MCP endpoints are served private, no-store", async () => {
    const response = await legacyCall(app, "get-time", "tools/list");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});

describe("size ceilings", () => {
  const app = testApplication();

  it("rejects an oversized declared body with 413", async () => {
    const response = await app.request("/apps/get-time/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": String(10 * 1024 * 1024),
      },
      body: "{}",
    });
    expect(response.status).toBe(413);
  });

  it("rejects an oversized streamed body with 413", async () => {
    const big = `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get-time","arguments":{"pad":"${"x".repeat(300 * 1024)}"}}}`;
    const response = await legacyRequest(app, "get-time", big);
    expect(response.status).toBe(413);
  });

  it("caps oversized results with a bounded JSON-RPC error", async () => {
    const withFixture = testApplication({ extraApps: [oversizedApp()] });
    const response = await legacyCall(
      withFixture,
      "fixture-oversized",
      "tools/call",
      {
        name: "blob",
        arguments: {},
      },
    );
    expect(response.status).toBe(500);
    expect(response.raw).toContain("size ceiling");
    expect(response.raw.length).toBeLessThan(2048);
  });
});

describe("deadline, concurrency, cancellation, containment", () => {
  it("enforces the per-app deadline with 504", async () => {
    const app = testApplication({
      extraApps: [slowApp({ timeoutMs: 250 })],
    });
    const started = Date.now();
    const response = await legacyCall(app, "fixture-slow", "tools/call", {
      name: "sleep",
      arguments: { ms: 5_000 },
    });
    expect(response.status).toBe(504);
    expect(Date.now() - started).toBeLessThan(3_000);
    expect(response.raw).toContain("deadline");
  });

  it("sheds load over the per-app concurrency ceiling with 429", async () => {
    const app = testApplication({
      extraApps: [slowApp({ concurrentRequests: 2 })],
    });
    const responses = await Promise.all(
      Array.from({ length: 6 }, () =>
        legacyCall(app, "fixture-slow", "tools/call", {
          name: "sleep",
          arguments: { ms: 400 },
        }),
      ),
    );
    const ok = responses.filter((response) => response.status === 200);
    const shed = responses.filter((response) => response.status === 429);
    expect(ok.length).toBeGreaterThanOrEqual(2);
    expect(shed.length).toBeGreaterThanOrEqual(1);
    for (const response of shed) {
      expect(response.headers.get("retry-after")).toBe("1");
    }
    // Semaphores must be released afterwards.
    const after = await legacyCall(app, "fixture-slow", "tools/call", {
      name: "sleep",
      arguments: { ms: 10 },
    });
    expect(after.status).toBe(200);
  });

  it("handles client cancellation and releases capacity", async () => {
    const app = testApplication({ extraApps: [slowApp()] });
    const controller = new AbortController();
    const pending = app.request("/apps/fixture-slow/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "sleep", arguments: { ms: 5_000 } },
      }),
      signal: controller.signal,
    });
    setTimeout(() => controller.abort(), 100);
    try {
      const response = await pending;
      // Hono may still surface the gateway's placeholder response.
      expect([499, 500]).toContain(response.status);
    } catch {
      // A rejected request promise is the standard abort outcome.
    }
    const after = await legacyCall(app, "fixture-slow", "tools/call", {
      name: "sleep",
      arguments: { ms: 10 },
    });
    expect(after.status).toBe(200);
  });

  it("contains a failing app registration to that app only", async () => {
    const app = testApplication({ extraApps: [brokenApp()] });
    const broken = await legacyCall(app, "fixture-broken", "tools/list");
    expect(broken.status).toBeGreaterThanOrEqual(500);
    expect(broken.raw).not.toContain("fixture registration failure");

    const healthy = await legacyCall(app, "get-time", "tools/list");
    expect(healthy.status).toBe(200);
  });
});
