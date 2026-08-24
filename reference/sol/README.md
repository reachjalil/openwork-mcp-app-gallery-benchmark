# Hosted MCP Apps Example Gallery

An independently hosted, request-bounded adaptation of six official [MCP Apps](https://github.com/modelcontextprotocol/ext-apps) examples. The gallery is designed to let someone copy a remote Streamable HTTP URL, connect it in an MCP Apps host, and try a complete interactive tool/resource flow without cloning source or opening a tunnel.

This repository and service are independent learning infrastructure. They are not an official Model Context Protocol project or service, have no SLA, and do not accept accounts, uploads, credentials, or durable user data.

## Try the hosted gallery

The verified production gallery is [openwork-mcp-app-gallery-sol.vercel.app](https://openwork-mcp-app-gallery-sol.vercel.app). Add any one of these Streamable HTTP URLs to an MCP Apps-compatible host:

| App                   | Production MCP URL                                                               | Sample prompt                                                           |
| --------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Get Time              | `https://openwork-mcp-app-gallery-sol.vercel.app/apps/get-time/mcp`              | “Show me the current server time in an interactive app.”                |
| Budget Allocator      | `https://openwork-mcp-app-gallery-sol.vercel.app/apps/budget-allocator/mcp`      | “Open an interactive budget allocator.”                                 |
| Cohort Heatmap        | `https://openwork-mcp-app-gallery-sol.vercel.app/apps/cohort-heatmap/mcp`        | “Show me an interactive customer-retention cohort heatmap.”             |
| Customer Segmentation | `https://openwork-mcp-app-gallery-sol.vercel.app/apps/customer-segmentation/mcp` | “Explore the synthetic customers in an interactive segmentation chart.” |
| Scenario Modeler      | `https://openwork-mcp-app-gallery-sol.vercel.app/apps/scenario-modeler/mcp`      | “Model a synthetic growth scenario interactively.”                      |
| Transcript            | `https://openwork-mcp-app-gallery-sol.vercel.app/apps/transcript/mcp`            | “Open the local-browser transcript interface.”                          |

In a host that supports MCP tools but not MCP Apps, the same endpoints still return ordinary text and structured tool results; only the embedded interactive resource is omitted. Each URL exposes exactly one app, so connect multiple URLs when you want multiple examples. The copied endpoint needs no account, token, or custom header.

The service intentionally has no SLA. Inputs are bounded and synthetic. The Transcript app keeps microphone audio in the browser and does not upload it to this server. See [Limits and failure behavior](#limits-and-failure-behavior) and [Diagnostics and safe observability](#diagnostics-and-safe-observability) before using the gallery in a shared or automated environment.

## Gallery catalog

| App                   | Remote MCP path                   | Tool                | Interactive behavior                              | Data boundary                                    |
| --------------------- | --------------------------------- | ------------------- | ------------------------------------------------- | ------------------------------------------------ |
| Get Time              | `/apps/get-time/mcp`              | `get-time`          | Result delivery and same-server refresh           | Current server timestamp only                    |
| Budget Allocator      | `/apps/budget-allocator/mcp`      | `get-budget-data`   | Budget controls, chart, and app-provided tools    | Fixed synthetic categories and benchmarks        |
| Cohort Heatmap        | `/apps/cohort-heatmap/mcp`        | `get-cohort-data`   | Bounded cohort controls and same-server refresh   | Deterministic synthetic cohorts, at most 12 × 12 |
| Customer Segmentation | `/apps/customer-segmentation/mcp` | `get-customer-data` | Filters and synthetic customer visualization      | Fixed synthetic records, bounded filters         |
| Scenario Modeler      | `/apps/scenario-modeler/mcp`      | `get-scenario-data` | Templates and bounded same-server projections     | Synthetic inputs and 12-month calculations       |
| Transcript            | `/apps/transcript/mcp`            | `transcribe`        | Local browser speech UI and structured navigation | Audio remains in the browser; no server upload   |

Each path is an independent MCP server surface with exactly one gallery tool and one immutable `ui://` resource. There is deliberately no root mega-MCP and no cross-app tool or resource access.

## Protocol and host contract

The runtime uses `mcp-handler` 2.1.1 and `@modelcontextprotocol/server` 2.0.0 through a gallery-owned SDK-v2 registration adapter. It supports:

- current MCP `2026-07-28` discovery and request envelopes;
- stateless 2025-era Streamable HTTP fallback;
- `initialize`, `tools/list`, `tools/call`, and `resources/read`;
- `text/html;profile=mcp-app` resources with nested and legacy-flat UI metadata;
- ordinary text content and structured content for non-App hosts;
- App initialization, initial input/result delivery, and UI-triggered same-server tool calls;
- request cancellation propagated from Vercel through the gateway, handler, tool, and resource work.

The service is stateless. `POST` carries MCP requests. `GET` is routed to the handler and returns its intentional no-session `405`; `DELETE` returns `405`; bounded `OPTIONS` is available only for allowlisted browser origins. This matches the dual-era handler's stateless transport contract and avoids implying a server-side session exists.

## Runtime architecture

One Vercel-recognized Hono entrypoint, [`app.ts`](./app.ts), serves the landing page, diagnostics, and six parameterized MCP paths through one stateless Function. Vercel serves generated public assets from `public/` through its CDN.

The build is deliberately closed over checked-in source and the frozen lockfile:

1. `scripts/generate-upstream-manifest.ts` records the frozen source and gallery-owned adaptations.
2. `scripts/bundle-mcp-app-resources.ts` builds deterministic single-file HTML resources and fails above 512 KiB.
3. `scripts/generate-gallery.ts` emits the landing page manifest and content-hashed static assets.
4. `scripts/generate-sbom.ts` emits the committed CycloneDX inventory.
5. `src/resources.ts` validates exact source provenance, resource identity, byte size, and SHA-256 before readiness succeeds.

There is no runtime source fetch, package installation, subprocess, arbitrary URL input, upload, intended server-side egress, or mutable filesystem path.

## Limits and failure behavior

- Request body: 256 KiB per MCP request.
- Tool result and App resource: 512 KiB each.
- Application deadline: 15 seconds.
- Vercel Function ceiling: 30 seconds with cancellation enabled.
- Concurrency: 48 per process, with a smaller declared cap per app.

The concurrency gate is instance-local protection only; it is not represented as a globally authoritative distributed rate limiter across Fluid instances. Over-limit requests receive `429` plus `Retry-After`; oversized requests receive `413`; oversized downstream results receive `502`; deadlines receive `504`; client cancellation is distinguished internally. Public responses contain bounded errors and never include stack traces or filesystem paths.

Set `DISABLED_APP_SLUGS` to a comma-separated subset of the six slugs for the runtime kill switch. Disabled apps disappear from the generated live catalog and return `404`; `/readyz`, `/version`, and `/apps.json` report the enabled set. `apps.json` uses a short `public, max-age=60, must-revalidate` policy so a disabled-app change cannot remain hidden behind a long immutable cache.

## Diagnostics and safe observability

- `/healthz` proves only that the Function responds.
- `/readyz` validates the registry, enabled slugs, bundled resource count, sizes, and digests.
- `/version` returns only build SHA, frozen upstream commit, model namespace, adapter version, Node version, enabled slugs, and a safe build time when configured.

MCP request logs are structured and limited to the `sol` namespace, app slug, method category, status, duration, byte counts, and safe build SHA. Arguments, results, prompts, resource contents, authorization headers, cookies, IP addresses, user identifiers, credentials, and private deployment URLs are forbidden.

## Local development

Use Node.js 24.x and pnpm 10.28.0:

```sh
pnpm install --frozen-lockfile
pnpm generate
pnpm dev
```

Open `http://127.0.0.1:4173`. For a local or tunneled canonical origin, set an explicit validated `BASE_URL`. Outside loopback development, public base URLs must use HTTPS and cannot contain credentials, query strings, or fragments. Arbitrary `Host` and forwarded-host headers are never trusted for copyable endpoints.

The complete repository-owned verification path is:

```sh
pnpm exec playwright install chromium
pnpm run release:check:ci
```

That path runs formatting, lint, strict TypeScript, gateway and dual-era contract tests, real-browser MCP App bridge tests, notice/provenance checks, Vercel architecture checks, production dependency audit, source-boundary and secret scans, SBOM generation, and a production-shaped application build. `pnpm run release:check` adds `vercel build --prod --yes` when the exact Vercel project is linked.

## Verification design

The contract matrix uses the official SDK-v2 client in both pinned current and legacy modes against all six endpoints. It lists tools, calls each representative tool, reads every App resource, verifies ordinary fallback, rejects foreign resources, checks invalid input, repeats connection cycles, and runs 20 representative clients across the isolated catalog.

Gateway tests cover unknown, disabled, traversal-shaped and spoofed routes; CORS; method policy; actual and advertised body ceilings; malformed JSON and JSON-RPC; handler containment; result ceilings; deadlines; cancellation; concurrency; missing-resource boot failure; and cold/warm readiness.

Playwright runs every bundled UI inside a separate official `AppBridge` host, delivers initial tool input/result, exercises UI-to-tool round trips, and checks catalog rendering, copy behavior, accessible names, visible keyboard focus, image alternatives, and 320 px layout. That harness proves the gallery's browser/bridge contract; it is not mislabeled as proof from an unrelated production host.

Release evidence and any deployment-specific proof state are recorded in `BENCHMARK_REPORT.md`, `benchmark/result.json`, `TIMELINE.md`, and `benchmark/timeline.json`. Missing external-host proof remains `Incomplete` or `Skipped`, never `Passed` by substitution.

## Source and license boundary

The audit snapshot is frozen to `modelcontextprotocol/ext-apps@10195ad91851502134930e9b80ec2c04e277a720`. Only these upstream example directories are included:

- `examples/basic-server-react`
- `examples/budget-allocator-server`
- `examples/cohort-heatmap-server`
- `examples/customer-segmentation-server`
- `examples/scenario-modeler-server`
- `examples/transcript-server`

Every copied file remains byte-for-byte under `upstream/ext-apps/`, with original path, SHA-256, byte count, effective license, notice, and modification statement in `upstream/manifest.json`. The selected packages declare MIT at the frozen revision.

Three size-bounded UI re-expressions live under `ui-adaptations/`; the bounded chart compatibility layer lives at `src/ui/chart-shim.ts`. These are gallery-owned Apache-2.0 code, and the manifest records their exact files, digests, sizes, basis, and rationale. See `THIRD_PARTY_NOTICES.md` for the full upstream MIT grant and licensing-transition notice. Gallery-owned code is Apache-2.0 under `LICENSE`.

## Branch and release policy

`forward` is the only integration and production branch. Work arrives through focused pull requests such as `sol/gallery-v1`; `main` and `dev` are not release branches. The protected branch requires pull requests, linear history, resolved conversations, and disallows force pushes and deletion. Production promotion is a separate verified action from merging.

See `CONTRIBUTING.md` for the local workflow and `SECURITY.md` for the threat model and private reporting route.
