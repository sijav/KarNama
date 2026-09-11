# KN-260 · Stories inherit the real pointer where the last hover story left it

Beside the Vitest setup. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** Every story starts with the test runner's
pointer somewhere that hovers nothing, set once for the whole suite rather than
per story; BlankErrorIsNoError drops its pointer-events workaround and
TECH-DEBT 15 is deleted; and a check runs a story that leaves the pointer on a
field followed by one asserting a resting border in the same spot.

## What was done

- `vitest.config.ts` gives the browser a `parkPointer` command, Playwright's
  `mouse.move(0, 0)`, and `vitest.setup.ts` calls it before every story. A
  first try hovered a one pixel element at the corner, and Playwright's hover
  waited for that element to be visible and stable, which an element added
  before a story renders never is: the hook timed out.
- BlankErrorIsNoError's row lost its `pointerEvents: 'none'`, and TECH-DEBT 15
  is gone.
- LeavesThePointerOnTheField hovers the Input and leaves the pointer there;
  StartsAtRest, next in the file, draws the field in the same spot and finds
  the resting border. The owner's rule of 2026-09-11 dropped the mutation the
  exit condition names.
- The whole storybook project passed, 245 of 245, where the run before the
  reset had failed the JobCard's Pressed and the NavItem's Hover: KN-365's
  failures were this pointer.
