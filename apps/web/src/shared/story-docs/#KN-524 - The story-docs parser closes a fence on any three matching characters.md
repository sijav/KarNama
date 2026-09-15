# KN-524 - The story-docs parser closes a fence on any three matching characters

## The card

**Why.** The guard is read as proof that a docs file renders as written; a fence it takes for closed
while Markdown keeps it open turns the rest of a Docs page into code with no problem reported, and
the sentence saying otherwise is wrong.

**Exit.** parseStoryDoc opens a fence with three or more backticks or tildes indented at most three
spaces and closes it only with the same character, at least as many, indented at most three spaces
and followed by nothing but spaces; four backticks closed by three, and a closer indented four
spaces, are each reported as an open fence at the opening line, with a unit test asserting the
message; the guard still passes on every docs file; the parser's comment and AGENTS.md describe the
fences it recognises.

A child of KN-007, from KN-405's roast.

## Measured before planning, 2026-09-16

- **The parser today.** A fence opens on any line whose start, after any white space, is three
  backticks or three tildes, and it keeps those three characters; it closes on the first line whose
  start, after any white space, begins with them, whatever follows. No docs file in `en` or `fa`
  holds a fence line, while all 106 hold a `###` line.
- **The committed parser on the card's shapes**, run in Node, each under `### placement`:
  - Four backticks, code, three backticks, `### notAProp`, text, then four backticks: it reads
    `notAProp` as a prop and reports an open fence at the second four, line 9, where there is none.
  - Four backticks closed only by three, then `## Stories` and `### Default`: no problem, and the
    story is read.
  - Three backticks closed by a line indented four spaces, or by a line with text after its marks:
    no problem.
  - An opener indented four spaces, or after a tab: an open fence reported at it, and the
    `### notAProp` at the start of the next line swallowed.
- **What a Docs page draws.** `DocsPage.tsx` renders the description, the props and the stories as
  three `Markdown` blocks from `@storybook/addon-docs/blocks`, which bundles markdown-to-jsx 7 into
  its `dist/blocks.js` and calls it with `forceBlock`. That compiler, cut from the bundle and run in
  Node on the same shapes, each followed by a `### after` that belongs outside every fence:
  - Four backticks closed only by three stay open to the end of the block, `### after` drawn as
    code: the card's failure, on the page's own renderer.
  - A fence opens after at most three spaces and a run of three or more; a tab, which it turns into
    four spaces first, opens none. So far as CommonMark.
  - It closes a fence at the first place the opener's exact run appears in a later line, wherever it
    stands. So it closes, where CommonMark does not, on a line indented four spaces, on a line with
    text after the marks, and at marks in the middle of a line; the last drew the `### inside` after
    them as a heading, and the fence's own closing line then opened a second fence that drew
    `### after` as code.
  - It closes a fence of three at a line of four, drawing the fourth backtick as text.
  - It opens a fence on three backticks whose info string holds a backtick, where CommonMark opens
    none.
  - A Windows line end changes nothing: it turns every one into a line feed first.

## The approach

1. **The tests first**, in `parse.test.ts`, each asserting its exact messages:
   - four backticks closed only by three: an open fence reported at its opening line, naming the
     four, and nothing after it read;
   - four backticks, three, a `### notAProp`, then four: no problem, and no such prop;
   - three backticks and then a line indented four spaces: an open fence reported at the opening
     line;
   - an opener indented four spaces, and one after a tab: no fence, and the `### notAProp` under it
     read as a prop;
   - a backtick fence whose info string holds a backtick: a fence all the same, as the Docs page
     opens one, where CommonMark opens none;
   - what still closes, so the rule is not tightened past Markdown: a closer indented one to three
     spaces, a longer run, spaces or a tab after the marks, a Windows line end, and four tildes
     closing three; and what does not: the other character, fewer marks;
   - step 3's lines, each shape a test of its own: text after the marks, marks in mid-line, the
     marks after four spaces and after a tab, each reported at its line; and only the first such
     line in a fence, a second fence reporting its own.
2. **The parser.** A fence opens on a line of at most three spaces and then three or more backticks
   or tildes, and the open fence keeps its whole run, the character and how many. A line closes it
   when, after at most three spaces, it starts with that run and nothing follows the marks of that
   character but spaces, tabs and the carriage return of a Windows line end. The open fence's
   message names its run, so four backticks read as four; a fence of three reads as today, so the
   existing messages stand. Read by shape and sliced, as the file already does, never by a capture.
3. **A line the Docs page takes for the end of the fence.** Inside a fence, the first line that
   holds the run without closing it, with text after it, four spaces or a tab before it, or marks in
   mid-line, is reported at that line, saying it leaves the fence open while a Docs page closes the
   fence there. That line is the page's closer: its renderer ends a fence at the first place the
   opener's run appears after the opening line. Past it the page no longer reads the fence as the
   parser does, so a later such line in the same fence is not reported. With step 2 alone, the
   fence's own closing line would then open one on the page that runs to the end of its block,
   reported nowhere: the card's failure again, through the page's renderer.
4. **The comments and AGENTS.md.** The parser's opening comment and the fence rule's comment
   describe the rules as the parser's top-level fence grammar, CommonMark's outside lists and block
   quotes, which it does not follow, with the backtick in an info string read as the Docs page's
   renderer reads it rather than as CommonMark does; the guard's list in `guard.test.ts` names what
   is reported; AGENTS.md section 3 says which fences, in place of "a fence that never closes"
   alone.
