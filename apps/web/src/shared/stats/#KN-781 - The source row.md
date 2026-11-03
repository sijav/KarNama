# KN-781 · The source row, Stats / Source Row 1223:1807

**Why**, from the board: components before screens; the redesigned Stats
page's sources card composes it, and cannot be built to the design until it
exists.

**Exit**, from the board: a story per variant of 1223:1807 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches `get_design_context`
on 1223:1807; `DESIGN.md` names the node, its states and its rules; lint, tsc
and its tests pass.

## What the file draws, read 2026-11-04

Stats / Source Row, 1223:1807, Context=Card and Context=Modal, with Source,
Requests and Interviews as text and Show Bar as a boolean: a row 320 wide at
the specimen, `spacing/md` between its parts, all in Body. From the inline
start the source in `color/text/primary`, 140 wide and cut at its end in the
card, 200 in the modal; the Bar Area, filling the rest, `spacing/2xs` between a
bar in `color/data/bar` at `radius/sm`, 12 tall, and its count in
`color/text/primary` at the bar's end, the bar's length set by the area's
padding against the largest source; and the interviews centred in a column of
56 in `color/text/secondary`. Show Bar off is a single source. The card's row
is centred on its line and the modal's at the top. The description: the full
name on hover in the card, in code; in the window of every source, up to three
lines so the whole name shows, where the modal's text node itself is set to one
line.

## The approach

1. `SourceRow` in `shared/stats`: `source`, `applications`, `interviews`,
   `largest` and `context`; the bar as long as its share of the largest
   applications of the room the bar has, which keeps 32 at its end for the
   count, so the bars are in proportion; no `largest`, no bar.
2. The card's name is one line with an ellipsis and, when it is cut, shown
   whole in Tooltip / Label under the pointer; the modal's takes up to three
   lines, as the description says.
3. The bar is hidden from a screen reader, which reads the count; the card
   around the rows names them, KN-823.
4. Stories: a card row, several sources, a single source, a long name in the
   card, the modal, English and dark.

## How it is checked

Its stories, lint, tsc, and a look in both schemes.
