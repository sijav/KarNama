# KN-282 · The Filter Chip's text sits at 13 where the file draws 12, and its pressed edge is 1 where the file draws 1.5

Beside `FilterChip.tsx`, which is where the change lands.

**Why, from the board.** The Filter Chip is the status counter above the board,
drawn a pixel off the file in every state, and its pressed state is not the one
drawn. Critical on the owner's order of 2026-09-10, as a finding on a built
component.

**Exit condition, from the board.** In every state the Filter Chip's text sits
spacing/sm, 12px, from the chip's outer edge as 159:63 to 159:69 draw it, with
the edge painted inside and taking no layout space; the pressed edge is 1.5 as
159:67 draws it; nothing in FilterChip.tsx computes a padding from a border
width; the stories measure the text's distance from the edge; and the selected
edge is left to KN-279.

## What the file draws, read with use_figma on 2026-09-10

| variant           | stroke | aligned | in layout | padding, top right bottom left | text at |
| ----------------- | ------ | ------- | --------- | ------------------------------ | ------- |
| 159:63 Default    | 1      | INSIDE  | no        | 0 12 0 12                      | 12, 5   |
| 159:65 Hover      | 1      | INSIDE  | no        | 0 12 0 12                      | 12, 5   |
| 159:67 Pressed    | 1.5    | INSIDE  | no        | 0 12 0 12                      | 12, 5   |
| 159:69 Selected   | none   |         |           | 0 12 0 12                      | 12, 5   |

Every variant is 32 tall with the 22 line of `body` centred in it, which is the
5 above the text. `FilterChip.tsx` draws a laid-out one pixel border, with
`paddingInline` spacing.sm and `paddingBlock` spacing/2xs: the text sits at 13
from the side, and 4 of padding above it plus the border's 1 lands it at 5, a
padding the file does not have making up for a border the file does not lay
out.

## The approach

1. **The edge is drawn the way KN-266 and KN-281 settled**: a one pixel edge as
   a border on a `::before` laid over the chip, painted over its padding, since
   a whole pixel is a border Chromium draws exactly and forced colours keep; and
   the pressed 1.5 as an inset shadow of 1.5 on the chip, since Chromium floors
   a 1.5 border to 1, measured for KN-281. Pressed keeps the one pixel border
   under the shadow, so under forced colours, where the shadow is removed, the
   pressed chip still has its edge.
2. **The padding is the file's**: 12 at each side, none above or below, the text
   centred in the 32 by alignment. Nothing is computed from a border width.
3. **Selected draws no edge of its own**, as 159:69 draws none, until KN-279
   gives it the owner's blue edge; today the selected chip's border is the fill
   colour, invisible, and laid out, so removing it changes nothing visible.
4. **Stories**: the text's distance from the chip's outer edge, measured from
   the label's own text node with a Range, which is where the glyphs are, since
   the chip's text is a text node, not an input's box, so KN-283's proxy does
   not arise here. Default, Selected and a new Pressed story measure 12 at both
   sides and a chip 32 tall with no border of its own; Pressed asserts the
   inset 1.5 shadow and the one pixel edge under it.
5. **Pressing, in the story**: `:active` is the browser's own state and no
   dispatched event sets it. Chromium puts a focused button into `:active`
   while Space is held, so under the test runner the story Tabs to the chip and
   holds Space through `vitest/browser`'s real keyboard, reads the edge, and
   lets go; in the published Storybook it returns before pressing, the Hover
   story's pattern, and the chip is there to press by hand.
6. **The DESIGN.md stroke section** says KN-282 draws the chip's edges, not that
   it will.

## What changes

- `FilterChip.tsx`: the edge on `::before`, the pressed shadow, the padding.
- `FilterChip.stories.tsx`: the measurements, and the Pressed story.
- `story-docs/{en,fa}/Shared-FilterChip.md`: the Pressed story's entry.
- `DESIGN.md`: the stroke section's sentence on the chip.
- `agent/scripts/verify/KN-282.mjs`: new.

## The verifier, clause by clause

1. The Filter Chip stories pass, Default, Selected and Pressed by name.
2. **THE CASE**: the border put back on the chip itself, laid out, fails Default
   by name on the text's distance, 13.
3. A pressed edge of 1 fails Pressed by name.
4. No padding in `FilterChip.tsx` is computed from a border width, and none
   runs above or below the text.
5. **In a production build**, in both languages, light and dark: the text 12
   from both sides at rest, selected and pressed with a real pointer held down,
   the chip 32 tall with no border of its own, the pressed shadow 1.5.
6. **Under forced colours**, where shadows are removed, a resting and a pressed
   chip still show an edge in the rendered pixels.

## Unsure

- Whether Chromium sets `:active` on a button while Space is held from a
  keyboard the test runner drives through the DevTools protocol, which the
  first run settles.
- Whether a Range over the button's text measures the glyph run's advance
  edges exactly, or rounds; the check allows no more than a hundredth.

## The check, and what changed after it

The second model found the styling sound and the simplest durable one, the
chip being a plain `Box` button with no MUI internals to interfere. Taken:

- **The pressed state is proved in the production build** with a real pointer
  held down, not in a story by a held Space, since nothing guarantees that a
  keydown driven through the protocol puts a button into `:active`. So there is
  no Pressed story; the stories hold the stable geometry, and the verifier reads
  pressed, and selected and pressed, with the pointer down.
- **The label is one span**, a flex item, and its box is measured against the
  chip's, rather than a Range over the glyphs, whose bounds move with overhang
  and shaping in either script.
- **The whole state matrix** is read: at rest, hovered, pressed, selected, and
  selected and pressed, in both languages, light and dark.
