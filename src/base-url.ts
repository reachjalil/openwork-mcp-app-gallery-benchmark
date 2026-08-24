/**
 * Canonical public base-URL resolution.
 *
 * Copyable endpoint URLs are derived only from validated configuration:
 *
 * 1. explicit `BASE_URL` (local development and tunnels);
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` (canonical production origin);
 * 3. `VERCEL_BRANCH_URL`, then `VERCEL_URL` (preview deployments).
 *
 * Request `Host` and forwarded-host headers are never consulted: an
 * arbitrary client header must not be able to steer the URLs the gallery
 * tells people to copy.
 */

const HOSTNAME_PATTERN =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

function validateAbsoluteBaseUrl(raw: string): string | undefined {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
  // Plain http is only acceptable for explicit local development overrides.
  if (
    url.protocol === "http:" &&
    url.hostname !== "localhost" &&
    url.hostname !== "127.0.0.1"
  ) {
    return undefined;
  }
  if (!HOSTNAME_PATTERN.test(url.hostname) && url.hostname !== "127.0.0.1") {
    return undefined;
  }
  if (url.username || url.password || url.search || url.hash) return undefined;
  return url.origin;
}

function validateVercelHost(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const host = raw.trim().toLowerCase();
  if (!HOSTNAME_PATTERN.test(host)) return undefined;
  return `https://${host}`;
}

export interface ResolvedBaseUrl {
  /** Origin used for copyable/canonical URLs, e.g. `https://example.vercel.app`. */
  origin: string;
  /** Which configuration source produced the origin. */
  source:
    | "BASE_URL"
    | "VERCEL_PROJECT_PRODUCTION_URL"
    | "VERCEL_BRANCH_URL"
    | "VERCEL_URL"
    | "fallback";
}

export function resolveBaseUrl(
  env: Record<string, string | undefined> = process.env,
): ResolvedBaseUrl {
  if (env.BASE_URL) {
    const origin = validateAbsoluteBaseUrl(env.BASE_URL);
    if (origin) return { origin, source: "BASE_URL" };
  }
  const production = validateVercelHost(env.VERCEL_PROJECT_PRODUCTION_URL);
  if (production) {
    return { origin: production, source: "VERCEL_PROJECT_PRODUCTION_URL" };
  }
  const branch = validateVercelHost(env.VERCEL_BRANCH_URL);
  if (branch) return { origin: branch, source: "VERCEL_BRANCH_URL" };
  const deployment = validateVercelHost(env.VERCEL_URL);
  if (deployment) return { origin: deployment, source: "VERCEL_URL" };
  return { origin: "http://localhost:3000", source: "fallback" };
}

export function endpointUrl(origin: string, slug: string): string {
  return `${origin}/apps/${slug}/mcp`;
}
