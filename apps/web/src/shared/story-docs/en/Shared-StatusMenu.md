A column's menu, from the three dots in its header: rename, change colour and
delete, exactly three.

Delete is disabled while the column still holds job opportunities, and says
why beside itself. Change colour replaces the menu with the colour picker in
the same place, so the two are never on screen together; choosing a colour
closes it. Closing either gives focus back to the three dots.

## Props

### anchorEl

The three dots the menu opens from, or nothing while it is closed.

### colour

The status's colour now, which the colour picker shows as chosen.

### jobCount

How many job opportunities the column holds. Above 0, delete is disabled.

### onClose

Called when the menu or the colour picker closes.

### onRename

Called when Rename is chosen; the page turns the header into a field.

### onColourChange

Called with the colour chosen in the colour picker.

### onDelete

Called when Delete status is chosen; the page asks before it deletes.

## Stories

### Default

The three actions, and Rename handing over.

### DeleteBlocked

A column holding three job opportunities: delete is disabled and says why.

### ChangeColour

Change colour replacing the menu with the colour picker, and a colour chosen.

### InEnglish

The menu in English.
