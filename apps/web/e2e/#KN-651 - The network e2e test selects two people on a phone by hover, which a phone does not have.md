# KN-651 - The network e2e test selects two people on a phone by hover, which a phone does not have

## The card

**Why.** An e2e suite with a test that always fails in the phone project trains everyone to read its
red as noise, and leaves the phone's way of choosing people untested end to end.

**Exit.** The test chooses the two people as a phone does in the mobile project, a held press on the
first card and a tap on the second, and still hovers and checks on the desktop, and it passes in
both projects.

A child of KN-027, from its roast. Found running the e2e suite for KN-490, 2026-09-15.

## Measured before planning, 2026-09-16

- **The failing test** is `network.spec.ts` line 55, "two people are selected and deleted through the
  bar at the foot". Lines 63 to 67 hover each card and check its checkbox.
- **Why it times out, and it is not slowness.** `ContactCard.tsx` line 253 reads
  `const folded = !selected && (!phone || !selecting)`, and line 359 gives a folded checkbox
  `opacity: 0` with `pointerEvents: 'none'`. On a phone nothing has started a selection, so the
  checkbox is not actionable at all and `check()` waits out its 30 seconds. A hover cannot help:
  line 323 wires the hold's events only when `phone`, and the card has no hover state there.
- **What starts a selection.** `shared/hold/hold.ts`: `HOLD_MS` is 500 and `SLOP` is 10.
  `onPointerDown` accepts only a primary press with `button === 0` whose target passes `canStart`,
  which is `target.closest('.KarnamaContactCard-name')`. A move beyond 10 pixels cancels it, as do
  pointerup, pointercancel and pointerleave. On firing it calls `onSelectedChange(true)`.
- **The hold's target has a locator already.** The name renders through `Name` with that class, and
  the edit test above finds it as `getByRole('button', { name: MINA })`.
- **The mobile project really is a phone.** `NetworkScreen.tsx` line 218 passes `phone={!wide}` and
  line 74 sets `wide` from `theme.breakpoints.up('md')`; the config forces
  `viewport: { width: 390, height: 844 }` over the Pixel 7's own 412, and `devices['Pixel 7']` is
  `hasTouch: true, isMobile: true`. Playwright is 1.62.1.
- **Both ways of pressing have precedent in this suite.** `board.spec.ts` line 34 opens a CDP session
  with `page.context().newCDPSession(page)`; `drag-cards.spec.ts` drives `page.mouse`, but it skips
  the mobile project. Nine specs already branch on `testInfo.project.name`, so the split has a shape.

## The one real decision, for the review

**How to hold a press for 500 ms on a touch device.** Playwright has no long-press gesture, and
`page.touchscreen.tap()` is a down and an up with nothing between. Two candidates:

- **The mouse.** `page.mouse.move`, `down`, a wait past `HOLD_MS`, `up`. The card accepts it, because
  its handler never reads `pointerType` — only `isPrimary`, `button` and the target.
- **A real touch through CDP.** `Input.dispatchTouchEvent` with `touchStart`, a wait, `touchEnd`, on
  the session `board.spec.ts` already shows how to open.

**Settled by the review: the touch, and the lean was right for the right reason.** Playwright 1.62
has no first-class long press. `Touchscreen` emulates a complete tap, a `touchstart` followed by a
`touchend`, and `androidDevice.longTap()` belongs to a connected Android device rather than to Pixel
7 emulation. So CDP `Input.dispatchTouchEvent` is the only way to hold one; it produces the touch
pointer path the product is built for, and it keeps the test honest if the card ever gates its hold
on `pointerType`. CDP is Chromium-only, which costs nothing here: both configured projects are
Chromium.

**The review also corrected the hold itself, and this is the part I had wrong.** Do NOT sleep past
`HOLD_MS`. Send `touchStart`, wait for the bulk-action bar to become visible — which IS the hold
having fired — and only then send `touchEnd`. A fixed sleep flakes under load and proves nothing
about the hold, while waiting on the bar proves the selection happened before the touch ended.

## The approach

