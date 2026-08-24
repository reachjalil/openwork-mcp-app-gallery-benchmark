# Quality rescore — 21 August 2026

The 17 August integer scorecard used whole levels only. That forced different
gaps onto the same number: every candidate got security **11.25**, Fable and
Grok both got hosts **7.50**, and a Grok merge would have jumped deploy and
speed to Fable’s ceiling.

This rescore keeps the same seven categories and the same weights. It allows
**half-levels** (0.5) when the evidence sits between two integers. Original
verdicts do not change. Fable and Sol remain **Passed**. Grok remains
**Incomplete**. The original totals (91.25 / 86.25 / 72.50) stay the first
scorecard. These totals replace them only as a quality reading.

Weighted points = `level / 4 × weight`.

---

## Totals

| Reading | Fable | Sol | Grok | Grok if merged |
| --- | ---: | ---: | ---: | ---: |
| Original integer scorecard | 91.25 | 86.25 | 72.50 | 88.75 |
| **Quality rescore** | **93.13** | **84.38** | **68.13** | **85.63** |
| Official verdict | Passed | Passed | Incomplete | Hypothetical only |

Grok-if-merged still beats Sol, by **1.25**, not 2.50. Fable is further
ahead than the first scorecard showed. Official Grok is a bit lower, because
security and hosts were overstated when they shared Fable’s rungs.

---

## Score grid

| Category | Weight | Fable | Sol | Grok | Grok if merged |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shipped and complete | 20 | 4.0 → 20.00 | 4.0 → 20.00 | 2.0 → 10.00 | 4.0 → 20.00 |
| Protocol and behavior | 20 | 4.0 → 20.00 | 4.0 → 20.00 | 4.0 → 20.00 | 4.0 → 20.00 |
| Security and public readiness | 15 | 3.5 → 13.13 | 3.0 → 11.25 | 2.5 → 9.38 | 3.0 → 11.25 |
| Deploy and reliability | 15 | 4.0 → 15.00 | 3.5 → 13.13 | 3.0 → 11.25 | 3.5 → 13.13 |
| Hosts | 10 | 3.0 → 7.50 | 2.0 → 5.00 | 2.5 → 6.25 | 2.5 → 6.25 |
| Maintainability | 10 | 4.0 → 10.00 | 3.0 → 7.50 | 2.5 → 6.25 | 2.5 → 6.25 |
| Speed | 10 | 3.0 → 7.50 | 3.0 → 7.50 | 2.0 → 5.00 | 3.5 → 8.75 |
| **Total** | **100** | **93.13** | **84.38** | **68.13** | **85.63** |

---

## Why these levels

### Shipped and complete — weight 20

| | Level | Gravity |
| --- | ---: | --- |
| Fable | 4.0 | Merged. Production is a merged release SHA. Report complete. |
| Sol | 4.0 | Same. |
| Grok | 2.0 | Product ran on a public URL from a green PR head. Required merge did not happen. That is an explicit incomplete gate, not a small leftover. Not a 1: the apps existed. Not a 3: the finish line was required. |
| Grok if merged | 4.0 | Same bar Fable and Sol already cleared. Leftover host gaps do not live here; they live under Hosts. |

### Protocol and behavior — weight 20

All three recorded Passed current and legacy Streamable HTTP on the
implemented gallery. Proof density belongs under Deploy, not here. **4.0**
each.

### Security and public readiness — weight 15

This is where the first scorecard flattened three different stories into
11.25.

| | Level | What was actually there | What was missing | Gravity |
| --- | ---: | --- | --- | --- |
| Fable | 3.5 | Headers, notices, boundary, secret scan, SBOM, CodeQL with two real findings fixed, **live edge rate limit verified** | One low-severity upstream cosmetic warning kept; 24-hour watch deferred | Closest to complete. Leftovers are small. Not 4.0 because the warning and the 24-hour watch are still open. |
| Sol | 3.0 | Headers, notices, CodeQL clean at merge, locked-audit fallback Passed | Native GitHub dependency review Incomplete; **paid WAF skipped**; 24-hour watch deferred | Core artifact is fine. Two public-readiness controls were not done. That is a real 3, not Fable’s 3.5. |
| Grok | 2.5 | PR-head CodeQL/CI/readiness green; they **fixed** insecure `Math.random` and the hyphen no-op; headers and notices present | **No post-merge scan**; no WAF; 24-hour watch deferred | Shipped artifact was not sloppy. Public-readiness is incomplete without a merged-branch security proof. Below Sol. Above a fail. |
| Grok if merged | 3.0 | Post-merge scan assumed still green on the same head | Still no WAF; 24-hour watch still deferred | Same band as Sol. Not Fable’s 3.5: no live abuse-control proof. Not 4.0. |

