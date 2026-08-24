# Contributing

Thanks for your interest! This repository is both a **live gallery**
(<https://openwork-mcp-app-gallery.vercel.app>) and a **worked example** of
how to build and host MCP Apps. Contributions that make it a better example
are very welcome.

## Quick start

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev                          # local gallery at http://localhost:3000
```

Before opening a PR, run the same gate CI runs:

```bash
pnpm exec playwright install chromium   # once
pnpm run ci:check
```

That covers formatting (Biome), lint, strict typecheck, provenance/notices
verification, a source-boundary scan, dependency audit, 96 unit/gateway/
protocol-contract tests, the production build, the architecture invariant,
SBOM generation, and 15 real-browser tests.

## What contributions fit

- **Docs and guide improvements** — clearer explanations in
  [`docs/building-mcp-apps.md`](docs/building-mcp-apps.md), better examples,
  fixed typos. The easiest and most valuable place to start.
- **Gallery/runtime fixes** — bugs in the gateway, adapter, page, or tests.
- **New example apps** — follow
  [the guide's step-by-step](docs/building-mcp-apps.md#4-add-your-own-app-to-this-gallery).
  Wave-1 hosting rules apply: no accounts, no persistence, no server-side
  network egress, no subprocesses, bounded inputs/outputs, a useful
  non-UI fallback, and honest data notes. Apps that need egress or heavier
  runtimes are welcome as proposals first (open an issue).
- **Upstream refreshes** — the six examples are pinned to one audited commit
  of [`modelcontextprotocol/ext-apps`](https://github.com/modelcontextprotocol/ext-apps).
  `pnpm run check:upstream` reports drift; refresh PRs must update
  `upstream/manifest.json` digests and `THIRD_PARTY_NOTICES.md` together.

## Ground rules

- `dev` is the integration branch (all PRs target it); `main` is
  production-only and deploys on merge.
- Node 24.x and pnpm 10.28.0 exactly (enforced by CI and the architecture
  check). Runtime dependencies are pinned exactly.
- Two rules that protect the deployment (CI enforces both): runtime-path
  relative imports carry explicit `.js` extensions (Vercel runs Node's native
  ESM loader), and the committed gallery page in `public/` must match
  regeneration (`pnpm run build`).
- Never log tool arguments, results, prompts, or user identifiers —
  `src/observability.ts` is the only logging seam.
- Don't modify `reference/` — those trees are frozen benchmark evidence.
- Third-party code must arrive with provenance: record it in
  `upstream/manifest.json` and `THIRD_PARTY_NOTICES.md`, and keep the
  original notices.

## Reporting issues

Use the issue templates. For suspected security problems, please use GitHub's
private **Report a vulnerability** flow instead of a public issue (see
[`SECURITY.md`](SECURITY.md)).
