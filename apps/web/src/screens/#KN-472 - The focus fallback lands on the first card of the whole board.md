# KN-472 · The focus fallback lands on the first card of the whole board, not the one after what was deleted

**Why, from the board.** Being moved to an unrelated record in another column is
more disorienting than being left nowhere, because it reads as though the product
jumped somewhere on its own.

**Exit condition, from the board.** Deleting a card in the middle of a column
leaves focus on the card after it in that column, and a story deletes a middle
card and asserts which card has focus by name.

## What is there, read 2026-09-14

- **The Confirm modal**, KN-344, takes `opener` and `fallback`, both read as it
  closes: once its dissolve is over, if the opener is no longer in the page, it
  focuses what `fallback` returns.
- **The board** passes `board.current?.querySelector('article button') ??
  board.current`, the first card's title anywhere on the board, so deleting the
  middle card of a later column lands on the first card of the first column.
  Deleting reaches the confirmation three ways: a card's own delete on a desktop,
  or its menu on a phone; the job modal's delete; and the bulk bar's, of several.
  Each calls `remember()`, which keeps the focused control, then
  `setDeleting(ids)`.
- **The network page** passes the same query over its grid of contact cards, and
  deletes from a card, from the contact modal, and from the bulk bar.
- **The first button in a card is its title.** JobCard's title row is the
  checkbox, an input, then the title's button, the link and the delete;
  ContactCard's is the checkbox, the name's button and the delete. The query above
  already relies on it.
- **The board's page follows its data.** The desktop row renders `columns` in
  order, each a `KanbanColumn` holding `cardsOf(column.id)` in order and then its
  Add Card row, named "Add a job opportunity to" and the column's name; a
  collapsed column is its header alone. A phone renders `cardsOf(showing.id)`
  alone, with no Add Card row. The network's grid renders `shown` in order.
- **The stories.** `FocusAfterDeleting` deletes the seeded board's first job
  opportunity from its modal and asserts only that focus is inside the canvas and
  not on the body; `FocusWhenTheOpenerSurvives` backs out of it; the network's
  `FocusAfterDeletingFromTheModal` deletes its first person and asserts the same.
  None names where focus lands.

## The approach

1. **Where to land is worked out as the reader asks to delete**, while the cards
   are still in the page, and kept in a ref beside `asked`: `remember` takes the
   ids being deleted.
   - **The board**: the first of the ids in the board's order, the columns as
     shown and each column's cards as shown. In that column's element, the desktop
     row's child at the column's place or a phone's one column, the cards' title
     buttons: those after the deleted card, nearest first, then those before it,
     nearest first, then, on a desktop column that is not collapsed, its Add Card
     row, found by its own name.
   - **The network**: the first of the ids in the grid's order, then the people
     after it, nearest first, then those before it.
2. **The confirmation's fallback is the first of those still in the page**, else
   the board or the page, as now. A card taken in the same bulk deletion is out of
   the page by then, so it is passed over.
3. **Refs on the containers**, the desktop's row of columns and a phone's column
   on the board and the grid on the network, so the lookup reads the element each
   column or card is in, not a query over the whole page.

## The tests

Red first, on today's fallback:

- **`FocusAfterDeletingInAColumn`**, new, on the fixture board: the rejected
  column, the last, opened, holds five cards. Its middle card deleted from its own
  delete lands on the card after it, named; then its last card, which lands on the
  card before it, named. Today both land on the first card of the whole board, in
  another column.
- **`FocusAfterDeleting`** names where the modal route lands: the seeded board
  holds one card a column, so deleting the first leaves its column empty and lands
  on that column's Add Card row, named. Today it lands on the next column's card.
- **The network's `FocusAfterDeletingFromTheModal`** deletes the second of its
  three people and lands on the third, named. Today it lands on the first. The
  story keeps its KN-344 purpose, the modal's Delete gone before the confirmation
  opens.
- `FocusWhenTheOpenerSurvives` keeps passing.

Plants, after, each branch taken out in turn: no cards after, no cards before, no
Add Card row, and the network's people; each must fail the step that needs it.

## Files

