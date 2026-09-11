# KN-287 · Draw the Input's message line only when there is a helper or an error, as the screens draw it

Beside `Input.tsx`, which is where the change lands.

**Why, from the board.** Every screen is 26 taller per field than the file until
this lands, and the owner chose the drawn layout over a form that never moves.
Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition, from the board.** An Input with neither a helper nor an error
draws no message line and is 64 tall, as the 91 screen instances draw it; with
a helper or an error it is 90, the file's variants; an error appearing on a
field without a helper adds the line with its message; an error on a field
that has a helper replaces the helper with the error's message and the field's
aria-describedby then names the error, and clearing the error brings the helper
back; a blank error still draws no line; stories assert the 64 and the 90, the
line appearing with the error, and the error replacing a helper, with a
mutation that keeps the helper over the error failing by name, replacing
ErrorDoesNotMoveTheField and WithoutAHelper's reserved line; every other place
that asserts the reserved line is changed with it, KN-011's verifier and both
languages' story docs included; DESIGN.md records the owner's reversal of
KN-011's decision; and the Input's comment about the line always keeping its
height is corrected.

## What is there now

- The Input is a flex column with a gap of 4 between the label, the field and
  the message line, and the line has a minimum height of 22 whatever it holds,
  KN-011's decision that an error never moves the form: every Input is 90.
- Since KN-286 the line holds a `role="alert"` span from the first render,
  empty until there is an error, with the helper beside it while there is none.
  That span must stay mounted and exposed when the line has nothing in it.

## The approach

1. **No gap for an empty line.** A flex gap is laid between every pair of items,
   an empty one too, so the column loses its gap: the label keeps 4 below it,
   and the message line takes 4 above it only when it has something to say. The
   line has no minimum height, so with nothing in it, only the empty alert span,
   it is zero tall and the Input is the file's 64: 16, 4, 44. With a helper or
   an error it is one 22 line under 4, and the Input is 90.
2. **What the line says**: the error while there is one, in the alert span, or
   else the helper, never both; a helper made only of blank characters is no
   helper, by the same rule as a blank error, KN-254, so it draws no line and
   describes nothing. `aria-describedby` names the line while it has something
   to say.
3. **The alert span stays in the page** in every case, zero size when empty,
   never hidden, so an error lands in a region that was there, KN-286.
4. **Stories**: WithoutAHelper asserts 64, no description, a line that takes no
   room and an alert that is present. ErrorAddsTheLine replaces
   ErrorDoesNotMoveTheField: a bare field beside the same with an error, top
   aligned, 64 and 90, the second's line holding the error. ErrorReplacesTheHelper:
   a field with a helper and an error, its line holding the error alone, the
   field described by it, 90. ErrorAnnouncedWhileTyping adds heights: the
   described field 90 throughout, the bare one 64, then 90 with each error, then
   64 again.
5. **KN-011's verifier**: its story list names ErrorAddsTheLine, and its
   reserved-line mutation becomes the line keeping a height when empty, which
   fails WithoutAHelper.
6. **Docs**, both languages: WithoutAHelper rewritten, the two new stories.
7. **DESIGN.md**: the owner's decision says KN-287 built it. **The comment** in
   `Input.tsx` says the line is drawn only when there is something to say.

## What changes

- `Input.tsx`, `Input.stories.tsx`, `story-docs/{en,fa}/Shared-Input.md`,
  `DESIGN.md`, `agent/scripts/verify/KN-011.mjs`, and a new
  `agent/scripts/verify/KN-287.mjs`.

## The verifier, clause by clause

1. The Input stories pass, WithoutAHelper, ErrorAddsTheLine,
   ErrorReplacesTheHelper and ErrorAnnouncedWhileTyping by name, and
   ErrorDoesNotMoveTheField is gone.
2. **THE CASE**: the helper kept over the error fails ErrorReplacesTheHelper by
   name.
3. The line keeping its 22 when empty fails WithoutAHelper by name; the gap
   back on the column fails it too.
4. **In a production build**, in both languages: a bare field 64, with a helper
   90, with an error 90, and the bare field's line zero tall with its alert in
   the accessibility tree.
5. KN-011's and KN-286's verifiers pass.
6. DESIGN.md and the docs say so, and nothing still says the line is reserved.

## What I am unsure about

- Whether other verifiers anchor on the column's gap or on the line's minimum
  height; a search before the edit settles it.
- Whether the root keeps its width with the gap gone, which it should, being a
  column.

## The check, and what changed after it

The second model said proceed: dropping the gap for a margin the line takes only
when it speaks is the right mechanism, since an empty inline span makes only a
phantom line box of zero height, and the empty alert stays mounted and exposed,
which is not `display: none` or `aria-hidden`. The fragile part is keeping the
empty line truly empty: a whitespace node, a padding, a border or an inline
decoration would give it height again, which the zero-height assertion catches.
Taken as well: a blank helper treated as none is outside the card's words, so
it is stated on the card and asserted by WithoutAHelper, and DESIGN.md's blank
rule names the helper too.
