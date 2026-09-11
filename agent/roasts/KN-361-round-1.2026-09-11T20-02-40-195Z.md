1. Yes, the silent reset is reachable for any controlled consumer that changes `step`, `source`, or `draft` while the dialog is open. It discards internal edits and closes any discard confirmation without calling the existing leave guard. That needs confirmation or an explicit reset/revision signal.

2. `JSON.stringify` is not a sound draft comparator. Equivalent objects with different key insertion order restart; `{}` and `{ title: undefined }` do not, although spreading them into `draftFrom` produces different drafts. Render-phase reset itself is valid React, but it is unsafe with the outstanding extraction: the old promise can overwrite the restarted flow.

Findings:

- critical — A prop change during extraction does not cancel that extraction. Start extracting source A, then change `step` to `manual` (or change `source`/`draft`) while loading. The render reset shows the requested new flow, but `reading.current` is unchanged; when A resolves, it passes the equality check and replaces the new flow with A’s Review draft. This violates the required restart behavior and can steal focus back to the form. [AddJobModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\add-job\AddJobModal.tsx:107) [AddJobModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\add-job\AddJobModal.tsx:138)

- critical — `draft` is not a Storybook Control at all. The explicit controls allowlist contains only `open`, `step`, and `source`, so the claimed fix still leaves the draft read-only in the Controls panel. [AddJobModal.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\add-job\AddJobModal.stories.tsx:38) [AddJobModal.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\add-job\AddJobModal.stories.tsx:59)

- major — The JSON comparison both spuriously loses work and misses real prop changes. A parent that recreates the same draft with keys inserted in a different order gets a different JSON string and resets the dialog, bypassing the discard confirmation. Conversely, changing `draft` from `{}` to `{ title: undefined }` yields the same JSON (`{}`), so it does not restart even though `draftFrom` changes `title` from `''` to `undefined`. [AddJobModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\add-job\AddJobModal.tsx:104) [draft.ts](D:\Kar\Gandom\KarNama\apps\web\src\shared\add-job\draft.ts:44)

- major — The dedicated story does not change an arg. It disables Controls and changes private wrapper state via a hidden button, so it does not prove that Storybook arg updates drive the rendered modal as the exit condition requires. [AddJobModal.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\add-job\AddJobModal.stories.tsx:284) [AddJobModal.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\add-job\AddJobModal.stories.tsx:304)

VERDICT
score: 3.0
criticals: 2
one-line: Invalidate the in-flight extraction whenever externally restarting the flow, then expose and test draft as a real Storybook arg control.