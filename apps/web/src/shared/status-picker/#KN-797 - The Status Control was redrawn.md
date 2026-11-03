# KN-797 · The Status Control was redrawn

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and the job modal's header changes status with
it.

**Exit**, from the board: the plan lists every difference between 199:21 in the
copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its stories
then draw the original's version of every variant, each new variant with a story
of its own, in fa-IR and en-US, light and dark, with both story-docs entries;
sizes, gaps, radii and colours resolve through the tokens; DESIGN.md's section
is corrected; lint, tsc and its tests pass.

## Every difference, read 2026-11-03 with use_figma in both files

Default, Hover and Pressed draw the same in both: a pill of `radius/full`, 32
high, `spacing/2xs` round it and between its parts with `spacing/xs` beyond the
14 chevron, `color/bg/surface` with one of `color/border/default`, Hover on
`color/bg/surface-secondary`, Pressed on it too with 1.5 of
`color/border/focus`, and the small Status Chip inside. Their description is the
same too: after the board became columns the control left the card, and its one
use is the job modal's header. What differs:

1. **The example chip's label.** The copy put «پیشنهاد کار» on an interview
   chip, so each variant was 102 wide; the original says «مصاحبه», its own
   status's name, so each is 86 wide. The chip's colour is the interview pair,
   which KN-730 changed to teal.

Nothing in the component draws the label itself: it shows its status's name
from the data, and its stories already use the interview status's Persian name.

## The approach

No change to the component or its stories, which already draw the original.
DESIGN.md's section says where the control is used now and records the
reading, and its table row takes the node's id, `199:21`, where it said
`199:2`.

## How it is checked

The Status Control's and the Status Picker's stories, lint, tsc, and a look at
the control with the new teal chip.
