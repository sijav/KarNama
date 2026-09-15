# KN-304 - On a hovered or chosen tab the indicator paints over the focus ring's bottom edge

## The card

A child of KN-023, found by its roast.

**Why.** The focus ring should read as one unbroken ring; a hovered, focused tab shows it
cut along the bottom by the grey hover line.

**Exit.** A focused tab's ring is unbroken in every state, the indicator drawn beneath it
or clear of it, shown in a story that focuses a hovered tab and reads the ring's bottom
band as border/focus.

## Read before planning, 2026-09-15

- `Tabs.tsx` draws the ring on the tab's `::before` while it is `.Mui-focusVisible`: three
  pixels of `border/focus`, inset 1, radius `sm`, so on a 44 tall tab its bottom band is
  rows 40 to 42. The indicator is the tab's `::after`: two pixels at the bottom, 16 in from
  each side, rows 42 and 43, `border/default` on hover and `bg/brand/default` when chosen.
  Both are positioned with no `z-index`, and positioned boxes with none paint in tree order,
  so `::after` paints over `::before`.
- Measured in the running dev Storybook with Playwright, headless Chromium at a device scale
  of one, `TabReachesTheText` in Persian, a real Tab key, a real arrow and a real pointer,
  each tab screenshotted and its middle column read through a canvas:
  - light, focused and hovered: rows 40 and 41 `#2563eb`, row 42 `#e5e7eb`, row 43
    `#e5e7eb`. The indicator covers the ring's outermost bottom row.
  - dark, focused and hovered: rows 40 and 41 `#3670ed`, row 42 `#14161a`, row 43 `#14161a`.
  - dark, focused and chosen: rows 40 and 41 `#3670ed`, row 42 `#2d69ec`, row 43 `#2d69ec`.
  - light, focused and chosen: rows 40 to 43 all `#2563eb`, since `bg/brand/default` and
    `border/focus` are the same blue in the light palette, so no break shows there.
  - focused at rest: rows 40 to 42 the ring's colour, the indicator transparent.
- KN-023's plan recorded its plan review's warning that a hovered or active tab's indicator
  covers part of the ring's lower band, and set it aside as mattering only to an area claim.
- The file draws the Tab Item, `204:20`, as Default, Active and Hover, and no focus: the ring
  is KN-023's, drawn inside because the row clips. DESIGN.md has no paragraph on it.
- No story in the repository reads drawn pixels yet. The installed Vitest, 4.1.11, types
  `page.screenshot` with `element` and `save: false` as returning the image in base64
  without writing a file. The storybook project runs headless Chromium through
  `@vitest/browser-playwright`. `Tabs.stories.tsx` already moves a real pointer in `Hover`
  and presses real keys through `realKeys`, which returns `vitest/browser` in the runner and
  nothing in a Storybook.
- `darkMode.ts` exports `darkSemantic`, the derived dark palette the theme takes.

## Measured while building, 2026-09-15

- Written and run before the fix, the story failed on the focused hovered tab's outermost
  ring row, reading the dark grey line, `[20, 22, 26]`, where `[54, 112, 237]` was expected.
- **After the fix it still failed**, reading that row as `[37, 67, 132]`, half the ring's
  colour and half the line's. The dev Storybook probe, run again after the fix, read rows 40
  to 42 as the ring's colour on a focused hovered tab and a focused chosen tab, in Persian
  and English, light and dark, and row 43 as the line: the fix held, and the read did not.
- **A log planted in the story, and taken out again, found why.** The story's iframe is 1200
  by 900, the viewport `@storybook/addon-vitest` gives every story, and its 65 by 44 tab
  screenshotted at 53 by 36, the whole page at 960 by 720. Vitest's orchestrator scales the
  tester iframe to fit its own page, the smaller of one and the page over the iframe in
  each direction, and the Playwright provider leaves that page at Playwright's default,
  1280 by 720, where the line that would size it to the viewport is commented out. So the
  runner drew every story at 0.8, and a one-pixel row was a blend in any screenshot.
