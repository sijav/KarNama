# KN-440 · Recolouring a status moves its column, because the board's order ranks by colour token

**Why, from the board.** A colour is a colour. A reader choosing one is not
asking for their board to be rearranged, and the rearrangement is silent and
permanent.

**Exit condition, from the board.** Recolouring a status leaves its column where
it was, and a story recolours a custom status to the offer colour and asserts the
order is unchanged.

## What is there, read 2026-09-14

- **`columnOrder`**, `core/records/records.ts` lines 78 to 86, ranks a status by
  its **token**: a default token takes its index in `DEFAULT_TOKENS`, `new`,
  `applied`, `interview`, `offer`, `rejected`, and any other token ranks 3.5,
  after offer and before rejected. The sort is stable, so ties keep the order the
  statuses were added in.
- **`recolourStatus(id, token)`** writes the chosen colour into that same token,
  `RecordsProvider.tsx`; the column menu's «تغییر رنگ» calls it,
  `JobsScreen.tsx` line 431.
- **Who orders by it**: `JobsScreen.tsx` line 82, the columns on a desktop and
  the status chips on a phone alike, and the story fixtures' board.
- **Ids**: the five defaults are made by `defaultStatuses` with their token as
  their id, `records.ts` line 64, and nothing changes an id afterwards; a
  reader's own status is given `newId('status')`; `readRecords` keeps stored ids
  as they are; the samples match an existing status by id. `status-labels.ts`
  already knows a default by its id, not its colour.
- **The design**: rejected stays the last column, the owner's of 2026-09-08,
  KN-070, and a custom status may take a default's colour, DESIGN.md at «a custom
  status may take a default's colour».
- **What moves today**, read from the rank: a default given a custom colour,
  Saved given Teal, leaves the front of the board for the place before rejected;
  a reader's own status given Red goes after rejected, to the very end; given
  Green, offer's colour, it ties with offer and, having been added later, lands
  straight after offer, so **with one status of the reader's own nothing visibly
  moves**, and with two, the second given Green jumps ahead of the first.

## The approach

1. **Rank by the status's id, not its colour.** A status whose id is one of the
   five defaults takes that default's place in the design's order; every other
   status, the reader's own, sits before rejected in the order it was added. One
   line of `columnOrder`, a `findIndex` over `DEFAULT_TOKENS` against the id,
   and its comment.
2. **Not the card's place field.** A place kept on every status would need every
   stored board migrated, every road that makes a status to set it, and a rule
   for where a new one goes; the id already says which of the design's five a
   status is, and it never changes. What a place field would add, a reader
   reordering columns, the design took out: DESIGN.md at «Custom statuses are
   managed inline», "Reorder was removed from the design", the column menu
   holding exactly rename, change colour and delete.
3. **The story fixtures' board keeps its order**: their statuses' ids are their
   tokens, and `custom-1` to `custom-4` are not defaults.

## The tests

- **`records.test.ts`**, "keeps a column where it was when its colour changes":
  the five defaults and two statuses of the reader's own; Saved given a custom
  colour stays first, the second of the reader's own given offer's colour stays
  after the first, and one given rejected's colour stays before rejected.
- **`RecolouringKeepsItsPlace`**, in `JobsScreen.stories.tsx`, the exit's story:
  two statuses added from the board, the first renamed so the two can be told
  apart, and the second given Green, offer's colour, from its column's menu; the
  columns then stand in the order they did, the design's four, the reader's two
  in the order they were added, and rejected last, read from the columns'
  regions in document order.
- **Red first**: both fail on today's code, where the second status jumps ahead
  of the first and Saved leaves the front.
- **Plant**: the rank read from the token again fails both.
- **Still passing**: the records tests' own `columnOrder` test, the fixture
  board's order test, and the board's `Board`, `Managing` and `BackingOut`.

## Files

- `apps/web/src/core/records/records.ts` and `records.test.ts`.
- `apps/web/src/screens/JobsScreen.stories.tsx`, and the new story's docs in
  `story-docs/en/Screens-Jobs.md` and `story-docs/fa/Screens-Jobs.md`.

## What I am unsure of

- **A stored status of the reader's own whose id happens to be a default's**:
  nothing in the product writes one, since `addStatus` uses `newId`, but
  `readRecords` accepts any string id, and such a status would take that
  default's place.
- **A default deleted and a status added in its place**: the new one has a new
  id, so it sits with the reader's own, before rejected, rather than where the
  deleted default stood. That is the rule for a reader's own status, and the
  design draws nothing else.
- **The document-order check**: KN-541 carries that `Board` reads document order
  rather than the order drawn; this story reads it the same way, since the board
  is one flex row with no order and no reversed direction today.

## Plan review, Codex, 2026-09-14

Codex approved the plan as the smallest change that meets the card, and
confirmed the two-status story fails on today's code: the second status given
offer's green takes offer's rank and moves ahead of the first. It confirmed
too that the stable sort is a dependency the language guarantees, ES2019 on.
Three things it raised, each checked against the code:

- **What the rule covers is the records the web keeps today**, not every value a
  stored board could hold: `readRecords` accepts any string id, so a corrupt or
  hand-edited board could give a status of the reader's own a default's id. No
  road in the product writes one. The section above says as much.
- **The sample loader reads a colour as which status a column is**:
  `withSamples`, `samples.ts` line 24, finds the status a sample default belongs
  in by id and then by token, so with a default deleted and a status of the
  reader's own wearing its colour, the samples land in the reader's status.
  Confirmed, and outside this card's exit: filed as **KN-542**.
- **The API is not what this rule is for.** Its statuses have a UUID id, a key
  for the defaults and a stored position, so an id-based rank would read every
  API default as a status of the reader's own; the mapper that brings the API's
  board to the web will have to carry the key or the position across. And its
  seed, `apps/api/src/database/seed.ts` lines 40 to 46, commented as the board's
  order, lists rejected before offer and writes positions from that list,
  against the design's order: confirmed, and filed as **KN-543**. This plan
  claims nothing about the API.

## Result, 2026-09-14

- **Red first.** On today's code the unit test failed at its first recolouring,
  Saved given a colour of the reader's own leaving the front of the board, and
  `RecolouringKeepsItsPlace` failed on the order of the columns, the second
  status of the reader's own standing ahead of the first.
- **The fix** is the one line of `columnOrder`, which now finds a status's place
  among the design's five by its id, with its comment.
- **Green.** The records and fixture unit tests pass, 57, and the whole web unit
  project, 1373; every board story passes but `Adding`, KN-495, as before.
- **Plant.** The rank read from the token again failed the unit test and the
  story on the lines they aim at, and was restored byte for byte, checked by
  hash.
- **The rest.** tsc is clean; lint caught one bare Persian name in the story's
  expected order, now read from the catalog as `New status`; the three files
  keep the formatting they had at HEAD.
