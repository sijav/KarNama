# KN-288 · Under forced colours a disabled Checkbox draws the enabled edge, ButtonBorder, where GrayText says disabled

Beside `Checkbox.tsx`, which is where the change lands.

**Why, from the board.** A disabled control that looks enabled in high contrast
invites a click that does nothing, for exactly the people who rely on that mode.
Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition, from the board.** Under forced colours a disabled Checkbox's
edge is GrayText and every enabled state's is ButtonBorder, checked and
indeterminate included; a check in a production build reads the rendered edge of
all five states under forced colours, and a mutation giving disabled ButtonBorder
again fails it; and DESIGN.md's stroke section says which colour each state
takes there.

## The approach

1. In the frame's forced-colours `::before`, the border colour follows the
   state: `GrayText` when disabled, the CSS system colour for disabled content,
   and `ButtonBorder` otherwise, the colour for a control's edge.
2. **The check reads what the browser paints**: under forced colours the system
   colours resolve to the forced palette's values, so the verifier resolves
   `GrayText` and `ButtonBorder` on a probe element in the same page, then reads
   each state's rendered edge pixel and compares: disabled against GrayText,
   unchecked, checked, indeterminate and hover against ButtonBorder, and the two
   must differ, or the check tells nothing apart.
3. **The mutation** gives disabled `ButtonBorder` again, rebuilds, and the check
   must fail on disabled.
4. **DESIGN.md's stroke section** names the two colours and which state takes
   which.

## What I am unsure about

- Whether Chromium's emulated palette gives GrayText and ButtonBorder different
  values. If it does not, the rendered comparison cannot tell them apart, and the
  check falls back to the computed colour of the pseudo-element, said so.

## The check, and what changed after it

The second model agreed GrayText and ButtonBorder are the right colours and the
change is one conditional. It corrected the check: forced colours emulation
promises no palette, and a user's palette may make the two colours the same, so
"the two must differ" cannot be required, and the computed colour cannot tell
the keywords apart either, since both resolve to the same value then. The
keyword is kept in a custom property, `--karnama-forced-edge`, which the check
reads per state; the rendered edge is compared with a same-page probe of that
system colour, whatever it resolves to; the mutation changes the keyword; and
Hover is driven by a real pointer. It noted that if a disabled edge must look
different in every palette, that needs a sign that is not colour, which is
beyond this card.
