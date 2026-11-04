One entry of a job opportunity's history, newest first: a status it entered,
shown as its small chip, or an interview round, shown by its title, with the day
it happened and where that came from after it, such as manual or the round's
time and result. A thin line runs through a dot at the start of each row,
joining the entries; a status's dot is solid and a round's hollow, and the first
and last rows leave off the line beyond them.

The day can be changed: on a desktop, under the pointer or while keyboard focus
is on it, the row turns light grey, the day blue, and a pencil takes the place
of its source; on a phone the pencil always shows, under the heading. The saved
row is locked and never changes.

## Props

### kind

`status` or `round`.

### status

For a status, its token and name, drawn as the small chip.

### title

For a round, its title.

### date

The day, as the reader writes it.

### source

What follows the day: how it was recorded, or a round's time and result.

### lineAbove

Whether the line runs on above, false for the newest row.

### lineBelow

Whether the line runs on below, false for the oldest.

### locked

The saved row, which cannot be changed.

### layout

`desktop`, the default, or `mobile`, the phone's detail page.

### onEdit

Called when the day is pressed to be changed.

## Stories

### Status

A status row, measured against the design.

### Round

A round row, its title and its hollow dot.

### Hover

Under a real pointer, the row's hover look. In Storybook itself, hover it
yourself.

### KeyboardFocus

Reached by Tab, the same look, and Enter asks to change the day.

### Locked

The saved row, the oldest, recorded automatically, with no pencil.

### First

The newest row, with no line above.

### MobileStatus

A status row on a phone, the pencil always shown.

### MobileRound

A round row on a phone.

### MobileLocked

The saved row on a phone, with no pencil.

### InEnglish

A status row in English, read from the left.

### Dark

A round row in the dark scheme, in the theme's dark colours.
