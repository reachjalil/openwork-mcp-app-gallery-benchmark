import { describe, expect, it } from "vitest";
import { endpointUrl, resolveBaseUrl } from "../../src/base-url";

describe("resolveBaseUrl", () => {
  it("prefers a valid explicit BASE_URL", () => {
    expect(resolveBaseUrl({ BASE_URL: "http://localhost:4000" })).toEqual({
      origin: "http://localhost:4000",
      source: "BASE_URL",
    });
  });

  it("rejects plain http for non-local BASE_URL", () => {
    const resolved = resolveBaseUrl({
      BASE_URL: "http://example.com",
      VERCEL_URL: "gallery.vercel.app",
    });
    expect(resolved.source).toBe("VERCEL_URL");
  });

  it("uses the production URL over branch and deployment URLs", () => {
    const resolved = resolveBaseUrl({
      VERCEL_PROJECT_PRODUCTION_URL: "gallery.vercel.app",
      VERCEL_BRANCH_URL: "branch.vercel.app",
      VERCEL_URL: "deploy.vercel.app",
    });
    expect(resolved).toEqual({
      origin: "https://gallery.vercel.app",
      source: "VERCEL_PROJECT_PRODUCTION_URL",
    });
  });

  it("falls back branch → deployment → localhost", () => {
    expect(
      resolveBaseUrl({ VERCEL_BRANCH_URL: "branch.vercel.app" }).origin,
    ).toBe("https://branch.vercel.app");
    expect(resolveBaseUrl({ VERCEL_URL: "deploy.vercel.app" }).origin).toBe(
      "https://deploy.vercel.app",
    );
    expect(resolveBaseUrl({})).toEqual({
      origin: "http://localhost:3000",
      source: "fallback",
    });
  });

  it("never trusts malformed host material", () => {
    for (const bad of [
      "evil.example/phish",
      "host with space",
      "host;drop",
      "https://user:pass@example.com",
    ]) {
      const resolved = resolveBaseUrl({ VERCEL_PROJECT_PRODUCTION_URL: bad });
      expect(resolved.source).toBe("fallback");
    }
  });

  it("builds endpoint URLs from the validated origin only", () => {
    expect(endpointUrl("https://gallery.vercel.app", "get-time")).toBe(
      "https://gallery.vercel.app/apps/get-time/mcp",
    );
  });
});
