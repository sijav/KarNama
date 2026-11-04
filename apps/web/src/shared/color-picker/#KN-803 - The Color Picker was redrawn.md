# KN-803 · The Color Picker was redrawn

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and the stage modal picks colours with it.

**Exit**, from the board: the plan lists every difference between 257:17 in the
copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its stories
then draw the original's version of every variant, each new variant with a story
of its own, in fa-IR and en-US, light and dark, with both story-docs entries;
sizes, gaps, radii and colours resolve through the tokens; `DESIGN.md`'s section
is corrected; lint, tsc and its tests pass.

## Every difference, read with use_figma on 2026-11-04

Every node of 257:17, one component with no variants, was walked in both files:
type, size, layout, fills and strokes with their variables, stroke weight and
alignment, radius, opacity, effects and text.

- The panel, the title «رنگ وضعیت», the nine swatches, their order, sizes, wrap
  and fills, and the description are the same.
- **The helper** says «رنگ خودکار انتخاب شده؛ اگه خواستید عوضش کنید.» where the
  copy said «… اگر خواستی عوضش کن.», the plural you of the redesign's voice.
- **The example's chosen swatch** is custom-1 where the copy chose interview,
  ringed and ticked in a raw `#0f766e`, bound to no variable: the teal custom-1
  had before KN-730 made it orange. The copy bound the ring and the tick to the
  chosen status's base, which the code draws; the original's hex is a leftover
  of the old colour, not a new rule.
- **The colours' names**: the Documentation frame, 376:30, still names interview
  amber, custom-1 teal and custom-4 cyan, as before KN-730 changed the three to
  `#0f6876`, `#c2410c` and `#a21caf`. The code names each swatch for the screen
  reader, so names that describe another colour mislead.

## The approach

1. The helper's Persian takes the original's words.
2. The swatches are named for the colours they are: interview **Teal**,
   «سبزآبی»; custom-1 **Orange**, «نارنجی»; custom-4 **Fuchsia**, «سرخابی»;
   Amber and Cyan, which nothing else uses, leave both catalogs. The other six
   keep their names.
3. The ring and tick stay the chosen status's base.
4. The stories' names follow, and `DESIGN.md` records the reading, the names and
   the stale hex.

## How it is checked

The Color Picker's stories, lint, tsc and the unit suites.
