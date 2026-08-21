# Hosted MCP Apps Example Gallery — SOL Timeline

## Run Identity

- Model name: SOL
- Model namespace: sol
- Local repository: `/Users/jalillaaraichi/openwork-mcp-app-gallery-sol`
- GitHub repository: `different-ai/openwork-mcp-app-gallery-sol`
- Vercel project: `openwork-mcp-app-gallery-sol`
- Default and production branch: `forward`
- Feature branch: `sol/gallery-v1`
- Status: Passed at public evidence cutoff; report publication follows
- Current phase: P9 — Operate and report

## Timing Summary

| Measure                                      | Value                         |
| -------------------------------------------- | ----------------------------- |
| Started UTC                                  | 2026-08-17T17:18:24Z          |
| Started Europe/Berlin                        | 2026-08-17T19:18:24+02:00     |
| Completed UTC                                | 2026-08-17T20:09:29Z          |
| Completed Europe/Berlin                      | 2026-08-17T22:09:29+02:00     |
| Total wall-clock duration                    | 10,265 seconds (2h 51m 5s)    |
| Total external-wait duration                 | 69 seconds                    |
| Total CI-wait duration                       | 648 seconds                   |
| Total Vercel-wait duration                   | 425.549 seconds               |
| Total recorded rework duration               | 1,209 seconds                 |
| Estimated active implementation duration     | 7,861.451 seconds — Estimated |
| Time to first working two-app local vertical | 2,307 seconds                 |
| Time to first working six-app catalog        | 2,307 seconds                 |
| Time to first green local `release:check:ci` | 3,249 seconds                 |
| Time to PR open                              | 3,700 seconds                 |
| Time to first Preview                        | 4,100 seconds                 |
| Time to first all-green PR head              | 3,869 seconds                 |
| Time to merge                                | 7,374 seconds                 |
| Time to staged Production readiness          | 7,440 seconds                 |
| Time to production promotion                 | 9,065 seconds                 |
| Time to stable-origin proof                  | approximately 9,117 seconds   |
| Required staged observation                  | 1,261 seconds; 18/18 samples  |
| Final verdict                                | Passed                        |

## Phase Durations

| Phase                            | Start UTC            | End UTC              | Duration      | Status     | Dominant category               |
| -------------------------------- | -------------------- | -------------------- | ------------- | ---------- | ------------------------------- |
| P0 — Authority and source freeze | 2026-08-17T17:18:24Z | 2026-08-17T17:22:23Z | 239 seconds   | Passed     | Research and preflight          |
| P1 — Repository foundation       | 2026-08-17T17:22:23Z | 2026-08-17T17:43:15Z | 1,252 seconds | Passed     | Implementation                  |
| P2 — Two-app vertical            | 2026-08-17T17:43:15Z | 2026-08-17T17:56:51Z | 816 seconds   | Passed     | Implementation                  |
| P3 — Six-app catalog             | 2026-08-17T17:56:51Z | 2026-08-17T17:56:51Z | 0 seconds     | Passed     | Implementation                  |
| P4 — Gallery experience          | 2026-08-17T17:56:51Z | 2026-08-17T18:02:37Z | 346 seconds   | Passed     | Implementation                  |
| P5 — Public-runtime hardening    | 2026-08-17T18:02:37Z | 2026-08-17T18:12:33Z | 596 seconds   | Passed     | Implementation and verification |
| P6 — CI and staging deploy       | 2026-08-17T18:12:33Z | 2026-08-17T19:23:10Z | 4,237 seconds | Passed     | CI and Vercel                   |
| P7 — Host compatibility proof    | 2026-08-17T19:50:21Z | 2026-08-17T19:56:06Z | 345 seconds   | Incomplete | Host verification               |
| P8 — Production release          | 2026-08-17T19:23:10Z | 2026-08-17T19:50:21Z | 1,631 seconds | Passed     | Vercel and verification         |
| P9 — Operate and report          | 2026-08-17T19:56:06Z | 2026-08-17T20:09:29Z | 803 seconds   | Passed     | Observation and reporting       |

## Milestone Times

| ID    | Milestone                                              | UTC                  | Europe/Berlin             | Elapsed        |
| ----- | ------------------------------------------------------ | -------------------- | ------------------------- | -------------- |
| M-001 | Benchmark clock started                                | 2026-08-17T17:18:24Z | 2026-08-17T19:18:24+02:00 | 0 seconds      |
| M-002 | Preflight complete                                     | 2026-08-17T17:22:23Z | 2026-08-17T19:22:23+02:00 | 239 seconds    |
| M-003 | Local repository initialized                           | 2026-08-17T17:25:30Z | 2026-08-17T19:25:30+02:00 | 426 seconds    |
| M-004 | Private GitHub repository created and `forward` pushed | 2026-08-17T17:25:30Z | 2026-08-17T19:25:30+02:00 | 426 seconds    |
| M-005 | First working two-app local vertical                   | 2026-08-17T17:56:51Z | 2026-08-17T19:56:51+02:00 | 2,307 seconds  |
| M-006 | First working six-app local catalog                    | 2026-08-17T17:56:51Z | 2026-08-17T19:56:51+02:00 | 2,307 seconds  |
| M-007 | Six UIs passed independent App bridge browser harness  | 2026-08-17T18:02:37Z | 2026-08-17T20:02:37+02:00 | 2,653 seconds  |
| M-008 | First green local `release:check:ci`                   | 2026-08-17T18:12:33Z | 2026-08-17T20:12:33+02:00 | 3,249 seconds  |
| M-009 | Green local release candidate committed                | 2026-08-17T18:17:47Z | 2026-08-17T20:17:47+02:00 | 3,563 seconds  |
| M-010 | Ready pull request opened                              | 2026-08-17T18:20:04Z | 2026-08-17T20:20:04+02:00 | 3,700 seconds  |
| M-011 | First all-green GitHub check set                       | 2026-08-17T18:22:53Z | 2026-08-17T20:22:53+02:00 | 3,869 seconds  |
| M-012 | First explicit Preview became ready                    | 2026-08-17T18:26:44Z | 2026-08-17T20:26:44+02:00 | 4,100 seconds  |
| M-013 | First fully green exact PR-head Preview                | 2026-08-17T18:53:20Z | 2026-08-17T20:53:20+02:00 | 5,696 seconds  |
| M-014 | Clean-clone release check passed                       | 2026-08-17T18:55:20Z | 2026-08-17T20:55:20+02:00 | 5,816 seconds  |
| M-015 | Public-readiness visibility gate completed             | 2026-08-17T18:58:19Z | 2026-08-17T20:58:19+02:00 | 5,995 seconds  |
| M-016 | Vercel Git integration connected                       | 2026-08-17T18:58:34Z | 2026-08-17T20:58:34+02:00 | 6,010 seconds  |
| M-017 | Final exact PR-head Preview proof passed               | 2026-08-17T19:20:59Z | 2026-08-17T21:20:59+02:00 | 7,355 seconds  |
| M-018 | Implementation PR merged by verified squash            | 2026-08-17T19:21:18Z | 2026-08-17T21:21:18+02:00 | 7,374 seconds  |
| M-019 | Exact `forward` Production deployment staged Ready     | 2026-08-17T19:22:24Z | 2026-08-17T21:22:24+02:00 | 7,440 seconds  |
| M-020 | Twenty-minute staged observation completed             | 2026-08-17T19:48:40Z | 2026-08-17T21:48:40+02:00 | 9,016 seconds  |
| M-021 | Exact staged Production deployment promoted            | 2026-08-17T19:49:29Z | 2026-08-17T21:49:29+02:00 | 9,065 seconds  |
| M-022 | Stable-origin network and browser proof passed         | 2026-08-17T19:50:21Z | 2026-08-17T21:50:21+02:00 | 9,117 seconds  |
| M-023 | Installed-host attempts completed honestly             | 2026-08-17T19:56:06Z | 2026-08-17T21:56:06+02:00 | 9,462 seconds  |
| M-024 | Public evidence package reached report cutoff          | 2026-08-17T19:56:06Z | 2026-08-17T21:56:06+02:00 | 9,462 seconds  |
| M-025 | Final local report-publication release check passed    | 2026-08-17T20:09:29Z | 2026-08-17T22:09:29+02:00 | 10,265 seconds |

## Chronological Event Log

