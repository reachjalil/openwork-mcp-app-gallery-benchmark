/**
 * Missing-resource boot failure: when the bundled resource store is absent,
 * readiness stays red and app resource reads fail with a bounded error while
 * liveness keeps responding. Runs in its own file (fork-isolated) because it
 * changes the process working directory.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { resetResourceBundleForTest } from "../../src/resources";
import { legacyCall, testApplication } from "../helpers";

const originalCwd = process.cwd();

describe("missing resource bundle at boot", () => {
  beforeAll(() => {
    // Point the loader at a path that cannot exist (fork-isolated file).
    process.env.GALLERY_RESOURCE_BUNDLE_PATH = path.join(
      mkdtempSync(path.join(tmpdir(), "gallery-bootfail-")),
      "missing.json",
    );
    resetResourceBundleForTest();
  });

  afterAll(() => {
    delete process.env.GALLERY_RESOURCE_BUNDLE_PATH;
    resetResourceBundleForTest();
  });

  it("healthz stays green, readyz goes red, resource reads fail bounded", async () => {
    const app = testApplication();

    const health = await app.request("/healthz");
    expect(health.status).toBe(200);

    const ready = await app.request("/readyz");
    expect(ready.status).toBe(503);
    const readyBody = (await ready.json()) as {
      ready: boolean;
      reason: string;
    };
    expect(readyBody.ready).toBe(false);
    expect(readyBody.reason).toContain("resource bundle");

    // Tool listing still works (registration is resource-independent)…
    const list = await legacyCall(app, "get-time", "tools/list");
    expect(list.status).toBe(200);

    // …but the resource read fails with a bounded, non-leaking error.
    const read = await legacyCall(app, "get-time", "resources/read", {
      uri: "ui://get-time/mcp-app.html",
    });
    expect(read.body?.error).toBeDefined();
    expect(read.raw).not.toContain(originalCwd);
  });
});
