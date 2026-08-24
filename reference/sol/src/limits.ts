export const DEFAULT_REQUEST_BYTES = 256 * 1024;
export const DEFAULT_RESULT_BYTES = 512 * 1024;
export const APPLICATION_DEADLINE_MS = 15_000;
export const GLOBAL_CONCURRENCY = 48;

export class ConcurrencyGate {
  #active = 0;
  readonly #perKey = new Map<string, number>();

  tryAcquire(key: string, perKeyLimit: number): (() => void) | undefined {
    const activeForKey = this.#perKey.get(key) ?? 0;
    if (this.#active >= GLOBAL_CONCURRENCY || activeForKey >= perKeyLimit)
      return undefined;
    this.#active += 1;
    this.#perKey.set(key, activeForKey + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.#active -= 1;
      const remaining = (this.#perKey.get(key) ?? 1) - 1;
      if (remaining === 0) this.#perKey.delete(key);
      else this.#perKey.set(key, remaining);
    };
  }
}

export function byteLength(value: unknown): number {
  return new TextEncoder().encode(
    typeof value === "string" ? value : JSON.stringify(value),
  ).byteLength;
}

export function assertBounded(
  value: unknown,
  ceiling: number,
  label: string,
): void {
  const size = byteLength(value);
  if (size > ceiling)
    throw new Error(`${label} exceeds the configured ${ceiling}-byte ceiling`);
}
