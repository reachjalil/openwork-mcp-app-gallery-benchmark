# If the merge had landed

**A quality reading of the 17 August 2026 MCP Apps bake-off**

Three models got the same assignment: take the official MCP Apps examples and
ship them as a hosted gallery. Six isolated servers. Current protocol and the
older HTTP flow. A public page with copy-paste URLs. No accounts, no stored
user data, no “it works in the transcript.”

Fable passed. Sol passed. Grok built the product, went green on the pull
request, and never merged.

The first scorecard used whole levels only. Different gaps landed on the
same number. This reading uses half-levels so the gravity of each gap
shows up. Official verdicts do not change. Grok stays **Incomplete**.

Quality totals: Fable **93.13**, Sol **84.38**, Grok **68.13**.  
If Grok’s already-green pull request had merged: **85.63**.

That beats Sol by a little. It does not beat Fable.

---

## What was being scored

MCP Apps are interactive UI inside a conversation. You add a remote server
URL. The host talks MCP. An app renders. Clicks go back to that server.

Seven categories, weighted to 100. Levels may be 2.0, 2.5, 3.0, 3.5, or 4.0
when the evidence sits between two integers.

| Category | Weight | What it asks |
| --- | ---: | --- |
| Shipped and complete | 20 | Did it merge and serve a merged release? |
| Protocol and behavior | 20 | Do all six apps speak current and older MCP HTTP? |
| Security and public readiness | 15 | Headers, scans, notices, abuse limits on the public artifact |
| Deploy and reliability | 15 | How strong was preview, watch, promotion, and the stable URL? |
| Hosts | 10 | Did a real MCP Apps client render and drive the app? |
| Maintainability | 10 | Tests, docs, bugs the run introduced and fixed |
| Speed | 10 | How efficient the original day was |

---

## The board

| | Fable | Sol | Grok | Grok if merged |
| --- | ---: | ---: | ---: | ---: |
| Verdict | Passed | Passed | Incomplete | Hypothetical |
| Quality score | 93.13 | 84.38 | 68.13 | 85.63 |
| Clock | 3h 32m | 2h 51m | 1h 57m | same day |
| Focused work | 2h 20m | 2h 11m | 1h 02m | same day |
| Tests | 96 + 15 | 42 + 10 | 34 + 2 | 34 + 2 |
| Merged release | Yes | Yes | No | Assumed yes |

Grok’s pull request was check-green. A second approving review was still
required. It did not arrive. Production served the green head, not a merged
release commit.

---

## Category by category

| Category | Fable | Sol | Grok | Grok if merged |
| --- | ---: | ---: | ---: | ---: |
| Shipped and complete | 20.00 | 20.00 | 10.00 | 20.00 |
| Protocol | 20.00 | 20.00 | 20.00 | 20.00 |
| Security | 13.13 | 11.25 | 9.38 | 11.25 |
| Deploy | 15.00 | 13.13 | 11.25 | 13.13 |
| Hosts | 7.50 | 5.00 | 6.25 | 6.25 |
| Maintainability | 10.00 | 7.50 | 6.25 | 6.25 |
| Speed | 7.50 | 7.50 | 5.00 | 8.75 |
| **Total** | **93.13** | **84.38** | **68.13** | **85.63** |

They are not all 11.25 on security. They should not be.

**Security.** Fable had a live edge rate limit and fixed its blocking
scanner findings. One cosmetic upstream warning and a deferred 24-hour
watch keep it at 13.13, not a perfect 15. Sol’s artifact was clean; native
dependency review stayed incomplete and the paid WAF was skipped — 11.25.
Grok’s head was green, including real `Math.random` fixes, but there was no
post-merge scan and no WAF — 9.38. A merge would put Grok next to Sol at
11.25, not next to Fable.

**Deploy.** Fable is the only 15: 28/28 canaries and 252/252 over 22
minutes. Sol completed the path with a thinner watch — 13.13. Grok’s
55-cycle watch was clean, but the SHA was not a merged release — 11.25. A
merge lifts Grok to Sol’s 13.13, not Fable’s 15. A 20-minute watch is not
252 checks.

**Hosts.** Fable drove a real in-app pair (get-time + budget-allocator) and
still missed a second host — 7.50. Sol missed both — 5.00. Grok’s Inspector
run listed tools, read a resource, and called two tools. The iframe UI loop
and the primary-host deep path stayed open — 6.25. That is better than Sol
and not equal to Fable. A merge does not change it.

**Maintainability.** Fable’s 96 + 15 suite is a 10. Sol’s 42 + 10 with
twelve fixed regressions is a 7.50. Grok’s 34 + 2 is a 6.25. Merging does
not add tests.

**Speed.** Official Grok stays capped at 5.00 because the merge was open.
If it had closed, Grok is the fastest focused day — 8.75, not a perfect 10.

---

## What a merge would not have fixed

| Leftover | After a merge | Priced as |
| --- | --- | --- |
| Primary-host deep path | Still open | Hosts 6.25 |
| Inspector iframe UI loop | Still open | Hosts 6.25 |
| Two browser tests | Still two | Maintainability 6.25 |
| No live rate limit | Still none | Security 11.25, not 13.13 |
| 55-cycle watch | Still 55 | Deploy 13.13, not 15 |

A merge would have fixed the release-branch commit, the matching production
SHA, and the speed cap. Nothing else.

---

## Why 85.63 beats Sol — barely

The lead is **1.25 points**, not a category sweep.

Grok-if-merged is ahead on hosts (6.25 vs 5.00) and speed (8.75 vs 7.50).
Sol is ahead on maintainability (7.50 vs 6.25). Security and deploy match
at the Sol band. Protocol and ship match.

That is a faster run with a thinner suite and a half-finished second host,
against a slower run with more tests and no second host. Close. Not a
blowout.

---

## Why Fable is still first

| | Fable | Grok if merged |
| ---: | ---: | ---: |
| Quality score | 93.13 | 85.63 |
| Tests | 96 + 15 | 34 + 2 |
| Deploy proof | 28/28 and 252/252 | 55 clean cycles |
| In-app host pair | Passed | Incomplete |
| Live rate limit | Yes | No |

A merge does not mint thirteen extra browser tests, a 22-minute 252-check
watch, or an in-app host pair. Fable won on proof.

---

## How to read 85.63

85.63 is a sensitivity check with the leftovers still charged.

It does not turn Incomplete into Passed. Official Grok stays Incomplete.
The useful sentence is:

Grok was closer to Sol than the Incomplete suggests, once you price the
merge honestly and stop giving it Fable’s security and host rungs. Give the
merge back and it is a narrow second. The leftover issues remain. It still
does not overtake the candidate that tested hardest.