- **Planted, the storybook project's Playwright page at 1200 by 900** through
  `contextOptions.viewport`: the Tabs stories pass 8 of 8, the new story among them. With the
  fix taken out as well, the story fails reading the grey line's exact colour,
  `[20, 22, 26]`, on the ring's outermost row.
- **Stories set their own viewports, in their plays.** App, AuthScreen, Navigation,
  PageHeader and BulkActionBar call `page.viewport` with the frames' desktop, 1440 by 900;
  phones take 390 by 844, and PageHeader and BulkActionBar go back to 414 by 896. No story
  asks for more than 1440 by 900. My first search for them found nothing, its brace glob
  matching no file, and the first version of this section said no story set one; the second
  plan review found them.
- A full run of the storybook project at the old 0.8 failed 2 of 406: the new story, on its
  refusal of a scale of 0.818, and ContactCard's `Full On A Phone`, on a hover assertion,
  which passes alone, 16 of 16, the parallel pointer collisions of KN-365.

## The approach

1. **The runner draws a story one to one.** The storybook project's `playwright()` provider
   takes `contextOptions: { viewport: { width: 1440, height: 900 } }`, the largest viewport
   a story asks for, which holds Storybook's default and the phones' sizes too, with a
   comment saying why. Every story runs under it, so the whole storybook project is run
   with it.
2. **The ring paints over the indicator.** `.Mui-focusVisible::before` gains `zIndex: 1`,
   with a comment: two positioned pseudo-elements with no `z-index` paint in tree order, so
   the indicator's two pixels covered the ring's outermost bottom row, and one above them
   puts the indicator beneath the ring where they meet, still drawn below it. The ring stays
   inset 1, three wide, and inside the tab, and nothing else moves.
3. **A story, `FocusRingOverTheLine`**, in Persian in the dark scheme, where both the grey
   line and the chosen tab's line differ from the ring. In the runner, a real pointer hovers
   the tab after the chosen one, the chosen one read from the row as the args chose it; the
   script focuses the chosen tab, a real arrow moves focus on to the hovered tab without
   choosing it, and its drawn pixels are read; a real arrow back focuses the chosen tab, and
   its pixels are read. The arrows are real so each read tab's focus is the keyboard's; a
   real Tab would start from wherever the runner's page last had focus.
4. **A read** asserts the tab has focus and `.Mui-focusVisible`, then on computed styles
   that the indicator shows and differs from the ring, so the read can fail. It screenshots
   the tab through `page.screenshot` with `save: false`, decodes the image with
   `createImageBitmap` onto an `OffscreenCanvas`, takes the scale from the image against the
   tab's box and refuses one that is not a whole number, and reads the middle column at
   each row's centre: the ring's bottom band, rows worked out from the ring's own inset and
   width, as `darkSemantic['border/focus']`, and the tab's last row as the indicator's
   colour, so the read is seen to find the line. In Storybook itself there is no runner, and
   the story's docs say to press Tab, point at the next tab and move to it with an arrow key.
5. **Story docs**: `### FocusRingOverTheLine` in `story-docs/en/Shared-Tabs.md` and
   `fa/Shared-Tabs.md`.

## File by file

- `apps/web/vitest.config.ts`
- `apps/web/src/shared/tabs/Tabs.tsx`
- `apps/web/src/shared/tabs/Tabs.stories.tsx`
- `apps/web/src/shared/story-docs/en/Shared-Tabs.md`, `fa/Shared-Tabs.md`
- `AGENTS.md` section 7: how lingui's `useTsTypes` reads a call's argument, met while
  building, since `getContext('2d')` failed the rule; and the runner's scale.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved. It agreed that `zIndex: 1` on the ring's `::before` lifts the ring over the
