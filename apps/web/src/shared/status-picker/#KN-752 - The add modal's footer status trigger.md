# KN-752 · The add modal's footer trigger that opens the grouped chips, Status Select / Footer 1257:3315

**Why**, from the board: components before screens; the redesigned add flow
composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 1257:3315 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches `get_design_context`
on 1257:3315; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass.

## What the file draws, read 2026-11-04

- **Status Select / Footer**, 1257:3315, Value «ذخیره‌شده» or «درخواست‌شده», two
  samples only, by State Default, Hover and Open. A field 44 tall that hugs its
  width, `color/bg/surface` at `radius/md`, `spacing/md` at the sides and
  `spacing/xs` between: from the inline start «وضعیت:» in Body,
  `color/text/secondary`, the chosen status's Status Chip at size S, and the
  chevron at 20 in `color/text/secondary`. Its edge, one pixel inside, is
  `color/border/default`, `color/text/secondary` on Hover and
  `color/border/focus` while Open.
- Open draws above it a menu of `color/bg/surface` at `radius/lg`, `spacing/sm`
  round it, one pixel of `color/border/default` inside and Elevation/Modal,
  holding Status Picker / Grouped without its «وضعیت» line, its inline start at
  the field's. The file lays it over the field's top; the description says it
  opens upward.
- Its description: the status choice in the add modal's footer, beside Add; the
  menu opens upward into Status Picker / Grouped; the decision of 3 Aban. Its
  three instances sit in the add modal's footer at the inline start, the buttons
  at the other end, 12 apart.

## The approach

1. `StatusSelect` in `shared/status-picker`: the stages, the outcomes, the
   chosen id, `onChange` and `onAdd`, as `GroupedStatusPicker` takes them. The
   trigger is a button that says «وضعیت:» and the chosen chip, with its
   chevron, and tells that it opens a dialog and whether it is open.
2. A press opens a popover 4 above it, its inline start at the trigger's, the
   Select's 4 turned upward, holding the grouped picker without its label,
   which gains `label` for that, and with focus on the chosen status. A choice
   closes it and hands the status over; the add chip closes it and asks for a
   stage; Escape and a press outside close it with nothing chosen, focus back
   on the trigger.
3. The hover edge is drawn only where the primary input can hover, the
   Select's way, KN-794; keyboard focus draws two of `border/focus` inside, as
   the Select's field does.
4. `DESIGN.md`'s rule that status is chosen with chips records the trigger: it
   shows the status and opens the chips, so the status is still chosen with
   chips.
5. Stories: the trigger measured, its hover, open, a choice, the add chip,
   Escape, English and dark.

## How it is checked

Its stories and the grouped picker's, lint, tsc, the unit suites and a look.
