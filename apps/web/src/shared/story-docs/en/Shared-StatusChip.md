A status, as a label. Display only: it has no click target and no focus ring,
so it can sit on every card, column header and filter without putting a ring on
each. The clickable version is the Status Control, a separate wrapper.

**The label is record data, not a translation.** A user can rename any status, so
the chip shows whatever the status record is called. The five built-in names
are catalog messages only as the seed values a fresh account starts with.

## Props

### status

Which of the nine colour slots: the five built-ins and four custom slots. It
picks the fill and the text colour, never the words.

### label

The status's name, from its record. Pass the name the user sees, renamed or not.

### size

`S`, the default, everywhere. `M` only in the kanban column header: anywhere else
it is a departure from the design.

## Stories

### Default

The first built-in status, named as a fresh account first sees it.

### AllStatuses

All nine statuses at both sizes, in the design's order, each measured against
its Figma variant: height 24 or 28, 8 at each side, a full radius, the status's
container fill and base text.

### ColumnHeaderSize

Size M: 28 tall, with body's size and line height and label's weight and
tracking. The file binds no text style to it and there is no sixth type role.

### DisplayOnly

No role, no tabindex, and Tab passes it by.

### RenamedStatus

A built-in status the user renamed. The chip shows their name, from the record,
not the catalog's.
