A job opportunity on the board: its title, the company, how long ago it was
added, and a stripe in its status's colour.

The stripe runs down the card's start edge, the right in Persian, so a status
reads without reading; a status that no longer exists takes the new colour
rather than none. Pressing the card opens the job opportunity; the link icon,
when the posting has a link, opens the posting in a new tab. On a desktop, hover,
focus inside or selection brings a checkbox before the title and a delete at the
other end, over 200 ms, the title moving over to make room; at rest they are
folded away, unseen and taking no room, but still in the keyboard's path, so
Tab meets the checkbox, the title, the link and the delete in the order they are
drawn. A reader who asks for less motion sees each state at once. On a phone
there is no hover: three dots stay in view and open the card's menu, and a press
held on the card for half a second selects it. While the board is selecting,
every phone card shows its checkbox, over 250 ms; at rest it is folded away like
the desktop's, still in the keyboard's path, and unfolds when the keyboard's
focus is inside the card. A tap still opens the job opportunity, and lifting the
finger after a hold opens nothing. A long title or company is cut with an
ellipsis, so the card keeps its size.

## Props

### dragEvents

Native drag handlers attached to the card itself, without adding a layout wrapper.

### title

The job opportunity's title.

### company

The company's name.

### date

When it was added, already said the reader's way, such as «۲ روز پیش».

### status

The status's colour token. Anything else takes the new colour.

### link

The posting's link, or nothing when it has none.

### layout

`desktop`, the default, or `mobile` for the phone's card.

### selected

Whether the card is selected.

### selecting

Whether the board is selecting several. A phone's card then shows its checkbox
whether or not it is selected; the desktop's card ignores it.

### interactive

When unset, the card is drawn at rest with nothing to press but the link, the
design's Static state.

### onOpen

Called when the card is pressed; the page opens the job opportunity.

### onSelectedChange

Called with the checkbox's new state, and with true when a phone's card is held.

### onDelete

Called when delete is pressed; the page asks before it deletes.

### onChangeStatus

Called when Change status is chosen in the phone's menu.

## Stories

### Default

The desktop card at rest, measured against the design.

### Hover

The card under the pointer, the checkbox and delete in view. A press at the
title's start, where the folded checkbox lies, still opens the card.

### TabOrder

Tab from before the card meets the checkbox, the title, the link and the delete
in that order, the checkbox unfolding as it takes focus.

### Pressed

The card held down.

### Selected

The card selected.

### Static

The card drawn at rest, with nothing to press.

### Focus

The card focused by the keyboard, with its halo.

### Mobile

The phone's card at rest, its checkbox folded away and its three dots opening the
menu.

### MobileSelected

The phone's card selected; holding it again changes nothing.

### MobileSelecting

A phone's card while the board is selecting: its checkbox in view and unchecked,
the title moved over to make room.

### MobileHold

A press held on the phone's card selects it, and the click its release sends
opens nothing. After a hold whose release sends no click, the next tap opens the
card, and so does the keyboard's Enter. A contextmenu during the hold, which a
phone's browser may send, selects at once and shows no menu.

### MobileNotAHold

What does not select a phone's card: a tap, which opens it; a press that drifts,
that the browser cancels or that leaves the card; a second finger; a press on the
three dots; and a right click, whose menu is the browser's.

### MobileTabOrder

Tab from before a phone's card reaches its folded checkbox first, and the
checkbox unfolds as it takes focus.

### StripeInEveryColour

One card for each of the nine statuses.

### UnknownStatus

A status that no longer exists, in the new colour.

### CheckboxRingIsWhole

The checkbox focused by the keyboard, its whole focus ring inside the card.

### LongTitle

A title too long for the card, cut with an ellipsis.

### InEnglish

The card in English, the stripe on the left.
