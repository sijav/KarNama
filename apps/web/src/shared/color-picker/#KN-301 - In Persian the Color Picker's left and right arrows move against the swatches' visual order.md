# KN-301 · In Persian the Color Picker's left and right arrows move against the swatches' visual order

Beside the picker. Recorded after the fix, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** In Persian and in English the left and
right arrows move to the swatch that sits in that direction and choose it,
established by where the focused swatch lands on screen after a real key press,
and up and down still move through the order; a story presses both arrows in
both languages.

## What was found

- The card said Chromium's radio arrows follow the DOM, left meaning previous
  even right to left. That is WebKit's comment, not Blink's code: Blink's
  `radio_input_type.cc` reads `ComputedTextDirection()` and makes the left
  arrow the next radio right to left. The ArrowsInPersian story, pressing real
  keys through `vitest/browser`, passed in Chromium before anything changed.
- WebKit's `RadioInputType::handleKeydownEvent` sets `forward` from Down and
  Right alone, "even for RTL", so in Safari the Persian picker's left arrow did
  move to the swatch on the right. The bug is real there. Firefox's code was not
  read; it no longer matters, since the picker now owns the two keys.

## What was done

- `acrossTo` in `theme/sides.ts`, the index the left or right arrow moves to,
  read against the row's direction and wrapping at either end, or null to leave
  the key to the browser: up, down, other keys, modified arrows, and a key
  pressed off the radios. Unit tested in node.
- `arrowsAcross`, the handler the Color Picker's radio group takes: it prevents
  the default, focuses the radio `acrossTo` names and clicks it, which checks it
  and tells the group, as the browser would.
- ArrowsInPersian and ArrowsInEnglish press real keys from the amber, in the
  middle of its row both ways: left lands 8 to the left in the same row, right 8
  to the right, up and down move through the order, and the keydown says the row
  took left and right and left up and down to the browser. With storybook/test's
  synthetic walk, left always the previous, the Persian story fails, so it can
  tell the two apart.
- DESIGN.md says so beside the swatch order, TECH-DEBT 18 records the route
  round the browser and when it retires, and KN-373 gives the same handler to
  the Status Picker, whose choices are the same kind of row.
