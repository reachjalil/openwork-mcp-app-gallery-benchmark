#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const candidates = ["sol", "fable", "grok"];
const required = [
  "modelName",
  "modelNamespace",
  "finalVerdict",
  "productionUrl",
  "startedAtUtc",
  "completedAtUtc",
  "totalElapsedMs",
  "estimatedActiveMs",
  "passed",
  "failed",
  "incomplete",
];

function fail(message) {
  console.error(`validate-results: ${message}`);
  process.exitCode = 1;
}

const records = [];
for (const candidate of candidates) {
  const relative = `reference/${candidate}/benchmark/result.json`;
  const raw = await readFile(resolve(root, relative), "utf8");
  const data = JSON.parse(raw);
  for (const field of required) {
    if (!(field in data)) {
      fail(`${relative} missing ${field}`);
    }
  }
  if (typeof data.totalElapsedMs !== "number" || data.totalElapsedMs < 0) {
    fail(`${relative} has invalid totalElapsedMs`);
  }
  if (!["Passed", "Failed", "Incomplete"].includes(data.finalVerdict)) {
    fail(`${relative} has unexpected finalVerdict ${data.finalVerdict}`);
  }
  if (data.modelNamespace !== candidate) {
    fail(`${relative} modelNamespace ${data.modelNamespace} != ${candidate}`);
  }
  records.push({ candidate, relative, data });
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(
  `validate-results: accepted ${records.length} original result files without mutation`,
);
