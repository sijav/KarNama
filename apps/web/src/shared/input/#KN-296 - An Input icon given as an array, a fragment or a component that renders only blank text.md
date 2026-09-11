# KN-296 · An Input icon given as an array, a fragment or a component that renders only blank text still draws an empty slot

Beside the Input. Recorded after the fix, on 2026-09-12, under the owner's rules
of 2026-09-11.

**Exit condition, from the board.** An Input whose icon renders only blank text,
through an array, a fragment or a component, draws no slot that takes room and
its text box sits 16 from that edge, decided from what the slot rendered rather
than from the prop; IconsTurnedOff covers an array of a space, a fragment
holding a zero-width space and a component returning a space, each asserting a
slot that takes no room; a mutation removing the rendered check fails it by
name; and the comment on drawn() says nothing to read, with the lone-mark case
named as deliberate.

## What was done

- The slot reads itself. `watchContent`, a ref callback in the shape the tab
  panels' stops use, sets the slot's `hidden` when what it rendered has nothing
  to read, no element and blank text, and keeps a MutationObserver on its
  children and their text for content that arrives later. The sx answers
  `&[hidden]` with `display: none`, since the slot's own `inline-flex` would
  otherwise beat the attribute's.
- `drawn` still reads the prop, which is all it can do, and its comment now says
  nothing to READ rather than nothing to see, with the lone combining mark named
  as hidden on purpose.
- IconsTurnedOff draws three more fields: an array holding a space with a
  fragment holding a zero-width space, and a component returning a space on
  both sides. The play now loops over every rendered-blank field, asserting each
  slot is zero wide and the text 16 from both edges. In the browser, all seven
  fields put their input at 16 and the three rendered-blank fields carry two
  hidden slots each.
- The story's docs say so in both languages.

## What is not claimed

- No committed mutation harness, under the owner's rule of 2026-09-11. The
  check was planted against twice by hand instead: with the rendered check
  removed, and with `&[hidden]` set to `inline-flex` so the attribute is set and
  the display beats it. Each fails IconsTurnedOff with "expected 20 to be +0".
