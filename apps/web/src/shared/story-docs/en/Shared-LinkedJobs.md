The job opportunities linked to a person, in the person's window. Under its
label, either a line saying none is linked yet or a list of them, each a row
that can unlink it; then a button that opens a picker under it. The picker
searches the reader's job opportunities by title or company, marks the ones
already linked as linked, and links the one chosen, by a press or by the arrows
and Enter, closing as it does; Escape and a press outside close it too.

## Props

### linked

The job opportunities linked to the person, in the order the list shows them.

### jobs

Every job opportunity of the reader's, which the picker offers.

### onLink

Called with the job opportunity chosen in the picker.

### onUnlink

Called with the job opportunity a row unlinks.

## Stories

### Empty

Nothing linked yet, measured against the design.

### Filled

Two linked, in their bordered list.

### Picking

The picker open, measured against the design: the search, the linked ones
marked, the others with their status.

### Choosing

A press links a job opportunity, and the list then holds it.

### Searching

What is typed narrows the list, and with nothing found it says so.

### Keyboard

The arrows move through the ones that can be chosen, Enter links one, and
Escape closes the picker.

### Unlinking

A row's unlink button takes it out of the list.

### InEnglish

In English, the picker hanging from the button's left edge.

### Dark

In the dark scheme, in the theme's dark colours.
