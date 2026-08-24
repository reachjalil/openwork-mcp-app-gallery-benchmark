import { describe, expect, it } from "vitest";
import { createApplication } from "../../src/application.js";
import { validateResourceBundleFile } from "../../src/resources.js";

const environment = {
  BASE_URL: "http://127.0.0.1:4173",
  GALLERY_GIT_SHA: "0123456789abcdef",
};

describe("cold and warm application readiness", () => {
  it("fails closed when the immutable resource bundle is missing", () => {
    expect(() =>
      validateResourceBundleFile(
        "/definitely-missing/openwork-gallery-resources.json",
      ),
    ).toThrow();
  });

  it("validates all six resources on a cold readiness request", async () => {
    const cold = createApplication(environment);
    const response = await cold.request("/readyz");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toMatchObject({
      status: "ready",
      resourceCount: 6,
    });
  });

  it("stays healthy and provenance-stable on a warm invocation", async () => {
    const warm = createApplication(environment);
    expect((await warm.request("/healthz")).status).toBe(200);
    const first = await warm.request("/version");
    const second = await warm.request("/version");
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    const version = (await second.json()) as {
      gitSha?: unknown;
      modelNamespace?: unknown;
      enabledSlugs?: unknown;
    };
    expect(version).toMatchObject({
      gitSha: "0123456789abcdef",
      modelNamespace: "sol",
    });
    expect(version.enabledSlugs).toBeInstanceOf(Array);
  });
});
