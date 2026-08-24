import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const pkg = await json("package.json");
const manifest = await json("vercel.json");
const appTs = await readFile(resolve(root, "app.ts"), "utf8");
const ci = await readFile(resolve(root, ".github/workflows/ci.yml"), "utf8");
const codeql = await readFile(
  resolve(root, ".github/workflows/codeql.yml"),
  "utf8",
);
const registry = await readFile(resolve(root, "src/catalog.ts"), "utf8");
const gateway = await readFile(resolve(root, "src/gateway.ts"), "utf8");
const application = await readFile(resolve(root, "src/application.ts"), "utf8");
const sourceFiles = await collectSource(resolve(root, "src"));
sourceFiles.push(appTs, application, gateway);

assert(pkg.engines?.node === "24.x", "Node must be pinned to 24.x");
assert(
  pkg.packageManager === "pnpm@10.28.0",
  "packageManager must be pnpm 10.28.0",
);

const entries = await readdir(root);
const honoEntrypoints = entries.filter((name) =>
  /^(?:app|index|server)\.(?:[cm]?[jt]s)$/u.test(name),
);
assert(
  JSON.stringify(honoEntrypoints) === JSON.stringify(["app.ts"]),
  "app.ts must be the only Vercel-recognized Hono entrypoint",
);
assert(
  /from ["']hono["']/u.test(appTs) &&
    appTs.includes("export default application.app"),
  "Vercel Hono entrypoint must import hono and default-export the application",
);
assert(
  pkg.scripts?.["build:vercel"]?.includes("build:resources") &&
    pkg.scripts?.["build:vercel"]?.includes("build:gallery"),
  "Vercel build must generate public assets and MCP App resources",
);
assert(
  manifest.framework === "hono" &&
    manifest.fluid === true &&
    manifest.buildCommand === "pnpm run build:vercel" &&
    String(manifest.functions?.["app.ts"]?.includeFiles).includes(
      "mcp-app-resources.json",
    ) &&
    String(manifest.functions?.["app.ts"]?.includeFiles).includes(
      "gallery.html",
    ) &&
    manifest.functions?.["app.ts"]?.maxDuration === 30 &&
    manifest.functions?.["app.ts"]?.supportsCancellation === true &&
    JSON.stringify(manifest.regions) === JSON.stringify(["iad1"]),
  "vercel.json must declare Fluid, includeFiles, maxDuration 30, cancellation, and iad1",
);
assert(
  application.includes('app.get("/",') &&
    application.includes("loadGalleryHtml"),
  "Hono must serve GET / from the bundled gallery HTML because the Function owns slash routes",
);

const globalHeaders = headerMap(
  manifest.headers?.find((entry) => entry.source === "/(.*)")?.headers,
);
for (const [name, expected] of [
  ["x-content-type-options", "nosniff"],
  ["x-frame-options", "DENY"],
  ["referrer-policy", "no-referrer"],
  ["cross-origin-opener-policy", "same-origin"],
  ["cross-origin-resource-policy", "same-origin"],
]) {
  assert(
    globalHeaders.get(name) === expected,
    `missing header ${name}=${expected}`,
  );
}
const csp = globalHeaders.get("content-security-policy") ?? "";
for (const directive of [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "connect-src 'self'",
  "form-action",
]) {
  assert(csp.includes(directive), `CSP must include ${directive}`);
}
assert(globalHeaders.has("permissions-policy"), "Permissions-Policy required");

for (const source of [
  "/",
  "/apps/(.*)/mcp",
  "/healthz",
  "/readyz",
  "/version",
  "/apps.json",
]) {
  const headers = headerMap(
    manifest.headers?.find((entry) => entry.source === source)?.headers,
  );
  assert(
    headers.get("cache-control") === "private, no-store",
    `${source} must be private, no-store`,
  );
}
assert(
  headerMap(
    manifest.headers?.find((entry) => entry.source === "/assets/(.*)")?.headers,
  ).get("cache-control") === "public, max-age=31536000, immutable",
  "hashed assets must be immutable",
);

for (const [name, workflow] of [
  ["CI", ci],
  ["CodeQL", codeql],
]) {
  assert(
    /push:\s*\n\s+branches:\s*\[forward\]/.test(workflow),
    `${name} must validate forward`,
  );
  assert(
    !/push:\s*\n\s+branches:\s*\[dev\]/.test(workflow),
    `${name} must not use dev`,
  );
  assert(
    !/push:\s*\n\s+branches:\s*\[main\]/.test(workflow),
    `${name} must not use main`,
  );
}

for (const slug of [
  "get-time",
  "budget-allocator",
  "cohort-heatmap",
  "customer-segmentation",
  "scenario-modeler",
  "transcript",
]) {
  assert(registry.includes(`"${slug}"`), `registry must include ${slug}`);
}
assert(
  !gateway.includes('"/mcp"') && !application.includes('app.all("/mcp"'),
  "no root mega-MCP",
);

const joined = sourceFiles.join("\n");
assert(
  !/https:\/\/github.com\/modelcontextprotocol\/ext-apps\/archive/.test(joined),
  "no runtime source fetch",
);
assert(
  !/\b(?:execFile|execSync|spawnSync|child_process)\b/.test(joined),
  "no arbitrary package execution path",
);

console.log("Vercel architecture boundary passed");

async function json(path) {
  return JSON.parse(await readFile(resolve(root, path), "utf8"));
}

function headerMap(headers) {
  return new Map(
    (headers ?? []).map((header) => [header.key.toLowerCase(), header.value]),
  );
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function collectSource(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collectSource(path)));
    else if (entry.name.endsWith(".ts")) out.push(await readFile(path, "utf8"));
  }
  return out;
}
