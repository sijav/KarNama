# KN-439 - The status fixtures' count disagrees with the board they now describe

## The card

**Why.** Two numbers for one thing, one of them wrong and unread, is the sort of data that is
trusted the first time somebody writes a story against it.

**Exit.** The count is either gone or equal to the number of job opportunities the fixtures put in
that status, in both languages.

## Measured before planning, 2026-09-15

- **Six of the nine disagree**, the same in both languages: new says 12 and holds 3, applied 7 and
  2, interview 3 and 1, rejected 14 and 6, custom-1 2 and 1, custom-3 5 and 1; offer and custom-4
  hold their 1, custom-2 its 0. The card counted eight; the board has changed since.
- **Nothing reads it.** A search of `src` finds no read of a status fixture's count: the screens
  count a column from its own job opportunities, the `count` in stories is a component's own prop,
  and `renamedStatus` is read for its name alone, in the board and Status Chip stories. `index.ts`
  spreads each raw entry into `StatusFixture`, so the count is carried by a type and used nowhere.
- **Where it lives.** `StatusFixture`, the `statuses` and `renamedStatus` shapes of `RawFixtures`,
  both JSON files' nine statuses and their `renamedStatus`, the two `RawFixtures` a test builds,
  and a comment in that test naming custom-2's count of zero.

## The approach

1. **Delete, not derive.** A count worked out from the job opportunities would be a second copy of
   what `board` already holds for every column, its job opportunities, which the fixture test reads;
   nothing wants the first copy.
2. **The count goes** from both JSON files, from `StatusFixture` and both `RawFixtures` shapes, and
   from the two objects the test builds; the test's comment says custom-2 is the column no fixture
   job opportunity sits in.
3. **The proof.** tsc refuses any read of a count left behind, which checks the search; the unit
   project with the fixture test passes.

## What I will change

- `story-fixtures/en-US.json`, `story-fixtures/fa-IR.json`
- `story-fixtures/index.ts`, `story-fixtures/story-fixtures.test.ts`

## What I expect to be hard, and what I am unsure of

- **Nothing a reader sees changes**, so no story can fail first and no screen has anything new to
  look at; the proof is tsc and the fixture test.
- **The JSON files are laid out by hand**, one status to a line; the removal keeps each on its line.

## How I will know it works

- No count is left in either file's statuses or `renamedStatus`, or in the fixture types.
- tsc, lint and the unit project pass, and no file's Prettier drift grows.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Not approved quite as written. It found deleting the count the right and smallest change, since
`board` already gives a later story each column's size, and nothing outside the fixtures reading
it. Its addition, taken: tsc catches a typed read of the count but not one left in the JSON, since
a JSON import is typed from the file and the spread keeps an extra property at run time. So
`story-fixtures.test.ts` asserts, in both languages, that no status and not `renamedStatus` carries
a `count` of its own. Written first, it fails against today's files; once they are clean, a count
put back on one entry must fail it again, and is then taken out.

## Built, 2026-09-15

- **The test came first.** `story-fixtures.test.ts` asserts, in both languages, that no status and
  not `renamedStatus` carries a `count` of its own. Against the files as they were, it failed on
  that assertion, with fa-IR's nine statuses each holding one.
- **The count is gone** from both JSON files' nine statuses and their `renamedStatus`, from
  `StatusFixture` and both `RawFixtures` shapes, and from the two objects the test builds. The
  test's comment now says custom-2 is empty because no fixture job opportunity sits in it.
- **The mutation.** A count put back on en-US's custom-4 failed the test, naming custom-4, and one
  put back on en-US's `renamedStatus` failed its second assertion. Both were in the second
  language, so the loop is seen to reach it. The file was put back byte for byte, checked by hash.
- **Checks.** tsc and lint pass. Prettier drift is unchanged: `index.ts` 0, each JSON file 224,
  the test 31, and this plan 0.
- **Tests.** The unit project passed except `session.test.ts`, whose two tests overran their 5 s
  in the full run, KN-551, and passed alone. The two story files that read a status fixture, the
  Status Chip's and the Jobs screen's, read `renamedStatus` for its name alone; their 38 stories
  pass.
- **No look.** Nothing a reader sees changed, so there was nothing to look at in either language
  or scheme.
