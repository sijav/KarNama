The small square × that closes a window without changing anything: every
modal's header and the date pickers' popovers. The cross is in the secondary
text colour with no ground; on hover a light grey square shows behind it. It is
22 by default, 20 in a modal's header and 16 as the search bar's clear, the
cross 16 at every size.

It always needs a name, as any icon-only button does, and shows it in the small
dark label over itself on hover and on keyboard focus. Keyboard focus also draws
a blue outline round the square.

## Props

### aria-label

The button's name, read by screen readers and shown in its label: say what
pressing it does, as Close does.

### onClick

Called when it is pressed, by pointer or by keyboard.

### size

`22`, the default, the date popovers'; `20`, a modal header's; or `16`, the
search bar's clear. The cross stays 16.

## Stories

### Default

The close at 22, measured against the design, and pressed.

### Hover

The pointer over it: the light grey square.

### At20

The modal headers' size.

### At16

The search bar's clear, the cross filling the square.

### InEnglish

The same close in English.

### Dark

The close in the dark scheme, in the theme's dark colours.

### KeyboardFocus

Reached by Tab, with the blue outline.

### NamesItself

Hovered, it shows its name in the small dark label over it.
