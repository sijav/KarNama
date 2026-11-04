# KN-794 · The Selects gained Hover states and were redrawn

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and the job modal and the add flow are made of
them.

**Exit**, from the board: the plan lists every difference between 183:26,
448:8051 and 448:8095 in the copy EITM6CbJY33dMY8IsMFR4R and in the original;
the component and its stories then draw the original's version of every
variant, each new variant with a story of its own, in fa-IR and en-US, light
and dark, with both story-docs entries; sizes, gaps, radii and colours resolve
through the tokens; `DESIGN.md`'s section is corrected; lint, tsc and its tests
pass.

## Every difference, read with use_figma on 2026-11-04

Each variant of the three sets was walked node by node in both files, its type,
size, layout, sizing, fills and strokes with their variables, stroke weight and
alignment, radius, opacity, effects, bound variables, text and font, the
chevron's instance and its vector's stroke, hashed per variant in the copy and
compared in the original.

- **Select**, `183:26`: Default, Filled, Focus, Disabled and Open are drawn the
  same in both, and so is the description. The original adds **Hover**, the
  field `color/bg/surface` with one pixel of `color/text/secondary` inside and
  «انتخاب کنید…» in `color/text/secondary`, and **Filled Hover**, the same edge
  round «تمام‌وقت» in `color/text/primary`; the chevron is the same 20 in
  `color/text/secondary` in both.
- **Select / نوع همکاری**, `448:8051`, and **Select / سطح شغلی**, `448:8095`:
  Default and Open are drawn the same; each adds **Hover**, the same edge round
  its value, «تمام‌وقت» and «کارشناس ارشد», in `color/text/primary`.
- The Input's Hover is the same edge, `text/secondary`, and its description says
  hover means something only on a desktop.

## The approach

1. The Select's field takes `text/secondary` for its edge under the pointer,
   empty or holding a value, not while focused, open or disabled, whose edges
   say more, and only where the primary input can hover, the Button's way,
   KN-318, so a tap does not leave it drawn on a phone.
2. One check, `hoverEdge`, drives a real pointer over a Select and reads the
   resting edge, the hovered edge and the colour of what the field shows; the
   Select's `Hover`, `FilledHover` and `HoverInTheDark` and each option
   Select's `Hover` and `HoverInTheDark` use it, in Persian and light and in
   English and dark, each with both docs entries.
3. `DESIGN.md`'s Select section says the set now draws Hover, and its table row
   lists the new states.

## How it is checked

The three Selects' stories, lint, tsc and the unit suites.
