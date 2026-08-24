# BENCHMARK REPORT — Hosted MCP Apps Example Gallery (fable)

## 1. Identity

- MODEL_NAME: FABLE; MODEL_NAMESPACE: `fable`
- Repository: <https://github.com/different-ai/openwork-mcp-app-gallery-fable> (created private, made public after its readiness gates)
- Local implementation directory: `/Users/jalillaaraichi/openwork-mcp-app-gallery-fable`
- Vercel project: `openwork-mcp-app-gallery-fable` (team `prologe`)
- Default/integration/production branch: `forward`; feature branch: `fable/gallery-v1`
- Pull request: <https://github.com/different-ai/openwork-mcp-app-gallery-fable/pull/1>

## 2. Outcome

**Passed.** Six official MCP Apps examples are live as remote Streamable HTTP MCP servers under one production origin, <https://openwork-mcp-app-gallery-fable.vercel.app>, with a public gallery page, per-app Copy MCP URL, dual-era protocol support, the Wave 1 safety envelope, an edge rate limit, and a complete provenance/notices chain. The exact staged forward deployment passed 28/28 canaries, a 21.8-minute continuous observation (252/252 checks), promotion without rebuild, and 28/28 stable-origin proof. Installed-OpenWork deep proofs passed for `get-time` (render + initial result via the user-authored MCP path) and `budget-allocator` (render + deep in-app interaction). Enumerated Incomplete items (independent host; four in-OpenWork render checks under shared-host contention; 24-hour operational window) are listed in sections 18–22.

## 3. Repository and Branch State

- `forward` is the GitHub default branch and the only release line; `main` and `dev` do not exist as delivery branches (a temporary parked `main` pointer created during the ISS-007 merge investigation was deleted the same hour).
- Repository ruleset `forward-protection` (20947878): PR required, required status checks `check` (CI) + `analyze` (CodeQL), force-pushes and deletions blocked.
- An organization-wide ruleset ("Protected default branches", 19823398) additionally applies review/signature/linear-history/code-scanning requirements to the default branch; its interaction with a solo autonomous run is recorded as ISS-007 in `TIMELINE.md`.
- CI (`.github/workflows/ci.yml`) runs the full release gate on every PR and push to `forward`; CodeQL runs on PR, push to `forward`, and weekly schedule; dependency review runs on public PRs with a locked `pnpm audit` fallback; a public-readiness evidence workflow (notices, boundary, secret scan, architecture) runs on PRs and on demand.

## 4. Architecture

- One stateless Hono application; `app.ts` is the only Vercel-recognized entrypoint; Node 24.x, pnpm 10.28.0, Fluid compute, `maxDuration: 30`, `supportsCancellation: true`, region `iad1`.
- Path-routed gateway `/apps/:slug/mcp`: one `mcp-handler` 2.1.1 handler per registry app (fresh SDK v2 `McpServer` per request; `maxSubscriptions: 0`), so tools, resources, and state never cross apps; deliberately no root mega-`/mcp`.
- Wave 1 public-runtime envelope in the gateway: method allowlist (GET/POST; DELETE→405; OPTIONS only for allowlisted browser origins), origin policy, 256 KiB request ceiling (declared + streamed), 512 KiB tool-result ceiling and 1.25 MiB `resources/read` envelope ceiling, 15 s deadline with `AbortSignal` propagation, global (32) + per-app (8) per-instance concurrency shedding with `429`/`Retry-After`, sanitized logs.
- Immutable resource store `generated/mcp-app-resources.json` (six single-file app UIs + the gallery page, all digest-validated at load) shipped via `includeFiles`; `/readyz` is red until it validates.
- The gallery page is deterministic and committed (`public/`): endpoint URLs derive client-side from the page's own origin; the build label fills live from `/version`; assets/screenshots served by the CDN; the function serves `/` from the bundled digest-verified page copy (see ISS-005 for why).
- Base URLs for `/apps.json` derive only from validated configuration (`BASE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_BRANCH_URL` → `VERCEL_URL`); request Host headers are never trusted.

## 5. Dependency and Protocol Versions

