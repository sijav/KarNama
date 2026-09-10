A pill that filters the board by one status, and shows how many are in it.

It is both the filter and the summary. How many sit in each status is the answer
to "where do I actually stand", which is the archive scenario in a single line,
so the count is not decoration on a filter — it is half the point.

A `button` with `aria-pressed`, not a checkbox. It is a toggle that filters, and
`aria-pressed` announces on and off without inventing a form control the design
does not draw.

## Props

### label

The status name. A plain string, deliberately not a catalog message: `DESIGN.md`
settles that a status label is record **data**, because the user can rename any
status, so it arrives already in whatever they called it.

### count

How many records sit in this status. Rendered through `i18n.number`, so a
Persian reader sees «۳» and an English reader sees «3». A raw number would be
the one untranslated thing on the screen.

### selected

Whether this filter is on. Drives both the fill and `aria-pressed`.

### onToggle

Called with the state the chip is moving **to**, so a caller never has to invert
it.

## Stories

### Default

Off, in Persian. The count is in Persian digits.

### Selected

On. The assertion is on `aria-pressed`, not on the colour: a fill change alone
tells a screen reader nothing, and this chip **is** the filter state.

### InEnglish

The same component with Latin digits. The label does not translate, because it
is the user's own text.

### Counting

A four-figure count, to show that grouping is locale business too and not only
the digits.

### Toggling

A click reports the state it is moving to.

### KeyboardOnly

Selecting and deselecting, both by keyboard, with no pointer anywhere. A filter
you can turn on but not off is a trap.
