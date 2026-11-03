# KN-758 · The board's add links, Board / Add Card Link 961:95525 and Board / Add Status Column 961:95530

**Why**, from the board: components before screens; the redesigned board
composes them, and cannot be built to the design until they exist.

**Exit**, from the board: a story per variant of 961:95525 and 961:95530
renders it in fa-IR and en-US, light and dark, with both story-docs entries;
every size, gap, radius and colour resolves through the tokens and matches
`get_design_context` on 961:95525 and 961:95530; `DESIGN.md` names the node,
its states and its rules; lint, tsc and its tests pass.

## What the file draws, read 2026-11-03

- **Board / Add Card Link**, 961:95525, Default and Hover: a row 276 wide, the
  cards' width, 36 tall, 8 above and below, 12 at the sides, 6 between, a
  radius of 8, none bound; the Icon set's plus at 16 leading «افزودن فرصت
  شغلی», 13 on 20 at Medium, both in `color/text/secondary`; Hover fills it
  with `color/bg/surface-secondary`. Its description: it adds to the same
  column, right after the last card, opening the add modal with the column's
  status.
- **Board / Add Status Column**, 961:95530, Default and Hover: 300 by 50, a
  stage column's width, an edge of one dashed 5 and 4 in `color/text/disabled`
  counted in the layout, 13 above and below, 16 at the sides, 8 between, a
  radius of 16, none bound; the plus at 18, none of the icon sizes, leading
  «افزودن وضعیت», 14 on 22 at Medium, both in `color/text/secondary` and
  centred; Hover fills it with `color/bg/surface-secondary`. Its description:
  an empty column that makes a new stage, as wide as a stage's and always
  beside the open stages.
- No screen places either; the board's frames are KN-805's.

## What the code draws now

The column's Add Card of the old file, 241:142, a bordered 36 tall button
with a 20 plus in `text/brand` and no words, and the Add Column tile, 241:34,
220 by 120. The redesign replaces both.

## The approach

1. `unstyledText.addCardLink` and `addStatusColumn`, the two labels' text.
2. `AddCardLink` and `AddStatusColumn` in a new `shared/board`, the family the
   outcome strip joins: buttons, each with the Add Stage's three pixel ring
   for the keyboard, since the file draws them no focus. The card link's name
   is «افزودن فرصت شغلی به» and the column's name, which begins with the words
   it shows; the status column's plus is drawn from the set's geometry at 18,
   as the Color Picker draws its 14 check.
3. The board takes them in KN-805, where the old two go.
4. Stories for each: at rest, hover, the keyboard, English and dark.

## How it is checked

Their stories, the theme's tests, lint, tsc, and a look in both schemes.
