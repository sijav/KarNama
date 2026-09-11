1. State machine: late extraction results are correctly dropped by the reading counter. Loading Escape returns to Paste without closing. Error retry and Manual paths work. But a blank `status` is accepted and saved, despite status being required.

2. Focus/accessibility: Loading focuses an unnamed generic `Box`, not the status itself. A screen-reader user can land on a focus target with no announced purpose. Error is exposed via the Input alert and is better handled.

3. Layout: No, it does not match. The documented mobile order requires Company before Job title; the implementation keeps title first. Paste is also knowingly 398px rather than Figma’s 401px.

4. Input/modal compatibility: Existing one-argument Input callbacks remain compatible, and the shared Modal extraction does not show an obvious regression in Confirm, Change Status, or Contact modals. But the AddJobModal Storybook Controls are dishonest: changing `step` or `source` while `open` remains true does not update internal flow state.

Findings:

- critical — Mobile Review/Manual field order is wrong. At 390px the grid becomes one column but retains DOM order, rendering Job title before Company. The design explicitly requires the reverse order on phone, so both forms fail their Figma contract. [JobForm.tsx:55](/D:/Kar/Gandom/KarNama/apps/web/src/shared/add-job/JobForm.tsx:55) [JobForm.tsx:56](/D:/Kar/Gandom/KarNama/apps/web/src/shared/add-job/JobForm.tsx:56) [JobForm.tsx:65](/D:/Kar/Gandom/KarNama/apps/web/src/shared/add-job/JobForm.tsx:65)

- critical — Paste cannot match Figma because it deliberately reuses the Input’s 16px label line, producing the documented 398px modal rather than the required 401px. “Exact” was the exit condition, and this is an admitted mismatch. [Input.tsx:103](/D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.tsx:103) [Input.tsx:104](/D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.tsx:104)

- critical — The modal can call `onSave` with no status. `status` is merely `string`; pass `status=""`, enter title and company in Manual, and Save invokes `onSave` because validation only checks those two fields. That creates an incomplete record despite status being required. [draft.ts:49](/D:/Kar/Gandom/KarNama/apps/web/src/shared/add-job/draft.ts:49) [draft.ts:52](/D:/Kar/Gandom/KarNama/apps/web/src/shared/add-job/draft.ts:52) [AddJobModal.tsx:150](/D:/Kar/Gandom/KarNama/apps/web/src/shared/add-job/AddJobModal.tsx:150)

- major — Storybook Controls do not drive the rendered modal. The story exposes `step` and `source`, but the component only reloads them when `open` changes. Change the Controls from Paste to Review, or alter source, while open: the canvas stays on its existing internal state. This violates the repository’s story rule. [AddJobModal.stories.tsx:36](/D:/Kar/Gandom/KarNama/apps/web/src/shared/add-job/AddJobModal.stories.tsx:36) [AddJobModal.tsx:102](/D:/Kar/Gandom/KarNama/apps/web/src/shared/add-job/AddJobModal.tsx:102)

- major — Loading moves focus to an unnamed, role-less container rather than the live status. The dialog has a name, and the status has text, but the actual focused object announced after extraction is just a generic focusable box. [AddJobModal.tsx:125](/D:/Kar/Gandom/KarNama/apps/web/src/shared/add-job/AddJobModal.tsx:125) [AddJobModal.tsx:192](/D:/Kar/Gandom/KarNama/apps/web/src/shared/add-job/AddJobModal.tsx:192)

VERDICT
score: 4.0
criticals: 3
one-line: Fix the mobile Company-before-title order, the 401px Paste geometry, and status validation before treating KN-029 as done.