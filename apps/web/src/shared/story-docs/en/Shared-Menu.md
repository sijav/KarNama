The panel of actions that opens from a trigger such as a card's or a column's
three dots.

Each action is a row: plain, disabled, or destructive in red. The destructive
actions come last, after a divider, so they are told apart by their place and
their verb as well as their colour. A disabled action can still be reached by
the keyboard, so the reason it is disabled, shown beside it, can be read. The
menu closes on Escape or on a press outside it, and focus goes back to the
trigger. Choosing an action calls it; whether the menu closes is up to the
action.

## Props

### label

The menu's name for screen readers, already in the reader's language.

### anchorEl

The trigger the menu opens from, or nothing while it is closed.

### actions

The rows: each an id, a label in the reader's language, what choosing it does,
and optionally whether it is destructive, disabled, and why.

### onClose

Called when the menu is dismissed by Escape or by a press outside.

## Stories

### ItemStates

A menu with a plain, a disabled and a destructive action, measured against the
design.

### ClosesAndGivesFocusBack

The menu closed by Escape and by a press outside, focus back on the trigger each
time.

### InEnglish

The menu in English, hanging from the trigger's right edge.
