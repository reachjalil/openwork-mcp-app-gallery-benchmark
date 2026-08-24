# Agent contract

- The repository root IS the hosted MCP Apps gallery (the deployable
  product), composed from the August 17 SOL, FABLE, and GROK candidates.
  Those three trees stay frozen references under `reference/{sol,fable,grok}`
  with the benchmark evidence in `reference/docs`; they receive no feature
  work.
- Pull requests target `dev`; `main` is production-only. The customer-facing
  guide is `docs/building-mcp-apps.md` — keep it accurate when changing the
  registry, adapter, or deployment shape.
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
