# Source manifest

Machine-readable copy: `benchmark/source-manifest.json`.

Observed 2026-08-21. Trees were byte-equivalent at import, before
migration-specific edits.

| Candidate | Old URL | Personal URL | Ref | Tag | Source SHA | Subtree merge | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SOL | https://github.com/different-ai/openwork-mcp-app-gallery-sol | https://github.com/reachjalil/openwork-mcp-app-gallery-sol | `forward` | `monorepo-import-sol-2026-08-21` | `8ac19f179d296f1831a24aacf92d784d36d7ba3d` | `16a4e091ae3df1665ad5d547e2a505b7eaea1f58` | Passed |
| FABLE | https://github.com/different-ai/openwork-mcp-app-gallery-fable | https://github.com/reachjalil/openwork-mcp-app-gallery-fable | `forward` | `monorepo-import-fable-2026-08-21` | `2d8547d1b0e1d962c8d799d1b509d889dc96ef08` | `ff2be54db4fef799bdba2ec59a8b5621117154dd` | Passed |
| GROK | https://github.com/different-ai/openwork-mcp-app-gallery-grok | https://github.com/reachjalil/openwork-mcp-app-gallery-grok | `grok/gallery-v1` | `monorepo-import-grok-2026-08-21` | `6c0e6bab7eb579da5eee0a8e2cc9de2f57b855c4` | `1ee0a2bc0ef15aba349619fd6d4309bd578a691d` | Incomplete |

File counts at import: SOL 132, FABLE 168, GROK 157.

PRs:

- SOL #1 and #2 merged
- FABLE #1 and #2 merged
- GROK #1 open, not merged, not approved, not closed

Original commits remain reachable from this repository (`git cat-file -e`).
