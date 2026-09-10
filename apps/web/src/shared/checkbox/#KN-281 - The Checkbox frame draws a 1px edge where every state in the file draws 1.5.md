# KN-281 · The Checkbox frame draws a 1px edge where every state in the file draws 1.5

Beside `Checkbox.tsx`, which is where the change lands.

**Why, from the board.** Match the design exactly is the owner's standing rule,
and the Checkbox's edge is the one thing that says where it is. Critical on the
owner's order of 2026-09-10, as a finding on a built component.

**Exit condition, from the board.** The Checkbox frame's edge is 1.5 in every
state as the five variants of 204:11 draw it, painted inside the frame and
taking no layout space; what a 1.5 edge renders as at device pixel ratios 1 and
2 is measured and recorded; the stories assert the width; and the comment that
says the file draws every border at one is corrected.

## What the file draws

Read with use_figma on 2026-09-10: 204:7 Unchecked, 204:10 Checked, 512:730
Indeterminate, 512:733 Hover and 512:734 Disabled are each 20 by 20 with a
stroke of weight 1.5, aligned INSIDE, not included in layout. No variable binds
the weight.

## What 1.5 renders as, measured in Chromium 151.0.7922.34, 2026-09-10

| drawn as                  | device pixel ratio 1                            | 2                                   |
| ------------------------- | ----------------------------------------------- | ----------------------------------- |
| a 1.5px border            | computes as 1px, one full device pixel          | computes as 1px, two device pixels  |
| an inset 1.5px box-shadow | one full device pixel and one half covered      | three full device pixels            |

Chromium floors a border's width to whole CSS pixels, at every ratio: measured
at 1, 1.25, 1.5 and 2, a 1.5px border is a 1px border, on the element or on a
pseudo-element as KN-266 draws the Input's. That is Chromium, not the
standard: CSS snaps a border to whole DEVICE pixels, so at ratio 2 an engine
that follows it keeps 1.5. Firefox and WebKit were not measured: the builds
this Playwright wants are not installed, and installing them is a download
nobody asked for. An inset shadow draws the true width in Chromium,
anti-aliased where the ratio calls for it. Under forced colours Chromium
removes the shadow, measured: its computed value is `none` and no edge is
drawn, while a one pixel border in `ButtonBorder` is.

## The approach

1. **The frame's edge is an inset shadow of 1.5**, `inset 0 0 0 1.5px` in the
   state's colour: `border/default` unchecked, `bg/brand/default` checked and
   indeterminate, `bg/surface-secondary` disabled, `border/focus` on hover. The
   frame has no border, so its glyph is centred in the whole 20 by 20, as the
   file centres it. The 1.5 is a component constant, since no variable binds it,
   written as a number and composed into the shadow, so noLiterals has no pixel
   string to refuse.
2. **Under forced colours, a one pixel border instead**, in a
   `@media (forced-colors: active)` block, `ButtonBorder`, the system colour for
   a control's edge, stated rather than left to the browser's substitution.
   Measured: that border draws the edge where the shadow draws none.
3. **The stories assert it**: an `edgeOf` helper parses the frame's computed
   box-shadow into its colour, its offsets, its width and whether it is inset.
   Unchecked, Checked, Indeterminate and Disabled assert an inset edge of 1.5
   with no offset and no border; Hover, pinned to light, asserts the colour
   moves from `border/default` to `border/focus`.
4. **The comment is corrected**: the file draws this border at one and a half,
   not one, and says why it is a shadow.
5. **DESIGN.md's stroke section** records the Checkbox as drawn with an inset
   shadow, the measurement, and the forced-colours border.
6. **KN-013's verifier**, which anchors its hover mutation on the frame's hover
   border colour, follows the hover rule to the shadow.

## What changes

- `Checkbox.tsx`: the edge, the constant, the forced-colours border, the
  comment, the hover rule.
- `Checkbox.stories.tsx`: `edgeOf`, the width in four stories, the colour in
  Hover.
- `DESIGN.md`: the stroke section.
- `agent/scripts/verify/KN-013.mjs`: the hover anchor.
- `agent/scripts/verify/KN-281.mjs`.

## The verifier, clause by clause

1. The Checkbox stories pass.
2. **Every state**, in a production build: the frame 20 by 20, no border, an
   inset shadow of 1.5 in the state's colour, Hover by a real pointer.
3. **At ratios 1 and 2** the rendered edge is one and a half CSS pixels: one
   full device pixel and one about half covered at 1, three full at 2.
4. **Under forced colours** the edge is still drawn on the rendered pixels; with
   the forced-colours border taken out, it is not.
5. **THE CASE**: the old one pixel border put back fails the stories on the
   width, by name.
6. The comment no longer says the file draws every border at one.
7. KN-013's, KN-205's and KN-207's verifiers still pass.

## What I am unsure about

- Whether an anti-aliased half pixel at ratio 1 reads as 1.5 or as a soft 1.
  It is what Figma's own canvas draws for a 1.5 stroke at 100 percent, so it
  matches the file at that ratio too.
- Whether the Filter Chip's pressed 1.5, KN-282, should share a helper with
  this. KN-282 decides that when it is built; nothing is shared yet.

## How I will know it worked

`node agent/scripts/verify/KN-281.mjs` passes, the Checkbox stories, the unit
project, lint and tsc pass, and the frame reads as the file's in all four
combinations.

## The check, and what changed after it

The second model found the design sound: one named 1.5 constant, the inset
shadow, an explicit one pixel system border under forced colours, and the
width asserted in the stories. It corrected the plan's claim that a border
can never draw 1.5: the standard snaps to device pixels, so at ratio 2 it
can. Measured again in Chromium 151: there it cannot, at 1 or at 2, so the
table now says which browser and which version, and that Firefox and WebKit
were not measured. It asked that the forced-colours border name its colour,
now `ButtonBorder`, and that forced colours be proved on rendered pixels,
which the verifier does.
