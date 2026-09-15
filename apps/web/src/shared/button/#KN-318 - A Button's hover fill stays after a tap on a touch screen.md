# KN-318 - A Button's hover fill stays after a tap on a touch screen

## The card

A child of KN-009, found by its roast.

**Why.** Half the design is the mobile screens, and a button that keeps its hover after a
tap looks stuck.

**Exit.** Under hover: none the Button shows its resting fill after a tap, established with
an emulated touch device, and hovering still fills it where there is a pointer.

## Read before planning, 2026-09-15

- `Button.tsx` draws the hover of node `31:4` with one rule,
  `'&:hover:not([data-state]), &[data-state="hover"]'`: the style's hover fill and text.
  The first half is the browser's own hover. The second is KN-316's forced state, which the
  `States` story sets so a hover can be reviewed with no pointer. Nothing guards the first
  half by the device's input. The pressed state, `:active`, holds only while a press lasts,
  so a tap does not leave it.
- MUI's Button resets under `(hover: none)` only the contained variant's shadow, never the
  fill, and this Button passes `disableElevation` and `disableRipple`. It eases its fill over
  MUI's short transition, 250 ms.
- Measured with Playwright in the running dev Storybook, the Button's `Playground` story, a
  Primary M: in Pixel 7 a tap leaves `:hover` and the brand hover fill,
  `rgb(29, 78, 216)`, where the rest is `rgb(37, 99, 235)`, until something else is tapped.
  With a desktop pointer, hovering fills and leaving clears.
- KN-313 fixed the same gap on the Icon Button with `@media (hover: hover)`, proved by
  `e2e/storybook/icon-button-touch.spec.ts` in the Storybook check against the production
  build. Its roast noted that `(hover: hover)` reads the device's primary input only, so a
  touch-first device with a mouse gets no hover fill, and questioned the `:hover` the check
  reads.
- The `Matrix` story renders all fifteen enabled Buttons, every style in every size, with no
  forced state. Every style's fill changes on hover; Primary's and Destructive's text does
  not.
- `Button.tsx` is formatted at HEAD.

## The approach

1. **The browser's hover only where the primary input can hover.** The hover's style is held
   once and drawn by `'@media (hover: hover)'` around `'&:hover:not([data-state])'`, and by
   `'&[data-state="hover"]'` for every device, the forced state unchanged, both before the
   pressed rule as the hover is today. A comment says a touch screen keeps `:hover` on what
   was tapped, and that `(hover: hover)` reads the device's primary input, so a
   touch-first device with a mouse draws no hover fill.
2. **A production check, `e2e/storybook/button-touch.spec.ts`**, beside the Icon Button's,
   run with the Storybook check against the build. In a Pixel 7 context it opens `Matrix`,
   asserts `(hover: none)`, taps each of the fifteen enabled Buttons, waits twice MUI's 250
   ms transition and for every animation on the Button to finish, and reads its fill and
   text as they were before the tap. The check reproduces a phone only while a tap leaves
   `:hover` behind, so if the first tap leaves none, the test skips, saying so, rather than
   pass on Buttons that would read as at rest fixed or not. With the check's desktop Chrome
   it asserts `(hover: hover)`, hovers each of the fifteen and waits for its fill to leave
   its resting one.

## File by file

- `apps/web/src/shared/button/Button.tsx`
- `apps/web/e2e/storybook/button-touch.spec.ts`

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved, with one correction, taken in part. It confirmed the split: the media rule and the
forced state before the pressed rule, which Emotion keeps in the object's order, so a held
press still wins on a desktop, and focus and disabled untouched; `(hover: hover)` over
`(any-hover: hover)`, for the phone-first product; a spec of the Button's own beside the
Icon Button's; Pixel 7's touch path for `tap()`; and the wait past MUI's short transition.

It asked that the `:hover` left after a tap not be a required assertion, as KN-313's roast
had. **Taken as a skip rather than a removal.** Without `:hover` on the Button the fill and
text assertions pass whether the rule is fixed or not, so the check proves nothing; but this
check runs before the Pages workflow publishes, and a Chromium that stopped leaving `:hover`
would block a publish while the product is right. So the test skips with its reason when the
first tap leaves no `:hover`, and fails only on a fill. The Icon Button's check fails there
instead, and is a card of its own under KN-313.

## What I expect to be hard, and what I am unsure of

- **The order of the rules.** The pressed rule follows the hover in the style object, so
  `:active` still wins over a hover on a desktop; a media query around the hover must not
  move it after the pressed rule.
- **Fifteen taps in one test**, each waiting out a transition: under ten seconds, inside the
  Storybook check's two-minute budget.

## How I will know it works

- Against a production build of the code before the fix, the touch test fails on the first
  Button's fill after a tap; against one with the fix, both tests pass.
- The Button stories and the unit project pass, lint and tsc clean.
- Looked at after a tap in Pixel 7 emulation and with a pointer, in both languages and
  schemes.

## Result, 2026-09-15

- Against a production Storybook build of the code before the fix, built into a scratch
  folder, `button-touch.spec.ts` failed its touch test: after a tap the first Button, a
  Primary S, read fill `rgb(29, 78, 216)` where its resting `rgb(37, 99, 235)` was
  expected. Its pointer test passed. Against a build with the fix, both tests pass, the
  touch test in under ten seconds for its fifteen taps.
- The Button stories pass 5 of 5 in the Vitest runner, the Matrix among them, hovering and
  then holding Space on every enabled Button, so a held press still draws over a hover. The
  unit project passes 1489 of 1489, and `npm run lint` and `npm run lint:tsc` are clean.
- Looked at in the dev Storybook. The Contact Modal's Save, a Primary Button in a story that
  pins no scheme, keeps its resting fill after a tap in Pixel 7 emulation in fa-IR and
  en-US, light and dark, and a desktop pointer's hover fills it, `rgb(29, 78, 216)` in light
  and `rgb(53, 99, 228)` in dark. The Matrix's Ghost M, pinned light, stays transparent
  after a tap and fills `rgb(243, 244, 246)` under a pointer. The saved crops show the same.
- `Button.tsx` stays formatted.
