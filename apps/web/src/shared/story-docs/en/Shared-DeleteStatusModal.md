The question asked before a stage the reader made is deleted, titled with the
stage's name in quotation marks. An empty stage simply goes: the modal says it
leaves the board and holds nothing, with Cancel and Delete status. A stage that
holds job opportunities says how many and asks where they go, with a list of the
other stages under it, starting on the first, and Cancel and Delete and move.

Cancel holds the focus as it opens, since the deletion cannot be undone; the
close at the top, Escape and a press outside it cancel too. The default stages
have no delete, so this is never asked of them.

## Props

### open

Whether the modal is shown.

### name

The stage's name, as the reader gave it.

### count

How many job opportunities the stage holds; 0 for an empty one.

### destinations

The other stages, in the board's order, which the job opportunities can go to;
the first is chosen to start with.

### onDelete

Called with the stage the job opportunities go to, or null for an empty stage.

### onCancel

Called by Cancel, the close, Escape or a press outside.

## Stories

### Empty

An empty stage's question, measured against the design.

### WithJobOpportunities

A stage holding two, the list starting on the first stage.

### ChooseAnother

Another stage chosen in the list, which they go to.

### Cancel

The close, then Escape, each deleting nothing.

### OneInEnglish

One job opportunity, in English, counted in the singular.

### InEnglish

The same question in English, read from the left.

### Dark

The modal in the dark scheme, in the theme's dark colours.
