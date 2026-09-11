# KN-274 · The Input's focus ring for an invalid field sits outside a field that fills its container, so a host that clips at its edge removes it

Beside `Input.tsx`, which is where the change lands.

**Why, from the board.** The person tabbing back into a field that failed
validation needs to see where focus is in the form the product actually ships,
not only in the story, and forms sit in modals and scroll areas, the hosts most
likely to clip. Critical on the owner's order of 2026-09-10, as a finding on a
built component.

**Exit condition, from the board.** An invalid Input focused inside a host that
clips its overflow flush at the field's edges still changes at least a
two-pixel perimeter at 3:1, KN-244's measure, either because the change is
drawn inside the field's own box or because the Input keeps the room itself; a
story renders the field in an overflow hidden host with no padding and asserts,
from the rendered geometry, that every pixel of the focus change lies inside
every clipping ancestor, and a mutation back to a ring the host clips fails it
by name; DESIGN.md's section says which; and the Checkbox's and the Filter
Chip's rings are checked for the same, each matching or carrying a card.

## What was there before KN-274

- A focused invalid field keeps its edge in `border/error` at the focus width,
  two pixels, KN-241, and shows focus by an outline: two pixels of
  `border/focus` at an offset of two, KN-244. Every pixel of that outline lies
  two to four pixels outside the field, and the field fills its container: the
  Input's root is a column, and the field is as wide as it.
- FocusedWhileInvalid gives each field 16 pixels of padding on an opaque
  backdrop, so the outline always has room, and it measures the outline's
  contrast against that backdrop.
- The Checkbox draws the same outline on its 20 by 20 frame, and the root has
  no padding, so the ring lies four pixels outside the root's box. The Filter
  Chip draws it on the button itself. Both would lose it in a host that clips
  flush at their edges.

## The approach: the ring goes inside the field

1. **The edge stays as KN-241 left it**, two pixels of `border/error` on focus.
   **The ring moves inside**: a second pseudo-element, `::after`, laid over the
   field at an inset of four, the edge's two and a gap of two, which is the
   offset the ring had outside; two pixels of `border/focus`; its radius the
   field's less the inset, 8 less 4, so its curves are concentric with the
   edge's. It is nested under the existing `'&.Mui-focused'` rule and only in
   error, as the outline was, and the outline goes. Nothing is then drawn
   outside the field's own box, and the Input asks its host for no room.
2. **Why inside rather than room.** The Input fills its container, its label and
   field flush with its edges as every screen draws them; keeping four pixels
   of room would inset the field from its own label and from every other field
   in a form. Inside costs the field nothing: the text and the icons sit 16
   from the edge, the ring's inner edge is at 6.
3. **Why the gap stays.** With the gap each colour meets the field's own
   surface on both sides. Red and blue side by side are 1.37 to one against
   each other, and to someone who cannot tell them apart they would read as
   one band.
4. **What focus changes now, and against what.** The edge's second pixel,
   surface to `border/error`, 3.76 to one on white; and the ring, surface to
   `border/focus`, 5.17 to one on white. Both are measured against the field's
   own surface, which is the same wherever the field is put, not against the
   host behind it; in dark KN-271 holds both colours at 3:1 or more on the dark
   surface. **The area**: the ring alone, being inset, is a little smaller than
   the field's own two-pixel perimeter, 4W + 96 against 4W + 160 in a field W
   wide and 44 tall; with the edge's gained pixel, 2W + 76, the change is
   6W + 172, more than the perimeter at every width.
5. **Forced colours.** A pseudo-element's border is kept there, as KN-281 and
   KN-288 found, so the ring still shows, as a second line inside the edge.
6. **DESIGN.md**: the section says the ring is drawn inside the field's own box,
   why not the room, and the area arithmetic; the sentence about a clipping
   container having to leave room goes.

## The story

FocusedWhileInvalid is rewritten. The field sits in a host with overflow hidden
and no padding, so the host's inline edges are the field's. Focused by Tab, the
play asserts:

- the edge, two pixels of `border/error`, KN-241;
- the ring, the `::after` border, two pixels or more of `border/focus`, at 3:1
  or more against the field's own background;
- the area, from the geometry: the band the edge gained plus the ring's band,
  less the field's two-pixel perimeter, is zero or more;
- **the clipping, from the rendered geometry**: the focus extent, the field's
  box grown by any outline and any outer box-shadow, and the boxes of its
  pseudo-elements, lies inside the padding box of every ancestor whose
  overflow is not visible; with the outline back it lies four outside the host
  and the story fails by name;
