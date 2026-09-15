# KN-275 - Add a resting edge role for controls at 3:1, and draw the Input and the Checkbox with it

## The card

**Why**, from the board: An empty field or an unchecked box has nothing but its
edge to be found by, and at 1.24:1 someone with low vision may not find it. The
owner chose the fix on 2026-09-10.

**Exit condition**, from the board: tokens.ts carries a named role for a control's
resting edge, a neutral in text/secondary's hue at 3.3:1 or more on bg/surface,
bg/page and bg/surface-secondary, and darkMode.ts derives it and checks it at 3:1
or more on the three dark backgrounds, each ratio asserted by a unit test with a
mutation back to border/default failing it; the Input's resting border and the
Checkbox's unchecked frame use it, and the Input's Default story and the
Checkbox's Unchecked story assert it; every other state of both still renders as
drawn; DESIGN.md's token tables list the role as the owner's addition under
KN-273; the token verifier and the contract pass; and the Input and the Checkbox
are seen at rest in all four combinations.

A note on the card, from KN-012's roast: the Select draws its resting edge in
border/default like the Input, and the decision names the Select.

## The owner's decision

`DESIGN.md`, "Settled by the owner on 2026-09-10": a control's resting edge clears
3 to one, KN-273. A new named role, a grey in the file's own hue at 3 to one or
more on every surface a control sits on, picked with margin and derived for dark
like the other borders. The Input, the Checkbox and the Select use it; the Hover
edge keeps its drawn colour; cards, dividers and the Filter Chip keep
`border/default`.

## Measured, 2026-09-15

With `darkMode.ts`'s own functions, copied into a script:

- `border/default` on the light backgrounds: page 1.16, surface 1.24, secondary
  1.13.
- `text/secondary`, `#6b7280`, is hue 220, saturation 0.09, lightness 0.46. Made
  lighter a thousandth at a time, the last value at 3.3 or more on all three light
  backgrounds is **`#7f8694`**: page 3.41, surface 3.66, secondary 3.32, the card's
  value. `#868d9a` is 3.11, 3.34 and 3.03.
- The dark backgrounds, derived: page `#1f242e`, surface `#2e2e2e`, secondary
  `#1e2228`. `deriveDark('#7f8694')` is `#6b7280`, 2.81 on the dark surface; walked
  to 3 against that surface by `ensureContrast`, as `border/focus` and
  `border/error` are, it is **`#707786`**: page 3.46, surface 3.02, secondary 3.55.
- Rest against the Input's hover edge, `text/secondary`: 1.32 in light, 1.51 in
  dark.

## What is there

- **`tokens.ts`**: 22 semantic roles, `border/default`, `border/focus` and
  `border/error` among them. `tokens.test.ts` wants a `DESIGN.md` table row with
  each role's hex, and takes role names only from the tables under the five token
  headings, `### Colour, semantic` among them.
- **`darkMode.ts`**: `border/default` is derived and left at 1.33; `border/focus`
  and `border/error` are derived and then walked to `NON_TEXT_CONTRAST` against
  the dark surface, KN-271. `darkMode.test.ts` checks those two at 3 on the three
  dark backgrounds and in light, and that each keeps its hue.
- **The edges**: the Input's field, `Input.tsx` line 223, `border/default` or
  `border/error`, with a hover edge of `text/secondary`; the Checkbox's unchecked
  frame, `Checkbox.tsx` line 91, an inset shadow of `border/default`, with a hover
  edge of `border/focus`; the Select's field, `Select.tsx` line 165, a
  `::before` of `border/default`, with no hover.
- **Stories that assert the resting edge**: the Input's `Default`, pinned to
  light, the resting half of `Hover`, `BlankErrorIsNoError` and `StartsAtRest`;
  the Checkbox's `Hover`, before the pointer, pinned to light; the Select's
  `atRest`. The Checkbox's `Unchecked` asserts the edge's geometry, not its colour.
- **The checks**: `agent/scripts/verify/KN-004.mjs` checks `DESIGN.md`'s rows for
  Figma's own values and nothing more; `npm run contract` checks the cards against
  `DESIGN.md`.
- **Two controls built after the decision** draw their resting edge in
  `border/default` too: the Search Bar, `SearchBar.tsx` line 122, and the Sort
  Control, `SortControl.tsx` line 136.

## The approach

1. **`tokens.ts`**: `'border/control': '#7f8694'` after `border/error`, with a
   comment: the owner's addition, not a Figma variable, KN-273, text/secondary's
   hue made lighter to the last value at 3.3 on the three light backgrounds.
2. **`darkMode.ts`**: `'border/control': ensureContrast(deriveDark(semantic['border/control']), darkSurface, NON_TEXT_CONTRAST)`,
   beside the state borders, with a comment.
