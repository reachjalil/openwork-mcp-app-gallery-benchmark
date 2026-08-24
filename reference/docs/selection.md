# Canonical gallery selection

This tree is the single deployable MCP Apps gallery. SOL, FABLE, and GROK
remain reference implementations. They are not rewritten, and their original
August 17 verdicts stay authoritative.

Scores below are from `docs/assessment/scorecard.md` for period
`original-benchmark-2026-08-17`. The numeric total is not a winner
declaration; it is one input beside protocol proof, host proof, and
maintainability.

## Assessment

| Candidate | Original verdict | Score / 100 | What it won | What it did not carry here |
| --- | --- | ---: | --- | --- |
| FABLE | Passed | 91.25 | Runtime architecture, Wave 1 envelope, notices/provenance, 96 unit/gateway/contract + 15 browser tests, skip-link/a11y gallery, OpenWork deep pair, 28/28 canaries | Team-scoped Vercel Firewall rate limit (paid/platform feature; not copied) |
| SOL | Passed | 86.25 | Dual-protocol proof discipline, locked-audit posture, independent MCP Apps bridge host tests, refusal to edit frozen upstream to silence CodeQL | Whole-tree rewrite; its `Math.random` customer-segmentation snapshot stays in the SOL reference |
| GROK | Incomplete | 72.50 | Independent-host (MCP Inspector) proof, removal of the hyphen identity-replacement, Web Crypto substitute for insecure `Math.random` | Original terminal gate (PR never merged); Web Crypto RNG (FABLE's seeded PRNG is better for identical serverless datasets) |

## What this implementation takes

From **FABLE** (base tree):

- Single Hono function, six isolated `/apps/<slug>/mcp` servers, no root mega-MCP
- Dual protocol: current `2026-07-28` plus legacy Streamable HTTP
- Wave 1 envelope: 256 KiB body, 15s deadline, per-app and global concurrency shedding, sanitized logs
- Function-served `/` because the Hono catch-all owns slash routes
- Deterministic seeded customer-segmentation dataset
- Provenance manifest, notices verification, source-boundary scan, SBOM, architecture invariants
- Gallery skip link, card labels, and copy-status live region

From **GROK** (ported):

- Remove the no-op `.replace("-", "-")` in customer-segmentation UI so CodeQL
  identity-replacement does not fire on this tree

From **SOL** (kept as practice, already present in the FABLE base):

- Dual-era contract proof
- Independent-host style coverage through the upstream basic-host browser suite
- No paid WAF dependency in the first deploy

## What this implementation does not take

- SOL's or GROK's whole runtime rewrite
- GROK's Web Crypto RNG, which would make synthetic data vary across instances
- FABLE's original team Firewall rule (that is a Vercel project setting, not code)
- Any original `TIMELINE.md` or `BENCHMARK_REPORT.md` rewritten as this tree's history
- A claim that this tree inherited the August 17 Passed/Incomplete verdicts

## Deployment intent

Deploy only `gallery (now the repository root)` as the public MCP Apps gallery. Keep
`reference/{sol,fable,grok}` in this monorepo as historical references.
Closing the three older Vercel projects and archiving the three older GitHub
repos is a later operator action after this gallery has a healthy production
origin.
