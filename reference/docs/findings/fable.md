# FABLE findings

Evidence period: original benchmark, completed 2026-08-17T20:14:26Z.
Sources: `reference/fable/BENCHMARK_REPORT.md` and
`reference/fable/benchmark/result.json`.

## Architecture

One stateless Hono application with a path-routed gateway
`/apps/:slug/mcp`. Each request creates a fresh SDK v2 `McpServer`. Wave 1
limits include a 256 KiB request ceiling, 15 s deadline, and per-instance
global/per-app concurrency shedding. An edge rate limit was live-verified on
the original Different AI Vercel team.

## Key decisions

- Treat `forward` as the only original release line.
- Copy 98 upstream files with per-file digests and seven documented
  modifications.
- Prove 28/28 canaries and 252/252 observation samples before promotion.

## Most costly issue

Organization ruleset interaction (ISS-007) and shared-host contention
(ISS-009) consumed time without becoming product defects. Three
self-introduced regressions were corrected.

## Proof

Passed: full local release gate, 96 tests, 15 browser tests, CI, CodeQL,
Preview 28/28, staged 28/28 plus 21.8-minute observation, promotion,
stable-origin 28/28, WAF live verification, and OpenWork deep pair.

## Gaps

- Independent-host proof
- Four remaining in-OpenWork render checks under shared-host contention
- 24-hour operational observation

## Reusable lessons

FABLE's volume of contract and browser tests is the clearest maintainability
signal in the original set. Team-scoped WAF/rate-limit settings may not move
cleanly to a personal Vercel scope and must not be replaced with a paid
add-on during migration.
