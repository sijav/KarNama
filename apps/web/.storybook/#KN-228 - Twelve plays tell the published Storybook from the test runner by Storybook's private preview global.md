# KN-228 - Twelve plays tell the published Storybook from the test runner by Storybook's private preview global

## The card, as re-pointed

A child of KN-225 by its prose, found by KN-225's roast.

**Why.** KN-225 moved the test side onto a signal the repository owns; the canvas side
still borrows one. Medium rather than critical because nothing is broken and the failure
it guards against would be loud, not silent.

**Exit, re-pointed 2026-09-15.** No story tells the published Storybook from the test
runner by a Storybook or Vitest internal: the twelve guards know the canvas by Vite's
documented import.meta.env.MODE, which Vitest sets to test, and keep the story-test flag;
the ten story files pass under the storybook project; with the flag removed from
.storybook/vitest.setup.ts each of the twelve fails there rather than passing; and in a
production Storybook build their stories render with no error under check:storybook,
where Checkbox's Hover fails once its canvas branch is removed.

**What it said before.** The card named the Checkbox Hover story alone, one point, and
proposed a second flag set in `.storybook/preview-head.html`, "which Storybook injects
into its own preview and the Vitest page does not load". Both were out of date, measured
below, so the card was re-pointed before planning.

## Read before planning, 2026-09-15

- `__STORYBOOK_PREVIEW__` is read at twelve sites in ten story files, each inside
  `if (!('__KARNAMA_STORY_TEST__' in globalThis))`, returning when the global exists and
  throwing otherwise:
  - `shared/button/Button.stories.tsx` 281, Matrix, and 318, KeyboardFocus
  - `shared/checkbox/Checkbox.stories.tsx` 243, Hover
  - `shared/color-picker/ColorPicker.stories.tsx` 222, `arrowsFollowTheScreen`
  - `shared/filter-chip/FilterChip.stories.tsx` 187, ToldApartFromSelected
  - `shared/bulk-action-bar/BulkActionBar.stories.tsx` 63, `atWidth`, returning false
  - `shared/tabs/Tabs.stories.tsx` 207, Hover, and 235, `realKeys`, returning null
  - `shared/icon-button/IconButton.stories.tsx` 103, Hover
  - `shared/input/Input.stories.tsx` 626, Hover
  - `shared/page-header/PageHeader.stories.tsx` 139, ControlsOnNarrowScreens
  - `shared/status-picker/StatusPicker.stories.tsx` 147, `arrowsFollowTheScreen`
- A flag in `preview-head.html` would not tell the two apart. `@storybook/addon-vitest`
  10.5.10's plugin injects `previewHead`, which reads `.storybook/preview-head.html`, and
  `previewBody` into the Vitest page, `transformIndexHtml` at
  `dist/vitest-plugin/index.js` line 2584, and applies main.ts's `viteFinal`, line 2562.
  A flag set in any of them is set under Vitest too, where a missing story-test flag
  would take the canvas branch and pass.
- Read on a story planted at the root of `src` and removed, `kn228-mode-probe.mjs` and
  `kn228-mode-vitest.mjs`: under the storybook project `import.meta.env.MODE` is `test`,
  the story-test flag set and `__STORYBOOK_PREVIEW__` absent; in the dev Storybook's
  preview `MODE` is `development`, the flag absent and the global present. Vite
  documents `import.meta.env.MODE`, and `test` is the mode Vitest documents it runs in.
- `tsconfig.json` has `vite/client` in its `types`, so `import.meta.env.MODE` is typed.
- `check:storybook`, `e2e/storybook/published.spec.ts`, builds Storybook and opens every
  story in headless Chromium, failing on a page error, a console error or a thrown play,
  KN-226.
- Before any change, the ten story files pass under the storybook project, 99 of 99, and
  they make 99 stories in the dev index.

## The approach

1. **At each of the twelve sites**, `'__STORYBOOK_PREVIEW__' in globalThis` becomes
   `import.meta.env.MODE !== 'test'`, and the comment in Checkbox's Hover that says
   Storybook's own preview must be rendering the story says the story must be outside
   Vitest's mode instead. The story-test flag and the throw stay, so under the runner a
   missing flag still fails.
2. **Inline, as they are.** Twelve copies of a three line guard could be one helper in
   `shared/story-fixtures`, but a helper there is held to 100 percent coverage, and its
   canvas branch runs under no Vitest project, so it would need the mode handed in; the
   story files are outside coverage, and each guard names its own story in its error.
