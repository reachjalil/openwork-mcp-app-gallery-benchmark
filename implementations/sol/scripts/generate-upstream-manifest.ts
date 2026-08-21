import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import {
  GALLERY_APPS,
  UPSTREAM_COMMIT,
  UPSTREAM_REPOSITORY,
} from "../src/catalog.js";

const root = process.cwd();
const sourceRoot = resolve(root, "upstream/ext-apps");

const adaptationGroups = [
  {
    apps: ["get-time"],
    basis: "examples/basic-server-react",
    paths: ["ui-adaptations/get-time"],
    rationale:
      "Re-expressed the same App bridge, tool result, host-context, and same-server refresh behavior without React to remain below the public 512 KiB resource ceiling.",
  },
  {
    apps: ["cohort-heatmap"],
    basis: "examples/cohort-heatmap-server",
    paths: ["ui-adaptations/cohort-heatmap"],
    rationale:
      "Re-expressed the bounded cohort controls, heatmap, App bridge, tool-result delivery, and same-server refresh without React to remain below the public 512 KiB resource ceiling.",
  },
  {
    apps: ["scenario-modeler"],
    basis: "examples/scenario-modeler-server",
    paths: ["ui-adaptations/scenario-modeler"],
    rationale:
      "Re-expressed the bounded scenario controls, projection view, App bridge, tool-result delivery, and same-server calculation without React to remain below the public 512 KiB resource ceiling.",
  },
  {
    apps: ["budget-allocator", "customer-segmentation"],
    basis:
      "examples/budget-allocator-server and examples/customer-segmentation-server",
    paths: ["src/ui/chart-shim.ts"],
    rationale:
      "Replaced broad Chart.js registration with a gallery-owned bounded canvas-compatible surface while preserving the frozen example UI source and interaction contract.",
  },
] as const;

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? walk(resolve(directory, entry.name))
        : Promise.resolve([resolve(directory, entry.name)]),
    ),
  );
  return nested.flat().sort();
}

const files = [];
for (const app of GALLERY_APPS) {
  const appRoot = resolve(sourceRoot, app.upstreamDirectory);
  for (const path of await walk(appRoot)) {
    const bytes = await readFile(path);
    const localPath = relative(root, path);
    files.push({
      upstreamRepository: UPSTREAM_REPOSITORY,
      upstreamCommit: UPSTREAM_COMMIT,
      originalPath: `examples/${relative(sourceRoot, path)}`,
      localPath,
      contentDigest: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
      bytes: (await stat(path)).size,
      effectiveLicense: "MIT",
      localModifications:
        "None; frozen byte-for-byte source or immutable asset copy. Gallery SDK-v2 adaptation lives outside upstream/.",
      notices:
        "MIT grant and upstream licensing-transition notice preserved in THIRD_PARTY_NOTICES.md.",
    });
  }
}

const galleryAdaptations = [];
for (const group of adaptationGroups) {
  const paths = (
    await Promise.all(
      group.paths.map(async (candidate) => {
        const absolute = resolve(root, candidate);
        return (await stat(absolute)).isDirectory()
          ? walk(absolute)
          : [absolute];
      }),
    )
  ).flat();
  galleryAdaptations.push({
    apps: group.apps,
    basis: group.basis,
    rationale: group.rationale,
    license: "Apache-2.0 gallery-owned adaptation",
    files: await Promise.all(
      paths.map(async (path) => {
        const bytes = await readFile(path);
        return {
          localPath: relative(root, path),
          contentDigest: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
          bytes: (await stat(path)).size,
        };
      }),
    ),
  });
}

await writeFile(
  resolve(root, "upstream/manifest.json"),
  `${JSON.stringify(
    {
      schemaVersion: 1,
      upstreamRepository: UPSTREAM_REPOSITORY,
      upstreamCommit: UPSTREAM_COMMIT,
      selectedDirectories: GALLERY_APPS.map(
        (app) => `examples/${app.upstreamDirectory}`,
      ),
      licenseBoundary: {
        selectedPackageManifests: "MIT",
        upstreamRoot:
          "Apache-2.0 transition with retained MIT grant; documentation excluding specifications is CC-BY-4.0.",
        galleryOwnedCode: "Apache-2.0",
      },
      galleryAdaptations,
      files,
    },
    null,
    2,
  )}\n`,
  "utf8",
);
