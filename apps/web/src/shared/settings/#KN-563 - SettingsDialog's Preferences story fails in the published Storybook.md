# KN-563 - SettingsDialog's Preferences story fails in the published Storybook: choosing the other language calls nothing

## The card

**Why**, from the board: The published Storybook shows the settings dialog's
language choice, the owner's KN-480, as broken when the app's is not, which sends a
reviewer after a defect that does not exist.

**Exit condition**, from the board: Preferences passes in a production Storybook
opened in a browser, bare and inside the manager, and in the Vitest runner, with the
cause of the second render named at the close.

It blocks KN-226.

## What is there, read on 2026-09-15

- **The story**, `SettingsDialog.stories.tsx`: the meta's render takes Storybook's
  `updateArgs` and draws `WithTrigger`, whose handlers call the args' `fn()` spy and
  then `updateArgs`: `onLocaleChange` writes `locale`, `onColorSchemeChange`
  `colorScheme`, `onLoadSamples` `loaded`. `Preferences` opens the dialog, chooses
  the other language, the dark scheme and the sample data, and asserts each spy was
  called with the right value.
- **The preview**, `.storybook/preview.tsx`: every story's `beforeEach` is
  `withFontsLoaded` and `withOwnStorage`, and the second stands a memory
  `localStorage` in with `spyOn` from `storybook/test`, KN-178.
- **The app** changes the language through the same Select, and
  `e2e/settings.spec.ts` passed against its production build on 2026-09-15.

## Measured, 2026-09-15

On a production Storybook, opened headless bare, every channel event that updates
args or renders the story timed from the page's start, with the clicks the play
makes:

- 327 ms the play clicks the settings button, 383 ms the language field, and **411 ms
  the option «فارسی»**;
- at **411 ms** the story's handler emits `updateStoryArgs {"locale":"fa-IR"}`, so the
  dialog did call `onLocaleChange('fa-IR')`, and in the same millisecond the story's
  render phase goes to **`loading`**, then `rendering` at 416 and `completing` at 423;
- at **428 ms** the play throws `expected "onLocaleChange" to be called with arguments:
[ 'fa-IR' ]`, no calls; two `storyRendered` and two `storyFinished` follow, one for
  each render.

## The cause, read in Storybook 10.5.10's preview runtime, and planted

In `node_modules/storybook/dist/preview/runtime.js`:

- **The second render.** The handler's `updateArgs` sends `updateStoryArgs`. The
  preview's `onUpdateArgs`, from line 35825, updates the story's args and calls
  `rerender()` on its render, or `remount()` for a story whose play destructures
  `mount`, which Preferences does not. `rerender`, lines 35628 to 35633, renders at
  once when the render is playing, "to support rendering args changes while playing".
- **What that render does**, `render`, lines 35500 to 35600: the `loading` phase
  applies the loaders, `beforeEach` runs again, the story is rendered into the same
  tree, so the dialog's open state holds, and `completing`, `storyRendered`,
  `afterEach` and `storyFinished` follow. The play is not run again, since it runs
  only on a render that remounts; the first play carries on.
- **What wipes the call.** Among the loaders is `resetAllMocksLoader`, lines 34216
  to 34217 and 34281, which, unless the story's `parameters.test` says otherwise,
  calls `restoreAllMocks()`: `mockRestore` on every mock `storybook/test` made, which
  clears the calls each recorded. The call the handler made in the same millisecond
  is gone when the play asserts it. The Vitest runner applies no args update, so the
  story never renders again there, and the call stays.
- **The same render restores the preview's storage spy** and, running `beforeEach`
  again, stands in a new, empty memory storage. Preferences reads no storage.

**Planted on 2026-09-15**: the probe of Preferences on a build of HEAD fails bare
with the error above. The same story with only `parameters: { test: { restoreMocks:
false } }` added to Preferences, built on its own and restored by sha256, passes
bare and inside the manager, every step of the play, with four `storyFinished`
bare, the first render's and one for each of the three args updates, and eight
inside the manager, not read further.

## The approach

1. **Preferences keeps its mocks across its own renders**: `parameters: { test: {
restoreMocks: false } }` on the story, the switch `resetAllMocksLoader` reads,
   with a comment naming the second render and KN-563.
2. **The play clears the mocks when it starts**, `clearAllMocks()` from
   `storybook/test`. With no restore, nothing else clears the calls a previous run
   left, so a Rerun from the Interactions panel, which remounts the story and plays
   it again, would count the samples loaded twice. `mockClear` keeps
   implementations, so the storage spy the render installed keeps returning its
   memory storage; each args render still installs a new, empty one, as it does by
   default.
3. **The assertions stay on the args' spies**, the callbacks the docs say the story
   calls and the Actions panel shows. Nothing else in the story changes, and the
   docs need no change.
4. **`AGENTS.md` section 7** gets one line: an args update during a play renders a
   production story again at once, and that render restores every mock.

## What the switch changes, read