- `apps/web/src/screens/JobsScreen.tsx` and `NetworkScreen.tsx`.
- `JobsScreen.stories.tsx` and `NetworkScreen.stories.tsx`.
- `story-docs/en` and `fa`, `Screens-Jobs.md` and `Screens-Network.md`.

## What I am unsure of

- **Reading the page by position.** The lookup trusts that the row's children are
  the columns in `columns` order and a column's articles are its cards in
  `cardsOf` order. Both are how the screen renders them, but a wrapper added later
  around a card or a column would break it without a word. An id on each card
  would say it outright, at the price of a prop on two shared components; the plan
  takes position, and the stories are what would catch a break.
- **The bulk bar's deletion** lands by the first deleted card in the board's
  order. The card asks about one card, and no story deletes several and names the
  landing.
- **A card the search hides** while it is open in the modal is not in the page
  when the reader asks, so nothing is found and the board takes focus, as now.
- **The phone's card menu**: its delete is a menu item, and after the menu and the
  confirmation close the same landing applies, but no story deletes at a phone's
  width.

## Plan review, Codex, 2026-09-14

Codex approved the approach. The cards carry their record ids as React keys, so a
card the deletion keeps keeps its element through the deletion and through the
bulk selection's change of props, and `isConnected` passes over a card taken in
the same bulk deletion. Today's fallback fails all three stories for the reasons
given. It corrected one account: opening the confirmation does not close the job
modal; confirming closes both, the modal's focus trap giving focus back as each
closes, and the Confirm modal's fallback, run after its own dissolve, is the last
move. Taken from it:

- **The landing is chosen from the data, and only then found in the page.** The
  records after and before the deleted one come from `columns` and `cardsOf`,
  skipping every id being deleted, and each is then found by its place, so
  reading by position only locates a card already chosen. An id on the cards
  would say it outright and is not needed for this card.
- **Each story waits for every dialog to be gone** before it reads focus, so it
  reads where focus settled and not where it was during the exits.

## Result, 2026-09-14

- **`JobsScreen.tsx`**: `remember` takes the ids being deleted and works out the
  landing there and then. In the first deleted card's column, as the board shows
  it, the kept cards after it, nearest first, then the kept cards before it,
  nearest first, are chosen from `cardsOf`; each is found by its place, through a
  ref on the desktop's row of columns or on a phone's column; the column's Add
  Card row follows, found by its name, unless the column is collapsed. The
  Confirm modal's fallback is the first of them still in the page, else the
  board. The card's, the bulk bar's and the job modal's deletes each pass their
  ids.
- **`NetworkScreen.tsx`**: the same for the grid's reading order, through a ref
  on the grid, from the card, the bulk bar and the contact modal.
- **The stories**: `FocusAfterDeletingInAColumn`, new, on the fixture board's
  rejected column, deletes its middle card and finds focus on the card after it,
  named, then its last card and finds focus on the card before it, named;
  `FocusAfterDeleting` finds focus on the emptied column's Add Card row, named;
  the network's `FocusAfterDeletingFromTheModal` deletes the second of three
  people and finds focus on the third, named. Each waits for the dialogs to be
  gone first. Their docs say so in both languages.

Red first, on the old fallback: `FocusAfterDeleting` at the Add Card row, line
1112; `FocusAfterDeletingInAColumn` at the card after, line 1181; the network's
story at the person after, line 438. `FocusWhenTheOpenerSurvives` passed
throughout.

Plants, each restored byte for byte and checked by hash, each run against its
story alone:

- **No cards after the deleted one** fails the middle step, line 1181.
- **No cards before it** fails the last card's step, line 1191.
- **No Add Card row** fails `FocusAfterDeleting`, line 1112.
- **The network's people dropped** fails the network's story, line 438.

Passing at the commit: the two screens' stories, 31 of 32, the one failing being
`Adding`, which calls the live API, KN-495; the docs guard, 75; eslint and tsc
clean; both screens formatted, as they were at HEAD, the two story files keeping
the drift they had at HEAD; the web unit project, 1382, run with nothing else
running. Nothing a reader sees changed; where focus lands is what the stories
read.
