# KN-016 · Search bar, 3 states

Beside the bar. Recorded after the build, on 2026-09-11, the owner having
asked for speed.

**Exit condition, from the board.** Three states match Figma, clearing
restores the default state and returns focus to the field, and the input is
debounced without dropping the final keystroke.

## What was built

- From node 155:92, read with use_figma: 44 tall, radius md, 16 at each side
  and 8 between; the 20 search icon at the inline start in `text/secondary`;
  the field at 14 on 22, the hint «جستجو در عنوان، شرکت یا یادداشت» in
  `text/secondary` and typed text in `text/primary`; a one pixel
  `border/default` edge, two pixels of `border/focus` while focused, drawn
  inside on a pseudo-element so the text never moves; Filled adds a 20 square
  clear control with the 16 x at the inline end.
- The field is a search box with its own name, since the hint is not a label;
  the browser's own clear button is hidden. Typing reports at once through
  `onChange` and searches through `onSearch` after 300 ms of quiet, with the
  value after the last key; clearing cancels a pending search, searches for
  nothing at once and focuses the field. The 300 is the build's, the file draws
  no timing.
- Stories: Default, Focused, Filled, Clearing, Debounced, InEnglish; the typed
  text comes from the story fixtures.
