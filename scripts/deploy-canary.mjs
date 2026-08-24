/**
 * Deployment-origin canary suite.
 *
 * Runs the gateway, six-app dual-era contract, abuse, header, and cache
 * checks against a deployed origin. Two transports:
 *
 *   node scripts/deploy-canary.mjs --url https://<public-origin>
 *   node scripts/deploy-canary.mjs --deployment https://<protected-url>
 *
 * `--deployment` shells out to `vercel curl` (authenticated protection
 * bypass); `--url` uses direct fetch for public origins. Exit 0 only when
 * every check passes; prints a machine-readable JSON summary line last.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);

const args = process.argv.slice(2);
function argValue(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}
const publicUrl = argValue("--url");
const deployment = argValue("--deployment");
const label = argValue("--label") ?? "canary";
if (!publicUrl && !deployment) {
  console.error(
    "usage: deploy-canary.mjs (--url <origin> | --deployment <url>) [--label name]",
  );
  process.exit(2);
}

const APPS = [
  {
    slug: "get-time",
    tool: "get-time",
    resource: "ui://get-time/mcp-app.html",
    args: {},
    fallback: "T",
  },
  {
    slug: "budget-allocator",
    tool: "get-budget-data",
    resource: "ui://budget-allocator/mcp-app.html",
    args: {},
    fallback: "Budget Allocator Configuration",
  },
  {
    slug: "cohort-heatmap",
    tool: "get-cohort-data",
    resource: "ui://get-cohort-data/mcp-app.html",
    args: { cohortCount: 4, maxPeriods: 4 },
    fallback: "Cohort Analysis",
  },
  {
    slug: "customer-segmentation",
    tool: "get-customer-data",
    resource: "ui://customer-segmentation/mcp-app.html",
    args: { segment: "Enterprise" },
    fallback: "customers",
  },
  {
    slug: "scenario-modeler",
    tool: "get-scenario-data",
    resource: "ui://scenario-modeler/mcp-app.html",
    args: {},
    fallback: "SaaS Scenario Modeler",
  },
  {
    slug: "transcript",
    tool: "transcribe",
    resource: "ui://transcript/mcp-app.html",
    args: {},
    fallback: "ready",
  },
];

const MODERN_ENV = {
  "io.modelcontextprotocol/protocolVersion": "2026-07-28",
  "io.modelcontextprotocol/clientCapabilities": {
    extensions: {
      "io.modelcontextprotocol/ui": {
        mimeTypes: ["text/html;profile=mcp-app"],
      },
    },
  },
};

/** Perform one request; returns {status, headers(lowercased map), text}. */
async function request(path, { method = "GET", headers = {}, body } = {}) {
  if (publicUrl) {
    const response = await fetch(`${publicUrl}${path}`, {
      method,
      headers,
      body,
      redirect: "manual",
    });
    const map = {};
    response.headers.forEach((value, key) => {
      map[key.toLowerCase()] = value;
    });
    return {
      status: response.status,
      headers: map,
      text: await response.text(),
    };
  }
  // vercel curl transport: write headers via -H, capture status+headers with -i.
  const curlArgs = [
    "curl",
    path,
    "--deployment",
    deployment,
    "--yes",
    "-s",
    "-i",
    "-X",
    method,
  ];
  for (const [key, value] of Object.entries(headers)) {
    curlArgs.push("-H", `${key}: ${value}`);
  }
  if (body !== undefined) curlArgs.push("--data-binary", body);
  const { stdout } = await execFileP("vercel", curlArgs, {
    maxBuffer: 8 * 1024 * 1024,
    env: process.env,
  });
  // Parse the last HTTP response block (redirect-free with bypass).
  const separator = stdout.indexOf("\r\n\r\n");
  const rawHead = separator >= 0 ? stdout.slice(0, separator) : "";
  const text = separator >= 0 ? stdout.slice(separator + 4) : stdout;
  const lines = rawHead.split("\r\n");
  const status = Number(lines[0]?.split(" ")[1] ?? 0);
  const map = {};
  for (const line of lines.slice(1)) {
    const colon = line.indexOf(":");
    if (colon > 0)
      map[line.slice(0, colon).toLowerCase()] = line.slice(colon + 1).trim();
  }
  return { status, headers: map, text };
}

