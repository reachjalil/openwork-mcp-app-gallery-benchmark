const HOST_PATTERN =
  /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;

export function validatePublicOrigin(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Public origin must be http or https");
  }
  if (url.username || url.password) {
    throw new Error("Public origin must not include credentials");
  }
  if (!HOST_PATTERN.test(url.hostname)) {
    throw new Error("Public origin hostname is invalid");
  }
  url.hash = "";
  url.search = "";
  if (url.pathname === "/") url.pathname = "";
  return url;
}

export function resolvePublicOrigin(env: NodeJS.ProcessEnv): string {
  const explicit = env.BASE_URL?.trim();
  if (explicit) return validatePublicOrigin(explicit).origin;

  const production = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const vercelEnv = env.VERCEL_ENV;
  if (production && vercelEnv === "production") {
    const host = production.replace(/^https?:\/\//, "");
    return validatePublicOrigin(`https://${host}`).origin;
  }

  const branch = env.VERCEL_BRANCH_URL?.trim() ?? env.VERCEL_URL?.trim();
  if (branch) {
    const host = branch.replace(/^https?:\/\//, "");
    return validatePublicOrigin(`https://${host}`).origin;
  }

  return "http://127.0.0.1:8787";
}

export function mcpUrl(origin: string, slug: string): string {
  return `${origin}/apps/${slug}/mcp`;
}
