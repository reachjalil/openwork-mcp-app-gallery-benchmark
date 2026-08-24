import { createHash } from "node:crypto";
import {
  GALLERY_APPS,
  MODEL_NAME,
  MODEL_NAMESPACE,
  UPSTREAM_COMMIT,
  parseDisabledSlugs,
  sourceUrl,
} from "./catalog.js";

export const GALLERY_CSS = `:root{color-scheme:light;--ink:#0f2438;--muted:#53697d;--paper:#f6f1e7;--card:#fffdf8;--blue:#0b5f7a;--coral:#ef6a4c;--line:#d8d0c0;--focus:#ffb000;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 12% 0,#fbd9bd 0,transparent 31rem),linear-gradient(145deg,#f8f2e8,#edf4f4);color:var(--ink);min-height:100vh}a{color:var(--blue)}a:focus-visible,button:focus-visible{outline:4px solid var(--focus);outline-offset:3px}.shell{width:min(1180px,calc(100% - 32px));margin:auto;padding:56px 0 80px}.eyebrow{font:700 12px/1.2 ui-monospace,monospace;letter-spacing:.15em;text-transform:uppercase;color:var(--coral)}h1{font:800 clamp(2.5rem,8vw,6.8rem)/.86 Georgia,serif;max-width:980px;margin:18px 0 26px;letter-spacing:-.055em}.intro{max-width:760px;font-size:clamp(1.05rem,2vw,1.35rem);line-height:1.55;color:var(--muted)}.status{display:flex;flex-wrap:wrap;gap:10px;margin:28px 0 48px}.pill{border:1px solid var(--line);border-radius:999px;background:#ffffffb8;padding:8px 12px;font:700 12px/1 ui-monospace,monospace}.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:22px}.card{grid-column:span 6;background:var(--card);border:1px solid var(--line);border-radius:24px;overflow:hidden;box-shadow:0 22px 60px #1e35431a;display:flex;flex-direction:column}.preview{aspect-ratio:16/9;width:100%;object-fit:cover;border-bottom:1px solid var(--line);background:#e6eceb}.body{padding:24px;display:flex;flex-direction:column;gap:15px;height:100%}.meta{display:flex;justify-content:space-between;gap:14px;align-items:start}.meta h2{font:800 1.65rem/1 Georgia,serif;margin:0}.category{font:700 11px/1.35 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.08em;color:var(--coral);text-align:right}.summary{color:var(--muted);line-height:1.5;margin:0}.detail{font-size:.88rem;line-height:1.45;border-top:1px solid var(--line);padding-top:12px}.detail strong{display:block;color:var(--ink);margin-bottom:3px}.endpoint{font:600 12px/1.5 ui-monospace,monospace;overflow-wrap:anywhere;background:#eef2f0;padding:12px;border-radius:12px}.actions{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:auto}.copy{border:0;border-radius:999px;background:var(--ink);color:#fff;padding:12px 17px;font-weight:800;cursor:pointer}.copy:hover{background:var(--blue)}.copy-status{font-size:.82rem;color:var(--muted);min-height:1.2em}.how{margin-top:60px;padding:clamp(24px,5vw,48px);background:var(--ink);color:#f9f5ec;border-radius:28px}.how h2{font:800 clamp(1.8rem,4vw,3.3rem)/1 Georgia,serif;margin:0 0 18px}.how ol{padding-left:22px;line-height:1.8}code{overflow-wrap:anywhere}.how code{color:#fff2b6}.footer{margin-top:34px;color:var(--muted);font-size:.9rem;line-height:1.6}@media(max-width:760px){.shell{width:min(100% - 20px,1180px);padding-top:32px}.card{grid-column:span 12}.body{padding:18px}.meta{display:block}.category{text-align:left;margin-top:8px}h1{font-size:clamp(2.7rem,16vw,5rem)}}@media(max-width:340px){.shell{width:calc(100% - 12px)}.body{padding:14px}.endpoint{font-size:10px}}`;

export const GALLERY_JS = `document.querySelectorAll('[data-copy-url]').forEach((button)=>{button.addEventListener('click',async()=>{const value=button.dataset.copyUrl||'';const status=button.parentElement.querySelector('[data-copy-status]');let ok=false;try{await navigator.clipboard.writeText(value);ok=true}catch{const area=document.createElement('textarea');area.value=value;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();ok=document.execCommand('copy');area.remove()}status.textContent=ok?'MCP URL copied.':'Copy failed. Select the URL above.';button.textContent=ok?'Copied':'Copy MCP URL';setTimeout(()=>{button.textContent='Copy MCP URL'},1800)})});`;

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export const GALLERY_CSS_PATH = `/assets/gallery-${digest(GALLERY_CSS)}.css`;
export const GALLERY_JS_PATH = `/assets/gallery-${digest(GALLERY_JS)}.js`;

export type PublicGalleryApp = {
  slug: string;
  name: string;
  summary: string;
  category: string;
  source: string;
  upstreamCommit: string;
  screenshot: string;
  screenshotAlt: string;
  dataNote: string;
  samplePrompt: string;
  endpoint: string;
  compatibility: string;
  lastVerifiedBuild: string;
  implementationLabel: string;
};

