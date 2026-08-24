import { MODEL_NAMESPACE } from "./constants.js";

export type LogFields = {
  slug?: string;
  methodCategory?: string;
  status?: number;
  durationMs?: number;
  requestBytes?: number;
  resultBytes?: number;
  buildSha?: string;
  deploymentId?: string;
  enabledSlugs?: string[];
  failures?: number;
  timeouts?: number;
  rateLimits?: number;
};

const FORBIDDEN =
  /tool arguments|tool results|prompt|authorization|cookie|credential|ip address|user id/i;

export function safeLog(event: string, fields: LogFields = {}): void {
  if (FORBIDDEN.test(event)) return;
  const line = {
    event,
    modelNamespace: MODEL_NAMESPACE,
    ...fields,
  };
  console.info(JSON.stringify(line));
}

export function methodCategory(method: string | undefined): string {
  if (!method) return "unknown";
  if (method === "initialize") return "initialize";
  if (method.startsWith("tools/")) return "tools";
  if (method.startsWith("resources/")) return "resources";
  if (method.startsWith("notifications/")) return "notifications";
  if (method.startsWith("server/")) return "server";
  if (method.startsWith("ping")) return "ping";
  return "other";
}
