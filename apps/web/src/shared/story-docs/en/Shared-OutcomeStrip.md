A closed outcome on the board, after its stages: a tall narrow strip in light
grey with the outcome's icon, its name and how many job opportunities it holds
in a small pill. Pressing it opens it into a full column of its job
opportunities, which the board draws.

Accepted is drawn in orange with a check and rejected in red with a cross; no
response, with a clock, and withdrawn, with a way out, stay grey. The strip is a
button named by its name and its count, and keyboard focus draws a blue ring
inside its edge.

## Props

### outcome

`accepted`, `rejected`, `no-response` or `withdrawn`, which sets the icon and
the colours.

### name

The outcome's name, as the board shows it.

### count

How many job opportunities it holds, in the reader's digits.

### onOpen

Called when the strip is pressed; the board opens its column.

## Stories

### NoResponse

No response, measured against the design.

### Accepted

Accepted, in the orange pair.

### Rejected

Rejected, in the red pair.

### Withdrawn

Withdrawn, in the strip's greys.

### Open

The strip pressed.

### KeyboardFocus

Reached by Tab, with its ring, and opened with Enter.

### InEnglish

Accepted in English.

### Dark

Rejected in the dark scheme, in the theme's dark colours.
