Changing a job opportunity's status in a modal: the status picker, and Cancel
beside Confirm.

The choice waits in the modal until Confirm hands it over; Cancel, Escape, the
close and the scrim leave the status as it was, and the next opening starts
again from the job opportunity's status.

## Props

### open

Whether the modal is showing.

### statuses

The statuses to choose from, in the board's order.

### value

The id of the status the job opportunity has now.

### onConfirm

Called with the id of the status chosen, when Confirm is pressed.

### onCancel

Called when the modal is cancelled.

### onAdd

Called when «+ وضعیت تازه» is pressed in the picker.

## Stories

### Default

Another status chosen and confirmed.

### CancelLeavesItAsItWas

A choice cancelled, and the next opening back on the job opportunity's status.
