# KN-359 - The add modal's Paste step is 398 tall where the file draws 401: its label keeps the Input's 16

## The card

A child of KN-029, found by its roast.

**Why.** Match the design exactly is the standing rule, and the difference is measurable.

**Exit.** Paste, PasteFilled and Error measure the file's 401, 401 and 423 with the label on its 19,
and the Input's own label stays 16 everywhere else.

## Measured before planning, 2026-09-15

- **In the file**, with use_figma: Paste `166:62` and PasteFilled `371:422` are 401 tall and Error
  `304:2` is 423. Their label, `166:68`, is Vazirmatn Medium 12 in `color/text/primary` at Figma's
  automatic line height, 19 tall, with no letter spacing, and bound to no text style. The Input
  set's label, `95:4`, is 12 on 16 with 0.2 of letter spacing, bound to the Label style.
- **The field's group adds up.** Paste's Field Wrap, `166:67`, is 215: the label 19, the textarea
  140, the helper 22 and the way round 22, with 4 between each. Error's, `304:7`, is 237, since its
  message runs two lines of 22.
- **As built**, in the dev Storybook: the paste label is 16 tall on a 16 line, and the Paste and
  PasteFilled dialogs are 398. The Error story read 398 there too, which its own story is to read
  again, since the Error step should be 22 taller.
- **CSS cannot say "automatic" here.** `line-height: normal` gives Vazirmatn Variable 18 at 12
  Medium, not the file's 19, while it gives 22 at 14 Regular, as the file does.

## The rule this meets

DESIGN.md section 1 and `tokens.ts` allow five type roles and only five, since `Body/Small` was
deleted. The paste label is not a sixth size: it is the Label's size and weight on the automatic
line and without spacing, drawn by one text node bound to no style. `tokens.ts` already names six
shadows bound to no effect style for the surface that draws each; this label is named the same way,
beside the five roles and not among them.

## The approach

1. **The stories first.** `AddJobModal.stories.tsx`: `Paste`, `PasteFilled` and `ErrorStep` read
   the dialog at 401, 401 and 423 and the paste label's box at 19. `Input.stories.tsx`: a
   `PasteLabel` story reads the label at 19 with no letter spacing when given the paste label, and
   at 16 with 0.2 without it. Run against today's code first; the heights must fail.
2. **The token.** `tokens.ts` names the text bound to no style, `unstyledText.pasteLabel`, 12 on
   19 at weight 500 and no letter spacing, with node `166:68` and KN-359 in its comment.
3. **The Input** takes `labelStyle`, `'field'` by default for the Input set's label and `'paste'`
   for the paste field's, and its label reads the matching style.
4. **The add modal** gives its paste field `labelStyle="paste"`.
5. **The words.** DESIGN.md section 1 names the paste label after the five roles; the add modal's
   paragraph stops saying the code keeps 16 and Paste is 398. Both Input story docs describe
   `labelStyle` and `PasteLabel`.

## What I will change

- `theme/tokens.ts`, `shared/input/Input.tsx`, `shared/add-job/AddJobModal.tsx`
- `shared/input/Input.stories.tsx`, `shared/add-job/AddJobModal.stories.tsx`
- `story-docs/en/Shared-Input.md`, `story-docs/fa/Shared-Input.md`, `DESIGN.md`

## What I expect to be hard, and what I am unsure of

- **The token guard and the five roles.** A guard may read `tokens.ts` or DESIGN.md's table and
  refuse a sixth entry; the name has to sit outside `type`.
- **The Input's Controls.** Its stories offer listed controls, KN-255, and `Default` keeps every
  control that holds, so `labelStyle` joins the lists only where the play holds for it.
- **The prop's name.** `'field' | 'paste'` names the design's two nodes; a caller other than the
  paste field has no reason to set it.
- **Points.** The card has 1; a token, a prop, four stories and three documents make 2.

## How I will know it works

- The three add modal stories fail against today's code at their heights and pass after; the Input's
  `PasteLabel` passes, and every other Input story still reads its label at 16.
- The unit project with the docs and token guards, lint and tsc are clean; the Paste step is seen in
  fa-IR and en-US, light and dark.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Judged:

1. **Error, not taken: it rested on my wrong reading.** The review took the Error story's 398 from
   the dev Storybook and found no change in the plan that could reach 423. The stories written first
   read Error at 420 against today's code, so its message already runs two lines and the label's
   three pixels are the whole gap; Paste and PasteFilled read 398, as measured.
2. **Taken, as planned:** the paste label named outside the five roles, with a focused token test
   of 12, 19, 500 and 0 and its node; a fixed 19, since `line-height: normal` depends on the browser
   and the font; and `labelStyle`, `field` by default, kept out of the plays that cannot vary it,
   with the default label proved at 16 by `LabelIsBound`.

## Built, 2026-09-15

- **Stories first.** Against today's code Paste and PasteFilled read 398 and Error 420, each 3 short
  of the file, and the token test found no `unstyledText`; all of them pass now.
- **What the checks refused on the way.** tsc: the input barrel did not export `InputLabelStyle`.
  Lint read the `labelStyle = 'field'` default as copy, so it is bound to `FIELD_LABEL`, as `LATIN`
  is in the Contact Modal. The literal guard refused `'0.2px'` in the stories, and Chromium computes
  a zero letter spacing as `normal`, so the plays read numbers through the stories' `px`. The apply
  script sorted `type as typeScale` first in an import, which Prettier does not.
- **Not changed.** The five type roles; `LabelIsBound` proves the Input's own label at 16 with 0.2 of
  letter spacing.
