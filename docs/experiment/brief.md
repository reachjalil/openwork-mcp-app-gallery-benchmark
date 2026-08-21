# Experiment brief

The August 17 MCP Apps gallery benchmark asked three independently executed
candidates — SOL, FABLE, and GROK — to host the same six official examples as
remote Streamable HTTP MCP servers.

This monorepo preserves those three implementations and their original
evidence. It does not select a canonical implementation or rewrite the
original verdicts.

## Frozen shared prompt

Each candidate had to:

1. Publish six isolated MCP Apps under `/apps/<slug>/mcp`.
2. Serve a public gallery page with copyable MCP URLs.
3. Support current (`2026-07-28`) and legacy Streamable HTTP contracts.
4. Stay inside the Wave 1 safety envelope: no server egress, subprocesses,
   persistence, credentials, or write tools.
5. Freeze upstream at
   `modelcontextprotocol/ext-apps@10195ad91851502134930e9b80ec2c04e277a720`.
6. Prove local release checks, CI, Preview, staged Production observation,
   promotion without rebuild, and stable-origin canaries.
7. Record a timeline, result JSON, and benchmark report.

## App catalog

| Slug | Role |
| --- | --- |
| `get-time` | Smallest tool plus interactive UI |
| `budget-allocator` | Synthetic budget form and recalculation |
| `cohort-heatmap` | Dense retention heatmap |
| `customer-segmentation` | Synthetic customer filters |
| `scenario-modeler` | Synthetic growth projections |
| `transcript` | Browser-local transcript UI |

## Terminal gate

A candidate is `Passed` only when the required product, protocol, security,
Preview, staged observation, promotion, and stable-origin proofs succeed.
Missing merge or post-merge production SHA alignment makes the original
verdict `Incomplete` even if the unmerged artifact was deployed.
