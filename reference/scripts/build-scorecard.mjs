#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const scores = JSON.parse(
  await readFile(resolve(root, "reference/data/scores.json"), "utf8"),
);

const weights = scores.rubric.categories;
const candidates = ["sol", "fable", "grok"];
const errors = [];

function fail(message) {
  errors.push(message);
}

for (const [id, category] of Object.entries(weights)) {
  if (!Number.isInteger(category.weight) || category.weight <= 0) {
    fail(`rubric ${id} has invalid weight`);
  }
}

const weightSum = Object.values(weights).reduce((sum, item) => sum + item.weight, 0);
if (weightSum !== 100) {
  fail(`rubric weights sum to ${weightSum}, expected 100`);
}

const totals = {};
for (const candidate of candidates) {
  const entry = scores.candidates[candidate];
  if (!entry) {
    fail(`missing candidate ${candidate}`);
    continue;
  }
  let normalized = 0;
  for (const [id, category] of Object.entries(weights)) {
    const line = entry.categories[id];
    if (!line) {
      fail(`${candidate} missing category ${id}`);
      continue;
    }
    if (!Number.isInteger(line.level) || line.level < 0 || line.level > 4) {
      fail(`${candidate}.${id} level must be 0-4`);
    }
    if (!line.evidencePath) {
      fail(`${candidate}.${id} missing evidencePath`);
    }
    if (!line.rationale) {
      fail(`${candidate}.${id} missing rationale`);
    }
    line.weighted = (line.level / 4) * category.weight;
    normalized += line.weighted;
  }
  totals[candidate] = Number(normalized.toFixed(2));
  if (Math.abs(totals[candidate] - entry.expectedNormalizedTotal) > 0.001) {
    fail(
      `${candidate} expectedNormalizedTotal ${entry.expectedNormalizedTotal} != computed ${totals[candidate]}`,
    );
  }
}

if (errors.length) {
  for (const error of errors) {
    console.error(`build-scorecard: ${error}`);
  }
  process.exit(1);
}

function formatLevel(level) {
  return `${level}/4`;
}

const lines = [
  "# Assessment scorecard",
  "",
  "Generated from `reference/data/scores.json`. Arithmetic only; qualitative",
  "evidence is cited, not invented. Original August 17 verdicts remain",
  "authoritative for the benchmark window and are not rewritten by later",
  "monorepo health checks.",
  "",
  `Rubric: \`${scores.rubric.path}\`. Period: **${scores.period}**.`,
  "",
  "## Normalized totals",
  "",
  "| Candidate | Original verdict | Normalized total / 100 | Eligibility |",
  "| --- | --- | ---: | --- |",
];

for (const candidate of candidates) {
  const entry = scores.candidates[candidate];
  lines.push(
    `| ${entry.modelName} | ${entry.originalVerdict} | ${totals[candidate].toFixed(2)} | ${entry.eligibility} |`,
  );
}

lines.push(
  "",
  "Do not treat the numeric total as a canonical-implementation decision.",
  "GROK's original `Incomplete` verdict remains beside its number because",
  "the historical PR did not merge during the benchmark window.",
  "",
  "## Category scores",
  "",
);

for (const candidate of candidates) {
  const entry = scores.candidates[candidate];
  lines.push(`### ${entry.modelName}`, "");
  lines.push(
    "| Category | Weight | Level | Weighted | Evidence |",
    "| --- | ---: | ---: | ---: | --- |",
  );
  for (const [id, category] of Object.entries(weights)) {
    const line = entry.categories[id];
    lines.push(
      `| ${category.title} | ${category.weight} | ${formatLevel(line.level)} | ${line.weighted.toFixed(2)} | \`${line.evidencePath}\` |`,
    );
  }
  lines.push("");
}

const markdown = `${lines.join("\n")}\n`;
const outPath = resolve(root, "reference/docs/assessment/scorecard.md");
await writeFile(outPath, markdown);
const again = `${lines.join("\n")}\n`;
if (again !== markdown) {
  throw new Error("scorecard serialization was not stable");
}
console.log(`build-scorecard: wrote ${outPath}`);
