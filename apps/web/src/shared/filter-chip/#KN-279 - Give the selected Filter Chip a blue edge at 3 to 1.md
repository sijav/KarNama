# KN-279 - Give the selected Filter Chip a blue edge at 3:1, apart from its pressed edge

## The card

**Why**, from the board: Someone who cannot see a 1.2:1 fill cannot tell which
filters are on, and the Filter Chip is the status counter above the board. The
owner chose the edge on 2026-09-10.

**Exit condition**, from the board: A selected Filter Chip's edge is drawn in a
named role at 3:1 or more against bg/surface, bg/page, bg/surface-secondary and its
own fill, in light and in the derived dark, each ratio asserted by a unit test with
a mutation back to the fill-coloured edge failing it; the Selected story asserts
the edge; a pressed unselected chip is still told apart from a selected one, by at
least 3:1 between their two indicators or by a difference that is not colour, such
as the edge's width, and a focused chip beside a selected one keeps its ring
visibly apart from the selected edge, both asserted on rendered chips side by side,
including a chip held pressed from the keyboard; DESIGN.md records the edge under
the owner's decision of KN-276; and the chip is seen unselected, selected and
pressed in all four combinations.

Notes on the card: the exit was tightened after KN-276's roast, which showed a
colour nominally apart from `border/focus`, such as `#2563ec`, would pass while
pressed and selected looked the same; and KN-282 left the look of a selected chip
held pressed to this card.

## The owner's decision

`DESIGN.md`, "Settled by the owner on 2026-09-10", KN-276: the fill stays as drawn,
and the chip's one pixel edge, which it has in both states, turns a blue at 3 to
one or more on every surface and against the fill inside it, `#2563eb` in light.
That blue is already the chip's pressed edge, so selection gets an edge of its own
or is proved apart from pressing.

## Measured, 2026-09-15

With `darkMode.ts`'s own functions, copied into a script:

- `#2563eb` in light: 4.82 on `bg/page`, 5.17 on `bg/surface`, 4.70 on
  `bg/surface-secondary`, 4.24 on the selected fill `#dbeafe`, 4.70 on the hover
  fill.
- `border/focus` in dark, `#3670ed`: 3.48 on the page, 3.04 on the surface, 3.57 on
  the secondary surface, 3.33 on the dark selected fill `#022655`, KN-272's.
- What tells a pressed unselected chip from a selected one today, the edge aside:
  the hover fill against the selected fill, 1.11, and `text/secondary` against
  `text/brand`, 1.39. Neither is 3 to one.

## What is there

- **`FilterChip.tsx`**: the edge is a one pixel border on `::before`, in
  `border/default`, and `none` when selected, as 159:69 draws it; pressed,
  159:67, is an inset shadow of 1.5 in `border/focus` with the `::before` turned
  `border/focus`; the focus ring is three pixels of `border/focus` on `::after`,
  just inside the edge, from 1 to 4, KN-294.
- **The stories**: `Default` reads its args and expects the edge `['none', 0]`
  when selected and `['solid', 1]` otherwise; `Selected` expects `none`;
  `FocusedInAClippingHost` draws an unselected and a selected chip in hosts that
  clip and measures the ring on each. No story holds a chip pressed.
- **`darkMode.test.ts`**: `border/focus` clears 3 on the dark brand container, "as
  a pressed selected Filter Chip draws it", and the light pair too.
- **`DESIGN.md`**: the ring section already says a selected chip's one pixel edge
  sits outside the ring, so focus is told from pressed and from selected by its
  width; the stroke section says "none when selected", with the owner's blue edge
  to come.
- **`KN-004.mjs`** models the owner's additions by their decisions since KN-275.

## The approach

1. **`tokens.ts`**: `'border/selected': '#2563eb'`, the owner's addition of KN-276,
   beside `border/control`.
2. **`darkMode.ts`**: `border/selected` derived and walked to 3 against the dark
   surface and then against the dark selected fill,
   `deriveDarkFill(semantic['bg/brand/container'])`: `#3670ed` today, the dark
   `border/focus`.
3. **`darkMode.test.ts`**: 3 or more against the three light backgrounds and the
   light fill, and against the three dark ones and the dark fill. Two plants, each
   restored: the light role put back on the fill's `#dbeafe` fails the light
   cases; the dark row put back on the dark fill fails the dark ones.
4. **`FilterChip.tsx`**: the `::before` edge solid in both states, one pixel,
   `border/default` unselected and `border/selected` selected. Pressed and focus
   stay as they are.
