# KN-336 - A sort change is read out twice, and the keyboard story never shows the new order on the control

## The card

A child of KN-024, found by its roast.

**Why.** An announcement said twice is noise, and a story that never shows the change it claims
proves half of it.

**Exit.** A change is read out once, by the focused control or by the status but not both, and a
story holding the value in state shows the new order on the closed control.

## Read before planning, 2026-09-15

- **The code.** `SortControl.tsx` keeps a status region in the page from the start, empty, and its
  `onChange` writes «مرتب‌شده بر اساس» and the order into it before handing the order on. MUI's
  Select then closes the list and puts focus back on the combobox.
- **What the focused control says.** Measured with Playwright's accessibility snapshot in the dev
  Storybook: the combobox is named by its prefix, «مرتب‌سازی:», and its value is «مرتب‌سازی:
  تازه‌ترین», the order in use; in English, "Sort:" and "Sort: Newest". The control that takes
  focus back already carries the new order, and the status says it a second time.
- **No change without the list.** MUI 9's Select tries a closed type-ahead on the combobox, but
  reads each option's text from its React children, `getTextFromReactNode(child.props.children)`
  in `closedTypeahead.js`, and the Sort Control's rows are an `OptionLabel` whose name is a prop,
  so no option has text and none matches. Measured: a letter typed on the closed control, in
  Persian and in English, changed nothing. Every change is made in the open list, and focus comes
  back to the control after it.
- **The status keeps its text**, so the same order chosen again, which the story's fixed value
  allows, writes the same text and is not read.
- **The story.** `ChangedByKeyboard` passes a fixed `value` and `fn()`, so after Enter the closed
  control still shows «تازه‌ترین»; it checks the callback and the status.
- **Elsewhere.** The board screen's own status region speaks only for a card moved between
  columns, and `Sorted by` is used by the Sort Control, its story and the two catalogs alone.
  DESIGN.md says a change is read out from the status region.

## The approach

1. **The story first.** `ChangedByKeyboard` renders the control inside a holder that keeps the
   order in state and hands each change on to the story's `onChange`, its Controls off, since its
   play starts from newest. After Enter the play reads, as it does, the callback, the list gone and
   focus on the combobox, and then that the closed control shows «قدیمی‌ترین» and that no status
   region in the canvas says the change again.
2. **Before the fix**, the Sort Control stories run against the component as it is, and
   `ChangedByKeyboard` must fail alone, at the status region it finds.
3. **The fix.** `SortControl.tsx` loses its status region and the state that fed it, so the
   change is read once, by the combobox focus comes back to. `Sorted by` leaves both catalogs.
4. **The words.** Both story docs: the introduction says a change is read out once, by the control
   focus comes back to, and `ChangedByKeyboard` says the closed control shows the new order.
   DESIGN.md's Sort Control paragraph says the same in place of the status region.

## File by file

- `apps/web/src/shared/sort-control/SortControl.stories.tsx`
- `apps/web/src/shared/sort-control/SortControl.tsx`
- `apps/web/src/i18n/locales/en-US.ts` and `fa-IR.ts`
- `apps/web/src/shared/story-docs/en/Shared-SortControl.md` and `fa/Shared-SortControl.md`
- `DESIGN.md`

## What I expect to be hard, and what I am unsure of

- **Which of the two goes.** The exit allows either. The control is read in any case, since focus
  comes back to it after every change and a screen reader reads what takes focus; keeping the
  status instead would mean sending focus somewhere other than the combobox, which the combobox
  pattern returns it to. So the status goes.
- **What a story can prove.** No screen reader runs here. The play proves the two facts the
  reading rests on: the control that holds focus after the change shows the new order, and no
  status region repeats it.
- **A closed type-ahead that works one day.** If the rows ever hand MUI text children, a letter on
  the closed control would change the order with focus never leaving it, and whether a screen
  reader then reads the focused combobox's new value is not measured here. Today it cannot happen,
  measured, and the plan records it rather than guarding against it.

## How I will know it works

- `ChangedByKeyboard` fails alone against the component as it is, at the status region, and passes
  after the fix with the other three Sort Control stories.
- The unit project, the catalog test and the docs guard among it, lint and tsc are clean.
- Seen in the dev Storybook: an order chosen by the keyboard in fa-IR light and dark, the closed
  control showing it with focus on it and no status region in the canvas, and the English control
  unchanged.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

It agreed the direction is the smallest change that meets both halves: MUI 9.4 calls the parent's
`onChange` before it closes the list, its focus trap gives focus back to the combobox, and with
the holder the control already shows the new order when focus lands, as the select-only combobox
pattern has it. It read the closed type-ahead the same way, every row's text empty since
`OptionLabel` takes its name as a prop, and called the story honest proof of what a browser test
can prove, its Controls off as planned. It asked that the evidence not claim NVDA, JAWS or
VoiceOver spoke the change, and that a manual check with those three follow the build.

Judged:

1. **Claim the structure, not the speech: taken.** The plan already says no screen reader runs
   here, and the commit, the close and the docs say that the focused control shows the new order
   and that no status region repeats it, not what a screen reader said.
2. **A manual check with NVDA, JAWS and VoiceOver: not taken.** None of the three runs where this
   is built, as KN-326 recorded, so the card closes on what can be measured and says so.

## Result, 2026-09-15

Built as planned after the review.

- Against the component as it was, `ChangedByKeyboard` failed alone, at its read of the status
  region, the one it found; the holder already had the closed control showing the order chosen.
- After the fix the Sort Control stories pass, four of four, and lint and tsc are clean. The unit
  project passes 1494 of 1494, two fewer than before: `catalog.test.ts` makes two tests for every
  id the code uses, one for each catalog, and `Sorted by` is no longer used.
- Seen in the dev Storybook: `ChangedByKeyboard` in fa-IR light and dark, the play's order and a
  second one chosen by the keyboard each shown on the closed control with focus on it and no status
  region in the page, and the English control unchanged, with no console error or warning.
