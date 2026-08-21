import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { REQUIRED_SLUGS } from "../src/catalog.js";

const root = process.cwd();
const packageJson = (await json("package.json")) as {
  engines?: { node?: string };
  packageManager?: string;
  scripts?: Record<string, string>;
};
const manifest = (await json("vercel.json")) as Record<string, unknown> & {
  functions?: Record<string, Record<string, unknown>>;
  headers?: {
    source: string;
    headers: { key: string; value: string }[];
  }[];
};
const entrypoint = await text("app.ts");
const application = await text("src/application.ts");
const catalog = await text("src/catalog.ts");
const packageScripts = Object.values(packageJson.scripts ?? {}).join("\n");

const entrypoints = (
  await Promise.all(
    [".", "src"].map(async (directory) =>
      (await readdir(resolve(root, directory)))
        .filter((name) => /^(?:app|index|server)\.(?:[cm]?[jt]s)$/u.test(name))
        .map((name) => (directory === "." ? name : `${directory}/${name}`)),
    ),
  )
).flat();
assert(
  JSON.stringify(entrypoints) === JSON.stringify(["app.ts"]),
  "app.ts must be the only Vercel-recognized Hono entrypoint",
);
assert(packageJson.engines?.node === "24.x", "Node must be pinned to 24.x");
assert(
  packageJson.packageManager === "pnpm@10.28.0",
  "pnpm must be pinned to 10.28.0",
);
assert(
  entrypoint.includes('from "hono"') &&
    entrypoint.includes("export default application.app"),
  "app.ts must directly import Hono and default-export application.app",
);
assert(
  manifest.framework === "hono" && manifest.fluid === true,
  "Vercel must explicitly use Hono with Fluid compute",
);
assert(
  manifest.buildCommand === "pnpm run build:vercel",
  "Vercel build command mismatch",
);
const functionConfig = manifest.functions?.["app.ts"];
assert(
  functionConfig?.includeFiles === "generated/mcp-app-resources.json",
  "MCP App resource bundle must be included in the function",
);
assert(
  functionConfig?.maxDuration === 30 &&
    functionConfig.supportsCancellation === true,
  "Function must use 30 seconds and cancellation support",
);
assert(
  JSON.stringify(manifest.regions) === JSON.stringify(["iad1"]),
  "Function region must be iad1",
);
for (const script of [
  "build:mcp-apps",
  "build:gallery",
  "build:vercel",
  "release:check",
])
  assert(
    packageScripts.includes(script) || packageJson.scripts?.[script],
    `Missing build script ${script}`,
  );
assert(
  packageJson.scripts?.["build:vercel"]?.includes("build"),
  "Vercel build must generate public and resource assets",
);
for (const output of [
  "generated/apps.json",
  "generated/mcp-app-resources.json",
  "public/apps.json",
  "public/index.html",
]) {
  try {
    await text(output);
  } catch {
    throw new Error(`Missing generated build output ${output}`);
  }
}

const globalHeaders =
  manifest.headers?.find((entry) => entry.source === "/(.*)")?.headers ?? [];
const headerMap = new Map(
  globalHeaders.map((header) => [header.key.toLowerCase(), header.value]),
);
for (const [name, expected] of [
  ["x-content-type-options", "nosniff"],
  ["x-frame-options", "DENY"],
  ["referrer-policy", "no-referrer"],
  ["cross-origin-opener-policy", "same-origin"],
  ["cross-origin-resource-policy", "same-origin"],
] as const)
  assert(headerMap.get(name) === expected, `Missing security header ${name}`);
const csp = headerMap.get("content-security-policy") ?? "";
for (const directive of [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
  "connect-src 'self'",
])
  assert(csp.includes(directive), `CSP must include ${directive}`);
assert(headerMap.has("permissions-policy"), "Permissions-Policy is required");
for (const route of [
  "/assets/(.*)",
  "/apps/(.*)/mcp",
  "/(healthz|readyz|version)",
  "/apps.json",
])
  assert(
    manifest.headers?.some((entry) => entry.source === route),
    `Missing cache policy for ${route}`,
  );

for (const slug of REQUIRED_SLUGS)
  assert(catalog.includes(`"${slug}"`), `Registry missing ${slug}`);
assert(
  REQUIRED_SLUGS.length === 6,
  "Registry must contain exactly six required slugs",
);
assert(!application.includes('"/mcp"'), "A root mega-MCP route is forbidden");

for (const workflow of [
  ".github/workflows/ci.yml",
  ".github/workflows/codeql.yml",
]) {
  const contents = await text(workflow);
  assert(
    /push:\s*\n\s+branches:\s*\[forward\]/u.test(contents),
    `${workflow} must target forward`,
  );
  assert(
    !/branches:\s*\[(?:main|dev)\]/u.test(contents),
    `${workflow} must not activate main or dev`,
  );
}
console.info("Vercel architecture boundary passed");

async function json(path: string): Promise<unknown> {
  return JSON.parse(await text(path));
}
async function text(path: string): Promise<string> {
  return readFile(resolve(root, path), "utf8");
}
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
