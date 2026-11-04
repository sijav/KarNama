One day of the month calendar.

The day's number sits in a small circle. It is dark grey on an ordinary day and
red on a Friday. Today has a thin blue ring, with its number in blue. The chosen
day is a blue circle with a white number. A day the field does not allow is pale
and takes no press. Under the pointer the circle turns light grey, except on the
chosen day. A cell with no day keeps its room and draws nothing.

A press on the chosen day keeps it chosen; the field's own link clears it. The
design draws no focus, so keyboard focus draws a blue ring round the circle,
apart from today's.

## Props

### label

The day's number in the reader's digits, or nothing for a cell the month has no
day for.

### name

The day in full, which a screen reader says for the button.

### friday

Draws the number in red, for the week's last day.

### today

Rings the day in blue, with its number in blue.

### selected

Draws the chosen day's blue circle.

### disabled

Draws a day the field does not allow, which takes no press.

### tabbable

Whether Tab reaches this day, the calendar's one stop in its month.

### onKeyDown

Called when a key is pressed on the day, so the calendar can move between days.

### onSelect

Called when the day is pressed, by pointer or by keyboard, unless it is off.

## Stories

### Default

An ordinary day in Persian, measured against the design.

### Friday

A Friday, its number in red.

### Hover

An ordinary day under the pointer, on a light grey circle.

### Today

Today, ringed in blue.

### Selected

The chosen day.

### Disabled

A day the field does not allow.

### FridayHover

A Friday under the pointer.

### TodayHover

Today under the pointer.

### Empty

A cell the month has no day for.

### Choosing

The day pressed, named in full.

### Off

A day that is off pressed, with nothing happening.

### KeyboardFocus

Today reached with Tab, wearing the focus ring outside its own.

### InEnglish

The chosen day in English digits.

### Dark

Today in the dark scheme, in the theme's dark colours.
