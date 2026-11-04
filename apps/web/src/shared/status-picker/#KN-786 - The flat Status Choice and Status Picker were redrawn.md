# KN-786 · The flat Status Choice and Status Picker were redrawn

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and a picker drawn from the old copy shows the
reader a component the design no longer has.

**Exit**, from the board: the plan lists every difference between 427:567 and
427:592 in the copy EITM6CbJY33dMY8IsMFR4R and in the original; the component
and its stories then draw the original's version of every variant, each new
variant with a story of its own, in fa-IR and en-US, light and dark, with both
story-docs entries; sizes, gaps, radii and colours resolve through the tokens;
`DESIGN.md`'s section is corrected; lint, tsc and its tests pass. Where nothing
in the redesign uses them, they are removed with their stories instead.

## Every difference, read with use_figma on 2026-11-04

Both nodes were walked in both files, every node's type, size, layout, sizing,
fills and strokes with their variables, stroke weight, alignment and dash,
radius, opacity, effects, bound variables, text and its font, instances' main
components and the descriptions.

- **Status Choice**, `427:567`: Default, Hover and Selected are drawn the same
  in both, a shell of `spacing/2xs` at `radius/full` round a Status Chip Size=M,
  its two inside of `color/bg/surface`, `color/border/default` and
  `color/border/focus`. The set is 309 wide where it was 363 only because its
  example chip, Status=interview, said «پیشنهاد کار» in the copy and says
  «مصاحبه» in the original, 63 wide where it was 81: sample text, no drawing.
  The description is the same.
- **Status Picker**, `427:592`: the label, the wrapping row and the dashed add
  chip are drawn the same, but the add chip says «افزودن وضعیت», 131 wide,
  where the copy said «وضعیت تازه» at 111; its plus is `color/text/secondary`
  in both. Its example choices now show five different statuses rather than
  one repeated: sample content. The description is the same.

## Where the redesign uses them

- The handoff builds Status Choice, used inside Status Picker / Grouped,
  636:6417, and lists Status Picker among the components no screen uses and
  none is to build: the grouped picker replaces it, KN-751.
- The code's flat picker is still what the add form, `JobForm`, and the
  change-status modal, `ChangeStatusModal`, draw. Their redesigns, KN-817 and
  KN-789, draw the grouped picker, so the flat one goes once they do; removing
  it now would leave both without a way to choose a status.

## The approach

1. The flat picker's add chip says «افزودن وضعیت», the catalog's `Add status`,
   as the original draws it and as the board's add column and the grouped
   picker already say; the status it makes is still named «وضعیت تازه», `New
   status`. Its stories, both docs, the change-status modal's docs, the board
   screen's stories that press it, and `DESIGN.md` follow.
2. Status Choice is drawn as the original draws it already; `DESIGN.md` says it
   was read again.
3. KN-842 removes the flat picker and its stories once KN-751, KN-817 and
   KN-789 have replaced it, keeping `StatusOption` and Status Choice, which the
   records and the grouped picker use.

## How it is checked

The Status Picker's, the change-status modal's, the add form's and the board
screen's stories, lint, tsc and the unit suites.
