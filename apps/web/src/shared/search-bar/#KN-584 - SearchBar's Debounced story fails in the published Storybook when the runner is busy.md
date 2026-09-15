# KN-584 - SearchBar's Debounced story fails in the published Storybook when the runner is busy: a render from its own typing wipes the search call

## The card

Found by KN-226's check on 2026-09-15, not by a roast. A production Storybook of
76beef5 was built under `/KarNama/storybook/` and every story opened in headless
Chromium at Playwright's default workers, 16 on this machine. 377 stories passed.
`Debounced` failed with `expected "onSearch" to be called 1 times, but got 0
times`. Alone, at one worker, it passed 10 of 10. The stories of the five files
that write their args back while they play were each run six times at the default
workers: `Debounced` failed 6 of 6 and the other 360 passed.

**Why it matters.** KN-226's check stops the Pages deploy, the app's with it, when
any story fails, so with this story as it is a busy runner stops deploys at random.
A reviewer opening the published story on a slow device is told a search that ran
never ran.

**Exit.** In a production Storybook built under `/KarNama/storybook/` and opened
in headless Chromium, the stories of the five files that write their args back,
each run ten times at Playwright's default workers as KN-226's measurement ran
them, pass every time, `Debounced` 10 of 10; SearchBar's stories pass in the Vitest
runner; and the story says why it keeps its mocks.

## What is there, read on 2026-09-15

- **The stories.** `SearchBar.stories.tsx`'s meta renders the bar the way a page
  holds it, `Held`, and writes every keystroke back with `useArgs`'s `updateArgs`,
  KN-019 and KN-280. Its args carry `onChange: fn()` and `onSearch: fn()`, one pair
  of spies for every story in the file.
- `Debounced` types the word, checks no search has run, waits `DEBOUNCE_MS + 150`,
  450 ms, and checks one search with the whole word. `Clearing` uses the same
  render: its click calls `onSearch('')`, writes `''` back, and the play then reads
  `onSearch`'s last call. `ResetWhilePending` and `IgnoredKeystrokes` render fixed
  parents with no `useArgs`, so their plays write no args.
