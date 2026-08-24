import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  GALLERY_APPS,
  UPSTREAM_COMMIT,
  UPSTREAM_REPOSITORY,
} from "../src/catalog.js";

type Manifest = {
  upstreamRepository: string;
  upstreamCommit: string;
  selectedDirectories: string[];
  files: {
    localPath: string;
    originalPath: string;
    contentDigest: string;
    effectiveLicense: string;
    localModifications: string;
    notices: string;
  }[];
  galleryAdaptations: {
    apps: string[];
    rationale: string;
    license: string;
    files: { localPath: string; contentDigest: string; bytes: number }[];
  }[];
};

const root = process.cwd();
const manifest = JSON.parse(
  await readFile(resolve(root, "upstream/manifest.json"), "utf8"),
) as Manifest;
const notices = await readFile(resolve(root, "THIRD_PARTY_NOTICES.md"), "utf8");
if (
  manifest.upstreamRepository !== UPSTREAM_REPOSITORY ||
  manifest.upstreamCommit !== UPSTREAM_COMMIT
)
  throw new Error("Manifest repository or commit mismatch");
if (
  manifest.selectedDirectories.length !== GALLERY_APPS.length ||
  new Set(manifest.selectedDirectories).size !== GALLERY_APPS.length
)
  throw new Error("Manifest must contain six unique selected directories");
for (const app of GALLERY_APPS) {
  if (
    !manifest.selectedDirectories.includes(`examples/${app.upstreamDirectory}`)
  )
    throw new Error(`Missing upstream directory ${app.upstreamDirectory}`);
  const packageJson = JSON.parse(
    await readFile(
      resolve(root, "upstream/ext-apps", app.upstreamDirectory, "package.json"),
      "utf8",
    ),
  ) as { license?: string };
  if (packageJson.license !== "MIT")
    throw new Error(
      `${app.slug} package license is not the reviewed MIT value`,
    );
}
for (const file of manifest.files) {
  const bytes = await readFile(resolve(root, file.localPath));
  const actual = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
  if (
    file.contentDigest !== actual ||
    file.effectiveLicense !== "MIT" ||
    !file.localModifications ||
    !file.notices ||
    !file.originalPath.startsWith("examples/")
  )
    throw new Error(`Invalid provenance record for ${file.localPath}`);
}
if (manifest.galleryAdaptations.length !== 4)
  throw new Error(
    "Manifest must describe the four gallery-owned adaptation groups",
  );
for (const adaptation of manifest.galleryAdaptations) {
  if (
    adaptation.apps.length === 0 ||
    !adaptation.rationale ||
    adaptation.license !== "Apache-2.0 gallery-owned adaptation" ||
    adaptation.files.length === 0
  )
    throw new Error("Invalid gallery-owned adaptation provenance");
  for (const file of adaptation.files) {
    const bytes = await readFile(resolve(root, file.localPath));
    const digest = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
    if (file.contentDigest !== digest || file.bytes !== bytes.byteLength)
      throw new Error(`Invalid adaptation provenance for ${file.localPath}`);
  }
}
for (const required of [
  UPSTREAM_REPOSITORY,
  UPSTREAM_COMMIT,
  "MIT License",
  "Apache-2.0",
  "Creative Commons Attribution 4.0",
]) {
  if (!notices.includes(required))
    throw new Error(`THIRD_PARTY_NOTICES.md is missing ${required}`);
}
console.info(
  `Notice and provenance verification passed for ${manifest.files.length} copied files and ${manifest.galleryAdaptations.length} adaptation groups`,
);
