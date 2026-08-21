# Agent contract

This is the grok namespaced Hosted MCP Apps Example Gallery. It is an
independent adaptation of official examples, not an official Model Context
Protocol service.

## Boundaries

- Work only in this repository and its namespaced Vercel project
  `openwork-mcp-app-gallery-grok`.
- Do not inspect or modify sibling SOL or FABLE candidates.
- Do not modify OpenWork, Snacks, or OpenWork Lounge from this repository.
- Do not fetch upstream `main` at build or runtime.
- Do not spend on paid Vercel or GitHub capacity, custom domains, or DNS.
- Do not announce the gallery.

## Delivery

- Default and production branch: `forward`.
- Feature work: `grok/gallery-v1` or another focused branch targeting `forward`.
- Use pnpm 10.28.0 and Node.js 24.x.
- Run `pnpm release:check` before merge.
- Stage Production from the exact `forward` SHA, then promote without rebuild.
