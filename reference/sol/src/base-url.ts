type PublicEnvironment = Readonly<Record<string, string | undefined>>;

function validatedUrl(candidate: string, allowLocalHttp: boolean): URL {
  const url = new URL(candidate);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      "Public base URL must not contain credentials, query, or fragment",
    );
  }
  if (
    url.protocol !== "https:" &&
    !(allowLocalHttp && local && url.protocol === "http:")
  ) {
    throw new Error("Public base URL must use HTTPS outside local development");
  }
  url.pathname = url.pathname.replace(/\/+$/u, "") || "/";
  return url;
}

function vercelUrl(hostname: string): URL {
  if (!/^[a-z0-9.-]+$/u.test(hostname) || hostname.includes("..")) {
    throw new Error("Invalid Vercel system hostname");
  }
  return validatedUrl(`https://${hostname}`, false);
}

export function resolveCanonicalBaseUrl(
  environment: PublicEnvironment = process.env,
): URL {
  if (environment.BASE_URL) return validatedUrl(environment.BASE_URL, true);
  if (
    environment.VERCEL_ENV === "production" &&
    environment.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return vercelUrl(environment.VERCEL_PROJECT_PRODUCTION_URL);
  }
  if (environment.VERCEL_BRANCH_URL)
    return vercelUrl(environment.VERCEL_BRANCH_URL);
  if (environment.VERCEL_URL) return vercelUrl(environment.VERCEL_URL);
  return validatedUrl("http://127.0.0.1:4173", true);
}

export function allowedRequestHosts(
  environment: PublicEnvironment = process.env,
): ReadonlySet<string> {
  const hosts = new Set(["127.0.0.1:4173", "localhost:4173"]);
  for (const key of [
    "BASE_URL",
    "VERCEL_PROJECT_PRODUCTION_URL",
    "VERCEL_BRANCH_URL",
    "VERCEL_URL",
  ] as const) {
    const value = environment[key];
    if (!value) continue;
    try {
      const url =
        key === "BASE_URL" ? validatedUrl(value, true) : vercelUrl(value);
      hosts.add(url.host);
    } catch {
      // Invalid environment values fail base-URL generation and are never trusted here.
    }
  }
  return hosts;
}

export function allowedBrowserOrigins(
  environment: PublicEnvironment = process.env,
): ReadonlySet<string> {
  const origins = new Set<string>([
    resolveCanonicalBaseUrl(environment).origin,
  ]);
  for (const candidate of environment.ALLOWED_BROWSER_ORIGINS?.split(",") ??
    []) {
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    origins.add(validatedUrl(trimmed, true).origin);
  }
  return origins;
}
