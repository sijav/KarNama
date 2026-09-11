# KN-015 · Card, desktop and mobile, with the status stripe

Beside the card. Recorded after the build, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** All six desktop states and both mobile
states match Figma, the stripe renders the right colour for all nine statuses,
a deleted or unknown status falls back to the new colour rather than rendering
no stripe, and the card is keyboard focusable and activatable. The Checkbox in
its Title Group sits where the file draws it, flush at the group's inline start
and 8 from the title, its 28 by 28 root giving the four back with a negative
margin; a story focusing it by keyboard in the composed Title Group asserts that
every clipping ancestor holds the whole ring, KN-293.

## What was built

- From node 137:44, read with use_figma: Default, Hover, Pressed, Selected,
  Static and Focus, 400 by 148; and 491:751, the phone's Default and Selected,
  358 by 141, its meta row the date's own 19. The stripe of 358:430 is 4 wide at
  the inline start in the status's base colour, and an unknown status takes
  `new`'s.
- The title is the card's button, stretched over the card, so a press anywhere
  else opens the job opportunity, and Enter does too. It takes the page's font
  back, which a button does not by itself; KN-351 carries the two built
  components that miss it.
- The file hides the checkbox and delete at rest, and a hidden layer gives up
  its room, so they fold to none and fade rather than `display: none`: Tab from
  before the card meets the checkbox, the title, the link and the delete in
  order, the lesson of KN-341 applied from the start. They unfold over the
  component's own reaction, Smart Animate ease in and out over 200 ms; Pressed
  is at once, and a reader who asks for less motion gets every state at once.
- The Focus halo joined the tokens as `elevation.cardFocus`.
- The phone's three dots are the 32 Icon Button, `iconSize="md"`, opening the
  Card menu, whose link item opens the posting in a new tab with no opener.
- DESIGN.md gained the job card's section, and two corrections: the hover
  gotcha, whose `visibility: hidden` would have drawn Default with a gap, and
  the motion paragraph, whose 300 is the prototype map's summary and none of
  the file's reactions; KN-350 carries the built components' motion.
- Stories: Default, Hover, TabOrder, Pressed, Selected, Static, Focus, Mobile,
  MobileSelected, StripeInEveryColour, UnknownStatus, CheckboxRingIsWhole,
  LongTitle and InEnglish; seen headless in a production build.
