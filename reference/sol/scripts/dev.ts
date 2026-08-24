import { serve } from "@hono/node-server";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Hono } from "hono";
import { application } from "../src/application.js";
import { GALLERY_APPS } from "../src/catalog.js";

const port = 4173;
const development = new Hono();
const remoteOrigin = (() => {
  const candidate = process.env.GALLERY_REMOTE_TEST_ORIGIN;
  if (!candidate) return undefined;
  const url = new URL(candidate);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "GALLERY_REMOTE_TEST_ORIGIN must be an origin-only HTTPS URL",
    );
  }
  return url;
})();
const hostScriptPath = fileURLToPath(
  new URL("../.build/test-host/host.js", import.meta.url),
);
let hostScript: string | undefined;
try {
  hostScript = readFileSync(hostScriptPath, "utf8");
} catch {
  // The regular development command does not require the browser-test host.
}
const screenshots = new Map(
  GALLERY_APPS.map((entry) => {
    const route = `/assets/${entry.slug}-${entry.screenshotDigest.slice(0, 16)}.png`;
    const path = fileURLToPath(new URL(`../public${route}`, import.meta.url));
    return [route, readFileSync(path)] as const;
  }),
);

development.get("/__test/host", (context) => {
  if (!hostScript) return context.notFound();
  return context.html(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MCP App test host</title><style>body{margin:0;font-family:system-ui;background:#e9eef2}header{padding:8px 12px;background:#122334;color:white}iframe{display:block;width:100%;height:900px;border:0;background:white}#host-status{font-size:12px}</style></head><body><header>Independent MCP Apps browser host · <span id="host-status" role="status">Connecting…</span></header><iframe id="app" title="Hosted MCP App under test"></iframe><script type="module" src="/__test/host.js"></script></body></html>`,
  );
});
development.get("/__test/host.js", (context) =>
  hostScript
    ? context.body(hostScript, 200, {
        "Content-Type": "text/javascript; charset=utf-8",
        "Cache-Control": "private, no-store",
      })
    : context.notFound(),
);
development.all("/__test/remote/:slug/mcp", async (context) => {
  if (!remoteOrigin) return context.notFound();
  const slug = context.req.param("slug");
  if (!GALLERY_APPS.some((entry) => entry.slug === slug))
    return context.notFound();
  const incoming = context.req.raw;
  const headers = new Headers();
  for (const name of [
    "accept",
    "content-type",
    "mcp-protocol-version",
    "mcp-session-id",
  ]) {
    const value = incoming.headers.get(name);
    if (value) headers.set(name, value);
  }
  const protectionBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (protectionBypass)
    headers.set("x-vercel-protection-bypass", protectionBypass);
  const response = await fetch(new URL(`/apps/${slug}/mcp`, remoteOrigin), {
    method: incoming.method,
    headers,
    body:
      incoming.method === "GET" || incoming.method === "HEAD"
        ? undefined
        : await incoming.arrayBuffer(),
    signal: incoming.signal,
    redirect: "error",
  });
  const responseHeaders = new Headers();
  for (const name of [
    "cache-control",
    "content-type",
    "mcp-protocol-version",
    "mcp-session-id",
  ]) {
    const value = response.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
});
development.get("/assets/:filename", (context) => {
  const body = screenshots.get(`/assets/${context.req.param("filename")}`);
  return body
    ? context.body(body, 200, {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      })
    : application.app.fetch(context.req.raw);
});
development.all("*", (context) => application.app.fetch(context.req.raw));

serve(
  { fetch: development.fetch, hostname: "127.0.0.1", port },
  ({ address }) => {
    console.info(
      `Gallery development server listening on http://${address}:${port}`,
    );
  },
);
