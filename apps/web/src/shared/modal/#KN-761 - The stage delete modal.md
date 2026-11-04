# KN-761 · The stage delete modal, Modal / Delete Status 919:2885

**Why**, from the board: components before screens; the redesigned board's own
stages compose it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 919:2885 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches `get_design_context`
on 919:2885; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass.

## What the file draws, read 2026-11-04

- **Modal / Delete Status**, 919:2885, Cards=None and Cards=Has: the modal shell
  at 440, `spacing/lg` of padding and `spacing/md` between its parts,
  `radius/lg`, Elevation/Modal; its header «حذف وضعیت «مصاحبهٔ فنی»؟» in
  Heading/M with Popover / Close at 20; a divider.
- **Cards=None**: «این وضعیت از برد حذف می‌شه. فرصت شغلی‌ای توش نیست.» in Body,
  `color/text/secondary`; a divider; Ghost M «انصراف» then Destructive M «حذف
  وضعیت» at the inline end, 208 tall.
- **Cards=Has**: «۲ فرصت شغلی توی این وضعیت هست. انتخاب کنید بعد از حذف کجا
  برن.»; under it, `spacing/md` on, the Select in its Filled state, labelled
  «انتقال فرصت‌های شغلی به», showing «مصاحبه»; a divider; Ghost «انصراف» then
  Destructive «حذف و انتقال», 313 tall.
- Its description: deleting a custom status; one with cards must choose where
  they go; the default statuses have no delete.

## The approach

1. `DeleteStatusModal` on the modal shell at 440: the status's name, how many
   job opportunities it holds, the statuses they can go to, `onDelete` with the
   chosen one, or null when there is nothing to move, and `onCancel` for
   Cancel, the close, Escape and the scrim. Cancel takes focus as it opens, the
   Confirm modal's rule for an action that cannot be undone.
2. With job opportunities in it, the Select offers the other statuses and
   starts on the first the caller gives, as the file draws one chosen; Delete
   and move is off while there is nowhere to move them.
3. The title quotes the name in the reader's own marks, «…» or “…”, from the
   catalog, as the shared `quoted` does; the count is the reader's digits and
   its sentence and the Select's label take the count's plural.
4. Stories: both variants measured, choosing another stage, one job in
   English, Cancel, English and dark.

## How it is checked

Its stories, lint, tsc, the unit suites and a look.
