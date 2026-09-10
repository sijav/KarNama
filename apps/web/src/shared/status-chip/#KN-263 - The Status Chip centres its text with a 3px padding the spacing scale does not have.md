# KN-263 · The Status Chip centres its text with a 3px padding the spacing scale does not have

CHILD OF KN-010, the Status Chip, and found by the KN-238 roast.

**Why, from the board.** Every spacing in a component resolves to a token; the
no-literal rule is only checkable because the design is fully tokenised, and a
computed off-scale value is the same hole with a formula in front of it.
Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition, from the board.** The chip is the designed flex box again,
centred by alignment with no vertical padding, and the name truncates with an
ellipsis in an inner element; every story that measures the chip measures the
chip, not the name; KN-238's verifier still passes with its mutations; and no
padding or spacing in StatusChip.tsx resolves to anything but a spacing token or
zero.

## What the file draws

`get_design_context` on 84:4 and 398:6185, read for KN-238: a flex row,
`items-center justify-center`, a height of 24 or 28, `spacing/xs` at the sides,
a full radius, and no vertical padding. The label inside is its own text node,
`whitespace-nowrap`, `shrink-0`. So the file has two layers already, a box and
a label, and the inner-span shape is closer to it than KN-238's single block.

## The approach

1. The chip goes back to `display: inline-flex`, `align-items: center`,
   `justify-content: center`, the height, `spacing/xs` inline padding, border-box
   and `max-width: 100%`, with `dir="auto"` staying on it. `paddingBlock` and
   `verticalAlign` go: flex alignment centres the line, as the file does.
2. The name moves into an inner `span` that truncates: `min-width: 0`, so the
   flex item may shrink below its text, `overflow: hidden`,
   `text-overflow: ellipsis`, `white-space: nowrap`. The file's label is
   `shrink-0` because the file never has to cut one; here it must shrink.
3. Stories that measure the chip find it through a helper that takes the name's
   element and returns its parent, with a one-line comment saying why:
   FromArgs, ColumnHeaderSize, DisplayOnly and LongName. AllStatuses already
   takes the chips as the row's children. LongName measures the chip for its
   width and height and the name for the cut and the ellipsis.
4. AllStatuses asserts the top and bottom padding are 0 alongside the sides at
   8, so a vertical padding coming back fails a story, not only a scan.
5. KN-238's verifier anchors on the story's assertion text and on
   `textOverflow: 'ellipsis'` in the component; it follows the new shape.

## What changes

`StatusChip.tsx`, `StatusChip.stories.tsx`, `agent/scripts/verify/KN-238.mjs`,
and a new `agent/scripts/verify/KN-263.mjs`. DESIGN.md's section on a long name
still holds as written.

## What I am unsure of

- The baseline: inline-flex takes its baseline from its first item, so the chip
  sits in a line of text as it did before KN-238, which is the better outcome.
- `min-width: 0` is what lets a flex item shrink below its content; without it
  the inner span keeps its full width and nothing is cut. The LongName story is
  what proves it.
- An inner element changes what `getByText` returns in every story, which is why
  step 3 exists; missing one would measure a 22 tall span and fail on 28.

## How I will know it worked

`node agent/scripts/verify/KN-263.mjs`: the Status Chip stories pass;
StatusChip.tsx's padding values are the spacing token or zero, with no
`paddingBlock`; the chip is inline-flex and centred; a mutation adding a
vertical padding back fails AllStatuses; and KN-238's and KN-010's verifiers
pass.

## The check, and what changed after it

The second model found the approach sound and the simplest correct fix, with
no browser exception to the flex truncation pattern, and dir=auto on the chip
governing the inner span by inheritance. It asked that the verifier changes be
real: AllStatuses asserting zero top and bottom padding, LongName measuring the
chip for geometry and the name for the cut, KN-238's anchors moving to the
name span, and a mutation proving a vertical padding fails AllStatuses. It also
asked for a look at the rendered chips in every language and theme, since a
computed style is not proof. The helper takes the name element rather than the
name string, so a Persian literal stays inside getByText, which the lingui rule
exempts, instead of leaning on KN-214.
