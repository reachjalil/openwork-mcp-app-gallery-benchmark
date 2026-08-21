# Findings overview

All three candidates delivered the same six-app catalog behind one Hono
Function and independent `/apps/<slug>/mcp` endpoints. They froze the same
upstream commit and used Node 24.x, pnpm 10.28.0, `mcp-handler` 2.1.1, and
`@modelcontextprotocol/server` 2.0.0.

The original August 17 verdicts remain:

| Candidate | Verdict | Why |
| --- | --- | --- |
| SOL | Passed | Merged, observed, promoted, and proven on its stable origin |
| FABLE | Passed | Merged, observed, promoted, and proven on its stable origin |
| GROK | Incomplete | Historical PR #1 never merged; production SHA is the unmerged product commit |

The numeric scorecard in `docs/assessment/scorecard.md` is a later normalized
comparison. It does not replace those verdicts.

Reusable lessons:

- Organization review rules can finish a working gallery and still leave the
  benchmark incomplete.
- Isolated MCP endpoints plus a closed build were table stakes, not differentiators.
- Host interoperability was the weakest shared category.
- FABLE invested the most in browser and contract volume; SOL paid more
  regression-repair cost; GROK finished fastest and still missed the merge gate.