| ID      | UTC                  | Europe/Berlin             | Elapsed        | Phase | Category              | Event                                                                                                                                                                                                                                   | Result                          | Related identifier                                  |
| ------- | -------------------- | ------------------------- | -------------- | ----- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------- |
| EVT-001 | 2026-08-17T17:18:24Z | 2026-08-17T19:18:24+02:00 | 0 seconds      | P0    | Benchmark             | Created the two required timeline files before repository or provider mutation.                                                                                                                                                         | Passed                          | `1786987104000`                                     |
| EVT-002 | 2026-08-17T17:22:23Z | 2026-08-17T19:22:23+02:00 | 239 seconds    | P0    | Preflight             | Read the execution contract and source plan; refreshed Snacks `forward`; verified GitHub and Vercel authentication; checked only the SOL targets; froze official source, dependency, protocol, and licensing inputs.                    | Passed                          | `ext-apps@10195ad`, `mcp-handler@7c8fe0a`           |
| EVT-003 | 2026-08-17T17:25:30Z | 2026-08-17T19:25:30+02:00 | 426 seconds    | P1    | Git and GitHub        | Initialized `forward`, committed truthful governance and timing records, created the private SOL repository, and pushed the only expected direct bootstrap commit.                                                                      | Passed                          | `44b5ae3`                                           |
| EVT-004 | 2026-08-17T17:25:30Z | 2026-08-17T19:25:30+02:00 | 426 seconds    | P1    | GitHub                | Explicit default-branch edit returned HTTP 422 immediately after push; direct reads then proved `forward` was already the default and only branch.                                                                                      | Resolved                        | `ISS-001`                                           |
| EVT-005 | 2026-08-17T17:26:02Z | 2026-08-17T19:26:02+02:00 | 458 seconds    | P1    | GitHub                | First branch-protection write returned a provider HTTP 503; follow-up read confirmed protection was not yet applied.                                                                                                                    | Investigating                   | `ISS-002`                                           |
| EVT-006 | 2026-08-17T17:27:11Z | 2026-08-17T19:27:11+02:00 | 527 seconds    | P1    | GitHub                | Retried the same bounded protection request after the transient provider failure and verified the enforced no-direct-push policy.                                                                                                       | Resolved                        | `ISS-002`                                           |
| EVT-007 | 2026-08-17T17:43:15Z | 2026-08-17T19:43:15+02:00 | 1,491 seconds  | P2    | Build                 | First deterministic Get Time bundle measured 539,002 bytes and correctly failed the 524,288-byte resource ceiling.                                                                                                                      | Investigating                   | `ISS-003`, `REG-001`                                |
| EVT-008 | 2026-08-17T17:49:18Z | 2026-08-17T19:49:18+02:00 | 1,854 seconds  | P2    | Build                 | Completed the size-bounded UI adaptation; all six resources measured between 335,863 and 354,133 bytes.                                                                                                                                 | Resolved                        | `ISS-003`, `REG-001`                                |
| EVT-009 | 2026-08-17T17:50:13Z | 2026-08-17T19:50:13+02:00 | 1,909 seconds  | P2    | Typecheck             | First strict typecheck exposed the Terser target literal, unchecked manifest indexing, and named `mcp-handler` export mismatches.                                                                                                       | Investigating                   | `ISS-004`, `REG-002`                                |
| EVT-010 | 2026-08-17T17:51:10Z | 2026-08-17T19:51:10+02:00 | 1,966 seconds  | P2    | Typecheck             | Corrected the four integration type contracts; strict `tsc --noEmit` passed.                                                                                                                                                            | Resolved                        | `ISS-004`, `REG-002`                                |
| EVT-011 | 2026-08-17T17:56:51Z | 2026-08-17T19:56:51+02:00 | 2,307 seconds  | P2    | Protocol verification | All six current `2026-07-28` and all six legacy contracts passed with isolated tools/resources, ordinary fallback, repeated cycles, and 20 representative clients.                                                                      | Passed                          | `M-005`, `M-006`                                    |
| EVT-012 | 2026-08-17T17:58:42Z | 2026-08-17T19:58:42+02:00 | 2,418 seconds  | P4    | Typecheck             | Official `ext-apps` AppBridge declarations failed strict NodeNext resolution because the published declarations contain extensionless internal imports.                                                                                 | Investigating                   | `ISS-005`                                           |
| EVT-013 | 2026-08-17T17:59:19Z | 2026-08-17T19:59:19+02:00 | 2,455 seconds  | P4    | Typecheck             | Isolated the declaration defect behind a narrow typed browser-test runtime shim; `skipLibCheck` remained disabled and strict checks passed.                                                                                             | Resolved                        | `ISS-005`                                           |
| EVT-014 | 2026-08-17T18:01:07Z | 2026-08-17T20:01:07+02:00 | 2,563 seconds  | P4    | Browser verification  | First Playwright run exposed a development asset-route collision that returned 404 for gallery CSS/JS, breaking copy and 320 px layout; three other failures were locator ambiguities.                                                  | Investigating                   | `ISS-006`, `REG-003`                                |
| EVT-015 | 2026-08-17T18:02:37Z | 2026-08-17T20:02:37+02:00 | 2,653 seconds  | P4    | Browser verification  | Repaired exact asset fallthrough and stable locators; all six UIs initialized in the official AppBridge host and all ten browser/accessibility checks passed.                                                                           | Resolved                        | `ISS-006`, `REG-003`, `M-007`                       |
| EVT-016 | 2026-08-17T18:04:26Z | 2026-08-17T20:04:26+02:00 | 2,762 seconds  | P5    | Lint and security     | Type-aware lint correctly rejected object spread over the full `HeadersInit` union because tuple arrays would become numeric object keys.                                                                                               | Investigating                   | `ISS-007`, `REG-004`                                |
| EVT-017 | 2026-08-17T18:05:34Z | 2026-08-17T20:05:34+02:00 | 2,830 seconds  | P5    | Lint and security     | Replaced generic header spreads with the platform `Headers` API and reran affected verification.                                                                                                                                        | Resolved                        | `ISS-007`, `REG-004`                                |
| EVT-018 | 2026-08-17T18:07:38Z | 2026-08-17T20:07:38+02:00 | 2,954 seconds  | P5    | Secret scan           | Initial secret scan falsely matched uppercase `VERCEL_PROJECT_PRODUCTION_URL` because the credential-prefix expression was case-insensitive.                                                                                            | Investigating                   | `ISS-008`, `REG-005`                                |
| EVT-019 | 2026-08-17T18:07:53Z | 2026-08-17T20:07:53+02:00 | 2,969 seconds  | P5    | Secret scan           | Scoped the provider token prefix to its real lowercase form; the same full repository scan passed without value/path suppression.                                                                                                       | Resolved                        | `ISS-008`, `REG-005`                                |
| EVT-020 | 2026-08-17T18:08:03Z | 2026-08-17T20:08:03+02:00 | 2,979 seconds  | P5    | Dependency audit      | Production audit passed; the complete audit found moderate `GHSA-48c2-rrv3-qjmp` in direct development dependency `yaml@2.8.1`.                                                                                                         | Investigating                   | `ISS-009`                                           |
| EVT-021 | 2026-08-17T18:08:15Z | 2026-08-17T20:08:15+02:00 | 2,991 seconds  | P5    | Dependency audit      | Upgraded exactly to patched `yaml@2.8.3`, regenerated lock/SBOM, and obtained a clean complete audit.                                                                                                                                   | Resolved                        | `ISS-009`                                           |
| EVT-022 | 2026-08-17T18:12:33Z | 2026-08-17T20:12:33+02:00 | 3,249 seconds  | P5    | Release verification  | First complete local `release:check:ci` passed frozen install, formatting, lint, strict types, 42 Vitest checks, 10 Playwright checks, notices, provenance, architecture, full audit, scans, SBOM, deterministic generation, and build. | Passed                          | `M-008`                                             |
| EVT-023 | 2026-08-17T18:17:47Z | 2026-08-17T20:17:47+02:00 | 3,563 seconds  | P6    | Git                   | Committed the coherent green implementation, generated artifacts, tests, security/provenance controls, and truthful running timeline on `sol/gallery-v1`.                                                                               | Passed                          | `5d0cba19f21a539e133a8ef079b0c2ade7eac93b`, `M-009` |
| EVT-024 | 2026-08-17T18:20:04Z | 2026-08-17T20:20:04+02:00 | 3,700 seconds  | P6    | GitHub                | Pushed `sol/gallery-v1` and opened ready PR 1 against `forward` with architecture, safety, provenance, verification, limitations, and rollback documented.                                                                              | Passed                          | `PR-1`, `M-010`                                     |
| EVT-025 | 2026-08-17T18:22:53Z | 2026-08-17T20:22:53+02:00 | 3,869 seconds  | P6    | CI                    | Release check, CodeQL, locked audit, and public-readiness passed on the exact PR head; dependency review skipped while the repository remained private.                                                                                 | Passed                          | `a315b24a35dd9afcb99752f0395e352abb6500fe`, `M-011` |
| EVT-026 | 2026-08-17T18:22:58Z | 2026-08-17T20:22:58+02:00 | 3,874 seconds  | P6    | Vercel configuration  | Vercel rejected Git connection for the private organization repository on Hobby; retained the exact project configuration and used manual protected Preview until the authorized public-visibility gate.                                | Deferred                        | `ISS-010`                                           |
| EVT-027 | 2026-08-17T18:23:16Z | 2026-08-17T20:23:16+02:00 | 3,892 seconds  | P6    | Vercel deployment     | An unqualified first deploy unexpectedly targeted Production and assigned the stable alias despite automatic-domain controls.                                                                                                           | Investigating                   | `DEP-001`, `ISS-011`, `REG-006`                     |
| EVT-028 | 2026-08-17T18:25:20Z | 2026-08-17T20:25:20+02:00 | 4,016 seconds  | P6    | Vercel deployment     | Removed only the premature stable alias, retained the immutable deployment record, and changed subsequent commands to explicit target flags.                                                                                            | Resolved                        | `DEP-001`, `ISS-011`, `REG-006`                     |
| EVT-029 | 2026-08-17T18:26:44Z | 2026-08-17T20:26:44+02:00 | 4,100 seconds  | P6    | Vercel deployment     | Explicit `target=preview` DEP-002 became ready at exact head `a315b24` after 70 seconds.                                                                                                                                                | Passed                          | `DEP-002`, `M-012`                                  |
| EVT-030 | 2026-08-17T18:34:10Z | 2026-08-17T20:34:10+02:00 | 4,546 seconds  | P6    | Preview verification  | Direct proof reached Vercel Authentication rather than the app; Standard Protection remained enabled and the supported automation bypass was selected.                                                                                  | Resolved                        | `ISS-012`                                           |
| EVT-031 | 2026-08-17T18:38:26Z | 2026-08-17T20:38:26+02:00 | 4,802 seconds  | P6    | Credential hygiene    | A diagnostic projection exposed the initial bypass because Vercel represents it as an object key; it was revoked and regenerated before successful proof, with the replacement retained only in ephemeral process state.                | Resolved                        | `ISS-013`, `REG-007`                                |
| EVT-032 | 2026-08-17T18:40:20Z | 2026-08-17T20:40:20+02:00 | 4,916 seconds  | P6    | Preview verification  | Exact Preview network proof passed all six current and six legacy MCP contracts, public metadata/headers, negative boundaries, and post-abort health after correcting a doctype-case verifier false negative.                           | Passed                          | `DEP-002`, `ISS-014`                                |
| EVT-033 | 2026-08-17T18:41:35Z | 2026-08-17T20:41:35+02:00 | 4,991 seconds  | P6    | Browser verification  | All six deployed App UIs passed through the independent AppBridge host, but the full build SHA widened the 320 px gallery to 356 px.                                                                                                    | Failed                          | `DEP-002`, `ISS-015`, `REG-008`                     |
| EVT-034 | 2026-08-17T18:42:57Z | 2026-08-17T20:42:57+02:00 | 5,073 seconds  | P6    | Browser verification  | Wrapped code values, made local proof always use a 40-character SHA, regenerated the gallery, and passed build, 42 Vitest checks, and ten Playwright checks. DEP-002 remains failed pending a replacement Preview.                      | Resolved                        | `ISS-015`, `REG-008`                                |
| EVT-035 | 2026-08-17T18:53:20Z | 2026-08-17T20:53:20+02:00 | 5,696 seconds  | P6    | Preview verification  | DEP-003 at exact `cd7fc1d` passed the complete network verifier and all ten deployed browser checks, including six AppBridge interactions and the repaired full-SHA 320 px layout.                                                      | Passed                          | `DEP-003`, `M-013`, `ISS-015`, `REG-008`            |
| EVT-036 | 2026-08-17T18:53:48Z | 2026-08-17T20:53:48+02:00 | 5,724 seconds  | P6    | GitHub protection     | Recorded exact Preview proof as a commit status and made release, CodeQL, audit, public-readiness, and Preview proof strict required contexts on `forward`.                                                                             | Passed                          | `cd7fc1de70faef272bb96b625895c3ddfb8d3790`          |
| EVT-037 | 2026-08-17T18:55:20Z | 2026-08-17T20:55:20+02:00 | 5,816 seconds  | P6    | Clean clone           | Fresh exact-head clone passed `release:check`, including all local gates and a production-shaped Vercel build.                                                                                                                          | Passed                          | `M-014`                                             |
| EVT-038 | 2026-08-17T18:56:20Z | 2026-08-17T20:56:20+02:00 | 5,876 seconds  | P6    | GitHub merge          | Rebase merge was rejected because the parent rule requires signed commits and GitHub cannot sign automatic rebases; selected allowed signed squash without changing the PR.                                                             | Resolved                        | `ISS-016`                                           |
| EVT-039 | 2026-08-17T18:56:45Z | 2026-08-17T20:56:45+02:00 | 5,901 seconds  | P6    | GitHub merge          | Signed squash remained blocked by parent requirements for non-last-pusher approval and persisted Code Scanning; repository-local policy cannot bypass the parent rule.                                                                  | Investigating                   | `ISS-017`                                           |
| EVT-040 | 2026-08-17T18:58:19Z | 2026-08-17T20:58:19+02:00 | 5,995 seconds  | P6    | GitHub visibility     | After every legal, provenance, security, secret, dependency, clean-clone, public-readiness, and Preview gate passed, changed only the namespaced repository to public to enable parent Code Scanning and installed integrations.        | Passed                          | `M-015`, `ISS-017`                                  |
| EVT-041 | 2026-08-17T18:58:34Z | 2026-08-17T20:58:34+02:00 | 6,010 seconds  | P6    | Vercel Git            | Connected the exact public repository to the exact project; Vercel derived `forward` as Production Branch and retained Node 24, Hono, frozen install/build, and no automatic custom-domain assignment.                                  | Passed                          | `M-016`, `ISS-010`                                  |
| EVT-042 | 2026-08-17T19:02:44Z | 2026-08-17T21:02:44+02:00 | 6,260 seconds  | P6    | Dependency review     | First public dependency review failed because GitHub's dependency graph was not yet enabled; the independent locked production audit remained green.                                                                                    | Failed                          | `ISS-018`                                           |
| EVT-043 | 2026-08-17T19:03:36Z | 2026-08-17T21:03:36+02:00 | 6,312 seconds  | P6    | Vercel Git Preview    | Native Git-linked DEP-004 became ready and Vercel passed exact documentation head `f1a208c`; manual proof was deferred because the public security run required a source repair.                                                        | Incomplete                      | `DEP-004`                                           |
| EVT-044 | 2026-08-17T19:03:42Z | 2026-08-17T21:03:42+02:00 | 6,318 seconds  | P6    | Code Scanning         | First persisted public policy check found one real high partial-PURL-encoding alert and three findings inside the immutable non-runtime upstream provenance snapshot.                                                                   | Failed                          | `ISS-019`, `ISS-020`, `REG-009`                     |
| EVT-045 | 2026-08-17T19:04:29Z | 2026-08-17T21:04:29+02:00 | 6,365 seconds  | P6    | GitHub governance     | Added a transparent same-repository release approval that can run only after complete exact-head release checks; every independent parent and repository gate remains enforced.                                                         | Pending proof                   | `ISS-017`                                           |
| EVT-046 | 2026-08-17T19:05:20Z | 2026-08-17T21:05:20+02:00 | 6,416 seconds  | P6    | GitHub security       | Enabled dependency graph, secret scanning, and push protection on the namespaced public repository without paid capacity or automatic dependency-update writes.                                                                         | Passed                          | `ISS-018`                                           |
| EVT-047 | 2026-08-17T19:06:05Z | 2026-08-17T21:06:05+02:00 | 6,461 seconds  | P6    | Code Scanning         | Replaced partial package-name substitution with complete URI encoding; preserved the frozen snapshot and dismissed only its three non-runtime findings with explicit immutable-source and synthetic-data rationale.                     | Resolved locally, pending CI    | `ISS-019`, `ISS-020`, `REG-009`                     |
| EVT-048 | 2026-08-17T19:06:20Z | 2026-08-17T21:06:20+02:00 | 6,476 seconds  | P6    | GitHub API            | First dismissal request used a typographic apostrophe outside GitHub's exact enum and returned 422 without mutation; the documented ASCII enum succeeded and returned the intended states.                                              | Resolved                        | `REWORK-013`                                        |
| EVT-049 | 2026-08-17T19:07:03Z | 2026-08-17T21:07:03+02:00 | 6,519 seconds  | P6    | Release verification  | Governance and PURL correction candidate passed full local release checks: 42 Vitest, ten browser checks, audits, scans, notices, deterministic generation, and production build.                                                       | Passed                          | `ISS-019`, `REG-009`                                |
| EVT-050 | 2026-08-17T19:11:12Z | 2026-08-17T21:11:12+02:00 | 6,768 seconds  | P6    | Dependency review     | Closing native dependency review still reported unsupported; exact-head required `locked-audit` passed five seconds later.                                                                                                              | Incomplete with Passed fallback | `ISS-018`                                           |
| EVT-051 | 2026-08-17T19:11:56Z | 2026-08-17T21:11:56+02:00 | 6,812 seconds  | P6    | Vercel Git Preview    | Final native protected Preview DEP-005 became Ready at exact head `ba648fd`; Vercel status passed.                                                                                                                                      | Passed provider readiness       | `DEP-005`                                           |
| EVT-052 | 2026-08-17T19:12:06Z | 2026-08-17T21:12:06+02:00 | 6,822 seconds  | P6    | Code Scanning         | Exact-head CodeQL analysis/policy passed and zero CodeQL alerts remained open.                                                                                                                                                          | Passed                          | `ISS-019`, `ISS-020`, `REG-009`                     |
| EVT-053 | 2026-08-17T19:12:43Z | 2026-08-17T21:12:43+02:00 | 6,859 seconds  | P6    | GitHub governance     | Exact-head release gate and transparent head-bound approval passed without bypassing any independent rule.                                                                                                                              | Passed                          | `ISS-017`                                           |
| EVT-054 | 2026-08-17T19:20:59Z | 2026-08-17T21:20:59+02:00 | 7,355 seconds  | P6    | Preview proof         | Exact protected Preview passed public surface, 12 app/protocol contracts, boundaries/recovery, all ten browser checks, copied URLs, and six App renderings; required status published.                                                  | Passed                          | `M-017`, `DEP-005`, `ISS-021`                       |
| EVT-055 | 2026-08-17T19:21:18Z | 2026-08-17T21:21:18+02:00 | 7,374 seconds  | P6    | GitHub merge          | Merged PR #1 by verified signed squash to `forward` as `b0108c71a58289d111674c2f7315bb8e3355113a`.                                                                                                                                      | Passed                          | `M-018`, `ISS-017`                                  |
| EVT-056 | 2026-08-17T19:22:24Z | 2026-08-17T21:22:24+02:00 | 7,440 seconds  | P8    | Staged Production     | DEP-006 became Ready from exact `forward` SHA with the stable domain withheld.                                                                                                                                                          | Passed provider readiness       | `M-019`, `DEP-006`                                  |
| EVT-057 | 2026-08-17T19:23:10Z | 2026-08-17T21:23:10+02:00 | 7,486 seconds  | P6    | Post-merge CI         | `forward` CI, CodeQL, public readiness, native Vercel, and zero-open-alert verification completed green.                                                                                                                                | Passed                          | `b0108c71`                                          |
| EVT-058 | 2026-08-17T19:26:38Z | 2026-08-17T21:26:38+02:00 | 7,694 seconds  | P8    | Staged canary         | Exact staged Production passed full network/browser proof and three complete canary rounds while stable remained withheld.                                                                                                              | Passed                          | `DEP-006`, `ISS-021`                                |
| EVT-059 | 2026-08-17T19:29:06Z | 2026-08-17T21:29:06+02:00 | 7,842 seconds  | P8    | Diagnostic hygiene    | A host inventory command over-read process arguments and transient sensitive environment values; process inspection stopped and nothing was persisted into evidence.                                                                    | Contained                       | `ISS-022`, `REG-011`                                |
| EVT-060 | 2026-08-17T19:48:40Z | 2026-08-17T21:48:40+02:00 | 9,016 seconds  | P8    | Staged observation    | Completed 1,261 continuous seconds with 18/18 full samples, repeated browser rendering, and two safe 64-client bursts.                                                                                                                  | Passed                          | `M-020`, `DEP-006`                                  |
| EVT-061 | 2026-08-17T19:49:29Z | 2026-08-17T21:49:29+02:00 | 9,065 seconds  | P8    | Promotion             | Promoted exact DEP-006 without rebuilding; automatic domain assignment remained disabled.                                                                                                                                               | Passed                          | `M-021`, `DEP-006`                                  |
| EVT-062 | 2026-08-17T19:50:21Z | 2026-08-17T21:50:21+02:00 | 9,117 seconds  | P8    | Stable Production     | Explicitly attached only the namespaced stable project domain and passed the full unprotected stable network/browser matrix at exact SHA.                                                                                               | Passed                          | `M-022`, `DEP-006`                                  |
| EVT-063 | 2026-08-17T19:56:06Z | 2026-08-17T21:56:06+02:00 | 9,462 seconds  | P7    | Host compatibility    | Installed OpenWork reported three isolated SOL servers Ready before concurrent shared-app control switched the window; stopped without touching unrelated work. No safe non-metered second host was available.                          | Incomplete                      | `M-023`, `ISS-023`, `REG-012`                       |
| EVT-064 | 2026-08-17T19:56:06Z | 2026-08-17T21:56:06+02:00 | 9,462 seconds  | P9    | Reporting             | Established the public evidence cutoff and began final README/report/result/timeline publication.                                                                                                                                       | Passed                          | `M-024`                                             |
| EVT-065 | 2026-08-17T20:09:29Z | 2026-08-17T22:09:29+02:00 | 10,265 seconds | P9    | Release verification  | Passed the complete local report-publication release check, including the linked Vercel production build.                                                                                                                               | Passed                          | `M-025`                                             |

