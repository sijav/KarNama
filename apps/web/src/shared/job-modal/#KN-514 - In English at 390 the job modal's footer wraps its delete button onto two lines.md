# KN-514 - In English at 390 the job modal's footer wraps its delete button onto two lines

## The card

**Why.** A two-line destructive button looks broken and pushes the footer's actions out of line on
the phone an English reader uses.

**Exit.** At 390 in en-US the footer's three actions each keep one line and the Button's height, and
a story at that width asserts it.

## Measured before planning, 2026-09-15

- **English at 390 by 844**, the Job Modal's `InEnglish` from the dev Storybook: the dialog and its
  footer are 358 wide, the footer's inline padding 24 a side leaving 310, one row with no wrap.
  Cancel is 75 wide and Save 62, each on one line; the delete, «Delete job opportunity», is squeezed
  to 149 and its label takes **two lines**, counted from its text's line boxes.
- **The card's other claim does not hold today.** The delete's box stays 44 tall, the Button's fixed
  M height, so the second line overflows the box rather than growing it.
- **Persian at 390**, the fa-IR `Info`: Cancel 71, Save 64 and «حذف فرصت شغلی» 137, all on one line
  in one row.
- **Why it wraps.** The footer in `JobModal.tsx` is a flex row, `nowrap`, the start group of Cancel
  and Save then the delete, 12 apart. The Button sets `minWidth: 0`, so under the row's squeeze the
  delete shrinks below its label and wraps it, where a fixed-height Button has no room for a second
  line.
- **The file** draws the footer in Persian alone, `210:86`: Cancel and Save at the inline start and
  the delete at the inline end. How it yields in English is this card's to decide.

## The approach

1. **The story first.** `InEnglishOnAPhone` opens `Info` in en-US at 390 by 844, resizing the runner's
   own page as `Phone` does, and reads each of the footer's three buttons: one line, by the line boxes
   of its label's own text node, and 44 tall; and the delete's inline end 24 from the footer's, the
   footer's padding. It should fail today on the delete's two lines.
2. **The footer wraps rather than squeezing.** Its row takes `flexWrap: 'wrap'`; the start group and
   the delete take `flexShrink: 0`, so neither is squeezed below its content; and the delete, in a
   box of its own since the Button takes no `sx`, takes `marginInlineStart: 'auto'`. When the three
   do not fit on one row the delete moves to a second, 12 below, and the auto margin keeps it at the
   inline end, where the file puts it: `space-between` alone would leave a lone item at the start of
   its line. Where they fit, Persian at 390 and every width above, nothing moves.
3. **The docs**: both Job Modal pages gain the story's entry.
4. **A look** at the footer at 390 in en-US and fa-IR, light and dark.

## What I will change

- `apps/web/src/shared/job-modal/JobModal.tsx`
- `apps/web/src/shared/job-modal/JobModal.stories.tsx`
- `apps/web/src/shared/story-docs/en/Shared-JobModal.md`, `apps/web/src/shared/story-docs/fa/Shared-JobModal.md`

## What I expect to be hard, and what I am unsure of

- **The Button itself lets a label wrap.** Its fixed heights leave no room for a second line anywhere,
  so `whiteSpace: nowrap` on the Button would be true to the file for every Button. It would also
  change every other place a label now wraps quietly, which is a wider change than this card, so
  this keeps to the footer and the question is the review's.
- **Keeping the delete at the inline end on its own row**, rather than where a wrapped row would put
  it, the start, is the reading of the file that the delete sits apart at the end.
- **The footer grows** by a row, 56, in English at 390, which the modal's height takes from the
  scrolling body.

## How I will know it works

- The story fails before the change, on the delete's two lines, and passes after it.
- The Job Modal's stories pass, `Phone` among them in Persian; tsc, lint and the unit project pass,
  the docs guard among them; and no changed file's Prettier drift grows.
- The look shows every footer button on one line at 390, in both languages and both schemes.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Not quite as written, and its amendment is taken above: wrapping alone does not keep a lone delete
at the inline end, since `space-between` shares out the free space within each line and leaves a
single item at its start, so the delete takes a logical `marginInlineStart: 'auto'` and both it and
the start group take `flexShrink: 0`. With that, it found this the smallest fix: `whiteSpace: nowrap`
on every Button would change unrelated controls, and a shorter label or smaller padding changes the
content or the layout rather than letting the footer yield; the delete keeping the inline end
follows the file's separate destructive action, where full width would be a different design. The
line count is sound in Chromium when the range covers the label's text, and the 44 completes the
proof. The modal stays 617 tall at 390 by 844, its limit 812, so the extra row comes out of the
scrolling tab panel; the look confirms Info stays usable. The amended plan goes back to it before
building.

## Second plan review, 2026-09-15, Codex gpt-5.6-terra

Approved as amended. The auto margin and `flexShrink: 0` close the only gap: in English at 390 the
delete wraps rather than being squeezed and keeps the inline end on its own line, Persian still
fits on one row, and the change stays in this footer. The text node's line count with the 44 is a
sound proof in Chromium, and the modal keeps its 617, the extra row coming out of the tab panel. Its
reminders are kept: the story puts the viewport back in `finally`, as `Phone` does, and measures the
label's text node, not the button's box.

## Built, 2026-09-15

- **The story first.** `InEnglishOnAPhone` was written before the change and failed on the delete's
  label, "expected 2 to be 1", its two lines counted from the line boxes of its text node.
- **The footer** in `JobModal.tsx` takes `flexWrap: 'wrap'`, the group of Cancel and Save takes
  `flexShrink: 0`, and the delete sits in a box of its own with `flexShrink: 0` and
  `marginInlineStart: 'auto'`, each with a comment saying why.
- **The story** opens `Info` in en-US at 390 by 844 on the runner's own page, reads Cancel, Save and
  the delete each on one line and 44 tall and the delete's end 24 from the footer's, and puts the
  viewport back in `finally`. Lint flagged the three labels read through `english._()`, since the
  Lingui rule knows a message only by `i18n._()`, so the story binds `const i18n = english`.
- **The docs**: both Job Modal pages gain the story's entry.
- **Checks.** The Job Modal's 17 stories pass, `Phone` among them; tsc and lint pass; the unit
  project's only failures were two timeouts in `session.test.ts` under the full run's load, KN-551,
  and the file passes alone, 2 of 2; no changed file's Prettier drift grew, and this plan's is 0.
- **The look at 390 by 844** from the dev Storybook. In en-US, light and dark, the footer is 132
  tall: Cancel and Save on its first row, the delete on its second 56 below, its end 24 from the
  footer's, every label on one line and 44 tall. In fa-IR, light and dark, it is 76 with the three
  on one row as before. The dialog is 617 in all four, and no page reported an error.
