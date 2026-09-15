# KN-413 - The Input's docs still say the line under the field always keeps its height, which KN-287 ended

## The card

A child of KN-011, found by the KN-296 roast.

**Why.** The docs are the component's contract for whoever uses it, and this one promises the
opposite of what the field does with the case that matters, an error appearing in a filled form.

**Exit.** Both language docs say what the field does: no line and no room without a message, a line
of one height with a helper or an error, and what that means for a form when an error appears, which
is that it does move; nothing in either file contradicts it; the Docs page reads right in both
languages.

## Read before planning, 2026-09-15

- **The contradiction is one paragraph.** `story-docs/en/Shared-Input.md` lines 5 to 7 and
  `story-docs/fa/Shared-Input.md` lines 5 and 6 open the page in bold: the line under the field
  always keeps its height, so a validation error never pushes a form down.
- **The component and the rest of both files agree with each other.** `Input.tsx` draws no line
  without a message, 64 tall, and adds it with a helper or an error, 90, the owner's decision of
  KN-285 and KN-287; the entries for `WithoutAHelper` and `ErrorAddsTheLine` say the same.
- **Filed twice.** KN-631, from the KN-359 roast, was this defect again; it is dropped as this
  card's duplicate.

## The approach

1. **The words.** Both opening paragraphs say the line takes room only when it has something to
   say: no line and 64 without a message, one line of the same height with a helper or an error,
   90 in all, an error taking a helper's place; so an error appearing under a field with no helper
   moves what follows down, and one that replaces a helper moves nothing.
2. **Nothing else contradicts it**, read by a search of both files for the old claim, which finds it
   before the change.
3. **The Docs page** is opened in both languages and its opening paragraph read.

## What I will change

- `story-docs/en/Shared-Input.md`, `story-docs/fa/Shared-Input.md`

## What I expect to be hard, and what I am unsure of

- **Nothing in code changes**, so no story can fail first; the proof is the search and the page.
- **The Persian** has to say the same measured numbers in Persian digits, as the file already does.

## How I will know it works

- A search for "always keeps its height" and its Persian finds the lines before and nothing after.
- The unit project with the docs guard passes, and the Docs page's opening reads right in fa-IR and
  en-US.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Not approved as written: the numbers were right for a field of one line with a message of one line,
and too broad beyond it. Taken: the paragraph says 64 and 90 are that field's, that a message wraps
and takes 22 more a line, that a field of several lines starts at 140 and grows with its text, and
that an error moves what follows only when it adds the line or makes it longer. The review found
every other entry in both files already right, `WithoutAHelper`, `ErrorAddsTheLine` and
`ErrorReplacesTheHelper` among them.
