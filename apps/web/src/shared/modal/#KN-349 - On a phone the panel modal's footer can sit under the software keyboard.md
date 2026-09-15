# KN-349 - On a phone the panel modal's footer can sit under the software keyboard

## The card

A child of KN-031, found by its roast.

**Why.** Half the design is the mobile screens, and a form whose Save is under the keyboard cannot be
finished.

**Exit.** The panel keeps its footer in view above the software keyboard, capped against the visual
viewport, and a story at 390 by 544 shows Save visible with the last field focused.

## Measured before planning, 2026-09-15

Headless Chromium against the dev Storybook, the Contact Modal's Add story, its Select focused:

- **At a layout viewport of 390 by 544 the footer is already in view.** MUI's Dialog caps its Paper at
  `calc(100% - 64px)`, and only the body scrolls, so the panel runs from 32 to 512 and Save ends at
  496\. A story that only sets the viewport to 390 by 544 passes against today's panel and proves
  nothing about the keyboard.
- **At 390 by 844 the panel runs from 133 to 711 and Save ends at 695**, under a keyboard's top at
  544\. A software keyboard shrinks the visual viewport and not the layout viewport in Safari on iOS,
  and in Chrome on Android since its default became `interactive-widget=resizes-visual`, so the
  Dialog's fixed root stays 844 tall and centres the panel behind the keyboard. That is the defect.
- **`window.visualViewport` is an own, configurable property** of the window in Chromium, so a story
  can stand in for a visual viewport of 544 over a layout viewport of 844 and put it back.

## The approach

1. **The story first**, `FooterAboveTheKeyboard` in `PanelModal.stories.tsx`: a panel with enough
   fields to overflow a phone, at a layout viewport of 390 by 844 through `vitest/browser`'s
   `page.viewport`, with `window.visualViewport` stood in for by an event target reporting a height
   of 544 and an offset of 0, and the last field focused. Save's box lies between 0 and 544. The same
   at a literal 390 by 544, the card's words. The viewport and the property are put back when the
   play ends. Run against today's panel first: the 844 case must fail, since Save measured 695.
2. **The panel follows the visual viewport.** `PanelModal` reads the visual viewport's height and
   offset through `useSyncExternalStore`, subscribed to its `resize` and `scroll` events, and places
   the Dialog's root on it, `top` at its offset and `height` its height, so MUI's container centres
   the panel inside what can be seen and the Paper's cap keeps it there. The scrim is fixed to the
   whole screen on its own and does not move. With no visual viewport the root stays as MUI sets it.
3. **The cap follows the margin.** The Paper's margin is 16, set by KN-031, while the cap is MUI's
   default for a margin of 32; the cap becomes `calc(100% - 32px)` through `spacing.md`, so the panel
   keeps 16 above and below as it keeps 16 at the sides.
4. **The words.** Both PanelModal story docs describe the new story.

## What I will change

- `PanelModal.tsx`: the visual viewport store, the root's `top` and `height`, the Paper's cap.
- `PanelModal.stories.tsx`: `FooterAboveTheKeyboard`.
- `story-docs/en/Shared-PanelModal.md` and `story-docs/fa/Shared-PanelModal.md`: its entry.

## What I expect to be hard, and what I am unsure of

- **Safari on iOS scrolls the page to the focused field** as the keyboard opens, which moves the
  visual viewport's offset; the root following it on every `scroll` must not fight that scroll or
  loop. No iPhone is at hand here, so this is reasoned, not run.
- **The stand-in is not a keyboard.** It proves the panel reads the visual viewport and places itself
  in it; that a real keyboard reports these numbers is the browsers' documented behaviour, not
  measured here.
- **Coverage**: `window.visualViewport` is typed nullable and never null in Chromium, so the branch
  without it needs a story standing in `null`, or it stays uncovered.
- **Points.** The card has 1; a store, a story with a stand-in and both docs may be 2.

## How I will know it works

- `FooterAboveTheKeyboard` fails against today's panel at 844 with the stand-in, and passes after.
- The Contact Modal, Job Modal and board stories still pass; the unit project, lint and tsc are clean.
- Looked at in fa-IR and en-US, light and dark, at 390 by 844 with the stand-in, with the last field
  focused.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

It found the visual viewport the right signal: Safari on iOS does not implement
`interactive-widget=resizes-content`, and Chrome already resizes only the visual viewport by
default. Judged, all four taken:

1. **`bottom: 'auto'`** beside `top` and `height`, since MUI's root sets all four insets; the scrim
   is fixed to every edge on its own.
2. **Stable snapshots.** Two primitive snapshots, the height and the offset, each `null` without a
   visual viewport, through one subscribe defined outside the component, never a fresh object.
3. **Three stories, not one.** `FooterInAPhoneView`, at a literal 390 by 544, is the card's check of
   the view's size and is no evidence about a keyboard. `FooterAboveTheKeyboard` stands in the
   visual viewport in the story's `beforeEach`, before the panel subscribes, and puts the property
   back in its cleanup; it focuses the actual last field, reads the root's top and height as well as
   Save's box, then moves the stand-in by `resize` and by `scroll` and reads the root follow.
   `WithoutAVisualViewport` stands in `null` and reads the root where MUI puts it, which covers
   that branch.
4. **Not proven here.** A real keyboard on an iPhone in Safari, and any flicker while the keyboard
   and the page move, is not run: no iPhone is at hand, and the runner's Chromium opens no keyboard.

## Points

Raised from 1 to 2 on 2026-09-15: a store, three stories and both docs.

## Built, 2026-09-15

- **Story first.** `FooterAboveTheKeyboard` failed against the old panel, Save's bottom at 679 over a
  line at 544, and passes now; `FooterInAPhoneView` and `WithoutAVisualViewport` passed before and
  after, as the plan expected.
- **Lint refused the stories' literals first**: `'visualViewport'` as a property key, the two event
  names, and `'Save'` read through a binding not named `i18n`. Each is bound to a type now, as
  `ContactModal.tsx` binds its examples.
- **The panel** reads `offsetTop` and `height` as two snapshots through one subscribe, and its root
  takes `top`, `bottom: 'auto'` and `height` from them; the Paper's cap is `calc(100% - 32px)`.
