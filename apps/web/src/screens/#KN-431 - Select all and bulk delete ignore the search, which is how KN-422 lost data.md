# KN-431 · Select all and bulk delete ignore the search, which is how KN-422 lost data

**Why, from the board.** Losing records that were never on screen is the worst
thing this product can do, and it is the one defect already found once, fixed
once, and left in the other half of the same screen.

**Exit condition, from the board.** Select all takes what the search found, bulk
delete acts on that, and a story with a search active selects all and deletes
and shows the hidden job opportunities survive.

## What the board does today, read 2026-09-14 after 63f6870

- `JobsScreen.tsx` line 167: `held` is the selection less the ids no longer on
  the board, `records.jobs`, and nothing takes out what the search hides.
- The Bulk Action Bar counts `held`, line 467, deletes `held`, line 473, and moves
  `held`, line 476.
- Its select all, lines 478 and 479, sets the selection to every job opportunity,
  `records.jobs`, whatever the search shows.
- The board draws `cardsOf(column)`, `jobsIn(records.jobs, column, search,
  order)`, and `found` counts those across every column, line 163.

So a reader who searches, presses select all and deletes loses every job
opportunity, the ones the search hid among them; and a card chosen before a
search that hides it is still counted, deleted and moved. The network page's
bulk delete has the same hole, without a select all: that is KN-532, its own card.

## The approach

1. **One set of what the search shows**, `shown`: the ids of `cardsOf` across
   every column, the set `found` counts, so `found` becomes its size. It takes in
   a collapsed column's cards, whose count its header shows, and on a phone the
   columns behind the other chips, whose chips show their counts.
2. **`held` is the selection within `shown`.** It replaces the check against
   `records.jobs`, since a job opportunity that is gone is not shown either. The
   bar's count, delete and status change stay on `held`, so each acts only on
   what the search shows.
3. **Select all sets the selection to `shown`**, in place of what was chosen.
4. **A chosen card the search hides stays chosen**, and is counted and acted on
   again once the search shows it. It is never counted, deleted or moved while
   hidden. Deleting or moving still clears the selection whole.
5. **`onSelecting` and the phone cards' `selecting` follow `held`**, so a search
   that hides every chosen card gives a phone's foot back to the tab bar.

## The story

**`SelectingWhileSearching`**, a desktop board in Persian, in
`JobsScreen.stories.tsx`. The seeded board holds the first five fixture job
opportunities, one to a column, the fifth in the rejected column, which opens
collapsed. «آسمان» is in the companies of the second and the fourth and in
nothing else of the five. The story:

- chooses the first card by its checkbox, and the bar counts one;
- searches «آسمان»: the first card is hidden, and the bar has gone, since nothing
  chosen is shown;
- chooses the second card, the bar counts one, presses select all, and the bar
  counts two;
- clears the search, and the bar still counts two: select all put the search's
  two in place of the selection, where every job opportunity chosen would count
  five and the two added to the first card would count three;
- searches «آسمان» again, deletes and confirms;
- clears the search: the second and the fourth are gone, the first and the third
  are on the board, and the fifth is found in the rejected column once that is
  opened.

**Today's code must fail it first**: the story is written and run before the fix,
and it should fail where the bar ought to have gone after the search, since today
the bar still counts the hidden first card.

## Proof that the story can fail, after the fix

Two plants, one at a time: select all taking `records.jobs` again must fail the
count of two once the search is cleared; `held` checked against `records.jobs`
again must fail where the bar ought to have gone.

## Files

- `apps/web/src/screens/JobsScreen.tsx`: `shown`, `found`, `held`, select all.
- `apps/web/src/screens/JobsScreen.stories.tsx`: the story.
- `apps/web/src/shared/story-docs/en/Screens-Jobs.md` and
  `apps/web/src/shared/story-docs/fa/Screens-Jobs.md`: its entry.

## What I am unsure of

- **Keeping a hidden chosen card chosen.** The other way is to drop it from the
  selection when the search hides it. Keeping it means clearing the search gives
  the reader back what they chose, and it is never acted on while hidden, which
  is what the data needs.
- **Select all on a phone** takes the found cards of every status, not only the
  chosen chip's column. The chips show those counts, and it is what a desktop
  reader sees across the board.
- **Select all and a collapsed column**: the rejected column's found cards are
  taken too, as its header counts them.
- **What the search reads.** `matches` searches `searchable(job)`, lowercased;
  «آسمان» was checked against the fixtures' titles and companies, and the seeded
  board has no notes.

## How I will know it worked

The story fails on today's code and passes after the fix; each plant fails it
where it aims; the board's other selection stories, `Working`, `BackingOut`,
`Selecting`, `SelectingOnAPhone` and `UncheckingOnAPhone`, still pass; lint,
tsc and the unit project's docs guard pass.

## Plan review, Codex, 2026-09-14

Codex, with web search, approved the fix: `held` as the selection within what
the search shows across every column, select all as that set, a hidden chosen
card kept chosen but never counted, deleted, moved or making a phone select,
since dropping it on a search would silently discard a reader's work. It found
no product case missing: the confirmation's backdrop and focus trap keep the
search from changing behind it, the delete takes the `held` of the moment it is
pressed, and a chosen card deleted or edited out of the search falls out of
`held` on the next render.

It caught one hole in the proof, taken: with `held` corrected, select all put
back to `records.jobs` would still pass the story as first written, because
`held` filters those five back to the two shown before the bar counts or
deletes, and the hidden job opportunities survive either way. So the story now
clears the search after select all and asserts the bar still counts two, which
also proves select all replaces the selection rather than adding to a card
chosen before the search, and only then searches again and deletes.
