# KN-544 - A column starts collapsed when its colour is rejected's, not when it is the Rejected status

## The card

**Why.** A reader who colours their own stage red is choosing a colour, not asking to have that
stage folded away, and the column the owner said starts folded is Rejected, whatever colour it
wears.

**Exit.** The board starts collapsed only the Rejected status, by its id: a story gives a status of
the reader's own red and finds its column open, gives Rejected another colour and finds it still
collapsed, and fails on the colour rule.

A child of KN-440, from its roast.

## Measured before planning, 2026-09-16

- **The rule today.** `JobsScreen.tsx` line 163:
  `const isCollapsed = (id: string) => (folded[id] ?? tokenOf(records.statuses, id) === 'rejected') && dragExpanded !== id`.
  `tokenOf`, `records.ts` line 52, gives a status's COLOUR token, so what decides whether a column
  starts folded is the colour it wears.
- **What reads it.** Three places, all in `JobsScreen.tsx`: the landing list a delete works out,
  line 209, which leaves a collapsed column's Add Card row out; the drag, lines 438 and 460, which
  expands a collapsed column after 500 ms of hover and keeps it a stable drop target; and the
  column's own `collapsed`, line 465, whose `onExpand` writes `folded[id]` false.
- **Which status a column is, is its id.** `columnOrder`, `records.ts` lines 78 to 89, already ranks
  by the id, KN-440: "Which status a column is, never its colour". `defaultStatuses`, line 64, gives
  each default its token as its id and nothing changes an id afterwards; a status the reader adds
  takes `newId('status')`, so its id is never one of the five.
- **So, today**: a status of the reader's own given Red starts folded with its cards behind a count,
  and Rejected given another colour starts open. DESIGN.md's rule, the owner's of 2026-09-08,
  KN-070, is that the Rejected column starts collapsed.
- **`folded[id]` is the reader's own toggle**, so a story that opened Rejected to reach its column
  menu would write that toggle and lose the very default it is testing. The state to test is a board
  that ARRIVES wearing those colours.
- **The colours have names**: the Color Picker calls rejected's Red and offer's Green, `custom-2`
  Purple, `ColorPicker.tsx` lines 30 to 51.
- **How the stories read a collapsed column**: its own job opportunity is not on the board, and its
  header, a button named by the status, opens it, as `Managing` and `RecolouringKeepsItsPlace` do;
  an open column is a region named by the status.

## The approach

1. **The story first**, `CollapsedByStatusNotColour` in `JobsScreen.stories.tsx`, on a board seeded
   through a `RecordsProvider` decorator of its own, as `fixtureBoard` seeds one: the five defaults
   with Rejected wearing Purple, a status of the reader's own wearing Red, and one job opportunity
   in each of those two columns. It reads the red column's job opportunity on the board, so that
   column is open, reads Rejected's nowhere, so that one is folded, and then opens Rejected from its
   header and finds its job opportunity inside that column's region. On today's code the first two
   fail, the red column being folded and Rejected open.
2. **`isCollapsed` reads the id**: `folded[id] ?? id === REJECTED`. `records.ts` exports `REJECTED`
   beside `DEFAULT_TOKENS`, typed as the union it belongs to so the lint rule takes the literal, and
   it is the token that is also the Rejected default's id, so the collapse and the order agree on
   what says which status a column is; the comment says so, naming KN-440 and KN-070. `tokenOf`
   stays imported in `JobsScreen.tsx`: line 306 still colours each card by its status's token.
3. **The docs**: both `Screens-Jobs.md` pages gain the story's entry.
4. **A look**: the story's board in fa-IR, light and dark, where the red column stands open and
   Rejected folded, and the Docs page's new entry in both languages.

## What I will change

- `apps/web/src/screens/JobsScreen.tsx`
- `apps/web/src/core/records/records.ts`
- `apps/web/src/screens/JobsScreen.stories.tsx`
- `apps/web/src/shared/story-docs/en/Screens-Jobs.md`, `apps/web/src/shared/story-docs/fa/Screens-Jobs.md`

## What I expect to be hard, and what I am unsure of

- **Naming the id or comparing with the literal.** A name in `records.ts` keeps the two rules in one
  place; the literal in `JobsScreen.tsx` is one word smaller. The name is chosen, since `columnOrder`
  and `isCollapsed` are the same rule read twice and a grep for it should find both.
- **A board read from storage whose own status carries a default's id** takes that default's place,
  KN-440's own caveat: nothing in the product writes one, and this card claims nothing more.
