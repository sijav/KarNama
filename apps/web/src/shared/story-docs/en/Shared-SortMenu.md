A board column's own orders, opened from the caption in its header. There is
no order for the whole board: each column has its default, first and marked as
the default, and the reader can pick another, which closes the menu and changes
the caption. The saved column orders by deadline, the applied column by how long
it has waited, the interview column by the interview's date and the offer
column by arrival, newest first; each can also go newest or oldest first, by
its own date, or by company name. A stage the reader made orders as the offer
column does, and its menu also edits and deletes the stage; the default stages
cannot be edited or deleted. The menu hangs just below the header, from its end,
and focus starts on the order the column is in.

## Props

### anchorEl

The column's header, which the menu hangs from; null while it is closed.

### orders

The column's orders, its default first, as `columnOrders` gives them.

### value

The order the column is in.

### onChange

Called with the order chosen.

### onClose

Called when the menu closes, on a choice, Escape or a press outside.

### actions

For a stage the reader made, `onEdit` and `onDelete`, which edit and delete
it.

## Stories

### Saved

The saved column's menu, measured against the design.

### Applied

The applied column's orders, the waiting time first.

### Interview

The interview column's orders, the interview's date first.

### Offer

The offer column's three orders, by arrival first.

### Custom

A stage the reader made, with editing and deleting it after a divider.

### Choosing

A press on another order chooses it, closes the menu and changes the caption;
opening the menu again shows it ticked.

### Keyboard

Focus starts on the column's order, the arrows move it, and Escape closes the
menu without choosing.

### CustomActions

Editing and deleting the stage close the menu and ask for them.

### InEnglish

The saved column's menu in English, hanging from the header's right.

### Dark

A stage the reader made in the dark scheme, in the theme's dark colours.
