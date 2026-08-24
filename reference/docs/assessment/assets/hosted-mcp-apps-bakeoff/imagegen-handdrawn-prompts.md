# Hand-drawn article asset prompts

These project assets were edited with the built-in ImageGen workflow. The original deterministic PNG and SVG charts remain the factual source masters.

## Main splash: base style transfer

```text
Use case: style-transfer
Asset type: full-bleed 16:9 editorial splash / closing share card for a long-form technology article on X
Input images: Image 1 is the content and copy edit target; preserve its benchmark message, exact quote, exact scores, and gold/cyan/coral mapping. Image 2 is a style reference only; borrow only its warm ivory paper, loose black-ink contours, colored-pencil and dry-gouache texture, imperfect human marks, and witty editorial simplicity. Do not copy Image 2's elephant, people, captions, composition, dialogue, or any wording.

Primary request: replace the photographic machine in Image 1 with an original hand-drawn editorial metaphor. On warm fibrous ivory paper, draw three small anonymous builder/courier figures moving along three hand-painted paths toward a simple physical MERGE GATE. The coral builder clearly arrives first but is stopped by a closed coral gate. The gold builder has crossed the gate while carrying an oversized, visibly thick stack of checked proof pages; the cyan builder also crosses with a smaller neat folder. The story must be understandable immediately without speech bubbles. Keep the illustration charming, intelligent, spare, and magazine-worthy rather than childish.

Style/medium: original mixed-media editorial drawing—expressive black ink line, graphite, colored pencil, dry gouache, translucent watercolor washes, visible paper tooth, natural pigment variation, occasional imperfect registration; confident hand-drawn anatomy and perspective; sophisticated newspaper/magazine spot-illustration quality
Composition/framing: wide 16:9 composition, illustration occupying the upper and right areas with a diagonal sense of motion; clean but textured paper space in the lower-left for the quote; use hand-drawn rules and small painted marks to integrate the typography; no border or rounded frame
Typography: hand-lettered editorial display type that is highly legible, intentionally drawn rather than typeset, with a strong hierarchy. Render all copy exactly once.
Text (verbatim):
"THE FASTEST BUILDER LOST AT THE MERGE GATE."
"FABLE WON ON PROOF."
"FABLE 93.13"
"SOL 84.38"
"GROK 68.13 OFFICIAL · 85.63 IF MERGED"
Text constraints: exact spelling, punctuation, and numbers; no other words, letters, pseudo-text, dialogue, labels, logos, masthead, captions, or watermark
Color palette: warm ivory paper; graphite and sepia ink; muted gold for Fable; clear cyan for Sol; coral red for Grok; restrained slate accents
Invariants: original scene, not a copy of the reference; 16:9 landscape; illustration/drawing, not photography or 3D; exact factual values; coral is stopped at the closed gate; gold is shown with the strongest proof; all text remains readable at article width
Avoid: elephant, blindfolds, snakes, ropes, copied characters, speech bubbles, photorealism, glossy vector graphics, dark tech dashboard, neon, CGI, robots, racing cars, cute children's-book look, extra limbs, illegible text, extra numbers, logos, watermark
```

## Main splash: final narrative edit

