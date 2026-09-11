A text field with its label above and a helper or error line below, from the
design's Input. Every form in the product uses it: add job, manual entry,
contact, note, admin.

**The line under the field always keeps its height.** With no message, with a
helper, or with an error, it is the same size, so a validation error appearing
never pushes the rest of a form down.

The label is bound to the field, so clicking it focuses the field and a screen
reader names the field by it. The helper or error is the field's description,
and an error also marks the field invalid.

It fills its container; the 240 in the design file is only the specimen's width.

## Props

### label

The field's name, shown above it and read out as its accessible name. Copy, so
pass it through the catalog.

### value

The text, when the field is controlled.

### defaultValue

The starting text, when the field is uncontrolled.

### placeholder

The example shown while the field is empty.

### helperText

A short note under the field. Replaced by the error while there is one.

### error

The error message. While it has any text, the field takes the error border, the
line under it turns to the error colour, and the field is marked invalid. An
empty or blank message, one of only spaces and invisible characters, is no
error: the helper shows instead.

### disabled

Greys the field to the secondary surface and stops it responding.

### name

Form field name, for an input inside a form.

### leadingIcon

An icon at the start of the field, 20 by 20, in the secondary text colour when
the icon paints in `currentColor`. For decorative icons only: the icon hides
itself from assistive technology, and the slot is not a button, which would
need its own name and a larger target. Turned off with false or null, as
`hasIcon && <Icon />` does, or given a string with nothing to read, empty,
spaces or a zero-width character, it draws no slot.

### trailingIcon

The same, at the end of the field.

### onChange

Called with the new text and the change event.

## Stories

### Default

Empty, showing the placeholder: 44 tall, 16 at each side, one pixel of the
default border.

### FromArgs

Args nothing like the specimen, so the field must be following them: its value,
description and disabled state come from the Controls, and the check reads what
to expect from them. The label stays 42, since an empty one means the specimen's.

### Filled

Holding what a user typed.

### Focus

Two pixels of the focus colour, and the text does not move a pixel for it.

### FocusWhileEmpty

The empty field takes focus and its placeholder does not move: the placeholder's
own style is measured before and after, not only the input's.

### WithError

The error border, and the error message as the line under the field and as
what the field announces.

### FocusedWhileInvalid

An invalid field taking focus keeps the error colour at the focus width, two
pixels of the error border, and the product's focus ring is drawn inside it,
two pixels of the focus colour four pixels in from the edge, because red
staying red would show no focus at all. The field sits in a box that clips
whatever overflows it, flush with the field's sides, and nothing of the focus
change is lost to it. The design does not draw this state; DESIGN.md records
the decision.

### ControlsMatchTheCanvas

With no control touched, the Controls show the specimen's label, placeholder and
helper in the language on screen, and the field draws exactly those. Type in a
control and the field draws what was typed; empty the placeholder or the helper
and it is gone.

### ControlsMatchTheCanvasInEnglish

The same in English, which is not the language the stories load in, so the
copy has to follow the Language toolbar into the Controls rather than stay
where it started.

### Disabled

The secondary surface, with the text in the disabled colour.

### Hover

The border turns to the secondary text colour under a real pointer. In Storybook
itself, hover it yourself.

### LabelIsBound

Clicking the label focuses the field, and the field is named by the label.

### Typing

Typing into the field calls onChange with the new text first and the event
after it, and a name reaches the input element for a form.

### TypingIntoABoundValue

A value set in the args and twenty keys typed with no pause between them. The
field shows every key as it is typed, and the value control catches up with it
rather than dragging it back.

### LeadingIcon

The file's icon placeholder in the leading slot, at the start of the field: 16
from the edge and 4 from the text, which moves along by the icon and the gap.

### TrailingIcon

The placeholder in the trailing slot, at the end of the field.

### BothIcons

Both slots at once.

### IconsTurnedOff

Every way of turning an icon off. False or null, true, and a string with
nothing to read, empty, a space, a zero-width space, a line break or a joiner,
draw no slot at all. An empty fragment or an icon that renders nothing leaves a
slot that collapses and takes no room. Either way the text stays where it is
without an icon.

### WithoutAHelper

A label and nothing under it. With no message the field points at no
description, and the empty line still holds its place.

### ErrorDoesNotMoveTheField

A field with no message beside one with an error: the same height, so nothing
below either of them moves.

### BlankErrorIsNoError

An empty error beside one of only spaces, one of only a zero-width non-joiner and
one of only a right-to-left mark: none is an error, so all four keep the default
border, are not marked invalid, and show the helper.

### ErrorAnnouncedWhileTyping

A field that checks itself as it is typed in, by two rules. Emptied while it
has focus, it shows its error in a live region that was in the page before it,
so a screen reader can read it out while the user is still typing. One
character gives a different error, which replaces the first in the same region;
a second clears it, and the helper describes the field again; a field with no
helper is then described by nothing.
