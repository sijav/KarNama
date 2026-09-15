A field that opens a list to choose from: its label above, the choice or a
prompt inside, and a chevron at the end.

It is the Input's family, 44 tall with the same label and edge. Pressing it, or
Enter, Space or an arrow key on it, opens the list below it. In the list the
arrows move, Home and End jump to the ends, and typing a letter reaches the
first option starting with it; Enter chooses and closes, and Escape or Tab
closes without choosing. Each time, focus goes back to the field. A choice that
is too long for the field is cut with an ellipsis.

## Props

### label

The field's label, already in the reader's language. It names the field for
screen readers.

### options

What can be chosen: each a value, a label in the reader's language, optionally
disabled, and optionally something drawn before the label, such as a language's
flag. When only one can be chosen, the field shows it before the chosen name
too; a multiple select lists the names alone.

### value

The values chosen, as a list: at most one unless the select is multiple. An
empty list shows the prompt. A select that is not multiple reads only the first
value, in its field and in its list.

### multiple

When set, more than one option can be chosen, the list stays open after each
choice, and the field lists the names.

### placeholder

The prompt shown while nothing is chosen, already in the reader's language.
Leave it out for the design's «انتخاب کنید…».

### disabled

When set, the field is grey, cannot be opened and is out of the tab order.

### onChange

Called with the new list of values after each choice.

## Stories

### Default

Nothing chosen, the prompt showing.

### Filled

One choice showing.

### Focused

The field focused by the keyboard, its edge two pixels of blue.

### Disabled

The field disabled.

### Open

The list open, the chosen option checked and one option disabled.

### ByKeyboard

The list driven by the keyboard alone: arrows, Home, End, a typed letter, Enter,
Escape and Tab.

### Multiple

Two choices at once, as the employment type allows.

### TwoValuesWithoutMultiple

A single select handed two values: the field shows the first, and the list
checks only its row.

### InEnglish

The field in English, the chevron at the right.

### Leading

Options led by a language's flag, as Settings offers them: each row's flag
twelve pixels from its edge with the name eight after it, and the chosen
language's flag in the field before its name.
