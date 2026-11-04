The order a board column is in, as a small caption at the end of its header,
with a ⋯ after it: «به ترتیب مهلت ⋯». It is grey, and darkens under the
pointer. Pressing it opens the column's sort menu, which hangs from the header
just below it. Its name begins with the caption and says which column it
orders, and it says that it opens a menu and whether the menu is open.

## Props

### caption

The column's order, as the caption says it.

### column

The column's name, which its name says.

### open

Whether the column's sort menu is open.

### onOpen

Called when it is pressed, to open the menu.

## Stories

### Default

The saved column's caption, measured against the design.

### Hover

Under a real pointer the caption darkens and the ⋯ stays as it was. In
Storybook itself, hover it yourself.

### KeyboardFocus

Reached by Tab with the focus outline, and Enter asks for the menu.

### Open

While its menu is open it says so, and looks as it does at rest.

### InEnglish

The caption in English, the ⋯ on its right.

### Dark

The caption in the dark scheme, in the theme's dark colours.
