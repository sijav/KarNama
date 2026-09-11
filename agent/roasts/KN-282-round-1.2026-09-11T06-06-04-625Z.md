1. Forced colours: selected and unselected are visually distinguishable now, selected has no pseudo-border while unselected retains a solid one. This is an improvement over the prior implementation, whose two laid-out borders would both be system-recoloured. `aria-pressed` still communicates selected state to assistive technology at [FilterChip.tsx:49](D:\Kar\Gandom\KarNama\apps\web\src\shared\filter-chip\FilterChip.tsx:49).

2. The overlapping shadow and pseudo-border should not produce a seam: both use the same outer box, inherited radius, and pressed colour. But this is not proved. The verifier only runs at deviceScaleFactor 1 and inspects computed styles, not normal-colour pixels at 1.25, 1.5, or 2.

Findings:

- critical — A selected chip gains an edge as soon as it is pressed. `&:active::before` unconditionally changes the selected variant’s `borderStyle` from `none` to `solid` and adds the focus-colour border. That is an edge implementation for the selected state, exactly what the exit condition says KN-279 owns. The verifier explicitly blesses this invalid state by requiring a solid 1px pseudo-border for `selected + pressed`. Reproduce: render `selected={true}`, hold the pointer down. [FilterChip.tsx:90](D:\Kar\Gandom\KarNama\apps\web\src\shared\filter-chip\FilterChip.tsx:90), [FilterChip.tsx:100](D:\Kar\Gandom\KarNama\apps\web\src\shared\filter-chip\FilterChip.tsx:100), [KN-282.mjs:148](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-282.mjs:148), [KN-282.mjs:196](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-282.mjs:196).

- minor — The added untracked task document is placed beside shipped component code instead of under `shared/story-docs`, contrary to the repository’s documentation rule. It is also stale: it claims a Pressed story was added, although no such export exists. [#KN-282…md:64](D:\Kar\Gandom\KarNama\apps\web\src\shared\filter-chip\#KN-282%20-%20The%20Filter%20Chip's%20text%20sits%20at%2013%20where%20the%20file%20draws%2012.md:64), [#KN-282…md:72](D:\Kar\Gandom\KarNama\apps\web\src\shared\filter-chip\#KN-282%20-%20The%20Filter%20Chip's%20text%20sits%20at%2013%20where%20the%20file%20draws%2012.md:72).

I could not run the build-backed verifier or Storybook tests in this read-only sandbox because Vite and the verifier must write temporary/build files.

VERDICT
score: 5.5
criticals: 1
one-line: Do not let `:active` restore a border on `selected`; KN-279 owns that selected edge.