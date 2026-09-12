1. No reader edit is discarded by the follow rule. After Save, the current callers close the modal; if a future caller keeps it open, a refreshed same-id record will intentionally not replace the saved values.

2. No. The add branch cannot become an edit at the TypeScript call site without supplying edit’s `recordId` and `initial`. Runtime JavaScript can always evade types, but this does not reopen the typed-call-site hole.

3. No remount occurs. Both branches occupy the same reconciliation slot and render `ContactModal` without keys, so React preserves the instance. The component detects the `mode` change and intentionally clears form state; the input DOM and focus should remain mounted.

Findings:

- **critical** — The new stories do not prove the two handoffs the task claims. `Loading` starts with `record` undefined, so `TheRecordArrivesAfterItsId` never renders `recordId=B` alongside stale values for A; it only tests B with no values. `TheRecordArrivesAfterOpening` again changes the id before delivering the record, so it does not test an already-open modal whose selected id remains unchanged while its record arrives. A regression that accepts stale values unconditionally is therefore untested, and the stated exit condition is not met. [ContactModal.stories.tsx:268](D:/Kar/Gandom/KarNama/apps/web/src/shared/modal/ContactModal.stories.tsx:268), [ContactModal.stories.tsx:305](D:/Kar/Gandom/KarNama/apps/web/src/shared/modal/ContactModal.stories.tsx:305), [ContactModal.stories.tsx:331](D:/Kar/Gandom/KarNama/apps/web/src/shared/modal/ContactModal.stories.tsx:331)

- **major** — The change adds prohibited documentation prose as JSDoc in a `.tsx` file, despite the repository rule requiring component-use documentation in `shared/story-docs`. [ContactModal.tsx:29](D:/Kar/Gandom/KarNama/apps/web/src/shared/modal/ContactModal.tsx:29), [ContactModal.tsx:53](D:/Kar/Gandom/KarNama/apps/web/src/shared/modal/ContactModal.tsx:53)

- **minor** — The new task narrative is placed beside the component rather than under `src/shared/story-docs/{en,fa}`, bypassing the bilingual docs guard. [#KN-386 - The contact modal's record handoff.md:1](</D:/Kar/Gandom/KarNama/apps/web/src/shared/modal/#KN-386 - The contact modal's record handoff.md:1>)

`tsc --noEmit` and ESLint both pass in `apps/web`; board validation also passes.

VERDICT
score: 5.5
criticals: 1
one-line: Make the stories actually render stale A data with B’s id, and a late record for an unchanged already-open id.