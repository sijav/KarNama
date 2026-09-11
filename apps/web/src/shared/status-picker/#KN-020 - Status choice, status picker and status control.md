# KN-020 · Status choice, status picker and status control

Beside the picker. Recorded after the build, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** All three families match Figma, the control
opens the picker, choosing a status closes it and reports the change, Escape
cancels without changing anything, and the underlying chip still has no
interactive attributes of its own.

## What was built

- From nodes 427:567, 427:592 and 199:21, read with use_figma: the Status
  Choice's shell and ring in Default, Hover and Selected; the Status Picker's
  label, wrapping row and dashed add chip, on MUI's RadioGroup, the Color
  Picker's way; and the Status Control's pill in Default, Hover and Pressed.
- The control opens the picker in a popover panel of 372, 4 below it, which
  stands in for the Change Status modal until KN-028 builds the Modal. Choosing
  closes it and hands the id over; Escape closes it with nothing changed; focus
  goes back to the control. The chip inside keeps no role and no tab stop.
- The Status Chip folder gained its barrel.
- Stories: Default, ByKeyboard, Hover and InEnglish for the picker; Default,
  ChoosingAStatus, EscapeCancels and InEnglish for the control; seen headless in
  a production build.
