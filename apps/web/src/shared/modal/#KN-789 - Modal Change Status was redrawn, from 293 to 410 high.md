# KN-789 · Modal / Change Status was redrawn, from 293 to 410 high

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and the status change is the product's
commonest act.

**Exit**, from the board: the plan lists every difference between 150:93 in the
copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its stories
then draw the original's version of every variant, each new variant with a story
of its own, in fa-IR and en-US, light and dark, with both story-docs entries;
sizes, gaps, radii and colours resolve through the tokens; `DESIGN.md`'s section
is corrected; lint, tsc and its tests pass.

## Every difference, read 2026-11-04

Every node of `150:93` was read with use_figma in both files: its type, size,
layout, bound variables, fills, strokes, effects and text. It is one component
in both, with no variants.

- **The frame**: 420 wide in both, the same shell, `bg/surface` at `radius/lg`,
  Elevation/Modal, `spacing/lg` round and `spacing/md` between, and the same
  description; 293 high in the copy and 410 in the original, from the picker
  alone.
- **The close**, `244:70`: the copy's Icon / Name=x at 20; the original's
  Popover / Close at 20 at radius 6, which KN-838 drew already.
- **The Status List**, `150:15`: the copy holds Status Picker `464:703`, the flat
  picker, 372 by 107; the original holds Status Picker / Grouped `735:41428`, an
  instance of `636:6417`, 372 by 224. Its «وضعیت» shows. «در جریان» is over
  ذخیره‌شده, which is chosen, درخواست‌شده and مصاحبه. At 372 پیشنهاد کار and
  «افزودن وضعیت» wrap to a second line. A divider follows, then «بسته‌شده» over
  پذیرفته‌شده, رد شده, بی‌پاسخ and انصراف.
- **The rest is the same**: the header's «تغییر وضعیت», both dividers, the
  footer and its two buttons, Ghost «انصراف» and Primary «تأیید».

## The approach

1. `ChangeStatusModal` takes the stages and the outcomes as two lists, as the
   grouped picker and the Status Select do. It draws `GroupedStatusPicker` with
   its label, focus on the chosen status as it opens.
2. `StatusControl` takes the two lists too and finds its chip's status in
   either.
3. The records do not yet give a status its group, KN-731. So `statusGroups`
   in `core/records` splits them: the stages in the board's order, and Rejected,
   the one outcome they know. `JobsScreen` and `JobModal` hand the modal and the
   control what it returns, so KN-731 changes one function.
4. The fixtures gain the frame's four stages and four outcomes. The grouped
   picker's and the Status Select's stories now share them instead of building
   their own.
5. Stories: Default measures the modal at 420 by 410 and the picker at 372 by
   224, then chooses an outcome and confirms it. The cancel story stays.
   InEnglish and Dark are new, and the Status Control's stories take the two
   lists.

## How it is checked

These stories: the modal's, the control's, the grouped picker's, the Status
Select's, the job modal's and the board screen's. A planted wrong height must
fail them. Also `records.test.ts` for `statusGroups`, the unit suites with the
docs guard, lint, tsc, and a look against the frame.
