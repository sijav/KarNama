# KN-780 · The week bar, Stats / Week Bar 1168:3183

**Why**, from the board: components before screens; the redesigned Stats
page's applications chart composes it, and cannot be built to the design until
it exists.

**Exit**, from the board: a story per variant of 1168:3183 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches `get_design_context`
on 1168:3183; `DESIGN.md` names the node, its states and its rules; lint, tsc
and its tests pass.

## What the file draws, read 2026-11-04

Stats / Week Bar, 1168:3183, Current=No and Current=Yes, with Count as a text
property: 32 wide and 68 tall at the specimen, neither bound, a column at the
bottom with `spacing/2xs` between the count in Label, centred, and the bar,
which fills the rest at `radius/sm`, at least a pixel. Current=No draws the
count in `color/text/secondary` over `color/bg/brand/container`; Current=Yes in
`color/text/primary` over `color/bg/brand/default`. Its description: one bar of
the applications by week card, this week strong, the bar filling the
component's height, which the page sets in proportion to the number.

## The approach

1. `WeekBar` beside `StatsNumber` in `shared/stats`: a `count`, `current`
   and the `height` the page gives it, 68 by default, the count in the
   reader's digits. Never under the count, its 4 and a pixel of bar, 21, so a
   week with none still has its count above a line.
2. The bar is the count drawn, so it is hidden from a screen reader; the chart
   that holds the bars says what they are, KN-823.
3. Stories: a past week, this week, a week of heights, English and dark.

## What the build found

MUI's sx reads a size of 1 or less as a fraction of the parent, so the bar's
minimum height of one pixel drew the whole column until it was written in
pixels.

## How it is checked

Its stories, lint, tsc, and a look in both schemes.
