# Assessment decision log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-08-21 | Keep original GROK verdict Incomplete | The historical PR was intentionally not merged. Importing the branch is not retroactive completion. |
| 2026-08-21 | Score terminal delivery from merge and SHA alignment, not from a live origin alone | GROK had a stable origin and still missed the required release-branch merge. |
| 2026-08-21 | Cap GROK execution efficiency at 2 | Shortest elapsed time cannot outweigh the incomplete terminal gate. |
| 2026-08-21 | Cap SOL and FABLE security at 3 | Each has a documented bounded gap: SOL native dependency review; FABLE retained low-severity upstream warning and deferred 24-hour observation. |
| 2026-08-21 | Do not invent post-migration Preview/production numbers | Those surfaces are unavailable until Vercel remapping. |
| 2026-08-21 | No overall winner | The rubric is comparative evidence, not a selection of a canonical implementation. |
| 2026-08-21 | Exclude frozen upstream from monorepo CodeQL | The GHAS CodeQL check failed on SOL/FABLE `upstream/ext-apps` `Math.random` and identity-replacement alerts that the original reports already dispositioned. Excluding those snapshots avoids editing frozen evidence. |
