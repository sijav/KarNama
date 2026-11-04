# KN-787 · The Input gained a Filled Hover state and was redrawn

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and every form in the redesign is made of
Inputs.

**Exit**, from the board: the plan lists every difference between 95:38 in the
copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its stories
then draw the original's version of every variant, each new variant with a story
of its own, in fa-IR and en-US, light and dark, with both story-docs entries;
sizes, gaps, radii and colours resolve through the tokens; `DESIGN.md`'s section
is corrected; lint, tsc and its tests pass.

## Every difference, read with use_figma on 2026-11-04

Every node of 95:38 was walked in both files: type, size, layout, sizing, fills
and strokes with their variables, stroke weight and alignment, radius, opacity,
effects, bound variables, text with its font, size, line height, tracking and
alignment, the four boolean properties and the description.

- Default, Filled, Focus, Error, Disabled and Hover are drawn the same in both,
  node for node, and the description is the same.
- The original adds a seventh state, **State=Filled Hover**: Hover's field,
  `color/bg/surface` with one pixel of `color/text/secondary` inside, holding
  Filled's value in `color/text/primary`, with the same label and helper. The
  set is 276 high where it was 138 only because the seventh state wraps to a
  second row.

## The approach

1. The code's hover rule already draws the pointer's edge on a field whatever
   it holds, so Filled Hover needs no new rule: a `FilledHover` story drives a
   real pointer over a field with a value and reads Hover's edge and Filled's
   text in Persian and light, and `FilledHoverInTheDark` the same in English
   and dark, each with both docs entries.
2. `DESIGN.md` says the file now draws seven states, the seventh the one
   composite it draws, and its table row names it.

## How it is checked

The Input's stories, lint, tsc and the unit suites.
