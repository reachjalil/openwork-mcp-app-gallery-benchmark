# Repository instructions

- `forward` is the only integration and production branch. Do not activate `main` or `dev`.
- Use Node.js 24.x, pnpm 10.28.0, strict TypeScript, and the frozen lockfile.
- Preserve `TIMELINE.md` and `benchmark/timeline.json` as append-only benchmark evidence; never erase repaired issues or regressions.
- Keep every example behind its own `/apps/<slug>/mcp` surface. Do not create a root mega-MCP.
- Import source only from `modelcontextprotocol/ext-apps@10195ad91851502134930e9b80ec2c04e277a720` and keep `upstream/manifest.json` plus `THIRD_PARTY_NOTICES.md` accurate.
- Do not log arguments, results, prompts, resource contents, authorization headers, cookies, IP addresses, identifiers, credentials, or private deployment URLs.
- No runtime source fetch, package install, subprocess, arbitrary URL, upload, durable state, credential, or intended server-side egress path is allowed for Wave 1.
- Repair through source and rerun invalidated gates. Never force-push `forward`; use `--force-with-lease` only for the owned `sol/gallery-v1` branch after a rebase.
