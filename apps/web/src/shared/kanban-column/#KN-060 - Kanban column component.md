# KN-060 · Kanban column component

Beside the column. Recorded after the build, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** The column renders with cards, with none,
and at the mobile width, its header shows the live count, the Size=M chip is
used only here, the Add Card row stays pinned at the bottom as the column
scrolls, and every state matches its Figma node. A column can render COLLAPSED
to a count instead of its cards, and expands on click; the board decides which
column starts collapsed, this component does not know which one it is.

## What was built

- From node 241:125, read with use_figma: the column 300 wide and the board's
  height on `bg/surface-secondary`; the 40 header with the Size=M chip, the
  count in the reader's digits and the menu's trigger, the 32 Icon Button giving
  its room back so it lays out as the file's 16 icon; the cards scrolling
  between the header and the pinned Add Card row, 241:142.
- The trigger opens the Status Menu, KN-018, with the column's count, so delete
  is held back while the column has job opportunities.
- An empty column shows 241:46's dashed message; the phone's column, 241:176, is
  its cards alone. The Add Column tile of 241:34 is exported beside it.
- Collapsed, which the file does not draw, is the frame holding its header
  alone as one button with `aria-expanded`, my reading, marked as such in
  DESIGN.md.
- Found on the way: the job card clips its corners, so as a flex item it shrank
  to fit instead of scrolling; the column holds its children at their height.
  MUI's Chip is `max-width: 100%` of its group, so a long name pushed the count
  into the menu; the chip sits in an item that can shrink.
- Stories: Default, ManyCards, Empty, Collapsed, LongName, Mobile, MobileEmpty
  and InEnglish, and the Add Column's Default and InEnglish; seen headless in a
  production build.
