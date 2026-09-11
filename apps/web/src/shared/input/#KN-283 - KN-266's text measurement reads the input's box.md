# KN-283 · KN-266's text measurement reads the input's box, so a text-indent moves the text without failing a check

Beside `Input.stories.tsx`, where the measurement lives.

**Why, from the board.** The card that moved the Input's text to 16 has a check
that would not notice it moving back, which is the check that says it was done.
Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition, from the board.** The Input's stories and KN-266's production
check measure where the text starts, the input's box edge plus its own padding,
border and text-indent on the side the text starts from, given its direction
and alignment, and read 16 as 95:5 draws it; a static text-indent, a padding on
the input and a changed alignment, each present in every state, fail Default
and the production check by name.

## What is there now

- `textInsets(field, box)` in the stories returns the gaps between the field's
  outer box and the input element's box, left and right. The input's own
  padding, border and text-indent move the text inside that box without moving
  the box, so a static `textIndent` on `'& input'` draws the text at 17 while
  every story still reads 16. KN-243's comparison of focus against rest cannot
  see a change present in both.
- KN-266's production check reads the same box gaps.
- `slotsAreTheFiles`, KN-267's, measures the text box at 40 from an icon's side
  with the same proxy.

## The approach

1. **Where the text starts**, in the stories: the input's box edge on the side
   the text starts from, its direction's start, plus the input's own border and
   padding on that side, plus its text-indent; and where the content ends on the
   other side, the box edge less the border and padding there. Read from the
   computed style's properties, not by name strings.
2. **Alignment**: the text starts at the start only while it is aligned there,
   `start` or the direction's own side. Aligned anywhere else it has no fixed
   start to measure, and the helper throws, naming the alignment, so the story
   fails by name with the reason.
3. **The return is start then end**, not left then right, so a story reads the
   side the text starts from first. Every story asserting 16 at both sides is
   unchanged; `slotsAreTheFiles` asserts 40 on an icon's side through the same
   helper instead of its own box arithmetic.
4. **KN-266's production check** measures the same way in the page, the
   alignment included, and names the alignment when it fails.

## What changes

- `Input.stories.tsx`: `textInsets`, `slotsAreTheFiles`, and the `px` helper
  moved above them.
- `agent/scripts/verify/KN-266.mjs`: its measurement and its header.
- `agent/scripts/verify/KN-283.mjs`: new.

## The verifier, clause by clause

1. The Input stories pass.
2. **THE CASE**, three mutations of the input's own style, each present in every
   state: a text-indent of one pixel, a padding at the inline start of one
   pixel, and the text centred. Each fails Default by name, and each fails
   KN-266's production check by name, run as KN-266's own verifier against the
   mutated component.
3. KN-266's verifier passes on the real component.

## What I am unsure about

- Whether Chromium resolves `text-indent` on an input to pixels in the computed
  style, which a percentage would not be; the helper refuses anything but a
  length in pixels.
- Whether MUI's input carries a computed `text-align` of `start` in both
  directions, which the first run shows.

## The check, and what changed after it

The second model found the formula right for this native text input, the
content origin on the start side, and throwing on any other alignment the
simplest right treatment, since the Input has no alignment feature and the file
draws the text at the start. Two things taken: the helper refuses an input
scrolled sideways, whose visible text no longer starts at its origin, so every
story claiming 16 asserts an unscrolled field; and when the field is empty it
reads the placeholder's own alignment and indent, since the placeholder is what
the field shows then. A text-indent that is not a length in pixels is refused,
since a percentage stays a percentage in the computed style.
