import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const skip = new Set([
  "node_modules",
  ".git",
  "generated",
  "dist",
  "playwright-report",
  "test-results",
]);
const secret =
  /(AKIA[0-9A-Z]{16})|(-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----)|(ghp_[A-Za-z0-9]{20,})|(xox[baprs]-[A-Za-z0-9-]{10,})/;
let hits = 0;
for (const file of await walk(root)) {
  if (
    file.endsWith(".png") ||
    file.endsWith(".svg") ||
    (file.endsWith(".json") && file.includes("lock"))
  )
    continue;
  const text = await readFile(file, "utf8");
  if (secret.test(text)) {
    console.error(`secret scan hit: ${file}`);
    hits += 1;
  }
}
if (hits > 0) throw new Error("secret scan failed");
console.log("secret scan passed");

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else out.push(path);
  }
  return out;
}
