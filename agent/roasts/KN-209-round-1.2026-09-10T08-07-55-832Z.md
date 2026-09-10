1. No, not reliably. MUI adds `aria-describedby` only after the tooltip opens. Focus happens first, with MUI’s default 100 ms delay; many screen readers announce the focused control before that later ARIA mutation and do not re-announce it. The story waits for the tooltip, so it only proves the post-delay state.

2. No. The accessible-name assertion is en-US only. The Persian catalog entry exists, but no story asserts the Persian computed name. RTL itself does not alter ARIA name computation, but this gap can hide a broken locale/provider path.

3. Do not refuse or development-warn here. A wrapper cannot reliably determine a child’s computed accessible name, which may come from text, `aria-labelledby`, a native label, or a custom component. The documented requirement is the appropriate contract; enforcement belongs in consuming-control tests or an accessibility lint rule.

Findings:

- major — [Tooltip.tsx:41](D:\Kar\Gandom\KarNama\apps\web\src\shared\tooltip\Tooltip.tsx:41), [Tooltip.stories.tsx:131](D:\Kar\Gandom\KarNama\apps\web\src\shared\tooltip\Tooltip.stories.tsx:131): The fix does not reliably expose the tooltip as a description to a keyboard screen-reader user. `title` is always converted into a React element, so MUI sees a non-string title and, with `describeChild`, supplies `aria-describedby` only once `open` is true. The story waits for that state at line 134, masking the focus-to-open interval. On initial focus, the control has its name but no description. Use an immediately available description mechanism if the tooltip text must be announced, and test the focus-time behavior rather than only the delayed-open state.

- minor — [Tooltip.stories.tsx:129](D:\Kar\Gandom\KarNama\apps\web\src\shared\tooltip\Tooltip.stories.tsx:129): The only computed-name assertion pins en-US. The Persian translation is checked as catalog text, not as the rendered button’s accessible name. Add a fa-IR story/assertion for `حذف وضعیت`; RTL is not expected to change naming, but the runtime locale path still needs coverage.

I ran `node agent/scripts/verify/KN-209.mjs`; it could not complete in this read-only sandbox because Vitest cannot create `.vite-temp` files and the verifier’s deliberate mutation cannot write `Tooltip.tsx`. That is not a defect in the change.

VERDICT
score: 7.2
criticals: 0
one-line: Make the tooltip description available at initial keyboard focus, not only after MUI’s delayed open state