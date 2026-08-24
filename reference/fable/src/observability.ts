/**
 * Sanitized structured logging.
 *
 * Only the whitelisted fields below are ever emitted. Tool arguments, tool
 * results, prompts, resource contents, authorization headers, cookies, IP
 * addresses, user identifiers, and credentials must never flow through this
 * module; log call sites pass scalar metadata only.
 */

export interface McpRequestLog {
  event: "mcp_request";
  slug: string;
  /** JSON-RPC method category only (e.g. "tools/call"), never parameters. */
  method: string;
  status: number;
  durationMs: number;
  requestBytes: number;
  resultBytes: number;
  outcome:
    | "ok"
    | "error"
    | "rejected"
    | "timeout"
    | "over-limit"
    | "concurrency";
}

export interface GatewayEventLog {
  event: "gateway_rejected" | "readyz" | "boot" | "app_error";
  slug?: string;
  reason?: string;
  status?: number;
}

type LogRecord = McpRequestLog | GatewayEventLog;

const NAMESPACE = "fable";

function safeSha(): string | undefined {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GALLERY_GIT_SHA;
  return sha && /^[0-9a-f]{7,40}$/.test(sha) ? sha.slice(0, 12) : undefined;
}

export function logRecord(record: LogRecord): void {
  const line: Record<string, unknown> = {
    ts: new Date().toISOString(),
    namespace: NAMESPACE,
    ...record,
  };
  const sha = safeSha();
  if (sha) line.sha = sha;
  // Single-line JSON keeps Vercel log drains and local runs greppable.
  console.log(JSON.stringify(line));
}
