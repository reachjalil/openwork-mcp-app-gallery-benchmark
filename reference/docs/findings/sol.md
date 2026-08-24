# SOL findings

Evidence period: original benchmark, cutoff 2026-08-17T20:09:29Z.
Sources: `reference/sol/BENCHMARK_REPORT.md` and
`reference/sol/benchmark/result.json`.

## Architecture

One root `app.ts` Hono Function serves diagnostics and six parameterized
Streamable HTTP paths. Generated gallery assets are served from `public/`.
There is no root mega-MCP. The hosted adapter translates the frozen examples'
SDK v1 registration shape into SDK v2.

## Key decisions

- Keep a single Function and Fluid compute in `iad1` with `maxDuration: 30`.
- Treat `forward` as the original source release branch; later reports are
  publication commits after the signed implementation SHA
  `b0108c71a58289d111674c2f7315bb8e3355113a`.
- Use a locked-audit fallback when native GitHub dependency review is
  unsupported on a newly public repository.

## Most costly issue

Twelve self-introduced regressions were recorded and corrected
(`selfIntroducedRegressionCount` 12, `correctedRegressionCount` 12). The
largest classes were GitHub/Vercel workflow friction, secret-scan false
positives, and verification-harness gaps.

## Proof

Passed: six-app implementation, both protocol matrices, local and clean-clone
checks, CI, CodeQL, public readiness, exact Preview, staged Production, 1,261
second observation, promotion, stable-origin proof, and accessibility.

## Gaps

- Native GitHub dependency review: Incomplete
- Full installed OpenWork matrix: Incomplete
- Independent MCP Apps host: Incomplete
- Paid WAF/rate-limit, custom DNS, and 24-hour observation: skipped or deferred

## Reusable lessons

A passing gallery still spent substantial time on platform policy and
verification harnesses. Record exact SHAs for the implementation release and
the later report commit separately.
