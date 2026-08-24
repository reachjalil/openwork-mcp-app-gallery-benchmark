/**
 * Generate the static gallery site under public/ from the same registry data
 * the gateway serves, plus the build-time generated/apps.json artifact. The
 * site is served by the Vercel CDN; there is no second handwritten catalog.
 *
 * The generated page is deterministic and committed: it contains no absolute
 * origins and no per-build labels (endpoint URLs are derived client-side from
 * the page's own origin, and the build provenance is fetched from /version).
 * Vercel's Hono builder snapshots public/ BEFORE the build command runs, so
 * build-time-only generation never reaches the CDN; CI verifies the committed
 * output matches regeneration.
 */
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const registryData = JSON.parse(
  await readFile(path.join(root, "src", "registry-data.json"), "utf8"),
);

function resolveBaseUrl(env) {
  if (env.BASE_URL) {
    try {
      return new URL(env.BASE_URL).origin;
    } catch {
      // fall through to platform variables
    }
  }
  const hostPattern =
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
  for (const key of [
    "VERCEL_PROJECT_PRODUCTION_URL",
    "VERCEL_BRANCH_URL",
    "VERCEL_URL",
  ]) {
    const value = env[key];
    if (value && hostPattern.test(value)) return `https://${value}`;
  }
  return "http://localhost:3000";
}

const baseUrl = resolveBaseUrl(process.env);
const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GALLERY_GIT_SHA;
const buildLabel =
  sha && /^[0-9a-f]{7,40}$/.test(sha) ? sha.slice(0, 7) : "local";
const publicDir = path.join(root, "public");
const assetsDir = path.join(publicDir, "assets");
const screenshotsDir = path.join(publicDir, "screenshots");

await rm(assetsDir, { recursive: true, force: true });
await mkdir(assetsDir, { recursive: true });
await mkdir(screenshotsDir, { recursive: true });

// Content-hashed assets (immutable CDN caching).
async function emitHashedAsset(sourcePath, baseName, extension) {
  const content = await readFile(sourcePath);
  const hash = createHash("sha256").update(content).digest("hex").slice(0, 12);
  const fileName = `${baseName}.${hash}${extension}`;
  await writeFile(path.join(assetsDir, fileName), content);
  return `/assets/${fileName}`;
}

const stylesHref = await emitHashedAsset(
  path.join(root, "site-src", "styles.css"),
  "styles",
  ".css",
);
const scriptSrc = await emitHashedAsset(
  path.join(root, "site-src", "copy-url.js"),
  "copy-url",
  ".js",
);

