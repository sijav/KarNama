# KN-108 · Dark destructive controls fail contrast, because on-accent is one token for two fills

Beside the theme. Recorded after the fix, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** Every derived contrastText clears 4.5 to
one against every fill the theme pairs it with, a test enumerates those pairs
from the theme rather than from a hand-written list, and it fails when a fill
changes without its text following.

## What was done

- Measured first: under the derived on-accent, the danger fill read 3.92, its
  hover 4.12, the Destructive pressed fill 3.75 and the Primary pressed fill
  4.05, and even pure white stayed under 4.5 on the first three. Lighter text
  could not fix a fill that came out light, so the fills move: the six that
  carry on-accent, `ACCENT_FILLS`, are walked darker in their own hue until
  white clears 4.5 on them, and on-accent stays the design's white.
- The first attempt derived on-accent with `deriveDark`, which turned white
  black and walked the fills lighter to suit it: every pair passed, and the
  Destructive button was black on red. A test now keeps on-accent light and
  every accent fill dark, so that cannot pass again.
- Enumerating the Button's pairs found a second one: the Secondary and Text
  buttons' pressed fill, `accent/200`, derived as a foreground, sat light under
  `text/brand` at 1.30 to one. It is a dark tint of its hue now, one of
  `DARK_FILLS`.
- The test reads the theme's palette, each contrastText on its main and dark,
  and every filled state of the Button's `LOOKS`, exported for it, and checks
  each pair against the derived palette. DESIGN.md says the rule.
- The light palette is the design's: its Destructive rest, white on #ef4444,
  is 3.76 to one. KN-396, blocked on the owner.
