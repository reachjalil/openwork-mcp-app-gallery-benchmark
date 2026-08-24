# Contributing

This repository is a benchmark implementation candidate of the Hosted MCP
Apps Example Gallery and does not accept external contributions or community
app submissions in v1.

## Development contract

- Default and only release branch: `forward`. All pull requests target
  `forward`; `main` and `dev` are not delivery branches.
- Node.js 24.x, pnpm 10.28.0 (pinned via `packageManager` and enforced by
  `scripts/check-vercel-architecture.mjs`).
- Install with `corepack enable && pnpm install --frozen-lockfile`.
- Run the full release gate locally with `pnpm release:check`.
- Upstream example source is pinned to an exact reviewed commit of
  `modelcontextprotocol/ext-apps`; never fetch upstream during build or at
  runtime. Update examples only through reviewed pull requests that also
  update `upstream/manifest.json` and `THIRD_PARTY_NOTICES.md`.
- Wave 1 safety boundary (no egress, no subprocesses, no persistence, no
  credentials, bounded input/output/time/concurrency) is mandatory; CI scans
  for violations.
