# KN-771 · The relationship label picker, Label Choice 1086:2944 and Label Picker 1086:3004

**Why**, from the board: components before screens; the redesigned network's
person modal composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 1086:3004 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches get_design_context on
1086:3004; DESIGN.md names the node, its states and its rules; lint, tsc and its
tests pass.

## What the file draws, read 2026-11-04

**Label Choice**, `1086:2944`, Default, Hover, Selected and Add: a pill 32 high
at radius 999, 4 above and below and 12 at the sides, 4 between, one pixel of
`border/default` inside; its label Body, 14 on 22, in `text/secondary`. Hover
fills `bg/surface-secondary` over 120 ms. Selected is `bg/brand/container`
inside `border/focus`, the label in `text/brand` after a 16 check. Add is the
dashed edge, 4 on and 3 off, «برچسب تازه» in `text/brand` after a 16 plus.

**Label Picker**, `1086:3004`, 512 wide: «برچسب», Label at Medium in
`text/primary`, 8 above the choices, which wrap 8 apart from the inline start:
the four defaults «آشنا», «همکار قبلی», «کارشناس جذب», «مصاحبه‌کننده», then Add.
Its variants:

- Default, none chosen; Selected, «کارشناس جذب» chosen;
- Typing: Add becomes a pill input inside one and a half of `border/focus`,
  and the suggestions hang 4 under the choices, 240 wide, 4 in, at radius 8,
  inside `border/default` with a shadow of `#121726` at 10 percent, 4 below and
  blur 12: «برچسب‌های شما», Label in `text/secondary`, the reader's earlier
  labels matching, each 38 high with its «⋯» at the inline end, the first
  under the keyboard on `bg/surface-secondary`; a divider; and «ساختن برچسب
  «هم»» in `text/brand` after a plus;
- Option Menu: «⋯» opens a 160 wide menu of «تغییر نام» and the destructive
  «حذف برچسب»;
- Rename: the row becomes a pill input with a check;
- Delete Confirm: the row becomes «حذف برچسب «…»؟» over «از روی ۲ نفر برداشته
  می‌شود. خود افراد حذف نمی‌شوند.» and Ghost «نگه داشتن» with Destructive
  «حذف», inside the list, never a modal on the modal;
- After Delete: the list without it.

The description: the label is optional; the four defaults are fixed and have
no «⋯», 1 Aban; a label deleted comes off the people who carry it, and the
people stay.

## The decisions

1. The picker draws what it is given: the chosen label's id, the reader's own
   labels with how many people carry each, and an act for choosing, creating,
   renaming and deleting. The four defaults have ids of their own and names in
   the catalog, so a language switch renames them.
2. A press on the chosen label takes it off, since the label is optional.
3. A chosen own label shows as a chip after the defaults, so the reader sees it.
4. The suggestions are a combobox's listbox under the input, inside the picker
   rather than a portal, so the person modal's focus trap keeps them; the arrows
   move through them, Enter chooses or creates, Escape closes.
5. English names the defaults "Acquaintance", "Former colleague", "Recruitment
   specialist" and "Interviewer", since "Recruiter" is already the role
   «کارشناس جذب نیرو».

## How it is checked

A story per variant of both nodes measured against the frames, each act done
with the pointer and the keyboard, planted wrong values, the docs and catalog
suites, lint, tsc, and a look in both languages and schemes.
