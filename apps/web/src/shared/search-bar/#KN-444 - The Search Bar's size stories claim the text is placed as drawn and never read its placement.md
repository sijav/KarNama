# KN-444 - The Search Bar's size stories claim the text is placed as drawn and never read its placement

## The card

**Why.** A story that claims more than it checks is the same defect as an assertion that cannot
fail, and this pair was written FOR the placement.

**Exit.** Both stories assert the text's top offset and the icon's vertical centring against the
file's numbers.

## Measured before planning, 2026-09-15

- **The file, read with get_metadata.** The board's toolbar instance `241:29` and the contacts'
  `252:48` are 320 by 36: the text layer 22 tall at y 7, the 20 Search Icon at y 8. The phone's
  `241:156` is 358 by 44, and so are the set's own Default `155:86`, Focus `155:89` and Filled
  `401:437` at 320 by 44: the text 22 tall at y 11, the icon at y 12, and Filled's 20 Clear frame
  `401:441` at y 12 too. So the text's top is 7 or 11, and each 20 square is centred, (36 − 20) / 2
  and (44 − 20) / 2.
- **The build already draws it.** Measured in the dev Storybook with Playwright at 1280 by 900: in
  `OnTheDesktop` the input is 22 tall and 7 below the bar's top, and the icon 8 below it; in
  `OnAPhone` and `InEnglish`, 44 tall, the input is 22 tall at 11 and the icon at 12, right to left
  and left to right. The input has no padding and Body's line height, 22, so its box is the text's
  line box.
- **What the stories read.** `isTheFiles`, which Default, Focused, Filled, InEnglish, OnTheDesktop
  and OnAPhone all call, reads the bar's height and radius, the icon's size, colour and inline
  offset, and the field's inline gap from the icon; the two size stories add the bar's width.
  Nothing reads where anything sits vertically, so a bar that put its text at its top would pass all
  six.

## The approach

1. **The reads go in `isTheFiles`**, since both stories call it with their height: the input's top
   below the bar's top, its height, which is Body's line height from the tokens, and the icon's top
   below the bar's top. Every story that calls it then reads them, Focused's "nothing inside moves"
   included.
2. **The file's numbers are named once**, beside the heights they belong to, from the nodes above:
   the text at 7 and the icon at 8 in the 36 bar, the text at 11 and the icon at 12 in the 44. The
   helper takes them for the height it is given, and refuses a height the file does not draw.
3. **Filled also reads the clear control's top**, 12, as `401:441` draws it, beside the size it
   already reads.
4. **The mutations**, each written into `SearchBar.tsx`, run against the Search Bar's stories, and
   put back byte for byte: the bar's `alignItems` from centre to the start; the field's line height
   from 22 to 24; and a padding of 4 at the bar's block start. Each leaves every read the stories
   make today passing, since the bar keeps its fixed height and its inline offsets, and each must
   fail `OnTheDesktop` and `OnAPhone` on a new read.

## What I will change

- `apps/web/src/shared/search-bar/SearchBar.stories.tsx`

## What I expect to be hard, and what I am unsure of

- **Nothing a reader sees changes**, since the build already draws the file's numbers, so no story
  fails first: the mutations are the proof that the new reads can fail.
- **The input's box stands for the text.** Chromium lays an input's text on one line box of its
  line height, and the runner is Chromium alone. Whether the placeholder and typed text sit the
  same way in it is one of the questions for the review.
- **Exact numbers.** Every offset is a whole pixel, 36 − 22 and 44 − 22 halved, so the reads are
  exact rather than rounded.

## How I will know it works

- The Search Bar's stories pass, the six calling `isTheFiles` reading the new offsets.
- Each of the three mutations fails `OnTheDesktop` and `OnAPhone` on a vertical read.
- tsc, lint and the unit project pass, since the unit project's guards read the story files, and
  the story file's Prettier drift does not grow.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved. The input's box is the right stand-in for the text: it has no padding and no wrapper
round its text, its 22 is the text layer's height, and no DOM interface gives an input's glyphs a
box of their own, while a single-line input centres what it holds, the placeholder and typed text
alike, since nothing here places the placeholder apart. The reads belong in `isTheFiles`, where
every state already claims the placement, and refusing a height the file does not draw keeps a
third geometry from being invented. The three mutations are enough, and independent of one
another. Its one warning is kept: the search icon stays the bar's first `svg`, read apart from the
clear control, never one of all its `svg`s.

## Built, 2026-09-15

- **The reads are in `isTheFiles`.** After the inline reads, the helper reads the input's top below
  the bar's top, its height against Body's line height from the tokens, and the icon's top, against
  `DESKTOP_PLACED` or `MOBILE_PLACED` for the bar's height. `placedIn` gives the one for a height and
  refuses a height the file does not draw. Filled also reads its clear control's top.
- **Before the change, the card was right.** The three mutations, the bar's items aligned at the
  start, the field's line height at 24, and 4 of padding at the bar's block start, each left all
  ten Search Bar stories passing.
- **After it, each fails.** With the reads in, the ten pass as they stand, and each mutation fails
  the six stories that call `isTheFiles`, `OnTheDesktop` and `OnAPhone` among them. Those stories
  changed only by the new reads, so it is the new reads that fail. `SearchBar.tsx` was put back byte
  for byte, checked by hash.
- **Checks.** tsc and lint pass. Prettier drift is unchanged: the story file 2, and this plan 0.
- **Tests.** The unit project passed except `session.test.ts`, whose two tests overran their 5 s
  in the full run, KN-551, and passed alone.
- **No look.** Nothing a reader sees changed, since the build already drew the file's numbers.
