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

### layout

Which screen's bar this is. The desktop toolbar draws it 36 tall, the phone 44,
and nothing else differs: the text sits 16 from the inline start in both, with
the 20 search icon, centred in whatever height the bar has. The width is the
container's, which is what makes both right — 320 is what the desktop toolbar
gives it, 358 is a phone's page inside its own 16 gutters. The phone's is the
default, because that is what the component set itself draws.

### label

The box's accessible name: what a screen reader says the box searches. The
board's is the default, and a page that searches something else passes its own —
the contacts page did not, and its readers were told it searched job
opportunities, KN-430.

### placeholder

The grey text in the empty box, naming the fields the search looks in. Defaults
to the board's, and follows `label` when a page searches something else.

### onChange

Fired with the text on every change, including a clear.

### onSearch

Fired with the text once typing pauses, and at once when the field is cleared.
Only ever with text the field shows: when the page replaces the value while a
search is waiting, or does not take what was typed, that search is dropped.

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

### ResetWhilePending

Typed, then emptied by the page before the pause ends: the field shows nothing,
and no search runs for the text it no longer shows.

### IgnoredKeystrokes

A page that keeps the value and ignores what is typed: each key is reported, the
field stays empty, and nothing is searched.

### OnTheDesktop

The toolbar's bar, 320 by 36, the size the board's and the contacts' toolbars
both draw.

### OnAPhone

A phone's bar, 358 by 44, full width inside the page's own gutters.
