import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const manifest = JSON.parse(
  await readFile(resolve(root, "upstream/manifest.json"), "utf8"),
);
const notices = await readFile(resolve(root, "THIRD_PARTY_NOTICES.md"), "utf8");
const files = manifest.files;
if (!Array.isArray(files) || files.length === 0) {
  throw new Error("upstream/manifest.json must list copied files");
}
for (const file of files) {
  const source = await readFile(resolve(root, file.localPath));
  const digest = createHash("sha256").update(source).digest("hex");
  if (digest !== file.sha256) {
    throw new Error(`digest mismatch for ${file.localPath}`);
  }
  if (file.commit !== "10195ad91851502134930e9b80ec2c04e277a720") {
    throw new Error(`unexpected commit for ${file.localPath}`);
  }
  if (
    !notices.includes(file.localPath) &&
    !notices.includes(file.originalPath)
  ) {
    throw new Error(`THIRD_PARTY_NOTICES.md missing ${file.localPath}`);
  }
  if (!notices.includes(file.license)) {
    throw new Error(`THIRD_PARTY_NOTICES.md missing license ${file.license}`);
  }
}
if (!notices.includes("Apache-2.0") || !notices.includes("MIT")) {
  throw new Error(
    "notices must describe Apache-2.0 gallery code and MIT upstream examples",
  );
}
console.log(`verified ${files.length} upstream notices`);