indicator without lifting the tab, the row or the dialog over their siblings or MUI's
portalled overlays, since the stacking stays inside the parent's context, and that a
negative `z-index` on the indicator would be less safe, able to fall behind an ancestor's
background. It confirmed from Vitest 4.1.11's types and documentation that
`page.screenshot` takes an element and, with `save: false`, returns base64, and that the
decode is sound in the runner's Chromium. It asked for care in two places, both in the read
as planned: the tab's focus and `.Mui-focusVisible` asserted just before the screenshot, and
the scale taken from the image and the tab's box before the rows are chosen. It noted that a
ripple or another overlay inside the tab would need a stacking decision of its own; the tabs
have ripples off.

Changed after it, in the story's steps and not its design: focus comes from real arrows after
the script focuses the chosen tab, where the first draft pressed a real Tab, and the pointer
is on the tab before focus reaches it, as the exit puts it. It did not see the runner's scale,
which building found.

## Second plan review, 2026-09-15, Codex gpt-5.6-terra

Sound, with one change, taken: the page at 1440 by 900 rather than 1200 by 900, since stories
resize their iframe to 1440 by 900 in their plays, and a page of 1200 would draw them at
0.833 and leave the claim that the runner draws a story one to one untrue. Checked before
taking it, above. It confirmed `contextOptions.viewport` as the mechanism in this headless
Vitest 4.1.11 setup, the provider passing it to Playwright's `newContext` and dropping it only
when the browser UI is on, and that Vitest's `browser.viewport` would not do it here, since
Storybook's plugin sizes the iframe itself. It judged the story's refusal of a scale that is
not a whole number the right failure if a later story outgrows the page, better than deriving
the page's size at run time, since the context exists before any story's viewport is known.

## What I expect to be hard, and what I am unsure of

- **What a page at 1440 by 900 changes for the other stories.** Inside the iframe nothing
  changes size: each story keeps the viewport it asks for, and Vitest's pointer already
  multiplies by the scale it records. What changes is that the page is drawn one to one; a
  story that passed only at 0.8 would show in the full run.
- **Whether `z-index: 1` paints the ring over anything that should cover a tab.** Inside the
  Job Modal the row sits in the dialog's own stacking context, its panels scroll below it,
  and menus and tooltips are portalled above; nothing measured overlaps the row.

## How I will know it works

- With the page one to one and the fix taken out, the story fails reading the grey line's
  exact colour on the ring's outermost row; with the fix, it passes.
- The storybook project passes with the page at 1440 by 900, a story failing only in
  parallel passing alone, as KN-365 records.
- The unit project passes, lint and tsc clean.
- Looked at in fa-IR and en-US, light and dark, a focused hovered tab and a focused chosen
  tab: the probe's screenshots of the row after the fix.

## Result, 2026-09-15

- Before the fix, `FocusRingOverTheLine` failed on the focused hovered tab's outermost ring
  row, reading `[20, 22, 26]` where `[54, 112, 237]` was expected; with the page one to one
  and the fix planted out, the same; with the fix, the Tabs stories pass 8 of 8.
- The whole storybook project with the page at 1440 by 900 passes 405 of 406. The one
  failure, JobCard's `Pressed`, reading `rgb(243, 244, 246)` where `rgb(255, 255, 255)` was
  expected, passes alone, 18 of 18: the failure a full run in parallel already has, KN-365.
  At the old 0.8 the same project failed 2 of 406, the new story on its refusal of the scale
  and ContactCard's `Full On A Phone`, which passes alone.
- The unit project passes 1489 of 1489; `npm run lint` and `npm run lint:tsc` are clean.
- The dev Storybook probe after the fix read rows 40 to 42 as the ring's colour and row 43
  as the line on a focused hovered tab and a focused chosen tab, in fa-IR and en-US, light
  and dark, and the row's screenshots at a device scale of two show each ring whole.
- `Tabs.stories.tsx` and `Tabs.tsx` keep their 10 and 2 lines of formatting drift from HEAD;
  `vitest.config.ts`, the story docs and `AGENTS.md` are formatted.
