# KN-559 - AddJobModal's Review story asserts a 606 tall modal, which Storybook's manager canvas cannot hold

## The card

**Why.** Once KN-494 is fixed the story still fails for every reader of the published Storybook, and
the size it asserts depends on a window the reader chooses rather than on the component.

**Exit.** `Review` states the room its size assertion needs, through its viewport parameters or by
asserting against the room it is given, and passes inside the manager of a production Storybook
opened at 1280 by 720, bare, and in the Vitest runner.

A child of KN-013, from KN-226's measurement.

## Measured before planning, 2026-09-16

- **The assertion.** `AddJobModal.stories.tsx` line 192: `Review` reads the dialog's box and asserts
  it equals `[560, 606]`, node 150:94's frame. Its `parameters` are `FIXED`, which is
  `controls: { disable: true }` and says nothing about room.
- **The same story, four ways, in the dev Storybook**, each read from the dialog and its MUI
  container:
  - inside the manager at 1280 by 720: the dialog is 560 by **316**, its container 980 by 380, and
    the preview's own height 380;
  - inside the manager at 1440 by 900: 560 by **496**, the container 560 tall;
  - bare at 1280 by 720, and bare at 1440 by 900: 560 by **606** both times.
- **Why.** The Paper's `max-height` is MUI's `calc(100% - 64px)`, so the drawn height is
  `min(606, room - 64)`: 380 less 64 is 316, and 560 less 64 is 496, exactly what was read.
- **Where it passes today.** The runner gives every story 1440 by 900 through the storybook
  project's `contextOptions.viewport`, KN-304, so the story passes there; KN-226's check opens
  `iframe.html` bare at Playwright's 1280 by 720, where the preview is the whole page and the dialog
  is 606. A reader opening the manager is the one who meets the failure.
- **Reproduced in a production build**, `storybook build` served over http and opened at 1280 by
  720: inside the manager the dialog is 560 by 316 with 380 of room and the play throws "expected
  [ 560, 316 ] to deeply equal [ 560, 606 ]"; bare, it is 560 by 606 and the play reports no
  failure. The dev Storybook's manager gives the same two readings, so a plant can be judged there
  rather than by a rebuild of minutes.
- **`JobModal`'s `Info` asserts `[720, 617]`** in the same shape, with `FIXED` and no room stated.
  KN-226's table has JobModal's stories failing inside the manager on KN-494 first, so whether its
  size assertion also fails there is not yet known, and it is not this card's exit.

## The approach

1. **The story asserts what the design draws, and the cap where there is no room for it.** The width
   stays 560, node 150:94's. The height is `Math.min(606, window.innerHeight - 64)`, written out,
   with a comment naming the frame's 606 and MUI's rule; and the dialog's computed `max-height` is
   asserted as the text MUI gives, `calc(100% - 64px)`, so a library that changed its cap fails the
   story for a reader to judge rather than being followed in silence. The number is not read from
   that computed value: a computed `max-height` is not one of CSSOM's used-value cases, so it is no
   dependable pixel count.
2. **Proved where the card asks.** The story runs in the Vitest runner; and a script opens it in a
   **production** Storybook build, once inside the manager at 1280 by 720, where it fails today, and
   once bare, reading the same numbers the measurement above did.
3. **A plant**: the flat `[560, 606]` put back fails inside the manager and passes bare, which is
   the shape the card reports.

## What I will change

- `apps/web/src/shared/add-job/AddJobModal.stories.tsx`

The docs pages stay as they are: both `Review` entries say the form is filled, corrected and saved,
and neither names a height, read 2026-09-16.

## What I expect to be hard, and what I am unsure of

- **A conditional assertion can hide a regression.** If the modal grew past 606 where there is room,
  the lesser of the two would still read 606 on a short canvas. The story runs in the runner at 1440
  by 900, where the room is 836 and the assertion is the flat 606, so the design's number is still
  checked wherever it can be.
- **MUI's cap is asserted, not adopted.** The story writes the arithmetic out and asserts the cap's
  own text, `calc(100% - 64px)`, so a library that changed the rule fails the story for a reader to
  judge rather than being followed in silence. Reading the number out of the computed style would
  have done the opposite, and a computed `max-height` is no dependable pixel count in any case.
- **A production build takes minutes.** The dev Storybook's manager draws the same chrome, so the
  measurement above already shows the failure; the card asks for the production one, and that is
  what the proof will open.
