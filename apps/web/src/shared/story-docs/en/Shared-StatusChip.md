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

Rendered from its args: every control changes the chip.

### FromArgs

A custom slot at the column-header size, nothing like the defaults, to show the
chip follows its args.

### SeededName

The first built-in status, named as a fresh account first sees it. A fixed
render, so no control is offered.

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

### LongName

A status renamed to something long, in the 276 of a kanban column header: the
chip stops at the column's edge and cuts the name with an ellipsis, and the whole
name is still its text.

### LongNameInEnglish

The same Persian name with the English interface. The chip takes its direction
from the name, so the ellipsis still cuts the end of it and its start stays in
view.

### LatinLedInPersian

A name led by a Latin word in the Persian interface: the chip runs left to
right, so the ellipsis cuts the name's end.

### DigitLedResolvesRtl

A Persian name led by digits in the English interface: the first letter
decides, and the chip runs right to left.

### NoLettersFollowsThePage

A name with no letter at all follows the page's direction.
