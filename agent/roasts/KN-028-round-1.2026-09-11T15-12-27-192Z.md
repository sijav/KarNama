1. No. Focus restoration only works while the original trigger remains connected. `Modal` delegates it entirely to MUI; MUI calls `.focus()` on the saved node with no connected-node check or fallback. Deleting the job that contained the trigger leaves focus nowhere useful.

2. Yes. `autoFocus` reaches MUI’s native button and is honoured inside the focus trap. Cancel is the correct initial focus for this destructive confirmation, and it matches the design contract.

3. It resets correctly across normal rendered close/reopen cycles and when the authoritative `value` changes. It can retain an invalid stale selection if `statuses` changes while open: a removed pending status can still be confirmed.

4. The dark scrim exception is correct: black at 50% is the specified token and WCAG contrast requirements do not apply to a decorative dimming overlay. It does not hide a dark-palette defect.

Findings:

- critical — The dialog’s accessible-name guarantee is false for a legal component input. `title` is an unrestricted `string`; passing `''` or whitespace produces an empty `<h2>` referenced by `aria-labelledby`, so the dialog has no accessible name. The modal is exported as a reusable shell, and its exit condition explicitly requires an accessible name. Reject blank titles or make the API structurally require a non-empty accessible label. [Modal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\Modal.tsx:8), [Modal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\Modal.tsx:56)

- critical — Focus restoration fails in the normal destructive sequence where confirmation removes the job/card that supplied the trigger. The shell has no saved fallback target and relies on MUI’s restoration; its focus trap calls `.focus()` on the detached trigger. Keyboard focus is then lost rather than landing on a live, sensible control. The existing story only tests the surviving-trigger case. [Modal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\Modal.tsx:53), [ConfirmModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ConfirmModal.tsx:38), [Modal.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\Modal.stories.tsx:119)

- major — `ChangeStatusModal` can confirm an ID that no longer exists. Open it with `value="interview"`, choose `"custom-1"`, then update `statuses` to remove `"custom-1"` while keeping `value="interview"`. The reset sentinel ignores `statuses`, no radio remains selected, but Confirm still calls `onConfirm('custom-1')`. Reset or validate pending state when the options change, and add the missing regression test. [ChangeStatusModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ChangeStatusModal.tsx:26), [ChangeStatusModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ChangeStatusModal.tsx:30), [ChangeStatusModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ChangeStatusModal.tsx:47)

- minor — The change puts component-consumer documentation prose in implementation files, directly contrary to the repository rule that it belongs only under `shared/story-docs`. These blocks explain the component’s externally visible layout, interactions, and variants rather than implementation mechanics. [Modal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\Modal.tsx:41), [ConfirmModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ConfirmModal.tsx:20), [ChangeStatusModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ChangeStatusModal.tsx:20)

`todo validate`, TypeScript checking, and lint completed cleanly. The browser story suite could not start because the read-only sandbox prevents Vite from writing its temporary config bundle.

VERDICT
score: 4.5
criticals: 2
one-line: Make focus restoration safe when the destructive action removes its trigger, with a live fallback target.