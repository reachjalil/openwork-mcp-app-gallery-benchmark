import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "src");
const forbidden =
  /\b(?:child_process|execFile|execSync|spawnSync|npx |curl |wget )\b|fetch\(\s*["']https?:\/\/(?!github.com\/modelcontextprotocol)/;
const files = await walk(root);
let hits = 0;
for (const file of files) {
  const text = await readFile(file, "utf8");
  if (forbidden.test(text)) {
    console.error(`source-boundary hit: ${file}`);
    hits += 1;
  }
}
if (hits > 0) throw new Error("source boundary scan failed");
console.log("source boundary scan passed");

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else if (entry.name.endsWith(".ts")) out.push(path);
  }
  return out;
}
