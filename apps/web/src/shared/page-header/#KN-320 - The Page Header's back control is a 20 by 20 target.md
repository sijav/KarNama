# KN-320 · The Page Header's back control is a 20 by 20 target, under the 24 the product asks of a control

Beside the Page Header. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** The back control's target is 24 or more
each way while the arrow stays 20 and stays 12 from the title, and the WithBack
story measures both.

## What was done

- The back control carries two pixels of padding round the 20 arrow and takes
  them back as a margin of minus two: its box, and so its target, is 24 each
  way, while its place in the row is still the arrow's 20, so the arrow does
  not move and stays 12 from the title. The target reaches two pixels into the
  gap and past the row's start. `TARGET` is KN-206's 24, a component constant,
  since the icon scale's 24 is an icon's size and not a target.
- WithBack measures the control at 24 by 24, the arrow at 20 by 20, and the
  arrow's gap to the title at 12; it failed on the old control. Looked at in
  Persian light and English dark, where the gap reads 12 from the arrow's edge.
