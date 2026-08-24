#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const outPath = resolve(root, "reference/data/combined-result.json");
const candidates = ["sol", "fable", "grok"];

const combined = {
  generatedAtUtc: "2026-08-21T00:00:00.000Z",
  generator: "reference/scripts/build-comparison.mjs",
  note: "Source values are copied, not normalized. Post-migration measurements live in docs/performance/post-migration.md.",
  candidates: {},
};

for (const candidate of candidates) {
  const relative = `reference/${candidate}/benchmark/result.json`;
  const data = JSON.parse(await readFile(resolve(root, relative), "utf8"));
  combined.candidates[candidate] = {
    sourcePath: relative,
    modelName: data.modelName,
    modelNamespace: data.modelNamespace,
    finalVerdict: data.finalVerdict,
    productionUrl: data.productionUrl,
    startedAtUtc: data.startedAtUtc,
    completedAtUtc: data.completedAtUtc,
    totalElapsedMs: data.totalElapsedMs,
    estimatedActiveMs: data.estimatedActiveMs,
    externalWaitMs: data.externalWaitMs ?? null,
    ciWaitMs: data.ciWaitMs ?? null,
    vercelWaitMs: data.vercelWaitMs ?? null,
    reworkMs: data.reworkMs ?? null,
    selfIntroducedRegressionCount: data.selfIntroducedRegressionCount ?? null,
    correctedRegressionCount: data.correctedRegressionCount ?? null,
    unresolvedIssueCount: data.unresolvedIssueCount ?? null,
    currentProtocolState: data.currentProtocolState ?? null,
    legacyProtocolState: data.legacyProtocolState ?? null,
    openworkCompatibilityState: data.openworkCompatibilityState ?? null,
    independentHostState: data.independentHostState ?? null,
    accessibilityState: data.accessibilityState ?? null,
    securityState: data.securityState ?? null,
    rollbackState: data.rollbackState ?? null,
    passed: data.passed,
    failed: data.failed,
    incomplete: data.incomplete,
    skipped: data.skipped ?? [],
    deferred: data.deferred ?? [],
  };
}

const serialized = `${JSON.stringify(combined, null, 2)}\n`;
await writeFile(outPath, serialized);
const second = `${JSON.stringify(combined, null, 2)}\n`;
if (second !== serialized) {
  throw new Error("combined-result serialization was not stable");
}
console.log(`build-comparison: wrote ${outPath}`);
