1. No. The focused-invalid state is only a one-pixel-thicker red border, inset within the same fixed outer box. That is not a reliable focus cue for low-vision users. Keep the error border, but add a distinct focus indicator rather than replacing red with blue.

2. Unknown from this repository. The committed Figma capture shows the desktop Error screen containing only an opaque Add/Edit instance, not its expanded fields, and does not capture node `166:82`. `DESIGN.md` labels that node’s Error step but provides no field-level state evidence. You cannot claim it does or does not show a different focused-invalid treatment without inspecting Figma live.

Findings:

- critical — The Focus story still does not assert the position of the text. It compares the focused `<input>` element’s rectangle, not its rendered glyphs. A focused rule that changes only the input’s font family can move the glyph baseline while retaining the same input `left` and `top`; this test passes. The exit condition explicitly requires the text to retain both positions. [Input.stories.tsx](/D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.stories.tsx:84) [Input.stories.tsx](/D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.stories.tsx:93)

- critical — Tabbing into an invalid field produces no independently recognizable focus treatment: it changes from a 1px red error border to a 2px red error border. The documented reason, “one pixel would leave no sign of focus,” does not establish that one additional same-colour pixel is visible to the users this state must support. The component needs a separate focus cue while preserving the red error state. [Input.tsx](/D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.tsx:76) [DESIGN.md](/D:/Kar/Gandom/KarNama/DESIGN.md:192)

Verification note: `node agent/scripts/verify/KN-241.mjs` could not complete in this read-only sandbox. Vite could not create `.vite-temp`, and the verifier’s intentional source mutations were denied with `EPERM`; that is environmental, not a defect in the change.

VERDICT
score: 3.0
criticals: 2
one-line: Add a genuinely distinct focused-invalid indicator, then test actual text placement rather than the input element’s box