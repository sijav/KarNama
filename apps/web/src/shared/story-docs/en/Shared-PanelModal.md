The larger modal frame the contact and job opportunity modals share: a header, a
divider across the whole width, the body, another divider, and the actions.

It traps focus, closes on Escape, the close or the scrim, and gives focus back,
as the smaller shell does. The actions sit at the end of the footer; with an
aside, such as Edit's delete, they move to the start and the aside takes the
end.

## Props

### open

Whether the modal is showing.

### title

The modal's title, already in the reader's language. It names the dialog.

### width

The modal's width: 560 for the contact modal.

### onClose

Called when Escape, the close or the scrim closes the modal.

### children

The body.

### actions

The footer's buttons, the least drastic first.

### aside

An action set apart at the other end of the footer, such as a delete.

## Stories

### Panel

The frame with a field for a body, measured against the design.

### WithAnAside

The footer with a delete set apart.
