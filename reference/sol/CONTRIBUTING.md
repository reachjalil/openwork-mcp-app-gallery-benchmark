# Contributing

Development targets the protected `forward` branch through focused pull requests. `main` and `dev` are intentionally not integration or release branches. Use an outcome-oriented branch name and preserve linear history; never force-push `forward`.

## Environment

- Node.js 24.x
- pnpm 10.28.0
- the exact committed `pnpm-lock.yaml`

Install with:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

Do not add credentials, environment files, personal data, private deployment URLs, mutable runtime downloads, write tools, arbitrary package execution, uploads, durable state, server-side egress, or cross-app access.

## Making a change

Keep each MCP App behind its own `/apps/<slug>/mcp` server surface. Preserve ordinary fallback content, structured content, immutable `ui://` identity, MCP UI metadata, browser initialization, initial tool input/result delivery, same-server calls, cancellation, and stateless dual-era behavior.

When updating gallery code:

```sh
pnpm generate
pnpm run release:check:ci
```

Run `pnpm run release:check` as the final local gate when the checkout is linked to the exact Vercel project. Generated resources, the public gallery, the SBOM, and provenance manifests are committed outputs and must match their generators.

## Upstream changes

Do not update the frozen MCP Apps source casually. A pin change requires all of the following in the same reviewed change:

1. review only the intended six upstream directories and the relevant root licensing transition;
2. update the exact commit and every copied file without editing the frozen snapshot in place;
3. regenerate original paths, digests, byte counts, licenses, notices, and adaptation records in `upstream/manifest.json`;
4. update `THIRD_PARTY_NOTICES.md` when the license boundary changes;
5. rebuild all deterministic resources and prove every size ceiling;
6. rerun both protocol eras, the independent App bridge browser matrix, source/secret scans, dependency audit, and a production Vercel build;
7. document invalidated proof and new results in the release evidence.

Gallery-owned UI adaptations must stay outside `upstream/`, carry an explicit rationale, and preserve the observable example contract rather than silently becoming a different app.

## Pull requests

A pull request should explain the user outcome, architecture or contract changes, safety/privacy impact, source and license impact, exact verification performed, and any incomplete external proof. Do not describe missing proof as passed. Repairs should identify which prior evidence was invalidated and show the closing rerun.

The mandatory checks are CI, CodeQL, dependency review or locked audit, public readiness, and the exact Vercel Preview check when connected. Merge readiness and production promotion are separate decisions.

This repository is operated in a single-author release mode under a parent
organization rule that requires a non-last-pusher approval. For same-repository
pull requests, the `release-approval` CI job submits that approval only after
the complete exact-head `release-check` passes. It does not replace or bypass
the independently required CodeQL, dependency, public-readiness, Preview,
signature, freshness, or conversation-resolution gates.
