# KN-428 · A phone cannot start a selection, so the bulk bar can never be raised there

**Why, from the board.** Deleting several at once is the reason the bulk bar
exists, and a phone is where a reader clears out the rejected column. A bar that
cannot be raised is a feature that only exists on one screen size, silently.

**Exit condition, from the board.** A phone can select a job opportunity from the
board, the bulk bar comes up, and a story at a phone's width selects two and
deletes them.

## What the file says, read with use_figma on 2026-09-14

- **Card / Mobile, `491:751`**, its description: «انتخاب گروهی با نگه‌داشتن روی
  کارت فعال می‌شود». Bulk selection starts by holding a card.
- **Checkbox, `204:11`**, its description: on a desktop it appears on hover; «در
  موبایل با لانگ‌پرس روی یک کارت حالت انتخاب فعال و روی همه‌ی کارت‌ها ظاهر
  می‌شود». On a phone a long press on one card turns selection on, and the
  checkbox then appears on every card.
- **The prototype map, `384:17`**: «نگه‌داشتن (موبایل): کارت → حالت انتخاب گروهی».
  And `416:20`: a component's reaction can only change its own variant, so bulk
  selection was wired as a press on each card instance, not from the checkbox.
- **The Screens canvas.** Every Card / Mobile on the phone board `241:146` has
  ON_CLICK to the job modal `243:1078` and ON_PRESS to Mobile Selection
  `243:325`, Smart Animate, ease in and out, 250 ms.
- **Mobile Selection, `243:325`**, draws its three cards in State=Default under
  a bar that says «۲ آگهی انتخاب شده»: it shows the bar, not the cards. Its cards
  keep ON_CLICK to the job modal, so a tap still opens a job opportunity while
  selecting.
- **State=Selected, `491:749`**, puts the Select checkbox, 20 by 20, at the Title
  Group's inline start, 8 from the title, its ON_CLICK toggling it.
- **Desktop Selection, `243:433`**, draws the selected cards Selected and the
  rest at rest: the desktop keeps its hover rule, and nothing here changes it.
- The **Card menu** holds change status, open the link and delete, and no select.

## What the code does today

`JobCard.tsx` folds the checkbox only when `layout === 'desktop' && !selected`,
so since Codex's 2234d66 every phone card shows its checkbox at rest, which
`491:751` Default does not draw. Before that commit it was drawn only once
selected, so nothing could start a selection, which is this card's premise.
`JobsScreen` shows the Bulk Action Bar while `held.length > 0` and tells the
shell through `onSelecting`. `e2e/board.spec.ts` lines 68 to 72 check each
card's checkbox in both Playwright projects, so the mobile project rests on the
checkbox shown at rest. The docs say the phone's checkbox "shows while the card
is selected", which is neither the code nor the file.

A probe in Chromium with the Pixel 7 profile and a real touch sent through the
DevTools protocol: a 60 ms tap and a 900 ms hold send the same events,
pointerdown, pointerup, the compatibility mouse events and a click with `detail`
1, no `contextmenu`, and no text selected. So in Chromium's emulation a click
follows even a long hold, and a phone may behave otherwise.

## The approach

1. **`selecting`, a new JobCard prop**, false by default: the board is choosing
   several. On the phone card the checkbox is in view while the card is selected
   or the board is selecting. Otherwise it folds to no room and fades, exactly
   as the desktop's does at rest, and stays in the keyboard's path, unfolding
   while the focus inside the card is the keyboard's, `:has(:focus-visible)`.
   Not `:focus-within`, which the focus MUI gives back to the title when a
   tapped job modal closes would also match, leaving one resting card with its
   checkbox out. The desktop card ignores `selecting`, as `243:433` draws.
2. **A held press selects the phone card.** A primary press, button 0, that
   starts on the card's own button, the title and the `::after` stretched over
   the card, which is where a tap opens the job opportunity, and stays within
   10 pixels for 500 ms calls `onSelectedChange(true)`, unless the card is
   already selected. Not on the three dots, the link or the checkbox. Lifting,
   `pointercancel` (which a scroll taking the touch sends), leaving the card (a
   mouse has no implicit capture) or moving further than 10 ends the press. A
   `contextmenu` while the press is held, or just after it selected, is
   prevented, and one during the press selects at once: a phone's browser may
   send it for its own long press. A `contextmenu` with no hold in progress, a
   right click on a narrow desktop window, is left alone. The pending timer is
   cleared when the card unmounts. This is a fallback, not the mechanism, and it
   cannot promise every native long press affordance is gone.
3. **The click after a hold opens nothing, and the mark that says so is
   bounded.** A hold sets the mark. The first click takes it: a click from a
   pointer, `event.detail` above zero, opens nothing, and a click from a
   keyboard's Enter or Space, `detail` 0, opens as usual. The next press on the
   card clears the mark before anything else, so a release that sends no click,
   as a phone may after a long press, cannot swallow the tap that follows.
4. **No text selection or callout from a hold**: the interactive phone card takes
   `user-select: none`, `-webkit-user-select: none` beside it, and
   `-webkit-touch-callout: none`.
5. **The phone's motion is the press reaction's**, 250 ms ease in and out, for
   the checkbox unfolding and the card's fill, where the desktop keeps its
   hover's 200. A reader who asks for less motion still gets each state at once.
