The picker the related people tab's Add person opens, under that button. It
searches the reader's network by name, role or company, under the heading From
your network, and marks the people already linked as linked. Choosing someone
links them; with something typed, a last row offers to add that name to the
network as a new person, which opens the add form with the name filled, and
Enter does the same when no one can be chosen. Either closes the picker, as
Escape and a press outside do.

## Props

### anchorEl

The button it opens under; null while it is closed.

### people

The people of the reader's network.

### linkedIds

The people already linked to the job opportunity, who are marked and cannot be
chosen.

### onPick

Called with the person chosen.

### onCreate

Called with the name typed, trimmed, to add as a new person.

### onClose

Called when the picker closes.

## Stories

### Default

The picker open, measured against the design.

### Searching

What is typed narrows the network, and the add row follows.

### Choosing

A press links someone and closes the picker.

### Creating

A name no one has: nothing found, and the add row, or Enter, asks to add them.

### Keyboard

The arrows move through the people who can be chosen, Enter links one, and
Escape closes.

### InEnglish

The picker in English.

### Dark

The picker in the dark scheme, in the theme's dark colours.
