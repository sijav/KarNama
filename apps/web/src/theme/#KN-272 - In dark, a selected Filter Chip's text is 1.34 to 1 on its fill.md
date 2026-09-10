# KN-272 · In dark, a selected Filter Chip's text is 1.34:1 on its fill, and its pressed border 1.14:1

Beside `darkMode.ts`, which is where the change lands.

**Why, from the board.** A selected filter is the one the user is looking at, and
in the dark theme its label cannot be read. The Filter Chip doubles as the status
counter above the board, so this lands on the main screen once screens exist.
Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition, from the board.** In the derived dark palette
bg/brand/container is a dark tint of its own hue, derived as a fill the way the
status containers are, text/brand clears 4.5:1 on it and border/focus clears 3:1
on it, and every pair the tests already hold still holds; darkMode.test.ts
asserts both pairs as the Filter Chip draws them, and a mutation back to the
surface derivation fails them; and the selected Filter Chip, resting and
pressed, is seen in dark in both languages.

## What is there, measured through the module

`bg/brand/container` goes through `deriveDarkSurface`, which hands a chromatic
colour to `deriveDark`; the flip and the chromatic floor turn the pale `#dbeafe`
into a bright `#207df9`. Under it `text/brand` is 1.34:1 and the pressed
`border/focus` 1.14:1.

## The approach

1. **Derive it as a fill**, `deriveDarkFill`, the rule the status containers
   already use: a dark tint of its own hue in the fill band. Probed: `#022655`,
   hue 214.0 against the light 214.3; `text/brand` on it 5.10:1 and
   `border/focus` 3.33:1, with no further walk needed.
2. **The lightness floor test exempts it**: "gives every chromatic colour a
   lightness floor" reads every chromatic dark token and would refuse a dark
   fill; it is about text and accents, so it skips the tokens derived as fills,
   named in the test, and the fill gets its own assertions.
3. **Tests**, a describe for the selected Filter Chip's pairs: `text/brand` on the
   dark fill at 4.5 or more, `border/focus` on it at 3 or more, both written as
   numbers, the fill's hue within a degree of the light container's, and the
   light pairs held as well, 5.49 and 4.24.
4. **A verifier**: the tests pass by name; `deriveDarkSurface` back for the
   container fails both pair cases; the fill band check; the selected chip,
   resting and pressed, read in a production build in dark in both languages.

## What I am unsure about

- The fill is 1.10:1 against the dark surface, so in dark the selected state is
  still told apart by little more than colour, as it is in light at 1.22:1; that
  is the owner's KN-276, which KN-279 builds, and it waits for this card.