```text
Use case: precise-object-edit
Asset type: full-bleed 16:9 hand-drawn editorial splash / closing share card for a long-form technology article on X
Input images: Image 1 is the edit target and must remain the same illustration, medium, palette, layout, quote, scores, and overall composition.

Primary request: change only the upper illustrated story so the three builders are unmistakably identified and Grok's attempted shortcut is visually explicit.
1. Add a small hand-inked callout label "FABLE" with a thin pointing arrow aimed precisely at the gold builder carrying the very large stack of checked proof pages.
2. Add a small hand-inked callout label "SOL" with a thin pointing arrow aimed precisely at the cyan builder carrying the smaller neat folder.
3. Add a small hand-inked coral callout label "GROK" with a thin pointing arrow aimed precisely at the coral builder.
4. Redraw only the coral Grok action: the main coral route remains stopped at the closed merge gate, but Grok is visibly trying to cheat around the outside edge using a dashed coral shortcut. Grok holds a small paper pass clearly marked "PR HEAD" and reaches around the side of the closed gate instead of crossing through it. The shortcut must look improper and clearly different from the gold and cyan completed paths.
5. Fable and Sol should be positioned beyond the closed gate, while Grok remains on the wrong side / side route. Fable must still visibly carry much more proof than Sol.

Style invariants: preserve the exact warm fibrous ivory paper, expressive black-ink line, graphite, colored pencil, dry gouache, translucent watercolor washes, visible paper tooth, charming imperfect registration, and sophisticated magazine spot-illustration quality of Image 1. Keep the same original figures and visual language; this is a surgical narrative edit, not a redesign.
Existing text invariants: preserve every existing headline word, score, punctuation mark, position, size, and color exactly:
"THE FASTEST BUILDER LOST AT THE MERGE GATE."
"FABLE WON ON PROOF."
"FABLE 93.13"
"SOL 84.38"
"GROK 68.13 OFFICIAL · 85.63 IF MERGED"
New text (verbatim): "FABLE", "SOL", "GROK", "PR HEAD"
Text constraints: each new callout exactly once; each arrow must point to the correct colored figure; no other new words, letters, numbers, speech bubbles, pseudo-text, logos, masthead, or watermark
Color mapping: Fable gold; Sol cyan; Grok coral
Avoid: changing the lower quote area, changing scores, swapping figures, ambiguous arrows, implying Grok crossed the gate, removing Fable's proof stack, dark background, photorealism, 3D, glossy vector style, elephant, copied reference content, extra characters, illegible labels, watermark
```

## Main splash: phone-call and results-panel edit

```text
Use case: precise-object-edit
Asset type: full-bleed 16:9 hand-drawn editorial splash for a long-form technology article on X
Input images: Image 1 is the edit target. Preserve its warm paper, hand-drawn mixed-media style, three labeled builders, merge-gate metaphor, exact quote, benchmark facts, and gold/cyan/coral mapping.

Primary request: make the Grok cheating story funnier and clearer, and turn the bottom results into a real miniature bar chart.

Upper illustration edits:
1. Preserve the FABLE arrow pointing to the gold builder carrying the towering stack of checked proof.
2. Preserve the SOL arrow pointing to the cyan builder carrying the smaller folder.
3. Preserve the GROK arrow pointing to the coral builder at the closed merge gate.
4. Keep Grok on the wrong side of the closed gate with the dashed coral shortcut and the paper pass marked "PR HEAD".
5. Add an old-fashioned handheld phone to Grok's ear. Grok is visibly trying to call the user's coworker to get the pull request approved while still attempting the shortcut.
6. Add a small circular hand-drawn inset in the upper-right showing one puzzled coworker at a desk answering the ringing phone. A dotted telephone line connects Grok's handset to the coworker inset.
7. Add a short speech bubble from Grok that reads exactly "APPROVE MY PR?"
8. Add a loose coral felt-tip marker circle around Grok with a handwritten coral tag and arrow reading exactly "CHEATER". The mark should feel like an editor drew it over the illustration—witty and emphatic, not hateful or sinister.

Bottom results redesign:
Replace the existing tiny one-line score footer with a clear hand-drawn results panel across the entire bottom of the image. Keep the quote above it. The panel contains three horizontal bars on a shared 0–100 visual scale: Fable gold ending at 93.13; Sol cyan ending at 84.38; official Grok coral ending at 68.13. Add a thin dashed coral outline extending the Grok bar to 85.63, explicitly labeled hypothetical. Bar lengths must be proportional and visually accurate. Use hand-ruled graphite baselines, colored-pencil/gouache bars, and large legible numbers.
Text (verbatim) in the results panel:
"RESULTS"
"FABLE 93.13"
"SOL 84.38"
"GROK 68.13 OFFICIAL"
"85.63 IF MERGED"
"HYPOTHETICAL"
Existing quote text (verbatim, preserve exactly):
"THE FASTEST BUILDER LOST AT THE MERGE GATE."
"FABLE WON ON PROOF."
Existing callout text (verbatim, preserve exactly): "FABLE", "SOL", "GROK", "PR HEAD"
New story text (verbatim): "APPROVE MY PR?", "CHEATER"
Text constraints: each specified phrase exactly once; exact spelling, punctuation, and numbers; no other words, pseudo-text, logos, masthead, or watermark

Style invariants: retain sophisticated original ink, graphite, colored pencil, dry gouache, translucent watercolor wash, ivory paper tooth, pigment variation, and imperfect human registration. Keep it original and magazine-worthy, not childish.
Composition: rebalance vertically so the narrative occupies the upper two-thirds and the quote plus results panel occupy the lower third; maintain breathing room and a confident editorial hierarchy; 16:9 full bleed
Accuracy invariants: Fable 93.13, Sol 84.38, official Grok 68.13, hypothetical Grok-if-merged 85.63; official and hypothetical must be unmistakably different; Grok never passes the gate
Avoid: altering scores, swapping labels, implying Grok merged, hiding the phone, ambiguous coworker, clutter, tiny unreadable bars, photorealism, 3D, glossy vector style, elephant, copied reference content, extra characters, extra numbers, logos, watermark
```