- **`JobModal`'s `Info`** may hold the same defect. It is not in this card's exit; if the production
  run shows it failing inside the manager on its size, it is filed as its own card.

## How I will know it works

- The story passes in the Vitest runner, with the AddJobModal stories around it.
- In a production Storybook build it passes inside the manager at 1280 by 720 and bare, and with the
  flat 606 planted back it fails inside the manager, which is the card's own report.
- tsc and lint pass; no changed file's Prettier drift grows, and this plan's is 0.

## Plan review, 2026-09-16, Codex gpt-5.6-terra

Not approved as written; one narrow amendment, taken above. The adaptive assertion is the right
choice and a forced viewport is not: it tests the room a published manager actually gives a story,
and Storybook 10's viewport feature resizes the preview through a `globals.viewport` setting, with
`parameters.viewport` only defining the options. The amendment: do not derive the cap by reading
`getComputedStyle(dialog).maxHeight`, since a computed `max-height` is not one of CSSOM's
used-value special cases and so is no dependable pixel number. Write the arithmetic out,
`Math.min(606, window.innerHeight - 64)`, with a comment naming MUI's rule, and assert the cap's
text where it is wanted, so a changed rule fails for review rather than being adopted in silence.
With that, the manager run at 1280 by 720, the bare production run, the runner's own assertion and
the flat 606 plant establish the exit, and the runner still checks the design's 606 unconstrained at
1440 by 900. `JobModal`'s suspected analogue stays separate until its own failure is seen. The
amended plan goes back to it before building.

## Second plan review, 2026-09-16, Codex gpt-5.6-terra

Not approved yet, over one stale sentence: step 1 asserts MUI's cap so a changed rule fails for
review, while "What I expect to be hard" still said the computed style would make the story follow a
changed rule rather than fail. That paragraph now says what step 1 says, and the file list drops the
docs pages, whose `Review` entries name no height, read today. Otherwise it judged the adaptive
assertion the smallest honest solution, checking the design's 606 where the runner has room and the
capped height in the manager at 1280 by 720; a production build stays necessary because the exit
names it, the dev manager being for judging a plant quickly; and `JobModal`'s `Info` stays separate
until its own failure inside a manager is shown. The corrected plan goes back to it before
building.

## Third plan review, 2026-09-16, Codex gpt-5.6-terra

Approved. It read both `Review` docs entries itself and found they describe the filled, corrected,
saved form and no dimension, so leaving them out is right. The adaptive assertion checks the frame's
606 where the runner has room and MUI's cap where a published manager does not, and asserting the
cap exactly keeps an MUI change from passing in silence. The production-manager run and the flat
height planted back prove the reported failure and its fix, and `JobModal`'s `Info` is rightly out
of scope until its own behaviour inside a manager is measured.

## Built, 2026-09-16

- **The story.** `Review` asserts the width 560 and the height
  `Math.min(606, window.innerHeight - 64)`, written out, with a comment naming node 150:94's frame,
  MUI's rule and the manager's 380 at 1280 by 720; and it asserts the dialog's computed `max-height`
  is MUI's own `calc(100% - 64px)`, so a changed cap fails the story rather than being followed.
- **The cap's text is a typed constant**, against the two values the property reads here, MUI's cap
  or the `none` of a Paper under none. A bare literal written `as const` is refused by the
  repository's own rule, KN-217, and a type of one literal is refused by `prefer-as-const`, so the
  union is what satisfies both and keeps the string out of the lingui rule's way.
- **Proof in the dev Storybook**, manager and bare at 1280 by 720: with the change the play reports
  no failure in either, the dialog drawn 560 by 316 inside the manager, where the preview is 380,
  and 560 by 606 bare. With the flat `[560, 606]` planted back it fails inside the manager with the
  card's own message and still passes bare; `AddJobModal.stories.tsx` was put back and its hash
  checked.
- **Proof in a production build**, `storybook build` served over http at 1280 by 720: the play
  reports no failure inside the manager, 560 by 316, nor bare, 560 by 606. The same build before the
  change threw "expected [ 560, 316 ] to deeply equal [ 560, 606 ]" inside the manager.
- **Checks.** The AddJobModal stories pass in the runner, 18 of 18, where the page is 1440 by 900
  and the whole 606 is what the assertion comes to; tsc and lint pass; drift is 0 on the story and
  on this plan.
