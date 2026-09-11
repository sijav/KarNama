# KN-028 · Modal shell, confirm, and change status

Beside the modals. Recorded after the build, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** Both modals match Figma, focus is trapped
and returns to the trigger on close, Escape closes, the backdrop click behaviour
matches the design, and the dialog has an accessible name and is announced as a
dialog.

## What was built

- From nodes 150:92, 150:93 and the screen 377:6244, read with use_figma: the
  shell on MUI's Dialog, a dialog named by its Heading/M title, with the close,
  two dividers and the actions at the inline end, over the file's scrim, which
  joined the tokens as `overlay/scrim` and which dark takes unchanged, named as
  the one exception in the dark palette's test.
- Focus is trapped while it is open and goes back to the trigger; Escape, the
  close and a press on the scrim close it. The prototype wires no overlay, so
  the scrim's press cancels.
- `ConfirmModal`, 360, Cancel focused as it opens so the first key changes
  nothing, then the Destructive action; the Button gained `autoFocus` for it.
- `ChangeStatusModal`, 420, round the Status Picker, the choice held until
  Confirm, each opening starting from the job's status.
- Stories: Shell, TrapsFocusAndEscapes, ScrimCloses and InEnglish for the
  shell; DeleteAJobOpportunity, CancelChangesNothing and InEnglish for Confirm;
  Default and CancelLeavesItAsItWas for Change Status.
