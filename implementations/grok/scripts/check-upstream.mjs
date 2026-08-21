import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const PIN = "10195ad91851502134930e9b80ec2c04e277a720";
const root = process.cwd();
const manifest = JSON.parse(
  await readFile(resolve(root, "upstream/manifest.json"), "utf8"),
);
if (manifest.upstreamCommit !== PIN) {
  throw new Error("manifest is not frozen at the required upstream commit");
}

const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
const headers = {
  "user-agent": "openwork-mcp-app-gallery-grok",
  accept: "application/vnd.github+json",
};
if (token) headers.authorization = `Bearer ${token}`;

try {
  const response = await fetch(
    "https://api.github.com/repos/modelcontextprotocol/ext-apps/commits?per_page=1",
    { headers },
  );
  if (!response.ok) {
    console.log(
      `check-upstream: GitHub lookup skipped (${response.status}); pin remains ${PIN}`,
    );
    process.exit(0);
  }
  const commits = await response.json();
  const latest = commits[0]?.sha;
  if (latest && latest !== PIN) {
    console.log(
      `check-upstream: newer commit ${latest} exists; pin remains ${PIN}; no PR opened`,
    );
  } else {
    console.log(`check-upstream: pin ${PIN} is current`);
  }
} catch {
  console.log(`check-upstream: network lookup skipped; pin remains ${PIN}`);
}
