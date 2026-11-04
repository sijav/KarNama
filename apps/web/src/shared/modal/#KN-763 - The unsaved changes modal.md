# KN-763 · The unsaved changes modal, Modal / Unsaved 893:3780

**Why**, from the board: components before screens; the redesigned job modal
composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 893:3780 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches `get_design_context`
on 893:3780; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass.

## What the file draws, read 2026-11-04

- **Modal / Unsaved**, 893:3780, one component with no variants and no
  instance yet: the modal shell at 360, `color/bg/surface`, `radius/lg`,
  `spacing/lg` of padding and `spacing/md` between its parts, Elevation/Modal.
- Its header, 28: «تغییرات ذخیره نشده» at 20 on 28 at SemiBold at the inline
  start and Popover / Close at 20 at the other end; a divider; «اگه بدون ذخیره
  ببندید، تغییرهایی که دادید از بین می‌رن.» in Body, `color/text/secondary`; a
  divider; and the footer, `spacing/sm` apart at the inline end, the Secondary
  M «بستن بدون ذخیره» then the Primary M «ذخیره» at the very end.
- Its description: the window for closing a modal with unsaved changes; the
  main button «ذخیره», leftmost, the secondary «بستن بدون ذخیره»; × goes back
  to the modal.

## The approach

1. `UnsavedModal` on the modal shell, which already draws the header with
   Popover / Close at 20, KN-838, the dividers and the actions at the inline
   end: `onSave`, `onDiscard` and `onKeepEditing`, the last for the close,
   Escape and a press on the scrim, as the × goes back to the modal.
2. Save takes focus as it opens, so Enter keeps the changes, as a desktop's
   own save prompts do; the Confirm modal's Cancel takes it because there the
   first key must change nothing, and here the safe answer is to keep.
3. The body is the Confirm modal's paragraph, so the shell gains `ModalText`
   and both use it.
4. Three messages: 'Unsaved changes', the body line and 'Close without
   saving'; 'Save' is the catalog's own.
5. Stories: the file's measure, each answer, the way back, English and dark.

## How it is checked

Its stories and the Confirm modal's, lint, tsc, the unit suites and a look.
