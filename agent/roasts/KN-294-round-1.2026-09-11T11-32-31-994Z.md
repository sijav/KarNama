1. Other states: the ring itself is safe for hover, selected, long labels, and RTL. It is an `::after` drawn after the chip’s content, so it paints above the element’s inset active shadow. That means the claim that pressed focus is only 2.5px wide is false: active supplies blue from 0–1.5px and the focus pseudo-element still supplies its full 1–4px border. The combined visible blue band is 4px, not 2.5px. Long labels only increase the available area, and direction does not alter the geometry.

2. The story’s band calculation matches Chromium’s effective rounded geometry: `border-radius: inherit` is scaled on the inset pseudo-element, yielding outer radius `r - inset` and inner radius `r - inset - borderWidth`. But the comparison baseline is not the area of a two-pixel rounded band. `4W + 4H - (16 - 4π)r` is twice the rounded-rectangle perimeter. The actual two-pixel band area is that value minus `4π`. For a 32px pill with `r = 16`, it is `4W + 60.5`, not `4W + 73.1`.

Findings:

- major — [DESIGN.md:287](D:/Kar/Gandom/KarNama/DESIGN.md:287) and [FilterChip.stories.tsx:243](D:/Kar/Gandom/KarNama/apps/web/src/shared/filter-chip/FilterChip.stories.tsx:243) misstate WCAG’s required area. This is not cosmetic arithmetic: it is the documented justification for requiring a 3px ring and the test’s acceptance threshold. A genuine 2px ring from the outer edge already equals the actual two-pixel rounded-band area, while the documentation incorrectly calls it short by about 12.6px². The current 3px implementation still clears the real requirement, but the contract and test need to name the correct measure rather than a stricter, mislabeled perimeter approximation.

- minor — [DESIGN.md:299](D:/Kar/Gandom/KarNama/DESIGN.md:299) says the active inset shadow covers the focus ring’s outer half-pixel and reduces focused pressed appearance to 2.5px. It is painted below `::after`; the focus border remains visible on top at [FilterChip.tsx:114](D:/Kar/Gandom/KarNama/apps/web/src/shared/filter-chip/FilterChip.tsx:114). Correct the state description and its `5W + 48` area claim.

I could not complete the verifier because this read-only sandbox denies its required temporary build directory, as documented; that is not a finding.

VERDICT
score: 8.1
criticals: 0
one-line: Correct the WCAG rounded-band formula and the resulting false claim that two pixels cannot satisfy it.