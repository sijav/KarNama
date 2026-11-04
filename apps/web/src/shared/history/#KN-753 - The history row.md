# KN-753 · The history row, History / Row 749:32 and History / Row (Mobile) 1313:3390

**Why**, from the board: components before screens; the redesigned job modal's
history tab and the mobile detail page compose it, and cannot be built to the
design until it exists.

**Exit**, from the board: a story per variant of 749:32 and 1313:3390 renders it
in fa-IR and en-US, light and dark, with both story-docs entries; every size,
gap, radius and colour resolves through the tokens and matches
`get_design_context` on 749:32 and 1313:3390; `DESIGN.md` names the node, its
states and its rules; lint, tsc and its tests pass.

## What the file draws, read 2026-11-04

- **History / Row**, 749:32, Kind Status or Round by State Default, Hover and
  Locked, Status alone Locked; booleans Line Top and Line Bottom; texts Date,
  Source and Title. A row 43 tall that fills its width, radius 8, 12 at the
  sides and 12 between, its items centred: from the inline start the Marker, 12
  wide, a two pixel line of `color/border/default` above and below a dot, a
  solid 10 of `color/text/secondary` for a status and a hollow 8 for a round,
  `color/bg/surface` inside one and a half of `color/text/secondary`; then the
  status's Status Chip at size S, or the round's title, 13 on its automatic 20 at
  Medium in `color/text/primary`; then the date, 12 on its automatic 19 at
  Regular in `color/text/secondary`, «· دستی», the source, in the same, and a 14
  pencil, hidden, 6 apart, 12 above and below. Hover fills the row with
  `color/bg/surface-secondary`, turns the date `color/text/brand` at Medium,
  hides the source and shows the pencil in `color/text/brand`. Locked draws
  Default with no hover.
- **History / Row (Mobile)**, 1313:3390, Kind by State Default and Locked: 358
  wide, its items at the top; the Marker the row's height; the heading over the
  date, 4 apart, 8 above and below, at the inline start, so 63 tall for a status
  and 59 for a round; the pencil always shown in `color/text/secondary`, but on
  a locked row. Its description: the heading and the date on two lines, the
  pencil always seen except on the locked row, on the mobile detail page's
  history tab.
- Its instances, the job modal's History List, stack the rows with no gap, the
  newest without its top line and the oldest, the locked saved row, without its
  bottom one; the sources read «· دستی», «· خودکار» and, for a round, «· ساعت ۱۱
  · نتیجه: دور بعدی».

## The approach

1. `HistoryRow` in a new `shared/history`: a status, its token and name, or a
   round's title; the date and the source as the history tab words them; the
   two lines; locked; desktop or mobile; and `onEdit`, which the pencil and the
   date ask.
2. On an unlocked row the date, its source and the pencil are one button that
   asks to change the date, named so. On a desktop its hover look is drawn
   under the pointer where there is hover and while keyboard focus is inside;
   on a phone the pencil always shows.
3. The pencil is the Icon set's at 14, off the size scale, drawn from its own
   path as the Color Picker's check is. The date and the title are the unstyled
   text tokens `historyDate` and `historyTitle`.
4. Stories: both kinds measured, the hover, the keyboard, locked, the first and
   last lines, the phone's three, English and dark.

## How it is checked

Its stories, the tokens test, lint, tsc, the unit suites and a look.