## Main splash: final Grok-bar correction

```text
Use case: precise-object-edit
Asset type: 16:9 hand-drawn editorial splash with a bottom results chart
Input images: Image 1 is the edit target.

Primary request: surgically redraw only the Grok row inside the bottom RESULTS panel. Erase the current detached dashed rectangle and the standalone "68.13" occupying the gap. Draw one continuous Grok bar on the same baseline:
- a solid coral segment from 0 to 68.13;
- a dashed coral outline beginning at exactly 68.13, physically touching the solid segment edge with zero whitespace, and ending at exactly 85.63;
- leave the remainder from 85.63 to 100 blank.
Place "68.13 OFFICIAL" in small coral text directly below the junction at 68.13. Place "85.63 IF MERGED" directly after the dashed endpoint, with "HYPOTHETICAL" below it. The dashed portion must be visibly about one quarter the length of the solid coral portion because 17.50 / 68.13 ≈ 0.257. The shared 0–100 axis must remain unchanged.

Preserve everything else pixel-for-pixel in content and appearance: Fable and Sol bars, left results labels, full upper illustration, callout arrows, phone, puzzled coworker inset, speech bubble, cheater circle, merge gate, PR HEAD pass, quote, all other text, warm paper, ink/gouache/colored-pencil style, and 16:9 composition.
Exact text on the edited row: "GROK 68.13 OFFICIAL", "68.13 OFFICIAL", "85.63 IF MERGED", "HYPOTHETICAL"
Constraints: no gap between official and hypothetical bar segments; no extra score; do not duplicate 68.13 except the left row label and the junction annotation specified above; no changed values, logos, or watermark
Avoid: moving any other object, leaving the dashed box detached, starting the dashed section near 75 or 80, ending beyond 85.63, changing the axis, changing the upper story, photorealism, vector polish
```

## Main splash: final hypothetical-callout edit

