# KN-562 - The Input's ControlsMatchTheCanvasInEnglish fails in the published Storybook: the args keep the Persian copy

## The card

**Why**, from the board: Whoever opens the Input's English page in the published
Storybook meets a failed interaction and, if the story is right, a Controls panel
holding Persian copy under English, the defect KN-245 closed.

**Exit condition**, from the board: Inside the manager of a production Storybook
opened in a browser, ControlsMatchTheCanvasInEnglish passes and the Controls panel
shows the English specimen, and the story still passes in the Vitest runner.

It blocks KN-226.

## What is there, read on 2026-09-15

- **The meta render**, `Input.stories.tsx` line 241: it computes
  `copy = specimenCopy()`, which reads the shared `i18n` singleton, and for each copy
  field still holding what the story put there it schedules the language's copy,
  which `FollowTheLanguage` writes back with `updateArgs` in a passive effect.
  `AT_LOAD` is the copy read when the file loads. The comment above says "the
  providers activate it before this runs".
- **`AppProviders`**, lines 63 to 90: since KN-134 the tree's catalog is its own
  instance, `i18nFor(locale)`, and the shared singleton is activated in a
  `useLayoutEffect`, after the render, "for code outside the tree".
- **`ControlsMatchTheCanvasInEnglish`**, line 670: `ControlsMatchTheCanvas` with
  `globals: { locale: 'en-US' }`. Its second half, which runs only outside the Vitest
  runner, TECH-DEBT 16, waits for the recorded args to be the specimen in the
  language on screen.

## Measured, 2026-09-15

- **KN-226's probe** on a production build of d3f9fce: bare and inside the manager,
  `expected 'عنوان شغلی' to be 'Job title'`.
- **A production build with a `console.info` planted in the render**, the story
  restored byte for byte before it was opened: bare and inside the manager, both
  renders of the English story logged the shared singleton on `fa-IR`, a Persian
  label computed and a Persian arg, under a document already `lang="en-US"`, and the
  play failed as before.

**The cause**: the render reads the singleton before `AppProviders`' layout effect
has switched it, computes the copy in Persian, finds the args already Persian,
writes nothing, and nothing renders it again. The comment's "the providers activate
it before this runs" was true until KN-134, on 2026-09-11; KN-245's verifier last
saw this half pass on 2026-09-10. The runner never showed it because the half
returns early there.

## The approach

1. **The render takes its language from the story, not the singleton.** It reads the
   globals with Storybook's `useGlobals`, resolves the locale as the preview does,
   a known locale or `defaultLocale`, and computes the specimen through that
   language's own catalog, `i18nFor(locale)`. `specimenCopy` takes the catalog to
   read; `AT_LOAD` keeps reading the singleton when the file loads, the language
   the file loads in, as its comment says.
2. **The play's second half** computes the copy it waits for through the same
   catalog, from the `globals` its context carries, so the canvas, the args and
   the assertion are read one way.
3. **The render's comment** says what is true now: the singleton follows the tree
   only after the commit, so the render reads the story's own language.
4. **The docs do not change**: the `ControlsMatchTheCanvas` and
   `ControlsMatchTheCanvasInEnglish` entries, English and Persian, say what the
   reader sees, the copy following the Language toolbar into the Controls, not how
   the story reads it.
5. **Not here**: `JobTitle` and the menus' triggers, which read the singleton while
   rendering the same way and are KN-567.

## How I will know it works

- Red before: the measurement above.
- **A production build of the change**: `shared-input--controls-match-the-canvas-in-english`
  opened inside the manager and bare, with no failure event and no console error.
  Its play is what shows the args following the language, since the twins disable
  their Controls, `parameters: { controls: { disable: true } }`, so their panel has
  no label to read.
- **The Controls panel**, read where it exists: `shared-input--default`, the same
  render with its Controls on, opened inside the manager with `locale:en-US`, its
  label field reading «Job title», as KN-245's verifier read it.
- **`ControlsMatchTheCanvas`**, the Persian twin, passing in the same build.
- **A plant**: the render's copy read from the singleton again fails the English
  half in a production build; restored by hash.
