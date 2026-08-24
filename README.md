# MCP Apps Example Gallery

**Live gallery: <https://openwork-mcp-app-gallery.vercel.app>**

Six official [Model Context Protocol MCP Apps examples](https://github.com/modelcontextprotocol/ext-apps),
hosted as remote MCP servers you can try by URL — and a working, fully tested
codebase you can copy to build and host **your own** MCP Apps.

> An **MCP App** is an MCP tool that also ships an interactive UI: when a
> compatible host (OpenWork, Claude, …) calls the tool, it renders the app's
> HTML inside the conversation, and the app can talk back to its server. Hosts
> without MCP Apps support still get an ordinary text/structured result.

**→ Want to build one? Start with the guide: [docs/building-mcp-apps.md](docs/building-mcp-apps.md)**

## Try it in two minutes

1. Copy an endpoint (or use **Copy MCP URL** on the [gallery page](https://openwork-mcp-app-gallery.vercel.app)):

   ```
   https://openwork-mcp-app-gallery.vercel.app/apps/budget-allocator/mcp
   ```

2. Add it as a remote MCP server in your host (Claude: Settings → Connectors →
   Add custom connector, auth **None**; OpenWork: Library → MCPs → Add
   workspace MCP).
3. Prompt: *“Create a $1 million seed-stage budget I can adjust interactively.”*
4. An interactive budget panel renders — drag the sliders and watch it
   recalculate.

| App | Endpoint path | Try this prompt |
| --- | --- | --- |
| Get Time | `/apps/get-time/mcp` | Show me the current server time using the interactive app. |
| Budget Allocator | `/apps/budget-allocator/mcp` | Create a $1 million seed-stage budget I can adjust interactively. |
| Cohort Heatmap | `/apps/cohort-heatmap/mcp` | Show me an interactive customer-retention cohort heatmap. |
| Customer Segmentation | `/apps/customer-segmentation/mcp` | Let me explore customers by revenue and engagement. |
| Scenario Modeler | `/apps/scenario-modeler/mcp` | Compare a bootstrapped plan with a venture-funded growth plan. |
| Transcript | `/apps/transcript/mcp` | Open a live speech transcription app I can dictate into. |

Non-MCP routes: `/` (gallery page) · `/apps.json` (machine manifest) ·
`/healthz` · `/readyz` · `/version`.

## What this repo demonstrates

- **The MCP Apps contract end to end** — tool + `ui://` resource +
  `text/html;profile=mcp-app` + the App bridge, on both the current
  `2026-07-28` protocol revision and the 2025-era Streamable HTTP flow that
  today's hosts use.
- **One server per app, one origin** — a path-routed gateway
  (`/apps/:slug/mcp`) mounts each example as its own isolated MCP server:
  no tool-name collisions, no cross-app state, no mega-catalog.
- **Safe anonymous hosting** — request/response/time/concurrency ceilings,
  origin policy, edge rate limiting, sanitized logs, no accounts, no
  persistence, no server-side egress.
- **A real verification bar** — 96 unit/gateway/protocol-contract tests plus
  15 real-browser tests that render every app through the official test host,
  provenance/digest verification for every borrowed upstream file, CodeQL,
  SBOM, and a deployment canary suite.

## Run it locally

Requires Node 24.x and pnpm 10.28.0 (via corepack):

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev            # builds the app UIs + gallery site, serves on :3000
```

Full release gate (what CI runs):

```bash
pnpm exec playwright install chromium
pnpm run ci:check
```

## Repository layout

```
app.ts, src/          the gallery server (Hono + mcp-handler 2 / MCP SDK v2)
upstream/ext-apps/    the six examples, pinned to an audited upstream commit
                      (per-file provenance in upstream/manifest.json)
public/, site-src/    the gallery page (served from the CDN + function)
tests/                unit / gateway / protocol-contract / browser suites
scripts/              build, canary, provenance, and architecture checks
docs/                 the build-your-own-MCP-app guide
reference/            how this gallery was chosen: three complete candidate
                      implementations (sol, fable, grok) with benchmark
                      findings, scorecards, and receipts — see reference/README.md
```

## Attribution and license

This gallery is an **independent hosted adaptation** of the official examples
from `modelcontextprotocol/ext-apps`, pinned at commit
[`10195ad9`](https://github.com/modelcontextprotocol/ext-apps/commit/10195ad91851502134930e9b80ec2c04e277a720).
It is not hosted or endorsed by the Model Context Protocol project.
Repository code is Apache-2.0 (`LICENSE`); adapted upstream example code keeps
its own notices (`THIRD_PARTY_NOTICES.md`, `upstream/manifest.json`). Demo
service — no accounts, no stored data, no SLA.
