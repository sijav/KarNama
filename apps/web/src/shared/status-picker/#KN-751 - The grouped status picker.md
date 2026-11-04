# KN-751 · The grouped status picker, Status Picker / Grouped 636:6417

**Why**, from the board: components before screens; the redesigned card status
change, the job modal and the add flow compose it, and cannot be built to the
design until it exists.

**Exit**, from the board: a story per variant of 636:6417 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches `get_design_context`
on 636:6417; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass.

## What the file draws, read 2026-11-04

- **Status Picker / Grouped**, 636:6417, one component with no variants, 512
  wide: a column 10 apart, its items at the inline start. «وضعیت», 12 on 19 at
  Medium in `color/text/secondary`; the caption «در جریان», 12 on 19 at Regular
  in `color/text/disabled`; the stages, Status Choices 8 apart both ways in rows
  that wrap, «ذخیره‌شده», chosen, «درخواست‌شده», «مصاحبه» and «پیشنهاد کار», then
  the Add Stage chip, «افزودن وضعیت»; a divider of `color/border/default`; the
  caption «بسته‌شده»; and the outcomes, «پذیرفته‌شده» in the custom-1 pair, «رد
  شده», and «بی‌پاسخ» and «انصراف» in the new pair's greys, 8 apart, wrapping.
- Its description: the stages can be customised, the new stage chip always
  makes a stage, and the outcomes that close a case are fixed.
- None of the three texts is bound to a style; each sets its own 19.

## The approach

1. `GroupedStatusPicker` beside the flat one, which it replaces wherever the
   redesign draws a status choice, KN-842: the stages, the outcomes, the chosen
   id, `onChange`, `onAdd` and `autoFocus`, the flat picker's props split in
   two.
2. Each section is a radio group named by its caption, and the two share one
   name, so the browser keeps one choice across both with one Tab stop; the
   whole is a group named «وضعیت». The arrows move across both rows the way
   they point, `arrowsAcross` on the whole, KN-301. The add chip, `AddStage`,
   ends the stages' row in the same flow but sits outside its radio group, as
   the flat picker keeps its own, KN-338.
3. The label and the captions are the unstyled text tokens
   `groupedPickerLabel` and `groupedPickerCaption`; the choices are
   `StatusChoice`, ringed as the flat picker rings them.
4. Stories: the file's measure, choosing across both groups, the arrows, the
   add chip, English and dark.

## How it is checked

Its stories, the tokens test, lint, tsc, the unit suites and a look.
