1. `recordId` should not be optional in Edit. As written, an Edit caller may omit it and switch `initial` from contact A to contact B while open; the form retains A’s typed values because both identities are `undefined`. Make Edit a discriminated prop variant requiring `recordId` and `initial` (and likely `onDelete`), and use an explicit loading boundary if the record is not ready.

2. Yes. If `recordId` changes to B before `initial` changes from A to B, the reset captures A and marks B as seen; the later B record is ignored. Reopening with the same id does reset from whatever `initial` exists in that opening render, so a synchronously fresh server record works. But an asynchronous record arriving after opening leaves the form blank or stale indefinitely.

Findings:

- critical — Edit mode permits omission of the identity that now defines a record change. A valid consumer can render Edit for contact A, type a change, then switch to contact B without closing while still omitting `recordId`; both renders have `recordId === undefined`, so lines 66–69 do not reset and saving writes A’s form into B’s edit flow. This regresses the prior object-identity behavior for every caller not updated to the new optional prop, including the existing `Edit` story. Require `recordId` for Edit rather than documenting an optional correctness requirement. [ContactModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ContactModal.tsx:21)

- critical — The reset can permanently capture the wrong record when identity and data arrive in separate renders. With the modal open on A, render `{ recordId: 'B', initial: A }`; lines 66–69 reset to A and record B as seen. When the query then renders `{ recordId: 'B', initial: B }`, neither comparison changes, so the user continues to see A and may save it as B. The same logic opens an async Edit as empty when `initial` is initially absent, then ignores the loaded record. The story only covers simultaneous stable id/data and does not exercise either sequence. [ContactModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ContactModal.tsx:65)

`node agent/scripts/todo.mjs validate`, TypeScript, and ESLint pass.

VERDICT
score: 3.0
criticals: 2
one-line: Make Edit’s record identity mandatory and define an atomic/loading-safe record handoff so `recordId` cannot reset from stale or absent `initial`.