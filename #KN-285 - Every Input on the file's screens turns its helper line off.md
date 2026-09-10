# KN-285 · Every Input on the file's screens turns its helper line off, while the Input always reserves it

Beside `DESIGN.md`, which is where the answer lands.

**Why, from the board.** Match the design exactly is the owner's standing rule,
and every screen will be taller than drawn unless this is settled before screens
are composed; the decision the component made is good for errors and wrong for
the drawn layout, so the owner chooses.

**Exit condition, from the board.** The owner has answered, through the question
tool, whether an Input on a screen keeps its message line reserved as the
component does or drops it as the 91 screen instances draw it, and where an
error on a field with the line off is shown; DESIGN.md records the answer as the
owner's, with the date; and if the line can be off, a card for the change
exists.

## The facts the question rests on, read with use_figma on 2026-09-10

- The Input set, 95:38, has a Helper Text boolean. In the Error variant, 95:24,
  the error message IS that line: «این فیلد نمی‌تواند خالی باشد» sits in the node
  the boolean shows and hides. So in the file, a field with the line off shows
  no message, and a field with it on is the 90 tall variant: 16 of label, 4, 44
  of field, 4, 22 of line. Off, it is 64.
- All 91 Input instances on the Screens canvas, 5:7, set the line off, keep the
  label on, and use no icon.
- The Input as built always draws the line, KN-011's decision that an error
  appearing never moves the field, so every field is 90 where the screens draw
  64: a form of five fields is 130 taller than the file.
- KN-254 decided an error needs a message: a field marked invalid with nothing
  to read is announced invalid with no reason.

## What gets asked

One question, the trade named on each option:

1. **Follow the screens** (recommended): the line is drawn only when there is
   something to say, a helper or an error. A field with neither is 64 as the
   screens draw it; an error adds the line with its message, which is the file's
   own Error variant, and what is below moves down 26 while it shows.
2. **Keep the line reserved**: every field 90, errors never move anything, and
   every screen is 26 taller per field than the file.
3. **Reserve only where a field can fail**: the line is off by default as the
   screens draw it, and a field that validates asks for it, so its error does
   not move the form; one more thing each form has to get right.
4. **Take it to the designer first**: keep the line for now and ask the designer
   what a screen's field shows when it fails, since the file draws no failing
   field on any screen.

Recommended because it is the file in both states: at rest the field is the
screen's 64, and failing it is the component's own Error variant, message and
all; the movement is the design's own step between two drawn states.

## What changes

- `DESIGN.md`: the answer under the owner's decisions of 2026-09-10.
- `agent/board.json`: if the line can be off, a card for the change.
- `agent/scripts/verify/KN-285.mjs`: the record bound to its own paragraph with
  the question tool named there, and the card when there is one.

## The check, and what changed after it

The second model found the question sound and option 1 an honest
recommendation: WCAG allows the 26 pixel shift, and an inline error in text is
an accepted way to identify one, the file's own Error variant. It found what
the question left out: an error that appears while focus stays in the field is
a status message under WCAG 4.1.3 and needs a live region, which the Input
does not have today, whichever option is chosen. That is its own card, KN-286,
and the question says so, so the owner is not choosing it away.
