The question asked when a window holding unsaved changes is closed: a small
modal titled Unsaved changes, saying the changes are lost if it closes without
saving, with Close without saving and Save at the end of its row, Save last and
in the brand colour.

Save holds the focus as it opens, so Enter keeps the changes. The close at the
top, Escape and a press outside it all go back to the window, changing nothing.

## Props

### open

Whether the modal is shown.

### onSave

Called when Save is pressed; the page saves and closes the window.

### onDiscard

Called when Close without saving is pressed; the page closes the window and
drops the changes.

### onKeepEditing

Called by the close, Escape or a press outside; the page goes back to the
window as it was.

## Stories

### Default

The modal measured against the design.

### Save

Enter on Save, which alone is called.

### CloseWithoutSaving

Close without saving pressed.

### BackToTheModal

The close, then Escape, each going back to the window.

### InEnglish

The same in English, read from the left.

### Dark

The modal in the dark scheme, in the theme's dark colours.
