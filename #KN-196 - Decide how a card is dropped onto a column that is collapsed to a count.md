# KN-196 · Decide how a card is dropped onto a column that is collapsed to a count

Beside `DESIGN.md`, which is where this change lands.

**Why, from the board.** KN-061 is drag a card between columns and it cannot be
built correctly against an undecided target. Left open, whoever builds it picks
an answer silently and the collapsed column either becomes undroppable, which
breaks the main interaction for the most-used status, or springs open on hover
in a way nobody chose.

**Exit condition, from the board.** DESIGN.md records the answer as a decision
with who made it and when, covering hover-expand and its delay, whether a
collapsed column accepts a drop, what the user sees after the drop lands, and
what the keyboard path targets. Section 6 no longer lists it as open. KN-061's
exit condition names the decided behaviour, and this card is removed as its
blocker.

## What the owner said, 2026-09-10, in chat

- When a card is dragged onto rejected while it is collapsed to a count:
  **expand after a short hover.**
- After the card lands in rejected: **recollapse with a brief highlight.**
- The keyboard path into a collapsed column: **one target, announced with its
  count.**

## What the file draws

Drag `243:224` and Drop Done `376:5997` are prototype demonstrations, and both
predate KN-070: Drop Done draws rejected EXPANDED, fourth in the old order, the
card simply landed in it, and no highlight layer anywhere. So the file settles
none of this, and the owner's answers are the decision.

## What the exit condition asks that the answers leave open

Three details the card names and the owner did not give a number or a word
for. Each goes into DESIGN.md marked as an **author proposal, not yet put to
the owner**, the way DESIGN.md already records the history tab's position, so
it can be argued with rather than inherited as settled:

1. **The delay.** "A short hover": proposed 500 ms of the dragged card resting
   over the collapsed column before it springs open, long enough that passing
   over on the way to another column does not open it, short enough to feel
   like a response. To be checked against what other kanban tools and spring
   loaded folders use.
2. **Whether it accepts a drop while still collapsed.** Proposed yes: a card
   dropped before the delay runs out lands in rejected all the same. Refusing
   the drop would make the column undroppable for anyone who drops quickly,
   the failure the card's why names; expanding is a courtesy that shows where
   the card will land, not a condition of landing.
3. **What the highlight is.** "A brief highlight": proposed the collapsed
   column's header taking the rejected status's `container` colour behind its
   count, with the count ticking up, fading out over the design's 300 ms state
   change after about a second. Status colours are tokens already, so nothing
   new enters the palette.

The keyboard answer needs no proposal beyond wording: the collapsed column is a
single move target in the keyboard path, and it is announced with its name and
its count, «رد شده، ۱۴ فرصت شغلی», never as an empty slot.

## Also recorded, while the file is open

The owner's employment type answer of the same day, eight values and more than
one per job, gets its decision paragraph in DESIGN.md now, pointing at KN-265
for the migration, so a builder reading the enumerated values does not ship the
old six. The job level list stays provisional.

## What changes

- `DESIGN.md`: a "Settled by the owner on 2026-09-10" section with both
  decisions and the three proposals, marked; the employment type paragraph in
  "Enumerated field values" pointing at it; section 6 no longer carrying the
  employment type as open, and still carrying job level.
- `agent/board.json`: KN-061's exit condition names the behaviour, and KN-196
  comes out of its blockers.
- `agent/scripts/verify/KN-196.mjs`.

## How I will know it worked

`node agent/scripts/verify/KN-196.mjs`: DESIGN.md's section names the owner and
the date, and states the hover-expand with its delay, the drop while collapsed,
the recollapse with its highlight, and the keyboard target with its count, each
proposal marked as one; section 6 does not list the drop question; KN-061's exit
names the behaviour and its blockers no longer include KN-196; and
`npm run contract` passes.

## The check, and what changed after it

The second model agreed the shape was right and said the plan could not close
the card as written: the exit condition asks the DECISION to cover the delay,
the drop while collapsed and what follows the drop, and author proposals are
not a decision. It also found no verified convention behind 500 ms (Apple's
spring loading has no fixed duration; Trello and Jira document collapsed lists,
not hover timings), found GitHub Projects accepting drops on collapsed groups,
and added lifecycle rules KN-061 needs because of its optimistic update and
rollback: recollapse only if the drag opened the column, cancel the timer on
leave or cancel, no success highlight when the save fails, and an announcement
of the result for a pointer drop too.

So the details went to the owner through the question tool the same day, as
three questions with those rules in the recommended answers, and the owner took
all three: 500 ms; a drop before it opens still lands; it recollapses only if
the drag opened it, with the count ticking up, the header flashing the rejected
colour for about a second and the move announced, a column the user opened
staying open, and a failed save returning the card with no highlight. DESIGN.md
records every line as the owner's, and the verifier checks for decisions, not
proposal markers.
