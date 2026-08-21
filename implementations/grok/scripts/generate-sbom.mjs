import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const lock = await readFile(resolve("pnpm-lock.yaml"), "utf8");
const packages = [];
for (const match of lock.matchAll(/^ {2}(?<name>[^:\s][^:]*):/gm)) {
  const name = match.groups?.name;
  if (
    name &&
    name !== "importers" &&
    name !== "packages" &&
    name !== "snapshots"
  ) {
    packages.push(name);
  }
}
const sbom = {
  bomFormat: "CycloneDX",
  specVersion: "1.5",
  version: 1,
  metadata: {
    timestamp: new Date().toISOString(),
    component: {
      type: "application",
      name: "openwork-mcp-app-gallery-grok",
      version: "1.0.0",
    },
  },
  components: [...new Set(packages)].slice(0, 400).map((name) => ({
    type: "library",
    name,
  })),
};
await mkdir("generated", { recursive: true });
await writeFile("generated/sbom.json", JSON.stringify(sbom, null, 2));
console.log(
  `wrote generated/sbom.json with ${sbom.components.length} components`,
);
