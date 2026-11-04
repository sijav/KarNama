# KN-775 · The person picker, Person Picker 1096:3129

**Why**, from the board: components before screens; the redesigned job modal's
related people tab composes it, and cannot be built to the design until it
exists.

**Exit**, from the board: a story per variant of 1096:3129 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches `get_design_context` on
1096:3129; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass.

## What the file draws, read 2026-11-04

- **Person Picker** has no variants: the related people tab's «+ افزودن نفر»
  open, «سا» typed. The panel is the Job Picker of 1092:3072 at 400: `bg/surface`
  at radius 8 inside one pixel of `border/default`, 8 in and 4 between,
  `elevation.picker`, its search inside one and a half of `border/focus` at
  radius 4, the search icon at its start.
- «از شبکهٔ شما» in Label `text/secondary`, 4 above and below and 12 at the
  sides.
- Each person 54 tall at radius 4, 8 and 12 in: the name in Body over «سمت ·
  شرکت» in Label `text/secondary`; the one linked already in `text/secondary`
  with «وصل است» and the check in `text/brand` at the inline end; the one under
  the pointer on `bg/surface-secondary`.
- A divider of `border/default`, then the plus and «افزودن «سا» به شبکه
  به‌عنوان نفر تازه» in Body `text/brand`, 8 and 12 in, 38 tall.

## The approach

1. Lift KN-772's Job Picker into `shared/picker`'s `SearchPicker`: the width,
   label, optional heading, the items and how each is found, linked and drawn,
   an optional footer, and what Enter does when no one can be chosen.
   `LinkedJobs` draws through it unchanged.
2. `PersonPicker`: people, linkedIds, onPick, onCreate with the name typed and
   trimmed, and onClose; it finds a person by name, role or company, and shows
   the add row once something is typed.
3. The catalog's three new messages.
4. Stories: the picker measured, searching, choosing, creating by the row and
   by Enter, the keyboard, English and dark, the runner widened to hold it.

## How it is checked

Its seven stories, with a planted 396 width failing Default, In English and
Dark; the nine of `LinkedJobs` and the five of `LinkedJob` after the lift;
the unit suites, the docs guard among them; lint, tsc and a look against the
frame.
