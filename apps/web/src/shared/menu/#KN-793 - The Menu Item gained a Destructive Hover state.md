# KN-793 · The Menu Item gained a Destructive Hover state

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and every menu in the redesign is made of Menu
Items.

**Exit**, from the board: the plan lists every difference between 181:22 in the
copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its stories
then draw the original's version of every variant, each new variant with a story
of its own, in fa-IR and en-US, light and dark, with both story-docs entries;
sizes, gaps, radii and colours resolve through the tokens; DESIGN.md's section
is corrected; lint, tsc and its tests pass.

## Every difference, read 2026-11-03 with use_figma in both files

Default, Hover, Disabled and Destructive are the same in both: 220 by 40,
`spacing/sm` at the sides, `spacing/xs` between icon and label, the label in
Body at Regular, `color/text/primary`, Hover's fill `color/bg/surface-secondary`,
Disabled `color/text/disabled`, Destructive `color/text/error`. What differs:

1. **A fifth state, Destructive Hover**, `961:2491`: the Destructive item with
   its fill bound to `red/100`, a Primitives variable, #FEE2E2, under the same
   `color/text/error`.
2. **Destructive now hovers into it**: its prototype's On hover goes to
   Destructive Hover, where in the copy a destructive item had no hover of its
   own and the code gave it the plain Hover's grey.

## The approach

1. `red/100` joins the token set as the file names it, beside `red/700`, and
   `DARK_FILLS`, so the dark palette takes a dark tint of its hue as it does for
   the other fills read with text on them; a test holds `text/error` at 4.5 to
   one on it in both schemes. In light it is 5.3.
2. The menu's destructive item fills with it under the pointer and under
   keyboard focus, which takes the hover fill as the plain item's does.
3. A DestructiveHover story by the runner's real pointer and one by the
   keyboard, in light and dark; both story docs; DESIGN.md's menu section and
   table row.

## How it is checked

The Menu's stories, the theme's tests, lint, tsc, and a look in both schemes.
