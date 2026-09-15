A 20 by 20 checkbox with three marks: empty, a tick, and a dash.

It has no text of its own, so it is named by `aria-label` or by
`aria-labelledby`, and one of the two is required. A label wrapped round it is
valid HTML, but this Checkbox is a control with no text, as the cards use it, and
asks for one of the two.

The square is the design's 20 by 20, and the Checkbox round it is 28 by 28:
four pixels on every side kept for the focus ring, so whatever holds the
Checkbox cannot cut the ring off, and a larger target for the pointer. To put
the square exactly where a design draws it, give the four back with a negative
margin on a wrapper, and do not clip within four pixels of the square.

The dash is the reason this component exists. Bulk selection on the board needs
a column header that reflects a **partial** selection, and a header with only two
states has to lie: a tick claims everything below it is selected and an empty box
claims nothing is.

**Indeterminate is a DOM property, not an attribute.** HTML has no
`indeterminate` content attribute — it exists only on the element — so it is
assigned to the input rather than rendered into the markup. The stories assert
the property for that reason; an attribute check would pass against a checkbox
with no third state at all.

## Props

### checked

Controlled on or off. Leave it unset for an uncontrolled checkbox.

### defaultChecked

Starting state when the checkbox is uncontrolled.

### indeterminate

Shows the dash instead of the tick. Independent of `checked`: a partly
selected group is neither on nor off, and the dash outranks the tick when both
are set.

### disabled

Greys the frame to the secondary surface, with the border disappearing into it,
so it reads as absent rather than as switched off.

### onChange

Fired with the event and the new checked value.

### name

Form field name, for a checkbox inside a form.

### value

Form field value, for a checkbox inside a form.

### id

The id of the input the checkbox role is on, so a label can point at the
checkbox itself.

### aria-label

Accessible name, for the case where no visible label is associated with it. One
of this and `aria-labelledby` is required, since a checkbox with neither is
unusable by screen reader, and a checkbox whose name comes to nothing is left out
and reported rather than drawn nameless.

### aria-labelledby

Id of the element that labels it, when there is a visible label to point at.
Required when `aria-label` is not given. The elements it points at are read as
the checkbox's input is attached: if none of them is in the page, or they hold
only blank text, the checkbox is left out and reported. A label whose text
changes after that is not read again.

## Stories

### Default

Rendered from its args: every control changes the Checkbox.

### Unchecked

The default. The frame is the surface colour with the default border.

### Checked

The brand fill with a white tick.

### Indeterminate

The brand fill with a white dash, and the assertion that the property survives
rather than the markup.

### Hover

The default border turns to the focus colour while a pointer is over the box,
and only while it is unchecked, enabled and not partial. The story moves a
REAL pointer when it runs as a test, because `:hover` is the browser's own
hit-testing and no synthetic event can set it. In Storybook itself there is
nothing to move a pointer, so hover the box yourself.

### Disabled

Greyed and inert. The story clicks it to prove it does not change, because a
disabled control that still responds is worse than one that was never disabled.

### KeyboardOnly

Tab to reach it and Space to toggle it, with no pointer used anywhere. Bulk
selection is what this is for, and a selection control that needs a mouse
excludes exactly the people most likely to be selecting in bulk.

### FocusedInAClippingHost

Focused inside a host that cuts off whatever overflows it, with no padding, at
the Checkbox's own edge, as a list row, a table cell or a card's title row can.
The ring round the square stays whole, because it is drawn in the room the
Checkbox keeps. The story checks that every pixel of the ring lies inside the
host and that the ring is at least the square's two pixel perimeter. The tick
and the dash are its controls; a disabled Checkbox takes no focus.

### Named

Named with `aria-label`, the word Select and a person's name in the reader's
language, as a Contact Card names its own, and found by that name: the name
reaches the input the checkbox role belongs to, not the span round it. Its
Controls are off, since a name typed there would be one the page never draws in
both languages.

### LabelledBy

Named by a visible label it points at with `aria-labelledby`, on a checkbox of
its own, since that name would outrank an `aria-label` given beside it. Its
Controls are off for the same reason as Named's.

### TakesAnId

Given an id, which lands on the input the checkbox role is on, with a visible
label pointing at it by that id, as a form's label points at its field.

### BlankName

A checkbox whose name is only blank beside a named one: the blank one is left out
and reported, as a blank Icon Button is, and the named one renders.

### UnresolvedLabelledBy

Two checkboxes whose `aria-labelledby` comes to nothing, one pointing at an id no
element has and one at an element holding only blank text, beside one a visible
label names: the two are left out and reported, and the third renders.

### TargetIsLargerThanTheSquare

The pointer's target is larger than the square: the input round it is at least 24
by 24 while the square stays the design's 20 by 20, the browser's own hit-testing
one pixel inside each corner of the target lands on it, and in the test runner a
real click there, outside the square, ticks it.
