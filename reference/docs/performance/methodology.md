# Performance methodology

Two periods are kept separate.

## Original benchmark

Source: each candidate `benchmark/result.json`. Values are copied, not
renormalized into a new timing study. Durations are reported as milliseconds
from the source fields `totalElapsedMs`, `estimatedActiveMs`,
`externalWaitMs`, `ciWaitMs`, `vercelWaitMs`, and `reworkMs`.

These numbers describe one autonomous August 17 run. They are not laboratory
repeats.

## Post-migration health

New measurements must include:

- command
- working directory
- Node and pnpm versions
- date and time
- exact commit SHA
- pass/fail/incomplete
- limitation

If a command is not run, the cell is `unavailable` or `incomplete`. Do not
estimate.

Post-migration duration is not comparable to the original autonomous run.
The later environment has cached installs, a different machine load, and a
human-operated monorepo session.
