# KN-284 · The Checkbox's forced-colours edge is a laid-out border, shrinking its frame's content box in that mode

Beside `Checkbox.tsx`, which is where the change lands.

**Why, from the board.** An edge that takes layout space in one mode is the
defect KN-266 and KN-281 exist to remove, and the check that should catch it
reads a colour, not a size. Critical on the owner's order of 2026-09-10, as a
finding on a built component.

**Exit condition, from the board.** Under forced colours the Checkbox frame's
edge is drawn over the frame without taking layout, a border on a pseudo-element
for instance, so its content box stays 20 by 20 in that mode as in every other;
KN-281's forced-colours check measures the content box and the glyph's position
as well as the pixels, and a mutation back to a laid-out border fails it.

## The approach

1. **The fallback moves onto a `::before`**, inside the frame's
   `@media (forced-colors: active)` block: absolutely positioned, inset 0, the
   radius inherited, one pixel of `ButtonBorder`, no pointer events. The frame
   becomes `position: relative`. Outside forced colours nothing changes: the
   pseudo-element is not generated, and the edge is the 1.5 inset shadow.
2. **KN-281's forced-colours check** measures, under forced colours, the frame's
   content box, `clientWidth` and `clientHeight` at 20, and the glyph's box
   against the frame at the same offsets as without forced colours, besides the
   edge being drawn on the pixels.
3. **A verifier, KN-284.mjs**, runs the Checkbox stories, reads the geometry in
   a production build under forced colours, and puts the laid-out border back
   in the source, rebuilds, and expects the geometry check to fail.

## What I am unsure about

- Whether a pseudo-element's border is kept by forced colours the way the
  element's own border is. KN-266 measured it for the Input: kept, in the
  system's colour; the verifier reads the pixels again here.

## The check, and what changed after it

The second model found the mechanism right and confirmed MUI 9.4 nests a
pseudo-element inside a media query in one sx object. Taken: `content` is
stated, since without it no pseudo-element exists; the pseudo-element is
`box-sizing: border-box`; and the mutation swaps the pseudo-element back for
the border on the frame rather than adding one beside it. It noted the
glyph's position cannot expose a symmetric border, since flex centring keeps
it where it was, so the content box is the check that matters, and the
verifier leans on that.
