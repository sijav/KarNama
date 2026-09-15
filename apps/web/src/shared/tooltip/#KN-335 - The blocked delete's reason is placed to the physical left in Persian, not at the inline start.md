# KN-335 - The blocked delete's reason is placed to the physical left in Persian, not at the inline start

## The card

A child of KN-018, found by its roast.

**Why.** 259:295 draws the reason beside the menu at its inline start, and on the board, where
there is room on both sides, it would sit on the wrong one.

**Exit.** The start placement asks MUI for right in a right to left page and left in a left to
right one, and a story with room on both sides checks the tip is at the inline start.

## Read before planning, 2026-09-15

- **The code.** `Tooltip.tsx` hands MUI `left` for `start`, its comment saying MUI's Popper turns
  left into right in a right to left page. It does not: `flipPlacement` in MUI's `BasePopper.js`
  mirrors only `bottom-start`, `bottom-end`, `top-start` and `top-end`. The one `start` in the
  product is `Menu.tsx`'s blocked item, the Status menu's delete.
- **Measured today**, the StatusMenu's `DeleteBlocked` in the dev Storybook, fa-IR, 1200 wide: the
  page, the popper and the tip all compute right to left, and the menu spans 40 to 260. Popper,
  asked for the left with 40 to spare, flipped the tip to the right, where it starts at 262, **2
  from the menu**. MUI's tooltip writes the 14 beside a left or right placement as a logical
  margin, `marginInlineEnd` for the left and `marginInlineStart` for the right, which in a right
  to left page is the far side: the tip's margins read 2 on its left and 14 on its right.
- **The file.** In 259:295 the menu spans 250 to 470 and the tooltip 480 to 740: the reason stands
  at the menu's right, its inline start, **10 from it**, bound to no variable. The tip's centre is
  9 below the delete row's, lined up with nothing else in the frame.
- **The direction.** `theme/sides.ts` has `inlineStartOf` and `inlineEndOf`, the Sort Control
  reads `useTheme().direction` for them, and `buildTheme` takes the direction.

## The approach

1. **The stories first.** `Tooltip.stories.tsx` gains `BesideTheStart`, fa-IR, and
   `BesideTheStartInEnglish`, en-US: the meta's trigger centred in a row wide enough for the tip
   on either side, `placement` set to `start`, and only the title's control left. Each tabs to
   the trigger, waits for the tip's grow to end, and reads the tip at the inline start, 10 from the
   trigger: its left edge 10 right of the trigger's right edge in Persian, its right edge 10 left
   of the trigger's left edge in English. `DeleteBlocked` gains the same read against the menu,
   the product's own case.
2. **Before the fix**, the Tooltip and StatusMenu stories run against the component as it is:
   `BesideTheStart` must fail at its side, `BesideTheStartInEnglish` at its gap, 14 where the file
   draws 10, and `DeleteBlocked` at its gap, 2.
3. **The fix.** `Tooltip.tsx` asks MUI for `inlineStartOf(theme.direction)`, and the tip's `sx`
   puts `BESIDE_GAP`, 10, on the edge that faces the trigger for whichever side Popper settles on:
   the tip's inline end when it sits at the trigger's inline start, and its inline start when
   Popper has flipped it to the inline end, with nothing on the far side. The false comment goes.
4. **The words.** Both Tooltip story docs: `placement` says the tip stands 10 from its trigger
   when beside it, and the two stories get their entries; both StatusMenu story docs' `DeleteBlocked`
   says where the reason stands; DESIGN.md's Type=Status sentence gives the 10.

## File by file

- `apps/web/src/shared/tooltip/Tooltip.stories.tsx`
- `apps/web/src/shared/menu/StatusMenu.stories.tsx`
- `apps/web/src/shared/tooltip/Tooltip.tsx`
- `apps/web/src/shared/story-docs/en/Shared-Tooltip.md` and `fa/Shared-Tooltip.md`
- `apps/web/src/shared/story-docs/en/Shared-StatusMenu.md` and `fa/Shared-StatusMenu.md`
- `DESIGN.md`

## What I expect to be hard, and what I am unsure of

- **The gap is more than the card.** The exit names the side; measured, the side alone would leave
  the reason 2 from the menu where the file draws 10. A fix that put the tip on the file's side
  and still not where the file puts it would not look like the design, so the gap is in this
  change.
- **Reading the tip while it grows.** MUI grows the tip from three quarters, and the right to left
  plugin may turn the origin, so the plays wait for the tip's transform to end before reading an
  edge.
- **The vertical offset.** Popper centres the tip on its row; the file's sits 9 lower, lined up
  with nothing, so the code keeps the centring.
- **Flipping.** Popper still flips a tip whose start has no room; the gap follows the side it lands
  on, and no story forces a flip.

## How I will know it works

- Against the component as it is, the three stories fail where step 2 says, and after the fix the
  Tooltip and StatusMenu stories pass.
- The unit project, the docs guard among it, lint and tsc are clean.
- Seen: the blocked delete's reason in fa-IR light and dark, and a start tip in en-US light, each
  at the inline start and 10 from what it describes.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

It approved `inlineStartOf(theme.direction)`, reading the installed MUI 9.4 the same way: a bare
`left` or `right` is not mirrored, only the `-start` and `-end` placements are. It asked that the
gap follow the side Popper settles on, read from `data-popper-placement`, with the two inline
margins exclusive so MUI's 14 cannot survive on the far side, and that the 10 be carried here,
since the side alone would still miss the frame. It called the two centred stories and
`DeleteBlocked` the smallest honest proof, read once the tip's grow ends at `transform: none`,
which the installed Grow's entered style sets.

Judged:

1. **Key the gap on the settled side, with both margins set: already the plan**, step 3, and so
   in the draft, which sets both inline margins under a selector on `data-popper-placement` for
   the inline start and another for the inline end.
2. **Make the 10 a spacing role in the theme: not taken.** The theme's spacing is the file's
   spacing variables, and this gap binds none. The repository keeps a measure that binds no
   variable as a named constant in its component: the Tooltip's own `TIP_WIDTH`, whose comment
   says no variable is bound to it, so it is a constant rather than a token, and the Bulk Action
   Bar's `EDGE` and the Select's `FIELD_HEIGHT` beside it. The web lint takes the draft with
   `BESIDE_GAP` without a message.

## Result, 2026-09-15

Built as planned after the review.

- Against the component as it was, the three stories failed alone where step 2 said:
  `DeleteBlocked` at 2, `BesideTheStart` at its side, the tip on its trigger's left, and
  `BesideTheStartInEnglish` at 14.
- After the fix the two story files pass, 21 of 21, and the unit project, the docs guard among it,
  lint and tsc are clean.
- Seen in the dev Storybook once each tip had grown: the blocked delete's reason in fa-IR light and
  dark on the menu's right, 10 from it, and `BesideTheStartInEnglish` in en-US light and dark on
  its trigger's left, 10 from it, with no console error or warning.