5. **Nothing a page draws changes.** Every docs file in both languages, parsed by the committed
   parser and by the changed one, gives the same description, props, stories and problems.

## What I will change

- `apps/web/src/shared/story-docs/parse.ts`
- `apps/web/src/shared/story-docs/parse.test.ts`
- `apps/web/src/shared/story-docs/guard.test.ts`, its comment only
- `AGENTS.md`, section 3

## What I expect to be hard, and what I am unsure of

- **Reporting too broadly in step 3.** Only a line holding the opener's exact run is the page's
  closer, so a fence of four holding a line of three is not reported, and neither is any line after
  the first one reported.
- **A tab after the closing marks.** The card says spaces. CommonMark allows spaces or tabs and the
  renderer closes on either, so refusing a tab would report a fence both close.
- **Where the renderer and CommonMark differ on opening**, a backtick in a backtick fence's info
  string, the parser keeps opening a fence, as the page does. Lists and block quotes are not
  followed: a fence inside a list item sits past three spaces. No docs file has either.
- **A closer longer than its opener** closes in both, but the page draws the extra marks as text.
  Left alone, as a rendering quirk rather than a fence left open.

## How I will know it works

- The tests of step 1 that the parser reads wrongly today fail before the change: four backticks
  closed only by three, the closer indented four, the openers indented four and after a tab, and
  step 3's lines. The rest pass before and after.
- `parse.test.ts` passes, and the unit project with the guard over every docs file; tsc and lint
  pass; no changed file's Prettier drift grows, and this plan's is 0.
- Step 5's comparison is identical for every file. No look in a browser, since no page draws
  anything different, which that comparison shows.

## Plan review, 2026-09-16, Codex gpt-5.6-terra

Approved with one amendment, taken above. Step 3 belongs in this card: the bundled markdown-to-jsx
closes at an occurrence of the opener's run that CommonMark leaves as code, so without it the parser
could call a file clean while the page closes early and the real closing line opens a fence to the
end of the block, which defeats the card's reason. The closing rule is CommonMark 0.31.2's, the
Windows line end included. The amendment: the one deliberate divergence, a backtick fence whose info
string holds a backtick still opening a fence, gets a test of its own and a comment calling it the
renderer's reading rather than CommonMark support, and the comment calls the rules the parser's
top-level fence grammar, not a Markdown parser of lists and block quotes. Its caution, to report
only lines the installed renderer would take for its closer and to test each shape on its own, is
why step 3 reports the first such line in a fence alone. The amended plan goes back to it before
building.

## Second plan review, 2026-09-16, Codex gpt-5.6-terra

Approved as amended. It read the parser, `DocsPage` and the bundled markdown-to-jsx rule again, and
step 3 belongs here: without it the stricter parser can finish clean while the page closes early
and takes the real closing line for a new opener. The grammar matches CommonMark 0.31.2 for the
parser's top-level scope, in the indentation, the marks' character and count, a tab after a closer
and the Windows line end. The backtick in an info string is recorded and tested as the renderer's
reading, lists and block quotes stand outside the parser's scope, and leaving out the longer
closer's stray marks is proportionate. The mistake to watch in building is step 3 reporting marks
the renderer would not close at, which the exact run and a test for each shape guard against.

## Built, 2026-09-16

- **The tests first.** Eighteen cases in a new block of `parse.test.ts`, as step 1 lists them. On
  the old parser ten failed: four backticks closed only by three, the heading between four and
  three, the closer indented four, the openers indented four and after a tab, the four lines a page
  takes for the end of a fence, and the first-only case. The other eight passed before and pass
  after: the backtick in an info string, the four closers, the Windows line end with the tildes, and
  the two lines that close nothing.
- **The parser.** `OPENER` takes at most three spaces and a run of three or more; `openingRun`
  slices the whole run off by shape; `closes` takes at most three spaces, the run or a longer one,
  then only spaces, tabs and a carriage return. The open fence keeps its run, and the never-closes
  message names it. Inside a fence the first line that holds the run without closing it is
  reported, `pageEnded` keeping that to one line a fence and starting again at the next opener. The
  draft was tried in the scratchpad before it went in: the 106 docs files read the same, and 20
  shapes gave the planned problems.
- **The comments and AGENTS.md.** The opening comment names the new problem; the fence comment
  calls the rules the parser's top-level fence grammar, CommonMark's outside lists and block quotes,
  with the info string's backtick read as the page reads it; the guard's list and AGENTS.md section
  3 say which fences.
- **Checks.** `parse.test.ts` 48 of 48; the guard and the catalog test on their own 26 of 26; tsc
  passes, and lint on the three changed files. The unit project passed 1522 of 1524: the demo case
  of `session.test.ts` timed out at 5 seconds and its live case then found the request spy called
  twice, and the file passed alone, 2 of 2; both messages are recorded on KN-551, which asked for
  them. No drift grew: `parse.ts`, `parse.test.ts`, `AGENTS.md` and this plan 0, `guard.test.ts` 17
  as before.
- **Step 5.** All 106 docs files, both languages, parse the same under the committed parser and the
  changed one, and a planted fence of four closed only by three reads differently, the positive
  control. No look in a browser: no page draws anything different.
