/**
 * Read-only upstream drift report.
 *
 * Compares the pinned modelcontextprotocol/ext-apps commit against the
 * current upstream default branch and reports newer commits touching the
 * copied example paths. It never modifies anything and never opens a PR.
 * Network access is limited to the public GitHub API; this script is a
 * manual/scheduled tool and is intentionally NOT part of release:check, so
 * release verification stays network-independent.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(
  await readFile(path.join(root, "upstream", "manifest.json"), "utf8"),
);
const pinned = manifest.upstreamCommit;
const repo = "modelcontextprotocol/ext-apps";

async function api(pathname) {
  const response = await fetch(`https://api.github.com${pathname}`, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "openwork-mcp-app-gallery-fable-check-upstream",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${pathname} responded ${response.status}`);
  }
  return response.json();
}

try {
  const head = await api(`/repos/${repo}/commits?per_page=1`);
  const headSha = head[0]?.sha;
  console.log(`pinned:   ${pinned}`);
  console.log(`upstream: ${headSha}`);
  if (headSha === pinned) {
    console.log("upstream default branch is exactly the pinned commit");
    process.exit(0);
  }
  const compare = await api(`/repos/${repo}/compare/${pinned}...${headSha}`);
  console.log(
    `upstream is ${compare.ahead_by} commits ahead of the pin (status: ${compare.status})`,
  );
  const watched = new Set(
    manifest.files
      .map((entry) => entry.upstreamPath.split("/").slice(0, 2).join("/"))
      .filter((prefix) => prefix.startsWith("examples/")),
  );
  const touched = new Set();
  for (const file of compare.files ?? []) {
    const prefix = file.filename.split("/").slice(0, 2).join("/");
    if (watched.has(prefix) || file.filename === "LICENSE") {
      touched.add(prefix === "LICENSE" ? "LICENSE" : prefix);
    }
  }
  if (touched.size > 0) {
    console.log("newer upstream changes touch copied paths:");
    for (const prefix of [...touched].sort()) console.log(`  - ${prefix}`);
    console.log(
      "review the upstream diff and update through a pull request; never track upstream at build or runtime.",
    );
  } else {
    console.log("no newer upstream change touches the copied example paths");
  }
  process.exit(0);
} catch (error) {
  console.error(
    `check-upstream could not reach the GitHub API: ${error instanceof Error ? error.message : error}`,
  );
  // Report-only tool: an unreachable API is a warning, not a failure.
  process.exit(0);
}
