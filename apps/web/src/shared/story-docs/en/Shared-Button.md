The button of the design: five styles in three sizes, each at rest, hovered,
pressed, disabled and focused.

Primary is the one action a screen asks for, in the brand fill. Secondary is an
outlined alternative, Text a quiet action with no box until hovered, Ghost an
even quieter one in grey, and Destructive the red fill for an action that
removes something. Small is 36 tall, medium 44 and large 52, with the padding,
spacing and text size of each; an icon can lead or trail the label and takes
the size's icon size. A keyboard focus draws a blue ring of two pixels round
the button, or on Secondary turns its edge blue; a pointer does not. A disabled
button is greyed and out of the tab order.

## Props

### children

The label, already in the reader's language.

### variant

`primary`, the default, `secondary`, `text`, `destructive` or `ghost`.

### size

`S`, `M`, the default, or `L`.

### disabled

Greys the button and takes it out of the tab order.

### startIcon

An icon from the set before the label.

### endIcon

An icon from the set after the label.

### type

`button`, the default, or `submit` for the button that sends a form.

### autoFocus

When set, the button takes focus as it mounts: the Confirm modal's Cancel does,
so the action a keyboard lands on first is the one that changes nothing.

### onClick

Fired when the button is pressed, by pointer or by keyboard.

## Stories

### Playground

One button, its style, size, state and icons set in the controls.

### Matrix

Every style in every size, enabled and disabled. When the story runs as a test
it hovers and presses each one with the browser's own pointer and keyboard; in
Storybook itself, try them by hand.

### KeyboardFocus

The five styles reached by Tab in turn, each showing its focus ring.

### WithIcons

A button with a leading and a trailing icon, sized and spaced to the button.