## Issues Encountered

### ISS-001 — Redundant default-branch update rejected

- First observed: 2026-08-17T17:25:30Z (426 seconds elapsed)
- Resolved: 2026-08-17T17:25:30Z (426 seconds elapsed)
- Phase: P1
- Classification: GitHub
- Origin: external
- Expected: explicitly setting the pushed `forward` branch as default succeeds.
- Observed and symptom: GitHub returned HTTP 422 with `Repository.default_branch is invalid` immediately after the first push.
- Bounded explanation: repository initialization and branch propagation raced with a redundant default-branch edit; GitHub had already selected the only pushed branch.
- Attempts: inspected the exact repository; listed only its branches.
- Final correction: no state change was needed because exact reads showed `forward` was already the default and only branch.
- Affected files and commits: none; bootstrap commit `44b5ae3` remained valid.
- Invalidated proof: none.
- Closing verification: repository view reported private visibility and default branch `forward`; branch listing returned only `forward`.
- Time-to-detect and time-to-repair: not separately measurable at sub-second command granularity.
- Final status: Resolved.

### ISS-002 — GitHub branch-protection endpoint unavailable

- First observed: 2026-08-17T17:26:02Z (458 seconds elapsed)
- Resolved: 2026-08-17T17:27:11Z (527 seconds elapsed)
- Phase: P1
- Classification: GitHub
- Origin: external
- Expected: the branch-protection API applies the no-direct-push, linear-history, no-force, no-delete, and conversation-resolution policy.
- Observed and symptom: the write returned HTTP 503 and an immediate read returned `Branch not protected`.
- Bounded explanation: GitHub reported that no server was available to service the protection request.
- Attempts: one exact REST protection write followed by one exact protection read; one bounded retry of the same write after recording the transient failure; one exact closing read.
- Final correction: the retry succeeded without changing the intended policy.
- Affected files and commits: none.
- Invalidated proof: branch-protection proof during the retry interval.
- Closing verification: admin enforcement, pull-request requirement, linear history, conversation resolution, no force pushes, and no deletions all reported the intended values.
- Time-to-detect: immediate.
- Time-to-repair: 69 seconds.
- Final status: Resolved.

