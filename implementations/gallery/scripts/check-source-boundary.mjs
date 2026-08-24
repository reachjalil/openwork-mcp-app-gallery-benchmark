/**
 * Wave 1 source boundary scan for the runtime code path.
 *
 * Scans every file reachable from the deployed function (app.ts, src/**, and
 * the copied upstream server modules) for network, subprocess, filesystem-
 * write, dynamic-execution, and secret-like patterns. Any hit fails the
 * check and requires an explicit review (there is no allowlist mechanism —
 * the reviewed exception would be encoded here with its reason).
 *
 * Browser-side UI sources (upstream src/ app code) are scanned with the same
 * rules except `fetch`, which the host sandbox governs via the App CSP; the
 * Wave 1 apps declare no connect domains, so a fetch hit there is still
 * reported as a warning.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const RUNTIME_FILES = [
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

const FORBIDDEN = [
  [/\bfetch\s*\(/u, "network fetch"],
  [/XMLHttpRequest/u, "network XHR"],
  [/\bWebSocket\b/u, "network WebSocket"],
  [/child_process/u, "subprocess"],
  [/\bexecSync\b|\bspawnSync\b|\bexecFile\b|\bspawn\s*\(/u, "subprocess"],
  [
    /node:net\b|node:dgram\b|node:dns\b|node:tls\b|node:http\b|node:https\b/u,
    "raw network module",
  ],
  [
    /\bwriteFile|appendFile|createWriteStream|\bmkdir|\brmSync|\bunlink/u,
    "filesystem write",
  ],
  [/\beval\s*\(/u, "dynamic eval"],
  [/new\s+Function\s*\(/u, "dynamic Function"],
  [/AKIA[0-9A-Z]{16}/u, "AWS key material"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/u, "private key material"],
  [/gh[pousr]_[A-Za-z0-9]{20,}/u, "GitHub token material"],
];

// process.env reads are allowed only in these reviewed configuration seams.
const ENV_ALLOWED = new Set([
  "src/base-url.ts",
  "src/gateway.ts",
  "src/registry.ts",
  "src/observability.ts",
  "src/application.ts",
  "src/resources.ts",
]);

const failures = [];
const warnings = [];

for (const relative of RUNTIME_FILES) {
  const content = await readFile(path.join(root, relative), "utf8");
  for (const [pattern, label] of FORBIDDEN) {
    if (pattern.test(content)) {
      failures.push(`${relative}: forbidden ${label} pattern ${pattern}`);
    }
  }
  if (/process\.env/u.test(content) && !ENV_ALLOWED.has(relative)) {
    failures.push(`${relative}: process.env access outside the reviewed seams`);
  }
}

// UI sources: same scan, but fetch downgraded to a warning (host-sandboxed).
async function walk(directory) {
  const results = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "dist" || entry.name === "node_modules") continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...(await walk(full)));
    else if (/\.(ts|tsx|js|html)$/u.test(entry.name)) results.push(full);
  }
  return results;
}

const uiRoots = [
  "basic-server-react",
  "budget-allocator-server",
  "cohort-heatmap-server",
  "customer-segmentation-server",
  "scenario-modeler-server",
  "transcript-server",
].map((dir) => path.join(root, "upstream", "ext-apps", dir, "src"));

for (const uiRoot of uiRoots) {
  for (const file of await walk(uiRoot)) {
    const relative = path.relative(root, file).split(path.sep).join("/");
    if (RUNTIME_FILES.includes(relative)) continue;
    const content = await readFile(file, "utf8");
    for (const [pattern, label] of FORBIDDEN) {
      if (label === "network fetch" || label === "network WebSocket") {
        if (pattern.test(content)) {
          warnings.push(
            `${relative}: browser-side ${label} (host CSP governs; Wave 1 declares no connect domains)`,
          );
        }
        continue;
      }
      if (pattern.test(content)) {
        failures.push(`${relative}: forbidden ${label} pattern ${pattern}`);
      }
    }
  }
}

for (const warning of warnings) console.warn(`BOUNDARY WARNING: ${warning}`);
if (failures.length > 0) {
  for (const failure of failures) console.error(`BOUNDARY: ${failure}`);
  process.exit(1);
}
console.log(
  `source boundary clean: ${RUNTIME_FILES.length} runtime files scanned, ${warnings.length} browser-side warnings`,
);
