1. Geometry: at 80px, the current circular, equal-corner design is correct: it yields about 630.5px² against a 496px² threshold. The clamp also works below 16px while every inset contour still has positive dimensions. It fails once an inset collapses: at 11px, the ring’s `inset: 6` produces a negative width and therefore a negative “area,” not zero. It is also not a general rounded-corner model: only `borderTopLeftRadius` is read, `parseFloat` discards an elliptical vertical radius, and unequal corners are ignored.

2. Tab order: it does not silently measure the wrong field. If initial focus is elsewhere, or one field was already focused, `expect(box).toHaveFocus()` fails. Once the wide field is proven focused, the next Tab is checked against the narrow field. However, it does not assert that the narrow field’s text remains visibly uncut, only that its layout properties did not change.

Findings:

- critical — The required rendered-pixel proof for an ≤80px field in both light and dark does not exist. `FocusedWhileInvalid` only evaluates the narrow field with the computed geometry model. The only pixel verifier still selects the first `.MuiInputBase-root`, which is the wide field, and its dark cases use the separate full-width `Filled` story. Thus neither a narrow light render nor a narrow dark render is read from pixels, despite this being an explicit exit condition. [Input.stories.tsx:509](D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.stories.tsx:509) [Input.stories.tsx:556](D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.stories.tsx:556) [KN-274.mjs:162](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-274.mjs:162) [KN-274.mjs:189](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-274.mjs:189)

- major — This change breaks KN-244’s existing verifier. Its static check still requires `changed - 4 * (width + height)`, but the story now uses `gained + drawn - 4 * (width + height)`. It will report that the area assertion is missing before any mutation test runs. [KN-244.mjs:78](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-244.mjs:78) [Input.stories.tsx:562](D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.stories.tsx:562)

- minor — `insetArea` is not safe for the claimed general clamp behavior. It clamps radius but not the inset box dimensions, so a contour whose inset exceeds half the field width returns a negative area. It also treats every corner as the same circular top-left corner, so an elliptical radius or different per-corner radii produces the wrong area while still passing. [Input.stories.tsx:488](D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.stories.tsx:488) [Input.stories.tsx:557](D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.stories.tsx:557)

`node agent/scripts/todo.mjs validate` passed. `KN-274.mjs` could not run because this read-only sandbox forbids its temporary build directory.

VERDICT
score: 3.5
criticals: 1
one-line: Add a rendered-pixel narrow-field check in both light and dark, rather than treating the story’s geometry model as that proof.