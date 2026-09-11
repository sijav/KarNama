# KN-264 · The Status Chip's dir=auto is proved in one direction, and DESIGN.md overstates it

Beside the chip. Recorded after the fix, on 2026-09-11, under the owner's rules
of that day.

**Exit condition, from the board.** With KN-062's fixtures, a story renders a
long Latin-led name in the Persian interface and asserts the chip is ltr and
cut at its end, a digit-led Persian name resolves rtl, and DESIGN.md says what
happens to a name with no letter at all instead of 'always'.

## What was done

- The story fixtures gained three status names, the same record data in both
  languages: one led by a Latin word, one Persian name led by digits, and one
  with no letter at all.
- LatinLedInPersian: in the Persian interface the chip runs ltr and the name
  overflows its 276, cut at its end. DigitLedResolvesRtl: in the English
  interface the digit-led Persian name runs rtl. NoLettersFollowsThePage: the
  letterless name takes the English page's ltr.
- DESIGN.md says the first letter decides, and that a name with no letter
  follows the page, where it said the ellipsis always cuts the end.
