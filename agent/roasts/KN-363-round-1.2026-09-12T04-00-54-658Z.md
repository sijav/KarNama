1. No. Same-id status updates do not reset editable state: the reset condition is `open`, requested tab, or `job.id`; status is not included. This correctly preserves typing.

2. The premise is false. On an id change, line 251 calls `setTab(asked)`. With the default requested tab, Files resets to Info. It only remains on Files if the parent continues passing `tab="files"`.

3. `draft`, `description`, `note`, and validation state reset on an id change. `noteEditedAt`, files, contacts, and history are read directly from `job`; the file picker clears its DOM value after every selection. There is no additional copied record state.

Findings:

- **critical** — The web workspace does not type-check. `JobSaved` is referenced but never imported in the new story, so `tsc` fails with `TS2304: Cannot find name 'JobSaved'`. This invalidates the claimed clean typecheck and prevents this task from being done. [JobModal.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\job-modal\JobModal.stories.tsx:408)

- **major** — The new proof does not test the description or note handoff it claims to cover. `otherIn()` changes only `id`, `draft.title`, and `draft.company`; it inherits the first record’s `description` and `note`. The story edits and asserts only title. Remove `setDescription(job.description)` and `setNote(job.note)`, then run this story: it still passes. A real swap between records with distinct description/note can still be regressed undetected. [JobModal.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\job-modal\JobModal.stories.tsx:397) [JobModal.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\job-modal\JobModal.stories.tsx:456)

- **minor** — The added task narrative is documentation prose beside production code, not Storybook documentation under `shared/story-docs`. That directly violates the repository’s documentation-location rule and bypasses the bilingual docs guard. [#KN-363 - The modal keeps one job's edits when handed another.md](<D:\Kar\Gandom\KarNama\apps\web\src\shared\job-modal\#KN-363 - The modal keeps one job's edits when handed another.md>:1)

VERDICT
score: 3.0
criticals: 1
one-line: Import `JobSaved`, then make the handoff story use and assert distinct description and note values for both records.