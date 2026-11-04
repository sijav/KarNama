The window that adds a stage of the reader's own, or edits one. It asks for
the stage's name, at most 20 letters with a count under it, and says so when
another stage already has that name; on adding, it suggests names as chips, and
a press on one fills the name. The colour picker under it starts on a colour
chosen for the stage. Add or Save stays off while the name is empty or taken,
and Enter in the name does what it does. Editing adds Delete status, in red, at
the other end of the footer. Cancel, the close, Escape and a press outside close
it without a change.

## Props

### open

Whether the window is open; each opening starts again from `stage`.

### mode

`add` for a new stage, or `edit` for one the reader made.

### stage

The name and colour to start from: an empty name and the colour chosen for a
new stage, or the stage being edited.

### takenNames

Every other stage's name, which this one may not take, whatever the case or the
spaces round it.

### onSave

Called with the stage's name, trimmed, and its colour.

### onCancel

Called when the window is closed without a change.

### onDelete

Called when Delete status is pressed while editing.

## Stories

### Add

Adding a stage, measured against the design: the empty name and its count, the
suggestions, and Add off.

### AddFilled

A suggestion pressed fills the name and shows pressed, and Add gives the stage.

### AddDuplicate

A name another stage has shows the error in red, and Add stays off.

### TwentyLetters

The name stops at 20 letters, and the count says so.

### EnterAdds

Enter in the name adds the stage, its name trimmed.

### Cancel

Cancel, the close and Escape close it, adding nothing.

### Edit

Editing a stage: its name and colour, no suggestions, Save, and Delete status at
the footer's other end.

### EditActions

Save gives the renamed stage and its new colour; opened again it starts from the
stage as given, and Delete status asks for the deletion.

### InEnglish

Adding in English, read from the left.

### Dark

Editing in the dark scheme, in the theme's dark colours.