5. **The stories**: `Default` expects a selected chip's edge solid, one pixel, in
   `border/selected`; `Selected` asserts it. A new story draws an unselected, a
   selected and a focused unselected chip side by side. At rest their indicators
   read one pixel grey, one pixel blue and a three pixel ring. Under the story-test
   flag, Space is held on the unselected chip through `vitest/browser`, and its
   pressed indicator reads 1.5 against the selected chip's 1; the key is released
   after. In the published Storybook, with no runner to hold a key, it asserts the
   resting half, as `Hover` does.
6. **`DESIGN.md`**: the owner's additions table gains `border/selected`, `KN-276`,
   `#2563eb`; the decision says KN-279 built it and how pressing is told apart; the
   ring and stroke sections in the present tense.
7. **`KN-004.mjs`**: `ownerAdditions` gains `border/selected` under `KN-276`.
8. **The docs**, both languages: `Selected` names the edge; the new story's entry.

## How I will know it works

- `darkMode.test.ts` and the theme tests with the two plants; the unit project;
  `KN-004.mjs` and `npm run contract`.
- The Filter Chip stories under Vitest, the pressed half run; eslint; tsc.
- The chip unselected, selected and pressed in fa-IR and en-US, light and dark, on
  a production build with a real pointer held down, drawn and looked at.

## What I am unsure of

- **Half a pixel.** The selected edge is the owner's one pixel in `#2563eb`; the
  pressed edge is the file's 1.5 in the same blue. Their width is the only
  difference the file and the decision leave, 1 against 1.5, while the fills
  differ by 1.11 and the text by 1.39. That meets the exit's words, "a difference
  that is not colour, such as the edge's width", and may still be too little to
  see.
- **A selected chip held pressed** draws the 1.5 over its 1, as KN-282 left it.
- **`border/selected` equals `border/focus`** in value in both schemes; its name is
  its only difference, which is what lets it change on its own.
- **Holding Space through `vitest/browser`** so Chromium applies `:active` has not
  been done in this repository yet.

## Plan review, Codex, 2026-09-15

Sound. `border/selected` is the simplest honest named role: equal to
`border/focus` today, named, derived, tested and documented apart, so it can change
alone. One pixel against the pressed 1.5 is an honest reading of "a difference that
is not colour, such as the edge's width": the 1.5 is the file's, the one pixel the
owner's, and a shadow's spread is not floored as a border's would be. It is a
subtle difference, so the side-by-side assertion and a look by eye are the
evidence; a wider edge or another marker would change settled states and needs the
owner. The likeliest failure is focus in the story that holds Space: it clicks the
chip with `vitest/browser`'s own `userEvent.click` first, then
`keyboard('{Space>}')` and `keyboard('{/Space}')`, which Vitest 4.1.11's Playwright
provider sends as a real key held and released. A three pixel ring beside a one
pixel selected edge is a difference of width large enough.

## Result, 2026-09-15

**Built as planned**: `border/selected` in `tokens.ts`, `#2563eb`, and its dark row in
`darkMode.ts`, walked against the dark surface and the dark selected fill,
`#3670ed`; a block in `darkMode.test.ts` asserting 3 or more against the page, the
surface, the secondary surface and the selected fill in both schemes; the Filter
Chip's `::before` solid in both states, one pixel, `border/default` and
`border/selected`; `Default` asserting a selected edge at 3 or more on its fill;
`Selected`, pinned to light, asserting one pixel of `border/selected`; a new story,
`ToldApartFromSelected`; `DESIGN.md`'s owner's additions table, decision, ring and
stroke sections; `KN-004.mjs`; the docs in both languages.

**Checked**:

- Three plants, each restored byte for byte: the light role on the fill's
  `#dbeafe` failed the four light cases; the dark row on the dark fill failed the
  four dark cases and the existing floor test; the pressed edge made one pixel
  failed `ToldApartFromSelected` with `expected [ 1, '#2563eb' ] to deeply equal
[ 1.5, '#2563eb' ]`, so its held Space is measured.
- The theme's unit tests, 622; the Filter Chip stories, 8 of 8; the unit project
  1401 of 1403, the two failures `core/api/session.test.ts`, which passes alone,
  KN-551's; eslint and tsc clean; `KN-004.mjs` and `npm run contract` pass;
  formatter drift as at HEAD, 29 for the stories.
- On a production build, `Default` in Persian and `InEnglish` in English, light and
  dark, unselected, selected through the URL args and held pressed by a real
  pointer: the edge `rgb(229, 231, 235)` unselected and `rgb(37, 99, 235)`
  selected in light, `rgb(20, 22, 26)` and `rgb(54, 112, 237)` in dark; pressed,
  `:active`, a one pixel edge and an inset shadow of `1.5px` in the same blue.
  Looked at.