- The Input stories under Vitest, the unit project, eslint, tsc, the docs guard.
- A look at the Input's `Default` inside the manager with English chosen: the
  canvas and the Controls in English.

## What I am unsure of

- **`useGlobals` in a Storybook render** that already calls `useArgs` and
  Storybook's `useRef`: all Storybook hooks, which may share a function with each
  other and not with React's, as the file's comments say. Whether it returns the
  story's pinned globals on the first render, bare and inside the manager, is what
  the production build shows.
- **A switch of the Language toolbar** cannot change the English twin, whose pinned
  `globals: { locale: 'en-US' }` overrides the toolbar. An unpinned story such as
  `Default` renders again with the toolbar's value, so its render reads the new
  language in that render rather than after an effect.
- **Under Vitest**, portable stories apply no args update and the English half
  returns early, TECH-DEBT 16, so the runner still cannot see the write; it sees
  the first half, that the canvas draws the args.

## Plan review, Codex, 2026-09-15

Written to `%TEMP%/claude-roast/2b1874631dd1/20260914T232141-plan-kn-562-the-input-s-controlsmatchthecanvasinengli-d359f2.md`.
Judged against the code:

- **`useGlobals` beside `useArgs` and Storybook's `useRef` is valid, and returns the
  pinned locale on the first render. Agreed**: in Storybook 10.5.10 it reads the
  current context's globals, built from the reader's globals and then the story's,
  bare and inside the manager; `i18nFor(locale)` is the simplest fix and leaves
  KN-134's reasons standing.
- **A toolbar switch cannot reach the English twin. Real, taken**: the pinned locale
  overrides it; the unsure point now says so.
- **The panel check aimed at a story with no panel. Real, taken**: both twins disable
  their Controls, so the check moved to `Default` in English inside the manager,
  and the English twin's play carries the args.
- **Leaving `JobTitle` and the menus' triggers to KN-567 leaves this exit true.
  Agreed**: the twins reach the meta render, not `JobTitle`.
- **`specimenCopy` taking a catalog, the locale resolved with `defaultLocale` as the
  fallback, `AT_LOAD` on the singleton, and the singleton plant as the negative
  control.** Agreed, as the approach has it.

## Result, 2026-09-15

- **`Input.stories.tsx`**: `specimenCopy` takes the catalog it reads, a parameter
  named `i18n`, the one name the lingui rule and the catalog test read an id from;
  `localeOf` resolves the story's language from its globals as the preview does.
  The meta render reads the globals with `useGlobals` and computes the specimen
  through `i18nFor(localeOf(globals))`, and `ControlsMatchTheCanvas`' play computes
  the copy it waits for the same way. `AT_LOAD`, `JobTitle` and the helper table
  pass the shared catalog, reading what they read before.
- **The docs do not change.**

**Red before**: KN-226's probe, and the build with a log in the render, both renders
on the shared catalog in `fa-IR` under a document already `lang="en-US"`.

**On a production Storybook of the change**, `ControlsMatchTheCanvasInEnglish` and
`ControlsMatchTheCanvas` ended with no failure event and no console error, bare and
inside the manager; and inside the manager in English, `Default`'s Controls label
field read "Job title" over a canvas label "Job title", the panel read where it
exists, since the twins disable their Controls. **With the render's copy read from
the shared catalog again**, on a build of its own and the story restored byte for
byte, the English twin failed with `expected 'عنوان شغلی' to be 'Job title'`.

**Passing**: the Input stories under Vitest, 30 of 30; the web unit project, 1383,
the catalog test among them, run before any browser run; eslint and tsc clean.
`Input.stories.tsx` was not formatted at HEAD, 71 lines of drift, and keeps 71.
**Looked at** in the dev Storybook: `Default` in English inside the manager, its
canvas and its Controls in English; `ControlsMatchTheCanvasInEnglish`'s Interactions
panel on PASS over an English canvas.

**On the way**: the parameter was first named `catalog`, and the lingui rule and the
catalog test, which read an id only from `i18n._()`, both failed on it; it was
renamed before anything else ran.
