# KN-290 · Under forced colours the Checkbox's tick and dash keep their author colour, so a disabled mark looks enabled and a white one can vanish

Beside `Checkbox.tsx`, which is where the change lands.

**Why, from the board.** A checkbox whose mark cannot be seen, or whose disabled
mark looks enabled, fails exactly the people who turned on high contrast to see
it. Critical on the owner's order of 2026-09-10, as a finding on a built
component.

**Exit condition, from the board.** Under forced colours the tick and the dash
are drawn in system colours, ButtonText when enabled and GrayText when
disabled, the keyword kept so a check can read it whatever the palette, and each
stays visible against the frame; a check in a production build reads checked
and indeterminate, enabled and disabled, under forced colours, comparing the
rendered mark with a same-page probe of its system colour, and a mutation back
to the author colour fails it; and DESIGN.md's stroke section says what the mark
takes there.

## What is there now

The tick and the dash are SVG strokes in `text/on-accent`, white, set as an
author colour. Under forced colours an SVG keeps an explicit author stroke,
`forced-color-adjust: preserve-parent-color`, while the frame's brand fill is
replaced by the system background, so the mark stays white, whatever the
palette, on whatever background the system gives the frame: it can vanish, and
a disabled mark looks the same as an enabled one, where KN-288 made the
disabled edge GrayText.

## The approach

1. **The mark's stroke under forced colours is a system colour**, set inside a
   `forced-colors: active` media query on each SVG: a custom property,
   `--karnama-forced-mark`, holds the keyword, `ButtonText` when enabled and
   `GrayText` when disabled, and the stroke reads it, the way KN-288 kept the
   edge's keyword so a check can read which was chosen whatever the palette
   resolves it to.
2. **Visible against the frame**: under forced colours the frame's fill is the
   system background, so a mark in ButtonText, the colour for a control's text
   on that background, is drawn to be seen on it; GrayText is the system's
   colour for disabled content on it.
3. **DESIGN.md's stroke section** says the mark takes ButtonText, or GrayText
   when disabled, under forced colours, KN-290.

## What changes

- `Checkbox.tsx`: the tick's and the dash's `sx`.
- `DESIGN.md`: the stroke section.
- `agent/scripts/verify/KN-290.mjs`: new.

## The verifier, clause by clause

1. The Checkbox stories pass.
2. **In a production build under forced colours**: checked and indeterminate,
   each enabled and disabled, disabled through the stories' args. Each reads the
   keyword its mark chose, from `--karnama-forced-mark` on the SVG, requires
   ButtonText enabled and GrayText disabled, and compares the rendered mark's
   pixel, at the middle of the stroke, with a same-page probe of that system
   colour; and requires the mark's pixel to differ from the frame's inside, so
   it is visible against it.
3. **THE CASE**: a build with the forced-colours rule taken out, the mark back
   in its author colour, fails the probe comparison.
4. DESIGN.md's section says what the mark takes.

## What I am unsure about

- Where on the tick to read a pixel that is fully covered by the stroke at a
  device pixel ratio of one: the stroke is 2 wide on a 12 box scaled to 12, so a
  point on the polyline's middle segment, read at a ratio of two, is safer.
- Whether the stories take `disabled` through the address bar for Checked and
  Indeterminate, which the first run shows.

## The check, and what changed after it

The second model confirmed that a system colour set as the stroke inside the
media query takes effect, `preserve-parent-color` only keeping an inherited
`color`, and found the visibility claim unsupported: CSS Color 4 guarantees
`ButtonText` against `ButtonFace` and `CanvasText` against `Canvas`, not across,
and the frame is a span whose forced background need not be `ButtonFace`.
Taken: **the frame's fill under forced colours is set to `ButtonFace`**, so the
enabled mark in `ButtonText` and the disabled one in `GrayText` sit on the
background their pairs are made for, with `ButtonBorder` still the edge. The
check samples a small region on a straight part of each mark for a fully
covered pixel matching the probe, rather than one pixel that anti-aliasing can
blend; it proves the palette gives `ButtonText` and `GrayText` different
colours; and the disabled mark is the mutation's discriminator, since white
could equal `ButtonText` in some palette.
