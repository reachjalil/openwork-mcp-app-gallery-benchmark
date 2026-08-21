# Assessment scorecard

Generated from `benchmark/scores.json`. Arithmetic only; qualitative
evidence is cited, not invented. Original August 17 verdicts remain
authoritative for the benchmark window and are not rewritten by later
monorepo health checks.

Rubric: `docs/assessment/rubric.md`. Period: **original-benchmark-2026-08-17**.

## Normalized totals

| Candidate | Original verdict | Normalized total / 100 | Eligibility |
| --- | --- | ---: | --- |
| SOL | Passed | 86.25 | Eligible original benchmark candidate; merged and proven on stable origin |
| FABLE | Passed | 91.25 | Eligible original benchmark candidate; merged and proven on stable origin |
| GROK | Incomplete | 72.50 | Original benchmark incomplete: PR #1 did not merge and production SHA is not a merged forward SHA |

Do not treat the numeric total as a canonical-implementation decision.
GROK's original `Incomplete` verdict remains beside its number because
the historical PR did not merge during the benchmark window.

## Category scores

### SOL

| Category | Weight | Level | Weighted | Evidence |
| --- | ---: | ---: | ---: | --- |
| Terminal delivery completeness | 20 | 4/4 | 20.00 | `implementations/sol/benchmark/result.json#finalVerdict` |
| Protocol and functional correctness | 20 | 4/4 | 20.00 | `implementations/sol/benchmark/result.json#currentProtocolState` |
| Security and public readiness | 15 | 3/4 | 11.25 | `implementations/sol/benchmark/result.json#securityState` |
| Deployment and reliability | 15 | 4/4 | 15.00 | `implementations/sol/benchmark/result.json#productionDeployment` |
| Host interoperability | 10 | 2/4 | 5.00 | `implementations/sol/benchmark/result.json#openworkCompatibilityState` |
| Maintainability and implementation quality | 10 | 3/4 | 7.50 | `implementations/sol/benchmark/result.json#selfIntroducedRegressionCount` |
| Execution efficiency | 10 | 3/4 | 7.50 | `implementations/sol/benchmark/result.json#totalElapsedMs` |

### FABLE

| Category | Weight | Level | Weighted | Evidence |
| --- | ---: | ---: | ---: | --- |
| Terminal delivery completeness | 20 | 4/4 | 20.00 | `implementations/fable/benchmark/result.json#finalVerdict` |
| Protocol and functional correctness | 20 | 4/4 | 20.00 | `implementations/fable/benchmark/result.json#currentProtocolState` |
| Security and public readiness | 15 | 3/4 | 11.25 | `implementations/fable/benchmark/result.json#securityState` |
| Deployment and reliability | 15 | 4/4 | 15.00 | `implementations/fable/benchmark/result.json#productionUrl` |
| Host interoperability | 10 | 3/4 | 7.50 | `implementations/fable/benchmark/result.json#openworkCompatibilityState` |
| Maintainability and implementation quality | 10 | 4/4 | 10.00 | `implementations/fable/BENCHMARK_REPORT.md` |
| Execution efficiency | 10 | 3/4 | 7.50 | `implementations/fable/benchmark/result.json#totalElapsedMs` |

### GROK

| Category | Weight | Level | Weighted | Evidence |
| --- | ---: | ---: | ---: | --- |
| Terminal delivery completeness | 20 | 2/4 | 10.00 | `implementations/grok/benchmark/result.json#finalVerdict` |
| Protocol and functional correctness | 20 | 4/4 | 20.00 | `implementations/grok/benchmark/result.json#currentProtocolState` |
| Security and public readiness | 15 | 3/4 | 11.25 | `implementations/grok/benchmark/result.json#securityState` |
| Deployment and reliability | 15 | 3/4 | 11.25 | `implementations/grok/benchmark/result.json#promotedProductSha` |
| Host interoperability | 10 | 3/4 | 7.50 | `implementations/grok/benchmark/result.json#independentHostState` |
| Maintainability and implementation quality | 10 | 3/4 | 7.50 | `implementations/grok/BENCHMARK_REPORT.md` |
| Execution efficiency | 10 | 2/4 | 5.00 | `implementations/grok/benchmark/result.json#totalElapsedMs` |

