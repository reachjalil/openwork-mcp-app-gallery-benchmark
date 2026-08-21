# Contributing

This repository uses `forward` as the only active integration and release
branch. `main` and `dev` are not delivery branches.

1. Create a focused feature branch from the current `forward` head.
2. Keep Wave 1 examples free of accounts, cookies, databases, credentials,
   uploads, subprocesses, arbitrary URLs, write tools, and server-side egress.
3. Record copied or modified upstream files in `upstream/manifest.json` and
   `THIRD_PARTY_NOTICES.md`.
4. Run `pnpm release:check` before opening a pull request.
5. Open a pull request targeting `forward`.

Do not add AI co-authorship trailers, generated-by badges, credentials, or
private deployment bypass values.

There is no availability SLA. Do not describe this project as an official
Model Context Protocol service.