### ISS-003 — Initial Get Time App bundle exceeded the resource ceiling

- First observed: 2026-08-17T17:43:15Z (1,491 seconds elapsed)
- Resolved: 2026-08-17T17:49:18Z (1,854 seconds elapsed)
- Phase: P2
- Classification: implementation
- Origin: self-introduced
- Expected: every deterministic single-file MCP App resource is at most 524,288 bytes.
- Observed and symptom: the first Get Time build was 539,002 bytes and the generator failed closed.
- Root cause or best bounded explanation: the initial Vite configuration used esbuild's single-pass minifier for a React plus MCP Apps bridge bundle.
- Attempts: one complete deterministic build using esbuild minification; one three-pass Terser build; one five-pass top-level Terser build; one complete six-app measurement with a lightweight Chart.js API adapter; final size-bounded UI adaptations for the three React-heavy views.
- Final correction: retained the frozen upstream audit snapshot, used gallery-owned vanilla MCP Apps adaptations for Get Time, Cohort Heatmap, and Scenario Modeler, and aliased broad Chart.js registration to a bounded canvas implementation for the other chart views.
- Affected files: `scripts/bundle-mcp-app-resources.ts`, planned dependency lock.
- Affected commits: uncommitted feature work only.
- Invalidated proof: first two-app vertical and all resource-size proof.
- Closing verification: complete generator passed with Get Time 335,863; Budget Allocator 354,133; Cohort Heatmap 337,864; Customer Segmentation 348,890; Scenario Modeler 339,570; Transcript 345,103 bytes.
- Time-to-detect: first resource build.
- Time-to-repair: 363 seconds.
- Final status: Resolved.