3. **`.storybook/vitest.setup.ts` refuses a mode other than `test`** before it sets the
   flag, the plan review's addition: a run in another mode would let a story missing the
   flag pass as a canvas, so the run stops there instead. Its comment says what the other
   half of the pair reads.

## File by file

- the ten story files above
- `apps/web/.storybook/vitest.setup.ts`, the mode check and its comment

## What I expect to be hard, and what I am unsure of

- **The production build's mode.** `storybook build` runs Vite in production, which the
  planted story did not read; the production check reads it through every story these
  guard.
- **Two production builds**, one with the change and one with one canvas branch removed,
  a few minutes each.

## Plan review, Codex gpt-5.6-terra, 2026-09-15

"The plan meets the exit condition in this repository today." It confirmed the twelve
guards in the ten files, that the storybook project runs plain Vitest in no custom mode,
and that addon-vitest applies `previewHead`, `previewBody` and `viteFinal` to its page, so
the card's `preview-head.html` flag would reach the runner; that `MODE !== 'test'` is
sound, Vite documenting `MODE` and its development and production builds; and that no
signal of the published Storybook's own is left through preview HTML, preview annotations
or `viteFinal`, a second compile-time marker being more configuration for no present
benefit.

One addition, taken: `vitest.setup.ts` asserts the mode is `test` before it sets the flag,
so a future `vitest --mode staging` fails loudly rather than letting a story with no flag
pass as a canvas.

## How I will know it works

- The ten story files pass under the storybook project.
- With the flag line removed from `vitest.setup.ts` by hand, `kn228-flag-plant.mjs`, each
  of the twelve guards fails there; then it is put back.
- Run in another mode, the setup stops the run with its own error. `--mode staging` on the
  command line leaves the storybook project's page in mode `test`, measured on a planted
  story, so the other mode is set in the storybook project's own config for one run.
- A production build, and `check:storybook` over the ten files' 99 stories,
  `kn228-published.mjs`: none errors. With Checkbox's Hover canvas branch removed by hand,
  a second build fails that story; then it is put back.
- `npm run lint`, `npm run lint:tsc`, and the unit project, whose guards read every story
  file.
- Nothing a reader sees changes, so the check is the look.

## Result, 2026-09-15

Built as planned after the review.

- The twelve guards in the ten story files read `import.meta.env.MODE !== 'test'` where
  they read `'__STORYBOOK_PREVIEW__' in globalThis`, and Checkbox's Hover comment says so.
  No code in `apps/web` reads the private global now; only this plan names it.
- `.storybook/vitest.setup.ts` throws when the mode is not `test`, before it sets the flag,
  with a comment saying why.
- The card was re-pointed on the board before planning: twelve guards, two points, and an
  exit the measurements hold.
- AGENTS.md section 7 holds the lesson.

**Checks.**

- The ten story files under the storybook project: 99 of 99 before the change, and 99 of
  99 after.
- With the flag removed from `vitest.setup.ts`, `kn228-flag-plant.mjs`: 20 of the 99 fail,
  in all ten files, and each of the twelve guards fails on its own message, naming its
  story. Input's Controls Match The Canvas In English and Typing Into A Bound Value fail
  too, as they must: their plays return early under the flag, lines 676 and 711, and
  without it run a half the runner cannot. Then the setup was put back exactly.
- `--mode staging` on the command line: a planted story still read mode `test`, and
  Checkbox's 14 stories passed. With `mode: 'staging'` in the storybook project's own
  config, `kn228-config-mode.mjs`, the setup stopped the run, "The storybook project runs
  in mode staging, not test, so a story missing the story-test flag would pass as a
  canvas". Then the config was put back exactly.
- A production Storybook build, 458 index entries and 405 stories, checked by
  `published.spec.ts` over the ten files' 99 stories, `kn228-published.mjs`: 99 passed.
  With Checkbox Hover's guard made unreachable, `kn228-canvas-plant.mjs`, a second build
  failed `shared-checkbox--hover` with `playFunctionThrewException` and its own message,
  the other 13 passing; then the story was put back exactly.
- `npm run lint` and `npm run lint:tsc` clean in `apps/web`, and the unit project passes
  1488 of 1488. The eight story files that carried formatting drift at HEAD keep exactly
  theirs; the other two, `vitest.setup.ts` and this plan are formatted.
