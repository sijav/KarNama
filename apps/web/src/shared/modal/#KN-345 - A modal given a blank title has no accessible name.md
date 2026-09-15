# KN-345 - A modal given a blank title has no accessible name

## The card

A child of KN-028, found by its roast.

**Why.** The exit asks for a named dialog, and the shell is reusable, so its type or its render
should refuse what cannot name it.

**Exit, as filed.** A blank title is refused, by the type or with a thrown error in development,
and a story or test shows it.

**Exit, as edited on 2026-09-15 after the plan review.** A blank title is reported at the console as
the product's own diagnostic and the Modal renders nothing, and a story shows both.

## Read before planning, 2026-09-15

- **The code.** `Modal.tsx` takes `title: string`, labels MUI's Dialog with `aria-labelledby`
  pointing at the header's title, and renders whatever it is given, so a title of nothing or of
  spaces leaves the dialog without an accessible name, which ARIA requires a dialog to have.
  `PanelModal.tsx` has the same `title: string` and its own `aria-labelledby`.
- **The type cannot refuse it.** Every title the product passes is `i18n._(...)`, a `string` known
  only at run time.
- **How the repository refuses a misused component.** `shared/console-guard.ts`'s `report`, the
  product's own marked `console.error`, in every build, as the Tooltip, the Icon Button and the
  Checkbox use it. Nothing in `apps/web/src` throws in development only, and no unit test renders a
  component, so a story shows it, holding the product's marked errors back with `passOnUnmarked`.

## The approach

1. **The story first.** `ReportsABlankTitle` opens the modal's trigger with a title of one space and
   its Controls off, holds back the product's marked errors, waits for the report that the title is
   blank, then presses the trigger and reads that no dialog appears.
2. **Before the fix**, the Modal stories run against the component as it is, and the new story must
   fail alone, waiting for a report that never comes.
3. **The fix.** `Modal` reads whether its title is blank, reports it from an effect keyed on that,
   and renders nothing, after its hooks, so no unnamed dialog reaches a reader. Under React's
   StrictMode in development the effect runs twice on mount and may report twice; the plan claims
   no more than that the report is made.
4. **The words.** Both story docs' `title` entry says a blank title is reported and no dialog is
   drawn, and the story gets its entry. The card's exit is edited as above.
5. **PanelModal** has the same gap and is filed as its own card.

## File by file

- `apps/web/src/shared/modal/Modal.stories.tsx`
- `apps/web/src/shared/modal/Modal.tsx`
- `apps/web/src/shared/story-docs/en/Shared-Modal.md` and `fa/Shared-Modal.md`

## How I will know it works

- `ReportsABlankTitle` fails alone against the component as it is, and after the fix the Modal
  stories pass, with the stories of the modals built on it.
- The unit project, the docs guard among it, lint and tsc are clean.
- Seen in the dev Storybook: the blank-titled story in fa-IR, its report at the console and no dialog
  after the trigger, and a titled modal opening named, in fa-IR and en-US.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

It did not approve the plan as first written, which reported a blank title and still drew the
dialog: a report alone leaves the unnamed dialog in front of a reader, the state the card exists to
prevent. It asked for report and omit, the story reading that no dialog renders, and the exit edited
to say so, since a report is not what the filed exit names and a development-only throw would need
an error boundary, stop the development screen and leave production drawing the bad dialog. It
found the claim of one report per title untrue under the app's StrictMode, which runs an effect
twice on mount in development, and `passOnUnmarked` sound if installed before mount and restored.

Judged:

1. **Report and render nothing: taken**, approach step 3.
2. **Edit the exit: taken**, as above.
3. **Once per title: taken as a correction.** The claim is dropped; no ref guard is added, since the
   repository already accepts a development diagnostic said twice under StrictMode.
4. **`passOnUnmarked` before mount: already the plan**, through the story's `beforeEach`.

## Result, 2026-09-15

Built as planned after the review.

- Against the shell as it was, `ReportsABlankTitle` failed alone, waiting for the report, and the
  other five Modal stories passed.
- After the fix the Modal stories pass, six of six, and the Confirm, Change Status and Settings
  dialogs built on the shell, eleven of eleven; the unit project, 1494 of 1494, lint and tsc are
  clean.
- Seen in the dev Storybook: `ReportsABlankTitle` opens no dialog, its report held back from the
  page's console by the story's own capture, which a first look expected to see there and did not;
  `InEnglish` given a title of one space through Storybook's preview reports it at the console and
  opens no dialog; `InEnglish` as it is and `Default` in fa-IR dark open named, with no report.