3. **`darkMode.test.ts`**: a block for the resting edge: 3.3 or more on the three
   light backgrounds, 3 or more on the three dark ones, and its hue kept. Two
   plants, each restored: `tokens.ts` back to `#e5e7eb` fails the light cases; the
   dark row back to `deriveDark(semantic['border/default'])` fails the dark ones.
4. **`DESIGN.md`**: under `### Colour, semantic`, a table of the owner's additions
   with `border/control`, `#7f8694`, KN-273 and what it is for; the decision of
   2026-09-10 names the role and says the Select, built since, uses it; the
   Select's description and the dark mode section say `border/control` where they
   speak of a control's resting edge.
5. **The components**: the Input's resting edge, the Checkbox's unchecked frame and
   the Select's field take `border/control`. The hover edges stay as drawn.
6. **The stories**: every assertion of a resting edge above moves to
   `border/control`; the Checkbox's `Unchecked` asserts its edge's colour, pinned
   to light as the Input's `Default` is.
7. **The Search Bar and the Sort Control** are not in this card: the decision names
   the Input, the Checkbox and the Select, and extending it is the owner's to say,
   so no card is filed for it; `DESIGN.md` records the question beside the
   decision.

## How I will know it works

- `tokens.test.ts`, `darkMode.test.ts` and the theme tests, with the two plants.
- `node agent/scripts/verify/KN-004.mjs` and `npm run contract` pass.
- The Input, Checkbox and Select stories under Vitest; the unit project; eslint;
  tsc.
- The Input, the Checkbox and the Select at rest in fa-IR and en-US, light and
  dark, drawn and looked at, with the edge's computed colour read.

## What I am unsure of

- **The name**, `border/control`.
- **The dark row clears 3 on the surface by 0.02**, as the state borders' walks
  stop at the line; the light row has the margin the owner asked for, the dark row
  the same rule as KN-271.
- **Pinning the Checkbox's `Unchecked` to light** takes the scheme toolbar from that
  story, as the Input's `Default` already is.
- **The Search Bar and the Sort Control**: the decision's heading is a rule for
  every control's resting edge, and its list was the controls there were.

## Plan review, Codex, 2026-09-15

Close, with three corrections, all taken. The values and the dark derivation
hold: `#7f8694` at 3.41, 3.66 and 3.32; `#707786` at 3.02 on the dark surface.
`agent/scripts/verify/KN-004.mjs` scans every hex in `DESIGN.md` and would refuse
`#7f8694`, so it models the owner's addition by its decision rather than through
an allow-list. The Input's and the Select's disabled fields drew their edge from
the resting colour, so they keep `border/default` on purpose and their Disabled
stories assert it; the Checkbox's disabled edge is its own. The Select belongs
here, the decision naming it; the Search Bar and the Sort Control do not, and no
card is filed for them, extending the role being the owner's decision. Pinning
the Checkbox's `Unchecked` to light is enough beside the dark unit ratios and the
look in four combinations.

## Result, 2026-09-15

**Built**: `border/control` in `tokens.ts` and its dark row in `darkMode.ts`; a
block in `darkMode.test.ts`, 3.3 on the three light backgrounds, 3 on the three
dark ones, and text/secondary's hue in both schemes. The Input's resting edge, the
Checkbox's unchecked frame and the Select's field draw it; the Input's and the
Select's disabled edges keep `border/default`. The stories that asserted a resting
edge assert `border/control`, the Input's and the Select's Disabled assert
`border/default`, and the Checkbox's `Unchecked` asserts its edge, pinned to light
and reading `disabled` from its args. `DESIGN.md` has the owner's additions table,
the decision naming the role and leaving the Search Bar and the Sort Control to
the owner, and the Select's and dark mode's wording. The docs call it the resting
border in both languages.

**`KN-004.mjs` was already failing at HEAD**, run on HEAD's `DESIGN.md`:
`#00000080`, `#00000029` and `#2563EB2E`, recorded after it last changed on
2026-09-10. It now knows `overlay/scrim` by its node, `377:6244`, and the two
shadows bound to no style by theirs, `401:436` and `137:44`, each row required to
say it is no style, besides the owner's addition by `KN-273`.

**Checked**:

- The two plants: `tokens.ts` back to `#e5e7eb` failed the three light cases; the
  dark row back to `deriveDark(semantic['border/default'])` failed the three dark
  ones; each file restored byte for byte.
- The theme's unit tests, 612; the unit project, 1393; the Input, Checkbox and
  Select stories, 53 of 53; eslint and tsc clean; `KN-004.mjs` and `npm run
contract` pass; formatter drift as at HEAD.
- On a production build, at rest: the Checkbox's `Default` and the Input's
  `ControlsMatchTheCanvas` in fa-IR and en-US, light and dark, and the Select's
  `ByKeyboard` in Persian light and dark, the story pinning its language. Every
  edge read `rgb(127, 134, 148)` in light and `rgb(112, 119, 134)` in dark, nothing
  focused.
