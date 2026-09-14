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

1. **Count in the first frame that has the buttons.** The frame callback `beforeEach`
   schedules looks for the story's buttons; while there are none it schedules
   itself for the next frame, and in the first frame that has them it records how
   many carry `data-state`. A frame callback runs before the paint of its frame, so
   that first frame with buttons is the first one a reader sees them in. The
   cleanup cancels whichever callback is pending.
2. **The play waits for the count and asserts 45**, as now; its comment says the
   count is taken in the first frame that has the buttons, not the first frame
   after `beforeEach`.
3. **The docs**, English and Persian, for `States`: if the entry says what the story
   counts, it says in the first frame the buttons are drawn in; otherwise nothing
   changes there.
4. **`Button.tsx` does not change.**

## How I will know it works

- Red before: the measurement above, and KN-226's probe.
- A plant that brings KN-454's flash back, the ref callback moved into a
  `useEffect`, fails `States` on the count in a production build and in the Vitest
  runner, since the first frame with buttons then paints them at rest. This is the
  proof that the count still sees a flash; restored by hash.
- The Button's stories under Vitest, the unit project, eslint, tsc, the docs guard.
- A production Storybook of the change: `shared-button--states` opened headless,
  bare and inside the manager, with no failure event and no console error.
- The matrix looked at in both languages and both schemes.

## What I am unsure of

- **Whether a frame callback can run between the buttons' insertion and the ref
  callbacks that mark them.** Both happen in one React commit, one task, and a frame
  callback runs in the rendering step between tasks, so none can. The plant above is
  what would show a count taken too early to see a flash.
- **The first frame with buttons may not be the frame the buttons were inserted
  for**, if a commit lands after a frame's callbacks and before its paint. Then the
  frame painted with the buttons is counted in its successor's callback. The
  attribute lands in that same commit, so the successor still counts 45, and a
  flash, a later attribute, would still count 0 there.
- **A story that never draws its buttons** would schedule frames until the cleanup
  cancels them; the play's wait for the count times out and fails, which is the
  right outcome.