Inspector iframe and the primary-host deep path are **not** scored here.

### Deploy and reliability — weight 15

| | Level | Gravity |
| --- | ---: | --- |
| Fable | 4.0 | 28/28 preview, 28/28 staged, 252/252 over 22 minutes, promote without rebuild, 28/28 stable. This is the only exact deploy proof. |
| Sol | 3.5 | Preview, staged, 1,261 s watch (18 samples), three canaries, promote, stable. Complete path, thinner matrix. Not 4.0. |
| Grok | 3.0 | Preview, staged 55 cycles with 0 failures, promote, stable origin. Production SHA is not a merged release SHA. Core path with a real alignment gap. |
| Grok if merged | 3.5 | Alignment gap goes away. Watch is still 55 cycles, not 252/252, and there is no 28/28 canary sheet. Same density as Sol, not Fable. |

Giving Grok-if-merged a 4.0 would treat a 20-minute 55-cycle watch as equal
to Fable’s 28/28 + 252/252. That is the inflation this rescore removes.

### Hosts — weight 10

| | Level | What passed | What did not | Gravity |
| --- | ---: | --- | --- | --- |
| Fable | 3.0 | Primary-host deep pair: get-time render + result; budget-allocator sliders; restart | Independent host; four other in-host renders | A real in-app host win, incomplete catalog. 3.0. |
| Sol | 2.0 | Neither primary-host matrix nor a second host | Both marked Incomplete | Partial attempt only. 2.0. |
| Grok | 2.5 | MCP Inspector CLI: tools list, get-time resource read, two tool calls, `hasApp: true` on six servers | Primary-host deep path; **Inspector sandbox iframe UI loop** | Farther than Sol, weaker than Fable. CLI is not an in-iframe loop. Not 3.0. |
| Grok if merged | 2.5 | Unchanged | Unchanged | A merge does not add a host. |

The first scorecard gave Grok 7.50, the same as Fable. That treated Inspector
CLI as equal to an in-app OpenWork pair. It was not.

### Maintainability — weight 10

| | Level | Gravity |
| --- | ---: | --- |
| Fable | 4.0 | 96 automated + 15 browser. Architecture invariants. 3/3 regressions fixed. 98-file provenance. |
| Sol | 3.0 | 42 + 10. Workable suite. **12** self-introduced regressions, all fixed. Lasting tests are decent; the run was expensive. |
| Grok | 2.5 | 34 + **2** browser. 1 regression, fixed. Cleaner CodeQL edit. The browser net is too thin for 3.0. |
| Grok if merged | 2.5 | Tests do not grow because a PR merges. |

### Speed — weight 10

Clock / focused / rework: Fable 3h 32m / 2h 20m / ~55m; Sol 2h 51m / 2h 11m /
~20m; Grok 1h 57m / 1h 02m / ~23m.

| | Level | Gravity |
| --- | ---: | --- |
| Fable | 3.0 | Finished, with the most rework. |
| Sol | 3.0 | Finished, less rework than Fable. Not a 4: not exact-efficiency proof. |
| Grok | 2.0 | Fastest day. Official cap stays: speed cannot outweigh an open merge gate. |
| Grok if merged | 3.5 | Fastest focused time, modest rework, and the gate is closed. 3.5, not 4.0: no one has an instrumented efficiency study. |

---

## What a Grok merge still does not buy

| Leftover | Still open | Level after merge |
| --- | --- | --- |
| Primary-host deep path | Yes | Hosts 2.5 |
| Inspector iframe UI loop | Yes | Hosts 2.5 |
| Two browser tests | Yes | Maintainability 2.5 |
| No live WAF | Yes | Security 3.0, not 3.5 |
| 55-cycle watch, not 252/252 | Yes | Deploy 3.5, not 4.0 |
| 24-hour watch | Yes | Same deferral as the others |

---

## Reading

Fable is first on proof, not on speed.  
Grok-if-merged is a close second to Sol on the number, and still behind
Fable by a wide gap on tests, deploy density, and in-app host proof.  
Official Grok is Incomplete at a lower quality total than 72.50, because
sharing Fable’s security and host rungs was too kind.

Sources: the three `benchmark/result.json` files, the three
`BENCHMARK_REPORT.md` files, and the 17 August integer scorecard they first
produced.
