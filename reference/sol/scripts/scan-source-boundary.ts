import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const targets = [
  resolve(root, "app.ts"),
  ...(await walk(resolve(root, "src"))),
];
const forbidden: [RegExp, string][] = [
  [
    /from\s+["']node:(?:child_process|cluster|net|tls|dgram|dns|http|https|worker_threads)["']/u,
    "network, subprocess, or worker runtime import",
  ],
  [/\b(?:exec|execFile|spawn|fork)\s*\(/u, "subprocess execution"],
  [/\bfetch\s*\(\s*["']https?:/u, "intended server-side egress"],
  [
    /\b(?:writeFile|appendFile|mkdir|rm|unlink|rename)\s*\(/u,
    "runtime filesystem mutation",
  ],
  [/\b(?:eval|Function)\s*\(/u, "dynamic code execution"],
];
for (const path of targets) {
  const contents = await readFile(path, "utf8");
  for (const [pattern, label] of forbidden)
    if (pattern.test(contents)) throw new Error(`${label} detected in ${path}`);
}
console.info(`Source boundary scan passed for ${targets.length} runtime files`);

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? walk(resolve(directory, entry.name))
          : Promise.resolve(
              /\.[cm]?[jt]s$/u.test(entry.name)
                ? [resolve(directory, entry.name)]
                : [],
            ),
      ),
    )
  ).flat();
}
