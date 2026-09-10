# KN-238 · A long renamed status name pushes the Status Chip out of its column

CHILD OF KN-010, the Status Chip, and found by its roast.

**Why, from the board.** Renaming statuses is a feature the product advertises,
and the first long name a user types breaks the board's layout. Critical on the
owner's order of 2026-09-10, as a finding on a built component.

**Exit condition, from the board.** A status name longer than its container is
truncated with an ellipsis inside the chip, which never grows past its
container; the full name stays readable by a screen reader; a story renders a
long name inside a 276px container and asserts nothing overflows; and DESIGN.md
records the decision.

## What the file says, read again for this card

get_design_context on 84:4 (S) and 398:6185 (M): a flex row, centred, a height
of 24 or 28, spacing/xs at the sides, a full radius, and NO width. Every variant
is 72 or 81 wide only because every one shows the same placeholder label,
«پیشنهاد کار». So the chip hugs its label, as DESIGN.md says, the label never
wraps (nowrap, shrink-0), and the file draws no long name at all: cutting one
is a decision. The label also carries dir="auto".

## The approach

1. The chip is a single `span` today, `display: inline-flex`, centred, with
   `white-space: nowrap` and no maximum width, so a long name makes it as wide as
   the name. Make it `display: inline-block` with `max-width: 100%`,
   `overflow: hidden` and `text-overflow: ellipsis`.
2. Why inline-block rather than keeping the flex box and adding an inner span:
   `text-overflow` cuts the text of a block container, and a flex container's
   text is an anonymous flex item that no style on the container reaches. An
   inner span would change the element every existing story finds by its text,
   and its height, which those stories measure.
3. Keep the drawn geometry exact: height stays 24 or 28, border-box, the side
   padding stays `spacing/xs`, and the vertical centring the flex box gave comes
   from block padding instead, `(height − line height) / 2`: 4 for S (24 − 16)
   and 3 for M (28 − 22). `vertical-align: middle` so an inline-block with
   `overflow: hidden`, whose baseline would otherwise drop to its bottom edge,
   still sits centred in a line of text.
4. The name stays the element's whole text, so a screen reader reads all of it;
   only the painting is cut.
5. A `LongName` story: a Size=M chip with a long Persian renamed status, inside a
   276-wide box, the column header's width from `241:2`. It asserts the column
   does not scroll sideways, the chip is exactly as wide as the column, the text
   is cut (scrollWidth over clientWidth), the computed `text-overflow` is
   `ellipsis`, the height is still 28, and the chip's text is the whole name.
   Controls disabled: it is a fixed render.
6. DESIGN.md: a section, "A long status name is cut, not wrapped", as a
   decision, since `82:2` only draws short names.
7. Story docs for `LongName` in both languages.
8. `dir="auto"` on the chip, added after the first plan check. A status name is
   typed by the user, in either script, so the chip takes its direction from
   the name rather than the page. Without it, an English name in the Persian UI
   is an LTR run in an RTL box: it overflows past the LEFT edge, and the
   ellipsis there hides the START of the name, showing its end. With it, the
   start is kept in both scripts. The label in 84:4 carries dir="auto" too. A
   second story, `LongNameInEnglish`, renders the Persian name with the English
   locale and asserts the chip is rtl, which it is only through dir="auto".

## What changes

- `StatusChip.tsx`: the display, padding, max-width, overflow and ellipsis.
  The `backgroundColor` and `color` lines and `HEIGHT` stay byte-identical,
  because KN-010's verifier mutates them.
- `StatusChip.stories.tsx`: `Box` import, `LONG`, the `LongName` story.
- `story-docs/{en,fa}/Shared-StatusChip.md`: the story's note.
- `DESIGN.md`: the new section.
- `agent/scripts/verify/KN-238.mjs`: already written.

## What I expect to be hard, and what I am unsure of

- The baseline. Moving from inline-flex to inline-block changes how the chip
  aligns when it sits in a line of text rather than in a flex row. Every place
  the design puts a chip is an auto-layout frame, a flex row in code, where
  `vertical-align` does nothing, so I expect no visible change; `middle` is the
  choice for the inline case.
- Whether a sighted user should get the full name some other way, a tooltip on
  hover. The exit condition does not ask for it and the chip is display only
  with no hover state in `82:2`; a tooltip would be a new interaction on a
  component the design says has none. I am leaving it out and saying so.
- Persian glyphs at 12/16 inside `overflow: hidden`: descenders below the line
  box are still inside the 4px of block padding, so nothing should clip. The
  AllStatuses story would show a clipped glyph only by eye, not by assertion.

## How I will know it worked

`node agent/scripts/verify/KN-238.mjs`: the Status Chip stories pass, `LongName`
asserts everything above, taking `maxWidth` out fails `LongName`, taking the
ellipsis out fails `LongName`, and DESIGN.md has the section. Then the tests for
the files changed, lint and tsc, and KN-010's and KN-239's verifiers, which
anchor in the same two files.

## The second check, and what changed after it

Both checks found the approach sound. The second confirmed the bidi reasoning
and asked for two things. A verifier mutation that removes `dir="auto"` and
fails `LongNameInEnglish`: added. And a story for the other direction too, an
English name in the Persian interface. That needs a long English name as record
data in the story, and lingui flags an English literal wherever it sits; getting
one past the rule would be exactly the kind of exemption TECH-DEBT exists to
stop. KN-062, the shared story fixtures, exists for record data and its exit
condition asks for "a long value that exercises truncation in both languages",
so that story belongs there. One direction here, proved by the mutation, since
`dir="auto"` resolves from the first strong character either way.
