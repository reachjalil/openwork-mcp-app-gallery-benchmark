# GROK findings

Evidence period: original benchmark, completed 2026-08-17T18:40:00Z.
Sources: `reference/grok/BENCHMARK_REPORT.md` and
`reference/grok/benchmark/result.json`.

## Architecture

One Hono Function, six isolated MCP endpoints, bundled gallery HTML served
from GET `/` because the catch-all owns slash routes. Canonical URLs come
from `BASE_URL` / Vercel URL environment names, never the Host header.

## Key decisions

- Implement on `grok/gallery-v1` targeting `forward`.
- Promote product SHA `78a52fd9defc0d9855021b283191d46b86505ca1` before the
  report-only head `6c0e6bab7eb579da5eee0a8e2cc9de2f57b855c4`.
- Record the organization review blocker instead of bypassing it.

## Most costly issue

The different-ai organization ruleset required a non-author approval. The PR
was mergeable and check-green, but the terminal merge never happened. That
single policy gap is why the original verdict is `Incomplete`.

## Proof

Passed on the unmerged head: six endpoints, both protocol matrices, gallery
and accessibility, notices, PR-head CI/CodeQL/readiness, Preview, staged
20-minute observation, promotion, stable origin, and MCP Inspector
independent host.

## Gaps

- Merge into `forward`
- Post-merge forward CI
- Production SHA equals merged forward SHA
- OpenWork deep MCP Apps path
- Inspector sandbox iframe UI loop
- Rollback of a prior Current

## Reusable lessons

A green PR and a live origin are not a completed benchmark if the required
release branch never receives the commit. The 2026-08-21 migration imports
this branch directly and keeps the original `Incomplete` verdict visible.
