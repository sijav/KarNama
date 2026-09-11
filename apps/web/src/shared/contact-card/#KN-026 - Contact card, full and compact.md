# KN-026 · Contact card, full and compact

Beside the card. Recorded after the build, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** Both layouts and all three states match
Figma, every field the design draws is present, long values truncate rather
than reflow the card, and email and phone are actionable links. The Checkbox in
its Title Group sits where the file draws it, flush at the group's inline start
and 8 from the name, its 28 by 28 root giving the four back with a negative
margin; a story focusing it by keyboard in the composed Title Group asserts that
every clipping ancestor holds the whole ring, KN-293.

## What was built

- From node 248:116, read with use_figma: Full and Compact, each Default, Hover
  and Selected. The full card comes out at the file's 360 by 261.
- Every field the file draws: name, role and company, email and phone as mailto
  and tel links, the linked job opportunity, LinkedIn opening in a new tab. A
  missing field draws no row; a long value is cut with an ellipsis.
- The phone is grouped four, three and four in the reader's digits,
  `phone.ts`, unit tested, and kept left to right so its groups stay in order.
- The name is the card's button, stretched over the card; the Checkbox, the
  delete and the links sit above it. The Checkbox and delete join the row on
  hover, with focus inside, or when selected. The Title Group clips nothing, and
  the CheckboxRingIsWhole story checks every clipping ancestor holds the ring's
  28 by 28.
- The compact card's hover shadow joined the tokens as
  `elevation.contactCardHover`; the story fixtures' contacts gained a LinkedIn
  and a linked job; the Checkbox folder gained its barrel.
- Stories: Full, FullHover, FullSelected, CheckboxRingIsWhole, LongValues,
  Compact, CompactSelected, WithoutEmailOrPhone and InEnglish; seen headless in
  a production build. The compact mail button's handler is not run by a story;
  noted on KN-340.
