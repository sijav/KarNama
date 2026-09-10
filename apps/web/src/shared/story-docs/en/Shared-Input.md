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
pixels of the error border, and the product's focus ring goes round it, two
pixels of the focus colour just outside the field, because red staying red
would show no focus at all. The field is shown on each of the three surfaces it
sits on. The design does not draw this state; DESIGN.md records the decision.

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
