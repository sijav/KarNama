# KN-766 · The paste step's field and its manual link, Paste Field 961:101573 and Manual Path Link 961:101603

**Why**, from the board: components before screens; the redesigned add flow
composes them, and cannot be built to the design until they exist.

**Exit**, from the board: a story per variant of 961:101573 and 961:101603
renders it in fa-IR and en-US, light and dark, with both story-docs entries;
every size, gap, radius and colour resolves through the tokens and matches
`get_design_context` on 961:101573 and 961:101603; `DESIGN.md` names the node,
its states and its rules; lint, tsc and its tests pass.

## What the file draws, read 2026-11-03

- **Paste Field**, 961:101573, Default and Hover: a field 512 wide and 54
  tall, `color/bg/surface`, `spacing/md` round its text, `radius/md`, one
  pixel of `color/border/default` inside and out of the layout, which Hover
  draws in `color/text/secondary`; its placeholder «لینک یا متن کامل آگهی رو
  اینجا بذارید» at 14 on Figma's automatic 22 in `color/text/secondary`.
- In place, Add / Edit 166:82's Field Wraps 166:67, 371:427 and 304:7, 4
  apart: «لینک آگهی یا متن کامل آگهی» at 12 on 19 and Medium in
  `color/text/primary`, the field, the helper «هم لینک، هم متن کامل آگهی؛ لازم
  نیست چیزی رو جدا کنید.» at 14 on 22 in `color/text/secondary` or the error
  in `color/text/error`, then the Manual Path Row. Filled, 371:422, a link in
  the same one row.
- **Manual Path Link**, 961:101603, Default and Hover: «لینک یا متن آگهی
  ندارید؟» at 14 on 22 in `color/text/secondary` and `spacing/2xs` after it
  «ورود دستی» at Medium in `color/text/brand`, underlined on Hover.

## What the code draws now

The Input of several lines, 140 tall from the old file's 166:69, with the old
copy, and the Manual Path Row of 269:3292 inline in AddJobModal.

## The approach

1. The Input takes `minRows`, so a field of several lines can start at one:
   54, the 22 of a line and 16 round it, growing to its eight rows.
2. `PasteField` in `shared/add-job`, the Input at one row with the paste
   label, the redesign's placeholder and helper, and an error in the helper's
   place; its resting edge the owner's `border/control`, KN-275, its hover the
   file's, its focus the Input's.
3. `ManualPathLink` beside it, the row as a button after its question, with
   the redesign's copy and its underline on hover.
4. The copy in both catalogs; the add modal takes both in KN-817, where the
   old copy goes.
5. Stories for each.

## How it is checked

Their stories, the Input's, the catalog's tests, lint, tsc, and a look in both
schemes.
