1. **Glyph:** No. A disabled checked or indeterminate glyph is still explicitly stroked with `text/on-accent` in [Checkbox.tsx](/D:/Kar/Gandom/KarNama/apps/web/src/shared/checkbox/Checkbox.tsx:93) and [Checkbox.tsx](/D:/Kar/Gandom/KarNama/apps/web/src/shared/checkbox/Checkbox.tsx:105), not `GrayText`. SVG defaults to `forced-color-adjust: preserve-parent-color`; because `stroke` is explicitly set, it preserves that author colour. In a disabled checked state, the mark can therefore remain the enabled white mark, or become illegible against the forced background. Explicitly set the disabled SVG stroke to `GrayText` under forced colours and test disabled checked and disabled indeterminate. The forced-colour spec explicitly calls out SVG stroke and its special SVG adjustment rule. [CSS Color Adjustment Level 1](https://www.w3.org/TR/css-color-adjust-1/)

2. **Custom property:** Yes, this use is sound. Custom properties retain tokens, then `var()` substitutes `GrayText`/`ButtonBorder` into `border-color`, where a system colour is valid. Reading the custom property is appropriately a semantic assertion, while the pixel probe verifies paint. This is not an all-engine defect; engines without forced-colours support simply will not activate the media query. [MDN system colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/system-color)

Findings:

- **critical** — Disabled checked and indeterminate controls remain broken. `Frame` correctly changes only the edge at [Checkbox.tsx:81](/D:/Kar/Gandom/KarNama/apps/web/src/shared/checkbox/Checkbox.tsx:81), while the tick and dash retain the enabled accent glyph at [Checkbox.tsx:93](/D:/Kar/Gandom/KarNama/apps/web/src/shared/checkbox/Checkbox.tsx:93) and [Checkbox.tsx:105](/D:/Kar/Gandom/KarNama/apps/web/src/shared/checkbox/Checkbox.tsx:105). Sequence: render `disabled checked`, enable forced colours. The border is GrayText but the glyph is not disabled-colour-aware, defeating the stated accessibility outcome.

- **major** — The verifier cannot catch that failure. Its sole disabled story is `shared-checkbox--disabled`, which is unchecked, at [KN-288.mjs:35-40](/D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-288.mjs:35), and it samples only the frame edge at [KN-288.mjs:104-114](/D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-288.mjs:104). A regression that leaves disabled checked/dash glyphs enabled-coloured passes every check and mutation.

- **major** — The new verifier violates the repository’s no-shell verifier rule. It invokes Storybook and Vitest through `shell: true` at [KN-288.mjs:56](/D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-288.mjs:56) and [KN-288.mjs:132](/D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-288.mjs:132). Use executable plus argument arrays.

- **minor** — The new component-adjacent markdown is in the wrong location and contradicts the implemented verifier. [#KN-288…md:25-36](/D:/Kar/Gandom/KarNama/apps/web/src/shared/checkbox/#KN-288%20-%20Under%20forced%20colours%20a%20disabled%20Checkbox%20draws%20the%20enabled%20edge.md:25) says the colours “must differ” and claims a computed-colour fallback, both contradicted by the later text and verifier. Repository documentation belongs under `shared/story-docs/{en,fa}`, not beside source.

I ran `node agent/scripts/verify/KN-288.mjs`; it could only perform the DESIGN assertion because this review sandbox prohibits its intentional temporary-build and source-mutation writes. That is environmental, not a finding.

VERDICT
score: 4.0
criticals: 1
one-line: Make disabled checked and indeterminate SVG glyphs explicitly GrayText under forced colours, and prove them in the production verifier.