### ISS-004 — First strict typecheck rejected integration contracts

- First observed: 2026-08-17T17:50:13Z (1,909 seconds elapsed)
- Resolved: 2026-08-17T17:51:10Z (1,966 seconds elapsed)
- Phase: P2
- Classification: implementation
- Origin: self-introduced
- Expected: strict TypeScript with unchecked indexed access passes.
- Observed and symptom: the first check reported the unsupported Terser `ecma` literal, unchecked public-manifest values, tuple inference in the architecture check, and the named export shape of `mcp-handler` 2.1.1.
- Root cause: initial integration code was authored against looser inferred types and the README's default-export presentation instead of the package's published TypeScript declarations.
- Attempts: first `tsc --noEmit` run; targeted declaration corrections; closing `tsc --noEmit` run.
- Final correction: used the published named `createMcpHandler` export, explicit public-manifest types, tuple literals for header assertions, and the supported Terser ECMA target.
- Affected files: `scripts/bundle-mcp-app-resources.ts`, `scripts/check-vercel-architecture.ts`, `src/gallery-render.ts`, `src/mcp-app-adapter.ts`.
- Affected commits: uncommitted feature work only.
- Invalidated proof: strict typecheck and two-app vertical.
- Closing verification: strict `tsc --noEmit` passed with zero errors.
- Time-to-detect: first strict typecheck.
- Time-to-repair: 57 seconds.
- Final status: Resolved.

### ISS-005 — Published AppBridge declarations failed strict NodeNext

- First observed: 2026-08-17T17:58:42Z (2,418 seconds elapsed)
- Resolved: 2026-08-17T17:59:19Z (2,455 seconds elapsed)
- Phase and origin: P4; external third-party declaration defect.
- Expected: the official `ext-apps` AppBridge entrypoint typechecks under strict NodeNext.
- Observed: its published `.d.ts` files referenced extensionless internal modules and produced TS2834/TS2835 before the browser bundle ran.
- Attempts: direct official import; review of the frozen implementation and published surface; a minimal typed local boundary that re-exports the unchanged official browser runtime.
- Final correction: retained `skipLibCheck: false` and isolated only the browser-test host re-export behind a narrow declaration shim.
- Affected files: `test-support/browser-host.ts`, `test-support/ext-apps-app-bridge-runtime.js`, and its `.d.ts`.
- Invalidated proof: strict typecheck and browser-host build.
- Closing verification: strict TypeScript, Vite host build, and all six AppBridge browser initializations passed.
- Time-to-repair: 37 seconds. Final status: Resolved.

### ISS-006 — Development asset route broke first browser proof

- First observed: 2026-08-17T18:01:07Z (2,563 seconds elapsed)
- Resolved: 2026-08-17T18:02:37Z (2,653 seconds elapsed)
- Phase and origin: P4; self-introduced.
- Expected: the development host serves screenshots plus application-owned content-hashed CSS/JS and every App initializes.
- Observed: the broad screenshot route intercepted all `/assets/:filename` requests, returning 404 for gallery CSS and JS; copy did not attach and the unstyled 320 px page overflowed. Three additional failures were mutable/ambiguous role locators in the test harness.
- Attempts: complete ten-test run; standalone headless reproduction that captured exact failed asset requests; exact screenshot routing plus application fallthrough; immutable id/CSS locators; full rerun.
- Final correction: the wrapper handles only known screenshot digests and delegates all other assets; tests use stable locators where live-region roles legitimately overlap.
- Affected files: `scripts/dev.ts`, `tests/browser/gallery.spec.ts`, `tests/browser/mcp-app-host.spec.ts`.
- Invalidated proof: browser rendering, copy URL, accessibility, 320 px layout, and UI-to-tool interaction.
- Closing verification: all ten Playwright checks passed, including six AppBridge UIs and the accessibility/mobile cases.
- Time-to-repair: 90 seconds. Final status: Resolved.

### ISS-007 — Generic header spread was not valid for every HeadersInit form

- First observed: 2026-08-17T18:04:26Z (2,762 seconds elapsed)
- Resolved: 2026-08-17T18:05:34Z (2,830 seconds elapsed)
- Phase and origin: P5; self-introduced.
- Expected: record, tuple-array, and `Headers` inputs retain HTTP header semantics.
- Observed: type-aware lint proved tuple arrays would become numeric keys when spread into an object.
- Final correction: use the platform `Headers` API for generic composition and keep object spread only behind the internally guaranteed `Record<string,string>` CORS helper.
- Affected files: `src/gateway.ts`, `tests/gateway/boundaries.test.ts`.
- Invalidated proof: lint and gateway header behavior.
- Closing verification: lint, strict TypeScript, 42 Vitest checks, ten browser checks, and the full release gate passed.
- Time-to-repair: 68 seconds. Final status: Resolved.

### ISS-008 — Secret scanner rejected an uppercase environment identifier

- First observed: 2026-08-17T18:07:38Z (2,954 seconds elapsed)
- Resolved: 2026-08-17T18:07:53Z (2,969 seconds elapsed)
- Phase and origin: P5; self-introduced verification-harness false positive.
- Expected: real provider token prefixes are detected without treating ordinary identifiers as values.
- Observed: the case-insensitive Vercel-token pattern matched `VERCEL_PROJECT_PRODUCTION_URL`.
- Final correction: match the provider's real lowercase `vercel_`/`vcp_` credential prefixes without adding a path or content suppression.
- Affected file: `scripts/scan-secrets.ts`.
- Invalidated proof: secret scan and public readiness.
- Closing verification: the same 117-file scan passed and remained in the full release gate.
- Time-to-repair: 15 seconds. Final status: Resolved.

### ISS-009 — Complete audit found a patched YAML development advisory

- First observed: 2026-08-17T18:08:03Z (2,979 seconds elapsed)
- Resolved: 2026-08-17T18:08:15Z (2,991 seconds elapsed)
- Phase and origin: P5; external dependency advisory.
- Expected: production and complete locked audits are clean.
- Observed: production dependencies were clean; the complete audit reported moderate `GHSA-48c2-rrv3-qjmp` in direct build dependency `yaml@2.8.1` and identified `2.8.3` as patched.
- Attempts: production audit; exact JSON advisory/path review; narrow exact upgrade; regenerated lock and SBOM; complete audit rerun.
- Final correction: pin `yaml@2.8.3`; no hosted runtime dependency or behavior changed.
- Affected files: `package.json`, `pnpm-lock.yaml`, `generated/sbom.cdx.json`.
- Invalidated proof: dependency audit, SBOM, and release check.
- Closing verification: complete audit returned no known vulnerabilities and the full gate regenerated the SBOM.
- Time-to-repair: 12 seconds. Final status: Resolved.

### ISS-010 — Private organization repository could not connect on Vercel Hobby

- First observed: 2026-08-17T18:22:58Z (3,874 seconds elapsed). Phase/origin: P6; external plan constraint.
- Expected: connect the exact Vercel project to the exact private GitHub repository and receive a native deployment check.
- Observed: Vercel rejected the private organization repository on the current Hobby plan.
- Interim correction: retained correct project settings and used a manual protected Preview.
- Final correction: after Preview, security, legal, and public-readiness gates passed, made only this repository public and connected it without spend.
- Closing verification: the project link reports only `different-ai/openwork-mcp-app-gallery-sol` with Production Branch `forward`. Status: Resolved.

