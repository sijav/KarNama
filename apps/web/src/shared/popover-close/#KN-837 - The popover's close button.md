# KN-837 · The popover's close button, Popover / Close 848:2247

**Why**, from the board: components before screens; every redesigned modal and
the date popovers close with it, and the modal shell cannot match the design
until it exists.

**Exit**, from the board: a story per variant of 848:2247 renders it in fa-IR
and en-US, light and dark, at 22 and at 20, with both story-docs entries; every
size, radius and colour resolves through the tokens and matches
`get_design_context` on 848:2247; `DESIGN.md` names the node, its states and its
rules; lint, tsc and its tests pass.

## What the file draws, read 2026-11-03 with use_figma

Popover / Close, `848:2247`, State=Default and State=Hover, each 22 by 22 with
a radius of 6 that binds no variable, centring the Icon set's `x` at 16, its
stroke of 2 in `color/text/secondary`. Default has no fill; Hover fills with
`color/bg/surface-secondary`, and Default's prototype hovers into it. Its
description: the close of the date windows; hover is the light grey ground; a
click closes without a change. Its instances: 22 in the date popovers, 20 in
every redesigned modal's header, Modal / Confirm, Change Status, the add flow's
steps, the Job Modal's tabs, and 16 as the Search Bar's Filled clear, the icon 16
at every size.

## The approach

1. `PopoverClose` in `shared/popover-close` on `ButtonBase`: `aria-label`, which
   it requires, `onClick`, and `size`, 22 by default, 20 or 16; the icon stays
   16. The radius is a named constant, since it binds no variable. Hover under
   `@media (hover: hover)`.
2. The file draws no focus. A ring inside a square this small would cover its
   icon, so keyboard focus is the product's outline, two of `border/focus` at an
   offset of two, KN-244, as the Checkbox's is.
3. It is an icon-only button, so it names itself with Tooltip / Label, as the
   Icon Button does, KN-777.
4. Stories: Default and Hover at 22, At20 and At16, InEnglish, Dark, keyboard
   focus and the press; docs in both languages; a DESIGN.md entry.

## How it is checked

Its stories, lint, tsc, and a look at 22, 20 and 16 in both schemes.
