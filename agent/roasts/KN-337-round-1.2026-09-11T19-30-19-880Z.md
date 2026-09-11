1. With an unavailable/deleted status, no radio gets `autoFocus`. The dialog remains named, but focus falls to its dialog panel, not an actionable control. Worse, Confirm can submit the unavailable id unchanged.

2. The nested dialogs use MUI’s modal stack, so Escape and the inner scrim target the inner dialog and focus should return to the status control in the outer dialog. However, KN-364 is still present: confirming then immediately saving can still submit the old `job.draft.status`.

Findings:

- critical — Invalid current status leaves the modal unfocused on a choice and permits re-submitting the invalid value. With `value="deleted-custom"` and no matching `statuses` entry, [StatusPicker.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\status-picker\StatusPicker.tsx:103) assigns `autoFocus` to nothing, and [ChangeStatusModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ChangeStatusModal.tsx:46) confirms the unchanged invalid `pending` value. The promised focus behavior is not met for the exact missing-status state, and Confirm can emit a deleted status. Choose and focus a valid fallback, or disable Confirm until a valid option is chosen.

- major — KN-364 remains reproducible after Confirm. [JobModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\job-modal\JobModal.tsx:250) saves `job.draft.status`, while the control calls the external status callback separately at [JobModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\job-modal\JobModal.tsx:634). Confirm a new status and activate Save before the parent supplies an updated `job`; `onSave` receives the old status. The new confirmation step narrows the timing window but does not fix it.

`node agent/scripts/todo.mjs validate` passed. The focused Storybook run could not start because this read-only sandbox prevents Vite from creating its temporary config file.

VERDICT
score: 4.5
criticals: 1
one-line: Handle an unavailable current status by focusing a valid fallback and preventing Confirm from emitting the deleted id