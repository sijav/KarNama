# KN-337 · The Status Control's popup says it is a dialog, is not one, and opens with focus on its bare panel

Beside the Status Control. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** The popup is a named dialog or is
advertised as what it is, and opening it puts focus on the chosen status, which
a story checks after Enter.

## What was done

- DESIGN.md already said the popover was a stand-in: the file draws the Change
  Status modal, `150:93`, for the Status Control, over the job modal at
  `377:6244`, and the panel was to serve until KN-028 built the Modal. KN-028
  built it, so the control now opens the Change Status modal, a MUI Dialog
  named by its title, «تغییر وضعیت», and `aria-haspopup="dialog"` is true.
  A choice now waits for Confirm there instead of closing on the click.
- The Status Picker takes `autoFocus`, which puts `autoFocus` on the chosen
  status's radio as it mounts; the modal passes it, so every opening lands on
  the job's status, and the Dialog's focus trap leaves focus that is already
  inside it. Off by default, so the add form's picker takes no focus.
- OpensOnTheChosenStatus: Tab, Enter, the named dialog, focus on the checked
  radio. ChoosingAStatus confirms a choice; EscapeCancels changes nothing; the
  Change Status modal's Default checks the focus; the Job Modal's ChangeStatus
  confirms in the modal. All five failed on the old control.
- The control imports the modal barrel, which imports the status picker's:
  a cycle between barrels, harmless since each side only uses the other when
  rendering.
