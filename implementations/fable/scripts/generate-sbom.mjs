/**
 * Generate a minimal CycloneDX 1.5 SBOM for the production dependency
 * closure by walking the installed module graph (no subprocesses, no
 * network; robust to pnpm's non-hoisted layout and exports-hidden
 * package.json files).
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(
  await readFile(path.join(root, "package.json"), "utf8"),
);

async function manifestPathFor(name, fromDir) {
  const require_ = createRequire(path.join(fromDir, "noop.js"));
  let entry;
  try {
    entry = require_.resolve(name);
  } catch {
    try {
      entry = require_.resolve(`${name}/package.json`);
    } catch {
      return null;
    }
  }
  let directory = path.dirname(entry);
  while (directory !== path.dirname(directory)) {
    const candidate = path.join(directory, "package.json");
    if (existsSync(candidate)) {
      try {
        const manifest = JSON.parse(await readFile(candidate, "utf8"));
        if (manifest.name === name) return candidate;
      } catch {
        // keep walking up
      }
    }
    directory = path.dirname(directory);
  }
  return null;
}

const seen = new Map();
const queue = Object.keys(packageJson.dependencies ?? {}).map((name) => ({
  name,
  from: root,
}));
const failures = [];

while (queue.length > 0) {
  const { name, from } = queue.shift();
  const manifestPath = await manifestPathFor(name, from);
  if (!manifestPath) {
    failures.push(`${name} (from ${path.relative(root, from) || "."})`);
    continue;
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const key = `${manifest.name}@${manifest.version}`;
  if (seen.has(key)) continue;
  seen.set(key, {
    type: "library",
    name: manifest.name,
    version: manifest.version,
    licenses: manifest.license
      ? [{ license: { id: manifest.license } }]
      : undefined,
    purl: `pkg:npm/${manifest.name.replaceAll("@", "%40")}@${manifest.version}`,
  });
  const base = path.dirname(manifestPath);
  for (const dependency of Object.keys(manifest.dependencies ?? {})) {
    queue.push({ name: dependency, from: base });
  }
}

if (failures.length > 0) {
  console.error(`SBOM: unresolved production packages: ${failures.join(", ")}`);
  process.exit(1);
}

const sbom = {
  bomFormat: "CycloneDX",
  specVersion: "1.5",
  version: 1,
  metadata: {
    timestamp: new Date().toISOString(),
    component: {
      type: "application",
      name: packageJson.name,
      version: packageJson.version,
    },
  },
  components: [...seen.values()].sort(
    (a, b) =>
      a.name.localeCompare(b.name) || a.version.localeCompare(b.version),
  ),
};

await mkdir(path.join(root, "generated"), { recursive: true });
await writeFile(
  path.join(root, "generated", "sbom.cdx.json"),
  `${JSON.stringify(sbom, null, 2)}\n`,
);
console.log(`SBOM generated with ${sbom.components.length} components`);
