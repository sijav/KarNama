A status chosen with chips in two groups: the stages a job opportunity moves
through, In progress, which the reader can add to with the dashed Add status
chip at the end of their row, and the outcomes that close it, Closed, which are
fixed, under a thin divider. The chosen one is ringed in blue.

It is one choice across both groups, with one Tab stop: the arrows move across
both rows the way they point and choose as they move, and the add chip is the
next stop. Each group is named by its caption and the whole by Status.

## Props

### stages

The stages, in the board's order.

### outcomes

The outcomes that close a job opportunity, in the order they are drawn.

### value

The id of the chosen status, a stage or an outcome.

### onChange

Called with the id of the status chosen.

### onAdd

Called when Add status is pressed; the page makes a new stage.

### autoFocus

Puts focus on the chosen status as the picker mounts, as a dialog opening on it
does.

## Stories

### Default

The picker measured against the design, a stage chosen.

### ChooseAnOutcome

An outcome chosen, which leaves no stage chosen.

### ArrowsAcrossTheGroups

From the last stage, the arrow onward moves to the first outcome and chooses it.

### AddAStage

Add status pressed.

### InEnglish

The same picker in English, read from the left.

### Dark

The picker in the dark scheme, in the theme's dark colours.
