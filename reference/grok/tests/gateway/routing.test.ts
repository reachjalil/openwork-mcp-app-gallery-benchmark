import { describe, expect, it } from "vitest";
import { REQUIRED_SLUGS } from "../../src/constants.js";
import { LEGACY_PROTOCOL, mcpPost, readMcp, testApp } from "../helpers/app.js";

describe("gateway", () => {
  it("routes six isolated MCP servers", async () => {
    const { app } = testApp();
    const names = new Set<string>();
    for (const slug of REQUIRED_SLUGS) {
      const response = await mcpPost(
        app,
        slug,
        {
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list",
          params: {},
        },
        LEGACY_PROTOCOL,
      );
      expect(response.status).toBeLessThan(500);
      const body = await readMcp(response);
      const payload = Array.isArray(body) ? body[0] : body;
      const tools =
        (payload as { result?: { tools?: Array<{ name: string }> } }).result
          ?.tools ?? [];
      expect(tools.length).toBeGreaterThan(0);
      for (const tool of tools) names.add(`${slug}:${tool.name}`);
    }
    expect(names.size).toBeGreaterThanOrEqual(6);
    const getTime = await mcpPost(
      app,
      "get-time",
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {},
      },
      LEGACY_PROTOCOL,
    );
    const listed = await readMcp(getTime);
    const payload = Array.isArray(listed) ? listed[0] : listed;
    const tools =
      (payload as { result?: { tools?: Array<{ name: string }> } }).result
        ?.tools ?? [];
    expect(tools.some((tool) => tool.name === "get-budget-data")).toBe(false);
  });

  it("returns 404 for unknown, disabled, and traversal slugs", async () => {
    const { app } = testApp({ disabledSlugs: ["transcript"] });
    for (const slug of ["nope", "transcript", "..%2fetc", "foo/bar"]) {
      const response = await app.request(`/apps/${slug}/mcp`, {
        method: "POST",
      });
      expect([404, 400, 413, 415]).toContain(response.status);
    }
  });

  it("returns 405 for DELETE", async () => {
    const { app } = testApp();
    const response = await app.request("/apps/get-time/mcp", {
      method: "DELETE",
    });
    expect(response.status).toBe(405);
  });

  it("rejects oversized requests", async () => {
    const { app } = testApp();
    const body = "x".repeat(256 * 1024 + 10);
    const response = await app.request("/apps/get-time/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "content-length": String(body.length),
      },
      body,
    });
    expect(response.status).toBe(413);
  });

  it("rejects malformed JSON without leaking internals", async () => {
    const { app } = testApp();
    const response = await app.request("/apps/get-time/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
      },
      body: "{not-json",
    });
    const text = await response.text();
    expect(
      text.includes("stack") || text.includes("at createGalleryApplication"),
    ).toBe(false);
  });

  it("contains a throwing app factory", async () => {
    const { app } = testApp({ throwingSlugs: ["cohort-heatmap"] });
    const broken = await mcpPost(
      app,
      "cohort-heatmap",
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {},
      },
      LEGACY_PROTOCOL,
    );
    expect(broken.status).toBeGreaterThanOrEqual(500);
    const healthy = await mcpPost(
      app,
      "get-time",
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {},
      },
      LEGACY_PROTOCOL,
    );
    expect(healthy.status).toBeLessThan(500);
  });

  it("serves the landing page at /", async () => {
    const { app } = testApp({
      galleryHtml:
        "<!doctype html><title>MCP Apps example gallery</title><h1>MCP Apps example gallery</h1>",
    });
    const response = await app.request("/");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.text()).toContain("MCP Apps example gallery");
  });

  it("serves health, readiness, version, and apps.json", async () => {
    const { app } = testApp();
    expect((await app.request("/healthz")).status).toBe(200);
    expect((await app.request("/readyz")).status).toBe(200);
    const version = await (await app.request("/version")).json();
    expect(version.modelNamespace).toBe("grok");
    expect(version.upstreamCommit).toMatch(/^10195ad/);
    expect(version.gallerySha).toBe("testsha");
    const apps = await (await app.request("/apps.json")).json();
    expect(apps.apps).toHaveLength(6);
  });
});
