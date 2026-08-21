# Migration receipt — 2026-08-21

Public-safe execution record for moving the MCP Apps gallery benchmark into
`reachjalil/openwork-mcp-app-gallery-benchmark`. No tokens, environment
values, project IDs, or protected Preview URLs.

Owning plan:
`openwork-lounge/plans/migrate-mcp-app-gallery-benchmark-to-personal-monorepo.md`

## Authorization

Jalil authorized immediate execution on 2026-08-21. The public personal
monorepo, GitHub source transfers, direct GROK branch import without merging
the old PR, exact-green `dev` merge, later `dev` to `main` release, targeted
rollback, and final source archival are pre-authorized. The only planned
manual stop is the Vercel/GitHub account configuration.

H0 confirmation already recorded:

```text
Proceed with the public personal monorepo in jalil-7198s-projects. Do not add paid features.
```

## Phase 0 — Refresh, freeze, and back up

Completed 2026-08-21. No external mutation during this phase.

| Surface | Observation |
| --- | --- |
| GitHub identity | `reachjalil` |
| Vercel identity | `jalil-7198`; teams `prologe`, `jalil-dev`, `jalil-7198s-projects` |
| SOL source | `different-ai/openwork-mcp-app-gallery-sol`; public; `forward` `8ac19f179d296f1831a24aacf92d784d36d7ba3d` |
| FABLE source | `different-ai/openwork-mcp-app-gallery-fable`; public; `forward` `2d8547d1b0e1d962c8d799d1b509d889dc96ef08` |
| GROK source | `different-ai/openwork-mcp-app-gallery-grok`; public; `grok/gallery-v1` `6c0e6bab7eb579da5eee0a8e2cc9de2f57b855c4` |
| GROK PR #1 | OPEN, MERGEABLE, review-blocked at the organization; six Cursor-coauthored commits; product SHA `78a52fd9defc0d9855021b283191d46b86505ca1` |
| Personal collisions | none |
| Local target | did not exist |
| Local worktrees | clean; untracked `.env.local` files excluded from bundles |

Backups at `/Users/jalillaaraichi/openwork-mcp-app-gallery-migration-backup-2026-08-21`:

| Bundle | SHA-256 | Verify |
| --- | --- | --- |
| `sol.bundle` | `807dbb8c344e12e7533b19b3f82bc5c0ebd3babae3c4a1ae57d68a1fb25741b2` | complete history |
| `fable.bundle` | `cf17f07ad3657669b581bd6120127baced346cbac4ac610c0ffa4caae73ba71b` | complete history |
| `grok.bundle` | `8b452fd8a211108a5fe04d4afcdf4c54a43859ed054a8c470bf0a8845a65acc1` | complete history |

## Phase 1 — Transfer source repositories

Completed 2026-08-21. No GitHub acceptance step was required.

| Candidate | New repository | Old URL | PRs preserved |
| --- | --- | --- | --- |
| SOL | https://github.com/reachjalil/openwork-mcp-app-gallery-sol | redirects | #1 MERGED, #2 MERGED |
| FABLE | https://github.com/reachjalil/openwork-mcp-app-gallery-fable | redirects | #1 MERGED, #2 MERGED |
| GROK | https://github.com/reachjalil/openwork-mcp-app-gallery-grok | redirects | #1 OPEN |

Local remotes now point at the personal repositories. No `different-ai`
replacement repositories were created.

After transfer, GROK PR #1 remained OPEN at
`6c0e6bab7eb579da5eee0a8e2cc9de2f57b855c4`. It was not merged, approved,
bypassed, or closed.

## Phase 2 and 3 — Freeze import heads

| Candidate | Source ref | Import tag | Commit SHA | Original verdict |
| --- | --- | --- | --- | --- |
| SOL | `forward` | `monorepo-import-sol-2026-08-21` | `8ac19f179d296f1831a24aacf92d784d36d7ba3d` | Passed |
| FABLE | `forward` | `monorepo-import-fable-2026-08-21` | `2d8547d1b0e1d962c8d799d1b509d889dc96ef08` | Passed |
| GROK | `grok/gallery-v1` | `monorepo-import-grok-2026-08-21` | `6c0e6bab7eb579da5eee0a8e2cc9de2f57b855c4` | Incomplete |

GROK source-head checks on `6c0e6bab7eb579da5eee0a8e2cc9de2f57b855c4` with
Node v24.18.0 and pnpm 10.28.0:

- `pnpm install --frozen-lockfile` and `pnpm run typecheck`: Passed
- `pnpm run release:check`: Passed in 14,938 ms

## Phase 4 — Create the monorepo and import histories

- Local path: `/Users/jalillaaraichi/openwork-mcp-app-gallery-benchmark`
- GitHub: https://github.com/reachjalil/openwork-mcp-app-gallery-benchmark
- Visibility: public
- Bootstrap `main` / initial `dev`: `e6a15ce397767373e94098f3f2182d44f431e9ba`
- Default branch: `dev`
- No `forward` branch
- Subtree merges: SOL `16a4e091…`, FABLE `ff2be54d…`, GROK `1ee0a2bc…`
- Tree equivalence before later edits: SOL 132, FABLE 168, GROK 157 files

## Phase 5 and 6 — Operable monorepo, evidence, and scoring

Root CI, comparison scripts, and assessment documents added on
`migration/consolidate-gallery-candidates`. Local `ci:check` from each
implementation prefix passed on 2026-08-21. Original-benchmark normalized
scores: SOL 86.25, FABLE 91.25, GROK 72.50. Original verdicts unchanged.

## Phase 7 — Migration PR merged into `dev`

- PR: https://github.com/reachjalil/openwork-mcp-app-gallery-benchmark/pull/1
- Exact head: `d4efd2ea4869950e9a92adc9583ce46b09668153`
- Merge commit / current `dev`: `f461e615cd0f47d7a9a091a2179eb7564cf5efa8`
- Required checks on that head: `sol`, `fable`, `grok`, `comparison`, `compare`, `analyze`, and GHAS `CodeQL` all Passed
- Merge method: normal merge commit, not squash
- `main` remains bootstrap `e6a15ce397767373e94098f3f2182d44f431e9ba`
- No monorepo `forward` branch
- Historical GROK PR #1 remains OPEN at `6c0e6bab7eb579da5eee0a8e2cc9de2f57b855c4`
- Stable origins still returned HTTP 200 on `/healthz` after the GitHub merge

Repository rulesets added: `dev-protection` (no force-push/delete) and
`main-protection` (no force-push/delete; pull request required).

## Checkpoint — stopping for Vercel takeover

CLI cannot transfer FABLE/GROK out of Different AI or grant the Vercel
GitHub App access to the new repository. Production Git sources and Root
Directories are still the old single-repo `.` layout. Do not treat the
takeover as complete until Jalil confirms and the agent reinspects live
Vercel configuration.
