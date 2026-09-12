The shell every modal is built on: its title, a close, a divider on each side of
its body, and its actions at the end.

It opens over a dimming scrim with a short dissolve, and while it is open the
keyboard stays inside it. Escape, the close and a press on the scrim close it,
and focus goes back to whatever opened it. Screen readers announce it as a
dialog named by its title.

## Props

### open

Whether the modal is showing.

### title

The modal's title, already in the reader's language. It names the dialog.

### width

The modal's width: 360 for a confirmation, 420 for a change of status.

### onClosed

Said once it has finished closing, after the browser has put focus back where it
found it. That is late enough for a caller to see where focus landed and send it
somewhere else when the control that opened the modal is no longer there,
KN-344.

### onClose

Called when Escape, the close or the scrim closes the modal.

### children

The body, between the two dividers.

### actions

The buttons at the end, the least drastic first.

## Stories

### Shell

The shell as the confirmation uses it, measured against the design.

### TrapsFocusAndEscapes

Opened by the keyboard, focus staying inside, Escape closing it and focus back on
the trigger.

### ScrimCloses

A press on the scrim closing it.

### InEnglish

The shell in English.
