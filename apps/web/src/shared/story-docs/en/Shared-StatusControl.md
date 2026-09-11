The clickable status on a card or in the job modal: the small status chip and a
caret in a pill, which opens the Change Status modal.

The chip itself stays display only; the pill is the button. It opens the modal
with focus on the status the job opportunity has; a status chosen there waits
until Confirm hands it over, and Cancel or Escape close it with nothing
changed. Either way focus is back on the pill. While the modal is open the pill
looks pressed.

## Props

### statuses

The statuses to choose from, in the board's order.

### value

The id of the status the job opportunity has now.

### onChange

Called with the id of the status chosen.

### onAdd

Called when «+ وضعیت تازه» is pressed in the modal.

## Stories

### Default

The control at rest, measured against the design, the chip inside it inert.

### ChoosingAStatus

The modal opened, a status chosen and confirmed, and focus back on the control.

### OpensOnTheChosenStatus

Enter on the control opens the Change Status modal, a named dialog, with focus
on the status the job opportunity has.

### EscapeCancels

The modal opened by the keyboard and closed by Escape with nothing changed.

### InEnglish

The control with the statuses' English names.
