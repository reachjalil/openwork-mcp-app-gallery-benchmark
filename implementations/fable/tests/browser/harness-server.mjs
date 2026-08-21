/**
 * Dev-only harness servers for browser tests, mirroring the upstream
 * basic-host serve.ts topology on plain node:http (no extra dependencies):
 *
 * - host server (8080): serves basic-host dist/index.html and /api/servers;
 * - sandbox server (8081): serves dist/sandbox.html with the CSP header
 *   built from the ?csp= query parameter (separate origin for isolation).
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(
  path.dirname(path.dirname(fileURLToPath(import.meta.url))),
);
const dist = path.join(root, "upstream", "ext-apps", "basic-host", "dist");

const HOST_PORT = Number(process.env.HARNESS_HOST_PORT ?? 8080);
const SANDBOX_PORT = Number(process.env.HARNESS_SANDBOX_PORT ?? 8081);
const GALLERY_ORIGIN =
  process.env.HARNESS_GALLERY_ORIGIN ?? "http://localhost:3999";

const SLUGS = [
  "get-time",
  "budget-allocator",
  "cohort-heatmap",
  "customer-segmentation",
  "scenario-modeler",
  "transcript",
];

const indexHtml = readFileSync(path.join(dist, "index.html"));
const sandboxHtml = readFileSync(path.join(dist, "sandbox.html"));

function sanitizeCspDomains(domains) {
  if (!Array.isArray(domains)) return [];
  return domains.filter(
    (domain) => typeof domain === "string" && !/[;\r\n'" ]/.test(domain),
  );
}

// Same directive construction as upstream basic-host serve.ts.
function buildCspHeader(csp) {
  const resourceDomains = sanitizeCspDomains(csp?.resourceDomains).join(" ");
  const connectDomains = sanitizeCspDomains(csp?.connectDomains).join(" ");
  const frameDomains = sanitizeCspDomains(csp?.frameDomains).join(" ") || null;
  const baseUriDomains =
    sanitizeCspDomains(csp?.baseUriDomains).join(" ") || null;
  return [
    "default-src 'self' 'unsafe-inline'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: ${resourceDomains}`.trim(),
    `style-src 'self' 'unsafe-inline' blob: data: ${resourceDomains}`.trim(),
    `img-src 'self' data: blob: ${resourceDomains}`.trim(),
    `font-src 'self' data: blob: ${resourceDomains}`.trim(),
    `media-src 'self' data: blob: ${resourceDomains}`.trim(),
    `connect-src 'self' ${connectDomains}`.trim(),
    `worker-src 'self' blob: ${resourceDomains}`.trim(),
    frameDomains ? `frame-src ${frameDomains}` : "frame-src 'none'",
    "object-src 'none'",
    baseUriDomains ? `base-uri ${baseUriDomains}` : "base-uri 'none'",
  ].join("; ");
}

const hostServer = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://localhost:${HOST_PORT}`);
  if (url.pathname === "/api/servers") {
    response.writeHead(200, {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    });
    response.end(
      JSON.stringify(SLUGS.map((slug) => `${GALLERY_ORIGIN}/apps/${slug}/mcp`)),
    );
    return;
  }
  if (url.pathname === "/" || url.pathname === "/index.html") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(indexHtml);
    return;
  }
  response.writeHead(404, { "content-type": "text/plain" });
  response.end("not found");
});

const sandboxServer = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://localhost:${SANDBOX_PORT}`);
  if (url.pathname === "/" || url.pathname === "/sandbox.html") {
    let csp;
    const raw = url.searchParams.get("csp");
    if (raw) {
      try {
        csp = JSON.parse(raw);
      } catch {
        csp = undefined;
      }
    }
    response.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "content-security-policy": buildCspHeader(csp),
      "cache-control": "no-cache, no-store, must-revalidate",
    });
    response.end(sandboxHtml);
    return;
  }
  response.writeHead(404, { "content-type": "text/plain" });
  response.end("only sandbox.html is served on this port");
});

hostServer.listen(HOST_PORT, () => {
  console.log(`harness host:    http://localhost:${HOST_PORT}`);
});
sandboxServer.listen(SANDBOX_PORT, () => {
  console.log(`harness sandbox: http://localhost:${SANDBOX_PORT}`);
});