- **The runtime**, Storybook 10.5.10, `node_modules/storybook/dist/preview/runtime.js`.
  `onUpdateArgs` updates the store and calls the story render's `rerender()`, which
  runs at once while the phase is `playing` ("Rerendering while playing will not be
  enqueued"). `render()` runs the loaders again. The first of `storybook/test`'s,
  `resetAllMocksLoader`, calls `restoreAllMocks()` unless `parameters.test.restoreMocks`
  is false, and its `mockRestore` on every `fn()` clears the calls. That render also
  ends with its own `storyFinished`, which can come before the play has ended.
- **The runner.** A portable story, which the Vitest runner plays, gets a context of
  its own and applies no args update, so none of this happens there.
- **The rule**, `AGENTS.md` section 7, from KN-563: a story whose play changes its
  args keeps its mocks across its renders with `parameters.test.restoreMocks` false,
  on the story alone, and clears them when its play starts. `SettingsDialog`'s
  `Preferences` does.
- **The other files.** ColorPicker's `KeyboardOnly` and `Picking`, and Tabs'
  `KeyboardOnly`, read the spy's last call right after the key or click that wrote
  the args. ColorPicker's arrow stories press their keys only in the runner. Input's
  `Typing` is not bound, since `AT_LOAD` sets no value, so its typing writes no args.
- **The docs**, `story-docs/{en,fa}/Shared-SearchBar.md`, say what `Debounced` shows,
  not how its play checks it.

## Measured before planning

A probe, `kn584-probe.mjs` in the scratchpad, against the same build of 76beef5
served under the base: every story of the five files opened bare at `iframe.html`,
each run in a context of its own, recording on the page's clock every render phase
Storybook announces, every call a named spy reports on the actions channel, every
failure event and every console and page error. A run ends, when a play began, at
the `storyFinished` after the phase `played` or `errored`.

**At 16 pages at once, ten runs of each of the 59 stories**, 173 seconds:

- **Failed**: `Debounced`, 10 of 10, `expected "onSearch" to be called 1 times, but
got 0 times`. Nothing else failed.
- **Rendered again during the play**, in 10 runs of 10 each: ColorPicker's
  `KeyboardOnly` and `Picking`; Input's `ControlsMatchTheCanvasInEnglish` and
  `TypingIntoABoundValue`; SearchBar's `Clearing` and `Debounced`; SettingsDialog's
  `Preferences`; Tabs' `KeyboardOnly`.
- **A render began after the play's last spy call**, 10 of 10 each: `Debounced`,
  and Input's `TypingIntoABoundValue`, whose play reads the field and the recorded
  args, never a spy.
- **`storyFinished` before the play ended**: the same two, 10 of 10.

**How `Debounced` loses the call**, run 1, in milliseconds from `playing`. A
render writes its own phase over the play's, and `rerender` runs a render at once
unless another is `loading`, in `beforeEach`, `rendering` or in `afterEach`
(`isPending`), in which case one render is queued until a render reaches its end.
The nine keystrokes' renders began at 30, 69, 81, 92, 106 and 118, so at least one
was queued. Each render's end waits for the page's animations, 100 ms and then
every running one, up to five seconds (`waitForAnimations`). The search's spy call
comes at 439, 320 after the last key at 119. The first render to end does so at
474, the queued render starts at 475, and its loaders wipe the call. The play reads
`onSearch` at 604 and fails.

`Clearing` and Tabs' `KeyboardOnly` render again during their plays too, and their
plays read the spy and end within 44 and 75 ms of `playing`; neither failed.

**Slowed four times, 8 pages at once, ten runs of each of the eight stories that
render again during their plays**, 92 seconds:

- **Failed**: `Debounced`, 10 of 10, the same assertion, a render beginning after
  its last spy call in all ten. And Input's `TypingIntoABoundValue`, 10 of 10, for
  another reason: `expected '70' to be '701234567890123456789'`, the bound field
  keeping one of the twenty keys typed with no delay, with no render after its last
  spy call. That is not this card's failure and goes to a card of its own.
- **Passed every run**: ColorPicker's `KeyboardOnly` and `Picking`, Input's
  `ControlsMatchTheCanvasInEnglish`, SearchBar's `Clearing`, SettingsDialog's
  `Preferences` and Tabs' `KeyboardOnly`.

## The approach

1. **`Debounced` keeps its mocks across its renders**, as `AGENTS.md` section 7
   says and `Preferences` does: `parameters: { test: { restoreMocks: false } }` on
   the story, and `clearAllMocks()` from `storybook/test` as its play starts. A
   comment says why: its typing writes the args, each write renders the story again,
   and a render that ends after the search, which runs 300 ms after the last key,
   restored the spy before the play read it, KN-584.
2. **The same for the other plays that write their args and then read a spy**, as
   the review asked, since the rule in `AGENTS.md` section 7 names every such story:
   SearchBar's `Clearing`, ColorPicker's `KeyboardOnly` and `Picking`, and Tabs'
   `KeyboardOnly`. They pass today, slowed four times too, and their plays read the
   spy within 75 ms of `playing`; the rule does not rest on how soon. `Preferences`
   has the switch already. Input's `TypingIntoABoundValue` writes its args and reads
   no spy, and `ControlsMatchTheCanvasInEnglish` writes them from its render, not
   its play; neither changes. The rule is in `AGENTS.md` already, so it gains no
   line, and the docs say what each story shows, which does not change.
3. **Considered and not taken**: a loader in `.storybook/preview.tsx` that restores
   the mocks once per mount of a story, keyed by its render's abort signal, with
   `restoreMocks` false for every story. It would cover every story at once. But it
   changes what every story starts from, in the runner and in the published
   Storybook, for one story measured failing, and it replaces KN-563's rule, on the
   story alone, which that card's roast reviewed. The review agreed.

**File by file**: `search-bar/SearchBar.stories.tsx`, the import, `Debounced` and
`Clearing`; `color-picker/ColorPicker.stories.tsx`, the import, `KeyboardOnly` and
`Picking`; `tabs/Tabs.stories.tsx`, the import and `KeyboardOnly`. Each story gets
the parameter, a comment and the clear: the comment in full on `Debounced`, which
failed, and on the others a line naming the rule and KN-584.

## How I will know it works

- **Before**, measured above: `Debounced` fails 10 of 10 at 16 pages at once, the
  build of 76beef5, which has neither the switch nor the clear.
- **The exit, after**: a production Storybook of the change built under
  `/KarNama/storybook/`, the base set from PowerShell. KN-226's saved check is put
  in the tree for the run only and taken out again. Its config is fully parallel
  with one test per story; it runs the five files' 59 stories with
  `--repeat-each 10` at Playwright's default workers, and the run's own line naming
  its workers is recorded. Every run passes, `Debounced` 10 of 10. The probe again,
  16 pages at once over the five files and `Debounced` slowed four times: every run
  passes.
- **The runner**: `vitest run --project storybook` on the three files, every story
  passes; the unit project, lint and tsc clean.
- **A look**: the story after its play in the built Storybook, Persian light and
  English dark, the word in the field.

## What I expect to be hard, and what I am unsure of

- **A call from before the play.** With the switch, the first render restores
  nothing either, so the file's shared spies still hold what an earlier story in the
  same page called, in the manager too. The clear as the play starts empties them,
  and the story calls nothing before its play types.
- **Renders that land after the play**: they still run `beforeEach` again, and
  `withOwnStorage` swaps in a new empty storage; the bar reads no storage.
- **A second play after a remount**, Rerun among them, starts from the word the
  first play wrote into the args (`AGENTS.md` section 7, KN-563's remount). Measured
  on the build of 76beef5, before any change, each story remounted through the
  preview's `forceRemount` after its first play, twice each, 8 pages at once:
  `Debounced`'s second play failed 2 of 2, its last `onSearch` not the word, and so
  did the second plays of ColorPicker's `KeyboardOnly` and `Picking`, Input's
  `TypingIntoABoundValue`, SearchBar's `Clearing`, `Preferences` and Tabs'
  `KeyboardOnly`; Input's `ControlsMatchTheCanvasInEnglish` passed. Every first play
  passed at 8 pages at once, `Debounced`'s included. KN-569 had this for
  `Preferences` alone and is widened to the seven. It is not this card's.
- **The load is this machine's**, not CI's: the exit is at the default workers, and
  slowing the CPU is added for `Debounced` alone.

## Plan review, Codex, 2026-09-15

`gpt-5.6-terra` at medium, since `gpt-5.6` was out of usage for another 23
minutes. The mechanism is right, and the changed plays still fail a bar that
searches twice or for part of the word, through `toHaveBeenCalledTimes(1)` and
`toHaveBeenLastCalledWith` the word. It matches `Preferences`, and Storybook merges
parameters at story scope. Two corrections, both taken:

1. **"Nothing else changes" broke KN-563's rule.** `Clearing`, ColorPicker's
   `KeyboardOnly` and `Picking`, and Tabs' `KeyboardOnly` write their args during
   their plays and read a spy after, so they take the same switch: `Clearing` at
   the least, the rest as the same rule. All four are taken, step 2.
2. **The exit's run must name its load.** `--repeat-each` repeats tests and does
   not by itself put pages side by side; the run uses the fully parallel config with
   one test per story and reports its workers.

The preview-wide loader is not to be used: it changes cleanup for every story, in
the published preview and in the runner, and an abort signal is no replacement for
a story's isolation.

## Result, 2026-09-15

Built as the amended plan says. SearchBar's `Debounced` and `Clearing`,
ColorPicker's `KeyboardOnly` and `Picking`, and Tabs' `KeyboardOnly` each set
`parameters.test.restoreMocks` to false, clear the mocks as their plays start, and
say why.

- **The exit.** A production Storybook of the change was built under
  `/KarNama/storybook/` from PowerShell, and its three story bundles carry the
  switch. KN-226's saved check was put in the tree for the run only and taken out
  after. It ran with `--repeat-each 10` over the five files: "Running 590 tests
  using 16 workers", 590 passed in 3.9 minutes, `Debounced` 10 of 10.
- **The probe, on the same build.** At 16 pages at once, ten runs of each of the 59
  stories, none failed. A render still began after `Debounced`'s last spy call in 8
  of its 10 runs, the condition that failed before; the call now stays. `Debounced`
  slowed four times with 8 pages at once passed 10 of 10, a render beginning after
  its last spy call in 9 of them.
- **The runner.** The three files' stories passed, 23 of 23, and the unit project
  1443 of 1443. eslint on the three files and tsc are clean. Each file's formatter
  drift is HEAD's: 2, 34 and 10.
- **Seen.** `Debounced` after its play in the built Storybook, in Persian light and
  English dark: right to left with the search icon at the right and the clear
  control at the left, then mirrored left to right; the word in the field and the
  focused edge in both; no console or page error.
- **Not shown.** CI's runner. The manager, where the same preview renders the story.
  And a second play after a remount, which failed before this change for seven
  stories, measured, and is KN-569's; it was not measured after.