1. **The test branches on `testInfo.project.name`**, as nine specs in this suite already do.
2. **The desktop keeps exactly what it has**, the hover and the check, unchanged.
3. **The phone holds the first person's name through CDP**: `touchStart` at the centre of the name
   button, a wait for the bulk-action bar, then `touchEnd`. Both events go to the one point, so
   `SLOP` is never approached and there is no interpolation to drift.
4. **The phone then taps the second person's checkbox with `tap()`, not `check()`.** This is round
   two's correction and a real one: `check()` goes through Playwright's mouse click path even where
   the context has touch, so it would have passed while proving the desktop's gesture at a phone's
   viewport. `tap()` waits for actionability and sends the touch, which needs the `hasTouch` the
   mobile project sets. The desktop keeps hover and `check()`. The checkbox is unfolded by then
   because anyone being chosen unfolds every card's — KN-533's own proof does the same, "holds one
   person, chooses a second by their checkbox".
5. **Both people are asserted chosen, rather than inferred.** The first person's checkbox is checked
   after the hold and the second's after the tap. The review asked for this and it is right: the
   empty state at the end would follow from deleting one person as readily as two, so without these
   the test's own subject, that TWO were selected, is the one thing it never checks.
6. **Both projects then delete through the bar** as the test does now, and the empty state returns.

## What I will change

- `apps/web/e2e/network.spec.ts`: the selection loop in one test, the `hold` helper copied from
  `board.spec.ts`, and `Page` and `Locator` added to its Playwright import
- this plan, which stays beside it

**The helper is copied rather than moved, and that is a decision.** `board.spec.ts` already holds
`hold(page, target, until)`, and its own comment reaches the review's finding independently:
"Playwright's touchscreen only taps and its mouse is not a touch". Moving it into `./session`, which
both specs already import, would touch a passing spec to serve a second caller, and the review called
the local copy the simplest working change. **A third caller is when it moves**, and that sentence
goes in the copy's comment so the next person meets it rather than having to think of it.

## What I expect to be hard, and what I am unsure of

- **The press must not drift past 10 pixels**, so the hold is dispatched at one point and released at
  the same point, with no interpolation between.
- **The release's click.** `heldClick` swallows the click a hold's release sends, and if the harness
  sends none the mark waits for the next press to clear it. The next action is on another card's
  checkbox, so this should not reach anything, but it is the kind of thing that surprises.
- **The unfold is a 250 ms transition**, `PRESS_MS`, from `opacity: 0` and `pointerEvents: 'none'`.
  Playwright's actionability waits for stability, so the tap should settle; if it flakes, waiting on
  the bar before tapping is the honest fix rather than a sleep.
- **Whether `check()` is the right verb on a phone.** It taps, which is what the exit asks for.

## How I will know it works

- **The mobile test fails against the spec as it is** — it already does, which is the card itself —
  and passes after. The control for the new path is that shortening the hold below `HOLD_MS` makes
  it fail again: if it passes with a short press, it is not the hold that selected anyone.
- **That control mutates the wait inside `hold`, not the call site.** The first attempt replaced the
  `hold(...)` call with a plain tap, which left `hold` declared and unused, so the webServer's own
  `tsc --noEmit` exited 2, the server never started, and NO TEST RAN — and the script reported
  "control does not hold", which is a different thing from "the control could not run". Conflating
  those is the absence-in-a-pass's-clothes error running backwards. Removing the wait between
  `touchStart` and `touchEnd` instead keeps the spec compiling and takes away exactly the thing
  under test, the hold's duration, and the script now reports the two outcomes separately.
- Both projects pass: `CI=1 npx playwright test e2e/network.spec.ts`, since the config reuses a
  running server otherwise. **Read the summary line, never an exit code**, and refuse a run that
  skipped or ran none — that is what KN-626's control got wrong twice in one iteration.
- The suite returns to 93 passed, 0 failed, 9 skipped, from 92, 1 and 9.
- **A green run does not tell the two gestures apart, and this card proved that on itself.** The
  spec passed 6 of 6 across both projects while the phone's second selection still used `check()`,
  which is the mouse path: the run was green and the test was proving the wrong thing. The review
  caught it, the run could not. So the numbers below are the weaker half of this card's evidence and
  the gesture each branch actually sends is the stronger half.
- No changed file's drift grows, and this plan's is 0.
