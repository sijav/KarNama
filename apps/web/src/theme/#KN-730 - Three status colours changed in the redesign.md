# KN-730 · Three status colours changed in the redesign: interview, custom-1 and custom-4

**Why**, from the board: interview is a default status, so every board shows
the old amber where the design now draws teal, and the accepted outcome cannot
match the design while custom-1 holds the old value.

**Exit**, from the board: tokens.ts and DESIGN.md's status table carry the three
new pairs and no file holds the six old values; the derived dark pairs still
pass the contrast check darkMode.ts runs; the StatusChip stories show the three
in fa-IR and en-US, light and dark; and get_variable_defs on 7:2 agrees with
tokens.ts for all nine status pairs.

## What the file holds, read 2026-11-03 with use_figma

Its local variables: `color/status/interview` is `petrol/700` #0F6876 over
`petrol/100` #D7F0F4, `color/status/custom-1` `orange/700` #C2410C over
`orange/100` #FFEDD5, and `color/status/custom-4` `fuchsia/700` #A21CAF over
`fuchsia/100` #FAE8FF; the other six pairs are tokens.ts's. Its card note's
other names, from DESIGN-HANDOFF.md's foundations, checked the same way:

- `color/text/secondary-strong`, `gray/600` #4B5563, and `color/data/bar`,
  `accent/400` #60A5FA, are real variables the code lacked.
- `size/icon-sm` 16, `size/icon-md` 20, `size/icon-lg` 24 and
  `size/touch-target-min` 44: the code's icon sizes were called `sm`, `md` and
  `base`, and it had no touch target.
- The five text styles and the two effect styles, Elevation/Card and
  Elevation/Modal, are tokens.ts's already.
- The bottom message's button colour, #93C5FD, has no variable; the toast that
  draws it, KN-764, makes its token with the surface it sits on.

## The approach

1. The three pairs into tokens.ts and DESIGN.md's status table; darkMode.ts
   derives their dark pairs as it does every status's, and its tests hold them.
2. `text/secondary-strong`, derived as text is, and `data/bar`, derived as a
   mark held to 3 to one, join the token set and DESIGN.md's token table, in
   the table's own format so its drift holds.
3. The icon sizes take the file's names, `lg` for `base`, and `touchTarget.min`
   joins them in DESIGN.md's size block and its test.
4. The period switch's unchosen word takes `text/secondary-strong`, as KN-782
   left for this card; KN-683 and KN-668, the other texts on that grey, get the
   token as their answer.
5. StatusChip stories of every pair in English and in dark beside the Persian
   light one.

## How it is checked

The theme's and icon's unit tests, the StatusChip, period switch, icon, button,
navigation, colour picker and status picker stories, lint, tsc, the
variables read against tokens.ts, and a look at the nine chips in both schemes.
