# KN-522 · Two stories replace console.error with a mock, which takes KN-401's guard off for as long as they run

**Why, from the board.** KN-401's promise is that every console.error or
console.warn in a test fails it unless the product marked it; a story that
silences the console to keep the published Storybook quiet silences the guard with
it, and a real warning in exactly those stories would pass.

**Exit condition, from the board.** No story or test replaces console.error or
console.warn with an implementation that bypasses the guard; the Tooltip and
IconButton stories still assert their marked diagnostics and keep the published
Storybook's console clean, or say why both cannot hold; an unmarked plain-string
error said inside one of those stories fails it, shown once by a planted control.

## What is there, read and measured 2026-09-14

- **The guard.** `.storybook/react-warnings.setup.ts` is a setup file of both the
  unit and the storybook projects. Its `beforeEach` wraps `console.error` and
  `console.warn` with `installConsoleGuard`, which records every unmarked call and
  still says it, and its `afterEach` fails the test on anything unaccounted. A
  story or test runs after that wrapping, so
  `spyOn(console, 'error').mockImplementation(...)` replaces the wrapper itself.
- **Three places replace it.** Tooltip's `captureConsoleErrors`, the `beforeEach`
  of five stories, swallows every call. IconButton's `InATooltip` replaces it
  inside play and keeps what it hears. And, beyond the card's two, the guard's own
  unit test, "says what the product says through the real console, marked",
  swallows every call too. The plain spies in `BlankName` and `ALinkInATooltip`
  call through and are untouched; the `console.info` spies in the auth stories and
  test are outside the guard, which watches `error` and `warn`.
- **Measured**, with `console.error('an unmarked error, planted for KN-522')`
  planted in each, every file restored and checked by hash: in
  `ReportsATriggerThatCannotAttach` the story **passed**; in the guard's unit test
  the test **passed**; in `InATooltip` the story **failed**, at its own
  `expect(said).toEqual([])`, line 243, since its mock keeps what it hears. There
  the error is hidden from the output and from the guard, but not from the story.
- **Why the Tooltip stories swallow.** The product's own reports, "Tooltip: its
  child did not take a ref" and the rest, said through `report` with its mark, are
  what those stories expect, and printing them would fill the published
  Storybook's console with messages nobody needs to act on.

## The approach

1. **`passOnUnmarked(through)` in `console-guard.ts`**: a stand-in for
   `console.error` that holds back what the product marks and hands everything
   else to `through`, the console as it was before the stand-in. In a test that is
   the guard, so an unmarked error is still recorded and still said; in the
   published Storybook it is the real console, so the product's expected reports
   stay off it. `through` has to be read before `spyOn` replaces the console, or
   the stand-in calls itself; the helper's comment says so, and a unit test drives
   it.
2. **Tooltip's `captureConsoleErrors`** reads `console.error.bind(console)` first,
   then `spyOn(console, 'error').mockImplementation(passOnUnmarked(through))`. The
   five stories' assertions on `console.error` are unchanged, since the spy still
   records every call.
3. **IconButton's `InATooltip`** spies without replacing: a spy that calls through,
   and `expect(watching).not.toHaveBeenCalled()` in place of `said`. The guard
   hears everything again, and the story still fails on any error, marked or not,
   as its KN-310 comment asks. In the published Storybook nothing is expected
   there, so nothing prints.
4. **The guard's unit test** uses `passOnUnmarked` in place of the silent mock, so
   the marked report it checks stays quiet and anything unmarked reaches the guard.
5. **The guard's comment** on `watching` names `passOnUnmarked` beside
   `allowConsole`: one for a message a test provokes from the runner, the other
   for the product's own reports that a story expects.

## The tests

- **The plants above are the positive control.** After the change the Tooltip
  story and the unit test must fail on the planted unmarked error, through the
  guard's "something warned during this test", and `InATooltip` on its spy.
- **The stories keep their own assertions**: the five Tooltip stories and the
  IconButton stories pass, and the run prints none of the product's reports the
  stories expect.
- **A unit test for `passOnUnmarked`**: an unmarked call reaches `through`, a
  marked one does not.

## Files

