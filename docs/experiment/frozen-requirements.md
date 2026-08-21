# Frozen requirements

These requirements are copied from the original August 17 run. They are not
relaxed by the monorepo migration.

## Protocol

- One logical MCP server per app at `/apps/<slug>/mcp`.
- No root mega-MCP.
- Current protocol pin: `2026-07-28`.
- Legacy stateless Streamable HTTP fallback required.
- Host headers are not a trusted origin source.

## Safety

- No runtime source fetch or package install.
- No subprocess, arbitrary URL, upload, or durable write path.
- No credentials or intended server-side egress.
- Bounded request, result, time, and concurrency limits.
- Do not log tool arguments, results, prompts, resource contents, headers,
  cookies, IP addresses, or credentials.

## Proof

- Local `release:check` or equivalent exact-head gate.
- CI, CodeQL, dependency/audit fallback, and public-readiness evidence.
- Exact Preview proof.
- Staged Production plus continuous observation.
- Promotion without rebuild.
- Stable-origin canaries on the public `*.vercel.app` origin.

## Evidence files that must remain

- `implementations/<candidate>/TIMELINE.md`
- `implementations/<candidate>/BENCHMARK_REPORT.md`
- `implementations/<candidate>/benchmark/result.json`
- `implementations/<candidate>/benchmark/timeline.json`
