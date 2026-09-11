The bar that floats at the bottom of the screen while anything is selected: how
many are selected, what can be done to all of them at once, and a close that
clears the selection.

The job list's bar offers Select all, Change status and Delete; the network's
offers Delete alone. The bar shows only while at least one item is selected, and
the count is read out each time it changes. The page puts the bar before the
list in its order, so Tab reaches it without crossing the list; it floats at the
bottom all the same. While it shows, the page keeps room at its foot, or the
last rows sit under it. On a narrow screen the bar keeps 16 from each side and
wraps what does not fit.

## Props

### type

`jobs` for the job list, `contacts` for the network. It decides the noun in the
count and whether the job actions are offered.

### count

How many are selected. At 0 the bar is not shown.

### onClear

Called when the close is pressed; the page clears the selection.

### onDelete

Called when Delete is pressed; the page asks before it deletes.

### onChangeStatus

The job list's only. Called when Change status is pressed.

### onSelectAll

The job list's only. Called when Select all is pressed.

## Stories

### Jobs

The job list's bar with two selected, measured on a desktop screen.

### Contacts

The network's bar: Delete and the close.

### NothingSelected

Nothing selected, so no bar.

### InEnglish

The job list's bar in English with one selected, so the count is singular.

### OnANarrowScreen

The job list's bar on a phone, wrapped to fit.

### ReachedBeforeTheList

The bar before a list, as a page places it: Tab from the top reaches the bar
first.