### ISS-011 — First unqualified Vercel deploy targeted Production

- Observed/resolved: 2026-08-17T18:23:16Z / 2026-08-17T18:25:20Z. Phase/origin: P6; self-introduced command ambiguity plus provider default.
- Expected: unpromoted Preview with no stable alias. Observed: `target=production` and `aliasAssigned=true`.
- Correction: removed only the premature alias, retained the immutable deployment for audit, and used explicit target flags thereafter.
- User impact: a new stable hostname briefly resolved to the unverified build; there was no prior production to displace.
- Invalidated proof: first-Preview sequence and promotion order. Status: Resolved.

### ISS-012 — Standard Protection intercepted direct Preview proof

- Observed/resolved: 2026-08-17T18:34:10Z / 2026-08-17T18:34:42Z. Phase/origin: P6; expected external protection behavior.
- An unauthenticated request received a 302 Vercel Authentication redirect before `/healthz`.
- Correction: kept Standard Protection enabled and used Vercel's supported automation bypass only through ephemeral request headers.
- Closing verification: exact protected Preview network and browser requests reached the app while unauthenticated access remained protected. Status: Resolved.

### ISS-013 — Diagnostic output revealed an automation-bypass object key

- Observed/resolved: 2026-08-17T18:35:40Z / 2026-08-17T18:38:26Z. Phase/origin: P6; self-introduced credential-hygiene regression.
- Expected: redact secret values. Observed: Vercel represents each bypass secret as a property name, so value-only redaction was insufficient.
- Correction: stopped using the exposed value, read the exact official revoke/regenerate schema, rotated it, and handled the replacement only in ephemeral process state with no later key enumeration.
- Invalidated proof: the first bypass and all proof before rotation. Closing verification: Vercel reported a newly created bypass before any successful Preview proof. Status: Resolved.

### ISS-014 — Deployment verifier treated HTML doctype case as significant

- Observed/resolved: 2026-08-17T18:39:20Z / 2026-08-17T18:39:46Z. Phase/origin: P6; self-introduced verifier false negative.
- Budget Allocator returned the correct MIME, resource, and 354,133-byte HTML but used frozen upstream uppercase `DOCTYPE`.
- Correction: aligned the remote verifier with the existing standards-insensitive local contract without weakening MIME, size, URI, or document checks.
- Closing verification: all six current and six legacy deployed contracts passed. Status: Resolved.

### ISS-015 — Full deployed SHA overflowed the 320 px gallery

- Observed/local correction: 2026-08-17T18:41:35Z / 2026-08-17T18:42:57Z. Phase/origin: P6; self-introduced responsive regression.
- All six deployed App UIs passed, but the full 40-character build SHA made the document 356 px wide at a 320 px viewport. Local proof had used the shorter `development` label.
- Correction: added safe wrapping for inline code metadata and made every local browser run use a production-length SHA fixture.
- Closing verification: DEP-003 at correction commit `cd7fc1d` passed all ten deployed browser checks, including the full-SHA 320 px case and all six App UIs. Status: Resolved.

### ISS-016 — Required signatures rejected GitHub's rebase merge

- Observed/resolved: 2026-08-17T18:56:20Z. Phase/origin: P6; external GitHub merge-method constraint.
- The parent rule requires signed commits, while GitHub cannot automatically sign rebase results.
- Correction: selected the other parent-allowed linear method, GitHub's signed squash merge, while retaining full milestone history on `sol/gallery-v1`.
- Closing verification: the PR remained open and unchanged. Status: Resolved.

### ISS-017 — Parent ruleset requires non-author approval and persisted Code Scanning

- Observed/resolved: 2026-08-17T18:56:45Z / 2026-08-17T19:21:18Z. Phase/origin: P6; external organization policy.
- The active parent rule requires one approval from someone other than the last pusher plus Code Scanning results. The sole operator cannot self-approve, and private visibility suppressed SARIF persistence.
- Correction: completed the authorized visibility transition after all public-readiness gates, fixed the real CodeQL alert, preserved explicit frozen-source dispositions, and used a transparent GitHub Actions approval that can act only after the exact observed PR head's complete release check passes.
- Closing verification: exact-head approval, CodeQL, every required status, and verified signed squash `b0108c71` passed. No shared-rule exception or weakening was made. Status: Resolved.

### ISS-018 — Public dependency graph was not enabled

- First observed: 2026-08-17T19:02:44Z. Phase/origin: P6; self-introduced configuration omission followed by provider unavailability.
- Native dependency review reported that it was unsupported, while the independent locked production audit remained green.
- Attempts: enabled the exact repository's available no-cost security settings; kept automatic dependency-update writes disabled; reran on the final public exact head; checked GitHub's public dependency graph/review documentation and exact repository API state.
- Final state: the closing native action still reported unsupported. The prompt-authorized `locked-audit` fallback was required by protection and passed on the exact head; `forward` repeated frozen install, production/full audit, SBOM, and dependency-source verification. Status: Incomplete with Passed fallback.

### ISS-019 — SBOM generator used partial package-name encoding

- Observed/resolved: 2026-08-17T19:03:42Z / 2026-08-17T19:12:06Z. Phase/origin: P6; self-introduced.
- CodeQL reported high-severity incomplete sanitization because the PURL builder replaced only the first slash.
- Correction: use `encodeURIComponent` for the complete npm package name and regenerate the deterministic CycloneDX inventory.
- Closing verification: full local release gate, exact-head persisted CodeQL analysis/policy, zero-open-alert check, and post-merge `forward` CodeQL all passed. Status: Resolved.

### ISS-020 — CodeQL findings belonged to the immutable upstream snapshot

- Observed/resolved: 2026-08-17T19:03:42Z / 2026-08-17T19:06:20Z. Phase/origin: P6; external frozen source.
- CodeQL reported two insecure-randomness findings used only by upstream synthetic demo-data generation and one identity replacement in the non-runtime provenance snapshot.
- Correction: kept the frozen source in scan scope and byte-for-byte unchanged; dismissed only those three alerts with explicit immutable-source, non-runtime, and synthetic-data rationale.
- Closing verification: the three snapshot alerts remained explicitly dismissed, the real generator alert closed after its source repair, exact-head and post-merge CodeQL passed, and zero alerts remained open. Status: Resolved.

### ISS-021 — Deployment verifier conflated staged and public origins

- Observed during final exact-head Preview proof between 2026-08-17T19:12:43Z and 19:20:59Z; resolved by the first staged canary at 19:25:57Z. Exact sub-command detection time was not separately recorded.
- The first verifier used one URL for both artifact reachability and the canonical endpoint origin, causing a false manifest mismatch for protected/staged aliases.
- Correction: separately validate the deployment origin under test and the expected public manifest origin, defaulting them together for ordinary Preview and stable proof.
- Closing verification: strict TypeScript, exact staged proof, complete staged browser matrix, and stable proof passed. Status: Resolved.

### ISS-022 — Host inventory diagnostic exceeded its output scope

- Observed and contained between staged samples at 2026-08-17T19:27:51Z and 19:29:06Z; exact sub-command timestamp was not separately recorded.
- A process-list diagnostic printed whole command lines and transient sensitive environment values instead of only safe application names.
- Correction: stopped process inspection immediately; retained only the safe application-name inventory; excluded all transient content from repository evidence and reports.
- Closing verification: subsequent host facts came only from app-bundle metadata or narrowly filtered app state. No value was committed, uploaded, or copied into evidence. Status: Resolved.

### ISS-023 — OpenWork file-picker snapshot exceeded its output scope

- Observed and contained during the installed-host attempt between 2026-08-17T19:50:21Z and 19:56:06Z; exact sub-command timestamp was not separately recorded.
- A filtered accessibility snapshot still included unrelated local filenames because nested Finder actions matched the filter.
- Correction: stopped directory-list inspection, used Go to Folder with the exact isolated temporary path, limited later output to SOL readiness, and stopped UI control when another session switched the shared app.
- Closing verification: no unrelated filename was committed, uploaded, or copied into evidence. Status: Resolved.

## Regressions Introduced and Corrected

### REG-001 — Build configuration admitted an oversized UI candidate

- Corresponding issue: ISS-003
- Introduced: initial uncommitted bundle configuration
- Detected: 2026-08-17T17:43:15Z
- Corrected: 2026-08-17T17:49:18Z
- Responsible commit: none; uncommitted feature work
- Correction commit: `5d0cba19f21a539e133a8ef079b0c2ade7eac93b`
- Symptom: Get Time resource measured 539,002 bytes.
- User impact: none; the fail-closed generator prevented publication or deployment.
- Proof invalidated: resource-size and two-app vertical proof.
- Closing verification: full six-app generator passed; largest resource was 354,133 bytes, below 524,288.
- Time-to-detect: first resource build.
- Time-to-repair: 363 seconds.

