# KN-244 · A focused invalid Input shows focus by one pixel of the same red

Beside `Input.tsx`, which is where the change lands.

**Why, from the board.** The person tabbing back into a field that failed
validation is exactly the person who needs to see where focus is. Critical on
the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition, from the board.** A focused invalid field differs from the
same field unfocused by at least a two-pixel perimeter changed at 3:1 contrast
or more, the WCAG 2.4.13 measure the ordinary Focus state already meets; the
field's border stays border/error so the error is still visible; the text does
not move; DESIGN.md's section records the treatment, the measure and the
reason; and FocusedWhileInvalid asserts it, with a mutation back to the
one-pixel treatment failing that story by name.

## What is there now

KN-241 decided, and DESIGN.md records, that a focused invalid field keeps the
error colour and takes the focus width: two pixels of `border/error`. Unfocused
it has one pixel of `border/error`. So focus changes one pixel, the inner one,
from `bg/surface` white to red, 3.76:1, and the outer pixel is red before and
after, 1:1. Half the area 2.4.13 asks for, and nothing at all to someone who
cannot resolve a pixel.

## The treatment

**Keep the red border as KN-241 set it, and add the system's focus ring round
it**: `outline` two pixels of `border/focus` at an offset of two, when the field
is focused and invalid. That is the ring the Checkbox (KN-013) and the Filter
Chip (KN-017) draw, same width, same offset, same token, so it is the one focus
sign the product already uses rather than a new one. They draw it on keyboard
focus only; the Input draws it on any focus, because `.Mui-focused` is set
however the field got focus, the same as the field's own focus border.

Why this over the alternatives:

- **A red ring instead of a blue one** would also pass: 3.76:1 on white and
  3.42:1 on `bg/surface-secondary`, all above 3:1. It is set aside for one
  reason, which is a design choice rather than a standards one: the product
  would have two focus signs instead of one.
- **A third pixel of red** changes two pixels at 3.76:1, which meets the letter
  of the measure, but a three pixel stroke is on no scale the file uses, and it
  moves the text unless the padding is computed from the border width again,
  the very thing KN-266 is removing.
- **The field's own border turned blue** is what KN-241 rejected: it hides the
  error while the user is fixing it.

The ring is drawn by `outline`, which takes no layout space, so the text cannot
move for it. It follows the border radius in current Chrome, Firefox and
Safari. An outline is also kept in Windows' forced colours mode, where a box
shadow ring is removed, though its colour is then the system's, not blue. It
sits four pixels outside the field, so a container that clips its overflow has
to leave that room, the same as for the Checkbox; DESIGN.md says so.

## The measure, worked

Focused against unfocused, over the ring's band: the two pixels outside the
field go from whatever is behind it to `border/focus`.

| behind the field       | light  | dark (derived, after KN-271) |
| ---------------------- | ------ | ---------------------------- |
| `bg/surface`           | 5.17   | 3.04                         |
| `bg/page`              | 4.82   | 3.48                         |
| `bg/surface-secondary` | 4.70   | 3.57                         |

The band lies outside the field, so its area is larger than a two pixel
perimeter of the field itself. The inner red pixel still changes as well; it is
not counted.

## What changes

- `Input.tsx`: the `&.Mui-focused` rule gains the outline, only when there is an
  error. The valid Focus state is drawn in 95:17 with its blue border and no
  ring, so it stays exactly as drawn.
- `Input.stories.tsx`, FocusedWhileInvalid: besides the two pixels of
  `border/error` it already asserts, it measures the text before and after
  focus with `textLayout`, as Focus does, and asserts the ring: width at least
  two, solid, offset at least zero so the ring lies outside the field,
  `border/focus` as its colour, and its contrast with the backdrop behind the
  field at least 3, computed from the rendered colours, not the tokens, so the
  measure itself is what is asserted. The story renders the field three times,
  each in an opaque backdrop of one surface it sits on, `bg/surface`, `bg/page`
  and `bg/surface-secondary`, asserts each backdrop is that token, and tabs
  through them. `contrast` comes from `theme/darkMode`, which is where the WCAG
  formula already lives, with a small helper turning a computed `rgb()` into
  the hex it takes.
- `DESIGN.md`, "The Input focused while invalid": the treatment, the measure
  with its numbers, the reason, and the four pixels of room. It keeps the words
  KN-241's verifier reads.
- `agent/scripts/verify/KN-244.mjs`.

## The verifier, clause by clause

1. The Input stories pass.
2. **THE CASE**: the ring removed, the one-pixel treatment back, fails
   FocusedWhileInvalid by name.
3. A fourth backdrop of `bg/brand/default`, the ring's own colour, fails it on
   the contrast assertion, 1:1: the contrast clause, proved to measure.
4. A one pixel ring fails it: the two pixel clause.
5. A ring drawn inside the field, offset -4, fails it: the area clause.
6. The focused invalid border turned `border/focus` fails it: the border stays
   `border/error`.
7. The padding compensation dropped for an invalid field, so its text moves a
   pixel on focus, fails it: the text does not move.
8. DESIGN.md's section names the ring, 2.4.13, the ratio, the two pixels, and
   the reason.
9. KN-241's verifier still passes.

## What I am unsure about

- Whether a blue ring beside a red border reads as focus rather than as a second
  state. It is the product's only focus ring, and the red border and the red
  message beneath still say what is wrong; I will look at it in all four
  combinations.
- Whether the owner would rather decide this. The exit condition asks for a
  recorded treatment, and KN-241's was the author's; this one is recorded the
  same way, with the reason, so it can be argued with.
- The four pixels of room: nothing built clips an Input today, but a future
  scroll container with no inline padding would cut the ring's sides.

## How I will know it worked

`node agent/scripts/verify/KN-244.mjs` passes, the Input stories, lint and tsc
pass, and the production Storybook shows the ring round the red field in fa-IR
and en-US, light and dark.

## The check, and what changed after it

The second model found the treatment sound: WCAG counts a solid two pixel
outline at an offset as a passing perimeter, and neither the gap nor the ring
lying outside the field reduces its area. Three corrections, all taken. A red
ring clears 3:1 too, so it is set aside as a design choice, one focus sign,
not as a failure. The contrast against the first opaque ancestor holds only
for a plain fixture, so the story now renders an explicit opaque backdrop for
each surface and measures the ring against that. And `.Mui-focused` is any
focus, not keyboard focus, so the plan no longer calls the ring keyboard only.
It also noted that in forced colours the outline stays but takes a system
colour, so nothing asserts blue there.
