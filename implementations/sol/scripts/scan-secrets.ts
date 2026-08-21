import { readdir, readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

const root = process.cwd();
const ignored = new Set([
  ".git",
  ".vercel",
  ".build",
  "node_modules",
  "test-results",
  "playwright-report",
]);
const textExtensions = new Set([
  "",
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".css",
  ".html",
  ".txt",
]);
const patterns: [RegExp, string][] = [
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u, "private key"],
  [/\bgh[opsu]_[A-Za-z0-9]{20,}\b/u, "GitHub token"],
  [/\b(?:sk_live|rk_live)_[A-Za-z0-9]{16,}\b/u, "live payment credential"],
  [/\b(?:vercel|vcp)_[A-Za-z0-9_-]{20,}\b/u, "Vercel credential"],
  [/\bAKIA[A-Z0-9]{16}\b/u, "AWS access key"],
];
let scanned = 0;
for (const path of await walk(root)) {
  if (!textExtensions.has(extname(path))) continue;
  const contents = await readFile(path, "utf8");
  scanned += 1;
  for (const [pattern, label] of patterns)
    if (pattern.test(contents))
      throw new Error(`${label} pattern detected in ${path}`);
}
console.info(`Secret scan passed for ${scanned} text files`);

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.flatMap((entry) =>
        ignored.has(entry.name)
          ? []
          : [
              entry.isDirectory()
                ? walk(resolve(directory, entry.name))
                : Promise.resolve([resolve(directory, entry.name)]),
            ],
      ),
    )
  ).flat();
}
