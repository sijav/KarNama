A status in the row of tabs along the top of the board on a phone, where one
column shows at a time: a small dot in the status's colour, its name and its
count of job opportunities, in a white pill with a thin grey edge. The chosen
tab is light blue with a blue edge, its name bold and both in blue. The row
ends with a dashed circle holding a plus, which makes a new status.

Each tab is a tab of the row the board makes, named by its name and count; the
chosen one is the row's one stop for Tab, and keyboard focus draws a blue ring
inside its edge.

## Props

### name

The status's name.

### count

How many job opportunities it holds, in the reader's digits.

### token

The status's colour, which the dot takes; leave it out for no dot.

### selected

Whether this is the tab whose column shows.

### onSelect

Called when the tab is pressed.

### id

The tab's id, for the column it shows to name it.

### aria-controls

The id of the column it shows.

## Stories

### Default

A tab measured against the design.

### Active

The chosen tab.

### Choose

A press chooses the tab.

### WithoutADot

A tab with no dot, its name first.

### Add

The add tab, the dashed circle with its plus.

### KeyboardFocus

The chosen tab reached by Tab, with its ring.

### InEnglish

The same tab in English, mirrored.

### Dark

The chosen tab in the dark scheme, in the theme's dark colours.
