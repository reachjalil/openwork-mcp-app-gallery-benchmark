# Canonical implementation selection

Date: 2026-08-21

The August 17 benchmark compared three independently hosted galleries. Those
trees stay in `reference/{sol,fable,grok}` as references. The active
hosted gallery is `gallery (now the repository root)`.

Do not rewrite original verdicts. FABLE and SOL remain **Passed**. GROK
remains **Incomplete**. The new gallery does not inherit those verdicts; it
needs its own local `ci:check` and, later, its own production proof.

## Why not deploy all three

The three origins were a comparison experiment. The product need is one
public gallery. Shipping all three would keep three Vercel projects, three
production SHAs, and three places to patch the same Wave 1 envelope.

## Why FABLE is the base

FABLE had the highest original score (91.25/100), the densest verification
(96 + 15 tests, 28/28 canaries), the strongest documented Wave 1 envelope,
and the fewest self-introduced regressions. Copying it and then porting
narrow wins is cheaper and safer than merging three runtimes.

## What moved from the other two

- GROK: drop the hyphen identity-replacement in customer-segmentation UI.
- SOL: keep dual-protocol and independent-host proof practice already
  present in the FABLE base; do not require a paid edge WAF for the first
  deploy.

Detail and citations: `gallery (now the repository root)/SELECTION.md`.
