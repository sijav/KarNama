# KN-266 · The Input's border takes layout space, so its text sits a pixel inward of the file

Beside `Input.tsx`, which is where the change lands.

**Why, from the board.** Every Input sits a pixel off the file, and the 15px
focus padding is the same computed off-scale value KN-263 removes from the
Status Chip. Critical on the owner's order of 2026-09-10, as a finding on a
built component.

**Exit condition, from the board.** In every state the Input's text sits
spacing/md, 16px, from the field's outer edge, as 95:5 and 95:19 draw it, with
the stroke painted inside that padding and taking no layout space; no padding in
Input.tsx is computed from a border width; the Default and Focus stories measure
the text's distance from the edge at 16; and the other bordered components are
checked for the same offset, each matching or carrying a card.

## What the file draws, read with use_figma on 2026-09-10

| node                         | stroke           | aligned | in layout | padding at the sides | text from the edge |
| ---------------------------- | ---------------- | ------- | --------- | -------------------- | ------------------ |
| Input field 95:5, Default    | 1                | INSIDE  | no        | 16                   | 16                 |
| Input field 95:19, Focus     | 2                | INSIDE  | no        | 16                   | 16                 |
| Checkbox 204:11, all five    | 1.5              | INSIDE  | no        | none, 20 by 20       | a centred glyph    |
| Filter Chip 159:71           | 1, 1.5 pressed, none selected | INSIDE | no | 12                 | 12                 |
| Tooltip 410:469              | none             |         |           | 12                   |                    |

The Input draws a CSS border, which is laid out, so its text sits at 17, and
focus holds it there by dropping the padding to 15. The Filter Chip has the same
offset, 13 for 12, and draws its pressed edge at 1 for 1.5: KN-282. The
Checkbox draws its frame at 1 for 1.5, and its comment says the file draws every
border at one: KN-281. The Tooltip and the Status Chip draw no stroke and match.

## The approach

1. **The stroke becomes a pseudo-element's border.** `&::before`, absolutely
   positioned over the whole field, inset 0, with the radius inherited, pointer
   events off, and the border the field used to have: one pixel of `border/default`,
   `border/error` in error, `text/secondary` on hover, two pixels of
   `border/focus` or `border/error` on focus. The root keeps `position: relative`
   and loses its own border, and its padding is `spacing.md` in every state.
2. **Why a pseudo-element's border** and not the alternatives: an inset
   box-shadow is removed by Windows' forced colours, which would leave the field
   with no edge at all in high contrast; an outline is already the root's focus
   ring for an invalid field, KN-244; and a border on the root is laid out, the
   thing being fixed.
3. **The stories read the edge from `::before`** through `getComputedStyle`,
   already exempt from the lingui rule for its pseudo-element argument, KN-248,
   and measure the text's distance from the field's edge on both sides, since the
   input fills the field between its paddings: 16 and 16, in Default, Focus
   before and after, WithError, FocusedWhileInvalid, Disabled and Hover.
4. **DESIGN.md** gets a section, "A stroke is drawn inside, and takes no space",
   with the table's widths, the reason for the pseudo-element, and the two
   cards.
5. **The verifiers anchored on the lines this moves** follow: KN-011, KN-241,
   KN-243 and KN-248 inserted their mutations after the focused padding that is
   going, so they anchor on the focused block's opening line instead; KN-011's
   focus mutation and hover anchor move to the pseudo-element; and KN-244's
   "text does not move" mutation, which dropped the compensating padding, now
   changes the focused padding instead.

## What changes

- `Input.tsx`: the pseudo-element edge, one padding, no computed one.
- `Input.stories.tsx`: the edge read from `::before`, the text inset measured.
- `DESIGN.md`: the new section.
- The verifiers for KN-011, KN-241, KN-243, KN-244 and KN-248.
- `agent/scripts/verify/KN-266.mjs`.

## The verifier, clause by clause

1. The Input stories pass.
2. **Every state, both directions**, in a production build: Default, Filled,
   Focus, WithError, FocusedWhileInvalid, Disabled and Hover, in fa-IR and
   en-US, the text 16 from the field's edge on both sides, the root's own border
   zero, and the edge on `::before` at the width the file draws.
3. **No padding computed from a border width**: every padding in `Input.tsx` is
   a spacing token or zero, and nothing subtracts from one.
4. **THE CASE**: a laid-out border put back on the root fails Default on the
   text's distance, by name.
5. A padding change on focus fails Focus.
6. **The edge survives forced colours**: with forced colours emulated, the
   `::before` border is still there; the same check with the edge as an inset
   shadow fails, which is the reason for the choice.
7. **The other bordered components**: KN-281 and KN-282 exist with their
   subjects, and the Tooltip and Status Chip draw no border.
8. The verifiers of KN-011, KN-241, KN-243, KN-244 and KN-248 still pass.

## What I am unsure about

- Whether MUI's InputBase root is already `position: relative`. It is set
  explicitly either way.
- Whether a pseudo-element over the field interferes with clicking into it or
  selecting text. It takes no pointer events and paints only a border over the
  padding, so it should not; the LabelIsBound and Typing stories exercise both.
- KN-274, the focus ring outside a field that fills its container, is untouched
  by this; the edge now lives inside the field, the ring still outside.

## How I will know it worked

`node agent/scripts/verify/KN-266.mjs` passes, the Input stories, the unit
project, lint and tsc pass, and the field looks the same in all four
combinations with its text a pixel further out.
