# KN-750 · The dashed add chip, Add Stage 961:101245

**Why**, from the board: components before screens; the redesigned grouped
status picker composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 961:101245 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches `get_design_context` on
961:101245; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass.

## What the file draws, read 2026-11-03 with use_figma

Default and Hover, each 126 by 30, a pill: an edge of one, dashed 4 and 3, in
`color/bg/brand/default`, drawn inside and counted in the layout; padding 3
above and below and 12 at the sides; then the Icon set's `plus` at 16 in
`color/text/brand` and, 4 after it, «افزودن وضعیت» at 13 on 22 and Medium in
`color/text/brand`, no text style and no letter spacing. Hover adds a fill of
`color/bg/surface-secondary`. The plus sits on the label's right in the frame,
the inline start in Persian, as the handoff says an icon in front of text sits.

## The approach

1. `AddStage` in `shared/add-stage` on `ButtonBase`, its one prop `onClick`, its
   label the catalog's existing `Add status`. The edge a real one pixel border,
   since it counts in the layout, dashed by CSS's own dash, as `DESIGN.md`
   records for every dashed edge here; the file's 4 and 3 noted. Hover under
   `@media (hover: hover)`; keyboard focus the three pixel ring inside the edge
   that the old add chip and the Icon Button draw.
2. The label 13 on 22 joins `unstyledText`, bound to no text style.
3. Stories: Persian and English at rest, dark, a real hover, a real Tab, the
   press; docs in both languages; a `DESIGN.md` entry.
