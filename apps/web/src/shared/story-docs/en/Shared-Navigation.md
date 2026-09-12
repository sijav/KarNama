The product's navigation, placed: the sidebar beside the page on a wide screen,
the tab bar pinned to the foot of a narrow one. The line between them is 900
pixels wide.

## Props

### selecting

Whether the page under the shell is selecting. Below md the tab bar gives its
place to the Bulk Action Bar while it is, node 185:19: the two are fixed to the
same place at the same layer, so they sat on top of each other, KN-356. The
sidebar, which is beside the page rather than under it, is untouched.

### current

The place the reader is on: `jobs`, `add` or `network`.

### userName

The signed-in user's name, shown in the sidebar.

### userPhone

The signed-in user's phone, shown in the sidebar.

### onNavigate

Called with the place pressed.

### onSignOut

Called when «خروج» is pressed in the sidebar.

## Stories

### Default

The navigation at the width of the screen it is shown on.

### Breakpoint

The tab bar on a phone's width and the sidebar on a desktop's.
