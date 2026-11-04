The person modal's relationship label, which is optional.

«Label» over the choices, which wrap from the start of the line: the four
defaults, «Acquaintance», «Former colleague», «Recruitment specialist» and
«Interviewer», the chosen label when it is the reader's own, then «New label».
A press chooses a label and another press takes it off.

«New label» becomes a box to type in. Under it the reader's own labels that
match what is typed are offered, then a row that makes it a new label. The
arrows move through them, Enter chooses or makes one, and Escape or a press
outside leaves it.

Beside each of the reader's own labels, «⋯» offers «Rename» and «Delete label».
A rename is typed in its row and kept with the tick. A delete asks in its row,
never in a second window over the modal, and says how many people the label
comes off; the people themselves stay. The four defaults cannot be renamed or
deleted.

## Props

### value

The chosen label's id, a default's or one of the reader's own, or nothing.

### labels

The reader's own labels, with how many people carry each.

### onChange

Called with the label chosen, or with nothing when it is taken off.

### onCreate

Called with the name of a new label to make.

### onRename

Called with a label's id and its new name.

### onDelete

Called with the id of a label to delete.

## Stories

### Default

The picker in Persian with nothing chosen, measured against the design.

### Selected

A default chosen.

### ChoosingAndTakingOff

A label chosen, then taken off.

### Typing

«New label» pressed and the start of a name typed, with the reader's labels
that match and the row that makes a new one.

### ChoosingYourOwn

One of the reader's labels chosen with the keyboard.

### Creating

A new name typed and made with Enter.

### Escaping

A new label left with Escape.

### OptionMenu

«⋯» beside one of the reader's labels, offering «Rename» and «Delete label».

### Rename

A label renamed in its row and kept with the tick.

### DeleteConfirm

A delete asked in its row, then kept.

### AfterDelete

A label deleted, and the list without it.

### InEnglish

The picker in English, with an English label found.

### Dark

The picker and its suggestions in the dark scheme, in the theme's dark
colours.
