1. `::before` with `pointer-events: none` should not block edge clicks or drag selection, and it should sit below the input’s autofill paint. But none of that is exercised. Fractional DPR rendering is also untested, so the claimed exact edge geometry at 1.25/1.5 is unproven.

2. The moved anchors are mechanically plausible. KN-011 now mutates the actual focused pseudo-edge; KN-241/243/248 insert into the focused root; KN-244 changes focused-invalid padding. They still target their stated behaviours.

3. No, the bordered-component check is not complete as a verifier. The current source scan shows only Input, Checkbox, and Filter Chip use CSS borders, with Tooltip and Status Chip not using one. But `KN-266.mjs` hard-codes that list, so it cannot discover a component whose Figma stroke is absent from code, or a future/new component with a border.

Findings:

- critical — The new assertions do not measure text position. `textInsets` subtracts the `<input>` element’s bounding rect from the root’s rect, so it measures the input content box, not its rendered text/caret. Add `& input: { textIndent: '1px' }` in [Input.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\input\Input.tsx:74): every KN-266 inset check remains `[16, 16]`, including the production-build check, while the visible text moves to 17px. Focus also passes because it only checks that the already-wrong layout remains unchanged. This directly violates the exit condition. [Input.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\input\Input.stories.tsx:140), [KN-266.mjs](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-266.mjs:100)

- major — The DPR concern the author explicitly raises is not tested. The verifier creates pages without `deviceScaleFactor`, so it only observes the default DPR and checks computed pseudo-element widths, not rasterized edge shape or thickness at 1.25/1.5. A pseudo-element’s rounded border may be visually different at fractional rasterization even when computed styles read `1px` and `2px`. [KN-266.mjs](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-266.mjs:146)

- major — The “other bordered components” check is a fixed allowlist, not an inventory. It only inspects Tooltip and Status Chip after assuming Checkbox and Filter Chip are the complete positive set. A Figma-stroked component that currently draws no border passes undetected, exactly one of the failure modes this task was required to check. [KN-266.mjs](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-266.mjs:203)

- minor — The untracked 102-line task plan is documentation prose beside production source, rather than Storybook documentation under `shared/story-docs/{en,fa}`. It also has no Persian counterpart. [#KN-266 - The Input's border takes layout space, so its text sits a pixel inward of the file.md](D:\Kar\Gandom\KarNama\apps\web\src\shared\input\#KN-266%20-%20The%20Input%27s%20border%20takes%20layout%20space%2C%20so%20its%20text%20sits%20a%20pixel%20inward%20of%20the%20file.md:1)

I attempted the supplied verifier and KN-011 verifier. Both are blocked in this read-only sandbox because they intentionally mutate source/build temporary files; that limitation does not affect the static findings above.

VERDICT
score: 4.0
criticals: 1
one-line: measure the rendered text or caret position, not the input element box, because a static text indent currently defeats every KN-266 check