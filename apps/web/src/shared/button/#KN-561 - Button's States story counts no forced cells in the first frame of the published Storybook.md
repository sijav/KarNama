# KN-561 - Button's States story counts no forced cells in the first frame of the published Storybook

## The card

**Why**, from the board: Either the published Button page flashes the wrong state
for a frame, which KN-454 exists to prevent, or its proof that it does not is empty
where the page is reviewed.

**Exit condition**, from the board: Which of the two it is is named at the close;
States reads the first frame in which its buttons exist and counts 45 there, in a
production Storybook opened in a browser and in the Vitest runner.

It blocks KN-226.

## What is there, read on 2026-09-15

- **`Forced`**, `Button.stories.tsx` line 32: a ref callback on each cell's box puts
  `data-state` on the button inside it during the commit, before the paint, the fix
  KN-454 made after an effect had painted every transient cell at rest for a frame.
- **`States`**, line 153: its `beforeEach` schedules one `requestAnimationFrame` and
  counts `button[data-state]` there into `forcedAtFirstFrame`; the play waits for the
  count and asserts 45.
- **Measured** by KN-226's probe on d3f9fce, bare and inside the manager: the play
  throws `expected +0 to be 45`.

## Measured, 2026-09-15

On a production Storybook of the tree after KN-560, where the Button's stories are
unchanged, opened headless with a frame counter advanced by a
`requestAnimationFrame` loop and a `MutationObserver` on the page, both from before
its scripts ran:

- at **frame 7, 355 ms**, one batch of mutations brought **75 buttons, 45 of them
  already carrying `data-state`**;
- the first frame callback after that, **frame 8, 358 ms**, and the three after it
  each saw 75 buttons and 45 carrying `data-state`; no frame saw a button at rest
  that should have carried a state;
- the play threw `expected +0 to be 45` at 366 ms.

**So it is the second of the card's two**: the forced states land in the commit that
draws the buttons, and no published frame paints them at rest, so KN-454's fix
holds there. The story's frame callback, scheduled in `beforeEach`, ran in a frame
before frame 7, when a production canvas, which mounts the story without React's
`act`, had drawn no button yet, and counted nothing. In the Vitest runner the story
renders under `act`, so its buttons are there by the first frame, and the count
meant something only there.

## The approach

1. **Read what the first paint will show, from the matrix itself.** The render wraps
   the matrix in `Audited`, which holds a ref to the matrix's root and, in a
   `useLayoutEffect`, records how many buttons that root holds and how many of them
   carry `data-state`. A layout effect runs after the commit has changed the DOM and
   attached its refs, the cells' ref callbacks included, since a parent's layout
   work comes after its children's, and before the browser paints. So the record is
   what the reader's first frame of the matrix shows. `beforeEach` sets the record
   back to nothing, and only the first record is kept.
2. **The play waits for the record and asserts 75 buttons and 45 forced**, counted
   inside the matrix's root rather than the whole document, which on a Docs page
   holds other stories' buttons.
3. **The docs do not change**: the `States` entries, English and Persian, describe the
   matrix and the attribute, not how the story counts.
4. **`Button.tsx` does not change.**

## How I will know it works

- Red before: the measurement above, and KN-226's probe.
- A plant that brings KN-454's flash back, the attribute set from a `useEffect`
  instead of the ref callback, fails `States` on the record in a production build
  and in the Vitest runner: a passive effect runs after the layout effect, so the
  record holds no forced cell. This is the proof that the record still sees a
  flash; restored by hash.
- The Button's stories under Vitest, the unit project, eslint, tsc, the docs guard.
- A production Storybook of the change: `shared-button--states` opened headless,
  bare and inside the manager, with no failure event and no console error.
- The matrix looked at in both languages and both schemes.

## What I am unsure of

- **The order inside the commit.** The record relies on React attaching the cells'
  refs before it runs their ancestor's layout effect. React's commit does its
  layout work children first; the plant above and the 45 on the fixed build are
  what show it here.
- **A layout effect is not a frame.** It reads the DOM the first paint will show
  rather than watching the paint, which is what the exit's "the first frame in which
  its buttons exist" asks about; the close says so plainly.
- **A story that never draws its buttons** records none, and the play's assertion
  fails, which is the right outcome.

## Plan review, Codex, 2026-09-15

Written to `%TEMP%/claude-roast/2b1874631dd1/20260914T230340-plan-kn-561-button-s-states-story-counts-no-forced-ce-231a33.md`.
Judged against the code:

- **A frame callback that reschedules itself can pass over a flash. Real, and my own
  unsure point had it backwards.** A frame callback runs before its frame's paint;
  a commit that lands after it paints its buttons in that frame, and an attribute
  set from a passive effect arrives after that paint, so the next callback counts
  45 over a frame that showed the cells at rest. The plant I had named would then
  not fail. Taken: the frame callback is gone.
- **No frame callback can run inside the commit that inserts and marks the
  buttons.** Agreed; the gap is after a callback and before its paint.
- **A layout effect on the matrix's root records what the first paint shows. Taken**
  as the approach: it runs after the commit's DOM changes and refs and before the
  paint, and it sees no forced cell if the attribute moves to an effect, in the
  production canvas and under `act` alike.
- **The count read the whole document. Real. Taken**: counted in the matrix's root.
- **The build, the two openings, the plant, lint, tsc, the docs guard and the look
  are verification, not invented gates.** Agreed.

## Result, 2026-09-15

- **`Button.stories.tsx`**: `Audited` holds a ref to the matrix's root and, in a
  `useLayoutEffect`, hands `onFirstPaint` how many buttons the root holds and how
  many of them carry `data-state`. `States` renders its rows inside it and keeps
  only the first record, and its `beforeEach` sets the record back to nothing,
  where the frame callback and its cleanup were. The play waits for the record and
  asserts 75 buttons and 45 forced. `Forced` is unchanged.
- **The docs do not change**, as the plan found.
- `Button.tsx` is unchanged.

**Which of the two it is: the second.** The forced states land in the commit that
draws the buttons, so the published page does not flash and KN-454's fix holds;
what was empty was the story's proof, whose one frame callback ran before a
production canvas, mounting the story without `act`, had drawn any button.

**On a production Storybook of the change**, `States` ended with no failure event
and no console error, bare and inside the manager. **KN-454's flash planted back**,
the attribute set from a `useEffect` instead of the ref callback, failed `States` on
the record, `{ buttons: 75, forced: 0 }` against 45, under Vitest and on its own
production build; the story was restored byte for byte after.

**Passing**: the Button stories under Vitest, 5 of 5; the web unit project, 1383,
run before any browser run; eslint and tsc clean. `Button.stories.tsx` was not
formatted at HEAD, 64 lines of drift; the two new lines prettier would break were
broken by hand and it keeps 64. **Looked at** in the dev Storybook: the matrix in
Persian and in English, 75 buttons with 45 forced, right to left and left to
right; the story pins the light scheme, so it has no dark view.
