A 20 by 20 checkbox with three marks: empty, a tick, and a dash.

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

### aria-label

Accessible name, for the case where no visible label is associated with it. A
checkbox with neither this nor `aria-labelledby` is unusable by screen reader.

### aria-labelledby

Id of the element that labels it, when there is a visible label to point at.

## Stories

### Unchecked

The default. The frame is the surface colour with the default border.

### Checked

The brand fill with a white tick.

### Indeterminate

The brand fill with a white dash, and the assertion that the property survives
rather than the markup.

### Disabled

Greyed and inert. The story clicks it to prove it does not change, because a
disabled control that still responds is worse than one that was never disabled.

### KeyboardOnly

Tab to reach it and Space to toggle it, with no pointer used anywhere. Bulk
selection is what this is for, and a selection control that needs a mouse
excludes exactly the people most likely to be selecting in bulk.
