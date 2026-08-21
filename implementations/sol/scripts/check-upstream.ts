import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { UPSTREAM_COMMIT, UPSTREAM_REPOSITORY } from "../src/catalog.js";

type Manifest = {
  upstreamRepository: string;
  upstreamCommit: string;
  files: { localPath: string; contentDigest: string }[];
};

const root = process.cwd();
const manifest = JSON.parse(
  await readFile(resolve(root, "upstream/manifest.json"), "utf8"),
) as Manifest;
if (
  manifest.upstreamRepository !== UPSTREAM_REPOSITORY ||
  manifest.upstreamCommit !== UPSTREAM_COMMIT
)
  throw new Error("Upstream manifest pin changed unexpectedly");
for (const file of manifest.files) {
  const actual = `sha256:${createHash("sha256")
    .update(await readFile(resolve(root, file.localPath)))
    .digest("hex")}`;
  if (actual !== file.contentDigest)
    throw new Error(`Upstream source drift: ${file.localPath}`);
}
console.info(
  `Pinned upstream boundary passed: ${manifest.files.length} files at ${UPSTREAM_COMMIT}`,
);

if (process.argv.includes("--remote")) {
  const response = await fetch(
    `https://api.github.com/repos/${UPSTREAM_REPOSITORY}/commits/main`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "openwork-mcp-app-gallery-upstream-check",
      },
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok)
    throw new Error(
      `Remote upstream check failed with HTTP ${response.status}`,
    );
  const data = (await response.json()) as { sha?: string };
  console.info(
    data.sha === UPSTREAM_COMMIT
      ? "Pinned commit matches upstream main."
      : `A newer upstream revision exists: ${data.sha ?? "unknown"}. Manual review required; no files were changed.`,
  );
}
