# Building your own MCP App

This guide walks through what an MCP App is, how the smallest one in this
repository works line by line, and how to add your own — first to this
gallery, then as your own hosted server. Everything here is running code you
can copy: the gallery at <https://openwork-mcp-app-gallery.vercel.app> is
built exactly this way.

## 1. What an MCP App is

A normal MCP server exposes **tools** a model can call. An **MCP App** adds
one thing: the tool declares an interactive UI, and a compatible host renders
that UI inside the conversation when the tool is called.

The contract has three parts:

1. **A tool** whose metadata points at a UI resource:
   `_meta.ui.resourceUri: "ui://your-app/mcp-app.html"`.
2. **A resource** at that `ui://` URI whose content is a **single, self-contained
   HTML file** served with MIME type `text/html;profile=mcp-app`.
3. **The App bridge** (`@modelcontextprotocol/ext-apps`): inside the rendered
   iframe, your UI talks to the host over `postMessage` — it receives the tool
   input and result, and can call tools **on its own server** (never on other
   servers, never on the host's other capabilities).

Hosts that don't support MCP Apps simply ignore the UI metadata and show the
tool's ordinary text/structured result — so every app must return a useful
plain result too. Design for the fallback first.

## 2. Anatomy of the smallest app: `get-time`

### Server side — one tool, one resource

The whole server definition is
[`upstream/ext-apps/basic-server-react/server.ts`](../upstream/ext-apps/basic-server-react/server.ts):

```ts
const resourceUri = "ui://get-time/mcp-app.html";

registerAppTool(server, "get-time", {
  title: "Get Time",
  description: "Returns the current server time as an ISO 8601 string.",
  inputSchema: {},
  _meta: { ui: { resourceUri } },          // ← links the tool to its UI
}, async () => ({
  content: [{ type: "text", text: new Date().toISOString() }],  // ← fallback
}));

registerAppResource(server, resourceUri, resourceUri,
  { mimeType: RESOURCE_MIME_TYPE },        // text/html;profile=mcp-app
  async () => ({
    contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE,
                 text: readBundledAppHtml("get-time") }],       // ← the UI
  }));
```

`registerAppTool` / `registerAppResource` are thin helpers
([`src/mcp-app-adapter.ts`](../src/mcp-app-adapter.ts)) that normalize the UI
metadata for older hosts and default the MIME profile. Richer apps follow the
same two-registration pattern — compare
[`budget-allocator-server/server.ts`](../upstream/ext-apps/budget-allocator-server/server.ts),
which also returns `structuredContent` so the UI (and non-App hosts) get typed
data.

### UI side — a single HTML file speaking the App bridge

Each app's UI is an ordinary web app (React, vanilla, anything) bundled by
Vite into **one HTML file** with everything inlined. The bridge does the
host communication
([`upstream/ext-apps/basic-server-react/src/mcp-app.tsx`](../upstream/ext-apps/basic-server-react/src/mcp-app.tsx)):

```tsx
const { app } = useApp({
  appInfo: { name: "Get Time App", version: "1.0.0" },
  onAppCreated: (app) => {
    app.ontoolresult = async (result) => setToolResult(result); // initial data
  },
});

// UI-initiated call back to the SAME server:
const result = await app.callServerTool({ name: "get-time", arguments: {} });
```

That's the full loop: host calls the tool → renders your HTML → delivers the
tool input/result into the iframe → your UI can call the server again when
the user clicks things.

### Rules that keep an app publishable

- **Self-contained UI**: no CDN scripts, no remote fonts; the host sandboxes
  the iframe with a strict CSP. If you genuinely need external domains,
  declare them in the resource's `_meta.ui.csp` — hosts review them.
- **Fallback always**: the tool result must stand alone as text or
  `structuredContent`.
- **Stateless server**: assume every request can hit a fresh instance;
  deterministic or request-bounded data only.
- **Bounded everything**: clamp input ranges, array sizes, and result sizes in
  the schema or the handler.

## 3. How this gallery hosts many apps on one origin

One Hono function ([`app.ts`](../app.ts) → [`src/application.ts`](../src/application.ts))
routes `/apps/:slug/mcp` to a **separate logical MCP server per app**
([`src/gateway.ts`](../src/gateway.ts) mounts one `mcp-handler` per registry
entry). Deliberately **no** root `/mcp` merging every tool: separate servers
mean no name collisions, no cross-app state, and a host connects only to the
app the user picked.

The gateway owns the public-safety envelope so the apps don't have to:
method allowlist, browser-origin policy, 256 KiB request / 512 KiB result
ceilings, a 15-second deadline with abort propagation, per-instance
concurrency shedding, and sanitized logs (never tool arguments or results).
Both protocol generations are served — the current `2026-07-28` revision and
the 2025-era Streamable HTTP flow most hosts still use — courtesy of
`mcp-handler` 2 on MCP SDK v2.

## 4. Add your own app to this gallery

1. **Create the app directory** under `upstream/ext-apps/your-app/` (or
   `src/apps/your-app/` for original code): `server.ts` exporting
   `registerApp(server)` with the tool + resource registrations, plus
   `mcp-app.html` and `src/` for the UI.
2. **Register it** in [`src/registry-data.json`](../src/registry-data.json)
   (slug, display name, tool name, `ui://` URI, sample prompt, data note,
   limits, `framework: "react" | "vanilla"`) and map the slug to your
   `registerApp` in [`src/registry.ts`](../src/registry.ts).
3. **Build**: `pnpm run build` — the bundler
   ([`scripts/bundle-mcp-app-resources.mjs`](../scripts/bundle-mcp-app-resources.mjs))
   compiles your UI to single-file HTML and adds it to the digest-verified
   resource bundle; the gallery page regenerates from the same registry.
4. **Test**: add a contract case in
   [`tests/contract/apps.contract.test.ts`](../tests/contract/apps.contract.test.ts)
   (list/call/read on both protocol eras) and a render case in
   [`tests/browser/apps.spec.ts`](../tests/browser/apps.spec.ts) — the browser
   suite drives your app through the official MCP test host against your real
   endpoint.
5. **Gate**: `pnpm run ci:check` must pass — it includes provenance checks, so
   if you copied third-party code, record it in `upstream/manifest.json` and
   `THIRD_PARTY_NOTICES.md`.

Run `pnpm dev` and your app is at `http://localhost:3000/apps/your-app/mcp`,
with its card on the local gallery page.

## 5. Deploy your own gallery on Vercel

Fork/copy this repo, connect it to a Vercel project (framework **Hono**,
Node 24), and every merge deploys. Three hard-won platform facts are already
handled for you — keep them in mind if you restructure:

1. **Native ESM at runtime**: Vercel's Hono builder transpiles per file and
   runs Node's native ESM loader — every relative import on the runtime path
   needs an explicit `.js` extension, and JSON loads via `createRequire`, not
   ESM imports. A CI check (`scripts/check-vercel-architecture.mjs`) enforces
   this so it can't regress.
2. **Static files snapshot early**: the builder collects `public/` *before*
   your build command runs, and resolves the function at `/` before static
   index files. That's why the gallery page is committed (deterministic, no
   baked URLs — endpoints derive from the page's own origin) and why the
   function serves `/` from a digest-verified copy inside the resource bundle.
3. **MCP endpoints are automated traffic**: keep bot challenges off
   `/apps/*/mcp`, cache them `private, no-store`, and rate-limit at the edge
   (this gallery uses a per-IP WAF rule) — in-process counters aren't global
   across serverless instances.

Verify any deployment with the included canary suite (28 checks: page,
headers, all apps on both protocol eras, abuse cases):

```bash
node scripts/deploy-canary.mjs --url https://your-deployment.vercel.app
```

## 6. Practical advice from building these

Hard-won lessons that will save you time:

- **Design the fallback first.** Write the tool as if no UI existed: a clear
  text summary plus `structuredContent` with a typed schema. The UI then
  becomes a progressive enhancement, hosts without MCP Apps stay useful, and
  the model itself can reason over the structured result.
- **One app = one server.** Resist merging many tools into one endpoint. A
  mega-server pollutes the model's tool surface, invites name collisions, and
  breaks the isolation hosts rely on. Path-route many small servers instead
  (that's exactly what `src/gateway.ts` does).
- **Send data, not conclusions.** The best-feeling apps (budget-allocator,
  scenario-modeler) return a rich dataset once and do all interaction
  client-side — instant sliders, no round trip per tweak. Reserve
  `callServerTool` for actions that genuinely need the server.
- **Make synthetic data deterministic.** Serverless hosting means any request
  can hit a fresh instance. Seed your generators (see the seeded PRNG in
  `upstream/ext-apps/customer-segmentation-server/src/data-generator.ts`)
  instead of caching in module state — caches don't survive instance churn
  and concurrent instances will disagree.
- **Budget your bytes.** Single-file UIs get heavy fast — React plus the App
  bridge lands around 550 KB before you add anything. Set a hard resource
  ceiling in your pipeline (this repo fails the build over 1 MiB) and check
  every result size at the gateway.
- **Expect both protocol generations.** Most hosts today speak the 2025-era
  stateless Streamable HTTP flow; the 2026-07-28 revision is arriving.
  `mcp-handler` 2.x serves both from one registration — test both (see
  `tests/contract/`).
- **Test through a real host, not just JSON-RPC.** Protocol tests pass long
  before rendering works. The browser suite here drives every app through the
  official basic host against the live endpoint — that's what caught the
  real bugs.
- **Treat the host as the security boundary, and behave accordingly.** Your
  iframe runs under the host's CSP with no ambient permissions. Declare any
  external domains in `_meta.ui.csp`, request permissions (microphone etc.)
  through resource metadata, and never assume you can reach the network.
- **Version visibly.** A `/version` route exposing the deployed commit and
  the pinned upstream revision turns "is it live yet?" and "what exactly is
  running?" into one curl.

## 7. Going further

- Official examples and SDK: <https://github.com/modelcontextprotocol/ext-apps>
  (this repo pins commit `10195ad9…`; `pnpm run check:upstream` reports drift)
- The MCP Apps specification lives in the same repository.
- How this particular gallery was chosen from three independent
  implementations: [`reference/`](../reference/README.md).
