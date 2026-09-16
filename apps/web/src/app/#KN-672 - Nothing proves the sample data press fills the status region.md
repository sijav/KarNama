# KN-672 - Nothing proves the sample data press actually fills the status region

## The card

**Why.** The card was about a reader hearing the confirmation. If the wiring between the press and
the message breaks, every test stays green and the reader hears nothing, which is the original
defect returning by another route.

**Exit.** A test exercises the real path from pressing Load sample data to the status region holding
the confirmation, through the product's own state rather than through story args, and it is shown to
fail when `setLoaded` is removed.

From KN-618's roast, 2026-09-16. A child of KN-477 by the board's one-level rule.

## Measured before planning, 2026-09-16

- **The real path, read in full.** `SettingsControl.tsx` holds `loaded` at line 18, passes
  `loaded={loaded}` to the dialog at line 35, and its `onLoadSamples` at lines 41 to 44 calls
  `loadSamples()` and then `setLoaded(true)`. The dialog renders the confirmation inside its
  `role="status"` region when `loaded`. **Line 43 is the single point the card names**, and removing
  it is the control.
- **What KN-618's two stories prove, and what they do not.** `Preferences` asserts the region is
  present and empty before the press; `Loaded` renders `loaded: true` from its own args and asserts
  the text. Neither crosses the press, so a regression dropping line 43 leaves both green.
- **Why the transition cannot be asserted inside `Preferences`.** `updateArgs` re-renders in a real
  Storybook and NOT under the Vitest runner, KN-563. That is why KN-618 split the proof in two, and
  it is why this card cannot simply be folded back into that file.
- **The app-level cover the roast suggested does exist**, checked rather than taken on trust.
  `App.stories.tsx` line 321 clicks that exact button. It sits inside `laidOutAsTheFrames`, a shared
  helper at 279 to 390 used by TWO stories, `LaidOutAsTheFrames` at 391 and
  `LaidOutAsTheFramesInEnglish` at 398. The helper opens Settings at 319, presses Load sample data
  at 321, presses Done at 322, and only then measures the board's band.
- **One thing not to conflate.** Line 325 counts elements with role `region` and that is the board's
  columns. This card's region is `role="status"`, a different role and a different element.
- **The meta boots the real product.** `App/Shell`, `component: App`, `layout: 'fullscreen'`,
  decorated with a real `AuthProvider` seeding a signed-in reader. So a story here runs the real
  `useRecords`, the real `SettingsControl` and the real `loadSamples` — the product's own state,
  which is exactly what the exit asks for and what story args are not.
- **Docs**: `en/App-Shell.md` and `fa/App-Shell.md`, read rather than guessed.

## The decision, for the review

~~**A dedicated story, or the assertion folded into `laidOutAsTheFrames`?**~~ **Settled by the
review, against my lean, on a distinction I had missed.**

I argued from KN-668, where the contrast assertion was kept out of `codeAsTheFramesIn` and given its
own pinned stories. The review showed the cases are not alike. There, contrast was **unrelated** to
the helper's subject and folding it in would have smuggled a second concern into a geometry check.
Here, **loading the samples is already a prerequisite of the geometry assertions** — the helper
presses that button precisely so the board has records to measure — so asserting that the press
worked is the helper VERIFYING ITS OWN SETUP, not an unrelated claim riding along. That is a real
difference and it decides the card.

So: one assertion folded in, no second App boot, no new story, and no docs entries.

## The approach

1. **One assertion folded into `laidOutAsTheFrames`**, between the press at line 321 and Done at
   322, scoped to `within(settings).getByRole('status')` while the dialog is still open, and wrapped
   in `waitFor` so the test observes the state update rather than trusting scheduling.
2. **It asserts the exact confirmation** through the active `i18n`, so it runs in Persian and in
   English with the helper, once per locale story.
3. ~~Docs entries in both languages.~~ **None**: no story is added, so nothing new is documented.
4. **The control is the exit's own**: `setLoaded(true)` is removed from `SettingsControl.tsx` line
   43 and the assertion must fail. **Both** `Laid Out As The Frames` and its English twin should
   fail, since both run the helper.

## What I will change

- `apps/web/src/app/App.stories.tsx`, the assertion block inside `laidOutAsTheFrames`: a `waitFor`
  round an expectation, with the comment that says why it sits in a geometry helper — more than the
  "three lines" this line claimed before the review counted them
- this plan, which stays beside the work

**No docs change and no new story**, which is part of why the review preferred folding: the cheapest
change that meets the exit is the one that adds nothing to document.

## What I expect to be hard, and what I am unsure of

- **The assertion must read the region inside the DIALOG**, `within(dialog).getByRole('status')`,
  not the page's, and must not be confused with the board's `region` elements.
- ~~**What to assert, exactly.**~~ **Settled: the exact confirmation, not merely non-empty.**
  Non-empty would let an unrelated or erroneous message through, while the exit says the region
  HOLDS the confirmation. My KN-663 worry does not apply, and the review drew the line more sharply
  than I had: looking the string up through the active catalog does not reduce this to a locale
  test, because the claim is that this region receives the INTENDED confirmation in the selected
  locale. It is not a test of translation quality, and that was never this card's claim.
- **An App boot is heavy.** If the new story flakes beside the others, KN-365 is the precedent and
  the answer is not a sleep.

## How I will know it works

- **The existing TWO stories fail when line 43's `setLoaded(true)` is removed** and pass with it,
  which is the exit's own words. There is no new story to fail: saying otherwise would be a sentence
  left over from a decision that changed under it, which is the shape KN-678 was filed for. Run
  whole-file, read from the summary line, and refuse any run that skipped or ran none — "could not
  run" is not "does not hold".
- The App stories pass whole, the unit and storybook projects pass, `tsc` and `eslint` are clean, no
  changed file's drift grows and this plan's is 0.
