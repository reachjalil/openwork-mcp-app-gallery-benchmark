# Hosted MCP Apps bake-off article assets

All publishable raster assets are 1600 × 900 PNGs.

| Asset | Role | Source |
| --- | --- | --- |
| `hero-cheat-illustration-v3.png` | Current hand-drawn X Article splash showing Grok's phone call, shortcut, official result bars, and separate hypothetical callout | Built-in ImageGen edit |
| `hero-cheat-illustration-v2.png` | Superseded illustrated splash with an ambiguous scaled hypothetical bar | Built-in ImageGen edit |
| `hero-cheat-illustration.png` | Superseded hand-drawn splash without the phone-call scene and result bars | Built-in ImageGen edit |
| `hero-three-models-office-v3.png` | Superseded photographic header retained for comparison | Built-in ImageGen edit |
| `hero-three-models-office-v2.png` | Superseded sparse header retained for comparison | Built-in ImageGen edit |
| `hero-three-models-office.png` | Superseded original header retained for comparison | Built-in ImageGen |
| `quality-leaderboard-imagegen.png` | Current hand-rendered official and counterfactual score chart | Built-in ImageGen edit of `quality-leaderboard.png` |
| `speed-quality-scatter-imagegen.png` | Current hand-rendered focused time × quality × test-depth chart | Built-in ImageGen edit of `speed-quality-scatter.png` |
| `test-suite-depth-imagegen.png` | Current hand-rendered automated/browser test comparison | Built-in ImageGen edit of `test-suite-depth.png` |
| `release-path-imagegen.png` | Current hand-rendered merge and production-alignment path | Built-in ImageGen edit of `release-path.png` |
| `merge-delta-imagegen.png` | Current hand-rendered Grok merge counterfactual | Built-in ImageGen edit of `merge-delta.png` |
| `quality-leaderboard.png`, `speed-quality-scatter.png`, `test-suite-depth.png`, `release-path.png`, `merge-delta.png` | Deterministic factual source masters retained for comparison and future edits | Matching SVG source files |
| `proof-wins-quote-v2.png` | Superseded photographed closing quote card retained for comparison | Built-in ImageGen edit |
| `proof-wins-quote.png` | Superseded flat closing quote card retained for comparison | Deterministic `proof-wins-quote.svg` |

The complete prompts for the current illustration and five chart edits are recorded in [`imagegen-handdrawn-prompts.md`](imagegen-handdrawn-prompts.md).

## Final hero edit prompt

```text
Use case: precise-object-edit
Asset type: full-bleed editorial magazine header photograph for a long-form technology article
Input images: Image 1: edit target
Primary request: transform the sparse product photograph into a richly layered, art-directed technology-magazine image while preserving the MacBook and its benchmark UI as the sharp narrative center; create visual density through meaningful workplace detail, depth layers, light, texture, and human action—not clutter
Composition/framing: full-bleed 16:9 with no white border, rounded outer frame, or empty page margin; refine to a confident diagonal over-the-shoulder editorial crop using a 50mm full-frame lens at f/2.8; laptop large on the right-center rule-of-thirds point; developer's textured shoulder and forearm form a soft left foreground frame; one hand leans naturally on the desk and the other hovers near the trackpad as if about to press Start Run; preserve the laptop as the sharpest focal plane
Foreground layer: add a partially cropped open cream notebook with elegant hand-drawn interface wireframes but no readable words, a dark metal pen laid diagonally, and a softly blurred loop of blue USB-C cable near the bottom edge
Midground layer: retain the pale-oak desk and MacBook; add a tactile cobalt ceramic coffee cup, a small closed navy notebook, and one folded pair of thin metal-frame glasses placed naturally away from the laptop; keep breathing room around the computer
Background layer: enrich the bright white-and-blue modern studio with deep cobalt acoustic panels, a tall pale-oak shelf holding a few design books and ceramics, one sculptural plant, glass partitions, and directional window light; no other people and no additional screens; background remains creamy and recognizable rather than blank
Lighting/mood: sophisticated editorial daylight with a diagonal shaft of warm sun crossing the pale desk and catching the laptop edge, balanced by cool blue ambient reflections; richer contrast and tonal depth, gentle film grain, believable lens falloff, subtle real-world imperfections; energetic, intelligent, premium
Person: preserve exactly one standing developer leaning into the desk, face not visible; upgrade the plain black shirt to a tactile dark-navy overshirt with sleeves casually rolled, realistic fabric folds, and a simple analog watch; preserve natural anatomy and keep the person softer than the laptop
UI invariants: preserve the current premium dark-navy launcher design, hierarchy, rows, status pills, cobalt action button, perspective, and screen reflections; render the required text exactly and legibly
Text (verbatim): "MCP APPS BAKE-OFF", "3 MODELS READY", "FABLE", "READY", "SOL", "READY", "GROK", "READY", "START RUN"
Typography constraints: every specified phrase exactly once; no other letters, numbers, captions, magazine masthead, pseudo-text, code, or labels anywhere in the image; notebook marks must be nonverbal diagrams only
Photographic style: photorealistic high-end technology editorial photography for Wired, Fast Company, or Monocle-level visual polish without copying any publication; candid art direction, tactile realism, nuanced color grading, not a sterile product catalog and not synthetic stock photography
Invariants: exactly one person; exactly one laptop and one visible screen; no second computer, phone, tablet, television, or reflected screen; preserve the white, pale-oak, cobalt, and navy palette; preserve the MacBook/UI story and shallow depth of field
Avoid: empty bare desk, excessive negative space, centered catalog composition, random clutter, extra coffee cups, extra hands, illegible text, obvious logos, floating UI, cyberpunk neon, illustration, CGI, plastic skin, distorted anatomy, pasted-on screen, overexposure, heavy vignette, watermark
```

