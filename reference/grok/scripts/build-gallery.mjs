import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = [
  {
    slug: "get-time",
    displayName: "Get Time",
    summary:
      "Smallest tool plus interactive UI round trip for the current server time.",
    category: "starter",
    samplePrompt: "Show me the current server time using the interactive app.",
    safetyNote: "Returns the current server clock. No user data is stored.",
    upstreamPath: "examples/basic-server-react",
    endpoint: "/apps/get-time/mcp",
    alt: "Get Time app showing the current server time and a refresh button",
  },
  {
    slug: "budget-allocator",
    displayName: "Budget Allocator",
    summary:
      "Adjust a synthetic seed-stage budget with charts and recalculation.",
    category: "form",
    samplePrompt:
      "Create a $1 million seed-stage budget I can adjust interactively.",
    safetyNote:
      "Synthetic demo data. Numeric ranges and payload size are clamped.",
    upstreamPath: "examples/budget-allocator-server",
    endpoint: "/apps/budget-allocator/mcp",
    alt: "Budget allocator donut chart with category sliders",
  },
  {
    slug: "cohort-heatmap",
    displayName: "Cohort Heatmap",
    summary: "Explore a dense interactive customer-retention heatmap.",
    category: "visualization",
    samplePrompt: "Show me an interactive customer-retention cohort heatmap.",
    safetyNote: "Fixed synthetic dataset. No uploads.",
    upstreamPath: "examples/cohort-heatmap-server",
    endpoint: "/apps/cohort-heatmap/mcp",
    alt: "Cohort retention heatmap with rows of signup months",
  },
  {
    slug: "customer-segmentation",
    displayName: "Customer Segmentation",
    summary: "Filter synthetic customers by revenue and engagement.",
    category: "chart",
    samplePrompt: "Let me explore customers by revenue and engagement.",
    safetyNote: "Fixed synthetic dataset. Filters are bounded.",
    upstreamPath: "examples/customer-segmentation-server",
    endpoint: "/apps/customer-segmentation/mcp",
    alt: "Scatter chart of synthetic customers by segment",
  },
  {
    slug: "scenario-modeler",
    displayName: "Scenario Modeler",
    summary: "Compare synthetic SaaS growth plans over stateless tools.",
    category: "form",
    samplePrompt:
      "Compare a bootstrapped plan with a venture-funded growth plan.",
    safetyNote:
      "Synthetic financial scenarios. Scenario count and numeric inputs are clamped.",
    upstreamPath: "examples/scenario-modeler-server",
    endpoint: "/apps/scenario-modeler/mcp",
    alt: "Scenario modeler with projection chart and sliders",
  },
  {
    slug: "transcript",
    displayName: "Transcript",
    summary: "Navigate a structured transcript in an interactive view.",
    category: "media",
    samplePrompt: "Show me an interactive transcript I can navigate.",
    safetyNote:
      "Demo transcript only. Speech recognition stays in the browser when used.",
    upstreamPath: "examples/transcript-server",
    endpoint: "/apps/transcript/mcp",
    alt: "Interactive transcript navigator with timed entries",
  },
];

const commit = "10195ad91851502134930e9b80ec2c04e277a720";
const css = await readFile(join(root, "scripts/gallery.css"), "utf8");
const js = await readFile(join(root, "scripts/gallery.js"), "utf8");
const cssHash = createHash("sha256").update(css).digest("hex").slice(0, 12);
const jsHash = createHash("sha256").update(js).digest("hex").slice(0, 12);
const cssName = `gallery.${cssHash}.css`;
const jsName = `gallery.${jsHash}.js`;

const publicDir = join(root, "public");
await mkdir(join(publicDir, "assets"), { recursive: true });
await mkdir(join(publicDir, "screenshots"), { recursive: true });
await writeFile(join(publicDir, "assets", cssName), css);
await writeFile(join(publicDir, "assets", jsName), js);

for (const app of catalog) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" role="img" aria-label="${app.alt}">
  <rect width="640" height="360" fill="#0f172a"/>
  <rect x="24" y="24" width="592" height="312" rx="16" fill="#1e293b"/>
  <text x="48" y="90" fill="#e2e8f0" font-size="28" font-family="ui-sans-serif, system-ui, sans-serif">${app.displayName}</text>
  <text x="48" y="140" fill="#94a3b8" font-size="16" font-family="ui-sans-serif, system-ui, sans-serif">${app.category}</text>
</svg>`;
  await writeFile(join(publicDir, "screenshots", `${app.slug}.svg`), svg);
}

const cards = catalog
  .map(
    (app) => `
    <article class="card" data-slug="${app.slug}">
      <img src="/screenshots/${app.slug}.svg" alt="${app.alt}" width="640" height="360">
      <h2>${app.displayName}</h2>
      <p>${app.summary}</p>
      <p class="meta"><span>${app.category}</span> · <span>synthetic demo data</span></p>
      <p class="note">${app.safetyNote}</p>
      <p><strong>Suggested prompt:</strong> ${app.samplePrompt}</p>
      <p><a href="https://github.com/modelcontextprotocol/ext-apps/tree/${commit}/${app.upstreamPath}">Audited upstream source</a> at <code>${commit.slice(0, 12)}</code></p>
      <p>MCP endpoint: <code class="endpoint" data-path="${app.endpoint}">${app.endpoint}</code></p>
      <p>Compatibility: current 2026-07-28 and 2025-era Streamable HTTP fallback. Last verified build: <span data-build>local</span>.</p>
      <p class="label">Implementation: grok</p>
      <button type="button" class="copy" data-copy="${app.endpoint}" aria-label="Copy MCP URL for ${app.displayName}" aria-describedby="copy-status">Copy MCP URL</button>
    </article>`,
  )
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hosted MCP Apps Example Gallery</title>
  <meta name="description" content="Independent hosted adaptation of official MCP Apps examples. Not an official Model Context Protocol service.">
  <link rel="stylesheet" href="/assets/${cssName}">
</head>
<body>
  <a class="skip" href="#catalog">Skip to examples</a>
  <header>
    <p class="kicker">Independent hosted adaptation</p>
    <h1>MCP Apps example gallery</h1>
    <p>This gallery hosts six official MCP Apps examples as distinct remote Streamable HTTP servers. It is not an official Model Context Protocol service.</p>
  </header>
  <section>
    <h2>How to try in OpenWork</h2>
    <ol>
      <li>Copy one MCP URL below.</li>
      <li>Add it as a remote Streamable HTTP MCP server in an MCP Apps-compatible host.</li>
      <li>Send the suggested prompt.</li>
      <li>If the host has no App UI, the ordinary text or structured tool result still works.</li>
    </ol>
  </section>
  <main id="catalog" class="grid">
    ${cards}
  </main>
  <p id="copy-status" class="status" role="status" aria-live="polite"></p>
  <footer>
    <p>Pinned upstream: <code>${commit}</code>. Wave 1 has no accounts, cookies, or durable user data. There is no SLA.</p>
  </footer>
  <script src="/assets/${jsName}"></script>
</body>
</html>
`;

await writeFile(join(publicDir, "index.html"), html);
await mkdir(join(root, "generated"), { recursive: true });
await writeFile(join(root, "generated", "gallery.html"), html);
await writeFile(
  join(root, "generated", "apps.json"),
  JSON.stringify(
    {
      version: 1,
      cachePolicy:
        "Served by the Function as private, no-store so disabled apps cannot stay cached as enabled.",
      apps: catalog,
    },
    null,
    2,
  ),
);
console.log("gallery emitted");
