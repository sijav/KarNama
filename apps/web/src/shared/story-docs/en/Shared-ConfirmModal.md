The question asked before something that cannot be undone, such as deleting a job
opportunity: the question, what will be lost, and Cancel beside the red action.

Cancel takes focus as it opens, so the first key a keyboard presses changes
nothing. Escape, the close and a press on the scrim cancel too.

## Props

### open

Whether the modal is showing.

### title

The question, already in the reader's language.

### body

What cannot be undone, already in the reader's language.

### confirmLabel

The red action's label, already in the reader's language.

### onConfirm

Called when the red action is pressed.

### onCancel

Called when the modal is cancelled, by Cancel, Escape, the close or the scrim.

### opener

A function giving the control that asked for this, kept by the caller when it
was asked for and read as the modal closes. Not read from the page when the
modal opens: by then the control may already be gone, which is exactly the case
this is for, KN-344.

### fallback

Where focus goes when the opener did not survive, read as the modal closes. The
browser puts focus back on whatever had it, and calling focus on an element that
has been removed does nothing, so a reader who deleted what they were standing
on was left on the page body.

## Stories

### DeleteAJobOpportunity

Deleting a job opportunity: Cancel holding focus, and the red action pressed.

### CancelChangesNothing

Enter on the focused Cancel, and nothing deleted.

### InEnglish

The question in English.
