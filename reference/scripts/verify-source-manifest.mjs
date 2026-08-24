#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const manifest = JSON.parse(
  await readFile(resolve(root, "reference/data/source-manifest.json"), "utf8"),
);

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

let failed = false;
for (const candidate of manifest.candidates) {
  try {
    git(["cat-file", "-e", `${candidate.sourceSha}^{commit}`]);
  } catch {
    console.error(`verify-source-manifest: missing commit ${candidate.sourceSha}`);
    failed = true;
  }
  const peeled = git(["rev-parse", `${candidate.importTag}^{commit}`]);
  if (peeled !== candidate.sourceSha) {
    console.error(
      `verify-source-manifest: ${candidate.importTag} peels to ${peeled}, expected ${candidate.sourceSha}`,
    );
    failed = true;
  }
  const mergeParents = git(["rev-list", "--parents", "-n", "1", candidate.subtreeMergeSha]).split(
    " ",
  );
  if (!mergeParents.includes(candidate.sourceSha)) {
    console.error(
      `verify-source-manifest: subtree ${candidate.subtreeMergeSha} does not parent ${candidate.sourceSha}`,
    );
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
console.log(`verify-source-manifest: ${manifest.candidates.length} import coordinates verified`);
