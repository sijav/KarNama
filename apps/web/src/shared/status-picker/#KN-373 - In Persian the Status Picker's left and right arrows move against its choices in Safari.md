# KN-373 · In Persian the Status Picker's left and right arrows move against its choices in Safari, as the Color Picker's did

Beside the Status Picker. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** The Status Picker's radio group takes
arrowsAcross, and a story presses real left and right arrows in both languages
through vitest/browser, landing on the choice beside the chosen one on screen
and choosing it, while an arrow pressed on the New status button moves nothing.

## What was done

- The Status Picker's radio group takes `onKeyDown={arrowsAcross}`, KN-301's
  handler, so its left and right arrows move the way they point in every
  browser. «+ وضعیت تازه» sits in the same group; the handler leaves a key
  pressed on anything but a radio to the browser.
- ArrowsInPersian and ArrowsInEnglish press real keys from the second status:
  the left arrow lands on the choice to its left in the same row, the right
  arrow on the one to its right, each reported through onChange and taken by
  the row; on the add chip the left arrow keeps focus there and is not taken.
  The story holds no value, so it follows focus: returning onto the radio its
  args keep checked reports nothing, as a checked radio has nothing to change.
  Both failed without the handler, on the row taking the key. Looked at in the
  pane in Persian with real keys.
