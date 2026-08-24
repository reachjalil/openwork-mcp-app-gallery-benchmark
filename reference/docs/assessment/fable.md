# FABLE assessment

Original verdict: **Passed**. Normalized original-benchmark score: **91.25**.
Machine-readable lines: `benchmark/scores.json`.

## Evidence versus inference

| Claim | Kind | Source |
| --- | --- | --- |
| Final verdict Passed | recorded | `reference/fable/benchmark/result.json#finalVerdict` |
| 28/28 Preview, staged, and stable canaries | recorded in report | `reference/fable/BENCHMARK_REPORT.md` |
| 252/252 observation samples | recorded | same report; result `passed` list |
| OpenWork deep pair Passed | recorded | `openworkCompatibilityState` |
| Independent host Incomplete | recorded | `independentHostState` |
| Accessibility Passed | recorded qualitative | `accessibilityState` |
| 96 tests and 15 browser tests | recorded | `BENCHMARK_REPORT.md` section 8 |
| Edge rate limit live-verified | recorded | `securityState` and report |

The live WAF/rate-limit proof is original-team evidence. Whether that
control survives a personal-scope Vercel transfer is a later operational
question, not a reason to invent a new original score.
