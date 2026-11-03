The list an interview's time is chosen from: every half-hour of the day, from
00:00 to 23:30, written in the reader's own digits. It hangs under the time
field in the calendar's window, a white panel with a thin grey edge, rounded
corners and a soft shadow, and shows six times at once; the rest scroll into
view, with no scroll bar, as the design draws none. It opens with the chosen
time third from the top, or on 09:00 when none is chosen.

Under the pointer a time takes a light grey ground; the chosen one is light
blue with its time in blue. From the keyboard the arrows, Home and End move
through the times, the one reached showing the grey ground and a blue ring,
and Enter chooses it.

## Props

### value

The chosen time, in minutes after midnight, or nothing.

### onChange

Called with a time's minutes after midnight when it is pressed or chosen with
Enter.

### autoFocus

Puts focus on the chosen time, or on 09:00, as the list appears, for a list
opened from the keyboard.

### width

The panel's width, 244 by default; the calendar's window gives the time
field's.

## Stories

### Default

The design's window, measured against it: 09:00 to 11:30 with 10:00 chosen.

### NothingChosen

With no time chosen it opens on 09:00, nothing marked.

### Choose

A press on a time chooses it.

### Hover

The pointer over a time: its light grey ground.

### KeyboardFocus

Focus on the chosen time, the arrows moving the grey ground and the blue ring,
End going to 23:30, and Enter choosing it.

### InEnglish

The same list in English, with Latin digits at the left.

### Dark

The list in the dark scheme, in the theme's dark colours.
