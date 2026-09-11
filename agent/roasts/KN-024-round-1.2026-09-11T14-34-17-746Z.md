1. The name/value split is correct: `aria-labelledby` names the combobox from the prefix, while the visible order is its value. But the change will be announced twice: MUI returns focus to the combobox with its new value, then the `role="status"` repeats “Sorted by …”.

2. The `options.tsx` extraction preserves the Select’s rendered rows and menu styles. I found no behavioural regression there.

3. The RTL/LTR end anchoring is correct in ordinary layout. At a viewport edge, MUI Popover collision handling may shift the menu to keep it onscreen, so it is not guaranteed to remain exactly end-aligned. There is no RTL or edge-position test.

4. Both status translations are correct. The status should clear after a safe announcement cycle; otherwise it remains stale across language changes and the same text cannot be re-announced through a DOM change.

Findings:

- major — The selection is announced twice for screen-reader users. Selecting “Oldest” changes the focused combobox’s accessible value, which MUI restores focus to, then the live region announces “Sorted by Oldest.” This violates the stated “once, not twice” requirement. [SortControl.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/sort-control/SortControl.tsx:71)

- minor — `ChangedByKeyboard` does not test a real controlled selection update. The story passes `value="newest"` and an `fn()` callback, so after Enter the closed control still renders “Newest”; it only asserts the callback and live-region text saying “Oldest.” The claimed keyboard-change verification therefore misses the visible current-sort result. [SortControl.stories.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/sort-control/SortControl.stories.tsx:122)

Focused ESLint and TypeScript checks passed. The Storybook test command could not start because this review sandbox blocks Vite from writing its temporary config file.

VERDICT
score: 6.4
criticals: 0
one-line: Remove the redundant live-region announcement or prevent the focused combobox value from being announced twice.