for (const app of registryData.apps) {
  await copyFile(
    path.join(root, "upstream", "ext-apps", app.upstreamDir, "screenshot.png"),
    path.join(screenshotsDir, `${app.slug}.png`),
  );
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function card(app) {
  const endpointPath = `/apps/${app.slug}/mcp`;
  const sourceUrl = `${registryData.upstreamRepository}/tree/${registryData.upstreamCommit}/examples/${app.upstreamDir}`;
  const compatibility = app.compatibility ?? "contract-tested";
  return `      <article class="card" aria-labelledby="title-${app.slug}">
        <img
          class="card-screenshot"
          src="/screenshots/${app.slug}.png"
          alt="Screenshot of the ${escapeHtml(app.displayName)} MCP App user interface (upstream project screenshot at the pinned revision)"
          loading="lazy"
          width="640"
          height="400"
        />
        <div class="card-body">
          <h3 id="title-${app.slug}">${escapeHtml(app.displayName)}</h3>
          <p class="card-interaction">${escapeHtml(app.interaction)}</p>
          <p>${escapeHtml(app.summary)}</p>
          <p class="card-note">${escapeHtml(app.dataNote)}</p>
          <p class="card-prompt">
            Try: <code>${escapeHtml(app.samplePrompt)}</code>
          </p>
          <p class="card-endpoint">
            <span class="endpoint-label" id="endpoint-label-${app.slug}">MCP endpoint</span>
            <code class="endpoint-url" data-endpoint data-path="${endpointPath}">${endpointPath}</code>
          </p>
          <p class="card-actions">
            <button
              type="button"
              class="copy-button"
              data-path="${endpointPath}"
              aria-describedby="endpoint-label-${app.slug}"
            >Copy MCP URL</button>
            <span class="copy-status" role="status" aria-live="polite"></span>
          </p>
          <p class="card-meta">
            Source:
            <a href="${escapeHtml(sourceUrl)}">upstream ${escapeHtml(app.upstreamDir)}</a>
            @ <code>${registryData.upstreamCommit.slice(0, 12)}</code>
          </p>
          <p class="card-meta">
            Compatibility: ${escapeHtml(compatibility)} · build
            <code class="build-label" data-build-label>see <a href="/version">/version</a></code>
          </p>
        </div>
      </article>`;
}

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MCP Apps Example Gallery</title>
  <meta
    name="description"
    content="Hosted, copy-paste-ready remote MCP servers for the official Model Context Protocol MCP Apps examples. Independent adaptation; not an official MCP service."
  />
  <link rel="stylesheet" href="${stylesHref}" />
</head>
<body>
  <a class="skip-link" href="#apps">Skip to the app list</a>
  <header>
    <h1>MCP Apps Example Gallery</h1>
    <p>
      Six official
      <a href="https://github.com/modelcontextprotocol/ext-apps">MCP Apps examples</a>,
      hosted as remote Streamable HTTP MCP servers you can try by URL —
      no cloning, no <code>npx</code>, no tunnel.
    </p>
    <p class="disclaimer">
      This gallery is an <strong>independent hosted adaptation</strong> of the
      official examples (pinned at commit
      <code>${registryData.upstreamCommit.slice(0, 12)}</code>). It is not an
      official Model Context Protocol service and is not hosted or endorsed by
      the Model Context Protocol project. Demo service only — no accounts, no
      stored data, no SLA.
    </p>
  </header>
  <main>
    <section aria-labelledby="how-to">
      <h2 id="how-to">Try an example in under five minutes</h2>
      <ol>
        <li>Pick an app below and press <strong>Copy MCP URL</strong>.</li>
        <li>
          Add the URL as a remote MCP server in an MCP Apps-compatible host —
          in OpenWork, add it as a user-configured MCP server; other hosts have
          an equivalent "add remote MCP server" flow.
        </li>
        <li>Send the app's sample prompt and interact with the UI that renders in the conversation.</li>
      </ol>
      <p>
        Hosts without MCP Apps support still work: every tool returns an
        ordinary text or structured result as fallback.
      </p>
    </section>
    <section id="apps" aria-labelledby="apps-heading">
      <h2 id="apps-heading">Apps</h2>
      <div class="cards">
${registryData.apps.map(card).join("\n")}
      </div>
    </section>
  </main>
  <footer>
    <p>
      Gallery code: Apache-2.0. Upstream example code: MIT (see
      <a href="https://github.com/modelcontextprotocol/ext-apps/blob/${registryData.upstreamCommit}/LICENSE">upstream license</a>).
      Machine-readable manifest: <a href="/apps.json"><code>/apps.json</code></a>.
    </p>
    <p>
      No cookies, no analytics, no tracking. Requests are logged only as
      anonymous aggregate metadata (app, method category, status, duration,
      byte counts).
    </p>
  </footer>
  <script src="${scriptSrc}"></script>
</body>
</html>
`;

await writeFile(path.join(publicDir, "index.html"), html);

// Build-time manifest artifact (the live /apps.json route is served by the
// function from the same registry data and can never hide disabled state).
const appsJson = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  description:
    "Independent hosted adaptation of official MCP Apps examples. Not an official Model Context Protocol service.",
  baseUrl,
  upstream: {
    repository: registryData.upstreamRepository,
    commit: registryData.upstreamCommit,
  },
  apps: registryData.apps.map((app) => ({
    slug: app.slug,
    displayName: app.displayName,
    summary: app.summary,
    interaction: app.interaction,
    toolName: app.toolName,
    resourceUri: app.resourceUri,
    samplePrompt: app.samplePrompt,
    dataNote: app.dataNote,
    upstream: {
      repository: registryData.upstreamRepository,
      commit: registryData.upstreamCommit,
      path: `examples/${app.upstreamDir}`,
    },
    enabled: app.enabledByDefault,
    endpoint: `${baseUrl}/apps/${app.slug}/mcp`,
  })),
};
await mkdir(path.join(root, "generated"), { recursive: true });
await writeFile(
  path.join(root, "generated", "apps.json"),
  `${JSON.stringify(appsJson, null, 2)}\n`,
);

process.stdout.write(`site generated for ${baseUrl} (build ${buildLabel})\n`);
