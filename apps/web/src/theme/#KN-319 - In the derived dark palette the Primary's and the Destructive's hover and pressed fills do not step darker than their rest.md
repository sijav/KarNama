# KN-319 - In the derived dark palette the Primary's and the Destructive's hover and pressed fills do not step darker than their rest

## The card, as re-pointed

A child of KN-009, found by its roast.

**Why.** A press that brightens reads as a release; the one button that deletes things should
not answer the press backwards.

**Exit, re-pointed 2026-09-15.** In dark the Primary's and the Destructive's rest, hover and
pressed fills keep the light design's order of lightness, each a step darker than the one
before as in light, each still carrying text/on-accent at 4.5:1; a unit test holds the order
and the steps for both; and DESIGN.md's dark mode paragraph states the rule.

**What it said before.** The Destructive alone, its three fills "each through
deriveDarkSurface" at about `#ed2c2c`, `#d84141` and `#e34646`: measured before KN-108 walked
the accent fills darker for white.

## Read before planning, 2026-09-15

- `darkMode.ts` derives every accent fill with `accentFill`: `deriveDarkSurface`, then
  `ensureContrast` against `text/on-accent`. `deriveDarkSurface` hands a saturated colour to
  `deriveDark`, which flips its lightness and puts a floor of 0.55 under it, so each accent
  fill starts light and the walk darkens it only until white just clears 4.5, pinning all six
  at that edge.
- Measured through a throwaway test beside `darkMode.ts`, taken out again, in this table.

| Token               | Light     | Luminance | Dark      | Luminance | White on dark |
| ------------------- | --------- | --------- | --------- | --------- | ------------- |
| `bg/danger/default` | `#ef4444` | 0.229     | `#eb1515` | 0.1825    | 4.52          |
| `bg/danger/hover`   | `#d43030` | 0.163     | `#d73d3d` | 0.1812    | 4.54          |
| `red/700`           | `#b91c1c` | 0.112     | `#e03030` | 0.1817    | 4.53          |
| `bg/brand/default`  | `#2563eb` | 0.153     | `#2d69ec` | 0.1672    | 4.83          |
| `bg/brand/hover`    | `#1d4ed8` | 0.107     | `#3563e4` | 0.1528    | 5.18          |
| `accent/700`        | `#1e40af` | 0.070     | `#4c6ee0` | 0.1807    | 4.55          |

- In light each state is darker than the one before it by a contrast ratio of about 1.3 to
  one: 1.31 and 1.31 for the danger fills, 1.30 and 1.30 for the brand's. In dark the three
  danger states are one lightness, and a pressed Primary is the brightest of its three.
- The four state roles are the Button's `LOOKS` and, for the two hovers, the theme palette's
  `primary.dark` and `error.dark`, which nothing in `src` draws with. `darkMode.test.ts`
  holds every Button fill's text and the palette's `contrastText` on `main` and `dark` at 4.5
  to one, KN-108's pairs, and nothing about their order.
- DESIGN.md's dark mode paragraph says a fill that carries white text moves, walked darker in
  its own hue until white clears 4.5. DESIGN.md is kept by hand, not by Prettier.

## The approach

1. **A step for hover and pressed, not a walk.** In `darkMode.ts` the rest fill stays
   `accentFill`'s. The hover and pressed fills take their own token's hue and saturation, at
   the lightness that puts them the light pair's own contrast ratio darker than the state
   just before them, the rest for hover and the hover for pressed. The luminance wanted is
   `(before + 0.05) / ratio - 0.05`, and its lightness is found by bisecting a fixed number of
   times, so no branch is left untaken. Darker than a fill white already clears only raises
   white's ratio. `accentFill`'s own comment says it now derives the rest fills alone.
2. **A test beside KN-108's pairs.** For every style of the Button's `LOOKS` whose rest,
   hover and pressed fills are all accent fills, the Primary and the Destructive, each dark
   state is darker than the one before, and its ratio against it is within 0.05 of the light
   pair's. It names KN-108's pairs as what holds white on each fill. Written and run before
   the change, it fails on both styles.
3. **DESIGN.md's dark mode paragraph** gains the rule, by hand.

## File by file

- `apps/web/src/theme/darkMode.ts`
- `apps/web/src/theme/darkMode.test.ts`
- `DESIGN.md`

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved, with its details taken. MUI's palette calls `primary.dark` and `error.dark` darker
shades of `main`, so hover and pressed stepping darker agrees with the theme the fills feed;
Material 3's lighter state layers belong to another system, not this palette derived from the
file. The formula and the bisection are sound, each state taken from its immediate
predecessor and never from the rest or by running `accentFill` again, and the strict order
with the 0.05 tolerance holds what hex rounding does. The six tokens reach nothing beyond the
Button's `LOOKS`, the dark palette's tests and MUI's `dark` entries. Taken besides:
`accentFill`'s comment is corrected along with DESIGN.md, since walking every accent fill to
white's bar will no longer describe hover and pressed, and the new test names KN-108's pairs.
A step of 1.3 to one is the light design's relation, not a perceptual guarantee, so the look
in dark decides whether it reads.

## What I expect to be hard, and what I am unsure of

- **The direction is a derivation choice.** The file draws no dark palette, and the card's
  exit asks for the light design's order. Material 3's state layers lighten a filled button
  under a pointer in dark, which is the other reading.
- **What else reads the two hover roles** in dark: the theme's `primary.dark` and
  `error.dark` darken with them.
- **Hex rounding** after the bisection, against a step held within 0.05 of the light ratio.

## How I will know it works

- The new test fails before the change on both styles and passes after; KN-108's pairs still
  pass.
- The unit project, lint and tsc pass, and coverage stays whole.
- Looked at in dark with a pointer: the Contact Modal's Save and the Confirm modal's
  destructive action at rest, hovered and pressed, darker at each step, in both languages.

## Result, 2026-09-15

- Written first, the new describe failed against the old derivation on its four steps and
  nothing else: the Primary's rest to hover at a ratio of 1.07 where light's is 1.30, its
  pressed fill at luminance 0.1807 over its hover's 0.1528, the Destructive's rest to hover at
  1.006 where light's is 1.308, and its pressed fill at 0.1817 over its hover's 0.1812; 118
  other tests passed. After the change `darkMode.test.ts` passes 122 of 122, KN-108's pairs
  among them.
- The unit project passes 1494 of 1494, and coverage scoped to `darkMode.ts` reads 100
  percent: 99 of 99 statements, 37 of 37 branches, 14 of 14 functions and 89 of 89 lines.
  `npm run lint` and `npm run lint:tsc` are clean. `darkMode.ts` and its test keep their 18
  and 20 lines of formatting drift from HEAD.
- Looked at in the dev Storybook in dark, in fa-IR and en-US, with the pointer away, over the
  button and held down on it: the Contact Modal's Save, a Primary Button, at luminance 0.1672,
  0.1161 and 0.0772, and the Confirm modal's delete, a Destructive one, at 0.1825, 0.1275 and
  0.0845. The saved crops of the delete show three reds, each darker than the last.
- DESIGN.md's dark mode paragraph and the accent fills' comment state the rule.
