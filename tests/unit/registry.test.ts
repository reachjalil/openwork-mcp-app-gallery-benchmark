import { describe, expect, it } from "vitest";
import {
  enabledApps,
  getEnabledApp,
  registry,
  validateRegistry,
} from "../../src/registry";

describe("registry", () => {
  it("is valid and carries exactly the six Wave 1 apps", () => {
    expect(() => validateRegistry()).not.toThrow();
    expect(registry.map((app) => app.slug).sort()).toEqual([
      "budget-allocator",
      "cohort-heatmap",
      "customer-segmentation",
      "get-time",
      "scenario-modeler",
      "transcript",
    ]);
  });

  it("declares no egress and Wave 1 limits for every app", () => {
    for (const app of registry) {
      expect(app.egressOrigins).toEqual([]);
      expect(app.limits.timeoutMs).toBe(15_000);
      expect(app.limits.requestBytes).toBe(256 * 1024);
    }
  });

  it("DISABLED_APP_SLUGS removes only; unknown values are ignored", () => {
    const env = { DISABLED_APP_SLUGS: "transcript, bogus-app" };
    const slugs = enabledApps(env).map((app) => app.slug);
    expect(slugs).not.toContain("transcript");
    expect(slugs).toHaveLength(5);
    expect(getEnabledApp("transcript", env)).toBeUndefined();
    expect(getEnabledApp("get-time", env)?.slug).toBe("get-time");
  });

  it("rejects malformed slugs at lookup", () => {
    expect(getEnabledApp("../etc", {})).toBeUndefined();
    expect(getEnabledApp("GET-TIME", {})).toBeUndefined();
  });
});
