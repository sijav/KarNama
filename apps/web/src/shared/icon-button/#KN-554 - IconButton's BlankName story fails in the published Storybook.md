# KN-554 - IconButton's BlankName story fails in the published Storybook: its spy never sees the report

## The card

**Why**, from the board: A story that fails in the published Storybook shows a
failed interaction to whoever reviews the component there, and its docs describe
behaviour the published build does not show.

**Exit condition**, from the board, widened on 2026-09-15 to name the Docs page:
BlankName's play passes, and IconButton's Docs page prints no report, in a
production Storybook opened in a browser, and BlankName still passes in the Vitest
runner.

It blocks KN-226, the check that the published Storybook renders its stories
without errors, whose exit condition fails on any console error. KN-379 carried
the waiting half of this from an earlier roast, and was dropped as its duplicate.

## What is there, read on 2026-09-15

- **The story**, `IconButton.stories.tsx` line 163: `beforeEach` spies on
  `console.error`, calling through, and the play asserts one button in the row,
  then that `console.error` was called with `/aria-label is blank/u`, with no wait.
- **The component**, `IconButton.tsx` lines 117 to 121: a blank name is reported in
  a `useEffect`, a passive effect React runs after it commits, and the button
  returns null.
- **The report**, `console-guard.ts` line 21: `report` calls `console.error` at the
  moment it is said, so a spy put in place before the render sees it whenever it
  comes; nothing holds on to the console from before.
- **Measured** by KN-226's probe on a production build of d3f9fce, bare at
  `iframe.html` and inside the manager: the play throws `expected "error" to be
  called with arguments: [ StringMatching{…} ]`, no calls, and the console then
  carries `KarNama: IconButton: its aria-label is blank...`; the Docs page, which
  runs no play, prints the same report. The story has not changed since d3f9fce.
- **The Checkbox's two refusal stories**, KN-206, pass in that same build, and its
  Docs page prints nothing. They do the two things this story does not: they wait
  for the report with `waitFor`, and they capture with `passOnUnmarked(through)`,
  KN-522, which holds back what the product marks and hands everything else to the
  console as it was, which in the runner is KN-401's guard.

## The approach

1. **Capture as the Checkbox does.** `BlankName`'s `beforeEach` reads
   `through = console.error.bind(console)` before it spies, then
   `spyOn(console, 'error').mockImplementation(passOnUnmarked(through))`, and
   restores the spy on cleanup. The product's marked report stops reaching the
   published Storybook's console, and anything unmarked still reaches the console,
   and the guard under Vitest.
2. **Wait for the report.** The play waits for `console.error` to have been called
   with the report, then asserts the single button, as the Checkbox's does, so it
   holds whether the effect has run by the time the play starts or runs just
   after.
3. **The docs**, English and Persian: the entry says the blank button is left out
   and reported, without "in the console", since the story now holds the report
   back where a reader would have seen it.
4. **`IconButton.tsx` does not change.** The component reports correctly; the story
   read the report too early and let it through.

## How I will know it works

- Red before: KN-226's probe measured both entries failing on d3f9fce.
- The IconButton stories pass under Vitest, the unit project too since its guards
  read the stories, and eslint, tsc and the docs guard are clean.
- A production Storybook of the change, built with the base set in Node's own
  environment: `shared-iconbutton--blank-name` opened headless, bare and inside the
  manager, with no `playFunctionThrewException` and no console error, and
  `shared-iconbutton--docs` with no console error.
- Plants, each on its own production build and restored by hash: the `waitFor` taken
  out, to see whether waiting is what the published play needs; and the spy put
  back to calling through, to see the Docs page print the report again.
- The story and the Docs page looked at in both languages and both schemes.

## What I am unsure of

- **Whether a Docs page runs `beforeEach` for the stories it draws.** The capture
  keeps the Docs page quiet only if it does. Read from Storybook 10.5.10's preview
  runtime, `node_modules/storybook/dist/preview/runtime.js`: a Docs page draws each
  story through `renderStoryToElement`, lines 35886 to 35903, which builds a
  `StoryRender` in the `docs` view mode, and `StoryRender.render` runs
  `applyBeforeEach` before it mounts, line 35561, whatever the mode, playing only
  when autoplay is on. So the capture runs there, which is why the Checkbox's Docs
  page is quiet; the plant that puts the call-through spy back shows it on a build.
- **Why the published play reads the console before the report.** The likely cause
  is that the Vitest runner renders under React's `act`, which flushes passive
  effects before the play starts, and a production canvas does not. The wait holds
  either way, and the plant that takes it out shows whether it is the part that
  matters.
- **A reader loses the report from their console** on the story's canvas and its
  Docs page. The story's own assertion is the proof that it was said, and the docs
  say reported, not printed.

## Plan review, Codex, 2026-09-15

Written to `%TEMP%/claude-roast/2b1874631dd1/20260914T223123-plan-kn-554-iconbutton-s-blankname-story-fails-in-the-87cd21.md`.
It found the plan sound and nothing to change, and each point checks against the
code: a Docs page runs an embedded story's `beforeEach` and plays nothing, since
its block passes autoplay off; the spy is in place from before the mount until
Storybook remounts or leaves the story, so the effect cannot miss it and `waitFor`
only has to outlast it; `passOnUnmarked(through)` holds back the marked report and
keeps the guard hearing everything else; and neither change alone meets both
halves of the exit, the wait leaving the Docs page printing and the capture leaving
the play early. The one fragile step it names is the production probe's settle on
the Docs page, which the probe's own wait and the two plants cover.

## Result, 2026-09-15

- **`IconButton.stories.tsx`**: `BlankName`'s `beforeEach` reads `through` from
  `console.error` before it spies, captures with `passOnUnmarked(through)`, and
  restores the spy in the cleanup it returns; the play waits for the report, then
  counts one button in the row.
- **The docs**, English and Persian: the entry says the blank button is left out
  and reported, and that the story holds the report back rather than printing it,
  on its canvas and on its Docs page. The Persian entry was edited by a script
  matching the file's own characters, since its words carry zero-width
  non-joiners.
- `IconButton.tsx` is unchanged.

**Red before**, measured by KN-226's probe on d3f9fce: BlankName threw `expected
"error" to be called with arguments: [ StringMatching{…} ]` and the Docs page
printed the report, bare and inside the manager.

**On a production Storybook of the change**, built with the base set in Node's own
environment and opened headless, BlankName and IconButton's Docs page ended with
no failure event and no console error, bare and inside the manager. **Plants**,
each on its own production build, the story restored byte for byte before its
build was probed: with the wait taken out, BlankName threw the same assertion
again; with the spy put back to calling through, the Docs page printed the report
again. Each half of the change is what one half of the exit needs.

**Passing**: the IconButton stories under Vitest, 11 of 11; the web unit project,
1383, run before any browser run; eslint and tsc clean. `IconButton.stories.tsx`
was not formatted at HEAD, 4 lines of drift, and keeps 4; both docs files keep 0.
**Looked at** in the dev Storybook: BlankName draws the one named button in
Persian and English, light and dark; inside the manager, the Docs page's entry
reads the new sentence in English and in Persian, the Persian page right to left.

**Seen on the way**: inside the manager with English chosen, the Docs page's prose
is English while the preview document keeps `lang="fa-IR"`, the mirror of what
KN-090's note of 2026-09-11 saw; carried to KN-090, whose remaining scope is the
document's language, and not changed here.
