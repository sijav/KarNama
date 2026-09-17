One column of the board: a status, its job opportunities, and a way to add
one to it.

The header carries the status in its large chip, the count in the reader's
digits, and at its other end the column's menu: rename, change colour, delete,
delete held back while the column still has job opportunities. The cards scroll
between the header and the plus at the bottom, which stays where it is and adds
a job opportunity to this status. An empty column says so in a dashed box, and a column whose cards a search hid says that instead, in the same box. On a
phone the status is chosen above the list, so the column is its cards alone. A
column can be collapsed to its header, a single button showing the status and
its count; pressing it opens the column. Which column starts that way is the
board's choice.

Pressing the status and count in an expanded header collapses the group when
the board supplies a collapse action. Its menu stays separate.

## Props

### dragEvents

Native drop handlers attached to the existing column frame.

### dropFeedback

An outline marks the current drop target or confirms a completed move.

### stableDropTarget

During a drag, the column receives pointer events directly so expanding its contents preserves the drop target.

### name

The status's name, shown in the chip and naming the column.

### colour

The status's colour token. Anything else takes the new colour.

### count

How many job opportunities the status holds, shown in the header. The menu
holds delete back while it is more than zero.

### layout

`desktop`, the default, or `mobile` for the phone's list.

### collapsed

When set, the column is its header alone, a button that opens it.

### children

The column's cards. None, and the column says it is empty, in one of two ways that `searchHidesCards` chooses between.

### searchHidesCards

Whether this status holds job opportunities that the search is hiding. It matters only when there are no cards to draw:
the box then says nothing at this stage matches the search, rather than saying the status has none yet, which would be
false of a status that holds some. The count is untouched either way and goes on showing the status's own total, so a
column can rightly read "one" beside a box saying the search found nothing here.

### onExpand

Called when a collapsed column is pressed; the board opens it.

### onCollapse

Called when the expanded header's fold control is pressed: the status, the count and a chevron, which is what says the
header can be pressed at all. The board gives it only to a column it starts folded, so every other header is its status
and count beside the menu, with nothing in it to press. Omit it for a column that cannot be collapsed.

### onAdd

Called when the plus at the bottom is pressed.

### onRename

Called when Rename is chosen in the column's menu.

### onColourChange

Called with the colour chosen in the column's menu.

### onDelete

Called when Delete is chosen in the column's menu.

## Stories

### Default

A column with three cards, measured against the design, its plus and its menu
pressed.

### ManyCards

More cards than the column holds: they scroll, and the plus stays at the bottom.

### Empty

A column with no cards, saying so.

### EveryCardFiltered

A column handed a list in which nothing renders, as a board that filters its
cards hands over: it says it is empty, as a column with no cards does. Its
status holds nothing at all, so that sentence is true of it and stays.

### SearchEmptied

The other half: the status holds one job opportunity and a search is hiding it.
The count still reads one, because a column's count is its own and never the
search's, so the box is what answers the search.

### Collapsed

A column collapsed to its header and count; pressing it asks to open it.

### Expanded

An expanded column whose header folds it again, carrying the same chevron its collapsed header shows, and keeping the
original header height.

### LongName

A long status name, cut in its chip, the menu still in reach.

### Mobile

The phone's column, its cards alone.

### MobileEmpty

The phone's column with no cards.

### InEnglish

A column in English, the chip on the left.
