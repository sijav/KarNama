# KN-370 - The Status Chip's direction contract says 'first letter' where dir=auto reads the first strong character, and 'cuts the end' where the ellipsis cuts the line's visual end

## The card

A child of KN-010, found by the KN-264 roast.

**Why.** KN-264 existed to make the design contract exactly as strong as the code, and the sentence
it wrote is still stronger than the code in two places; the next person to build on it, the kanban
header or the card's chip, reads the contract, not the standard.

**Exit.** DESIGN.md's KN-264 paragraph and the comment in StatusChip.tsx say the first strong
directional character decides, a letter or a direction mark, and that the ellipsis cuts the line's
visual end, naming what that hides in a mixed-script name; no 'always' is left in either; and a
story renders an LRM-led digit name in the Persian interface and finds the chip ltr.

## Read before planning, 2026-09-15

- **DESIGN.md**, under "A long status name is cut, not wrapped": the first letter decides, the
  ellipsis cuts the end of the name with its start in view, and a name with no letter at all
  follows the page.
- **`StatusChip.tsx:35`**: the chip takes its direction from the name, and the ellipsis "always cuts
  the END of it", KN-238, beside `dir="auto"`.
- **The HTML standard** resolves `dir=auto` from the first character whose bidi class is L, AL or R,
  and otherwise from the parent. A left-to-right mark is class L and a right-to-left mark class R,
  and neither is a letter; digits are weak and are passed over.
- **The chip's stories** already hold a Latin-led name in Persian, `LatinLedInPersian`, a Persian
  name led by digits in English, `DigitLedResolvesRtl`, and a name with no strong character,
  `NoLettersFollowsThePage`.

## The approach

1. **The story**, `MarkLedDigitsResolveLtr`: a name of a left-to-right mark and digits in the
   Persian interface, whose chip is read as `ltr`, the way the neighbouring direction stories read
   it. The browser resolves the direction, not the code, so it passes before the change as after:
   it proves the corrected sentence rather than a fix, and that is said in its comment.
2. **DESIGN.md**: the first strong directional character decides, a letter or a direction mark;
   digits and emoji are not strong, so a name led by digits takes the direction of the first letter
   after them, and a name with no strong character follows the page. The ellipsis cuts the end of
   the line as it is drawn: in a chip running left to right that holds a Persian run, the run is
   drawn right to left, so what the ellipsis hides of it is its start.
3. **`StatusChip.tsx`**: the comment says the same in a line, without "always".
4. **The words.** Both chip story docs describe the new story, and the entry for
   `NoLettersFollowsThePage` says a strong character, since its name stays.

## What I will change

- `DESIGN.md`, `shared/status-chip/StatusChip.tsx`, `shared/status-chip/StatusChip.stories.tsx`
- `story-docs/en/Shared-StatusChip.md`, `story-docs/fa/Shared-StatusChip.md`

## What I expect to be hard, and what I am unsure of

- **A story that cannot fail against the old code** is the card's own ask, since the defect is in
  the words; a plant of `dir="rtl"` on the chip shows the story reads the direction at all.
- **The visual end in a mixed-script name** is stated, not drawn by a story; the card asks for the
  words to name it, not for a story of it.
- **The story's name** keeps the file's `…Resolve…` pattern; renaming `NoLettersFollowsThePage` would
  change its id, so only its docs move.

## How I will know it works

- `MarkLedDigitsResolveLtr` passes, and fails when the chip's `dir` is planted as `rtl`.
- No "always" and no "first letter" is left in DESIGN.md's paragraph or the chip's comment, read by
  a search that finds the words before the change.
- The chip's stories, the unit project, lint and tsc are clean; the story is seen in fa-IR and
  en-US, light and dark.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Not approved as written: the new wording was still narrower than `dir=auto`. Judged, both taken:

1. **The rule, exactly.** Strong characters are not only letters and direction marks: script
   punctuation such as the Hebrew maqaf is strong, and some digits, N'Ko's, are class R. So the
   contract says the first code point of Unicode bidi class L, R or AL decides, with letters and the
   left and right marks as the common examples, that the Persian digits of these stories are not
   strong, and that with no such code point the chip follows its parent. The chip is handed a plain
   string, so the standard's skipped descendants, `bdi`, `script`, `style`, `textarea` and anything
   with its own `dir`, cannot occur inside it.
2. **The mixed-script story is wrong too.** One ellipsis sits at the line's visual end, the right of
   a left to right line and the left of a right to left one, so the Latin-led fixture, «Google
   Recruiting» and then Persian, hides the logical start of its Persian run. `LatinLedInPersian`'s
   comment and both docs' entries, which say it cuts the end of the name, change with DESIGN.md.

The story led by a mark, and its planted `rtl` that must fail it, stay as planned.

## Built, 2026-09-15

- **The story and its plant.** `MarkLedDigitsResolveLtr` reads the chip `ltr` under the Persian
  page; with the chip's `dir` planted as `rtl` it fails on the direction, and the file was put back
  byte for byte.
- **The name** is `markLed` in both fixture files and their type, a left to right mark written as its
  escape before the digits `noLetters` uses, so the two stories differ by the mark alone.
- **The words.** DESIGN.md, the chip's comment, the direction stories' comments and both docs'
  entries say the first strong code point decides and where the ellipsis sits; a search finds no
  "always" or "first letter" left in the paragraph or the comment.
- **The fixture files** hold every object on one line, which Prettier would spread, so a fourth name
  made each file's drift one line worse; the object that changed is now written as Prettier writes
  it.
