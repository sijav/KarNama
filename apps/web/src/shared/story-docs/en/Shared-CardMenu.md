A job opportunity's menu on a phone, from its card's three dots: change status,
open the posting's link, and delete.

Delete comes last, after a divider. A posting with no link has no link to open,
so that action is left out. Choosing an action closes the menu.

## Props

### anchorEl

The three dots the menu opens from, or nothing while it is closed.

### onClose

Called when the menu closes.

### onChangeStatus

Called when Change status is chosen. Leave it out where a Status Control sits
beside the menu, as in the Job Modal's header, and the action is not offered.

### onOpenLink

Called when Open the posting link is chosen. Leave it out when the posting has
no link, and the action is not offered.

### onDelete

Called when Delete job opportunity is chosen; the page asks before it deletes.

## Stories

### Default

The three actions, and delete handing over.

### WithoutALink

A posting with no link: two actions.

### InTheJobModal

The Job Modal's menu: the posting's link and the delete, with no change of
status.
