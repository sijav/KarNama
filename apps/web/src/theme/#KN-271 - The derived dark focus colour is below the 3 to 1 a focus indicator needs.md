# KN-271 · The derived dark focus colour is 2.81:1 on the surface, below the 3:1 a focus indicator needs

Beside `darkMode.ts`, which is where the change lands.

**Why, from the board.** Someone in the dark theme who moves by keyboard needs
to see where focus is, and the dark palette is derived by rules this repository
wrote, so no design review will catch it. KN-244's focus ring for an invalid
field is drawn in border/focus as well, so its measure cannot hold in dark
until this does. Critical on the owner's order of 2026-09-10, as a finding on
built components.

**Exit condition, from the board.** In the derived dark palette, border/focus
and border/error each reach at least 3:1 against bg/page, bg/surface and
bg/surface-secondary with their hue unchanged; darkMode.test.ts asserts all six
ratios, and a mutation back to the unchecked derivation fails it; DESIGN.md's
dark mode section says which borders are checked and at what ratio; and the
Input's Focus state and the Checkbox's focus ring are seen in dark in both
languages.

## What is there now

`darkSemantic` walks every text token away from the dark surface with
`ensureContrast` at 4.5, and puts every border through `deriveDark` alone. So
nothing ever measured a border. Measured through the real module:

| dark token     | value     | on bg/page | on bg/surface | on bg/surface-secondary |
| -------------- | --------- | ---------- | ------------- | ----------------------- |
| `border/focus` | `#2d69ec` | 3.22       | **2.81**      | 3.30                    |
| `border/error` | `#ed2c2c` | 3.70       | 3.23          | 3.80                    |

In light the design clears it: border/focus 4.82, 5.17 and 4.70, border/error
3.51, 3.76 and 3.42.

Four components draw in these two colours: the Input's focus border and its
error border, the Checkbox's hover border and focus ring, and the Filter Chip's
pressed border and focus outline.

## The approach

1. **A second bar, for the borders that show a state.** Next to `MIN_CONTRAST`,
   `NON_TEXT_CONTRAST = 3`, WCAG 1.4.11's ratio for the parts of a control that
   show its state, against what sits next to them. It is not 2.4.13's measure,
   which is the change between the focused and the unfocused control over an
   area; that one belongs to each component, KN-244 for the Input.
2. **Both state borders walked lighter until they clear it**, the same lever the
   text rows use: `ensureContrast(deriveDark(semantic['border/focus']),
   darkSurface, NON_TEXT_CONTRAST)`, and the same for border/error. Against the
   surface because it is the lightest of the three dark backgrounds, by the
   band remap's own ordering, so clearing it clears the other two; the test
   checks all three rather than trusting that. ensureContrast moves lightness
   only, so the hue stays. Probed through the real module: border/focus comes
   out `#3670ed`, lightness 0.551 to 0.571, hue 221.0 against the light token's
   221.2, at 3.48, 3.04 and 3.57. border/error already clears it and comes back
   unchanged, `#ed2c2c`; it goes through the check anyway, so a later change to
   the error token cannot slip under the bar unseen.
3. **border/default stays unchecked**, on purpose and said so in the code: it is
   the resting edge, not a state, and the light design itself draws it at 1.24
   on white, so a 3:1 rule on it would be a change to the design rather than
   the derivation.
4. **Tests in darkMode.test.ts**: an `it.each` over the two borders and the three
   backgrounds, six cases named by token and background, each asserting at
   least 3 written as the number, not the imported constant, so lowering the
   constant fails them; the hue of each checked border within a degree of its
   light token; and the light palette checked by the same six, as the chip test
   already does for the design's own pairs.
5. **DESIGN.md's dark mode section** gets a sentence: the two borders that show
   a state are then checked at 3:1 against the page, the surface and the
   secondary surface, and walked lighter in their own hue until they clear it,
   because the derivation alone left focus at 2.81:1 on the surface.
6. **A verifier**, `agent/scripts/verify/KN-271.mjs`, clause by clause: the unit
   test passes with all six ratio cases present by name; putting border/focus
   back to the unchecked derivation fails the surface case by name; lowering
   `NON_TEXT_CONTRAST` to 2.5 fails it too; the hue case fails when a border is
   given a different hue; DESIGN.md says which borders and what ratio.
7. **Seen in dark**, both languages: the Input focused, and the Checkbox and the
   Filter Chip focused by keyboard, in the production Storybook, with the
   rendered border colour read back against the new value.

## What changes

- `apps/web/src/theme/darkMode.ts`: `NON_TEXT_CONTRAST`, the two border rows.
- `apps/web/src/theme/darkMode.test.ts`: the six ratio cases, hue, light.
- `DESIGN.md`: the dark mode paragraph.
- `agent/scripts/verify/KN-271.mjs`.

## What I am unsure about

- Whether any story pins dark and asserts a border colour by its old hex. The
  stories read colours from the token modules rather than hexes, so a change
  should flow through, but the Storybook project runs in full to find out.
- Whether 3.04 is too close to the line to be worth it. It is the smallest
  change that clears the bar, the same policy the text rows follow, and the
  test holds the line rather than the value.
- Whether bg/brand/container or the danger fills should be in the set. A focus
  ring does not sit on them in any component built so far; the card names the
  three backgrounds a control sits on.

## How I will know it worked

`node agent/scripts/verify/KN-271.mjs` passes, the unit and Storybook projects
pass, lint and tsc are clean, and the screenshots show the focused Input,
Checkbox and Filter Chip in dark in both languages with the border at
`#3670ed`.

## The check, and what changed after it

The second model found the plan sound and minimal. It corrected one claim: 3:1
against the adjacent background is WCAG 1.4.11's test for a state indicator,
and 2.4.13 measures something else, the change between the focused and the
unfocused control over an area, which KN-244 owns. Step 1 and the DESIGN.md
sentence say so now. It agreed that walking against the surface is enough for
the three backgrounds because the six ratio tests prove each one rather than
trusting the ordering, that no built focus treatment puts border/focus against
a brand or danger fill, so the set should not widen, and that keeping
border/error in the checked path and border/default out of it is right. The
invalid Input keeps border/error when focused today; the ring in border/focus
is KN-244's planned work, not something already drawn.
