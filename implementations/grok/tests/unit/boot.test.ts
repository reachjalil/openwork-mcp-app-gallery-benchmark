import { describe, expect, it } from "vitest";
import { createGalleryApplication } from "../../src/application.js";

describe("boot failures", () => {
  it("health still works when the resource bundle is invalid", async () => {
    const gallery = createGalleryApplication({
      resourceBundle: { resources: {} },
      env: { BASE_URL: "http://127.0.0.1:8787", GALLERY_GIT_SHA: "x" },
    });
    expect(gallery.ready()).toBe(false);
    expect((await gallery.app.request("/healthz")).status).toBe(200);
    expect((await gallery.app.request("/readyz")).status).toBe(503);
  });
});
