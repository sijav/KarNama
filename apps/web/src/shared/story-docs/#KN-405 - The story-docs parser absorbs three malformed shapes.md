# KN-405 · The story-docs parser still absorbs a # or #### heading, an unclosed fence and an empty entry without a problem

Beside the parser, per `agent/RALPH.md` step 2b. Child of KN-007, from KN-202's
roast.

## The card

**Why.** The format is documented as rigid and the guard as checking it; each
of these is an author's mistake that renders wrongly on a Docs page and is
caught by nobody.

**Exit condition.** parseStoryDoc reports, with its line, a heading of level one
or of level four and deeper outside a fence, a fence still open at the end of
the file, at the line it opened, and an entry with no prose; each has a unit
test asserting its message; the guard still passes on every docs file;
AGENTS.md's sentence on the format lists what fails it and claims no more.

## What is true today

- `parse.ts` knows a section by `^##\s+\S` and an entry by `^###\s+\S`, both at
  the start of a line, and treats every other line as text. So `# Title` and
  `#### Detail` are text: the first joins the description or the entry it sits
  in, the second the entry above it, and neither is reported.
- A fence opens on a line that starts, after spaces, with ` ``` ` or `~~~`,
  and closes on a line whose trimmed start begins with the same three
  characters. One that never closes makes every later line text of the entry it
  opened in, `## Stories` and its entries included, and the file ends with no
  problem.
- `flush` writes an entry's text even when it is empty, so `### Default` with
  nothing under it is an entry of the empty string: the guard's name checks
  accept it, and a Docs page renders a bare heading.
- A problem is an `Error` whose message starts `line N:`. The guard,
  `guard.test.ts`, fails softly on any, naming the file; `catalog.ts` parses for
  the Docs page and ignores them, so a new problem changes nothing on a page.
- No docs file in `en` or `fa` has any of the three shapes, checked on
  2026-09-14: no line starting `#` or `####`, no fence, and no entry whose next
  line that is not blank is a heading or the end of the file.

## The approach

1. **A heading of level one, or of levels four to six**, at the start of a line
   outside a fence: `#`, or four to six `#`, followed by whitespace or the end of
   the line. Reported as `line N: "# Title" is a level 1 heading: a docs file
has only its description, ## sections and ### entries`, and kept out of every
   text, as an unknown section's lines are. Seven `#`, or `#` followed by a
   letter, is not a heading in CommonMark, and stays text.
2. **A fence still open at the end.** The line it opened on is remembered, and
   after the last line the parser reports `line N: the ``` fence opened here
never closes, so every line after it is read as code`. The lines it swallowed
   stay where they are: guessing where it should have closed would be a second
   parser.
3. **An entry with no prose.** When an entry is flushed with empty text, report
   `line N: "### Default" under "## Stories" has no prose`, N being the entry's
   own heading line, and keep the entry, so the guard does not report it a
   second time as missing.
4. **Problems in line order.** An empty entry is found at the next heading and
   an open fence only at the end, so pushing as found could list line 11 before
   line 10. The parser collects each with its line and returns them sorted,
   still as `Error`s with the same messages.
5. **What says what fails.** The parser's opening comment and the guard test's
   comment name every problem; AGENTS.md section 3 lists what fails the guard in
   place of "anything else fails", which claims more than the parser checks.
6. **Tests in `parse.test.ts`**, each asserting exact messages: `#`, `####`,
   `#####` and `######` reported at their lines; `#hashtag` and seven `#` not;
   a `#` inside a fence not; a fence opened in an entry and never closed, at its
   opening line, for both markers; an entry with no prose at its heading, in the
   middle of a file and as its last line, with blank lines under it; and one
   file holding all three, in line order.
7. **The guard over every docs file**, unchanged, still passes.

## What changes, file by file

- `apps/web/src/shared/story-docs/parse.ts`: the three rules, problems kept with
  their lines and sorted, the opening comment.
- `apps/web/src/shared/story-docs/parse.test.ts`: the cases above.
- `apps/web/src/shared/story-docs/guard.test.ts`: its comment only.
- `AGENTS.md`: the sentence on the format.

## What I expect to be hard, and what I am unsure about

- **What counts as a heading.** CommonMark allows up to three spaces before an
  ATX heading, and SECTION and ENTRY do not; allowing them for levels one and
  four to six only would make the rules disagree about the same line. The new
  rule matches at the start of the line, like the other two, and the AGENTS.md
  sentence will say "at the start of a line".
- **Shapes the card does not name**: a Setext heading underlined with `===` or
  `---`, `##` or `###` with no name, a fence of four backticks. None is reported
  today or after; the sentence will not claim them.
- **Sorting** changes the order of problems a file already has only where two
  were found out of order, which none of the existing tests has.

## How I will know it worked

The new cases pass and each fails when its rule is planted away; `parse.ts`
stays covered whole; the guard passes on every docs file in both languages;
lint and `tsc` are clean.

## Tried before the build

A copy of `parse.ts` with the three rules, in the session's scratchpad as
`kn405-draft.mjs`, run on 2026-09-14 against the cases above and the
interactions the plan review was asked about: all 19 passed, and all 100 docs
files in `en` and `fa` fit it. What it settled where the rules meet:

- **A stray heading in a region already reported was not reported again** in the
  draft: under an unknown section, or under a second entry of a name, it went
  with that region, as a `###` under an unknown section does. The plan review
  reversed this, below.
- **An open fence is reported wherever it opened**, an unknown section
  included, because it swallows the rest of the file, not just its region.
- **An empty second entry is reported once**, as a second entry: its region is
  already discarded, so it has no prose to be missing.
- **An entry whose only line was a stray heading** is empty once the heading is
  kept out of its text, and both are reported.
- **Sorted by line**, an empty entry at line 2 comes before a `####` at line 3
  that was found first.

## The plan review, and what changed

Codex, plan kind with web search, 2026-09-14, archived at
`%TEMP%/claude-roast/2b1874631dd1/20260914T143233-plan-kn-405-the-story-docs-parser-still-absorbs-a-or--b20d19.md`.

- **Rejecting a level-one heading is right**: the format has no title slot, and
  the Docs page supplies the title from Storybook. Accepted.
- **CommonMark ends a heading's `#` with a space, a tab or the end of the line**,
  not any whitespace. Accepted: the rule takes a space or a tab, or the end, a
  Windows line ending's carriage return allowed before it, and AGENTS.md says
  "a space, a tab or its end".
- **Detect a stray heading whatever region it is in**, so an unknown section
  reports its own problem and the heading's. Accepted, reversing the draft:
  renaming the section would not make the heading one the format has.
- **An open fence is reported wherever it opened**, keeping what it swallows
  where it is. Accepted, as drafted.
- **Test an entry whose only would-be prose is `# Title`**: both problems, and
  the entry kept as an empty string. Accepted; the draft had the case, and the
  test asserts the entry too.
- **The fence message names its own marker**, so the `~~~` case reads right; the
  plan's sample message showed ` ``` ` for both. Accepted, as drafted.
- **Collect problems with their lines and sort at the return**, keeping `Error[]`
  and parsing no line back out of a message. Accepted, as drafted.
- **`flush` is where it goes wrong**: keep the entry's heading line as state of
  its own, and keep the stray heading out of the buffer. Accepted: `entryLine`
  is set with the entry, and the stray branch returns before buffering.
