# KN-313 - An Icon Button's hover fill stays after a tap on a touch screen

## The card

A child of KN-014, found by its roast.

**Why.** The mobile screens are half the design; a button that stays grey or pale red after
a tap looks pressed or dangerous when it is neither.

**Exit.** Under hover: none the Icon Button shows no hover fill after a tap, established with
an emulated touch device in a story or a production check, and hovering still fills it on a
device with a pointer.

## Read before planning, 2026-09-15

- `IconButton.tsx` draws the hover of node `460:672` with one rule in its sx, `&:hover`: the
  fill `bg/surface-secondary` and the icon `text/primary`, or for Danger the rejected
  container and `text/error`. Nothing guards it by the device's input.
- MUI's IconButton resets its own hover fill under `@media (hover: none)`, but only in the
  style it gives a button with a ripple. The Icon Button passes `disableRipple`, so that
  block, reset and all, is not there. Nothing in `apps/web/src` uses a hover media feature.
- Measured with Playwright in the running dev Storybook, the Icon Button's `Hover` story: in
  Playwright's Pixel 7, which has touch, `(hover: none)` and `(pointer: coarse)` match, and a
  tap leaves the neutral button `:hover` and filled `rgb(243, 244, 246)`; a tap on the
  danger button moves it there, `rgb(254, 226, 226)`. With a desktop pointer, hovering fills
  and leaving clears.
- The file draws the hover as a reaction on the Default variants, `460:659` and `460:667`,
  Smart Animate over 120 ms ease out, read with use_figma for KN-312; the timing is KN-350's.
- The Contact Card has no hover on a phone through its `phone` prop, its screens knowing the
  layout. The Icon Button sits in both layouts, so what it can go by is the device's input.
- The storybook Vitest project's Chromium has no touch, and its context is made once for
  every story. The Storybook check, `playwright.storybook.config.ts`, opens the production
  Storybook build in Playwright, and the Pages workflow runs it before it publishes; a spec
  there can open a context of its own with `devices['Pixel 7']`. Its output folders and the
  build's are gitignored.
- The Button has the same gap, KN-318, a card of its own.

## The approach

1. **The hover only where there is one.** The sx's `&:hover` moves under
   `@media (hover: hover)`, with a comment: a touch screen keeps `:hover` on what was tapped,
   so the fill stayed after a tap, and a device whose main input can hover is where the
   file's hover is drawn. At rest, focused and disabled, nothing changes.
2. **A production check, `e2e/storybook/icon-button-touch.spec.ts`**, run with the
   Storybook check. In a Pixel 7 context it opens the `Hover` story's page from the build,
   asserts `(hover: none)` matches, taps each button, waits twice the fill's 150 ms ease and
   for every animation on the button to finish, and reads its fill as transparent, its icon
   as the colour it had before the tap, and `:hover` as left on it by the tap. With the
   check's own desktop Chrome it asserts `(hover: hover)` matches, hovers each button, waits
   for its fill to leave the colour it had at rest, and reads the icon's colour changed.
3. **AGENTS.md section 7** gains a line: a tap leaves `:hover` behind on a touch screen, and
   MUI's reset is not there for a button without a ripple, so a hover rule on a control is
   guarded by `(hover: hover)`.

## File by file

- `apps/web/src/shared/icon-button/IconButton.tsx`
- `apps/web/e2e/storybook/icon-button-touch.spec.ts`
- `AGENTS.md`

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved, with one correction to the check, taken: a read straight after a tap can come
before the hover fill has eased in, and pass on a fill still on its way from transparent, so
the touch test waits past the ease before it reads, and the pointer test waits for the fill
to arrive. It confirmed from MUI 9.4.0's source that IconButton's touch reset exists only
for a button with a ripple; that `(hover: hover)` rather than `(any-hover: hover)` keeps a
touch-first device with a mouse from the sticky fill, at the cost of that mouse's hover,
which the phone-first product accepts; that focus, the disabled state and a Tooltip's own
handlers are unaffected; and that the Storybook check is the right place, `locator.tap()` in
Pixel 7's touch context sending real touch events. The `:hover` a tap leaves is Chromium's
behaviour, which the exit's emulated device accepts.

## What I expect to be hard, and what I am unsure of

- **A device with touch and a mouse**, where the primary input decides `(hover: hover)`: a
  laptop whose main input is touch gets no hover fill from its mouse. The alternative,
  `(any-hover: hover)`, would keep the fill after a tap on that same device.
- **Where the check lives.** The Storybook check needs a production build, a few minutes,
  and already opens every story; the new spec opens one page in two contexts.
- **A device in `test.use` inside a describe**: a device's `defaultBrowserType` forces a new
  worker, which Playwright refuses there, so the spec leaves it out.

## How I will know it works

- Against a production build of the code before the fix, the touch test fails on the hover
  fill after a tap; against one with the fix, both tests pass.
- The Icon Button stories and the unit project pass, lint and tsc clean.
- Looked at in the dev Storybook after a tap in Pixel 7 emulation and with a pointer, in
  both languages and schemes.

## Result, 2026-09-15

- Against a production Storybook build of the code before the fix, built into a scratch
  folder, `icon-button-touch.spec.ts` failed its touch test: after a tap the neutral button
  read fill `rgb(243, 244, 246)` and icon `rgb(17, 24, 39)`, with `:hover` left on it, where
  its resting `rgba(0, 0, 0, 0)` and `rgb(107, 114, 128)` were expected. Its pointer test
  passed. Against a build with the fix, both tests pass.
- The Icon Button stories pass 11 of 11 in the Vitest runner, whose pointer still fills the
  hover. The unit project passes 1489 of 1489, and `npm run lint` and `npm run lint:tsc`
  are clean.
- Looked at in the dev Storybook's `KeyboardOnly` story, whose language and scheme are not
  pinned, in fa-IR and en-US, light and dark: after a tap in Pixel 7 emulation the button
  keeps its resting fill and icon, and a desktop pointer's hover fills it,
  `rgb(243, 244, 246)` in light and `rgb(30, 34, 40)` in dark. The saved crops show the
  same.
- `IconButton.tsx` keeps its 50 lines of formatting drift from HEAD. Its `sx` body sits two
  spaces deeper than Prettier's, so the media rule replaces the one `&:hover` line it came
  from, and its comment stands above `sx`, where the file already matches Prettier.
