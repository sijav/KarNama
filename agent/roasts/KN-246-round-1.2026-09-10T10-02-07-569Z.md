1. The key is an appropriate fix for this Storybook-only uncontrolled-input problem. Changing a default from `a → b → a` remounts each time; `undefined → ''` also changes key identity. An unrelated arg update does not remount, so typed text and focus remain. A real default change necessarily resets typed text and focus, which is the intended “start over” behavior. If Storybook re-ran `Typing` after such a remount, its fixed `toHaveValue('42')` expectation could fail, but arg updates do not normally rerun play functions.

2. `value` is the same reviewer-facing Controls failure class, but with controlled-input mechanics: set `value` in Controls, type, and the field remains at that arg because `onChange: fn()` records but does not update args. The verifier does not test this sequence. It does cover every currently enabled story for `defaultValue`, including the likely review targets (`FromArgs`, `Filled`, `Focus`, `Disabled`, and `Typing`), but that breadth does not prove those stories’ other controls are valid.

Findings:

- major — The eight enabled stories still expose a `value` control that freezes the field after a reviewer sets it. For example, in `Typing`, set `value` to `fixed` in Controls, then type `42`: `InputBase` is controlled by `value`, while the metadata’s `onChange: fn()` only records the callback and never changes the story args. The visible field does not accept the typing, yet the Controls panel continues to present it as interactive. This is explicitly outside the verifier’s update, which changes only `defaultValue` and `helperText`. Either bind controlled values through Storybook args or exclude/disable `value` on interaction stories. [Input.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\input\Input.stories.tsx:72) [Input.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\input\Input.stories.tsx:76) [KN-246.mjs](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-246.mjs:109)

I ran `node agent/scripts/verify/KN-246.mjs`; it could not complete in this read-only sandbox because it creates a temp build and deliberately rewrites the story for its mutation check. That is an environment restriction, not a finding.

VERDICT
score: 7.0
criticals: 0
one-line: make the exposed `value` control actually update controlled-story state, or remove it from stories whose canvas cannot honour it