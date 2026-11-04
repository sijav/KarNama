The source field of the add form and the job modal's info tab: where the job
opportunity was found.

It shows the source, or asks for one; when the posting's link filled it in, a
line under the field says so. Pressing the field opens a menu above it, since
the field ends a scrolling form: the reader's own sources, then the common
ones. Typing narrows the menu and quietly folds what is typed, so Arabic and
Persian letters, spaces and half-spaces, letter case and a common source's
English name all reach the one source; when nothing typed is exactly a source,
the menu offers the ones a letter away and the typed name to make a source of.
The arrows move through the menu, Enter chooses, and Escape or leaving the
field puts the value back.

## Props

### value

The chosen source's name, or nothing.

### own

The reader's own sources, the ones they have used before, each with the other
spellings that mean it.

### common

The sources the product knows, each with its name in the other language; one
the reader already has is listed under their own.

### autoFilled

Whether the posting's link filled the source in, which the line under the field
says. The page turns it off once the reader chooses.

### onChange

Called with the name of the source chosen, or of the one made from what was
typed, in its one spelling.

## Stories

### Default

The source filled in from the link, measured against the design.

### Empty

No source yet, asking for one.

### Hover

The field under the pointer.

### Open

The menu: the reader's sources and the common ones, the chosen one checked.

### Typing

A name a letter away from one of the reader's: the menu offers that one, then
making the typed name.

### Choosing

A source chosen with a press, which closes the menu and takes the line away.

### Creating

A name nobody has yet, made a source with Enter.

### QuietNormalisation

The reader's source typed with an Arabic letter is that source, kept in its one
spelling.

### TheOtherName

A common source typed by its English name is that source.

### Keyboard

Tab focuses the field, the arrows open and move through the menu, and Escape
closes it with nothing chosen.

### LeavingPutsItBack

What is typed and not chosen goes when the field loses focus.

### InEnglish

The field and a name a letter off, in English.

### Dark

The field and its menu in the dark theme.