let id = 0;
function legacyBody(method, params = {}) {
  id += 1;
  return JSON.stringify({ jsonrpc: "2.0", id, method, params });
}
function parseMaybeSse(text, contentType) {
  const payload = contentType?.includes("text/event-stream")
    ? (text.split("\n").find((line) => line.startsWith("data: ")) ?? "").slice(
        6,
      )
    : text;
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    process.stdout.write(`ok   ${name}\n`);
  } catch (error) {
    results.push({
      name,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
    process.stdout.write(
      `FAIL ${name}: ${error instanceof Error ? error.message : error}\n`,
    );
  }
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const JSON_HEADERS = {
  "content-type": "application/json",
  accept: "application/json, text/event-stream",
};

await check("gallery page", async () => {
  const r = await request("/");
  assert(r.status === 200, `status ${r.status}`);
  assert(r.text.includes("MCP Apps Example Gallery"), "missing title");
  assert(
    r.text.includes("independent hosted adaptation"),
    "missing independence disclaimer",
  );
  assert(r.text.includes("Copy MCP URL"), "missing copy action");
});

await check("security headers on gallery page", async () => {
  const r = await request("/");
  assert(r.headers["x-content-type-options"] === "nosniff", "nosniff missing");
  assert(r.headers["x-frame-options"] === "DENY", "XFO missing");
  assert(
    (r.headers["content-security-policy"] ?? "").includes("default-src 'self'"),
    "CSP missing",
  );
  assert(
    r.headers["referrer-policy"] === "no-referrer",
    "referrer-policy missing",
  );
});

await check("healthz", async () => {
  const r = await request("/healthz");
  assert(
    r.status === 200 && r.text.includes('"ok":true'),
    `status ${r.status}`,
  );
  assert(
    (r.headers["cache-control"] ?? "").includes("no-store"),
    "healthz must be no-store",
  );
});

await check("readyz lists six apps", async () => {
  const r = await request("/readyz");
  assert(r.status === 200, `status ${r.status}`);
  const body = JSON.parse(r.text);
  assert(
    body.ready === true && body.apps.length === 6,
    "not ready with 6 apps",
  );
});

await check("version provenance", async () => {
  const r = await request("/version");
  assert(r.status === 200, `status ${r.status}`);
  const body = JSON.parse(r.text);
  assert(/^[0-9a-f]{40}$/.test(body.gallerySha), "gallerySha missing");
  assert(
    body.upstream.commit === "10195ad91851502134930e9b80ec2c04e277a720",
    "upstream pin mismatch",
  );
  assert(!/token|secret|password/i.test(r.text), "leak-like content");
  globalThis.__gallerySha = body.gallerySha;
});

await check("apps.json manifest", async () => {
  const r = await request("/apps.json");
  assert(r.status === 200, `status ${r.status}`);
  const body = JSON.parse(r.text);
  assert(body.apps.length === 6, "expected 6 apps");
  for (const app of body.apps) {
    assert(
      app.enabled === true && typeof app.endpoint === "string",
      `${app.slug} not enabled`,
    );
  }
  assert(
    (r.headers["cache-control"] ?? "").includes("no-store"),
    "apps.json must be no-store",
  );
});

for (const app of APPS) {
  await check(`${app.slug} legacy initialize`, async () => {
    const r = await request(`/apps/${app.slug}/mcp`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: legacyBody("initialize", {
        protocolVersion: "2025-11-25",
        capabilities: {
          extensions: {
            "io.modelcontextprotocol/ui": {
              mimeTypes: ["text/html;profile=mcp-app"],
            },
          },
        },
        clientInfo: { name: "deploy-canary", version: "1.0.0" },
      }),
    });
    assert(r.status === 200, `status ${r.status}`);
    const body = parseMaybeSse(r.text, r.headers["content-type"]);
    assert(
      body?.result?.protocolVersion === "2025-11-25",
      "negotiation failed",
    );
    assert(
      (r.headers["cache-control"] ?? "").includes("no-store"),
      "MCP must be no-store",
    );
  });

  await check(
    `${app.slug} legacy tools/list + call + resources/read`,
    async () => {
      const list = await request(`/apps/${app.slug}/mcp`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: legacyBody("tools/list"),
      });
      const listBody = parseMaybeSse(list.text, list.headers["content-type"]);
      const tools = listBody?.result?.tools ?? [];
      assert(
        tools.length === 1 && tools[0].name === app.tool,
        `tools ${JSON.stringify(tools.map((t) => t.name))}`,
      );
      assert(
        tools[0]._meta?.ui?.resourceUri === app.resource,
        "ui meta missing",
      );

      const call = await request(`/apps/${app.slug}/mcp`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: legacyBody("tools/call", { name: app.tool, arguments: app.args }),
      });
      const callBody = parseMaybeSse(call.text, call.headers["content-type"]);
      const content = callBody?.result?.content ?? [];
      assert(
        content[0]?.type === "text" &&
          String(content[0].text).includes(app.fallback),
        "fallback content missing",
      );

      const read = await request(`/apps/${app.slug}/mcp`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: legacyBody("resources/read", { uri: app.resource }),
      });
      const readBody = parseMaybeSse(read.text, read.headers["content-type"]);
      const contents = readBody?.result?.contents ?? [];
      assert(
        contents[0]?.mimeType === "text/html;profile=mcp-app",
        "MIME profile wrong",
      );
      assert(
        String(contents[0]?.text ?? "")
          .toLowerCase()
          .includes("<!doctype html"),
        "html missing",
      );
    },
  );

  await check(`${app.slug} modern era list + call`, async () => {
    id += 1;
    const list = await request(`/apps/${app.slug}/mcp`, {
      method: "POST",
      headers: {
        ...JSON_HEADERS,
        "mcp-protocol-version": "2026-07-28",
        "mcp-method": "tools/list",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id,
        method: "tools/list",
        params: { _meta: MODERN_ENV },
      }),
    });
    assert(list.status === 200, `list status ${list.status}`);
    const listBody = JSON.parse(list.text);
    assert(listBody.result.tools[0].name === app.tool, "modern list mismatch");

    id += 1;
    const call = await request(`/apps/${app.slug}/mcp`, {
      method: "POST",
      headers: {
        ...JSON_HEADERS,
        "mcp-protocol-version": "2026-07-28",
        "mcp-method": "tools/call",
        "mcp-name": app.tool,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id,
        method: "tools/call",
        params: { name: app.tool, arguments: app.args, _meta: MODERN_ENV },
      }),
    });
    assert(call.status === 200, `call status ${call.status}`);
    const callBody = JSON.parse(call.text);
    assert(
      callBody.result.content[0].type === "text",
      "modern call missing content",
    );
  });
}

