import { describe, expect, it } from "vitest";
import { Semaphore, readBoundedBody } from "../../src/limits";

describe("Semaphore", () => {
  it("caps concurrent acquisition and releases", () => {
    const semaphore = new Semaphore(2);
    expect(semaphore.tryAcquire()).toBe(true);
    expect(semaphore.tryAcquire()).toBe(true);
    expect(semaphore.tryAcquire()).toBe(false);
    semaphore.release();
    expect(semaphore.tryAcquire()).toBe(true);
  });
});

describe("readBoundedBody", () => {
  function request(
    body: string,
    headers: Record<string, string> = {},
  ): Request {
    return new Request("http://localhost/x", { method: "POST", body, headers });
  }

  it("accepts bodies under the limit", async () => {
    const result = await readBoundedBody(request("hello"), 1024);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(new TextDecoder().decode(result.body)).toBe("hello");
    }
  });

  it("rejects over-limit declared content-length without reading", async () => {
    const result = await readBoundedBody(
      request("tiny", { "content-length": "99999" }),
      1024,
    );
    expect(result).toEqual({ ok: false, reason: "too-large" });
  });

  it("rejects over-limit streamed bodies", async () => {
    const result = await readBoundedBody(request("x".repeat(2048)), 1024);
    expect(result).toEqual({ ok: false, reason: "too-large" });
  });
});
