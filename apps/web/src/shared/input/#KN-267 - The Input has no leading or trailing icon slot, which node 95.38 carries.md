# KN-267 · The Input has no leading or trailing icon slot, which node 95:38 carries

Beside `Input.tsx`, which is where the change lands.

**Why, from the board.** A component missing part of what the file draws is not
finished, and the icons are what later components build on. Critical on the
owner's order of 2026-09-10, as a finding on a built component.

**Exit condition, from the board.** The Input takes an optional leading and an
optional trailing icon, each 20 by 20 at spacing/2xs from the text in
text/secondary, matching 95:38 with the icons on, in both directions; stories
show each and both; and the label's boolean in the file is either honoured, with
the accessible name then required another way, or the decision not to is
recorded in DESIGN.md.

## What the file draws, read with use_figma on 2026-09-10

- The Input set, 95:38, has four booleans: Label, Helper Text, Leading Icon and
  Trailing Icon, the icons off by default.
- In the field, 95:5, auto layout horizontal with a gap of 4, spacing/2xs, and
  16 at each side: the icons are 20 by 20 rectangles, radius 4, filled
  `color/text/secondary`, the trailing one first in Figma's left-to-right array
  and the leading one last. The file is right to left, so the leading icon sits
  at the inline start, the right in Persian, and the trailing at the inline end.
  Code keeps the natural order and lets the direction place them, as DESIGN.md
  says about reversed arrays.
- On the Screens canvas, 5:7, all 91 Input instances keep the label on and turn
  both icons off. No screen uses a slot; the component carries them.

## The approach

1. **Two optional props**, `leadingIcon` and `trailingIcon`, React nodes, each
   given to MUI's `startAdornment` and `endAdornment` inside a slot: a 20 by 20
   inline-flex span, `iconSize.md`, coloured `text/secondary`, its own SVG
   stretched to fill it. Not hidden from assistive technology by the slot: an
   icon that is decorative says so itself, and one that is a button must stay
   reachable.
2. **The gap** is the field's `columnGap` of `spacing['2xs']`, so it sits
   between a slot and the text and nowhere else; with no icon there is one flex
   item and it does nothing. The field's paddings stay 16, so the icon is 16 from
   the edge and the text 40, 16 + 20 + 4, from the side the icon is on.
3. **The label stays required.** The file's Label boolean is never turned off on
   any of the 91 screen instances, and the label is the field's accessible name;
   DESIGN.md records that the boolean is not honoured and why, so a label-less
   field is a new decision, not a quiet prop.
4. **Stories**: LeadingIcon, TrailingIcon and BothIcons, fixed renders of the
   specimen with the file's own placeholder, a 20 by 20 square of radius sm in
   `currentColor`, controls disabled. Each measures the slot's size and colour,
   its distance from the edge and from the text, on the side the direction puts
   it.
5. **Docs** for the two props and three stories, both languages.
6. **DESIGN.md**: a section on the Input's icon slots and its label.

## What changes

- `Input.tsx`, `Input.stories.tsx`, `story-docs/{en,fa}/Shared-Input.md`,
  `DESIGN.md`, and `agent/scripts/verify/KN-267.mjs`.

## The verifier, clause by clause

1. The Input stories pass, the three new ones included.
2. **Both directions**, in a production build: with both icons, each slot 20 by
   20, `text/secondary`, 16 from its edge of the field and 4 from the text, the
   leading one at the inline start; with one icon, the text 40 from that side
   and 16 from the other.
3. **Mutations**: the gap removed fails BothIcons; the slot's size changed fails
   it; the adornments swapped, leading drawn at the end, fails LeadingIcon.
4. DESIGN.md records the slots and why the label stays required.

## What I am unsure about

- Whether MUI's InputBase adds its own spacing or classes around adornments.
  Its adornment props render the node as given; the `InputAdornment` wrapper,
  which adds margins, is not used.

## The check, and what changed after it

The second model confirmed MUI 9.4 renders the adornments as direct flex
children with no wrapper or margin, so one columnGap gives the 4 on each side,
and the label decision defensible. Three things taken. The distances to the
text are measured to the input's box, which KN-283 has shown is a proxy for
where the text starts; KN-283's exit covers every Input story, these three
included, so the slot geometry here is exact and the text start follows when
KN-283 lands. The slots are for decorative icons, drawn in currentColor so the
slot's text/secondary reaches them and hidden from assistive technology by
the icon itself; a button in a slot needs its own name, keyboard handling and
a target of 24, which a 20 slot does not give, so the docs say the slots are
not for actions. And the Label boolean is recorded as deliberately unsupported,
with a label-less variant needing an aria-label contract first.
