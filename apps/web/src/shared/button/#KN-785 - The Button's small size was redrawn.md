# KN-785 · The Button's small size was redrawn, and the copy of every size changed

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and every screen is made of Buttons.

**Exit**, from the board: the plan lists every difference between 33:58, 37:10
and 37:71 in the copy EITM6CbJY33dMY8IsMFR4R and in the original; the component
and its stories then draw the original's version of every variant, each new
variant with a story of its own, in fa-IR and en-US, light and dark, with both
story-docs entries; sizes, gaps, radii and colours resolve through the tokens;
DESIGN.md's section is corrected; lint, tsc and its tests pass.

## Every difference, read 2026-11-04 with use_figma in both files

Each of Button / S, 37:10, Button / M, 33:58, and Button / L, 37:71, has the
same 25 variants in both, five styles by five states, and every one measures
the same in both: its size, padding, gap and radius, its fills, its strokes and
their weight and alignment, Ghost Pressed's 0.9 opacity, and its label's
characters, size, weight, line height, colour and text style. The descriptions
are word for word the same. What differs:

1. **The icons' order.** The copy lays Icon Leading first and Icon Trailing
   last; the original lays them the other way, so in a right to left reading
   the leading icon sits at the inline start, on the right. The code's
   `startIcon` already sits there, before the label in a right to left
   button.
2. **Layer names** only, the copy's label layers being named Label.

So the redraw the fingerprint flagged is the layer order; no value the code
draws changes.

## The handoff

DESIGN-HANDOFF.md lists Button / L among the components no screen uses, so S
and M are built and L is retired where the code has it: only the Button's own
stories drew it.

## The approach

1. `ButtonSize` loses `L`, and the component its measures; the stories' matrix
   is the five styles by S and M, its counts read from the sizes.
2. The docs say two sizes.
3. DESIGN.md gets a Button section recording the read, and the components table
   row says S and M.
4. KN-774 and KN-779, which waited on this card, find Button / S unchanged:
   the bg/surface fill their instances draw is their own override.

## How it is checked

The Button's stories, the theme's contrast tests that read its looks, lint and
tsc.