- **The drag's expansion** reads `isCollapsed` too, so a reader's own red column will no longer
  expand on hover, because it is no longer folded; that is the point of the card rather than a
  change to the drag.
- **A board with no Rejected status at all**: nothing starts folded, which is what the rule says and
  what the colour rule said too when no status wore Red.

## How I will know it works

- The story fails on today's code, at the red column being folded, and passes after the change.
- A plant, the colour rule put back, fails it again, and `JobsScreen.tsx` is put back by its hash.
- The Jobs screen's stories pass, `Managing`, `RecolouringKeepsItsPlace` and `Board` among them, and
  the records unit tests with them; tsc and lint pass; no changed file's Prettier drift grows, and
  this plan's is 0.
- The look shows the red column open and Rejected folded in fa-IR, light and dark, and the Docs
  entry reads in both languages.

## Plan review, 2026-09-16, Codex gpt-5.6-terra

Approved with two implementation details, one taken and one corrected. Taken: the constant carries
the union it belongs to, so the lint rule accepts the literal:
`export const REJECTED: StatusToken = 'rejected'`. Corrected: it said the `tokenOf` import in
`JobsScreen.tsx` becomes unused and lint would fail. It does not. `tokenOf` is called twice, at line
163 for the collapse and at line 306 for the colour each card's stripe takes, so only the first call
goes and the import stays. The rest it confirmed: a story's own `RecordsProvider` gives the board
its state without writing `folded`, and React reads the nearest provider, so the decorator replaces
the meta's seed for that story alone; the id rule covers every reader of the collapse, the column,
the landing list and the drag; a red column of the reader's own no longer expanding under a drag
follows from its no longer being folded; neither a phone nor a card menu holds a second
colour-based collapse; and a board with no Rejected status needs no test of its own, since nothing
starts folded under the rule. The amended plan goes back to it before building.

## Second plan review, 2026-09-16, Codex gpt-5.6-terra

Approved, the amendment resolving both details. It took the correction: `tokenOf` stays imported,
since it still gives each card's stripe its colour at line 306, and the typed `REJECTED` is the
right shared identity for the order and the first fold alike. The story is the proof: its own
provider gives the arrival state without touching `folded`, React reads the closest provider, and a
story-level decorator is what Storybook offers for exactly this. The id rule moves every reader of
the collapse together, the column, the landing list and the drag, no phone or card menu decides a
collapse by colour of its own, and the colour-rule plant will fail the new story.

## Built, 2026-09-16

- **The constant first, inert.** `records.ts` exports `REJECTED` beside `DEFAULT_TOKENS`, carrying
  the union it belongs to, and the barrel exports it. Nothing read it yet, so the story's first run
  still met the colour rule.
- **The story.** `CollapsedByStatusNotColour` seeds a board through its own `RecordsProvider`: the
  five defaults with Rejected wearing purple, the fixtures' own custom status wearing red, and a job
  opportunity in each of those two columns. It reads the red column's job opportunity on the board
  and Rejected's nowhere, then opens Rejected from its header and finds its own inside that column.
  On the colour rule it failed at the first read, that column being folded.
- **The rule.** `isCollapsed` compares the column's id with `REJECTED`, its comment naming KN-440
  and KN-070; `tokenOf` stays imported, since line 306 still gives each card's stripe its colour.
- **The plants.** With the colour rule put back, the story fails at that first read,
  `JobsScreen.stories.tsx` line 1389; with nothing planted it passes, 1 with 26 skipped.
  `JobsScreen.tsx` was put back after each run and its hash checked.
- **The reader's own status comes from the fixtures**, not from a minted id: `newId('status')` was
  flagged by the lingui rule for its prefix, and silencing it would have owed TECH-DEBT an entry, so
  the decorator takes the fixtures' own custom status, found by a token compared with `===`, which
  the rule skips.
- **Checks.** The Jobs screen's 27 stories pass whole; tsc and lint pass; the unit project passed
  1522 of 1524, its two failures `session.test.ts` under load, KN-551, which passed alone, 2 of 2.
  Drift is back to HEAD's on every changed file, the stories' 4 and the rest 0, and this plan is 0;
  two drifts were caught and fixed first, Prettier wanting the map split across lines and
  organize-imports wanting `REJECTED` first in the barrel's list.
- **The look.** The Docs page draws the entry and its own prose in fa-IR and in en-US. The story's
  board in light and in dark, with Rejected folded again from its header after the play opened it:
  `html` computes the scheme, the red column holds its job opportunity, Rejected's is nowhere, one
  header reads folded, and no page or console error.
