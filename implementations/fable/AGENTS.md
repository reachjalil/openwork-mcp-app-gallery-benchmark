# Agent contract

- `forward` is the default, integration, and only release branch. Every PR
  targets `forward`; `main` and `dev` are not delivery branches. CI, CodeQL,
  and the Vercel Production Branch all point at `forward`.
- Node 24.x + pnpm 10.28.0 (`corepack enable && pnpm install --frozen-lockfile`).
- Run `pnpm release:check` before publishing a PR; it is the complete local
  release gate. Browser tests need `pnpm exec playwright install chromium`.
- Runtime dependencies are pinned exactly (mcp-handler 2.1.1,
  @modelcontextprotocol/server 2.0.0, hono, zod) and enforced by
  `scripts/check-vercel-architecture.mjs`. MCP SDK v1 and
  `@modelcontextprotocol/ext-apps` are dev/test-only.
- Upstream example code under `upstream/ext-apps/` is pinned to one reviewed
  commit. Never fetch upstream at build or runtime. Any change to a copied
  file must update `upstream/manifest.json` (digests + modification note) and
  pass `pnpm verify:notices`.
- Wave 1 safety boundary is mandatory: no server egress, no subprocesses, no
  persistence, no credentials, no write tools, bounded input/output/time/
  concurrency. `scripts/check-source-boundary.mjs` scans the runtime path.
- Never log tool arguments, results, prompts, resource contents, headers,
  cookies, IP addresses, or credentials. `src/observability.ts` is the only
  logging seam.
- Do not add a root `/mcp` endpoint: every app stays its own logical MCP
  server under `/apps/<slug>/mcp`.
