/**
 * Verify upstream provenance and notices:
 *
 * - every file under upstream/ext-apps is listed in upstream/manifest.json,
 *   and every manifest entry exists on disk;
 * - each file's current digest matches the manifest, and the recorded
 *   modified flag equals (originalSha256 !== currentSha256);
 * - every modified file carries a modification note;
 * - the pinned upstream commit is consistent across the manifest,
 *   src/registry-data.json, and THIRD_PARTY_NOTICES.md;
 * - LICENSE (gallery Apache-2.0), THIRD_PARTY_NOTICES.md, and the verbatim
 *   upstream LICENSE copy are present.
 */
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const failures = [];

function fail(message) {
  failures.push(message);
}

const manifest = JSON.parse(
  await readFile(path.join(root, "upstream", "manifest.json"), "utf8"),
);

if (!/^[0-9a-f]{40}$/.test(manifest.upstreamCommit)) {
  fail("manifest.upstreamCommit is not a full commit SHA");
}

const registryData = JSON.parse(
  await readFile(path.join(root, "src", "registry-data.json"), "utf8"),
);
if (registryData.upstreamCommit !== manifest.upstreamCommit) {
  fail(
    "src/registry-data.json upstreamCommit differs from upstream/manifest.json",
  );
}

async function walk(directory) {
  const results = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "dist" || entry.name === "node_modules") continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(full)));
    } else {
      results.push(full);
    }
  }
  return results;
}

const upstreamDir = path.join(root, "upstream", "ext-apps");
const actualFiles = new Set(
  (await walk(upstreamDir)).map((file) =>
    path.relative(root, file).split(path.sep).join("/"),
  ),
);
const manifestFiles = new Set(manifest.files.map((entry) => entry.path));

for (const file of actualFiles) {
  if (!manifestFiles.has(file))
    fail(`${file} is not listed in upstream/manifest.json`);
}
for (const file of manifestFiles) {
  if (!actualFiles.has(file))
    fail(`${file} is in the manifest but missing on disk`);
}

for (const entry of manifest.files) {
  if (!actualFiles.has(entry.path)) continue;
  const content = await readFile(path.join(root, entry.path));
  const digest = createHash("sha256").update(content).digest("hex");
  if (digest !== entry.currentSha256) {
    fail(`${entry.path} digest ${digest.slice(0, 12)} does not match manifest`);
  }
  const isModified = entry.originalSha256 !== entry.currentSha256;
  if (isModified !== entry.modified) {
    fail(
      `${entry.path} modified flag is ${entry.modified} but digests say ${isModified}`,
    );
  }
  if (isModified && !entry.modificationNote) {
    fail(`${entry.path} is modified but has no modificationNote`);
  }
  if (!/^[0-9a-f]{64}$/.test(entry.originalSha256 ?? "")) {
    fail(`${entry.path} has no valid originalSha256`);
  }
}

const galleryLicense = await readFile(path.join(root, "LICENSE"), "utf8");
if (!galleryLicense.includes("Apache License")) {
  fail("LICENSE does not carry the Apache-2.0 text");
}

const upstreamLicense = await readFile(
  path.join(root, "upstream", "ext-apps", "LICENSE"),
  "utf8",
);
if (!upstreamLicense.includes("MIT License")) {
  fail("upstream/ext-apps/LICENSE does not carry the upstream MIT text");
}

const notices = await readFile(
  path.join(root, "THIRD_PARTY_NOTICES.md"),
  "utf8",
);
if (!notices.includes(manifest.upstreamCommit)) {
  fail("THIRD_PARTY_NOTICES.md does not name the pinned upstream commit");
}
if (!notices.includes("upstream/manifest.json")) {
  fail("THIRD_PARTY_NOTICES.md does not reference upstream/manifest.json");
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`NOTICES: ${failure}`);
  process.exit(1);
}
console.log(
  `notices and provenance verified: ${manifest.files.length} files, ` +
    `${manifest.files.filter((entry) => entry.modified).length} documented modifications`,
);
