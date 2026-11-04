# KN-776 · The source picker, Source Picker 1223:96580

**Why**, from the board: components before screens; the redesigned add flow
and the job modal's info tab compose it, and cannot be built to the design
until it exists.

**Exit**, from the board: a story per variant of 1223:96580 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches `get_design_context`
on 1223:96580; `DESIGN.md` names the node, its states and its rules; lint, tsc
and its tests pass.

## What the file draws, read 2026-11-04

The set's description: the «منبع» field of the add form and the job modal's
info tab; the menu opens upward and out of the layout's flow, since the field
sits at the end of a scrolling form. Five variants, each 240 wide:

- **Default**, `1223:96581`: «منبع», 12 at Medium on Figma's automatic 19 with
  no letter spacing and no text style, in `text/primary`; 4 below it the field,
  44 tall at radius 8, 16 in and 8 between, `bg/surface` inside one pixel of
  `border/default`, the value in Body `text/primary`, the 20 chevron-down in
  `text/secondary` at the inline end, never turned. Its Auto Hint property adds
  «از روی لینک آگهی پر شد.» 4 under the field, Label in `text/secondary`.
- **Hover**, `1223:96599`: the edge `text/secondary`.
- **Empty**, `1223:96673`: «انتخاب یا نوشتن منبع» in `text/secondary`.
- **Open**, `1223:96586`: the edge one and a half of `border/focus`; the menu 4
  above the field and as wide, 256 tall, `bg/surface` inside one pixel of
  `border/default` at radius 8, 4 above and below its rows, with the shadow 0 8
  24 -4 of black at 12 percent, `elevation.optionsMenu`: «منبع‌های شما» and
  «منبع‌های رایج», each a header 24 tall, 12 and 4 in, Label `text/secondary`,
  over Option Rows `408:465`, 40 tall; the chosen one Selected with its check.
- **Typing**, `1223:96630`: the typed «جاب بینجا» with a caret; the menu 111
  tall: «منظور شما این بود؟» over the near «جابینجا», a divider of
  `border/default`, and the create row, 38 tall, 12 and 8 in, a 16 plus then
  «ساختن منبع «جاب بینجا»», Body in `text/brand`.

The handoff's source field: filled from the link's domain; two groups; the
quiet normalisation folds ی and ي, ک and ك, spaces and the half-space, letter
case, and a common source's English name into its Persian one; a near name
offers «منظور شما این بود؟» and a new one «ساختن منبع «…»», so the stats never
count one source under two names.

## The approach

1. `sources.ts`: `sourceKey`, the quiet normalisation, and `suggestionsFor`,
   what a query offers: with nothing typed, the reader's sources and the
   common ones not among them; typed, the sources whose name or other spelling
   holds the key, under the same headers; when none is exactly it, the sources
   one letter away as «منظور شما این بود؟», and the create row.
2. `SourcePicker`: value, the reader's sources, the common ones, autoFilled and
   onChange. A combobox over a listbox that hangs upward, absolute, 4 above the
   field, capped at the Open frame's 256 and scrolling past it; the rows are the
   Select's Option Rows. A press or a key opens it, typing filters it, the arrows
   move, Enter chooses, Escape and leaving put the value back.
3. `unstyledText.sourceLabel` for the label; the catalog's six messages; the
   fixtures' sources, a near spelling, a folded one, another-language name and a
   new one.
4. Stories for every variant and for choosing, creating, the normalisation,
   another-language name and the keyboard, in English and dark too.

The common list itself, and keeping the reader's sources, are KN-739's.

## How it is checked

Its stories with planted wrong values failing them, the token and docs suites,
lint, tsc, a look against the frames, and the published check.
