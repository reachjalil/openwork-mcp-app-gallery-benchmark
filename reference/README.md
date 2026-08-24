# Reference: how this gallery was built and chosen

The gallery at the repository root was not written once — it was **selected**
from three complete, independently built implementations of the same frozen
specification, produced in an autonomous three-model benchmark on 2026-08-17
(SOL, FABLE, and GROK, one isolated repository and production deployment
each). FABLE won on quality and completeness and became the runtime base;
GROK contributed a small correctness cleanup; SOL's distinguishing practices
were already present in the base. This folder preserves the full evidence.

## Contents

| Path | What it is |
| --- | --- |
| [`sol/`](sol) · [`fable/`](fable) · [`grok/`](grok) | The three complete candidate implementations, frozen as imported (each with its own tests, `TIMELINE.md`, and `BENCHMARK_REPORT.md` receipts) |
| [`docs/selection.md`](docs/selection.md) | What the canonical gallery took from each candidate |
| [`docs/assessment/`](docs/assessment) | Bakeoff report, scoring rubric, per-candidate assessments, scorecard, quality rescore, decision log |
| [`docs/findings/`](docs/findings) | Detailed findings per candidate and the migration delta |
| [`docs/experiment/`](docs/experiment) | The frozen benchmark brief and requirements the three models received |
| [`docs/performance/`](docs/performance) | Timing methodology and wall-clock comparisons |
| [`docs/migration/`](docs/migration) | How the three source repositories were consolidated here (transfers, receipts, rollback notes, the preserved historical GROK PR) |
| [`data/`](data) | Machine-readable results: per-candidate scores, combined results, source manifest |
| [`scripts/`](scripts) | The comparison tooling (validate / compare / scorecard / manifest verification) |

## Reproducing the comparison

```bash
node reference/scripts/validate-results.mjs
node reference/scripts/build-comparison.mjs
node reference/scripts/build-scorecard.mjs
node reference/scripts/verify-source-manifest.mjs
```

CI re-runs each candidate's full release gate and the comparison drift-check
whenever anything under `reference/` changes (`.github/workflows/reference.yml`);
ordinary gallery work never pays that cost.

## Status

These trees are **frozen evidence**, not maintained software: they receive no
feature work, and their original production deployments are being retired in
favor of the canonical gallery. If you're here to build something, use the
repository root and [`docs/building-mcp-apps.md`](../docs/building-mcp-apps.md).
