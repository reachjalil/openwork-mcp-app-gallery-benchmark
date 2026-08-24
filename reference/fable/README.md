# MCP Apps Example Gallery (fable candidate)

Six official [Model Context Protocol MCP Apps examples](https://github.com/modelcontextprotocol/ext-apps),
hosted as remote Streamable HTTP MCP servers you can try by URL — no cloning,
no `npx`, no tunnel. Each example has a stable endpoint, a gallery card with a
screenshot and sample prompt, and a **Copy MCP URL** action.

> **Independence notice.** This gallery is an independent hosted adaptation of
> the official examples, pinned at upstream commit
> [`10195ad9`](https://github.com/modelcontextprotocol/ext-apps/commit/10195ad91851502134930e9b80ec2c04e277a720).
> It is **not** an official Model Context Protocol service and is not hosted or
> endorsed by the Model Context Protocol project. It is a demonstration
> service: no accounts, no stored user data, and **no SLA**.

## The apps

| Slug | Example | Demonstrates | MCP endpoint path |
| --- | --- | --- | --- |
| `get-time` | [basic-server-react](https://github.com/modelcontextprotocol/ext-apps/tree/10195ad91851502134930e9b80ec2c04e277a720/examples/basic-server-react) | Smallest tool + `ui://` resource + UI-to-tool round trip | `/apps/get-time/mcp` |
| `budget-allocator` | [budget-allocator-server](https://github.com/modelcontextprotocol/ext-apps/tree/10195ad91851502134930e9b80ec2c04e277a720/examples/budget-allocator-server) | Editable form, charts, recalculation | `/apps/budget-allocator/mcp` |
| `cohort-heatmap` | [cohort-heatmap-server](https://github.com/modelcontextprotocol/ext-apps/tree/10195ad91851502134930e9b80ec2c04e277a720/examples/cohort-heatmap-server) | Dense interactive data visualization | `/apps/cohort-heatmap/mcp` |
| `customer-segmentation` | [customer-segmentation-server](https://github.com/modelcontextprotocol/ext-apps/tree/10195ad91851502134930e9b80ec2c04e277a720/examples/customer-segmentation-server) | Filtering and chart interaction | `/apps/customer-segmentation/mcp` |
| `scenario-modeler` | [scenario-modeler-server](https://github.com/modelcontextprotocol/ext-apps/tree/10195ad91851502134930e9b80ec2c04e277a720/examples/scenario-modeler-server) | Scenario templates + custom 12-month projections | `/apps/scenario-modeler/mcp` |
| `transcript` | [transcript-server](https://github.com/modelcontextprotocol/ext-apps/tree/10195ad91851502134930e9b80ec2c04e277a720/examples/transcript-server) | Live browser speech transcription (Web Speech API) | `/apps/transcript/mcp` |

Non-MCP routes: `/` (gallery page), `/apps.json` (machine-readable manifest),
`/healthz`, `/readyz`, `/version`.

## Production endpoints

The production gallery is served at
**<https://openwork-mcp-app-gallery-fable.vercel.app>** (verified against the
exact deployed commit; receipts in `BENCHMARK_REPORT.md` and `TIMELINE.md`):

- <https://openwork-mcp-app-gallery-fable.vercel.app/apps/get-time/mcp>
- <https://openwork-mcp-app-gallery-fable.vercel.app/apps/budget-allocator/mcp>
- <https://openwork-mcp-app-gallery-fable.vercel.app/apps/cohort-heatmap/mcp>
- <https://openwork-mcp-app-gallery-fable.vercel.app/apps/customer-segmentation/mcp>
- <https://openwork-mcp-app-gallery-fable.vercel.app/apps/scenario-modeler/mcp>
- <https://openwork-mcp-app-gallery-fable.vercel.app/apps/transcript/mcp>

## Try an example in under five minutes

1. Open the gallery page and press **Copy MCP URL** on a card (or copy an
   endpoint above).
2. Add the URL as a remote MCP server in an MCP Apps-compatible host. In
   OpenWork, add it as a user-configured MCP server; other hosts have an
   equivalent "add remote MCP server" flow.
3. Send the card's sample prompt (for example, for `budget-allocator`:
   *"Create a $1 million seed-stage budget I can adjust interactively."*).
4. Interact with the app UI that renders inside the conversation.

**Hosts without MCP Apps support still work**: every tool returns an ordinary
text and/or structured result as fallback, so a plain MCP client gets useful
output without any UI.

Protocol support: the current `2026-07-28` protocol revision (per-request
envelope) and the stateless 2025-era Streamable HTTP flow
(`initialize` → `tools/*` / `resources/*`) are both served on every endpoint.
`GET` without a session and `DELETE` return `405` — serving is stateless and
there is no server-side session to terminate.

## Run it locally

Requires Node.js 24.x and pnpm 10.28.0 (via corepack):

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

This builds the six app UIs into the immutable resource bundle, generates the
gallery site, and serves everything at `http://localhost:3000`.

Reproduce the complete release gate (formatting, lint, strict typecheck,
provenance/notices verification, source-boundary scan, dependency audit,
95-test unit/gateway/contract matrix over both protocol eras, the production
Vercel build, the architecture invariant, SBOM generation, and 15 browser
tests through the upstream basic host):

```bash
pnpm exec playwright install chromium
pnpm release:check
```

## Source attribution and provenance

- Upstream example source is copied at the exact pinned commit under
  [`upstream/ext-apps/`](upstream/ext-apps), with per-file digests and every
  local modification documented in
  [`upstream/manifest.json`](upstream/manifest.json) and verified by
  `pnpm verify:notices`.
- Local modifications are limited to: import adaptation from MCP SDK v1 +
  `@modelcontextprotocol/ext-apps/server` to the gallery's SDK v2 adapter
  ([`src/mcp-app-adapter.ts`](src/mcp-app-adapter.ts)), reading UI HTML from
  the bundled immutable store instead of the local filesystem, and a
  deterministic seeded dataset for `customer-segmentation` (stateless
  serverless instances must serve identical data).
- Gallery-owned code is Apache-2.0 ([`LICENSE`](LICENSE)); copied upstream
  code keeps its own notices ([`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)).
- `pnpm check:upstream` reports upstream drift read-only; upstream is never
  fetched at build or runtime.

## Data behavior, logging, and limits

- **No accounts, no cookies, no database, no uploads, no stored user state.**
  All app data is synthetic or request-bounded; the `transcript` app's speech
  recognition runs in your browser (the host asks for microphone permission)
  and no audio or transcript ever reaches the gallery server.
- **No intended server-side network egress** in any Wave 1 app; CI scans the
  runtime source for network, subprocess, and filesystem-write primitives.
- **Logs** contain only anonymous aggregate metadata: app slug, JSON-RPC
  method category, status, duration, and byte counts — never tool arguments,
  results, prompts, resource contents, headers, cookies, or IP addresses.
- **Limits**: 256 KiB request bodies; 512 KiB tool results; 1 MiB bundled UI
  resources; a 15-second application deadline (30-second platform maximum);
  per-instance concurrency caps with `429` + `Retry-After` shedding; platform
  edge rate limiting on `/apps/*/mcp`.
- Apps can be disabled individually (fail-closed `DISABLED_APP_SLUGS`
  override); disabled apps stay visible as `enabled: false` in `/apps.json`.

## No SLA

This is a hosted learning and demonstration surface, run on provider
infrastructure without an availability commitment. Endpoints may be
rate-limited, disabled, or removed at any time.