- **The preview's storage.** On Preferences' renders the loader restores nothing,
  but `withOwnStorage` still runs on each. The bundled `spyOn`, line 12501 of
  `node_modules/storybook/dist/test/index.js`, spies a getter that is already a spy
  afresh, carrying its calls, and `internalSpyOn` takes that spy's own original as
  the one to put back, line 12442. `cleanupStory`, line 35284 of the runtime, runs a
  story's cleanups in reverse. Leaving the story puts the real `localStorage` getter
  back, as it does by default.
- **A spy another story left.** A play that throws before its own restore leaves
  its spy in place, and Preferences' loader no longer restores it; the next story's
  loader does, as before. The stories' spies are on `console`, `Storage.prototype`,
  anchors and a file picker, none of which Preferences reads.

## Other ways, weighed

- **A record the story keeps itself**: the handlers add what the dialog passed to
  module state the play empties and asserts. It is independent of Storybook's mock
  lifecycle, but the assertions leave the args' spies, and the story file gains
  state for what one parameter does.
- **`onMockCall` from `storybook/test`**, a listener the restore does not remove:
  a global listener the play must remove in a `finally`, and its survival across a
  restore is Storybook's internals.
- **Asserting the rendered result of the args update**: the runner applies no args
  update, so it would fail there.
- **Deferring `updateArgs` out of the handler**: a race with the play.

## How I will know it works

- **Red before and the cause**: measured and planted above.
- **A production build of the change**: Preferences opened bare and inside the
  manager, with no failure event and no console error; and opened bare, played to
  the end, then remounted through the preview's `onForceRemount`, which handles the
  `forceRemount` the manager sends to remount a story, playing again with no
  failure.
- **A plant**: without `clearAllMocks()`, the remounted play fails on the samples
  loaded twice; restored by sha256.
- The SettingsDialog stories under Vitest, the unit project, eslint, tsc.
- The dialog looked at in both languages and both schemes.

## What I am unsure of

- **Whether Storybook means `restoreMocks` for this.** Its runtime reads it in a
  loader that runs on every render; I have not read what its documentation says the
  parameter is for, or whether a later version stops restoring on an args render,
  which would make the switch unneeded but not wrong.
- **Clearing every mock at the play's start** clears calls other stories' spies
  recorded, which nothing in Preferences reads.
- **The eight `storyFinished` inside the manager** against four bare.

## Plan review, Codex, 2026-09-15

Sound. It confirmed in the runtime the second render, the loader's restore unless
`restoreMocks` is false, and the play running again only on a remount. Storybook's
parameters page documents `restoreMocks`, default true, as restoring `fn()` mocks;
the runtime is more precise about when. The stacked storage spies unwind to the
native getter, since `internalSpyOn` takes the earlier spy's original and cleanups
run in reverse. The record kept by the story is not better: test-only state that
stops asserting the callbacks. One sentence corrected, above: the memory storage
does not stay in place, each args render installs a new one, harmless here. Keep
the switch on Preferences alone, not on the meta or the preview.

**The plant, measured before building**: the build with only the switch is the
change without `clearAllMocks()`. Played bare, remounted through the preview's
`onForceRemount` and played again, its second play failed `expected
"onLoadSamples" to be called 1 times, but got 2 times`; its first passed.

## Result, 2026-09-15

**Built as planned**: `parameters: { test: { restoreMocks: false } }` on Preferences,
with a comment naming the second render, and `clearAllMocks()` first in its play;
one line in `AGENTS.md` section 7 for the reset, and one for the remount below.

**Checked**:

- On a production build of the change, Preferences opened bare and inside the
  manager ended with no failure event and no console error, four `storyFinished`
  bare and eight inside the manager, all `success`. The story's comment was
  reworded after that build; nothing else in the file changed.
- The six SettingsDialog stories pass under Vitest, the unit project 1383 of 1383;
  eslint, tsc and the formatter are clean.
- Looked at on that build: PersianLight, PersianDark, EnglishLight and EnglishDark
  after their plays, the dialog right to left in Persian and left to right in
  English, light and dark.

**The remount did not pass, which the plan said it would.** Played bare to its end
and remounted through `onForceRemount`, the second play failed `expected
"onColorSchemeChange" to be called with arguments: [ 'dark' ]`, no calls. The first
play's choices stay in the story's args, locale Persian, scheme dark, samples
loaded, and the remount renders from them: the language step picks the other
language again and passes, but the Dark radio is already chosen, and clicking a
chosen radio fires no change. Before this change a remount failed at the language,
as the first play did. Filed as **KN-569**. So the plan's reason for
`clearAllMocks()`, that a Rerun would count the last run's calls, is true of what
the play reads, as the plant showed, but a Rerun does not pass either way. The
comment says what the clear does: with the restore off, nothing else clears the
spies the file's stories share, and the play reads only the calls it made.

**The cause of the second render**: the story's `onLocaleChange` handler calls
`updateArgs({ locale })`; the preview's `onUpdateArgs` updates the args and calls
`rerender()`, which renders at once while the play runs; that render's
`resetAllMocksLoader` restores every mock, and the call is gone.
