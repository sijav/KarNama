The clickable status on a card or in the job modal: the small status chip and a
caret in a pill, which opens the status picker.

The chip itself stays display only; the pill is the button. Choosing a status in
the picker closes it and hands the choice over; Escape closes it with nothing
changed. Either way focus is back on the pill. While the picker is open the
pill looks pressed.

## Props

### statuses

The statuses to choose from, in the board's order.

### value

The id of the status the job opportunity has now.

### onChange

Called with the id of the status chosen.

### onAdd

Called when «+ وضعیت تازه» is pressed in the picker.

## Stories

### Default

The control at rest, measured against the design, the chip inside it inert.

### ChoosingAStatus

The picker opened, a status chosen, and focus back on the control.

### EscapeCancels

The picker opened by the keyboard and closed by Escape with nothing changed.

### InEnglish

The control with the statuses' English names.
