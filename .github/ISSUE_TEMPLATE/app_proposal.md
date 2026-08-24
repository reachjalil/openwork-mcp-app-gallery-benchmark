---
name: New app proposal
about: Propose a new example app for the gallery
labels: enhancement
---

**What the app demonstrates** (one sentence)

**Interaction type** (chart / form / media / 3D / starter / …)

**Data behavior** (synthetic? deterministic? any external network access?)

Wave-1 hosting rules: no accounts, no persistence, no server-side egress, no
subprocesses, bounded inputs/outputs, useful non-UI fallback. Apps needing
egress or heavier runtimes are discussed here before any code.

See docs/building-mcp-apps.md §4 for the implementation path.
