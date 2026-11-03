# KN-746 · The action chip and the inline link, Chip / Action 961:98854 and Link / Inline 961:98862

**Why**, from the board: components before screens; the redesigned interview
slot composes them, and cannot be built to the design until they exist.

**Exit**, from the board: a story per variant of 961:98854 and 961:98862 renders
it in fa-IR and en-US, light and dark, with both story-docs entries; every size,
gap, radius and colour resolves through the tokens and matches
`get_design_context` on each; `DESIGN.md` names the nodes, their states and
their rules; lint, tsc and their tests pass.

## What the file draws, read 2026-11-03 with use_figma

**Chip / Action**, 961:98854, Default and Hover, 75 by 27 with «نتیجه گرفتم»:
an edge of one pixel, `color/border/default` at rest and `color/text/secondary`
on hover; a fill of `color/bg/surface` at rest and `color/bg/surface-secondary`
on hover; text at 12 and Medium in `color/text/brand` on the font's normal line,
one line; padding 3 above and below and 8 at the sides; corner 6. The 3 and the
6 bind to no variable. Default's prototype swaps to Hover on hover.

**Link / Inline**, 961:98862, Default and Hover, 87 by 19 with «تاریخش عوض شد»:
text at 12 and Regular in `color/text/secondary`, underlined at the font's own
position, one line, no padding. Its Hover variant draws exactly what Default
does, every property read the same, so nothing changes on hover.

## The approach

1. `ActionChip` in `shared/action-chip` and `InlineLink` in `shared/inline-link`,
   each on MUI's `ButtonBase`, so the keyboard and the focus class come with it:
   a label and an `onClick`, the label copy from the caller. The chip's hover
   under `@media (hover: hover)`, as the Icon Button's is; the 3 and the 6 as
   named constants citing the node, as the Filter Chip's edge and the Brand Row's
   mark are.
2. Keyboard focus, which neither node draws: the chip takes the Icon Button's
   ring, three wide in `border/focus` inside its edge, KN-294's reasoning; the
   link, which has no box to draw inside, takes a three pixel outline in the
   same colour around it.
3. Stories per component: Persian and English at rest, dark, hover from a real
   pointer, focus from a real Tab, and the press calling `onClick`. Their copy is
   the file's two strings, «نتیجه گرفتم» and «تاریخش عوض شد», new catalog
   entries with English ids.
4. Docs in both languages, the titles registered, and a `DESIGN.md` entry.

## Unsure

Whether 12 pixel Vazirmatn's normal line comes to the file's 19 in Chromium;
the stories measure it.
