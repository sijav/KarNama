# KN-438 · The seeded board is nine columns of one card, which is no board to draw stories against

**Why, from the board.** The point of a seeded board is that every board story
draws the same realistic board. One card per column is the board no reader ever
has, and the empty column the design draws is now forbidden by a test.

**Exit condition, from the board.** The fixture board holds an empty column, a
column with several, and a rejected column worth collapsing; no test forbids an
empty column.

## What is there, read 2026-09-14

- **The job opportunities**, `fa-IR.json` and `en-US.json`: nine, `job-1` to
  `job-9`, one in each of the nine statuses. The two languages hold the same ids
  and statuses, which `story-fixtures.test.ts` asserts.
- **Two tests forbid an empty column.** "hold a job opportunity in every one of
  the nine statuses", KN-305, and the board test's `column.jobs.length` greater
  than zero.
- **What the design draws.** An empty column, `241:46`, with its own line of
  copy, DESIGN.md at «An empty column»; the owner's rejected column collapsed as
  `رد شده ▸ 14`, DESIGN.md at «Collapsed, the author's reading»; cards that scroll
  between a column's header and its Add Card row. The fixtures' own status counts,
  the chips' numbers, are new 12, applied 7, interview 3, rejected 14, offer 1,
  custom-1 2, custom-2 0, custom-3 5, custom-4 1: the design's board has custom-2
  empty.
- **Who reads the job opportunities by position**, every consumer grepped: the
  Job Card's stories take `jobs[0]` and `jobs[1]` and draw the nine stripes from
  the tokens, not from the jobs; the Kanban Column's stories take the first six at
  most; the board's other stories take the first six by position and give them
  their own statuses; the network page, the Job Modal, the Add Job Modal, the
  Input and the Search Bar take the first three; the Bulk Action Bar and the
  Contact Modal list every one, and assert nothing about how many. None reads
  `job-7`'s status, and none reads past `job-9`.
- **`Board`**, KN-437, draws `fixtures('fa-IR').records` and checks every column
  against the board fixture, and the fixture unit test compares the product's
  `jobsIn` for each column with the column's job opportunities, in order.

## The approach

1. **An authored, uneven board, the same in both languages**, keeping `job-1` to
   `job-9` where every story finds them:
   - **custom-2 empty**, the design's own zero: `job-7` moves to applied, so
     applied holds two.
   - **new holding three**: `job-3` and two more, `job-10` and `job-11`.
   - **rejected holding six**, the fullest column and worth collapsing: `job-4`
     and five more, `job-12` to `job-16`, posted over two months so a sort
     reorders them.
   - Every other status keeps its one.
   The new job opportunities are fictional, with companies that are no real
   company's name, a posting link on some and none on others, as the nine have.
2. **The tests assert the shape, not a floor of one.** The KN-305 test and the
   board test's greater-than-zero go; a test of the board's shape takes their
   place: a column is empty, a column other than rejected holds at least three,
   and rejected holds more than any other column and at least five, in both
   languages. The board test keeps that every job opportunity stands in exactly
   one column, its own status's.
3. **The `jobsIn` test compares ids as sets.** The product sorts a column's job
   opportunities, newest added first, and a column now holds several, so the
   fixture's order is not the product's.
4. **`Board` needs no change to pass**: it walks every column and every job
   opportunity in it, the empty column included. Its comment and its docs in
   both languages say the board is uneven rather than one in each.

## The tests

- **Red first**: the shape test fails on today's fixtures, where no column is
  empty and none holds more than one.
- **Green**: the fixture unit tests; `Board` and `InEnglish`; and every story file
  that reads the fixture job opportunities, run whole: the Job Card, the Kanban
  Column, the board's, the network page's, the Job Modal, the Add Job Modal, the
  Contact Modal, the Bulk Action Bar, the Input and the Search Bar, with only the
  known failures, KN-494's five and KN-495's `Adding`.
- **Plants**: a job opportunity put back into custom-2 fails the shape test where
  it wants an empty column; rejected's five new ones moved to offer fail it where
  rejected must be fullest.

## Files

- `apps/web/src/shared/story-fixtures/fa-IR.json` and `en-US.json`.
- `apps/web/src/shared/story-fixtures/story-fixtures.test.ts`.
- `apps/web/src/screens/JobsScreen.stories.tsx`, `Board`'s comment, and its docs
  in `story-docs/en/Screens-Jobs.md` and `story-docs/fa/Screens-Jobs.md`.

## What I am unsure of

- **Whether the chips' counts should become the board**: 45 job opportunities in
  two languages would make the fixture board the design's own numbers, and the
  collapsed column's count its 14. The card asks for an uneven board worth
  drawing, not the design's numbers; sixteen keeps the fixtures readable.
- **The column that scrolls**: rejected's six may or may not overflow a column at
  the runner's size, and the exit does not ask for it; nothing here asserts it.
- **KN-437's two children**, filed from its roast: `Board` does not check that a
  column holds only its own cards, or the order drawn rather than the markup's.
  They are their own cards, KN-540 and KN-541, not this one.

## Plan review, Codex, 2026-09-14

Codex approved the plan: it found no consumer beyond those listed whose drawing
or assertions change, since everything else reads early positions, contacts or
status options, and only the Bulk Action Bar and the Contact Modal list every
job opportunity; it confirmed the statuses' `count` fields are not board state,
read by nothing in `src` and left out of `statusOptions` and `records`, so six in
rejected is enough and 45 records would only make the fixture unreadable. Taken
from it:

- **The shape test names custom-2** as the empty column, the fixtures' own count
  for it being zero, rather than asking for any empty column.
- **The `jobsIn` test compares sorted arrays of ids, not sets**, which would
  hide an id found twice. And step 3's reason was wrong: `newest` orders by the
  posting date when there is one, then by when a job opportunity was added, not
  by when it was added alone.
- **A plant for that check**: an id found twice in the records, which a set
  would let through.

## Result, 2026-09-14

- **Red first.** On today's fixtures the shape test failed at its first line:
  custom-2's column held one job opportunity.
- **Green.** Both fixture files hold sixteen job opportunities, the same ids and
  statuses in both: new three, applied two, rejected six, custom-2 none, and one
  in each of the rest. The fixture tests pass, 15, and the whole web unit project,
  1372. The eleven story files that read the fixture job opportunities, the Job
  Card, the Kanban Column, the board's, the network page's, the Job Modal, the
  Add Job Modal, the Contact Modal, the Bulk Action Bar, the Input, the Search Bar
  and the Contact Card, pass 149 and fail the known six only: KN-494's five modal
  stories and KN-495's `Adding`.
- **Plants**, each restored byte for byte, checked by hash: `job-7` back in
  custom-2 failed the shape test where custom-2 must be empty; rejected's five
  new job opportunities moved to offer failed it where rejected must hold five;
  an id found twice in the records failed the records test and the `jobsIn` test,
  whose sorted arrays counted `job-10` twice.
- **Looked at**, in Storybook at 1440 by 900: `InEnglish` in light and dark,
  where Saved holds its three ordered newest posting first and Applied its two;
  `Board` in Persian in light and dark, scrolled by its own play to the rejected
  column it opens, holding its six and running past the bottom of the screen,
  with custom-3 and custom-4 beside it and custom-2's empty column at the edge of
  the view.
- **The rest.** Lint is clean. The fixture files keep their hand layout, one job
  opportunity per line, since they were not the formatter's at HEAD; the fixture
  test and the board's stories keep only the formatting differences they had at
  HEAD.
