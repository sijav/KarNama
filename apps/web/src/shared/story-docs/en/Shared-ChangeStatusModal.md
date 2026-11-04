Changing a job opportunity's status in a modal: the grouped status picker, the
stages over the outcomes that close a case, and Cancel beside Confirm.

The choice waits in the modal until Confirm hands it over; Cancel, Escape, the
close and the scrim leave the status as it was, and the next opening starts
again from the job opportunity's status, with focus on it.

## Props

### open

Whether the modal is showing.

### stages

The stages to choose from, in the board's order: the open statuses, the
reader's own among them.

### outcomes

The outcomes that close a case, under the stages.

### value

The id of the status the job opportunity has now.

### onConfirm

Called with the id of the status chosen, when Confirm is pressed.

### onCancel

Called when the modal is cancelled.

### onAdd

Called when «+ افزودن وضعیت» is pressed in the picker.

## Stories

### Default

The modal measured against the design, an outcome chosen and confirmed.

### CancelLeavesItAsItWas

A choice cancelled, and the next opening back on the job opportunity's status.

### InEnglish

The modal in English.

### Dark

The modal in the dark scheme, in the theme's dark colours.
