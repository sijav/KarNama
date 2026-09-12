# KN-043 · The kanban board screen

Beside the screens. Recorded after the work, on 2026-09-12, under the owner's
instruction of that day to build the pages now.

**Exit condition, from the board.** An e2e test seeds an archive, drags a card
between two columns and sees the status change persist, filters and searches,
selects several and acts through the bottom bar, and opens a card into the
modal, all against the real API. The rightmost column is the first stage in
Persian and the layout mirrors in English. رد شده is the last column, after
پیشنهاد کار, and the board renders it collapsed to a count by default.

## What the screen does

- A column per status in the design's order, rejected last and collapsed to its
  header until it is opened, each with its count, its menu, its cards and its
  Add Card row, and the Add Column tile at the end. The row scrolls sideways
  and a column keeps its 300: without `flex-shrink: 0` the columns shared the
  room out and a board of nine was nine slivers.
- The toolbar searches every column at once and sorts by the design's four
  orders. Nothing matching says so, the No results state, rather than leaving
  five empty columns to be read as an empty archive.
- A phone gets node 241:176: the statuses as chips in a row that scrolls, the
  chosen one's cards below it alone. The header's add button is the desktop's
  only, since the phone's header already carries the language switch, KN-355,
  and the tab bar carries adding as a destination; with all three the title was
  cut at 109 pixels, and it is 168 and whole now.
- Selecting cards brings up the bar at the foot, which changes the status of
  several at once or deletes them after a confirmation. A card opens the job
  modal, which saves, changes the status and deletes.

## What is not claimed

- **Dragging is KN-061**, which is its own card and not done here: the board
  moves a card with the Change Status control instead, which is what the
  component draws and what the bulk bar does.
- **Not against the real API**: the records are held in the browser, one board
  per reader, until the API cards land. KN-416 carries the wiring, and the e2e
  drives the same screens either way.
- The e2e is `e2e/board.spec.ts`, five tests on both viewports: the columns with
  rejected collapsed, a search that narrows and then finds nothing, a card into
  the modal with several moved through the bar and the move surviving a reload,
  and the phone's chip row choosing the column.