6. **`hold.ts` beside the card** holds `HOLD_MS`, `SLOP` and the hook that runs
   the press, so a story reads the same numbers the card uses. Both numbers are
   chosen interaction values, not platform defaults: Android reads its long
   press timeout and touch slop from the device, and Safari offers the web
   neither.
7. **`JobsScreen` passes `selecting={held.length > 0}`** to every card.

## What changes, file by file

- `apps/web/src/shared/job-card/hold.ts`, new: `HOLD_MS`, `SLOP` and `useHold`,
  the press, the mark and their handlers.
- `apps/web/src/shared/job-card/JobCard.tsx`: `selecting`, the fold rule, the
  hold on the phone card, the title's click after a hold, the phone's
  `user-select` and motion; the always-visible phone checkbox goes.
- `apps/web/src/shared/job-card/JobCard.stories.tsx`: `Mobile` asserts the
  resting phone card draws no checkbox and its title starts at its inline start;
  `MobileSelecting`, new, the checkbox in view and unchecked on an unselected
  card, the title moved over by 28, and checking it calls `onSelectedChange`;
  `MobileHold`, new, a held press selects and the click its release sends opens
  nothing, a hold whose release sends no click leaves the next tap to open, the
  keyboard's Enter after a hold opens, and a `contextmenu` during a press selects
  at once and is prevented; `MobileNotAHold`, new, a tap opens and selects
  nothing, and a press that drifts past 10, one the browser cancels, one that
  leaves the card, one on the three dots and one with another button select
  nothing, while a right click's `contextmenu` is not prevented;
  `MobileSelected` also holds the selected card and sees no second call;
  `MobileTabOrder`, new, Tab reaches the folded phone checkbox and it unfolds.
  The negative checks wait on a timer of the hold's own 500 ms set after the
  card's, which runs after the card's would have, rather than on a sleep.
- `apps/web/src/screens/JobsScreen.tsx`: `selecting` on each card.
- `apps/web/src/screens/JobsScreen.stories.tsx`: `SelectingOnAPhone`, new, at
  390 by 844: no checkbox in view at rest; a hold on the first card raises the
  bar, opens no job modal and puts every card's checkbox in view; another
  status's chip, its card checked; the bar counts two; delete, confirm, and both
  are gone.
- `apps/web/e2e/board.spec.ts`: the mobile project holds the first card with a
  real touch, `Input.dispatchTouchEvent` through a DevTools session, until the
  bar shows, releases it, sees no dialog, and checks the second card's checkbox,
  in view once the board is selecting. Playwright's mouse would prove the
  handler under a mouse, and its touchscreen only taps. The desktop keeps hover
  and check.
- `apps/web/src/shared/story-docs/{en,fa}/Shared-JobCard.md`: the phone
  paragraph, the `selecting` prop and the new stories.
- `DESIGN.md`, "The job card": the phone's checkbox and the hold, with the
  sources above, and the readings that are mine, labelled as such: 500 ms, 10
  pixels, the `contextmenu`, the keyboard's path, and `243:325` drawing the bar
  rather than the cards.

## What I expect to be hard, and what I am unsure of

- **What a phone's browser does with a long press** on a button with text in
  it: whether Chrome on Android sends `contextmenu`, and whether a click still
  follows the release after a long hold, on Android and on iOS. Steps 2 and 3
  are written to be right either way.
- **The stories dispatch synthetic PointerEvents.** They prove the card's
  handlers, not a browser's gesture recognition, callouts or compatibility
  clicks; the e2e test's real touch in Chromium is what proves those, as far as
  Chromium's emulation goes.
- **A touch screen at md or wider** gets the desktop card, whose checkbox shows
  only on hover or focus, so it cannot start a selection by touch either. That is
  not the phone, and it is a card of its own.
- **KN-352** asks where focus goes when the phone's checkbox is unchecked; with
  the checkbox folding instead of unmounting it stays in the page, and KN-352's
  story is its own. **KN-356**'s story becomes writable once this lands.

## How I will know it worked

The JobCard and JobsScreen stories pass, `SelectingOnAPhone` among them, and the
web unit project with its docs and literal guards; lint and tsc are clean; the
board e2e test passes in both projects, the mobile one with a real touch. The
resting and selecting phone cards are looked at in Persian and English, light and
dark. **Not checked: Safari on an iPhone.** There is none here; the hold's CSS
and its mark are written for it, and only a device proves them.

## Plan review, Codex, 2026-09-14

Codex, with web search, found the design reading right, the folded checkbox
still reachable by Tab, `:has(:focus-visible)` sound, the `pointercancel`,
movement and unmount handling correct, and the equal-delay timer valid for the
negative checks, since the HTML timer algorithm runs earlier registrations of
the same delay first. It asked for two corrections, both taken above:

- **The mobile e2e test was a mouse test.** `page.mouse.down()` dispatches
  mouse input, and Playwright's touchscreen only taps, so it now holds through
  `Input.dispatchTouchEvent`.
- **Dropping one later pointer click could strand the mark** when a browser
  sends no click after a hold, since `detail` tells a keyboard from a pointer
  but does not tie a click to the held press. The mark is now cleared by the
  next press on the card, and `MobileHold` holds, sends no click, then taps and
  sees the card open.

And three smaller points, taken: 500 ms and 10 pixels are recorded as chosen
values rather than platform defaults; `-webkit-user-select: none` joins
`user-select: none`; the `contextmenu` handling is named a fallback.
