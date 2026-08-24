import { describe, expect, it } from "vitest";
import { resolvePublicOrigin, validatePublicOrigin } from "../../src/urls.js";
import { jsonBytes, REQUEST_BYTES, RESULT_BYTES } from "../../src/limits.js";
import { validateBundle } from "../../src/resources.js";
import { fixtureBundle, hugeBundle } from "../helpers/bundle.js";

describe("urls", () => {
  it("prefers BASE_URL then production then preview", () => {
    expect(resolvePublicOrigin({ BASE_URL: "https://example.test" })).toBe(
      "https://example.test",
    );
    expect(
      resolvePublicOrigin({
        VERCEL_ENV: "production",
        VERCEL_PROJECT_PRODUCTION_URL: "gallery.vercel.app",
      }),
    ).toBe("https://gallery.vercel.app");
    expect(resolvePublicOrigin({ VERCEL_URL: "branch.vercel.app" })).toBe(
      "https://branch.vercel.app",
    );
  });

  it("rejects credentialed origins", () => {
    expect(() => validatePublicOrigin("https://user:pass@evil.test")).toThrow();
  });
});

describe("limits", () => {
  it("keeps request and result ceilings", () => {
    expect(REQUEST_BYTES).toBe(256 * 1024);
    expect(RESULT_BYTES).toBe(512 * 1024);
    expect(jsonBytes({ ok: true })).toBeGreaterThan(0);
  });
});

describe("resources", () => {
  it("accepts a valid bundle and rejects an oversized resource", () => {
    expect(() => validateBundle(fixtureBundle())).not.toThrow();
    expect(() => validateBundle(hugeBundle())).toThrow(/too large/);
  });
});
