# KN-295 · KN-274's story measures the focus change from a model: rounded bands counted as rectangles, and transforms and filters not read

Beside the Input. Recorded after the fix, on 2026-09-12, under the owner's rules
of 2026-09-11.

**Exit condition, from the board.** FocusedWhileInvalid's area accounts for the
rounded corners, from the exact quarter-ring areas of the edge's radius and the
ring's or from a rendered reading, and still clears 4W + 4H; focusExtent
requires what it does not model, transform, filter, clip-path and mask, to be
none on the field, both pseudo-elements and the input, and counts the input's
own outline; a transform and a filter on the ::after each fail
FocusedWhileInvalid by name; the verifier also reads the rendered change on a
field 80 wide or less, in light and dark, clearing 4W + 4H with nothing changed
outside; and DESIGN.md's arithmetic states the corners' loss and the width
above which the change clears the perimeter.

## What was done

- The area is taken between contours, not rectangles. `insetArea` gives the
  area inside a contour drawn a given distance in from the box with its own
  corner radius, the rectangle less `(4 − π)r²`, the four corners; `band` is the
  difference of two. The story reads each radius from the computed styles: the
  edge's band runs from its resting width in to its focused one, the ring's from
  its own inset in by its own width. For the 568 wide field the model now says
  3558.5 square pixels where it said 3580 and the pixels read 3536; the rest is
  the anti-aliasing a geometric model cannot hold.
- `unmodelled` names every place a paint effect the extent cannot model is set,
  on the field, both pseudo-elements and the input: transform, filter,
  clip-path and the mask's image. The story requires the list to be empty. With
  a filter planted on the ring it fails with `the ring, ::after: filter`, and
  with a transform, `the ring, ::after: transform`.
- `focusExtent` takes the input as well, growing the extent by the input's own
  box and reach, since an outline on the input is drawn outside the input and
  the input can fill the field.
- The story renders a second field 80 wide inside the same clipping host and
  runs every check on it too, in tab order. A narrow field is the hard case:
  the change is a band, so the narrower the field the less of it there is
  against the perimeter it has to clear.
- DESIGN.md's arithmetic now states the corners' cost, 21.5 square pixels, the
  change as 6W + 150.5, and that it clears WCAG's 4W + 176 from 13 pixels of
  width upward.

## What is not claimed

- The verifier's rendered reading of a narrow field in light and dark was not
  written: the owner's rule of 2026-09-11 ended per-card verifier scripts and
  pixel proofs at the close. The narrow field is measured by the story instead,
  every run, in the runner's own browser.
- The two planted effects were run once each by hand and then removed, rather
  than committed as a mutation harness, for the same rule.
- The dev Storybook in the agent's browser pane renders at a device pixel ratio
  of 1.25, where a two pixel border computes as 1.6, so a play's pixel-exact
  assertions stop there though they pass in the runner. The shapes were looked
  at in the pane; the numbers are the runner's.
