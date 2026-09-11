How a status is chosen: «وضعیت» above a row of status chips, the chosen one
ringed in blue, and a dashed «+ وضعیت تازه» that makes a new status in place.

Status is chosen with chips, never a dropdown. The chips are one radio group:
Tab reaches the chosen one, and the arrows move and choose. The add chip is the
next Tab stop. The add form and the Change Status modal use it; the Status
Control opens it from a card.

## Props

### statuses

The statuses to choose from, in the board's order: each an id, a colour and the
name the user gave it.

### value

The id of the status chosen now.

### onChange

Called with the id of the status chosen.

### onAdd

Called when «+ وضعیت تازه» is pressed; the page makes the new status.

### autoFocus

Puts focus on the chosen status as the picker appears, as a dialog opening on
it does. Off unless set.

## Stories

### Default

The picker as the add form shows it, measured against the design.

### ByKeyboard

The arrows choosing the next status, and Tab and Enter on the add chip.

### Hover

An unchosen chip under the pointer, ringed in grey.

### InEnglish

The picker with the statuses' English names.

### ArrowsInPersian

In Persian the choices run right to left, and the left arrow moves to the
choice on the left, the right arrow to the one on the right, pressed on a real
keyboard; an arrow pressed on New status moves nothing.

### ArrowsInEnglish

The same keys in English, where the choices run left to right.
