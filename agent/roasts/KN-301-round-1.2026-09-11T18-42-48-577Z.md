1. `next.click()` produces one React `onChange` for a different enabled radio in the current picker. It does dispatch a bubbling `click`, though, including through React’s portal ancestry. The current `StatusMenu` path has no ancestor click handler to accidentally activate, so I found no present flow bug there.

2. No. In Persian, `ArrowLeft` from `custom-4` goes to `new`, which is on the right of the next row. That directly violates “move to the swatch that sits in that direction.” Disabled radios do not create an index mismatch, because the query and index use the same filtered list; a non-radio target is left native.

3. In the current picker, it should not differ: flex layout and the handler both use the `RadioGroup`’s computed `direction`. It could differ only if styling changed the group’s direction independently of its flex layout, or moved swatches outside that group.

Findings

- critical — The row-end behavior is physically backwards. With Persian RTL layout, focus `custom-4`, then press ArrowLeft: [`acrossTo`](D:/Kar/Gandom/KarNama/apps/web/src/theme/sides.ts:28) selects the next DOM radio, `new`, despite that swatch being visually rightward on the second row. The same issue occurs symmetrically in English at the right edge. The stories start from `interview`, a middle-of-row item, so they never exercise the failing sequence. [`ColorPicker.stories.tsx`](D:/Kar/Gandom/KarNama/apps/web/src/shared/color-picker/ColorPicker.stories.tsx:247) The claimed directional keyboard contract and therefore KN-301’s exit condition are not met at row boundaries. Do not wrap horizontal movement by flat DOM order; stop at the horizontal edge or define and test a genuinely spatial grid policy.

VERDICT
score: 4.5
criticals: 1
one-line: Fix flat-DOM wrapping, which sends a left/right key to a swatch on the opposite side of the wrapped row.