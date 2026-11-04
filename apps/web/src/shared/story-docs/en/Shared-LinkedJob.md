One job opportunity linked to a person, as a row in the person's window: its
status's stripe at the start, its title over its company, its status, and a
button that unlinks it, shown under the pointer and with keyboard focus inside.
The row turns light grey under the pointer.

## Props

### title

The job opportunity's title.

### company

Its company.

### status

Its status, the token and the name, which the stripe and the chip show.

### onUnlink

Called when the unlink button is pressed.

## Stories

### Default

The row at rest, measured against the design.

### Hover

Under a real pointer, the grey row with its unlink button. In Storybook itself,
hover it yourself.

### KeyboardFocus

Tab reaches the unlink button, focus inside draws the hover look, and Enter
unlinks.

### InEnglish

The row in English, the stripe at the left.

### Dark

The row in the dark scheme, in the theme's dark colours.