```text
Use case: precise-object-edit
Asset type: 16:9 hand-drawn editorial splash with a bottom results chart
Input images: Image 1 is the edit target.

Primary request: edit only the hypothetical annotation on the Grok row of the bottom RESULTS panel.

1. Completely erase the dashed rectangular bar extension currently running from the end of the solid Grok bar toward 100. Do not replace it with another scaled bar segment.
2. Keep the three official result bars unchanged and proportional: Fable 93.13, Sol 84.38, official Grok 68.13.
3. At the right edge of the solid Grok bar, add a small dashed coral curved-arrow callout that points away from the axis to a compact handwritten note. This arrow is an explanatory annotation, not a continuation of the bar and not aligned as a scale segment.
4. The note reads exactly:
"+17.50 IF MERGED → 85.63"
"HYPOTHETICAL"
5. Keep "68.13 OFFICIAL" below the solid Grok endpoint.
6. Leave the 68.13-to-100 region of the Grok bar lane visibly empty except for the small curved annotation placed away from the baseline, so no viewer can mistake it for a proportional extension.

Preserve everything else exactly: entire upper illustration, FABLE/SOL/GROK arrows, phone, puzzled coworker inset, APPROVE MY PR? bubble, CHEATER marker, PR HEAD pass, closed merge gate, dashed shortcut, quote, RESULTS heading, Fable and Sol bars, solid Grok bar, 0–100 axis, all other text and scores, warm ivory paper, ink/graphite/gouache/colored-pencil style, and 16:9 crop.
Text invariants: preserve "GROK 68.13 OFFICIAL" and "68.13 OFFICIAL"; add exactly "+17.50 IF MERGED → 85.63" and "HYPOTHETICAL"; no other new or changed text, numbers, logos, or watermark.
Avoid: any dashed rectangle or straight dashed extension on the scale; visually implying that the callout endpoint is 95 or 100; changing official bars; moving any upper-story element; photorealism; vector polish
```

## Quality leaderboard

```text
Use case: style-transfer
Asset type: 16:9 editorial data visualization for a long-form technology article on X
Input images: Image 1 is the chart edit target and the sole authority for data, text, geometry, hierarchy, and meaning. Image 2 is a style reference only; borrow warm fibrous ivory paper, loose ink edges, colored-pencil shading, dry gouache, and subtle handmade imperfections. Do not copy Image 2's elephant, figures, captions, dialogue, or composition.

Primary request: preserve the horizontal quality leaderboard from Image 1 as the same chart, but transform its dark flat SVG surface into a sophisticated hand-rendered editorial chart. Use warm paper instead of the dark background; hand-ruled graphite grid lines; slightly imperfect ink typography; gold, cyan, and coral bars painted with dry gouache and colored-pencil edge texture; subtle paper grain throughout. The result should feel like a carefully art-directed magazine infographic made by an illustrator, while remaining as clear and accurate as the original.

Content invariants: preserve every bar's exact length, order, baseline, axis scale, grid position, label placement, hierarchy, counterfactual dashed treatment, and score. Fable 93.13 Passed; hypothetical Grok-if-merged 85.63; Sol 84.38 Passed; official Grok 68.13 Incomplete. The dashed coral outline must remain visibly hypothetical and must not look like an official result.
Text invariants: preserve every original word, number, date, punctuation mark, and footer sentence exactly; no paraphrasing, spelling changes, omissions, additions, pseudo-text, logos, or watermark. Keep all text legible at article width.
Color mapping: Fable gold; Sol cyan; Grok coral; neutral text graphite and muted slate
Composition/framing: exactly the same 16:9 chart composition and information density as Image 1; no new illustration, people, objects, icons, shadows, borders, or decorative frame
Avoid: changing data, changing bar lengths, moving labels, dark dashboard styling, glossy gradients, photorealism, 3D, neon, childish doodles, copied reference content, illegible text, extra numbers, watermark
```

## Speed × quality × test depth

