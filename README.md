# OpenWork MCP Apps gallery

Personal monorepo for one hosted MCP Apps gallery plus the three August 17
benchmark implementations kept as references.

This is not an official Model Context Protocol service. Each tree is an
independent adaptation of official examples.

## Active gallery

`implementations/gallery` is the single implementation to deploy. It takes
FABLE as the runtime base and ports the small GROK and SOL wins documented
in `implementations/gallery/SELECTION.md` and
`docs/assessment/canonical-selection.md`.

## Reference implementations

| Candidate | Path | Historical origin | Original verdict |
| --- | --- | --- | --- |
| SOL | `implementations/sol` | https://openwork-mcp-app-gallery-sol.vercel.app | Passed |
| FABLE | `implementations/fable` | https://openwork-mcp-app-gallery-fable.vercel.app | Passed |
| GROK | `implementations/grok` | https://openwork-mcp-app-gallery-grok.vercel.app | Incomplete |

The original GROK verdict remains `Incomplete` because the historical PR did
not merge into `forward` during the August 17 benchmark window. Those three
trees stay as references and are not the production gallery.

## Branches

- `dev` — default integration branch and Vercel Preview source
- `main` — production-only source

There is no `forward` branch in this repository.

## Local checks

Use Node.js 24.x and pnpm 10.28.0. Implementations are independent; there is
no root workspace.

```bash
pnpm run check:gallery
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
- Canonical selection: `docs/assessment/canonical-selection.md`
- Import provenance: `docs/migration/`

## Deployment

Deploy one Vercel project with Root Directory `implementations/gallery`,
Production Branch `main`, and Preview Branch `dev`. The three historical
origins are references only.
