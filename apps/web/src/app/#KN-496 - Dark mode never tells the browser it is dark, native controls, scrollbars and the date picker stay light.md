# KN-496 - Dark mode never tells the browser it is dark: native controls, scrollbars and the date picker stay light

## The card

**Why.** A reader in dark mode cannot see the control that opens the date picker, and every native
part of the page reads as a light page leaking through.

**Exit.** `html` computes `color-scheme` dark in dark and light in light, asserted by a story; the
date field's calendar glyph is visible in fa-IR dark.

## Measured before planning, 2026-09-15

- **Today.** From the dev Storybook, on a story that pins no scheme, `html` computes its
  `color-scheme` as `normal` in light and in dark alike, while the page's background does turn dark.
  So the browser draws every native part of the page, the date field's calendar glyph among them,
  for a light page.
- **The parked fix.** `git stash@{0}`, "dark color-scheme: CssBaseline enableColorScheme", holds one
  change to `AppProviders.tsx` and nothing else: `CssBaseline` given `enableColorScheme`, with a
  comment. It is read, not applied, and stays where it is.
- **Why the fix works here.** `buildTheme` calls plain `createTheme` with `palette.mode` set to the
  scheme and no CSS variables, and MUI 9's `CssBaseline`, given `enableColorScheme` and a theme with
  no CSS variables, sets `html`'s `color-scheme` to `theme.palette.mode`, read in its source.
- **The stories.** The preview defaults to light. `App/Shell`'s `PersianDark` pins fa-IR dark and
  reads the page as dark by its luminance; `Persian` pins no scheme. Every story that shows the date
  field, the add modal's `Review` and `Manual` and the Job Modal's `Info`, pins fa-IR light. The
  Input draws a `type="date"` field with nothing of its own for dates, so the glyph follows the
  `color-scheme` the page inherits.

## The approach

1. **The stories first.** `PersianDark` also reads `html`'s computed `color-scheme` as `dark`, and
   `Persian`, pinned to light, which is already the default, reads it as `light`. A new Job Modal
   story, `InfoInTheDark`, opens `Info` in fa-IR dark and reads the posting date's field computing
   `color-scheme` as `dark`, the value the browser draws its glyph by. All three should fail against
   today's code, reading `normal`.
2. **The fix**: `CssBaseline enableColorScheme` in `AppProviders.tsx`, written here with the comment
   naming KN-496, rather than applying the stash.
3. **The docs**: both Job Modal pages gain `InfoInTheDark`'s entry, and `App/Shell`'s entries for
   `Persian` and `PersianDark` say what they now read, if they describe their checks.
4. **A look** at `InfoInTheDark`'s date field in fa-IR dark, with its glyph light on the dark field,
   and at the shell in fa-IR and en-US, light and dark.

## What I will change

- `apps/web/src/app/AppProviders.tsx`
- `apps/web/src/app/App.stories.tsx`, `apps/web/src/shared/job-modal/JobModal.stories.tsx`
- `apps/web/src/shared/story-docs/en/Shared-JobModal.md`, `apps/web/src/shared/story-docs/fa/Shared-JobModal.md`,
  and the `App/Shell` docs pages if their entries need it

## What I expect to be hard, and what I am unsure of

- **The glyph itself cannot be read.** The calendar glyph is drawn by the browser inside the field
  and has no element a story can measure, so the story reads the `color-scheme` it is drawn by, and
  the look shows the glyph.
- **The stash.** Once this lands it duplicates what is committed; dropping it deletes a parked copy,
  so it is left for the owner and STATE says so.
- **Pinning `Persian` to light** changes nothing in the runner, where light is the default, and
  stops a reader's dark toolbar from making its new read fail.

## How I will know it works

- The three reads fail before the fix, reading `normal`, and pass after it.
- `App/Shell`'s and the Job Modal's stories pass; tsc, lint and the unit project pass, the docs guard
  among them; and no changed file's Prettier drift grows.
- The date field's glyph shows light on the dark field in fa-IR dark.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved. `CssBaseline` with `enableColorScheme` is MUI 9.4's mechanism for this theme: with plain
`createTheme` and a `palette.mode` that follows the scheme, it writes `html`'s `color-scheme` from
the theme in use, which `AppProviders` rebuilds when the preference or the system's scheme changes,
and nothing in the app or the preview sets `color-scheme` to win over it. Reading the date field's
computed `color-scheme` is an honest stand-in for its glyph, since that property governs a native
control's drawing, and the look supplies the rest. Pinning `Persian` to light, extending
`PersianDark` and a dark copy of `Info` are the smallest set. Its caution is kept: the story reads a
real `type="date"` field from the normal fixture, not the text field KN-494 draws for a date no
picker can read, and the reads are exact computed styles, not the background's luminance alone.

## Built, 2026-09-15

- **The stories came first.** `App/Shell`'s `Persian`, now pinned to light, reads `html` computing
  `color-scheme` as `light`, `PersianDark` reads it as `dark`, and the Job Modal's new
  `InfoInTheDark` reads the Info panel's first `type="date"` field, the posting date, computing
  `dark`. Against the code as it was all three failed, each reading `normal`.
- **The fix.** `AppProviders.tsx` renders `CssBaseline` with `enableColorScheme`, the comment naming
  KN-496, written by hand; `git stash@{0}`, which holds the same change, is left as it was.
- **After it**, the thirty `App/Shell` and Job Modal stories pass, and both Job Modal docs pages
  describe `InfoInTheDark`.
- **Checks.** tsc and lint pass. The unit project passed except `session.test.ts`, whose two tests
  overran their 5 s under load, KN-551, and passed alone. Prettier drift is unchanged: 14 in
  `App.stories.tsx`, and 0 in the other files and in this plan.
- **The look.** From the dev Storybook, the posting date field in fa-IR dark computes its
  `color-scheme` as `dark`, its box dark and its date and calendar glyph drawn light; the same field
  in light draws a dark glyph on white. `App/Shell` in English computes `light` in light and `dark`
  in dark, with no page error.