export type PublicAppsManifest = {
  schemaVersion: 1;
  project: string;
  description: string;
  modelNamespace: string;
  upstreamCommit: string;
  buildSha: string;
  apps: PublicGalleryApp[];
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function publicAppsManifest(
  baseUrl: URL,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): PublicAppsManifest {
  const disabled = parseDisabledSlugs(environment.DISABLED_APP_SLUGS);
  const buildSha =
    environment.VERCEL_GIT_COMMIT_SHA ??
    environment.GALLERY_GIT_SHA ??
    "development";
  return {
    schemaVersion: 1,
    project: "OpenWork MCP Apps Example Gallery",
    description: "Independent hosted adaptation of official MCP Apps examples.",
    modelNamespace: MODEL_NAMESPACE,
    upstreamCommit: UPSTREAM_COMMIT,
    buildSha,
    apps: GALLERY_APPS.filter((app) => !disabled.has(app.slug)).map((app) => ({
      slug: app.slug,
      name: app.displayName,
      summary: app.summary,
      category: app.category,
      source: sourceUrl(app),
      upstreamCommit: UPSTREAM_COMMIT,
      screenshot: new URL(
        `/assets/${app.slug}-${app.screenshotDigest.slice(0, 16)}.png`,
        baseUrl,
      ).href,
      screenshotAlt: app.screenshotAlt,
      dataNote: app.dataNote,
      samplePrompt: app.samplePrompt,
      endpoint: new URL(`/apps/${app.slug}/mcp`, baseUrl).href,
      compatibility:
        "SDK v2 current protocol plus stateless 2025-era fallback; see benchmark report for release proof.",
      lastVerifiedBuild: buildSha,
      implementationLabel: MODEL_NAME,
    })),
  };
}

export function renderGalleryPage(
  baseUrl: URL,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): string {
  const manifest = publicAppsManifest(baseUrl, environment);
  const cards = manifest.apps
    .map(
      (app) =>
        `<article class="card"><img class="preview" src="${escapeHtml(app.screenshot)}" alt="${escapeHtml(app.screenshotAlt)}" width="960" height="540"><div class="body"><div class="meta"><h2>${escapeHtml(app.name)}</h2><div class="category">${escapeHtml(app.category)}</div></div><p class="summary">${escapeHtml(app.summary)}</p><div class="detail"><strong>Try this</strong>${escapeHtml(app.samplePrompt)}</div><div class="detail"><strong>Data & safety</strong>${escapeHtml(app.dataNote)}</div><div class="detail"><strong>Source</strong><a href="${escapeHtml(app.source)}">Audited upstream example at ${UPSTREAM_COMMIT.slice(0, 12)}</a></div><div class="detail"><strong>Compatibility</strong>${escapeHtml(app.compatibility)}<br>Last verified build: <code>${escapeHtml(app.lastVerifiedBuild)}</code> · ${MODEL_NAME}</div><div class="endpoint" tabindex="0" aria-label="MCP endpoint for ${escapeHtml(app.name)}">${escapeHtml(app.endpoint)}</div><div class="actions"><button class="copy" type="button" data-copy-url="${escapeHtml(app.endpoint)}">Copy MCP URL</button><span class="copy-status" role="status" aria-live="polite" data-copy-status></span></div></div></article>`,
    )
    .join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Six independent hosted adaptations of official MCP Apps examples."><title>Hosted MCP Apps Example Gallery</title><link rel="stylesheet" href="${GALLERY_CSS_PATH}"></head><body><main class="shell"><div class="eyebrow">Independent hosted adaptation · ${MODEL_NAME}</div><h1>Six MCP Apps. One URL away.</h1><p class="intro">Explore official MCP Apps examples without cloning a repository or opening a tunnel. Each card connects to a separate, stateless remote MCP server, so tools, resources, and authority stay isolated.</p><div class="status"><span class="pill">6 isolated endpoints</span><span class="pill">Synthetic data</span><span class="pill">No accounts or cookies</span><span class="pill">Pinned upstream ${UPSTREAM_COMMIT.slice(0, 12)}</span></div><section class="grid" aria-label="MCP Apps catalog">${cards}</section><section class="how"><h2>Try one in an MCP Apps host</h2><ol><li>Choose an example and copy its exact MCP URL.</li><li>Add that Streamable HTTP endpoint through your host's remote MCP setup.</li><li>Send the suggested prompt and open the returned interactive resource.</li><li>Without MCP Apps support, the same tool still returns useful text or structured data.</li></ol><p>No host deep link is included because only a stable, tested contract should earn one.</p></section><footer class="footer">This is an independent learning gallery, not an official Model Context Protocol service. No SLA, accounts, analytics, cookies, durable state, uploads, write tools, or intended server-side egress. Build <code>${escapeHtml(manifest.buildSha)}</code>.</footer></main><script src="${GALLERY_JS_PATH}" defer></script></body></html>`;
}
