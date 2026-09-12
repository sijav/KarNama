A person in the network, on a card: a contact has no detail page, so everything
about them is here.

The full card shows the name, the role and company, and then the email, the
phone, the job opportunity they are linked to and their LinkedIn, each after its
icon; a field the contact lacks is left out. Email and phone are links that open
the mail app and the dialler. Pressing the card anywhere else opens the contact,
ready to edit. On hover, with focus inside, or when selected, a checkbox appears
before the name and a delete at the other end; at rest both are folded away but
still in the keyboard's path, so Tab meets the checkbox, the name and the delete
in the order they are drawn. The compact card, for the phone,
shows an avatar, the name and role, and keeps its mail and delete in view. Long
values are cut with an ellipsis rather than wrapped.

## Props

### contact

The contact: name, role, company, email, phone, the job opportunity they are
linked to, and LinkedIn. Any but the name and role may be missing.

### layout

`full`, the default, or `compact` for a list on a phone.

### selected

Whether the contact is selected, which shows the checkbox ticked and the card in
the brand's pale blue.

### onOpen

Called when the card is pressed; the page opens the contact's modal.

### onSelectedChange

Called with the checkbox's new state.

### onDelete

Called when delete is pressed; the page asks before it deletes.

## Stories

### Full

The full card at rest, measured against the design.

### FullHover

The full card under the pointer, the checkbox and delete in view.

### FullTabOrder

Tab from before the card reaches the checkbox, then the name, then the delete,
each unfolding as it takes focus. The story presses a real key when it runs as
a test; in Storybook itself, press Tab yourself.

### FullSelected

The full card selected.

### CheckboxRingIsWhole

The checkbox focused by the keyboard, its whole focus ring inside every box
that clips.

### LongValues

A contact whose name, role and email are too long, cut with an ellipsis.

### Compact

The compact card at rest.

### CompactSelected

The compact card selected.

### WithoutEmailOrPhone

A contact with only a name and a role.

### InEnglish

The full card in English.

### NameOnly

A contact with only a name: the card holds the name alone, with no empty role
line and no divider.

### NameOnlyCompact

The compact card for a contact with only a name: the name alone beside the
avatar.

### WritingToThem

The compact card's mail control, which is a link to the address rather than a
button, as the full card's own email row is.