## X image descriptions

### Header

An ink, graphite, colored-pencil, and gouache illustration on warm ivory paper. A gold arrow identifies Fable carrying a towering stack of checked proof. A cyan arrow identifies Sol carrying a smaller folder. A coral arrow identifies Grok, circled with a hand-drawn “Cheater” mark while calling a puzzled coworker to ask, “Approve my PR?” Grok holds a PR HEAD pass beside a closed merge gate and a dashed shortcut. A result panel shows proportional official bars for Fable 93.13, Sol 84.38, and Grok 68.13. A separate dashed annotation reads: “+17.50 if merged → 85.63, hypothetical.”

### Quality leaderboard

Hand-rendered horizontal quality leaderboard on warm paper. Fable scored 93.13 and Passed. A dashed, explicitly hypothetical Grok-if-merged bar reaches 85.63. Sol scored 84.38 and Passed. Official Grok scored 68.13 and remained Incomplete.

### Speed, quality, and test depth

Hand-rendered scatter plot on warm paper comparing focused work, official quality score, and total tests. Grok used 62.47 focused minutes and officially scored 68.13 with 36 tests; a dashed counterfactual reaches 85.63 if merged. Sol used 131.02 minutes and scored 84.38 with 52 tests. Fable used 140 minutes and scored 93.13 with 111 tests. Lower focused minutes means faster; bubble area represents total automated plus browser tests.

### Test-suite depth

Hand-rendered stacked horizontal bars on warm paper compare final test suites. Fable had 96 automated and 15 browser tests, 111 total. Sol had 42 automated and 10 browser tests, 52 total. Grok had 34 automated and 2 browser tests, 36 total. A merge would not change Grok's suite.

### Release path

Hand-rendered release diagram on warm paper. Fable and Sol proceed from build through a green pull request, merge, post-merge CI, and a production SHA aligned to the merged release. Grok reaches a green pull-request head, stops at a blocked merge gate, has no post-merge CI, and serves the pull-request head in production instead of a merged release SHA.

### Merge counterfactual

Hand-rendered score-delta infographic on warm paper. Grok's official score of 68.13 rises to a hypothetical 85.63 if its pull request merges: plus 10.00 for shipped and complete, 1.87 for security, 1.88 for deploy, and 3.75 for the speed cap. Protocol, host proof, and maintainability do not change.

### Quote card

A cinematic photograph of a handcrafted three-lane release-testing installation on a dark smoked-glass worktable. Gold and cyan illuminated lanes clear machined metal gates while the coral lane stops at a large physical merge gate in the sharp foreground. A standing developer leans over the installation in the soft studio background. The card reads: “The fastest builder lost at the merge gate. Fable won on proof.” Footer: Fable 93.13, Sol 84.38, Grok 68.13 official or 85.63 if merged.

## Final quote-card edit prompt

```text
Use case: style-transfer / editorial share-card redesign
Asset type: full-bleed 16:9 closing image for a premium long-form technology article on X
Input images: Image 1 is the edit target. Preserve its factual message and exact numerical facts, but replace the flat deterministic SVG look with a convincing image-led editorial composition.

Primary request: turn the card into a cinematic photorealistic technology-magazine photograph built around a physical “merge gate” metaphor. On a dark smoked-glass worktable in a modern software studio, show a handcrafted three-lane release-testing installation in shallow focus: a warm gold lane has cleared a sculptural gate and is visibly backed by a dense sequence of tiny illuminated proof checkpoints; a cyan lane has also cleared cleanly; a coral-red lane arrives first but is stopped at a tactile metal merge gate. The installation must feel plausibly photographed—machined aluminum, frosted acrylic, tiny practical lights, cable texture, subtle fingerprints and dust—not abstract CGI. In the soft background, include one standing developer leaning over the table, seen only as a blurred shoulder/forearm silhouette, plus blue acoustic panels and cool white office architecture. The physical release installation stays sharply in focus.

Composition/framing: low diagonal side angle at table height, 50mm full-frame editorial camera, f/2.8, foreground-to-background depth, strong leading lines from lower right toward upper left; plenty of clean dark photographic space on the left/lower half for the headline; no border, no rounded frame, no empty white margin
Lighting/mood: warm tungsten practical light on the gold proof lane, restrained cyan and coral accents, cool cobalt ambient fill, soft window highlights, natural bloom, nuanced shadows, subtle film grain; intelligent, tactile, dramatic, premium, human; it must look like a real art-directed magazine shoot rather than AI art
Typography: integrate the headline into the photograph with refined contemporary editorial sans-serif type, crisp and high contrast, aligned to a clean left grid. Keep hierarchy bold but elegant. Do not cover the physical merge-gate focal point.
Text (verbatim, preserve exactly):
"THE FASTEST BUILDER LOST AT THE MERGE GATE."
"FABLE WON ON PROOF."
"FABLE 93.13"
"SOL 84.38"
"GROK 68.13 OFFICIAL · 85.63 IF MERGED"
Text constraints: each specified phrase exactly once; exact spelling, punctuation, and numbers; no other words, letters, pseudo-text, labels, code, logos, masthead, or watermark
Color mapping: Fable/gold, Sol/cyan, Grok/coral; keep this mapping consistent in the physical lanes and score footer
Invariants: 16:9 landscape; photo-real, not illustration; one blurred person maximum; no face visible; no laptop or additional screens; exact factual values; clean publication-ready composition
Avoid: flat vector waves, decorative blobs, generic line chart, neon cyberpunk, sci-fi holograms, racing cars, robots, literal sports finish line, stock-photo handshake, excessive empty space, sterile render, impossible geometry, distorted hands, fake text, extra numbers, logos, watermark
```
