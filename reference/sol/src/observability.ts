export type SafeRequestObservation = {
  modelNamespace: "sol";
  slug: string;
  methodCategory: string;
  status: number;
  durationMs: number;
  requestBytes: number;
  resultBytes: number;
  buildSha: string;
};

export function safeBuildSha(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): string {
  const candidate =
    environment.VERCEL_GIT_COMMIT_SHA ??
    environment.GALLERY_GIT_SHA ??
    "development";
  return /^[a-f0-9]{7,40}$/u.test(candidate) ? candidate : "development";
}

export function observeRequest(observation: SafeRequestObservation): void {
  if (process.env.NODE_ENV === "test") return;
  console.info(
    JSON.stringify({ event: "gallery_mcp_request", ...observation }),
  );
}

export function methodCategory(method: unknown): string {
  if (typeof method !== "string") return "unknown";
  if (method === "initialize") return "initialize";
  if (method.startsWith("tools/")) return "tools";
  if (method.startsWith("resources/")) return "resources";
  if (method.startsWith("notifications/")) return "notification";
  if (method === "ping") return "ping";
  return "other";
}