### REG-002 — Initial adapter integration did not satisfy strict declarations

- Corresponding issue: ISS-004
- Introduced: initial uncommitted SDK-v2 integration
- Detected: 2026-08-17T17:50:13Z
- Corrected: 2026-08-17T17:51:10Z
- Responsible commit: none; uncommitted feature work
- Correction commit: `5d0cba19f21a539e133a8ef079b0c2ade7eac93b`
- Symptom: strict typecheck failed before runtime testing.
- User impact: none; no candidate was committed, pushed, or deployed.
- Proof invalidated: strict typecheck and vertical proof.
- Closing verification: strict `tsc --noEmit` passed with zero errors.
- Time-to-detect: first strict typecheck.
- Time-to-repair: 57 seconds.

### REG-003 — Browser-test asset wrapper intercepted gallery assets

- Corresponding issue: ISS-006
- Detected/corrected: 2026-08-17T18:01:07Z / 2026-08-17T18:02:37Z
- Responsible commit: none; uncommitted feature work. Correction commit: `5d0cba19f21a539e133a8ef079b0c2ade7eac93b`.
- Symptom: local CSS/JS returned 404, breaking copy and mobile layout.
- User impact: none; the defect was confined to uncommitted test serving and blocked before publication.
- Invalidated proof: browser rendering, copy URL, accessibility, 320 px layout, UI-to-tool interaction.
- Closing verification: all ten Playwright checks passed. Time-to-repair: 90 seconds. Status: Resolved.

### REG-004 — Generic HeadersInit object spread had tuple-array semantics

- Corresponding issue: ISS-007
- Detected/corrected: 2026-08-17T18:04:26Z / 2026-08-17T18:05:34Z
- Responsible commit: none; uncommitted feature work. Correction commit: `5d0cba19f21a539e133a8ef079b0c2ade7eac93b`.
- Symptom: tuple-array headers would become numeric object properties.
- User impact: none; type-aware lint blocked publication.
- Invalidated proof: lint and gateway headers.
- Closing verification: platform `Headers` composition passed the complete release gate. Time-to-repair: 68 seconds. Status: Resolved.

### REG-005 — Credential scan prefix was over-broad

- Corresponding issue: ISS-008
- Detected/corrected: 2026-08-17T18:07:38Z / 2026-08-17T18:07:53Z
- Responsible commit: none; uncommitted feature work. Correction commit: `5d0cba19f21a539e133a8ef079b0c2ade7eac93b`.
- Symptom: uppercase environment identifier was misclassified as a Vercel token.
- User impact: none; only release verification was blocked.
- Invalidated proof: secret scan and public readiness.
- Closing verification: the unchanged full source scope passed after matching only real lowercase provider prefixes. Time-to-repair: 15 seconds. Status: Resolved.

### REG-006 — Unqualified deployment bypassed the intended Preview sequence

- Corresponding issue: ISS-011. Detected/corrected: 2026-08-17T18:24:29Z / 2026-08-17T18:25:20Z.
- Symptom: first deployment targeted Production and received the stable alias before staging proof.
- User impact: a new hostname briefly exposed the exact build; no prior production existed. Proof invalidated: Preview and promotion order.
- Closing verification: alias removed and replacement command explicitly targeted Preview. Status: Resolved.

### REG-007 — Initial automation bypass was exposed in diagnostic output

- Corresponding issue: ISS-013. Detected immediately and corrected at 2026-08-17T18:38:26Z.
- User impact: the ephemeral Preview credential was treated as compromised; no application data or production credential was exposed.
- Proof invalidated: first bypass and all proof before rotation. Closing verification: old bypass revoked, different bypass generated before successful proof. Status: Resolved.

### REG-008 — Local mobile fixture did not represent production build metadata

- Corresponding issue: ISS-015. Responsible commit: `5d0cba19f21a539e133a8ef079b0c2ade7eac93b`; correction commit: `cd7fc1de70faef272bb96b625895c3ddfb8d3790`.
- Detected/local correction: 2026-08-17T18:41:35Z / 2026-08-17T18:42:57Z.
- Symptom: full SHA widened the deployed page from 320 px to 356 px. User impact: protected failed Preview only; no promoted origin.
- Proof invalidated: DEP-002 overall and Preview 320 px proof. Closing verification: DEP-003 passed all ten deployed browser checks, including full-SHA 320 px layout and all six App UIs. Status: Resolved.

### REG-009 — PURL encoding was incomplete

- Corresponding issue: ISS-019. Responsible commit: `5d0cba19f21a539e133a8ef079b0c2ade7eac93b`; correction commit: `ba648fd8e25d248b4fac9bbb056f3df8d885f99f`.
- Detected/resolved: 2026-08-17T19:03:42Z / 2026-08-17T19:12:06Z.
- Symptom: only the first slash in an npm package name was encoded. User impact: no runtime impact; persisted Code Scanning blocked merge.
- Proof invalidated: `f1a208c` Code Scanning, SBOM, and merge. Closing verification: exact-head and post-merge CodeQL passed with zero open alerts. Status: Resolved.

### REG-010 — Verifier used one origin for two different assertions

- Corresponding issue: ISS-021. Responsible commit: `cd7fc1de70faef272bb96b625895c3ddfb8d3790`; correction included in the report-publication change.
- Detected during final Preview proof; resolved by the first staged canary at 2026-08-17T19:25:57Z.
- Symptom: a protected or unpromoted artifact failed manifest proof despite correctly advertising its canonical public endpoint origin.
- User impact: none; proof stopped until exact origin identity was demonstrated. Closing verification: staged and stable matrices passed with distinct/defaulted origins. Status: Resolved.

### REG-011 — Process inventory over-read local diagnostic state

- Corresponding issue: ISS-022. No responsible source commit.
- Detected and contained between 2026-08-17T19:27:51Z and 19:29:06Z; precise sub-command timing was not retained.
- Symptom: whole process command lines and transient sensitive environment values appeared in user-visible diagnostic output.
- User impact: local transient output only; nothing was committed, uploaded, or copied into evidence. Correction: abandon process inspection and use app-bundle metadata. Status: Resolved.

### REG-012 — File-picker accessibility filter exposed unrelated filenames

- Corresponding issue: ISS-023. No responsible source commit.
- Detected and contained during the installed-host window ending 2026-08-17T19:56:06Z; precise sub-command timing was not retained.
- Symptom: unrelated local filenames appeared in a user-visible accessibility snapshot.
- User impact: local transient output only; nothing was committed, uploaded, or copied into evidence. Correction: direct Go to Folder selection and narrow SOL-only readiness output. Status: Resolved.

## External Waits

| ID       | Classification  | Start UTC                | End UTC                  | Duration       | Outcome                                                                                                        |
| -------- | --------------- | ------------------------ | ------------------------ | -------------- | -------------------------------------------------------------------------------------------------------------- |
| WAIT-001 | GitHub provider | 2026-08-17T17:26:02Z     | 2026-08-17T17:27:11Z     | 69 seconds     | Branch-protection retry succeeded.                                                                             |
| WAIT-002 | GitHub Actions  | 2026-08-17T18:20:04Z     | 2026-08-17T18:22:53Z     | 169 seconds    | Initial PR head reached its first all-green applicable check set.                                              |
| WAIT-003 | Vercel build    | 2026-08-17T18:23:16Z     | 2026-08-17T18:24:29Z     | 73 seconds     | DEP-001 became ready but failed the target process gate.                                                       |
| WAIT-004 | Vercel build    | 2026-08-17T18:25:34Z     | 2026-08-17T18:26:44Z     | 70 seconds     | Explicit DEP-002 Preview became ready.                                                                         |
| WAIT-005 | GitHub Actions  | 2026-08-17T18:49:55Z     | 2026-08-17T18:52:17Z     | 142 seconds    | Correction head `cd7fc1d` reached all green applicable checks.                                                 |
| WAIT-006 | Vercel build    | 2026-08-17T18:50:00Z     | 2026-08-17T18:51:35Z     | 95 seconds     | Replacement DEP-003 became ready and later passed exact proof.                                                 |
| WAIT-007 | GitHub Actions  | 2026-08-17T19:02:35Z     | 2026-08-17T19:04:37Z     | 122 seconds    | Public `f1a208c` workflows completed with two repairable failures.                                             |
| WAIT-008 | Vercel build    | 2026-08-17T19:02:31Z     | 2026-08-17T19:03:36Z     | 65 seconds     | First native Git-linked DEP-004 Preview became ready.                                                          |
| WAIT-009 | GitHub Actions  | 2026-08-17T19:10:57Z     | 2026-08-17T19:12:43Z     | 106 seconds    | Final exact implementation head completed release, CodeQL, public-readiness, locked-audit, and approval gates. |
| WAIT-010 | Vercel build    | 2026-08-17T19:10:56.702Z | 2026-08-17T19:11:56.972Z | 60.270 seconds | Final native exact-head DEP-005 Preview became Ready.                                                          |
| WAIT-011 | GitHub Actions  | 2026-08-17T19:21:21Z     | 2026-08-17T19:23:10Z     | 109 seconds    | Post-merge `forward` CI, CodeQL, and public readiness completed green.                                         |
| WAIT-012 | Vercel build    | 2026-08-17T19:21:22.035Z | 2026-08-17T19:22:24.314Z | 62.279 seconds | Exact `forward` DEP-006 Production target became Ready while stable remained withheld.                         |

