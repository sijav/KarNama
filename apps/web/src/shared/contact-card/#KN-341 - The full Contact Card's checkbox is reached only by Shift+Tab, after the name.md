# KN-341 · The full Contact Card's checkbox is reached only by Shift+Tab, after the name

Beside the Contact Card. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** Tab from before the card reaches the
checkbox, then the name, then the delete, in that order, with the row still
keeping its 30 and the name still moving by 28, and a story tabs through them.

## What was done

- The full card's checkbox and delete were `display: none` at rest, which took
  them out of the keyboard's path. They now fold as the job card's do, KN-015:
  at rest the checkbox gives back its 20, the 8 after it and its root's four,
  and the delete has no width and gives back the 8 before it, both transparent
  and deaf to the pointer; hover, focus inside or selection unfolds them. A
  real Tab reaches the folded checkbox first, which unfolds it.
- No motion was added: DESIGN.md gives the Contact Card's hover none, and the
  old reveal was instant too.
- FullTabOrder presses real Tabs from before the card through the checkbox,
  the name and the delete, then finds the row at 30 and the name moved by 28;
  Full now finds the checkbox unseen and the delete at no width at rest. Both
  failed on the old card; FullHover and the ring story still pass.
