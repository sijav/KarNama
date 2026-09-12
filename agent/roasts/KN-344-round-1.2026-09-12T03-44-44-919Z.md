1. No. Deleting the third card and landing on the first card of the first column is a backwards, unrelated jump. Preserve position: focus the next surviving card in the same column, then the previous card, then an accessible column/list target or its empty-state action.

2. Yes. Unmounting the `Dialog` while open, including route navigation, bypasses the exit transition, so `onTransitionExited` does not run. The current fallback is also inside the unmounted screen, so it cannot repair focus. Destination-page focus management must own that case.

3. `tabIndex={-1}` does not affect tab order or ordinary click focus, but it makes the generic `Stack` programmatically focusable. When it receives focus, it has no role or accessible name, so a screen reader may announce little or nothing. It is not a meaningful list fallback.

Findings:

- major — Deleting the sole visible record focuses an unnamed generic `Stack`, not a next card, list, heading, or empty-state action. The fallback selector finds no `article button`, then uses `board.current`/`page.current`; neither Stack has list semantics or an accessible name. This is precisely the state where the user most needs a meaningful destination. [JobsScreen.tsx](D:/Kar/Gandom/KarNama/apps/web/src/screens/JobsScreen.tsx:497), [NetworkScreen.tsx](D:/Kar/Gandom/KarNama/apps/web/src/screens/NetworkScreen.tsx:203)

- major — The fallback is not relative to the deleted record. Delete a middle card in a later column: `querySelector('article button')` always selects the first rendered card on the whole board, often an earlier and unrelated record. The requested “next card or list” behavior is not implemented. [JobsScreen.tsx](D:/Kar/Gandom/KarNama/apps/web/src/screens/JobsScreen.tsx:497), [NetworkScreen.tsx](D:/Kar/Gandom/KarNama/apps/web/src/screens/NetworkScreen.tsx:203)

- major — The claimed fallback is skipped if the modal unmounts while open. `onClosed` is only forwarded as MUI’s transition-exit callback, which cannot fire once React removes the Dialog. Browser Back, a route change, or any parent conditional unmount can therefore still restore to a detached opener and leave focus unmanaged. [Modal.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/modal/Modal.tsx:116), [ConfirmModal.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/modal/ConfirmModal.tsx:55)

- minor — The new stories do not assert the fallback target. They accept any focused descendant of the screen, including the unnamed Stack, so they would pass if the selector regressed from “first card button” to the page root. That does not prove the exit condition’s intended destination. [JobsScreen.stories.tsx](D:/Kar/Gandom/KarNama/apps/web/src/screens/JobsScreen.stories.tsx:693), [NetworkScreen.stories.tsx](D:/Kar/Gandom/KarNama/apps/web/src/screens/NetworkScreen.stories.tsx:357)

- minor — New JSDoc documentation prose was added to `.tsx` files, contrary to the repository rule that prop documentation belongs in `story-docs`. [ConfirmModal.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/modal/ConfirmModal.tsx:15), [Modal.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/modal/Modal.tsx:15)

- minor — `Modal.stories.tsx` is not Prettier-formatted. `prettier --check` reports this file. [Modal.stories.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/modal/Modal.stories.tsx:66)

`node agent/scripts/todo.mjs validate` passes. Targeted ESLint and TypeScript checks passed.

VERDICT
score: 4.2
criticals: 0
one-line: Replace the global first-card/root fallback with a position-aware, accessible destination, and assert that exact target in the stories.