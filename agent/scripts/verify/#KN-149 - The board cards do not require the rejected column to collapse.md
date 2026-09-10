# Plan — KN-149, the board cards do not require رد شده to collapse

## The task, from the board

KN-070 settled that رد شده sits last and is **collapsed to a count by default**,
expanding on click. DESIGN.md section 6 records it. The cards that build the
board do not mention it, so KN-043 and KN-060 can both be satisfied completely
while rendering رد شده as an ordinary always-open column.

**Exit condition.** The cards that build the board name the collapsed-by-default
count, the expand interaction, and رد شده's position after پیشنهاد کار in their
exit conditions, and a check derives that from `board.json` rather than from a
person having remembered.

## The obvious fix is the one this repo has now got wrong three times

The obvious check is: grep each card's `exit` text for words meaning "collapsed"
and "count". `agent/scripts/lib/contract.mjs` says in its own header why that
does not work:

> Regexes over prose cannot express "the sidebar is on the right", only "nobody
> wrote the words that mean it is on the left".

Every one of its ten rules is therefore **negative**: a `forbidden` pattern with
`allowed` escapes. KN-149 needs a **positive** requirement — the card must SAY
something — and a positive prose match is defeated by any rewording of the very
sentence it is checking. KN-184, KN-189 and KN-190 were three consecutive cards
about exactly this failure, and the answer that finally held was to stop
inferring from words and **make the thing declare itself** with a marker.

So I am not adding an eleventh rule to `contract.mjs`. Its shape is wrong for
this and bending it would put a positive prose grep inside a file whose header
promises it contains none.

## What I intend instead: the card declares the decision it carries

1. **A `requires` field on a task**, an array of decision keys, e.g.
   `["rejected-column-collapsed"]`. Settable through `todo set --requires`,
   cleared with `--requires none`, the spelling `--parent` and `--verify`
   already use. It goes in `REQUIRED`'s neighbourhood in `agent/scripts/todo.mjs`
   as an optional field, not a required one, because 190 existing cards do not
   have it and back-filling them is not this card's job.

2. **A decisions registry**, one entry per settled design decision that has to
   reach the board. Each entry names:
   - the key,
   - the **anchor** in DESIGN.md, reusing `contract.mjs`'s existing anchor
     machinery, which already checks a phrase is present AND not negated in the
     same sentence — that matters here, because if the owner reverses KN-070 the
     check must stop demanding the old answer rather than enforce it forever,
   - **the cards required to carry it**, by id,
   - what a card must actually deliver, in prose, for a human reader.

3. **A verifier `agent/scripts/verify/KN-149.mjs`** asserting, both directions:
   - every card the registry names carries the key,
   - every card carrying the key is named by the registry, so a key that moves
     or a card that is deleted shows up instead of silently passing,
   - the DESIGN.md anchor is present and not negated,
   - and a positive control: with the key removed from one card the check FAILS,
     so an empty registry or a skipped loop cannot pass by finding nothing.

4. **The card prose changes too**, because a key is for the machine and a person
   building from a card reads the exit condition. KN-043 and KN-060 get the
   collapsed default, the count, the expand interaction and رد شده's position
   written into their exit conditions. The key is what the check reads; the
   prose is what the builder reads. Neither substitutes for the other.

## The clause I am least sure of, and a scope question

**Which cards count as "the cards that build the board".** KN-149 names the
full-height column card and KN-043. I read that as KN-060 and KN-043.

**I think KN-061 belongs too and the card does not say so.** KN-061 is drag a
card between columns. Dropping onto a column that is collapsed to `رد شده ▸ 14`
is a genuinely different interaction from dropping onto an open column — does it
expand on hover, does it accept the drop closed, what does the keyboard path
target — and rejected is the status cards get dragged INTO most. That is a real
gap in the same shape as the one KN-149 reports, not a tidy-up. I intend to add
it and say I widened the scope, rather than satisfy the card's letter and leave
the same hole one card over.

## The gap I will not paper over

A **new** board card, written later, that never opts in is not caught. Nothing
in `board.json` says "I build the board" except prose, so the registry naming
cards by id is a human-maintained list, and this check tells you when a named
card drops the key — not when an unnamed card should have had it.

I considered deriving the set structurally, as KN-043 plus its `parent` cards.
KN-043 has ten parents and most are unrelated components, so it would need eight
exemptions, and eight exemptions is a list nobody reads. I would rather have a
short honest list than a long derived one that gets rubber-stamped.

This gap gets written into the check's header and filed as a card, not left for
the roast to find.

## How I will know it worked

`node agent/scripts/verify/KN-149.mjs` passes. Mutations that must be caught:
the registry emptied, a key removed from a card, the anchor deleted from
DESIGN.md, the anchor negated in DESIGN.md, and the both-directions assertion
reduced to one direction. If a mutation cannot be caught I will say so on the
card rather than let the silence read as coverage.
