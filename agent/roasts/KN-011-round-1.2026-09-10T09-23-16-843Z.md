1. Focus: vertical padding is not reduced, but the field remains 44px because it is `border-box`; MUI centers the input, so the baseline stays centered. The test does not prove this, though: it asserts only the input’s `left` coordinate, not its vertical position. [Input.stories.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.stories.tsx:84)

2. Error plus focus is an invention. The design contract lists six standalone variants, not an error-focus composite. The file explicitly renders that composite as a 2px red border, and no story exercises or validates it. [Input.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.tsx:76)

3. Yes, every `Input`, including one with no helper or error, reserves a 22px line. That is required by this task’s stated exit condition. It would be wrong for a dense search/filter control, but those should use their separate components, not this form input.

Findings:

- major — A real validation sequence produces an unapproved state: render with `error`, then click or tab into the field. The border changes from the Figma Error variant’s ordinary border to a 2px red border. This combination is neither specified by the six Figma states nor covered by a story, so “matches Figma exactly” is not established. [Input.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.tsx:76)

- major — Most stories have dead Controls panels, directly violating the repository’s “stories render from args” rule. `Default` forwards only `onChange`; `Filled`, `Focus`, `WithError`, `Disabled`, `Hover`, and others ignore args entirely. Changing `label`, `value`, `placeholder`, `helperText`, `error`, or `disabled` in Storybook will not drive the canvas. [Input.stories.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.stories.tsx:58) [Input.stories.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.stories.tsx:72)

- minor — The claimed focus stability test proves only horizontal stability. It records and compares `.left`, so a vertical baseline shift would pass unnoticed. [Input.stories.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.stories.tsx:84)

- minor — The new component violates the import and barrel conventions: it uses parent-relative imports, and `shared/input` has two source files but no `index.ts` barrel. [Input.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.tsx:3) [Input.stories.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.stories.tsx:5)

`node agent/scripts/todo.mjs validate` reports the board is valid. The task verifier could not run its mutation suite in this read-only sandbox because it intentionally writes both Vite temporary config and `Input.tsx`; that is not a finding against the change.

VERDICT
score: 5.4
criticals: 0
one-line: Define and test the error-plus-focus state instead of inventing a 2px red border.