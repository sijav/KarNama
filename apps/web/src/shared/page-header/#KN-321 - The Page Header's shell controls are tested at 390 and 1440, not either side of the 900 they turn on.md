# KN-321 - The Page Header's shell controls are tested at 390 and 1440, not either side of the 900 they turn on

## The card, as re-pointed

A child of KN-021, found by its roast.

**Why.** Between 600 and 900 a tablet shows the header's switch, and only the two widths either
side of 900 prove where it turns.

**Exit, re-pointed 2026-09-15.** ControlsOnNarrowScreens shows the shell's three controls in the
Page Header at 899 wide and hides them at 900.

**What it said before.** `LanguageOnNarrowScreens` and the language switch alone. Since KN-478
the story is `ControlsOnNarrowScreens`, and the switch is one of three Icon Buttons.

## Read before planning, 2026-09-15

- `PageHeader.tsx` draws the language, settings and signing out after the page's action in a
  Box of `display: { xs: 'inline-flex', md: 'none' }`, below MUI's md, the build's mobile
  breakpoint, DESIGN.md section 5. The theme sets no breakpoints of its own, so md is MUI's 900:
  searched in `src/theme`, with a word known to be there found by the same search.
- `ControlsOnNarrowScreens` sets the runner's viewport to 390 by 844, finds the three controls
  visible and clicks signing out, then sets 1440 by 900 and finds them hidden, and puts back 414
  by 896. A line moved to 600, 768 or 1200 passes it.
- Its story-docs, `Shared-PageHeader.md` in both languages, name no width.
- The storybook project's page is 1440 by 900, KN-304, so a story at 899 or 900 wide is drawn
  one to one.

## The approach

1. **The widths either side of the line.** The story keeps 390 by 844, the phone the design
   draws, where the three controls show and signing out is clicked; it adds 899 by 900, where
   they still show, and 900 by 900, where they are hidden, in place of 1440, with a comment
   saying the two sit either side of md, so a moved line fails. The viewport is put back as
   today.
2. **A plant, taken out again**, moving the Box's line to `sm`, 600, and then to `lg`, 1200:
   the story must fail at 899 under the first and at 900 under the second.
3. **AGENTS.md section 7** gains a line, in a commit of its own after this card's, as RALPH.md
   step 7 asks for anything learned: the Grep tool matches a glob with a slash in it against
   the path from the session's working directory, whatever path the search is given, so a
   glob with a folder in it finds nothing under any other path, and the search reports no
   files rather than an error.

## File by file

- `apps/web/src/shared/page-header/PageHeader.stories.tsx`
- `AGENTS.md`, in a commit of its own

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved, with one scope trim.

- **Taken, as confirmation.** `page.viewport` resizes the tester iframe, whose own viewport the
  `sx` media query reads, and at the page's 1440 by 900 neither 899 by 900 nor 900 by 900 is
  scaled. The installed `@mui/system`, 9.4.0, gives md as 900 in `createBreakpoints.js`, read
  here. The two plants are the positive controls, and the two widths, a pixel apart, fail a
  line moved to any other whole width.
- **Taken: the AGENTS.md line is not this card's change.** It neither serves the exit nor
  changes the Page Header. RALPH.md step 7 still asks for anything learned to be written while
  it is known, so it goes in a commit of its own, and the approach and the file list say so.
- **Not taken: naming 899 and 900 in the story docs.** They say what a reader sees, the
  controls after the action on a narrow screen and gone on a wide one, which this card does not
  change, and the line itself is in DESIGN.md section 5.
- **Warned: the 1440 check left in, or a resize not awaited.** The 1440 check goes, and each of
  the three resizes is awaited.

Measuring the glob for that line found more than the plan said. The Grep tool matches a glob
with a slash in it from the session's working directory, whatever path the search is given:
from `apps/web`, `apps/web/src/shared/tabs/*.stories.tsx` finds the Tabs stories and
`src/shared/tabs/*.stories.tsx` finds nothing. This session's searches came back empty that
way nine times where the glob written from the repo root finds matches today. Seven had
nothing resting on them: each was searched again another way, or its files read, before
anything was written. KN-304's plan said on one that no story sets a viewport, and its review
caught it; this plan's search for the story docs was caught by its positive control.

## What I expect to be hard, and what I am unsure of

- **Whether 899 is below the line in the runner.** MUI's `md: 'none'` is a `min-width: 900px`
  media query, and a media query reads the viewport's width, scrollbar included, so a viewport
  899 wide should match it not; subpixel layout does not enter a media query.
- **Dropping 1440.** A width of 900 hides the controls by the same rule every wider width does.

## How I will know it works

- The story passes at 390, 899 and 900.
- With the line planted at `sm` the story fails at 899, and at `lg` it fails at 900.
- The Page Header stories and the unit project pass, lint and tsc clean.
- Nothing a reader sees changes.

## Result, 2026-09-15

- `ControlsOnNarrowScreens` keeps 390 by 844 for the click on signing out, and in place of 1440
  finds the three controls visible at 899 by 900 and hidden at 900 by 900; the viewport is put
  back to 414 by 896 in the `finally`, as before.
- With the Box's line planted at `sm`, the story failed at line 155, the controls not visible at
  899; at `lg`, it failed at line 157, the controls visible at 900. The other four stories
  passed under both, and `PageHeader.tsx` was put back byte for byte.
- With the change, the Page Header stories 5 of 5, the unit project 1494 of 1494, lint and tsc
  clean; the stories file's Prettier drift stays at HEAD's 20.
- No look was taken: nothing drawn changes, and outside the runner the play returns before the
  lines this card changed.
- The AGENTS.md line is a commit of its own, 070fcb4.
