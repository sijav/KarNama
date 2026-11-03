# KN-765 · The add-a-person row, Add Contact 961:101547

**Why**, from the board: components before screens; the redesigned job modal's
related people tab composes it, and cannot be built to the design until it
exists.

**Exit**, from the board: a story per variant of 961:101547 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches `get_design_context` on
961:101547; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass.

## What the file draws, read 2026-11-03 with use_figma

Default and Hover, 672 by 46, filling its container's width: an edge of one in
`color/border/default`, dashed 6 and 4, drawn inside and out of the layout;
`radius/md`; `spacing/sm` above and below; the content centred, the Icon set's
plus at 16 leading «افزودن نفر», 14 at Medium on Figma's automatic 22 in
`color/text/brand`, `spacing/xs` apart. Hover fills it with
`color/bg/surface-secondary`. The old job modal draws its own «+ افزودن مخاطب»
row of the same shape, which the related people cards replace.

## The approach

1. `AddContact` in `shared/add-contact` on `ButtonBase`, full width, one prop
   `onClick`, its label a new catalog entry, `Add person`. The edge on a
   `::before` overlay, so it stays out of the layout as the file draws it, dashed
   by CSS's own dash as every dashed edge here is. The label's 14 on 22 at
   Medium joins `unstyledText`.
2. Hover under `@media (hover: hover)`; keyboard focus the three pixel ring
   inside the edge.
3. Stories at the file's 672 in Persian, English and dark, a real hover, a real
   Tab and the press; docs in both languages; a `DESIGN.md` entry.
