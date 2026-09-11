A square button holding one icon, for actions that need no words beside them:
a card's delete, a window's close, a row's menu.

It is 32 by 32 around a 16 icon, in a neutral tone or a danger tone. At rest
both look the same, the icon in the secondary text colour; on hover the
neutral one takes a light grey fill and darker icon, and the danger one a pale
red fill and a red icon, so a destructive action shows itself before it is
pressed. Disabled, it fades and leaves the tab order. It always needs a name,
because an icon alone says nothing to a screen reader, and a blank name is
refused: the button is left out and the mistake reported in the console, while
the rest of the screen renders. The focus ring is drawn inside the button.

## Props

### icon

Which icon from the set it shows.

### aria-label

The button's name, read by screen readers and required: say what pressing it
does.

### tone

`neutral`, the default, or `danger` for an action that removes something.

### iconSize

`sm`, the default, a 16 icon, or `md`, a 20 icon, which the Bulk Action
Bar's close uses. The button stays 32 square either way.

### disabled

Fades the button and takes it out of the tab order.

### onClick

Fired when the button is pressed, by pointer or by keyboard.

## Stories

### Default

The neutral tone at rest, named.

### Danger

The danger tone at rest, which looks as the neutral one does.

### Hover

Both tones hovered side by side. The story moves a real pointer when it runs
as a test; in Storybook itself, hover a button yourself.

### Disabled

Both tones disabled, faded and out of the tab order.

### KeyboardOnly

Tab reaches the button, and Enter and Space both press it, with no pointer
anywhere.

### BlankName

A button given a blank name beside one given a real name: the blank one is left
out and reported in the console, and the named one renders.
