# KN-014 · Icon button, 2 tones by 3 states

Beside the button. Recorded after the build, on 2026-09-11, the owner having
asked for speed.

**Exit condition, from the board.** Six combinations match Figma, every
instance requires an accessible label and a test fails when one is missing,
and the hit target is at least 32 by 32.

## What was built

- From node 460:672, read with use_figma: a 32 square of radius md around a
  16 icon, where the card said 20 and the file wins. Neutral and Danger both
  rest with no fill and the icon in `text/secondary`; Neutral hovers to
  `bg/surface-secondary` and `text/primary`, Danger to the rejected status's
  container and `text/error`; both disable at 0.7 with `text/disabled`. The 16
  pixel icon keeps its two pixel stroke, as the Icon set draws it.
- On MUI's IconButton, ripple off, padding none. The name is a required prop,
  and `nameOf` refuses a blank one, with a unit test; the stories assert the
  accessible name.
- Focus: three pixels of `border/focus` inside the button, since the card
  corners and rows it sits in can clip, as the Filter Chip's is.
- Stories: Default, Danger, Hover with a real pointer, Disabled, KeyboardOnly.
  The Hover play waits for MUI's 150 ms fill, with the colour it waits for
  worked out before waiting: computing it inside `waitFor` rewrote the
  element's style on every check, which `waitFor` saw as a change and checked
  again, until the browser gave up.
