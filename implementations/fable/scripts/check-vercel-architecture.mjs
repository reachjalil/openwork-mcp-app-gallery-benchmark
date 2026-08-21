/**
 * Mechanical architecture invariant check for the gallery deployment.
 * Mirrors the Snacks pattern: every runtime, branch, and configuration
 * choice this repository depends on is asserted here so drift fails CI.
 *
 * Run after `pnpm run build:vercel` (it also asserts build outputs exist).
 */
import { execFile } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function exists(relativePath) {
  try {
    await stat(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

const packageJson = await json("package.json");
const vercelJson = await json("vercel.json");
const registryData = await json("src/registry-data.json");
const appEntry = await text("app.ts");
const applicationSource = await text("src/application.ts");
const gatewaySource = await text("src/gateway.ts");
const ciWorkflow = await text(".github/workflows/ci.yml");
const codeqlWorkflow = await text(".github/workflows/codeql.yml");

// --- runtime pins -----------------------------------------------------------
assert(packageJson.engines?.node === "24.x", "package.json must pin Node 24.x");
assert(
  packageJson.packageManager === "pnpm@10.28.0",
  "package.json must pin pnpm 10.28.0 via packageManager",
);
for (const [name, version] of [
  ["mcp-handler", "2.1.1"],
  ["@modelcontextprotocol/server", "2.0.0"],
  ["hono", "4.13.2"],
  ["zod", "4.4.3"],
]) {
  assert(
    packageJson.dependencies?.[name] === version,
    `dependency ${name} must be pinned exactly to ${version}`,
  );
}
assert(
  !packageJson.dependencies?.["@modelcontextprotocol/sdk"],
  "MCP SDK v1 must never be a runtime dependency (dev/test only)",
);
assert(
  !packageJson.dependencies?.["@modelcontextprotocol/ext-apps"],
  "@modelcontextprotocol/ext-apps is a UI build/test dependency, not a runtime one",
);

// --- single Hono entrypoint -------------------------------------------------
const entrypointPattern = /^(?:app|index|server)\.(?:[cm]?[jt]s)$/u;
const rootEntries = (await readdir(root)).filter((name) =>
  entrypointPattern.test(name),
);
const srcEntries = (await readdir(path.join(root, "src"))).filter((name) =>
  entrypointPattern.test(name),
);
assert(
  JSON.stringify(rootEntries) === JSON.stringify(["app.ts"]) &&
    srcEntries.length === 0,
  "app.ts must be the only Vercel-recognized Hono entrypoint",
);
assert(
  /from ["']hono["']/u.test(appEntry) &&
    appEntry.includes("export default application.app"),
  "app.ts must import hono and default-export the application",
);

// --- vercel.json contract ---------------------------------------------------
assert(
  vercelJson.framework === "hono",
  "vercel.json must declare the hono framework",
);
assert(vercelJson.fluid === true, "Fluid compute must be explicit");
assert(
  vercelJson.buildCommand === "pnpm run build:vercel",
  "buildCommand must be pnpm run build:vercel",
);
const functionConfig = vercelJson.functions?.["app.ts"];
assert(
  functionConfig?.includeFiles === "generated/mcp-app-resources.json",
  "the MCP App resource bundle must be included in the function",
);
assert(functionConfig?.maxDuration === 30, "maxDuration must be 30");
assert(
  functionConfig?.supportsCancellation === true,
  "supportsCancellation must be true",
);
assert(
  JSON.stringify(vercelJson.regions) === JSON.stringify(["iad1"]),
  "region must be iad1",
);

// --- headers ----------------------------------------------------------------
const globalHeaders = new Map(
  (
    vercelJson.headers?.find((entry) => entry.source === "/(.*)")?.headers ?? []
  ).map((header) => [header.key.toLowerCase(), header.value]),
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
    `global header ${name} must be ${expected}`,
  );
}
assert(
  globalHeaders.has("permissions-policy"),
  "Permissions-Policy must disable unneeded browser capabilities",
);
const csp = globalHeaders.get("content-security-policy") ?? "";
for (const directive of [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "connect-src 'self'",
]) {
  assert(csp.includes(directive), `CSP must include ${directive}`);
}

const immutableAssets = vercelJson.headers?.find(
  (entry) => entry.source === "/assets/(.*)",
);
assert(
  immutableAssets?.headers?.some(
    (header) =>
      header.key.toLowerCase() === "cache-control" &&
      header.value === "public, max-age=31536000, immutable",
  ),
  "content-hashed assets must be immutable-cached",
);
const mcpCache = vercelJson.headers?.find(
  (entry) => entry.source === "/apps/(.*)",
);
assert(
  mcpCache?.headers?.some(
    (header) =>
      header.key.toLowerCase() === "cache-control" &&
      header.value === "private, no-store",
  ),
  "MCP endpoints must be private, no-store",
);
const diagnosticsCache = vercelJson.headers?.find(
  (entry) => entry.source === "/(apps.json|healthz|readyz|version)",
);
assert(
  diagnosticsCache?.headers?.some(
    (header) =>
      header.key.toLowerCase() === "cache-control" &&
      header.value === "private, no-store",
  ),
  "diagnostic routes must be private, no-store",
);

// --- branch contract --------------------------------------------------------
for (const [name, workflow] of [
  ["CI", ciWorkflow],
  ["CodeQL", codeqlWorkflow],
]) {
  assert(
    /push:\s*\n\s+branches:\s*\[forward\]/u.test(workflow),
    `${name} must run on pushes to forward`,
  );
  assert(
    !/branches:\s*\[(?:main|dev)\]/u.test(workflow),
    `${name} must not treat main or dev as a release branch`,
  );
  assert(/pull_request:/u.test(workflow), `${name} must run on pull requests`);
}
assert(/schedule:/u.test(codeqlWorkflow), "CodeQL must also run on a schedule");

// --- registry contract ------------------------------------------------------
const REQUIRED_SLUGS = [
  "get-time",
  "budget-allocator",
  "cohort-heatmap",
  "customer-segmentation",
  "scenario-modeler",
  "transcript",
];
const slugs = registryData.apps.map((app) => app.slug);
assert(
  JSON.stringify([...slugs].sort()) ===
    JSON.stringify([...REQUIRED_SLUGS].sort()) && slugs.length === 6,
  "the registry must contain exactly the six Wave 1 slugs",
);
for (const app of registryData.apps) {
  assert(
    Array.isArray(app.egressOrigins) && app.egressOrigins.length === 0,
    `Wave 1 app ${app.slug} must not declare egress origins`,
  );
  assert(
    app.limits?.requestBytes === 262144 &&
      app.limits?.resultBytes === 524288 &&
      app.limits?.timeoutMs === 15000,
    `app ${app.slug} must keep the Wave 1 request/result/deadline limits`,
  );
}

// --- no root mega-MCP -------------------------------------------------------
assert(
  applicationSource.includes('"/apps/:slug/mcp"'),
  "the gateway must be path-routed per app",
);
assert(
  !/["'`]\/mcp["'`]/u.test(applicationSource) &&
    !/["'`]\/mcp["'`]/u.test(appEntry),
  "no root /mcp endpoint may merge the example tools",
);

// --- no runtime source fetch / arbitrary execution --------------------------
assert(
  !/\bfetch\s*\(/u.test(gatewaySource) || false,
  "gateway must not fetch at runtime",
);
assert(
  packageJson.scripts?.["release:check"]?.includes("check:source-boundary"),
  "release:check must run the source boundary scan",
);
assert(
  packageJson.scripts?.["release:check"]?.includes("verify:notices"),
  "release:check must verify notices and provenance",
);

// --- build outputs ----------------------------------------------------------
assert(
  packageJson.scripts?.["build:vercel"]?.includes(
    "bundle-mcp-app-resources.mjs",
  ) && packageJson.scripts?.["build:vercel"]?.includes("build-site.mjs"),
  "build:vercel must generate the resource bundle and the CDN site",
);
for (const artifact of [
  "generated/mcp-app-resources.json",
  "generated/apps.json",
  "public/index.html",
]) {
  assert(
    await exists(artifact),
    `${artifact} is missing — run pnpm run build:vercel before check:vercel`,
  );
}
const bundle = await json("generated/mcp-app-resources.json");
assert(
  JSON.stringify(Object.keys(bundle.resources).sort()) ===
    JSON.stringify([...REQUIRED_SLUGS].sort()),
  "the resource bundle must carry exactly the six Wave 1 apps",
);
assert(
  bundle.upstreamCommit === registryData.upstreamCommit,
  "the resource bundle must be built from the pinned upstream commit",
);

// --- native-ESM runtime resolution ------------------------------------------
// Vercel's Hono builder transpiles per file and runs Node's native ESM
// loader: every relative import on the runtime path must carry an explicit
// .js extension, and JSON must load via createRequire (import attributes are
// not emitted by the transpile).
const RUNTIME_PATH_FILES = [
  "app.ts",
  "src/application.ts",
  "src/base-url.ts",
  "src/gateway.ts",
  "src/limits.ts",
  "src/mcp-app-adapter.ts",
  "src/observability.ts",
  "src/registry.ts",
  "src/resources.ts",
  "upstream/ext-apps/basic-server-react/server.ts",
  "upstream/ext-apps/budget-allocator-server/server.ts",
  "upstream/ext-apps/cohort-heatmap-server/server.ts",
  "upstream/ext-apps/customer-segmentation-server/server.ts",
  "upstream/ext-apps/customer-segmentation-server/src/data-generator.ts",
  "upstream/ext-apps/customer-segmentation-server/src/types.ts",
  "upstream/ext-apps/scenario-modeler-server/server.ts",
  "upstream/ext-apps/transcript-server/server.ts",
];
const relativeImportPattern = /from\s+["'](\.[^"']*)["']/gu;
for (const file of RUNTIME_PATH_FILES) {
  const source = await text(file);
  for (const match of source.matchAll(relativeImportPattern)) {
    const specifier = match[1];
    assert(
      specifier.endsWith(".js"),
      `${file}: relative runtime import ${specifier} must end in .js for Node's native ESM loader`,
    );
  }
  assert(
    !/import\s+[^"']*from\s+["'][^"']*\.json["']/u.test(source),
    `${file}: JSON must load via createRequire, not an ESM JSON import`,
  );
}

// --- committed CDN site must match regeneration ------------------------------
// Vercel's Hono builder snapshots public/ before the build command runs, so
// the gallery site is committed. Regeneration (which build:vercel just ran)
// must leave the committed files unchanged, proving the page still derives
// from the checked-in registry with no handwritten drift.
try {
  const { stdout } = await promisify(execFile)("git", [
    "status",
    "--porcelain",
    "--",
    "public",
  ]);
  // Fail on untracked files or worktree modifications; a staged-but-clean
  // entry (index "A", worktree " ") is a commit in progress, not drift.
  const drift = stdout
    .split("\n")
    .filter((line) => line.length > 2)
    .filter((line) => line.startsWith("??") || line[1] !== " ");
  assert(
    drift.length === 0,
    `committed public/ differs from regenerated output:\n${drift.join("\n")}`,
  );
} catch (error) {
  if (
    error instanceof Error &&
    /differs from regenerated/.test(error.message)
  ) {
    throw error;
  }
  console.warn("git unavailable — skipping public/ drift check");
}

console.log("Vercel architecture boundary passed");
