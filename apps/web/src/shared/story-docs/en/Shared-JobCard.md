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
there is no hover: three dots stay in view and open the card's menu, and the
checkbox shows while the card is selected. A long title or company is cut with
an ellipsis, so the card keeps its size.

## Props

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

### interactive

When unset, the card is drawn at rest with nothing to press but the link, the
design's Static state.

### onOpen

Called when the card is pressed; the page opens the job opportunity.

### onSelectedChange

Called with the checkbox's new state.

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

The phone's card, its three dots opening the menu.

### MobileSelected

The phone's card selected.

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