- nothing that lays the text out moves.

The three backdrops go: the ring is no longer measured against what is behind
the field.

## What changes

- `Input.tsx`: the outline becomes the `::after` ring, with two constants for its
  inset and width.
- `Input.stories.tsx`: FocusedWhileInvalid, a `focusExtent` helper and a
  `clippingAncestors` helper; SURFACES goes.
- `story-docs/{en,fa}/Shared-Input.md`: the story's entry.
- `DESIGN.md`: the section.
- `agent/scripts/verify/KN-244.mjs`: its clauses retargeted at the inside ring,
  since KN-274 changes the mechanism KN-244 chose; its exit still holds.
- `agent/scripts/verify/KN-274.mjs`: new.
- Two cards, for the Checkbox, CHILD OF KN-013, and the Filter Chip, CHILD OF
  KN-017, if the measurement below confirms what the code says.

## The verifier, clause by clause

1. The Input stories pass, FocusedWhileInvalid by name.
2. **THE CASE**: the outline put back in place of the inside ring fails
   FocusedWhileInvalid by name, on the clipping assertion.
3. **Pixels**, in a production build, in Chromium, light and dark, fa-IR and
   en-US: the story's field in its flush host, screenshots of the host's box
   before and after focus; the pixels that changed at 3:1 or more between the
   two count at least the field's two-pixel perimeter, 4W + 4H less 16. Run
   against a second build with the outline back as a positive control: there
   the count inside the host must fall short.
4. DESIGN.md's section says the ring is drawn inside and why.
5. **The Checkbox and the Filter Chip**, in the production build, each in a
   host wrapped round it with overflow hidden and no padding, focused by
   keyboard: whether their focus change lies inside the host. Each that does
   not must have its card on the board.
6. KN-244's verifier, retargeted, passes, and it runs KN-241's.

## KN-244's verifier, retargeted

- The surfaces check becomes: the story measures the ring against the field's
  own background.
- THE CASE: the ring removed fails.
- Contrast: the ring in the field's own surface colour fails on the 3.
- Two pixels: a one-pixel ring fails on the 2.
- Area: the edge kept at one pixel on focus in error, so only the ring changes,
  fails on the area assertion, which comes before the edge's own.
- The border stays `border/error`: unchanged.
- The text does not move: padding added to the focused invalid field fails.
- DESIGN.md's patterns follow the new text.

## What I am unsure about

- Whether a ring four in from a red edge reads as focus as plainly as one four
  outside it did. It is the same ring, the same colour and width, on the
  field's own white rather than on the page.
- Whether the extent helper sees everything that can paint outside a box:
  outlines, outer shadows and pseudo-elements, not filters or transforms,
  which nothing in the Input uses.
- The field is 44 tall, the ring's inner box 32 and the text's line 24, four
  pixels clear above and below.

## The check, and what changed after it

The second model found the direction sound, and that WCAG's own guidance counts
separate qualifying bands together, each at 3:1 between the states. What it
corrected is taken:

- **The perimeter is WCAG's 4W + 4H**, 4W + 176 for a field 44 tall, not the
  band's area of 4W + 160. The change, 6W + 172, clears it at any width over 2.
  The story and the verifier use 4W + 4H.
- **The `::after` in full**: content, absolute, inset, border-box sizing,
  pointer-events none, and its radius.
- **The clipping helper is scoped**: the padding box is the clip edge for hidden,
  auto and scroll; an `overflow: clip` with a margin, or a rounded clipping
  ancestor, is not modelled, and the story's host is square and hidden. The
  screenshots are the rendered proof.
- **Every pixel, not only the inline ones.** No host can be flush with a field's
  top or bottom: an Input's label always sits above its field and an invalid
  field's message below it. So the story asserts the stronger thing as well:
  the focus extent lies inside the field's own box, which puts it inside any
  host that holds the field at all. The verifier counts the changed pixels
  inside the field's box and checks that nothing outside it changed.
- **Pixels are not the only proof.** The WCAG arithmetic is done from computed
  colours and geometry in the story; the verifier's screenshots show the
  rendered result, with the caret hidden, since it blinks inside a focused
  field, and anti-aliased corners counted only where they clear 3:1.
- **The two cards are filed now**, not on a measurement: the Checkbox's ring is
  on a frame whose root has no padding, and the Filter Chip's is on the button
  itself.
