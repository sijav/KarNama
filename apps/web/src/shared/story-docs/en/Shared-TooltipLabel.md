The short dark label an icon-only button shows over itself: its name, on one
line, white on near-black, which the redesign gives every button that has only
an icon. It opens on hover or keyboard focus of the button itself, after about
300 ms, and goes at once; it sits above the button, centred and 4 away, and
below it when there is no room above. It adds no name of its own: its text is
the button's name, which the button keeps.

Inside the older describe Tooltip it adds nothing, so a button that already has
a tip never shows two.

## Props

### title

The text shown, the button's name, already translated.

### children

The button it names: one element that takes a ref and spreads the props it is
given, as a tooltip's trigger must.

## Stories

### Default

The label over a copy email button in Persian, opened by the pointer after its
delay, measured against the design, and gone as soon as the pointer leaves.

### InEnglish

The same in English.

### Dark

The same in the dark scheme, its text kept legible on its fill.

### KeyboardFocus

The label opened by Tab, on the same delay, and gone when focus moves on.

### BelowWhenNoRoom

A button at the very top of the page, where the label opens below it instead,
still centred and 4 away.
