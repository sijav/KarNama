# KN-778 · The stats number card, Stats / Number 1168:3159

**Why**, from the board: components before screens; the redesigned Stats page
composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 1168:3159 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches `get_design_context`
on 1168:3159; `DESIGN.md` names the node, its states and its rules; lint, tsc
and its tests pass.

## What the file draws, read 2026-11-03

Stats / Number, 1168:3159, Status=Applied, Interview, Offer, Rejected and
NoResponse, with Label and Value as text properties: 200 by 82 at the
specimen and filling its row on the page, `color/bg/surface-secondary` at
`radius/md`, `spacing/sm` above and below, `spacing/md` at the sides and
`spacing/2xs` between its two lines, at the inline start. The Label Row holds a
dot of 8, bound to no size, in `color/status/applied/base`, `interview`,
`offer`, `rejected`, and for NoResponse `color/text/secondary`, and
`spacing/xs` after it the label in Body in `color/text/secondary-strong`; the
number is Heading/L in `color/text/primary`. Its description: the dot is the
status's colour on the board, the number black at one weight. No screen places
an instance.

## The approach

1. `StatsNumber` in a new `shared/stats`, the family the guidance, the week bar
   and the source row join: a `status`, a `label` and a `value`, the count in
   the reader's digits through `formatCount`.
2. The entrance, the first row's numbers counting up, is the page's, KN-824.
3. The labels are the page's copy, KN-823; the stories take sample ones from
   the fixtures.
4. Stories: the applied card, all five, a large number, English and dark.

## How it is checked

Its stories, lint, tsc, and a look in both schemes.
