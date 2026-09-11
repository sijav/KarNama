1. Yes. The add `ButtonBase` is incorrectly owned by the `radiogroup`; move it outside the group while keeping both in the same wrapping layout container. Native radio arrow behavior still works because the radios are native inputs, but screen readers encounter an unrelated action as part of the choice set.

2. No. `aria-haspopup="dialog"` is false: the opened `Popover` is not given `role="dialog"` or a dialog name. MUI autofocuses the popover surface, not the selected radio, so focus is technically inside but lands on an unnamed non-interactive container.

3. The ring cascade itself is right: selected beats hover, keyboard focus overrides to 3px, and transparent is invisible in dark mode. Those latter cases are not covered by the stories.

4. No doubling: `aria-label` replaces the button’s descendant text in its accessible name. The caret is correctly decorative because `Icon` defaults to `aria-hidden`.

Findings:

- major — The “New status” action is a child of the radio group, even though it is not a radio option. This gives the group an unrelated interactive descendant and makes its semantics misleading to assistive technology. Put the group and add action in a shared visual wrapper, but make them semantic siblings. [StatusPicker.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\status-picker\StatusPicker.tsx:86) [StatusPicker.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\status-picker\StatusPicker.tsx:113)

- major — The control claims it opens a dialog but creates an unnamed popover with no dialog role, and supplies no initial focus target for the chosen radio. On opening, focus lands on MUI’s paper surface; a keyboard or screen-reader user must tab before reaching the active choice. Either make this a properly named dialog and focus the selected radio, or advertise and implement it as the appropriate non-dialog popup. [StatusControl.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\status-picker\StatusControl.tsx:46) [StatusControl.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\status-picker\StatusControl.tsx:97)

- major — `StatusChoice` is exported as a component but has no independent Storybook story or controllable `selected` state. Its three required Figma states are only indirectly exercised through `StatusPicker`, contrary to the repository’s component-before-screen rule. [StatusPicker.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\status-picker\StatusPicker.tsx:37) [index.ts](D:\Kar\Gandom\KarNama\apps\web\src\shared\status-picker\index.ts:2)

Static lint and TypeScript checks pass. The browser-story test command could not run because this read-only sandbox prevents Vite from creating its temporary config artifact.

VERDICT
score: 6.4
criticals: 0
one-line: Remove the add action from the radiogroup and fix the popover’s false dialog semantics and initial focus.