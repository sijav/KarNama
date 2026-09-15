The code a reader was sent, typed into five boxes: the Code Row of the design's
Auth Code frames, 407:6981 and 407:7052, which the design keeps as a frame on the
screen rather than a library component. The sign-in code step uses it.

The boxes are drawn over one real field, so typing, pasting a whole code, a phone's
one-time-code autofill and Backspace are the field's own, and a screen reader meets
that one field, named by the label, and none of the digits the boxes draw. The code
runs left to right whatever the page's language, as a phone number does, and each
box shows its digit in the reader's digits.

What arrives keeps its digits, Persian and Arabic-Indic ones read as Latin, and the
first five; the value handed back is in Latin digits. The field's own selection
stays, so selecting everything and typing a digit replaces the code.

While the field has focus, the box at the caret, where the next digit goes, draws
two pixels of the focus colour, and a press on a box puts the caret there. An error,
which the design does not draw for the row, turns every resting edge red and says
itself in the line under the row, announced as it appears.

## Props

### label

The field's name, since the design draws no label over the boxes: what a screen
reader says for the field.

### value

The code so far, in Latin digits, five at most.

### onChange

Said with the code after every change: its digits only, in Latin, the first five.

### error

Why the code was refused, said in the line under the row. A blank one is no error.

### enterKeyHint

What the key that finishes the field says on a phone's keyboard. The sign-in step's
says go.

## Stories

### Playground

The field with every control, empty until something is typed or given.

### AsTheFrame

Three digits typed, measured against the design's desktop row: five boxes filling a
row of 376, 8 apart and 56 tall, radius md, the resting edge one pixel of the
default border and the fourth box two of the focus colour, each digit 20 at SemiBold
on a line of 32, from the left.

### Typing

A code typed digit by digit, each in the next box, and the code handed back; a sixth
digit is not taken.

### Pasting

A whole code pasted with words around it, in Persian digits: the digits are the code,
and nothing else is kept.

### Backspace

Backspace takes digits back one at a time, and the focus edge moves back with the
caret.

### SelectingToReplace

The field's own selection: everything selected and a digit typed replace the code, a
press on the second box puts the caret there, and a double press that selected
something keeps it.

### ReadsAsOneField

What a screen reader and a phone meet: one field named for the code and none of the
boxes' digits, a numeric keyboard, a key that says go, and the one-time-code hint,
with no length limit that would cut a pasted code.

### WholeCodeAtOnce

A whole code written into the field in one change, as a phone's autofill writes it,
fills the five boxes. A phone's own suggestion also needs the text message to name
the site, which no story can show.

### Refused

A code refused: the reason in the line under the row, announced, every box's edge in
the error colour and the field marked invalid; focused, the current box keeps its
focus edge.

### EmptyError

A blank error is no error: nothing is said, no edge turns red, and nothing is marked
invalid.

### InEnglish

A whole code in English, in Latin digits, still left to right.
