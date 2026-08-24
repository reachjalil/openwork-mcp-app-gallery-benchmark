/**
 * Wave 1 runtime limits and bounded-resource helpers.
 *
 * These bounds are per instance. Fluid compute may run several instances, so
 * the in-process concurrency semaphores are a local backstop, not a globally
 * authoritative rate limiter; the platform edge (Vercel Firewall rate
 * limiting) owns the global anonymous-abuse control.
 */

/** Default maximum accepted MCP request body, in bytes (256 KiB). */
export const MAX_REQUEST_BYTES = 256 * 1024;

/** Ceiling for a serialized MCP tool/list response, in bytes (512 KiB). */
export const MAX_RESULT_BYTES = 512 * 1024;

/**
 * Ceiling for a bundled MCP App UI resource, in bytes (1 MiB).
 *
 * Recorded deviation from the initial 512 KiB plan value: the official React
 * examples at the pinned upstream commit build to ~531 KiB of single-file
 * HTML (React + the ext-apps App bridge, which carries its Zod message
 * schemas), so the plan's pre-build guess is smaller than the real official
 * artifacts. The ceiling stays hard-bounded at 1 MiB.
 */
export const MAX_RESOURCE_BYTES = 1024 * 1024;

/**
 * Ceiling for a serialized `resources/read` response: the resource ceiling
 * plus JSON-escaping and JSON-RPC/SSE envelope overhead.
 */
export const MAX_RESOURCE_RESPONSE_BYTES = MAX_RESOURCE_BYTES + 256 * 1024;

/** Wave 1 application deadline per request (the platform hard stop is 30 s). */
export const REQUEST_DEADLINE_MS = 15_000;

/** Per-instance ceiling for concurrently served MCP requests, all apps. */
export const GLOBAL_MAX_CONCURRENT = 32;

/** Per-instance, per-app ceiling for concurrently served MCP requests. */
export const APP_MAX_CONCURRENT = 8;

/** Non-blocking counting semaphore; over-limit acquisition fails immediately. */
export class Semaphore {
  private active = 0;

  constructor(private readonly capacity: number) {}

  tryAcquire(): boolean {
    if (this.active >= this.capacity) return false;
    this.active += 1;
    return true;
  }

  release(): void {
    if (this.active > 0) this.active -= 1;
  }

  get inFlight(): number {
    return this.active;
  }
}

export const globalSemaphore = new Semaphore(GLOBAL_MAX_CONCURRENT);

const appSemaphores = new Map<string, Semaphore>();

export function appSemaphore(slug: string, capacity: number): Semaphore {
  // Key by slug AND capacity: registry limits are static per deployment, but
  // a capacity change (e.g. a test fixture) must never reuse a stale ceiling.
  const key = `${slug}:${capacity}`;
  let semaphore = appSemaphores.get(key);
  if (!semaphore) {
    semaphore = new Semaphore(capacity);
    appSemaphores.set(key, semaphore);
  }
  return semaphore;
}

export type BoundedBodyResult =
  | { ok: true; body: Uint8Array<ArrayBuffer> }
  | { ok: false; reason: "too-large" | "read-error" };

/**
 * Read a request body while enforcing a byte ceiling. Declared
 * `Content-Length` is checked first; the streamed read enforces the same
 * ceiling for chunked or mis-declared bodies.
 */
export async function readBoundedBody(
  request: Request,
  limit: number,
): Promise<BoundedBodyResult> {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    const length = Number(declared);
    if (Number.isFinite(length) && length > limit) {
      return { ok: false, reason: "too-large" };
    }
  }
  if (!request.body) return { ok: true, body: new Uint8Array(0) };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        return { ok: false, reason: "too-large" };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, reason: "read-error" };
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, body };
}