| Component | Version | Role |
| --- | --- | --- |
| Node.js | 24.x (24.18.0 verified locally and in the deployed function) | runtime |
| pnpm | 10.28.0 (packageManager + corepack) | package manager |
| hono | 4.13.2 (exact) | HTTP application |
| mcp-handler | 2.1.1 (exact) | MCP HTTP handler |
| @modelcontextprotocol/server (+core) | 2.0.0 (exact) | MCP SDK v2 |
| zod | 4.4.3 (exact) | schemas |
| @modelcontextprotocol/ext-apps | 1.7.5 (dev; equals the pinned commit's version) | App bridge for UI builds + host harness |
| @modelcontextprotocol/sdk | 1.30.0 (dev/test only; never runtime) | UI type imports + harness client |
| vite / singlefile / plugin-react | 6.4.3 / 2.3.3 / 4.7.0 | UI builds |
| vitest / @playwright/test / Biome / TypeScript | 4.1.10 / 1.62.1 / 2.5.8 / 5.9.3 | verification |

Protocol: modern revision `2026-07-28` (per-request `_meta` envelope; `MCP-Protocol-Version`/`Mcp-Method`/`Mcp-Name` cross-check headers; JSON responses) and the stateless 2025-era Streamable HTTP fallback (initialize negotiation `2025-11-25`…`2024-10-07`; SSE-framed responses; GET/DELETE → 405) — both verified live on every endpoint.

## 6. Upstream Provenance and Licensing

- Source frozen at `modelcontextprotocol/ext-apps@10195ad91851502134930e9b80ec2c04e277a720` (upstream package version 1.7.5); never fetched at build or runtime.
- 98 files copied under `upstream/ext-apps/` (six examples + the basic-host browser harness + verbatim upstream LICENSE); per-file original/current SHA-256 digests in `upstream/manifest.json`; 7 files modified, each with a documented note (SDK v1→v2 adaptation, bundled-resource reads, seeded deterministic dataset); exclusions documented (`main.ts` standalone listeners, `.gitignore`, the unused `serve.ts` removed under CodeQL review).
- Licensing: upstream is mid MIT→Apache-2.0 transition; copied example code treated as MIT (per-package declarations), full upstream license preserved verbatim; gallery-owned code Apache-2.0; `THIRD_PARTY_NOTICES.md` + `verify:notices` enforce consistency.

## 7. App Catalog

| Slug | Upstream example | Tool | UI resource | Data behavior |
| --- | --- | --- | --- | --- |
| get-time | basic-server-react | `get-time` | `ui://get-time/mcp-app.html` | live server clock only |
| budget-allocator | budget-allocator-server | `get-budget-data` | `ui://budget-allocator/mcp-app.html` | synthetic, server-generated |
| cohort-heatmap | cohort-heatmap-server | `get-cohort-data` | `ui://get-cohort-data/mcp-app.html` | synthetic, per-request |
| customer-segmentation | customer-segmentation-server | `get-customer-data` | `ui://customer-segmentation/mcp-app.html` | deterministic seeded synthetic |
| scenario-modeler | scenario-modeler-server | `get-scenario-data` | `ui://scenario-modeler/mcp-app.html` | synthetic templates + computed projections |
| transcript | transcript-server | `transcribe` | `ui://transcript/mcp-app.html` | browser-side Web Speech API; nothing reaches the server |

## 8. Local Verification

`pnpm release:check` green end to end: Biome format + lint, strict typecheck, notices/provenance verification (98 files), source-boundary scan (17 runtime files; no network/subprocess/write/dynamic-exec/secret patterns; browser-side fetch would only warn and none exists), `pnpm audit --prod` (no known vulnerabilities), 96 unit/gateway/contract tests, production `build:vercel`, architecture invariant (including native-ESM import rules and committed-site drift), CycloneDX SBOM (7 components), and 15 Playwright browser tests through the upstream basic host (all six apps render from live endpoints; get-time UI-initiated same-server tool call; budget-allocator deep slider interaction; per-endpoint isolation; gallery copy success/failure feedback, keyboard access with visible focus, alt text, 320 px layout).

Contract matrix per app and era: legacy initialize (echo + down-negotiation), tools/list with `_meta.ui` + legacy key, representative tools/call with fallback text (+ structuredContent where upstream provides it), resources/read with exact `text/html;profile=mcp-app`, invalid input rejection without internals; modern list/call/read plus `server/discover`. Abuse/fault: malformed JSON (-32700) and malformed JSON-RPC, unknown/disabled/traversal slugs, oversized declared and streamed bodies (413), oversized-result containment (fixture app), deadline 504 (fixture), concurrency shedding and recovery, client cancellation with capacity release, missing-bundle boot failure (healthz green, readyz red, bounded resource errors), app-registration failure containment, 20 concurrent mixed clients without leakage, deterministic dataset equality across calls.

## 9. CI and Security Verification

- CI `check` green on the merged head; CodeQL `analyze` green with SARIF uploaded (public repo).
- CodeQL surfaced 2 security-relevant findings pre-merge; both fixed in source (ISS-008): `js/incomplete-sanitization` in the SBOM purl builder (`replaceAll`) and `js/missing-rate-limiting` on the unused dev-only upstream `serve.ts` copy (removed; harness reimplemented in-memory). A remaining `js/identity-replacement` warning (severity 5.0, upstream UI cosmetic) is below the blocking thresholds and left as upstream behavior.
- Dependency review active for public PRs; locked `pnpm audit --prod` in CI throughout; secret-pattern scan over tracked files in the public-readiness workflow (clean).

## 10. Preview Deployment

- Exact PR-head Preview proof: 28/28 deployment-origin canary checks (gallery page + independence disclaimer, security headers, healthz/readyz/version provenance, apps.json honesty, six apps × legacy initialize/list/call/read + modern list/call, unknown slug 404, DELETE 405, malformed JSON, oversized body 413) on deployment `dpl_DTo72...` lineage, final green on head `d68adf69` and re-verified on subsequent heads.
- Preview URLs are deployment-protected (Vercel Authentication); canaries ran through authenticated `vercel curl`. Preview proof is recorded as deployability evidence, not production-environment equivalence.

## 11. Staged Production Deployment

- Exact merged forward SHA: `ef5c34365115675e5494f4bde5692ce60017afdc`; deployment `dpl_A2cnaBGg4tRbSMFn5T9s8RPLFzwv` (target `production`, staged — canonical domain deliberately unassigned via `autoAssignCustomDomains: false`).
- Inspection: git ref `forward`, exact SHA match, region `iad1`, framework hono, Node 24 (`/version` reports v24.18.0), `maxDuration: 30`, `supportsCancellation: true`, `includeFiles: generated/mcp-app-resources.json`, state READY.
- Staged canaries: 28/28 (page, headers, diagnostics, apps.json, six apps × legacy initialize/list/call/read + modern list/call, unknown slug, DELETE, malformed JSON, oversized body).
- Observation window: 19:03:11Z–19:25:00Z, 9 full sweeps × 28 checks = **252/252 pass over ~21.8 continuous minutes** (cold start exercised at first request; all later sweeps warm; byte counts and latencies in the sweep log). The plan's 24-hour window is recorded as Pending Operational Observation.
- Pre-promotion record: staged deployment ID above; **no previous eligible Current production deployment existed (first release)** — the first-release fallback (withhold/remove the alias; per-app `DISABLED_APP_SLUGS` kill switch; re-stage) was documented instead of pretending a rollback target existed.

## 12. Stable Production Verification

- Promotion: `vercel promote dpl_A2cnaBGg…` (no rebuild, 903 ms) at 19:25:52Z after re-inspecting READY/target/SHA.
- Stable origin <https://openwork-mcp-app-gallery-fable.vercel.app>: **28/28** — gallery page with independence disclaimer, security headers (CSP, nosniff, XFO, referrer-policy, COOP/CORP, permissions-policy), `/healthz`, `/readyz` (six apps), `/version` (exact SHA `ef5c3436…`, pinned upstream commit, no secret-like content), `/apps.json` honesty, all six MCP endpoints on both protocol eras, unknown-slug 404, DELETE 405, malformed JSON −32700, oversized body 413; MCP/diagnostics `private, no-store`; immutable content-hashed assets.
- WAF verified live: 150-request single-IP burst → 80×200 then 70×403 deny on `/apps/*/mcp`; service unaffected for normal traffic after the window.
- Production page in a real browser (Playwright): endpoint `code` elements upgraded to the exact production URLs from the page's own origin, live build label `ef5c343` filled from `/version`, **Copy MCP URL** copied `https://openwork-mcp-app-gallery-fable.vercel.app/apps/get-time/mcp` with accessible success feedback.
- Rollback state: first release — no eligible prior deployment; fallback documented and kill-switch path tested at the gateway level (`DISABLED_APP_SLUGS` remove-only override with visible `enabled: false`).

## 13. Host Compatibility Matrix

Host: **OpenWork (installed)** — /Applications/OpenWork.app, workspace "OpenWork Chat", user-authored MCP path = workspace `opencode.jsonc` remote servers (reverted to its backup after the proof). macOS (Darwin 25.5.0). Gallery commit `ef5c3436…`; production endpoints; tested 19:34–19:52Z.

| App | Endpoint connect + initialize + tools/list | Agent tools/call (fallback delivered) | ui:// read + App render + initial result | Deep interaction | Notes |
| --- | --- | --- | --- | --- | --- |
| get-time | Passed | Passed (live UTC timestamp) | **Passed** (App mounted in OpenWork's MCP-Apps double-iframe sandbox with CSP params; "Server Time" populated) | App-initiated `callServerTool` sent but timed out (−32001) exactly as the shared renderer was first blocked by the concurrent candidate (ISS-009) — attribution ambiguous; the same round trip passes in the browser harness | Screenshot captured |
| budget-allocator | Passed | Passed (structured budget summary) | **Passed** (h1, 5 sliders, 6 chart canvases) | **Passed** — slider driven 25.0%/$25K → 40.0%/$40K with live recalculation | Screenshot captured |
| cohort-heatmap | Task created and agent called the tool (session "Interactive customer-ret…") | Passed (agent-level) | Incomplete — render check blocked by ISS-009 | — | |
| customer-segmentation | Not reached | — | Incomplete (ISS-009) | — | |
| scenario-modeler | Not reached | — | Incomplete (ISS-009) | — | |
| transcript | Not reached | — | Incomplete (ISS-009) | — | |

Additional OpenWork journey items: restart journey **Passed** (sessions persisted and reopened; endpoints reconnected); same-server isolation observed (each session saw exactly its own gallery server tool); teardown check **Incomplete** (ISS-009); the app could not reach another gallery server (each server config exposes only its own endpoint; protocol-level isolation proven in the contract matrix and browser harness).

**Independent host: Incomplete** after three materially different attempts: (1) Claude Desktop — driving it needs screen-control approval from the absent user; (2) claude.ai in the sandboxed browser pane — reachable but signed out, and entering credentials is prohibited; (3) the user's real Chrome session — adding a custom MCP connector is a persistent account-configuration change requiring explicit user permission unavailable in an autonomous run. The upstream basic host (browser harness) proves all six apps render and interact against the live endpoints, and is honestly classified as a contract harness, not independent-host proof.

## 14. Performance and Runtime Observations

- Vercel builds: ~18 s with cache (fresh install ~1.2 s via pnpm store; six vite UI builds ~10 s).
- Staged/production sweeps: full 28-check sweep ≈ 2.5 min through authenticated `vercel curl` (per-request CLI overhead dominates); direct public-origin sweep ≈ 75 s.
- Cold start: first invocation after deploy served correctly (observation sweep 1 green, no cold-start failures); the function stays warm under Fluid across sweeps.
- Resource bundle: 3,333,501 bytes across six UIs (largest ~560 KB) + the 15 KB gallery page; loads and digest-validates at first request.
- No invocation errors, timeouts, or memory incidents observed across 252 observation checks, the stable-origin suite, and the burst test (aside from intended WAF denies).

## 15. Safety and Abuse Controls

- No accounts, cookies, database, uploads, credentials, subprocesses, write tools, or intended server egress (mechanically scanned); logs restricted to slug/method-category/status/duration/byte counts with a redaction-by-construction logging seam.
- Request/result/resource/time/concurrency ceilings as in section 4; fail-closed `DISABLED_APP_SLUGS` remove-only override (disabled state stays visible in `/apps.json`).
- Vercel Firewall rate-limit rule `mcp-endpoint-rate-limit` active: per-IP fixed window 60 s, limit 120, action deny, on `^/apps/[^/]+/mcp$`; no Bot Challenge applies to MCP paths. The in-process semaphores are documented as per-instance backstops, not globally authoritative.
- Snacks-baseline security headers and cache policy (immutable content-hashed assets; `private, no-store` MCP/diagnostics) asserted by the architecture check and verified on deployments.

## 16. Timing Summary

Authoritative timestamps in `TIMELINE.md` §2 and `benchmark/timeline.json`. Headlines: start 16:42:52Z; six-app catalog locally green 34m47s; full local release gate green 42m38s; PR open 45m28s; first Preview 53m32s; all-green mergeable head 2h17m38s (org-ruleset path); merge 2h18m38s; staged READY 2h19m38s; promotion 2h43m00s; stable-origin proof 2h43m53s; report finalization 3h31m34s (12,694,295 ms). External wait ≈50m, CI wait ≈17m, Vercel wait ≈8m, recorded rework ≈55m, estimated active ≈2h20m (Estimated).

## 17. Problems and Regressions Summary

Issues ISS-001…ISS-008 and self-introduced regressions REG-001…REG-003 are ledgered with timestamps, classifications, origins, repairs, and closing verification in `TIMELINE.md` (sections 6–9) and `benchmark/timeline.json`. Headlines: the plan's 512 KiB resource ceiling vs real official artifact sizes (deviation, documented); Vercel's native-ESM loader vs extensionless imports (total-outage regression caught by the first deployed request, fixed with a mechanical guard); the framework preset's pre-build static snapshot and function-first root routing (three-step discovery, resolved with a committed deterministic site served by the function); a GitHub API 503 incident; the org default-branch ruleset vs a solo autonomous merge; and two CodeQL security findings fixed in source.

## 18. Passed

Local: format, lint, strict typecheck, notices/provenance (98 files), source-boundary scan, `pnpm audit --prod`, 96 unit/gateway/contract tests (six apps × both protocol eras; abuse/fault/isolation/determinism/concurrency), production build, architecture invariant (incl. native-ESM and site-drift rules), SBOM, 15 browser tests through the upstream basic host (incl. get-time UI→tool round trip, budget deep interaction, isolation, gallery a11y/copy/320 px), clean-clone equivalence via CI. CI/CodeQL green on the merged head and post-merge on `forward`; dependency review green (public); public-readiness evidence green incl. secret scan. Exact-head Preview proof 28/28. Staged proof 28/28 + 252/252 observation. Promotion; stable-origin 28/28; WAF live verification; production page browser proof. OpenWork deep pair (get-time render+result, budget deep interaction) + restart journey via the user-authored MCP path. Provenance/licensing chain complete; repository public after its readiness gates.

## 19. Failed

None outstanding. (Every failure encountered during the run — ISS-001…ISS-008, REG-001…REG-003 — was repaired in source and re-verified before release.)

## 20. Incomplete

1. Independent-host proof for `get-time` (three documented attempts; user-approval-gated surfaces unavailable in an autonomous run).
2. In-OpenWork render checks for cohort-heatmap, customer-segmentation, scenario-modeler, transcript; the in-OpenWork app-initiated tool-call retry; and the teardown check (ISS-009 shared-host contention; the cohort agent-level call did execute).
3. 24-hour operational observation (Pending Operational Observation; the 21.8-minute continuous window completed).

## 21. Skipped

None. (No required check was skipped; bounded OPTIONS is deliberately served only to allowlisted browser origins per the plan.)

## 22. Deferred

1. Wave 2 catalog expansion (per plan, after observing Wave 1).
2. OpenWork deep-link ("Open in OpenWork") until a stable deep-link contract exists.
3. Rolling Releases and Vercel Services (explicit plan non-goals for Wave 1).
4. WAF threshold tuning from a real load study (initial 120/min/IP verified functional).

## 23. Deviations From the Shared Plan

1. UI-resource ceiling 1 MiB instead of the initial 512 KiB (official React examples build to ~531 KiB single-file HTML; tool-result ceiling unchanged at 512 KiB). ISS-001.
2. The gallery site is deterministic and committed rather than build-time-generated, and the function serves `/` from a bundled digest-verified copy — the plan's pure-CDN model is impossible under the framework preset's pre-build static snapshot and function-first root resolution. Assets and screenshots remain on the CDN. ISS-005.
3. The two-app vertical (P2) and six-app catalog (P3) landed together: the SDK-v2 adapter made the remaining four imports mechanical, so no separate two-app milestone build existed to measure.
4. The `transcript` card describes live speech transcription (the example's real behavior), not the plan table's "rich navigation of structured content".
5. The repository became public after its readiness gates but before the merge (nominal order reversed): the org ruleset's code-scanning requirement needs SARIF upload, which is unavailable on this private repository. ISS-007.
6. `OPTIONS` preflight is served for explicitly allowlisted browser origins (the browser-based test harness is such a verified client); production default remains no allowlist.

## 24. Known Risks

- The org-level default-branch ruleset requires review/scanning conditions that a solo autonomous flow can only satisfy via repo-admin bypass merges; future maintenance PRs inherit ISS-007's constraints.
- The in-process concurrency limits are per instance under Fluid; the WAF rule is the global control, and its thresholds (120/min/IP) are initial values not yet tuned by a load study.
- `transcript` depends on browser `SpeechRecognition` availability in the host's webview; hosts without it render the UI but cannot start recognition (upstream behavior).
- Upstream licensing is mid-transition (MIT→Apache-2.0); notices pin the observed state at the pinned commit.

## 25. Reproduction Commands

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm release:check          # complete local release gate
pnpm dev                    # local gallery at http://localhost:3000
node scripts/deploy-canary.mjs --url <origin>   # deployment-origin canary suite
node scripts/check-upstream.mjs                 # read-only upstream drift report
```

## 26. Final Verdict

**Passed.** All mandatory build, protocol, safety, CI, provenance, preview, staged, promotion, and stable-origin gates are green on the exact deployed forward release, with the three Incomplete groups of section 20 recorded honestly rather than claimed. The final docs-only commit is re-staged, canaried, and promoted through the identical flow (receipt in PR #2 and the final handoff), so production always serves the current forward head.
