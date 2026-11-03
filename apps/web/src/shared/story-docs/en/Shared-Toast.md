The short message at the foot of the page after something changes: a dark pill
with the message in white and, when the change can be taken back, «لغو», Undo,
in light blue after it. It rises from the foot of the page and sits 24 above
it, centred over the page beside the sidebar, or above the tab bar on a phone.
A message with Undo stays 5 seconds and one without, such as «تغییرات ذخیره
شد», Changes saved, 3; it holds while the pointer or keyboard focus is on it,
and Escape closes it. A press anywhere else leaves it, so Undo is still there.

Screen readers hear the message as it appears, and Undo is named with it. In
the dark scheme the pill turns light, with the words dark on it.

## Props

### open

Whether it shows. It closes itself when its time is up, and says so through
`onClose`.

### message

What happened, in a few words.

### action

The undo: its `label` and its `onClick`, called after the message closes. Leave
it out for a message that only informs.

### onClose

Called when it closes: its time up, Escape, or its action pressed.

## Stories

### WithAnAction

The design's message with Undo, measured against it, read aloud, and Undo
pressed.

### ChangesSaved

«تغییرات ذخیره شد» with no action, gone after 3 seconds.

### StaysFiveSeconds

A message with Undo, still there at 4 seconds and gone by 6.

### Hover

The pointer over Undo: it is underlined.

### KeyboardFocus

Reached by Tab, Undo wears an outline in its own colour.

### Escape

Escape closes it and undoes nothing.

### PressElsewhere

A press elsewhere leaves it showing.

### InEnglish

The same message in English, mirrored: the words at the left, Undo at the
right.

### Dark

The message in the dark scheme: a light pill with dark words.
