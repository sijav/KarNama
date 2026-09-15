# KN-570 - JobsScreen's stories offer the add modal's addOpen control, which breaks all sixteen of their plays

## The card

**Why**, from the board: A reviewer who changes the board's addOpen in Controls
and presses Rerun sees the story fail when the component is not broken, so the
Interactions panel's ticks stop describing the story on screen, as in KN-247 and
KN-255.

**Exit condition**, from the board: Every story with a play function in the
JobsScreen story file reads its expectations from the active args or offers only
the controls its assertions hold for; KN-247's sweep over every story, each
offered control changed by its type, finds none of them broken; and those stories
pass under Vitest.

Filed from KN-255's measurement.

## Measured, 2026-09-15

`node agent/scripts/storybook/controls-sweep.mjs` over every story of a production
Storybook of 97ce2e9. `Screens/Jobs` has 21 stories, 19 with a play, and the only
control any of them offers is `addOpen`, a boolean; the callbacks are `fn()` args
with no editor. Under `addOpen` flipped:

- **16 plays fail**: Adding, AddingFromEmpty, AddingFromTheAddress, BackingOut,
  Board, ChangedInAnotherTab, Empty, FocusAfterDeleting,
  FocusAfterDeletingInAColumn, FocusWhenTheOpenerSurvives, Managing, People,
  RecolouringKeepsItsPlace, Selecting, SelectingWhileSearching and Working.
- **3 plays hold**: OnAPhone, SelectingOnAPhone and UncheckingOnAPhone.
- **2 stories have no play**: DragAndDrop and InEnglish.

## What is there

- The meta, `JobsScreen.stories.tsx` lines 39 to 54: `parameters: { layout:
'fullscreen' }`, `args: { addOpen: false, ...callbacks }`, no `argTypes`, and a
  decorator seeding each story's records.
- `AddingFromTheAddress` sets `addOpen: true`, the address opening the add flow;
  every other story starts with it closed, and the ones that add open it from the
  board's own button.
- The Docs page's Controls are the first story's, `Board`, whose play fails under
  `addOpen`.
- The add flow has stories of its own, `Shared/AddJobModal`.

## The approach

1. **The meta excludes `addOpen` from Controls**, `controls: { exclude: ['addOpen']
}` beside `layout`, with a comment: each story walks a scenario that opens the
   add flow from the board or never opens it, or, `AddingFromTheAddress`, starts
   with it open, so a control opening it from outside is untrue for their plays.
   The prop leaves the Docs page's Controls table too; its entry in `story-docs`,
   which the page draws as prose, stays.
2. **Nothing else changes.** The three phone stories, whose plays hold, and the
   two without a play lose a toggle they could have kept; the add flow's own
   stories show it opening.

## How I will know it works

- Red before: the measurement above.
- `controls-sweep.mjs --only '^screens-jobs--'` on a fresh build of the change:
  no story broken, none offering a control.
- The JobsScreen stories under Vitest, the unit project, eslint, tsc.
- The Jobs Docs page in both languages, its Controls table read.

## What I am unsure of

- **Keeping `addOpen` on the five stories it does not break**, the three phone
  stories and the two without a play, against one line on the meta. A story's
  `controls` object merges with the meta's and its `exclude` array replaces the
  meta's, so offering it again would be `exclude: []` on each of the five.
- **Whether a later editable prop** added to JobsScreen would then be offered on
  every story unchecked: the exclude names `addOpen` alone, and the sweep is what
  would find it.

## Plan review, Codex, 2026-09-15

Sound: exclude `addOpen` once on the meta. No JobsScreen story reads it from its
args or relies on it being editable, and the docs describe the prop without
calling it a control; AddJobModal's own stories offer `open`. One false claim,
corrected above: an excluded arg leaves the Docs page's Controls table as well,
rather than keeping a row with no editor, while the page's markdown still
describes it. Storybook 10.5.10 applies a meta's parameters to every story, merges
objects and replaces arrays, so a story's `exclude: []` would offer it again; it is
not added back to the five stories it does not break. A later editable prop would
be offered unchecked, which the sweep is there to find.

## Result, 2026-09-15

**Built**: the meta's parameters exclude `HIDDEN_CONTROLS`, a
`(keyof JobsScreenProps)[]` holding `addOpen`, under the comment. It is a typed
list and not `['addOpen']` because the lingui rule refused the bare string: its
structural names exempt `include` and not `exclude`. SettingsDialog's stories
name their hidden control the same way.

**Checked**:

- `controls-sweep.mjs --only '^screens-jobs--'` on a fresh build of the change: 21
  stories, 19 with a play, none offering a control, none broken, nothing unapplied
  or untried, none failing with nothing changed. Red before: 16 broken under
  `addOpen`, KN-255's measurement.
- The JobsScreen stories under Vitest, 21 of 21; the unit project 1383; eslint and
  tsc clean; the formatter at HEAD's drift, 4.
- The Jobs Docs page in both languages: its Controls table lists `onAddClose`,
  `onSelecting`, `onSignOut` and `onExtract`, none with an editor, and no
  `addOpen`; the Props prose keeps `addOpen`'s entry.
