The search field of the board: a search icon, the field, and once something is
typed, a control to clear it.

It searches job opportunities by title, company or note. What is typed is
reported at once, and the search itself runs once typing pauses for a moment,
with every key typed so far, the last one included, so a fast typist is not
searched letter by letter and never loses the final letter. Clearing empties
the field, searches for nothing straight away, and puts focus back in the field
to type again. The field has its own name for screen readers, since the grey
hint inside it is not a label.

## Props

### value

The text in the field, when the page keeps it.

### defaultValue

The text the field starts with, when the field keeps it itself.

### onChange

Fired with the text on every change, including a clear.

### onSearch

Fired with the text once typing pauses, and at once when the field is cleared.

## Stories

### Default

Empty, with the hint and the default edge, in Persian.

### Focused

The field focused: the edge turns blue and thickens, and nothing inside moves.

### Filled

A search typed, in the primary text colour, with the clear control at the end.

### Clearing

The clear control pressed: the field empties, the search runs for nothing, and
focus returns to the field.

### Debounced

A word typed quickly: no search while the keys come, then one search with the
whole word.

### InEnglish

The bar in English, the icon at the left.
