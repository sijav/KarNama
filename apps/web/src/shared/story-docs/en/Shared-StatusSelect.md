The status of a job opportunity being added, in the add modal's footer beside
Add: a field that says Status: with the chosen status's small chip and a
chevron. Pressing it opens the grouped status chips above it, with focus on the
one chosen; a choice closes it and the field shows the new status, the dashed
Add status chip closes it and asks for a new stage, and Escape or a press
outside closes it with nothing changed, focus back on the field.

The status is still chosen with chips: the field only shows it and opens them.

## Props

### stages

The stages, in the board's order.

### outcomes

The outcomes that close a job opportunity.

### value

The id of the chosen status.

### onChange

Called with the id of the status chosen in the menu.

### onAdd

Called when Add status is pressed in the menu; the page makes a new stage.

## Stories

### Default

The field measured against the design.

### Hover

Its edge under a real pointer. In Storybook itself, hover it yourself.

### Open

The menu above it, focus on the chosen status.

### Choose

Another stage chosen, which the field then shows.

### AddAStage

Add status pressed in the menu.

### Escape

Escape closes the menu with nothing chosen.

### InEnglish

The field and its menu in English, read from the left.

### Dark

The field and its menu in the dark scheme, in the theme's dark colours.
