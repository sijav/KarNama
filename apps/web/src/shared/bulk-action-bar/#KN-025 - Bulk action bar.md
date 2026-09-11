# KN-025 · Bulk action bar

Beside the bar. Recorded after the build, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** Both types match Figma, the bar appears
only when at least one row is selected, it reports the selection count, and it
is reachable by keyboard when it appears rather than trapping focus behind the
list.

## What was built

- From node 401:436, read with use_figma: Type=Jobs and Type=Contacts, the
  count at the inline start, the Jobs type's Select all and Change status,
  Delete, a divider and the close, in `bg/surface` with a one pixel edge drawn
  inside, radius lg, 12 and 16 of padding, fixed 24 above the bottom and
  centred as 243:595 places it. Its shadow, 16 percent black at 0 8 24 -4, is
  no effect style, so it joined the tokens as `elevation.bulkBar`, and
  DESIGN.md's claim that the bar added no token was corrected.
- The close is the Icon Button round a 20 icon; the Icon Button gained
  `iconSize` for it, `sm` by default.
- The count is the reader's digits and a noun from the catalog, plural by
  `Intl.PluralRules`. It says «فرصت شغلی» where the file says «آگهی», under the
  file's own terminology rule, KN-329.
- At 0 the bar is gone; its status region stays, empty, so the first count is
  announced. The page puts the bar before the list in its order, noted on
  KN-043 and KN-056, and a story proves Tab reaches it first.
- On a phone it keeps 16 from each side and wraps, where the file's mobile bar
  overflows, KN-328.
- A width of 1 in MUI's sx is 100 percent, which laid the divider across the
  whole bar; sizes of a pixel are written as pixels.
- Stories: Jobs, Contacts, NothingSelected, InEnglish, OnANarrowScreen and
  ReachedBeforeTheList; seen headless at 1440 and 390, light and dark.
