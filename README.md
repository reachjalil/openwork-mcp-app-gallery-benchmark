# OpenWork MCP Apps gallery benchmark

Personal monorepo that preserves three independently hosted MCP Apps gallery
implementations and compares them with a shared evidence and scoring record.

This is not an official Model Context Protocol service. Each candidate is an
independent adaptation of official examples.

## Implementations

| Candidate | Path | Stable origin | Original verdict |
| --- | --- | --- | --- |
| SOL | `implementations/sol` | https://openwork-mcp-app-gallery-sol.vercel.app | Passed |
| FABLE | `implementations/fable` | https://openwork-mcp-app-gallery-fable.vercel.app | Passed |
| GROK | `implementations/grok` | https://openwork-mcp-app-gallery-grok.vercel.app | Incomplete |

The original GROK verdict remains `Incomplete` because the historical PR did
not merge into `forward` during the August 17 benchmark window. The latest
`grok/gallery-v1` content is imported here without merging, approving,
bypassing, or closing that PR.

## Branches

- `dev` — default integration branch and Vercel Preview source
- `main` — production-only source for all three Vercel projects

There is no `forward` branch in this repository.

## Local checks

Use Node.js 24.x and pnpm 10.28.0. Implementations are independent; there is
no root workspace.

```bash
pnpm run check:sol
pnpm run check:fable
pnpm run check:grok
pnpm run check:all
pnpm run benchmark:validate
pnpm run benchmark:compare
pnpm run benchmark:score
```

## Documentation

- Experiment brief: `docs/experiment/`
- Findings: `docs/findings/`
- Performance: `docs/performance/`
- Assessment and scores: `docs/assessment/`
- Import provenance: `docs/migration/`

## Deployment

Three existing Vercel projects connect to this one Git repository:

- `openwork-mcp-app-gallery-sol` → `implementations/sol`
- `openwork-mcp-app-gallery-fable` → `implementations/fable`
- `openwork-mcp-app-gallery-grok` → `implementations/grok`

Production Branch is `main`. `dev` creates Preview deployments.
