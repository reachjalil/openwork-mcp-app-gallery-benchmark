# Migration delta

Changes required to make the imported trees operable as a monorepo. No
runtime homogenization.

## Required adaptations

| Change | Why |
| --- | --- |
| Root `AGENTS.md`, `README.md`, `.gitignore` | New `dev`/`main` contract |
| Path-scoped `AGENTS.md` edits | Stop claiming source `forward` is the monorepo release branch; allow root comparison |
| Uniform `ci:check` scripts | Give root CI one entry point per candidate |
| Root orchestration `package.json` | Run candidate commands with `pnpm --dir` |
| Root `.github/workflows` | Nested candidate workflows are imported history only |
| Root comparison scripts and `docs/` | Shared evidence and scoring |
| `.vercel/` gitignored at root | Never commit local project linkage |

## Not changed

- Candidate lockfiles and dependency versions
- Candidate `vercel.json` files
- Environment-variable names
- Original benchmark Markdown and JSON
- GROK historical PR #1 state

## Import equivalence

Temporary source-tree and imported-subtree archives were compared with
SHA-256 file digests on 2026-08-21 before these edits:

| Candidate | Files | Verdict |
| --- | --- | --- |
| SOL | 132 | equivalent at `8ac19f179d296f1831a24aacf92d784d36d7ba3d` |
| FABLE | 168 | equivalent at `2d8547d1b0e1d962c8d799d1b509d889dc96ef08` |
| GROK | 157 | equivalent at `6c0e6bab7eb579da5eee0a8e2cc9de2f57b855c4` |
