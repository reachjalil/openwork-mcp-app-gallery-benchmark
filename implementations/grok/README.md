# Hosted MCP Apps Example Gallery (grok)

This repository is an **independent hosted adaptation** of six official
[MCP Apps](https://github.com/modelcontextprotocol/ext-apps) examples. It is
**not** an official Model Context Protocol service, product, or endorsement.

Copy one remote Streamable HTTP MCP URL, add it to an MCP Apps-compatible host
such as OpenWork, and try the example. You do not need to clone upstream, run
`npx`, or open a tunnel.

Each example is a separate MCP server under one origin. There is no root
mega-MCP, no shared tool namespace, and no cross-app resource access.

Wave 1 has no accounts, cookies, database, credentials, uploads, or durable
user data. There is **no SLA**.

## Browse the six examples

Production origin (verified): `https://openwork-mcp-app-gallery-grok.vercel.app`

| Example               | Outcome                                                                   | Category      | MCP endpoint                      | Production URL                                                                    |
| --------------------- | ------------------------------------------------------------------------- | ------------- | --------------------------------- | --------------------------------------------------------------------------------- |
| Get Time              | Smallest tool plus interactive UI round trip for the current server time. | starter       | `/apps/get-time/mcp`              | `https://openwork-mcp-app-gallery-grok.vercel.app/apps/get-time/mcp`              |
| Budget Allocator      | Adjust a synthetic seed-stage budget with charts and recalculation.       | form          | `/apps/budget-allocator/mcp`      | `https://openwork-mcp-app-gallery-grok.vercel.app/apps/budget-allocator/mcp`      |
| Cohort Heatmap        | Explore a dense interactive customer-retention heatmap.                   | visualization | `/apps/cohort-heatmap/mcp`        | `https://openwork-mcp-app-gallery-grok.vercel.app/apps/cohort-heatmap/mcp`        |
| Customer Segmentation | Filter synthetic customers by revenue and engagement.                     | chart         | `/apps/customer-segmentation/mcp` | `https://openwork-mcp-app-gallery-grok.vercel.app/apps/customer-segmentation/mcp` |
| Scenario Modeler      | Compare synthetic SaaS growth plans over stateless tools.                 | form          | `/apps/scenario-modeler/mcp`      | `https://openwork-mcp-app-gallery-grok.vercel.app/apps/scenario-modeler/mcp`      |
| Transcript            | Navigate a structured transcript in an interactive view.                  | media         | `/apps/transcript/mcp`            | `https://openwork-mcp-app-gallery-grok.vercel.app/apps/transcript/mcp`            |

The landing page is generated from the same catalog used for routing. Each card
includes the audited upstream source, pinned revision, screenshot, safety note,
suggested prompt, Copy MCP URL control, compatibility state, last verified
build, and the restrained `grok` implementation label.

## Add an endpoint to a host

1. Open the gallery and copy one MCP URL, or compose
   `{origin}/apps/{slug}/mcp`.
2. Add that URL as a remote Streamable HTTP MCP server in an MCP Apps-compatible
   host.
3. Send the suggested prompt on the card.
4. If the host cannot render an MCP App, the ordinary text or structured tool
   result still works.

Protocol support:

- current `2026-07-28` Streamable HTTP, including `Mcp-Method` / `Mcp-Name`
  headers and the per-request `_meta` envelope;
- 2025-era stateless Streamable HTTP fallback.

`DELETE` returns 405 because this implementation is stateless and has no
server-side session to terminate.

## Sample prompts

- Get Time: `Show me the current server time using the interactive app.`
- Budget Allocator: `Create a $1 million seed-stage budget I can adjust interactively.`
- Cohort Heatmap: `Show me an interactive customer-retention cohort heatmap.`
- Customer Segmentation: `Let me explore customers by revenue and engagement.`
- Scenario Modeler: `Compare a bootstrapped plan with a venture-funded growth plan.`
- Transcript: `Show me an interactive transcript I can navigate.`

## Run locally

Requires Node.js 24.x and pnpm 10.28.0.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run build:vercel
GALLERY_GIT_SHA=local pnpm dev
```

Then open `http://127.0.0.1:8787`. Local MCP endpoints:

- `http://127.0.0.1:8787/apps/get-time/mcp`
- `http://127.0.0.1:8787/apps/budget-allocator/mcp`
- `http://127.0.0.1:8787/apps/cohort-heatmap/mcp`
- `http://127.0.0.1:8787/apps/customer-segmentation/mcp`
- `http://127.0.0.1:8787/apps/scenario-modeler/mcp`
- `http://127.0.0.1:8787/apps/transcript/mcp`

Diagnostic routes: `/`, `/apps.json`, `/healthz`, `/readyz`, `/version`.

Optional `BASE_URL` is for a local tunnel. Public URLs are never taken from an
arbitrary `Host` header.

## Reproduce release:check

```bash
pnpm exec playwright install --with-deps chromium
pnpm release:check
```

That frozen check runs audit, format, lint, typecheck, the production Vercel
build, unit/gateway/contract/browser tests, notices, upstream pin, Vercel
architecture, secret scan, source-boundary scan, and SBOM generation.

## Source attribution

Upstream examples are pinned to
[`modelcontextprotocol/ext-apps@10195ad91851502134930e9b80ec2c04e277a720`](https://github.com/modelcontextprotocol/ext-apps/commit/10195ad91851502134930e9b80ec2c04e277a720).

Production builds never fetch upstream `main`. Copied files, licenses, and
local modifications are recorded in `upstream/manifest.json` and
`THIRD_PARTY_NOTICES.md`. Gallery-owned code is Apache-2.0. Copied example
files retain the licenses recorded in the notices file.

Runtime registration uses a gallery-owned MCP SDK v2 adapter. The pinned
examples used SDK v1 `McpServer` instances; those are not passed into
`mcp-handler` 2.x. The browser App bridge remains `@modelcontextprotocol/ext-apps@1.7.5`.

## Data behavior

All datasets are synthetic demonstration data. Filters, numeric ranges, array
lengths, and payload sizes are clamped. Wave 1 does not store user state.

## Logging

Logs may include the `grok` namespace, app slug, MCP method category, status,
duration, byte counts, and safe build identifiers. They do not include tool
arguments, tool results, prompts, App HTML, authorization headers, cookies, IP
addresses, credentials, or user identifiers.

## Limits

- Request ceiling: 256 KiB
- Tool result ceiling: 512 KiB
- MCP App HTML resource ceiling: 1 MiB (see below)
- Application deadline: 15 seconds
- Vercel Function max duration: 30 seconds
- Region: `iad1`
- Fluid compute with request cancellation

Official single-file React MCP Apps exceed 512 KiB after production minify, so
the App HTML resource ceiling is 1 MiB while tool results stay at 512 KiB.

## License

Gallery-owned code is licensed under Apache-2.0. Copied upstream example files
retain the licenses recorded in `THIRD_PARTY_NOTICES.md`.