- `apps/web/src/shared/console-guard.ts` and `console-guard.test.ts`.
- `apps/web/src/shared/tooltip/Tooltip.stories.tsx`.
- `apps/web/src/shared/icon-button/IconButton.stories.tsx`.

## What I am unsure of

- **A helper for tests in the product's module.** `console-guard.ts` ships
  `report`, and stories already import `allowConsole` from it. `passOnUnmarked` is
  test machinery beside them, small, with its own unit test; kept in a story file
  instead, the guard's own test could not use it without importing a story.
- **`console.warn`**: none of the three replaces it, so nothing changes there.
- **The published Storybook's console**, which is not built here. The argument is
  that `through` is the real console there and the stand-in holds back only
  marked reports; the runner's own output, which would carry them if they were
  printed, is the evidence that can be read.

## Plan review, Codex, 2026-09-14

Codex found the mechanism sound. `storybook/test` re-exports Vitest's `spyOn`;
`through`, bound before the spy replaces `console.error`, is the guard's wrapper,
since the setup wraps the console before Storybook runs a story's `beforeEach`;
the spy's `mockRestore` puts the wrapper back in the story's cleanup, before the
setup's `afterEach` reads the guard; and a spy without an implementation calls
through, so `InATooltip` prints nothing in a healthy published Storybook.
`passOnUnmarked` is warranted beside `isOurs` and `report`, documented as support
for tests and tested directly. Taken from it:

- **The published Storybook's console is looked at, not argued.** The Vitest
  addon runs transformed portable stories, not the deployed build, so the
  unsureness above is answered by a production Storybook built into the
  session's scratchpad, served locally, and the five Tooltip stories and
  `InATooltip` opened in headless Chromium, their console read.
- **The plants must show the guard itself failing**, its "something warned during
  this test", not only a story's own spy.

## Result, 2026-09-14

- **`console-guard.ts`**: `passOnUnmarked(through)`, which holds back what the
  product marks and hands everything else to `through`; the comment on `watching`
  names it beside `allowConsole`.
- **`console-guard.test.ts`**: the test of `report` uses `passOnUnmarked` in place
  of a silent mock, and a new test drives the stand-in, a marked call held back
  and an unmarked one passed on.
- **`Tooltip.stories.tsx`**: `captureConsoleErrors` reads the console first and
  spies with `passOnUnmarked(through)`. `ReportsATriggerThatDropsItsProps` also
  declares, with `allowConsole`, MUI's development warning about a child that
  drops its props, since that child is what the story is about.
- **`IconButton.stories.tsx`**: `InATooltip` spies without replacing and asserts
  no call.

**Found by the checks, not planned.** With the guard hearing it again,
`ReportsATriggerThatDropsItsProps` failed when run alone, on MUI's unmarked
warning about the child it renders on purpose, while two whole runs of the Tooltip
stories printed that same warning and passed all fifteen. So the story declares
the warning. The gap, a warning said where no guard hears it in a whole-file run,
is filed as its own card.

Red first, measured before the build, each file restored by hash: an unmarked
`console.error` planted in `ReportsATriggerThatCannotAttach` passed, and so did
one in the guard's unit test; in `InATooltip` it failed at the story's own check.

Positive control, after the build and before the `allowConsole` line, which does
not touch the stories planted: each restored by hash, the Tooltip story and the
unit test fail through the guard's "something warned during this test", and
`InATooltip` through both its spy, line 243, and the guard. The planted error now
prints.

**The published Storybook, looked at**: a production build in the session's
scratchpad, served locally, with the five Tooltip stories and `InATooltip` opened
in headless Chromium. Each finished with success and said nothing in the console
but lingui's warnings about uncompiled catalogs, KN-221. `BlankName`, which spies
and calls through, was the control, and its product report was heard, so the
listening works; its own assertion failed there, in a story this change did not
touch, filed as its own card. The build was made before the `allowConsole` line,
which does nothing outside the runner, where no guard is watching.

Passing at the commit: each of the six stories alone; the two story files whole,
26 of 26, twice; the web unit project, 1383, run before any browser run; the docs
guard, 75; eslint and tsc clean; the four files formatted as at HEAD, the
IconButton stories keeping the four lines of drift they had there.
