# MCP Apps gallery benchmark monorepo

This repository is the personal home for the hosted MCP Apps gallery and the
three August 17 benchmark references: SOL, FABLE, and GROK.

## Boundaries

- Work only in this repository. Do not modify OpenWork, OpenWork Snacks, or
  OpenWork Lounge from here.
- `implementations/gallery` is the active deployable gallery. New product
  work goes there.
- Keep SOL, FABLE, and GROK independent under
  `implementations/{sol,fable,grok}` as historical references. Do not
  consolidate their runtime code, lockfiles, or dependencies, and do not
  overwrite them with the canonical gallery.
- Preserve original `TIMELINE.md`, `BENCHMARK_REPORT.md`, and
  `benchmark/{result,timeline}.json` files. Do not rewrite them to hide
  defects, gaps, or the original GROK `Incomplete` verdict.
- Nested `implementations/*/.github` files are imported history. Only root
  `.github/workflows` are live.
- Never commit `.vercel/`, tokens, cookies, environment values, project IDs,
  protected Preview URLs, or raw provider logs.
- Do not add paid Vercel or GitHub features, custom domains, or public
  announcements from this repository.

## Branches

- `dev` is the default integration branch. Ordinary pull requests target
  `dev`. Vercel Preview deployments come from `dev`.
- `main` is production-only. Vercel Production Branch is `main`.
- Do not create or use a `forward` branch in this monorepo.

## Runtime

- Node.js 24.x and pnpm 10.28.0.
- Run candidate commands with that implementation as the working directory, or
  through the root orchestration scripts (`check:gallery`, `check:sol`,
  `check:fable`, `check:grok`, `check:all`).
- There is no root pnpm workspace. Each implementation keeps its own
  `package.json` and lockfile.

## Evidence

- Original August 17 benchmark verdicts stay visible beside any later
  post-migration scores.
- Every score must cite a reproducible evidence path. If a measurement cannot
  be performed, mark it unavailable or incomplete.
- Import provenance lives in `docs/migration/`.
