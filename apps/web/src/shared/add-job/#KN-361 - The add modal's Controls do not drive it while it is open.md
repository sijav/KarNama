# KN-361 · The add modal's Controls do not drive it while it is open: step, source and draft are read only on opening

Beside the add modal. Recorded after the fix, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** Changing step, source or draft while open
restarts the flow from them, and a story changes the step through its args and
sees the new step.

## What was done

- The modal keeps what it last opened on, the step, the source and the draft,
  and starts its flow again when the modal opens or, while open, when any of
  them changes. The draft is compared by what it holds, as JSON, since a parent
  that renders again hands over a new object with the same draft, the trap
  KN-347 found in the Contact Modal.
- StepFromItsArgs: a parent changes the open modal's step from Paste to
  Manual, as the Controls change an arg, through a hidden button its play
  presses; a portable story applies no `updateArgs`, so the prop changes where
  the Controls would change it. The empty form appears. It failed on the old
  modal.
- In the Storybook UI, emitting `updateStoryArgs` on the manager's channel, what
  the Controls panel sends, moved the open Paste Filled story to the Manual
  form.
