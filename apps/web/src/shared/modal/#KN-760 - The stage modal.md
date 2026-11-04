# KN-760 · The stage modal, Modal / Status 919:2804

**Why**, from the board: components before screens; the redesigned board's own
stages compose it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 919:2804 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches `get_design_context` on
919:2804; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass.

## What the file draws, read 2026-11-04

- **Mode Add, Add Filled, Add Duplicate and Edit**, 440 wide in the modal shell,
  «افزودن وضعیت» or «ویرایش وضعیت», fields 20 apart, unbound.
- **The name**, an Input, «اسم وضعیت», at most 20 letters by the description,
  «مثلاً: مصاحبهٔ فنی» while empty, the count «۰ از ۲۰ حرف» as its helper, and
  on Add Duplicate the error «این اسم رو قبلاً انتخاب کردید. اسم دیگه‌ای انتخاب
  کنید.».
- **On Add**, «پیشنهادها», 12 on the automatic 19 at Medium in
  `text/secondary`, then five Filter Chips with no count in a wrapping row, 8
  both ways, which the frame lays out from the inline start «تکلیف», «مصاحبهٔ
  منابع انسانی», «مصاحبهٔ فنی», then «مذاکرهٔ حقوق», «مصاحبهٔ نهایی». Add
  Filled shows «مصاحبهٔ فنی» Selected.
- **The Color Picker**, 257:17 stretched to 392, `919:2526`: one row of nine,
  from the inline start new, applied, interview, rejected, offer, then the four
  reserved; custom-1 chosen. Its helper is 12 on the automatic 19.
- **The footer**: Ghost «انصراف» and Primary «افزودن» at the inline end, Add
  disabled while empty or duplicate; Edit, «ذخیره», and the Text style's
  «حذف وضعیت» with its label overridden to `#b91c1c`, `text/error`, at the
  inline start.
- **The description** names a «بعد از کدوم وضعیت؟» field that no variant and no
  screen, 920:49465, 920:49835 and 920:51453, draws; DESIGN-HANDOFF.md leaves the
  custom stage's open questions to the designer.

## The approach

1. KN-846 first: the Filter Chip's label at Medium and its count optional.
2. `StageModal` in `shared/modal`: open, mode, stage {name, colour},
   takenNames, onSave, onCancel, onDelete. The fields are a form the footer's
   primary submits by id, so Enter in the name adds or saves. A name another
   stage has, whatever its case or spaces, is the error and holds the action
   off. A suggestion fills the name; pressed again it clears it.
3. The Color Picker gains `fullWidth`, the one-row order, and its helper's 19
   through `colorPickerHelper`.
4. The Button gains `destructive-text`, the Text style in `text/error`, with the
   destructive Menu Item's `red/100` under the pointer.
5. Stories for every mode, the cap, Enter, cancelling, editing's actions,
   English and dark; docs; DESIGN.md's section and rows.

## How it is checked

Its stories, the picker's and the Button's, the docs guard, the tokens and dark
contrast tests, lint, tsc and a look against the four frames.