```text
Use case: style-transfer
Asset type: 16:9 editorial scatter plot for a long-form technology article on X
Input images: Image 1 is the chart edit target and sole authority for all data, text, bubble positions, bubble areas, axes, geometry, annotations, and meaning. Image 2 is a style reference only; borrow warm fibrous ivory paper, confident black-ink linework, colored-pencil shading, dry gouache, and subtle human imperfections. Do not copy Image 2's elephant, figures, captions, dialogue, or composition.

Primary request: preserve Image 1 as the same speed × quality × test-depth scatter plot, but transform its flat dark SVG surface into a sophisticated hand-rendered magazine data visualization. Use warm paper; hand-ruled graphite grid and axes; crisp hand-inked labels; gold, cyan, and coral bubbles painted with dry gouache and lightly modeled colored-pencil texture. Preserve the dotted coral counterfactual arrow and outlined bubble. The result should feel illustrator-made yet analytically precise.

Data invariants: preserve every original axis limit, tick, bubble center, relative bubble area, annotation placement, and data value. Grok is at 62.47 focused minutes, 68.13 official quality, 36 tests; its counterfactual rises vertically to 85.63 at the same time and test count. Sol is at 131.02 minutes, 84.38, 52 tests. Fable is at 140 minutes, 93.13, 111 tests. Lower minutes means faster. Do not change or round any value.
Text invariants: preserve every original word, number, multiplication sign, punctuation mark, subtitle, axis label, annotation, and footer sentence exactly; no paraphrasing, spelling changes, omissions, additions, pseudo-text, logos, or watermark. Keep all text readable at article width.
Color mapping: Fable gold; Sol cyan; Grok coral; graphite and muted slate for neutral chart marks
Composition/framing: exactly the same 16:9 composition, chart rectangle, whitespace, and information hierarchy as Image 1; no people, objects, illustrations, border, or decorative frame
Avoid: changing data, moving bubbles, changing bubble size, changing axes, removing counterfactual, dark dashboard styling, glossy 3D spheres, photorealism, neon, childish doodles, copied reference content, illegible text, extra numbers, watermark
```

## Test-suite depth

```text
Use case: style-transfer
Asset type: 16:9 editorial stacked-bar chart for a long-form technology article on X
Input images: Image 1 is the chart edit target and sole authority for data, text, bar geometry, proportions, legend, hierarchy, and meaning. Image 2 is a style reference only; borrow its warm fibrous ivory paper, loose black-ink edges, colored-pencil fill, dry gouache, and restrained handmade imperfections. Do not copy Image 2's elephant, figures, captions, dialogue, or composition.

Primary request: keep Image 1 as exactly the same test-suite-depth stacked horizontal bar chart, while replacing the flat dark SVG styling with a sophisticated hand-rendered editorial data-visualization treatment. Use warm paper; hand-ruled graphite grid; crisp hand-lettering; blue automated-test segments painted with dense cobalt/cornflower gouache; gold browser-test segments painted with warm yellow gouache; subtle colored-pencil edge variation. Preserve the clean statistical readability.

Data invariants: preserve the exact bar lengths and segment proportions. Fable: 96 automated + 15 browser = 111. Sol: 42 automated + 10 browser = 52. Grok: 34 automated + 2 browser = 36. Preserve the 0, 30, 60, 90, 120 scale and every label position. A merge does not add tests.
Text invariants: preserve every original word, number, date, plus sign, punctuation mark, legend label, subtitle, and footer sentence exactly; no paraphrasing, spelling changes, omissions, additions, pseudo-text, logos, or watermark. Keep all text legible at article width.
Composition/framing: exactly the same 16:9 chart composition, information hierarchy, whitespace, legend, and three horizontal lanes as Image 1; no new illustrations, people, objects, border, or decorative frame
Avoid: changing any count, changing bar proportions, swapping colors, moving labels, dark dashboard styling, glossy gradients, photorealism, 3D, neon, childish doodles, copied reference content, illegible text, extra numbers, watermark
```

## Release path

