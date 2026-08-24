# Original benchmark performance

Copied from `reference/<candidate>/benchmark/result.json` on
2026-08-21. Source values were not invented or averaged.

| Field | SOL | FABLE | GROK |
| --- | ---: | ---: | ---: |
| `totalElapsedMs` | 10,265,000 | 12,694,295 | 7,018,000 |
| `estimatedActiveMs` | 7,861,451 | 8,400,000 | 3,748,000 |
| `externalWaitMs` | 69,000 | 3,000,000 | 730,000 |
| `ciWaitMs` | 648,000 | 1,020,000 | 820,000 |
| `vercelWaitMs` | 425,549 | 480,000 | 320,000 |
| `reworkMs` | 1,209,000 | 3,300,000 | 1,380,000 |
| `selfIntroducedRegressionCount` | 12 | 3 | 1 |
| `correctedRegressionCount` | 12 | 3 | 1 |
| `unresolvedIssueCount` | 1 | 0 | 1 |
| Original verdict | Passed | Passed | Incomplete |

Milestone fields differ by candidate schema. See each source
`milestoneDurations` object rather than forcing a common table.

GROK `mergeMs` is `null`. That missing merge is part of the original
Incomplete verdict, not a timing optimization.
