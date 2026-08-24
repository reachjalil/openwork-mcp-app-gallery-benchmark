# Post-migration performance

These measurements are monorepo health checks. They are not comparable to the
August 17 autonomous benchmark.

Environment unless noted: macOS darwin 25.5.0, Node v24.18.0, pnpm 10.28.0,
date 2026-08-21.

## Source-head check before import

| Candidate | Command | Working directory | SHA | Result | Elapsed | Limitation |
| --- | --- | --- | --- | --- | --- | --- |
| GROK | `pnpm install --frozen-lockfile && pnpm run typecheck` | `/Users/jalillaaraichi/openwork-mcp-app-gallery-grok` | `6c0e6bab7eb579da5eee0a8e2cc9de2f57b855c4` | Passed | ~2.7 s wall for the combined command after a warm store | Not a full release gate |
| GROK | `pnpm run release:check` | same | same | Passed | 14,938 ms including Playwright install | Ran on the source worktree, not the monorepo prefix |

Observed GROK `release:check` internals on that head: unit 5/5, gateway 8/8,
contract 21/21, browser 2/2, notices/upstream/Vercel/secrets/boundary/SBOM
passed.

## Monorepo-prefix checks

Ran 2026-08-21 on the imported trees plus the small `ci:check` / `AGENTS.md`
adaptations, before the migration documentation commit. Parent import merge
was `1ee0a2bc0ef15aba349619fd6d4309bd578a691d`. Node v24.18.0, pnpm 10.28.0.

| Candidate | Command | Result | Elapsed (`time -p` real) | Observed tests | Limitation |
| --- | --- | --- | ---: | --- | --- |
| SOL | `pnpm run ci:check` in `reference/sol` | Passed | 27.67 s | 42 unit/contract + 10 browser | First Prettier failure on the edited `AGENTS.md` was fixed and the command rerun |
| FABLE | `pnpm run ci:check` in `reference/fable` | Passed | 23.67 s | 96 unit/gateway/contract + 15 browser | Biome printed existing warnings and still exited 0 |
| GROK | `pnpm run ci:check` in `reference/grok` | Passed | 12.98 s | 5 unit + 8 gateway + 21 contract + 2 browser | Rebuild touched `generated/mcp-app-resources.json`; that generated diff was discarded |

## Preview and production

Preview and production timing after Vercel remapping is unavailable until
the manual takeover completes.