## Rework and Abandoned Approaches

| ID         | Approach                                          | Reason chosen                                               | Reason abandoned                                                                   | Elapsed consumed     | Retained work                                        | Corrective direction                                                              |
| ---------- | ------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| REWORK-001 | Vite single-file build with esbuild minification  | Fast deterministic default                                  | Five upstream UI builds remained over the 512 KiB ceiling after minification alone | 363 seconds          | Source import, Vite pipeline, fail-closed size check | Frozen upstream snapshot plus gallery-owned size-bounded UI and chart adaptations |
| REWORK-002 | Loosely inferred initial integration types        | Fast first vertical                                         | Strict declarations rejected four bounded mismatches                               | 57 seconds           | Runtime design and exact dependencies                | Match published declarations and retain strict unchecked-index enforcement        |
| REWORK-003 | Direct official AppBridge declaration import      | Use the official host bridge without a type boundary        | Published extensionless imports failed strict NodeNext                             | 37 seconds           | Official browser runtime and host design             | Narrow typed runtime re-export with `skipLibCheck: false`                         |
| REWORK-004 | Broad local asset route and dynamic role locators | Compact development server and accessibility-oriented tests | Route intercepted CSS/JS and live names destabilized locators                      | 90 seconds           | Independent host and browser matrix                  | Exact screenshot routing, application fallthrough, immutable locators             |
| REWORK-005 | Object spread over generic `HeadersInit`          | Concise composition                                         | Tuple arrays have incompatible spread semantics                                    | 68 seconds           | Header policies and gateway boundaries               | Platform `Headers` API                                                            |
| REWORK-006 | Case-insensitive provider token prefix            | Conservative secret scan                                    | Misclassified uppercase identifiers                                                | 15 seconds           | Full scan scope and other credential patterns        | Real lowercase token prefix                                                       |
| REWORK-007 | `yaml@2.8.1` build dependency                     | Exact initial build-tool pin                                | Complete audit found a patched moderate advisory                                   | 12 seconds           | Same API and deterministic build behavior            | Exact `yaml@2.8.3`, regenerated lock and SBOM                                     |
| REWORK-008 | Unqualified first Vercel deploy                   | New project had automatic-domain controls                   | Provider selected Production and assigned stable alias                             | 124 seconds          | Immutable build and timing record                    | Explicit target flags and later explicit promotion                                |
| REWORK-009 | Value-only bypass redaction                       | Inspect state without printing secret values                | Provider encoded secret as a property name                                         | 166 seconds          | Protected Preview verification design                | Rotation and no key enumeration                                                   |
| REWORK-010 | Case-sensitive HTML doctype check                 | Fast document-shape assertion                               | HTML doctype is case-insensitive                                                   | 26 seconds           | MIME, size, URI, tool, dual-era checks               | Standards-insensitive assertion                                                   |
| REWORK-011 | Short local development build label               | Exercise ordinary local rendering                           | Did not model a 40-character production SHA                                        | 82 seconds           | Responsive and deployed-browser harness              | Code wrapping plus production-length fixture                                      |
| REWORK-012 | First-occurrence slash replacement for npm PURLs  | Scoped package names ordinarily contain one slash           | CodeQL identified the transformation as incomplete                                 | 154 seconds          | CycloneDX structure, sorting, locked inventory       | Full URI component encoding                                                       |
| REWORK-013 | Typographic apostrophe in dismissal enum          | Prose appeared semantically identical                       | GitHub requires the exact ASCII enum                                               | 15 seconds           | Exact per-alert rationale                            | Generate documented JSON enum and verify returned states                          |
| REWORK-014 | One origin for artifact and manifest verification | Compact Preview verifier                                    | Protected/staged artifact origins differ from the intended public manifest origin  | Not separately timed | Strict manifest identity and deployment reachability | Separate deployment and expected public origins, defaulted together when equal    |
| REWORK-015 | Whole-process host inventory                      | Discover already installed/running MCP hosts                | Command lines contained unrelated sensitive environment metadata                   | Not separately timed | Safe application-name inventory                      | App-bundle metadata only; no process inspection                                   |
| REWORK-016 | Filtered general file-picker snapshot             | Select an isolated OpenWork host-test workspace             | Nested Finder actions caused unrelated filenames to match the filter               | Not separately timed | Exact temporary workspace path                       | Direct Go to Folder selection and SOL-only readiness output                       |

## Deployment Timeline

| ID      | Provider deployment ID             | Environment                    | Exact SHA  | Provider build | Verification                                                                                                      | Verdict           | Promoted |
| ------- | ---------------------------------- | ------------------------------ | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------- | -------- |
| DEP-001 | `dpl_62cR91MQQVfz5a1iwpt9yoqH977e` | Production target, unpromoted  | `a315b24`  | 73 seconds     | Skipped after wrong-target process violation; unexpected stable alias removed                                     | FailedProcessGate | No       |
| DEP-002 | `dpl_LemQchAQpywdvsEG5K14xBWGn9KE` | Protected Preview              | `a315b24`  | 70 seconds     | Network and 12 MCP contracts passed; six App UIs passed; 320 px gallery layout failed                             | Failed            | No       |
| DEP-003 | `dpl_F9UeEHw4VQMeroH5dCR7CzkATLvD` | Protected Preview              | `cd7fc1d`  | 95 seconds     | Public surface, 12 MCP contracts, negative boundaries, ten browser checks, six App UIs                            | Passed            | No       |
| DEP-004 | `dpl_433XtDq1cu36Z3kxpfxDbYLzm4ud` | Native Git-linked Preview      | `f1a208c`  | 65 seconds     | Provider readiness only; superseded after public security gates required source repair                            | Incomplete        | No       |
| DEP-005 | `dpl_9tZjiJoYpSqJAK4k6X6UtKD9B6BP` | Final native protected Preview | `ba648fd`  | 60.270 seconds | Exact public surface, 12 contracts, boundaries/recovery, ten browser checks, copied URLs, six App UIs             | Passed            | No       |
| DEP-006 | `dpl_Ar8FNH6W6RrffeGsDr39seUAtxMg` | Production staged then Current | `b0108c71` | 62.279 seconds | Full staged proof, three canaries, 1,261-second/18-sample observation, repeated browser/burst proof, stable proof | Passed            | Yes      |

## Final State

Passed at the public evidence cutoff. The public repository, protected `forward`, six-app implementation, local and clean-clone release gates, exact-head CI/CodeQL/audit/public-readiness/Preview proof, verified squash merge, post-merge gates, exact staged Production, three canaries, 1,261-second observation with 18/18 samples, no-rebuild promotion, explicit stable cutover, and complete stable network/browser proof all passed. DEP-006 serves the stable namespaced origin at implementation SHA `b0108c71a58289d111674c2f7315bb8e3355113a`.

Native GitHub dependency review remains Incomplete because GitHub continued to report the new public repository unsupported; the required locked-audit fallback passed. Installed OpenWork proof remains Incomplete after three isolated SOL endpoints reported Ready and concurrent shared-app control prevented the required full/deep lifecycle matrix. No safe non-metered second MCP Apps host was available. The official AppBridge basic-host matrix passed but is not mislabeled as independent-host proof. First-release rollback is Skipped because no prior verified Production exists; stable alias withholding/removal was tested as the safe fallback. Paid WAF/custom DNS and metered review were not created. The 24-hour observation remains Deferred as Pending Operational Observation. No shared organization rule was weakened, no protected Preview URL or bypass was published, and no private diagnostic content was committed into evidence.
