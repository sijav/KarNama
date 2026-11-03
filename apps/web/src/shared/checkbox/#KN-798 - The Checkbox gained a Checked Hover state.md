# KN-798 · The Checkbox gained a Checked Hover state

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and every selection in the redesign is made
with it.

**Exit**, from the board: the plan lists every difference between 204:11 in the
copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its stories
then draw the original's version of every variant, each new variant with a story
of its own, in fa-IR and en-US, light and dark, with both story-docs entries;
sizes, gaps, radii and colours resolve through the tokens; DESIGN.md's section
is corrected; lint, tsc and its tests pass.

## Every difference, read 2026-11-03 with use_figma in both files

Unchecked, Checked, Indeterminate, Hover and Disabled are the same in both: 20
by 20, `radius/sm`, an edge of 1.5 inside, Unchecked on `color/bg/surface` with
`color/border/default`, Checked and Indeterminate filled and edged with
`color/bg/brand/default` under the tick or the dash in `color/text/on-accent`,
Hover the unchecked square with a `color/border/focus` edge, and Disabled on
`color/bg/surface-secondary` at 0.6. What differs:

1. **A sixth state, Checked Hover**: the checked square filled and edged with
   `color/bg/brand/hover` under the same tick.

Neither file draws a hover for the indeterminate square, so it keeps its own
fill under the pointer.

## The approach

A rule on the root, beside the unchecked hover's, since MUI's invisible input
sits over the frame: hovered, checked, enabled and not indeterminate, the frame
takes `bg/brand/hover` for its fill and its edge. Stories CheckedHover and
CheckedHoverInDark by the runner's real pointer; both story docs; DESIGN.md's
Checkbox section and table row.

## How it is checked

The Checkbox's stories, lint, tsc, and a look in both schemes.
