# KN-344 · Focus is lost when the action removes its opener

Beside the component, per `agent/RALPH.md` step 2b. Child of KN-028, from its
roast.

## The card

**Why.** Deleting is the flow the Confirm modal exists for, and a keyboard user
who deletes must land somewhere sensible, the next card or the list.

**Exit condition.** The shell takes a fallback for focus, used when the opener
is gone, and a story deletes the opener and finds focus on the fallback.

## What is actually wrong

MUI restores focus to the element that had it when the modal opened. Deleting a
job opportunity from its card's menu removes that card, so the element MUI saved
is detached from the document: calling `focus()` on it does nothing and focus
falls to `document.body`. A keyboard reader is then nowhere, and the next Tab
starts from the top of the page.

## The approach

The modal takes a fallback: something to focus when the opener has gone.

- A prop on the modal shell, a ref to the element that should take focus, or a
  function returning one. A function is better here, because the sensible
  destination is decided at the moment the modal closes, not when it opened: the
  next card, or the list, or the page's heading if the list is now empty.
- Used only when the opener is gone. When it is still there, MUI's own
  restoration is right and nothing should override it.
- How to tell it has gone: after the modal closes, read whether the saved
  element is still `isConnected`. MUI does not expose what it saved, so the
  shell has to save its own: the `activeElement` at the moment it opens.

## File by file

- The Confirm modal's shell, and whichever of `Modal` and `PanelModal` it is
  built on, take the fallback and use it.
- The board passes one: the card after the deleted one, else the column, else
  the board's own heading.
- The network page passes one for the same reason.
- Stories for the shell and for the board.

## What I am unsure about

- Whether MUI's restoration runs before or after our own code can check, and
  whether fighting it means disabling `disableRestoreFocus` and doing all of it
  ourselves, which is more code but one behaviour rather than two.
- Whether focusing a card is right, or whether the destination should be the
  list's container so the reader is not dropped onto a record they did not
  choose.
- What happens when the deletion empties the list entirely.

## Corrected after the plan roast, 2026-09-12

- **Keep MUI's restoration.** Its focus trap restores as `open` becomes false,
  BEFORE `onTransitionExited`, so the shell can focus the fallback in that
  handler and win without a race. No `disableRestoreFocus`.
- **The opener is captured at the DELETE REQUEST, not when the modal opens.**
  The network page's edit route calls `setDeleting` and `setEditing(undefined)`
  together, so the Delete button inside the contact modal is already gone by the
  time the confirmation is up: reading `activeElement` then would save the wrong
  element and could never tell that the opener had disappeared.
- **Only the Confirm modal**, not PanelModal, which it is not built on and
  which carries the add flow's nested unsaved-changes confirmation.
- **The fallback must be focusable.** A card's own primary control, else the
  empty state's action, else a heading given `tabIndex={-1}` on purpose. A
  section that takes no focus is not a fallback.
- **The network's delete-from-the-contact-modal route gets its own story**, and
  the surviving-opener case stays, and the board's story asserts WHICH control
  has focus rather than merely that it is not the body.

## How I will know it worked

A story opens the confirm from a card's own control, confirms, and finds focus
on the fallback rather than on the body; and a story where the opener survives
finds focus back on the opener, so the fallback did not take over the normal
case.
