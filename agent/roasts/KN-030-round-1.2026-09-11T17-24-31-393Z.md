1. State handling is not sound. Tab switches preserve note text, and reopening resets it, but a new `job` prop while open leaves the editable draft from the previous job in place. Status can also be saved stale.

2. The code contains the five tabs in the right order and sorts history descending for canonical UTC ISO timestamps. It does not meet the “opens from a card on the board” condition in production, only in a Storybook wrapper. Rendered Figma verification was not available because browser access to the deployed Storybook was denied.

3. The dialog name, tabs, panels, textareas, external link, and file-picker button have reasonable accessible paths. The non-focusable drop target is acceptable because “Choose file” is the keyboard alternative.

4. `JobFields` is a clean extraction: Review and Manual still compose `JobForm`, which retains the posting-link and status fields.

Findings:

- **critical**: There is no production board-to-modal integration. `JobModal` is never rendered outside stories; the claimed card opening exists only in [`JobModal.stories.tsx`](/D:/Kar/Gandom/KarNama/apps/web/src/shared/job-modal/JobModal.stories.tsx:269). This fails the exit condition that a board card opens the modal.

- **critical**: Replacing the selected job while the modal stays open creates a hybrid record and can save edits onto the wrong job. The derived state resets only on an `open` transition, never when `job` changes, so `draft`, `description`, and `note` remain from job A while header, history, contacts, and files render job B. Saving then emits A’s editable fields with B’s current status. See [`JobModal.tsx`](/D:/Kar/Gandom/KarNama/apps/web/src/shared/job-modal/JobModal.tsx:229).

- **critical**: A header status change can be overwritten by Save. Select Offer, then Save before the parent has supplied a new `job` object, and `onSave` emits the old `job.draft.status`, not Offer. The component deliberately reads the prop at save time while the status control only calls an external callback. See [`JobModal.tsx`](/D:/Kar/Gandom/KarNama/apps/web/src/shared/job-modal/JobModal.tsx:243) and [`JobModal.tsx`](/D:/Kar/Gandom/KarNama/apps/web/src/shared/job-modal/JobModal.tsx:625).

- **minor**: The new component puts extensive consumer-facing documentation in code comments, contrary to the repository rule that this belongs in story-doc markdown. Examples include [`JobModal.tsx`](/D:/Kar/Gandom/KarNama/apps/web/src/shared/job-modal/JobModal.tsx:196) and [`JobModal.tsx`](/D:/Kar/Gandom/KarNama/apps/web/src/shared/job-modal/JobModal.tsx:415).

`node agent/scripts/todo.mjs validate` reports the board valid. Targeted ESLint and TypeScript checks pass. Vitest could not start because the read-only sandbox prevents Vite from writing its temporary config file; that is environmental, not a finding.

VERDICT
score: 2.5
criticals: 3
one-line: Wire the modal into the real board and make job/status state coherent before Save can overwrite a different or newer record.