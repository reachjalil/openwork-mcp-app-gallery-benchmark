export const REQUEST_BYTES = 256 * 1024;
export const RESULT_BYTES = 512 * 1024;
/** Official single-file React MCP Apps exceed 512 KiB after production minify. */
export const RESOURCE_BYTES = 1024 * 1024;
export const APP_DEADLINE_MS = 15_000;

export function appDeadlineMs(): number {
  const raw = process.env.GALLERY_DEADLINE_MS;
  if (!raw) return APP_DEADLINE_MS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return APP_DEADLINE_MS;
  return Math.min(APP_DEADLINE_MS, parsed);
}
export const PROVIDER_MAX_DURATION_S = 30;
export const GLOBAL_CONCURRENCY = 32;
export const DEFAULT_APP_CONCURRENCY = 8;
export const MAX_STRING_CHARS = 2048;
export const MAX_ARRAY_LENGTH = 256;
export const MAX_OBJECT_COUNT = 512;

export function utf8Bytes(value: string): number {
  return Buffer.byteLength(value, "utf8");
}

export function jsonBytes(value: unknown): number {
  return utf8Bytes(JSON.stringify(value));
}

export class Semaphore {
  private active = 0;
  private readonly waiters: Array<() => void> = [];

  constructor(private readonly max: number) {}

  async acquire(signal: AbortSignal): Promise<() => void> {
    if (signal.aborted) {
      throw new DOMException("This operation was aborted", "AbortError");
    }
    if (this.active < this.max) {
      this.active += 1;
      return () => {
        this.release();
      };
    }
    await new Promise<void>((resolve, reject) => {
      const waiter = () => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      };
      const onAbort = () => {
        const index = this.waiters.indexOf(waiter);
        if (index >= 0) this.waiters.splice(index, 1);
        reject(new DOMException("This operation was aborted", "AbortError"));
      };
      signal.addEventListener("abort", onAbort, { once: true });
      this.waiters.push(waiter);
    });
    this.active += 1;
    return () => {
      this.release();
    };
  }

  private release(): void {
    this.active = Math.max(0, this.active - 1);
    const next = this.waiters.shift();
    next?.();
  }
}

export function combineSignals(
  ...signals: Array<AbortSignal | undefined>
): AbortSignal {
  const present = signals.filter((signal): signal is AbortSignal =>
    Boolean(signal),
  );
  if (present.length === 0) return new AbortController().signal;
  if (present.length === 1) {
    const only = present[0];
    if (!only) return new AbortController().signal;
    return only;
  }
  return AbortSignal.any(present);
}

export function deadlineSignal(
  requestSignal: AbortSignal | undefined,
  timeoutMs = APP_DEADLINE_MS,
): AbortSignal {
  return combineSignals(requestSignal, AbortSignal.timeout(timeoutMs));
}
