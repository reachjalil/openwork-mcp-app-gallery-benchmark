# SOL Hosted MCP Apps Gallery Benchmark Report

## 1. Identity

- Model name: SOL
- Model namespace: `sol`
- Repository: [different-ai/openwork-mcp-app-gallery-sol](https://github.com/different-ai/openwork-mcp-app-gallery-sol)
- Implementation pull request: [#1](https://github.com/different-ai/openwork-mcp-app-gallery-sol/pull/1)
- Default and production branch: `forward`
- Feature branch: `sol/gallery-v1`
- Frozen upstream: `modelcontextprotocol/ext-apps@10195ad91851502134930e9b80ec2c04e277a720`
- Implementation release SHA: `b0108c71a58289d111674c2f7315bb8e3355113a`
- Vercel project: `openwork-mcp-app-gallery-sol`
- Stable origin: [openwork-mcp-app-gallery-sol.vercel.app](https://openwork-mcp-app-gallery-sol.vercel.app)
- Benchmark clock start: 2026-08-17T17:18:24Z
- Evidence cutoff for this report: 2026-08-17T20:09:29Z

The implementation release SHA is the signed `forward` squash that underwent the required Production staging, 21-minute observation, promotion, stable-origin proof, and host attempts. This report is itself a later publication change; the exact final report-publication `forward` SHA and its no-rebuild-equivalent verification are reported in the final release handoff because a Git commit cannot contain its own SHA.

## 2. Outcome

Final product verdict: **Passed**. The six-app gallery, dual-protocol MCP contract, CI/security gates, exact PR Preview, exact Production staging, 1,261-second staged observation, explicit promotion, and stable-origin verification all passed. No required product, protocol, security, build, or stable-origin defect remains.

Two optional external-host categories remain **Incomplete** rather than being overstated: the installed OpenWork matrix was interrupted by concurrent control of the shared app after three isolated SOL endpoints reported Ready, and no second safe non-metered MCP Apps host was available without installing software or invoking a paid model. GitHub's native dependency-review action also remained unsupported on the newly public repository; the benchmark-authorized required locked-audit fallback passed on the exact PR head and `forward`.

## 3. Repository and Branch State

- Visibility: public, changed only after local, Preview, legal, provenance, secret, audit, and public-readiness gates passed.
- `forward` is the GitHub default branch and the Vercel Production Branch. `main` and `dev` are not release branches.
- PR #1 merged by verified signed squash at 2026-08-17T19:21:18Z.
- Repository protection requires up-to-date PRs, linear history, signed commits through the inherited organization ruleset, resolved conversations, no force pushes or deletion, exact `release-check`, CodeQL `analyze`, `locked-audit`, `public-readiness`, native `Vercel`, and `vercel-preview-proof` statuses.
- The inherited organization rule also required a non-last-pusher approval. A transparent GitHub Actions approval ran only after the exact PR head's complete release check passed; it did not bypass CodeQL, audit, public-readiness, Preview, signature, or freshness rules.
- Secret scanning and push protection are enabled. No paid GitHub capacity or organization-wide exception was created.

## 4. Architecture

One root `app.ts` is the only Vercel-recognized Hono entrypoint. It serves diagnostics and six parameterized Streamable HTTP MCP paths through one stateless Function, while generated gallery assets are served from `public/` through Vercel's CDN. There is no root mega-MCP.

The release configuration fixes Node 24.x, pnpm 10.28.0, Hono, Fluid compute, `iad1`, `maxDuration: 30`, cancellation support, and inclusion of `generated/mcp-app-resources.json`. Each slug maps to one isolated handler, one gallery tool, and one immutable `ui://` resource. The global in-process concurrency ceiling is 48, with a smaller per-app ceiling; this is explicitly not represented as a distributed global rate limiter.

The build is closed over checked-in source and the frozen lockfile. It performs no runtime source fetch, package install, subprocess execution, arbitrary URL fetch, upload, or durable write.

## 5. Dependency and Protocol Versions

| Component                      | Exact version                                     |
| ------------------------------ | ------------------------------------------------- |
| Node.js                        | 24.x; deployed proof returned a `v24.*` runtime   |
| pnpm                           | 10.28.0                                           |
| Hono                           | 4.13.2                                            |
| `mcp-handler`                  | 2.1.1                                             |
| `@modelcontextprotocol/server` | 2.0.0                                             |
| Frozen MCP Apps examples       | commit `10195ad91851502134930e9b80ec2c04e277a720` |
| Current MCP protocol           | pinned `2026-07-28` negotiation                   |
| Legacy fallback                | stateless 2025-era Streamable HTTP negotiation    |

The hosted adapter translates the frozen examples' SDK-v1-era registration shape into SDK v2 without retaining a second protocol implementation. The same official SDK v2 client proved current and legacy negotiation for every app.

## 6. Upstream Provenance and Licensing

The audit snapshot contains 53 byte-for-byte files from exactly six selected upstream example directories. `upstream/manifest.json` records original path, SHA-256, bytes, effective license, notice, and modification statement. The selected upstream packages declared MIT at the frozen revision.

Three gallery-owned size-bounded UI re-expressions and one bounded chart shim are Apache-2.0. The immutable upstream snapshot was not edited to silence CodeQL. Three non-runtime synthetic-demo findings were individually dispositioned with explicit frozen-source rationale; the real gallery-owned PURL encoding finding was fixed in source. `THIRD_PARTY_NOTICES.md`, `LICENSE`, deterministic provenance checks, and the generated CycloneDX SBOM all passed.

## 7. App Catalog

| App                   | Endpoint                                                                         | Tool                | Result/data behavior                                            |
| --------------------- | -------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------- |
| Get Time              | `https://openwork-mcp-app-gallery-sol.vercel.app/apps/get-time/mcp`              | `get-time`          | Current server timestamp; same-server refresh                   |
| Budget Allocator      | `https://openwork-mcp-app-gallery-sol.vercel.app/apps/budget-allocator/mcp`      | `get-budget-data`   | Fixed synthetic categories, sliders, comparison, app tool calls |
| Cohort Heatmap        | `https://openwork-mcp-app-gallery-sol.vercel.app/apps/cohort-heatmap/mcp`        | `get-cohort-data`   | Deterministic bounded 12 × 12 cohort data                       |
| Customer Segmentation | `https://openwork-mcp-app-gallery-sol.vercel.app/apps/customer-segmentation/mcp` | `get-customer-data` | Fixed synthetic customer records and bounded filters            |
| Scenario Modeler      | `https://openwork-mcp-app-gallery-sol.vercel.app/apps/scenario-modeler/mcp`      | `get-scenario-data` | Synthetic bounded inputs and 12-month projections               |
| Transcript            | `https://openwork-mcp-app-gallery-sol.vercel.app/apps/transcript/mcp`            | `transcribe`        | Browser-local audio UI; no server audio upload                  |

All six resources use `text/html;profile=mcp-app`, nested current UI metadata, legacy-flat metadata, ordinary text fallback, and structured content. Cross-app tools and resources are rejected.

## 8. Local Verification

Passed:

- 42 Vitest unit, gateway, registration, resource, and dual-protocol contract checks.
- 10 Playwright checks covering the gallery, accessibility, 320-pixel layout, copied endpoints, all six AppBridge renderings, and UI-to-tool interaction.
- Repeated initialize/list/call/resource cycles and 20 representative concurrent clients.
- Cold/warm readiness, missing-resource boot failure, registration containment, app isolation, body/result ceilings, malformed input, deadlines, cancellation, concurrency, CORS, method policy, disabled/unknown/traversal routes, and safe error responses.
- Formatting, lint, strict TypeScript with `skipLibCheck: false`, deterministic generation, notices, license/provenance, source-boundary and credential-pattern scans, production and complete dependency audits, SBOM generation, architecture enforcement, and production-shaped application build.
- A clean-clone `pnpm run release:check`, including `vercel build --prod`, passed at exact implementation-tree commit `cd7fc1de70faef272bb96b625895c3ddfb8d3790`; later governance/security-only changes passed the complete local CI release gate again.

Generated App resources ranged from 335,950 to 354,133 bytes, below the 524,288-byte ceiling.

## 9. CI and Security Verification

- Exact final implementation PR head `ba648fd8e25d248b4fac9bbb056f3df8d885f99f`: `release-check`, `release-approval`, CodeQL `analyze`, CodeQL policy, `locked-audit`, `public-readiness`, native Vercel, and manual `vercel-preview-proof` passed.
- `forward` merge SHA `b0108c71a58289d111674c2f7315bb8e3355113a`: CI, CodeQL, public readiness, and native Vercel passed; zero CodeQL alerts remained open.
- GitHub native dependency review: **Incomplete**. Both public attempts returned GitHub's “not supported” repository state even though public repositories are documented to receive dependency graph/review. The exact-head `locked-audit` fallback was required by branch protection and passed; `pnpm audit --prod --audit-level=high`, the complete audit, lockfile freeze, SBOM, and dependency source checks passed.
- Security headers, `private, no-store` MCP/diagnostic caching, short-revalidation `apps.json`, host/origin allowlists, secret/source scans, output limits, and safe diagnostics passed locally, on Preview, staged Production, and stable Production.
- Vercel Hobby did not expose a no-cost project WAF/rate-limit rule API. No paid capacity was created. Application concurrency and byte/deadline controls remain active; a 64-client staged burst returned only valid responses, and deterministic local tests prove intentional `429` plus `Retry-After` behavior when the per-process gate is saturated.

## 10. Preview Deployment

The final native Git-linked protected Preview was deployment `dpl_9tZjiJoYpSqJAK4k6X6UtKD9B6BP` at exact PR head `ba648fd8e25d248b4fac9bbb056f3df8d885f99f`. Vercel reported Ready and its native status passed. Manual proof against its manifest-advertised protected branch alias passed:

- `/`, `/apps.json`, `/healthz`, `/readyz`, `/version`;
- all six current-protocol and all six legacy-protocol MCP paths;
- headers, caches, copied endpoint URLs, malformed/unknown/disallowed/oversized requests, cancellation and post-abort health;
- all 10 browser checks and all six App renderings.

The protected Preview URL is intentionally omitted. Earlier Preview deployments remain in `TIMELINE.md` as failed or incomplete evidence; they were never promoted.

## 11. Staged Production Deployment

- Deployment: `dpl_Ar8FNH6W6RrffeGsDr39seUAtxMg`
- Exact staged SHA: `b0108c71a58289d111674c2f7315bb8e3355113a`
- Source/environment: Git `forward`, Production target, Ready, stable domain withheld
- Provider build: 2026-08-17T19:21:22.035Z–2026-08-17T19:22:24.314Z (62.279 seconds)
- Inspection: Node 24.x, root `app.ts`, Hono, Fluid configured, `iad1`, resource include, 30-second ceiling, cancellation support
- Full staged proof: all public surfaces, 12 app/protocol combinations, boundaries, recovery, and 10 browser checks passed
- Three full canaries: 2026-08-17T19:25:57Z–2026-08-17T19:26:38Z, all passed
- Continuous observation: 2026-08-17T19:27:39Z–2026-08-17T19:48:40Z, 1,261 seconds, 18/18 full samples passed
- Repeated App rendering: full browser matrix passed before, at the midpoint, and after observation
- Repeated concurrency bursts: 64/64 responses were valid at midpoint and close; no unsafe error occurred
- Stable domain remained 404 and unassigned through the closing staged check

The Production build's manifest correctly advertised the future stable origin while the artifact was tested through its staging origin. Verification therefore treats “artifact origin under test” and “expected public manifest origin” as separate assertions.

## 12. Stable Production Verification

The exact staged deployment was promoted at 2026-08-17T19:49:25Z–19:49:29Z without rebuilding. Because automatic domain assignment was disabled, the namespaced stable project domain was then explicitly assigned to that already-proven deployment at 19:49:54Z–19:49:56Z.

Stable proof passed without a protection bypass:

- gallery, manifest, health, readiness, version, exact SHA, Node 24, upstream identity, namespace, adapter version, and six enabled slugs;
- every app in current and legacy protocol modes, including tool list/call and resource read;
- CSP and security headers, cache policies, malformed/unknown/method/oversized boundaries, cancellation and post-abort health;
- copied stable MCP URLs, 320-pixel layout, keyboard/accessibility checks;
- all six App renderings, including Get Time refresh and Budget Allocator controls/deep result behavior.

## 13. Host Compatibility Matrix

| Host                                               | Version/build             | OS                 | SHA         | Scope                                                                                           | Result                                                                                                   |
| -------------------------------------------------- | ------------------------- | ------------------ | ----------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Official AppBridge test host, separate from server | repository-pinned runtime | macOS 26.5 (25F71) | `b0108c71…` | Six apps, initial result, UI-to-tool, resize/navigation/browser behavior                        | Passed as basic host; not claimed as independent external host                                           |
| Installed OpenWork                                 | 0.18.26-alpha.2371        | macOS 26.5 (25F71) | `b0108c71…` | Isolated temporary workspace; SOL Get Time, Budget Allocator, and Cohort Heatmap reported Ready | Incomplete: shared app was switched by a concurrent session before six-app/deep/reconnect/teardown proof |
| Additional independent MCP Apps host               | none safely available     | macOS 26.5 (25F71) | `b0108c71…` | Checked installed/available surfaces without installing software or invoking a paid model       | Incomplete                                                                                               |

OpenWork readiness is not upgraded to full proof. The shared app already contained unrelated work; an isolated SOL workspace was created specifically to avoid inspecting or modifying it. UI control stopped when another concurrent session switched the window. No unrelated server configuration was opened or changed.

## 14. Performance and Runtime Observations

- First explicit Preview provider build: 70 seconds.
- First fully green exact PR-head Preview provider build: 95 seconds.
- Final native exact-head Preview provider build: approximately 60 seconds.
- Exact staged Production provider build: 62.279 seconds.
- Staged full matrices generally completed in about 12–15 seconds for all six apps in both protocol modes plus boundary checks.
- 18 observation matrices completed over 1,261 seconds with no failure.
- Two staged 64-client bursts completed with only HTTP 200 responses; Fluid compute scaled without forcing the instance-local gate.
- This is a first release with no traffic/SLA claim. The required 24-hour operational observation is Deferred as **Pending Operational Observation**.

## 15. Safety and Abuse Controls

The service uses HTTPS-only canonical origins, strict allowed hosts and browser origins, no credential/query/fragment-bearing base URLs, restrictive CSP, clickjacking and MIME protections, permissions policy, no-referrer policy, bounded CORS, no-store dynamic responses, bounded request/result/resource bytes, a 15-second application deadline, Vercel's 30-second ceiling, cancellation propagation, per-process concurrency limits, disabled-app kill switch, immutable resource digests, and safe diagnostics/log fields.

It logs no prompts, arguments, results, resource contents, auth headers, cookies, IP addresses, user identifiers, private deployment URLs, or credentials. The repository contains no environment file or deployment bypass. Two later local diagnostic/UI inventory commands over-read transient local metadata; those outputs were not committed, uploaded, or copied into evidence, and the inspection methods were stopped/corrected. The public artifact and reports contain none of that material.

## 16. Timing Summary

At the report cutoff, wall-clock elapsed time was 10,265 seconds (2h 51m 5s) from 2026-08-17T17:18:24Z. This includes the 1,261-second deliberate staged observation. Recorded waits before the report-publication PR were 69 seconds external provider retry, 648 seconds GitHub CI, and 425.549 seconds Vercel builds. Recorded rework with observed durations totaled 1,209 seconds; later short operational corrections without precise start/end timestamps are listed but excluded from that numeric sum. Estimated active time at this cutoff, excluding external/CI/Vercel waits and the staged observation, was 7,861.451 seconds.

Major elapsed milestones:

| Milestone                            |               Elapsed |
| ------------------------------------ | --------------------: |
| First two-app local vertical         |               2,307 s |
| First six-app local catalog          |               2,307 s |
| First green local release check      |               3,249 s |
| PR opened                            |               3,700 s |
| First Preview Ready                  |               4,100 s |
| First all-green applicable PR checks |               3,869 s |
| Final exact-head Preview proof       |               7,355 s |
| Merge                                |               7,374 s |
| Staged Production Ready              |               7,440 s |
| Production promotion                 |               9,065 s |
| Stable-origin proof                  | approximately 9,117 s |

The structured files retain this immutable pre-publication cutoff. Final end-to-end timing, including report-publication CI and the exact-final-SHA deployment, is reported in the final release handoff because those events necessarily occur after this commit is created.

## 17. Problems and Regressions Summary

The detailed issue ledger is authoritative in `TIMELINE.md` and `benchmark/timeline.json`. Twenty-three issues were encountered through report preparation, including twelve self-introduced regressions. All product/runtime regressions were corrected before promotion. The most expensive constraint combined a private-organization Vercel connection limitation with inherited GitHub signature, review, and persisted-CodeQL rules. It was resolved without weakening shared policy: the repository became public only after every public-readiness gate, CodeQL persisted, the real alert was fixed, frozen-source alerts were explicitly dispositioned, and the exact-head post-release approval adapter satisfied the non-author rule.

Notable repaired regressions included oversized initial UI bundles, strict SDK-v2 type mismatches, browser asset interception, header composition, secret-scan false positives, an unqualified wrong-target Vercel deployment, Preview bypass output handling, case-sensitive doctype verification, 320-pixel full-SHA overflow, incomplete PURL encoding, and staging/public-origin verifier conflation. Local diagnostic-output scope incidents were contained and never entered repository artifacts.

## 18. Passed

- Complete six-app hosted gallery and independent per-slug isolation.
- Current MCP `2026-07-28` and legacy fallback matrices.
- One-Hono-Function Vercel architecture and all explicit runtime controls.
- Local, clean-clone, PR-head, post-merge, Preview, staged, observation, promotion, and stable-origin gates.
- CI, CodeQL, locked dependency audit, public readiness, source/license/notices/provenance, SBOM, secret/source scans, and zero open CodeQL alerts.
- Gallery/accessibility/copy behavior and all six basic AppBridge UI renderings.
- Stable Get Time and Budget Allocator deep browser interactions.
- Public documentation, attribution, safety, data-boundary, logging, limit, and no-SLA disclosures.

## 19. Failed

None in the final required product, protocol, security, build, deployment, or stable-origin state. Historical failed attempts remain recorded and were not reclassified.

## 20. Incomplete

- Native GitHub dependency review: repository remained unsupported after public transition; required locked-audit fallback passed.
- Installed OpenWork: three isolated SOL connections reported Ready, but the full six-app and deep lifecycle matrix could not finish because another session took control of the shared app.
- Independent external MCP Apps host: no safe non-metered host was available without installation or a paid model invocation.

## 21. Skipped

- Paid Vercel WAF/rate-limit capacity and custom DNS: outside authority and unnecessary for this no-spend benchmark.
- Copilot or other metered AI review: not invoked.
- Rollback to a previous verified Production: unavailable because this was the first verified Production. The first-release safe fallback—remove/withhold the stable alias—was tested during the earlier wrong-target deployment and again by holding stable 404 throughout staging.
- Publishing protected Preview URLs or bypass values.

## 22. Deferred

- 24-hour production observation: **Pending Operational Observation**.
- SLA, sustained traffic, globally authoritative rate limiting, and multi-region performance claims.

## 23. Deviations From the Shared Plan

- The repository started private as required, then became public before merge because Vercel Hobby could not connect the private organization repository and inherited GitHub Code Scanning policy could not persist private SARIF without paid capacity. The visibility transition happened only after exact Preview, clean-clone, legal, provenance, secret, audit, and public-readiness gates passed.
- GitHub's native dependency graph/review remained unavailable despite public visibility. The prompt-authorized locked-audit fallback became the enforced merge gate.
- Rebase merge was rejected because GitHub cannot sign its generated rebase commits under the inherited rule; the permitted verified squash path was used.
- Automatic Production domain assignment was disabled. Explicit promotion made the exact deployment Current, and the stable namespaced project domain was then attached explicitly to the same proven deployment.
- Installed OpenWork proof used a temporary isolated workspace to avoid unrelated active work, then stopped when concurrent control made further safe interaction impossible.

## 24. Known Risks

- Vercel Hobby offers no no-cost project-level WAF rate rule here. Fluid instances can scale past an individual process, so the 48-request gate is local protection, not a global quota.
- The gallery has no SLA and only the required 21-minute staged observation plus immediate stable proof. The 24-hour observation remains pending.
- Optional installed-host compatibility is incomplete even though the protocol/basic-host and stable browser matrices are comprehensive.
- Frozen example source includes intentionally synthetic non-cryptographic randomness and identity-like data generation in non-runtime audit files; dispositions must be revisited if those files ever enter runtime scope.

## 25. Reproduction Commands

Use Node 24.x and pnpm 10.28.0:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm run release:check:ci
pnpm run release:check
```

Verify the stable deployment without a bypass:

```sh
DEPLOYMENT_URL=https://openwork-mcp-app-gallery-sol.vercel.app \
DEPLOYMENT_ID=dpl_Ar8FNH6W6RrffeGsDr39seUAtxMg \
EXPECTED_GIT_SHA=b0108c71a58289d111674c2f7315bb8e3355113a \
pnpm run verify:deployment

PLAYWRIGHT_BASE_URL=https://openwork-mcp-app-gallery-sol.vercel.app \
GALLERY_REMOTE_TEST_ORIGIN=https://openwork-mcp-app-gallery-sol.vercel.app \
pnpm run test:browser
```

The protected Preview/staging commands additionally need the ephemeral Vercel automation bypass from the authenticated local store. Its value and protected URLs are intentionally not documented.

## 26. Final Verdict

**Passed.** The stable six-app gallery is publicly available at the exact observed implementation SHA, with every mandatory implementation, protocol, CI/security, staged Production, observation, promotion, and stable-origin gate green. Native dependency review is safely covered by the allowed locked-audit fallback. OpenWork and independent-host proof remain explicitly Incomplete and the 24-hour observation Deferred; none is misrepresented as Passed.
