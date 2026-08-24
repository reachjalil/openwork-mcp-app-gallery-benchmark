# Assessment rubric

100-point rubric. Score each category 0–4, then multiply by
`level / 4 * weight`.

| Category | Weight | User-facing criteria covered |
| --- | ---: | --- |
| Terminal delivery completeness | 20 | Functional completeness, deployment readiness at the original cutoff |
| Protocol and functional correctness | 20 | Correctness |
| Security and public readiness | 15 | Reliability of the public artifact, abuse controls |
| Deployment and reliability | 15 | Deployment readiness, reliability |
| Host interoperability | 10 | UX in real hosts |
| Maintainability and implementation quality | 10 | Code quality, test and verification quality, documentation quality |
| Execution efficiency | 10 | Performance of the original run, not later microbenchmarks |

## Levels

- 4: exact, complete, reproducible proof
- 3: passed core outcome with a bounded external or optional gap
- 2: meaningful partial proof or an explicit incomplete gate
- 1: attempted but failed or materially non-reproducible
- 0: absent, contradicted, or unsafe to infer

Every score line must include a source path. JSON fields use
`path#field`. Manual adjustments require `docs/assessment/decision-log.md`.

An `Incomplete` terminal verdict remains visible beside the number. Do not
declare a winner from the numeric score alone. Do not let raw speed outweigh
missing merge or deployment proof.

UX and visual quality, accessibility, and documentation quality are judged
from the original reports' accessibility, gallery, and evidence-file
completeness statements. No new visual benchmark numbers were invented.