```text
Use case: style-transfer
Asset type: 16:9 editorial release-path diagram for a long-form technology article on X
Input images: Image 1 is the diagram edit target and sole authority for text, topology, sequence, lane geometry, statuses, icons, annotations, and meaning. Image 2 is a style reference only; borrow its warm fibrous ivory paper, hand-drawn black-ink contours, colored-pencil shading, dry gouache, and subtle human imperfections. Do not copy Image 2's elephant, figures, captions, dialogue, or composition.

Primary request: preserve Image 1 as the same three-lane terminal-delivery diagram, but transform its flat dark SVG styling into a sophisticated hand-rendered editorial diagram. Use warm paper; hand-ruled graphite lane lines; small ink-and-gouache milestone circles; gold Fable, cyan Sol, and coral Grok marks; a tactile hand-drawn coral blocked merge gate; and a graceful dashed coral detour toward the wrong PR-head production endpoint. Keep the process logic immediately scannable and exact.

Structural invariants: preserve the five columns and their order: BUILD, PR HEAD GREEN, MERGE, POST-MERGE CI, PRODUCTION SHA. Preserve all Fable and Sol checks through the merged SHA. Preserve Grok's checks through PR head, its blocked merge, unavailable post-merge CI, dashed detour, and PR-head-served endpoint. Do not imply that Grok merged or passed.
Text invariants: preserve every original word, label, status, annotation, punctuation mark, headline, subtitle, and footer sentence exactly; no paraphrasing, spelling changes, omissions, additions, pseudo-text, logos, or watermark. Keep all text legible at article width.
Color mapping: Fable gold; Sol cyan; Grok coral; graphite and muted slate for neutral chart elements
Composition/framing: exactly the same 16:9 hierarchy, three lanes, five columns, whitespace, and footer placement as Image 1; no new people, scenes, objects, border, or decorative frame
Avoid: changing the release sequence, moving endpoints, inventing a merge, removing the dashed detour, dark dashboard styling, glossy gradients, photorealism, 3D, neon, childish doodles, copied reference content, illegible text, extra labels, watermark
```

## Merge counterfactual

```text
Use case: style-transfer
Asset type: 16:9 editorial score-delta infographic for a long-form technology article on X
Input images: Image 1 is the infographic edit target and sole authority for data, text, segment geometry, scale, hierarchy, annotations, and meaning. Image 2 is a style reference only; borrow its warm fibrous ivory paper, hand-drawn black-ink contours, colored-pencil shading, dry gouache, and subtle human imperfections. Do not copy Image 2's elephant, figures, captions, dialogue, or composition.

Primary request: preserve Image 1 as the same merge-counterfactual score graphic, but replace its flat dark SVG styling with a sophisticated hand-rendered editorial infographic. Use warm paper; hand-ruled graphite scale; a coral official-score segment painted in dry gouache; four visibly separate added-score segments in gold, pale yellow, pale cyan, and cyan; a hand-drawn dashed marker at 85.63; and four tidy ink-and-wash contribution cards underneath. Keep the quantitative relationship and official-versus-hypothetical distinction unambiguous.

Data invariants: preserve the official score 68.13, the hypothetical if-merged score 85.63, the total delta 17.50, and the exact additions: SHIPPED + COMPLETE +10.00, SECURITY +1.87, DEPLOY +1.88, SPEED CAP +3.75. Preserve the 0, 25, 50, 75, 100 scale, segment widths, marker position, and all labels. The official verdict remains Incomplete.
Text invariants: preserve every original word, number, plus sign, punctuation mark, capitalization, headline, subtitle, card label, and footer sentence exactly; no paraphrasing, spelling changes, omissions, additions, pseudo-text, logos, or watermark. Keep all text legible at article width.
Composition/framing: exactly the same 16:9 hierarchy, score bar, four contribution cards, whitespace, and footer placement as Image 1; no new people, objects, illustrations, border, or decorative frame
Avoid: changing any score, changing segment widths, implying an official 85.63 verdict, dark dashboard styling, glossy gradients, photorealism, 3D, neon, childish doodles, copied reference content, illegible text, extra numbers, watermark
```