await check("unknown slug 404", async () => {
  const r = await request("/apps/nope/mcp", {
    method: "POST",
    headers: JSON_HEADERS,
    body: "{}",
  });
  assert(r.status === 404, `status ${r.status}`);
});

await check("DELETE 405", async () => {
  const r = await request("/apps/get-time/mcp", { method: "DELETE" });
  assert(r.status === 405, `status ${r.status}`);
});

await check("malformed JSON -32700", async () => {
  const r = await request("/apps/get-time/mcp", {
    method: "POST",
    headers: JSON_HEADERS,
    body: "{not json",
  });
  assert(r.status === 400 && r.text.includes("-32700"), `status ${r.status}`);
});

await check("oversized body 413", async () => {
  const r = await request("/apps/get-time/mcp", {
    method: "POST",
    headers: JSON_HEADERS,
    body: `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get-time","arguments":{"pad":"${"x".repeat(300 * 1024)}"}}}`,
  });
  assert(r.status === 413, `status ${r.status}`);
});

const failed = results.filter((result) => !result.ok);
console.log(
  JSON.stringify({
    label,
    at: new Date().toISOString(),
    origin: publicUrl ?? deployment,
    gallerySha: globalThis.__gallerySha ?? null,
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    failures: failed,
  }),
);
process.exit(failed.length === 0 ? 0 : 1);
