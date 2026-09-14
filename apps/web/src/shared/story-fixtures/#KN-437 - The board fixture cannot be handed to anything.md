# KN-437 · The board fixture cannot be handed to anything: its columns carry no status id

**Why, from the board.** A shared fixture that no consumer can accept is not
shared data, it is a fifth copy of the same map. The three duplicated lines it
would delete are the measure of whether it is the right shape.

**Exit condition, from the board.** A story seeds RecordsProvider from the
fixtures with no mapping of its own, and the three hand-rolled status maps are
gone.

## What is there, read 2026-09-14

- **`fixtures(locale).statuses`** holds all nine statuses as `{ token, name,
  count }`, in the JSON's order. The product's own shape is `StatusOption`,
  `{ id, token, name }`, and the product's five defaults use the token as the id,
  `defaultStatuses` in `core/records/records.ts` line 63.
- **`fixtures(locale).board`**, KN-305, is nine columns of `{ token, name, jobs }`
  built through the product's `columnOrder`. To call `columnOrder` it maps the
  statuses to `{ id, token, name }`, `story-fixtures/index.ts` line 187, and then
  drops the id. Its only reader is `story-fixtures.test.ts`.
- **The three maps**, each `fixtures(locale).statuses.map((status) => ({ id:
  status.token, token: status.token, name: status.name }))`:
  `shared/modal/ChangeStatusModal.stories.tsx` line 19,
  `shared/status-picker/StatusControl.stories.tsx` line 22 and
  `shared/status-picker/StatusPicker.stories.tsx` line 13.
- **The job opportunities**: nine, one in each status, `job-1` to `job-9`. The
  contacts: `contact-1` on `job-1`, `contact-2` on `job-2`, `contact-3` on none.
  A `JobFixture` is not a `JobEntry`, so every story that seeds a
  `RecordsProvider`, the board's and the network page's, builds its own records
  with `defaultStatuses`, `emptyDraft` and `jobFrom`.
- **`Records`** is `{ statuses: readonly StatusOption[], jobs: readonly
  JobEntry[], contacts: readonly ContactEntry[] }`, so frozen arrays are
  accepted as they are.

## The approach

1. **`statusOptions`**, a field of the fixtures: the nine statuses as
   `StatusOption`, the token as the id as the product's defaults have it, in the
   fixtures' order, frozen. It is the one map, and everything below reads it.
2. **The board's columns carry their status's id**: a column is a
   `StatusOption` with its job opportunities, `columnOrder(statusOptions)` with
   the jobs added, so nothing is mapped twice and nothing is thrown away.
3. **`records`**, a field of the fixtures: the product's own `Records` built
   from them, with `statuses` being `statusOptions`; each job opportunity made by
   the product's `jobFrom` from `emptyDraft` with its own status, title, company,
   location, posted date and link, keeping the fixture's id, and added a day
   apart so it is the same on every read; and each contact as a `ContactEntry`
   on the job opportunity the fixture names. Frozen all the way down, as the rest
   of the set is. `emptyDraft` comes from `shared/add-job/draft.ts`, which is
   plain data, not the modal.
4. **The three stories read `statusOptions`**, and their maps go.
5. **The board's `Board` story is seeded from `fixtures('fa-IR').records`**, by a
   decorator of its own inside the file's, and `InEnglish` from the English set,
   so it stays the same board in the other language. `Board` then checks the
   page against `fixtures('fa-IR').board`: a column for each of the nine, named
   as the fixture names it, in the fixture's order, and each column holding its
   own job opportunities, the collapsed rejected column opened first. Every
   other story in the file keeps its five-status board, which their positions
   and counts depend on.

## The tests

- **`story-fixtures.test.ts`**, in node: `statusOptions` is the nine, each with
  the token as its id and its name, frozen; every board column carries its
  status's id; `records.statuses` is `statusOptions`; every fixture job
  opportunity has an entry with its own id, status, title, company, location,
  posted date and link; every contact is linked as the fixture links it; the
  records are frozen; and the product's own `jobsIn` over `records.jobs`, for
  each column's id, gives back exactly that column's job opportunities, which is
  what "can be handed to anything" means.
- **`Board`**, in the browser: the checks above, on the page.
- The three stories, `ChangeStatusModal`, `StatusControl` and `StatusPicker`,
  run as they did, and the board's other stories with them.

Each new check fails first: the unit tests on today's fixtures, where the fields
do not exist, and `Board` against the five-status board it has today, where the
custom columns are missing. After, a plant that gives the records' jobs a
different status than the fixture's fails the `jobsIn` test and `Board`.

## Files

- `apps/web/src/shared/story-fixtures/index.ts` and `story-fixtures.test.ts`.
- The three stories above, and two more found while building:
  `shared/add-job/AddJobModal.stories.tsx` line 16 and
  `shared/job-modal/JobModal.stories.tsx` line 27 each hold the same map, cut to
  the first five statuses with `.slice(0, 5)`. The card counted three; there were
  five, and all five read `statusOptions`, the two keeping their slice.
- `apps/web/src/screens/JobsScreen.stories.tsx`, `Board` and `InEnglish`, and
  their docs in both languages if what they say changes.

## What I am unsure of

- **`jobFrom` makes the history entry's id with `newId`**, from the clock, so the
  records are the same objects on every read but not the same ids on every page
  load. Nothing reads a history entry's id from a fixture today.
- **Freezing what a `RecordsProvider` starts from**: every change the provider
  makes builds new objects rather than editing old ones, so a frozen start should
  never throw; the board's other stories, which change their records a great
  deal, are the check.
- **Whether `Board` should be the story at all**, rather than the network page's,
  which also builds its own records. The board is what the board fixture is of,
  and its other stories keep their own five-status board, so only `Board` and
  `InEnglish` change what they draw.

## Plan review, Codex, 2026-09-14

Codex approved the plan. It read `RecordsProvider`, `withSaved`, `withStatus`,
`withSamples`, `localizedStatuses` and `JobsScreen` and found nothing that writes
into the records a provider starts from, so frozen records are safe; it judged
a `records` field the simplest shape that meets the exit, since a story building
`Records` from the fixtures would only move the mapping the card forbids; and it
agreed that `Board` and `InEnglish` are the consumers, the network page and the
board's other stories modelling other cases on purpose. Taken from it:

- **The decorator keys its provider on the language.** A provider reads its
  initial records once, so without a key a language switched in the toolbar
  would keep the other language's board. One decorator serves both stories,
  reading the story's language.
- **The `jobsIn` test compares ids**, `jobsIn(records.jobs, column.id, ...)`
  mapped to ids against the column's ids, since a `JobFixture` is not a
  `JobEntry` and whole objects are neither the same type nor the contract.
- **Frozen all the way down, literally**: every draft, its `employmentTypes`,
  `skills`, `contacts`, `files`, `history` and each entry of it, every
  `ContactEntry.contact`, and every array. One recursive freeze, and a test that
  walks the records and finds nothing unfrozen.
- **One test that a frozen job still changes the product's way**: the product's
  own `withStatus` moves a fixture job opportunity to another status and leaves
  the fixture as it was.

## Result, 2026-09-14

- **Red first.** On today's fixtures the five new unit tests failed, each reading
  a field that did not exist, and `Board` failed with no rejected column to open,
  its board empty.
- **Green.** The fixture tests pass, 15, and the whole web unit project, 1372.
  `Board`, `InEnglish`, and the stories of the Status Picker, the Status Control
  and the Change Status Modal pass. In the six story files only the known six
  fail: KN-494's five modal stories, `onSave` never called because the date is
  refused, and the board's `Adding`, KN-495.
- **Plant.** Every job opportunity in the records built in `new` instead of its
  own status failed the records test, the `jobsIn` test and `Board`, each on the
  line it aims at; the file was restored byte for byte, checked by hash.
- **Coverage.** The fixtures module is at 100 percent of its statements,
  branches, functions and lines from its own tests.
- **The rest.** tsc and lint pass. The fixtures module was formatted at HEAD and
  is formatted again; the five status stories are formatted as they were; the
  fixture test and the board's stories were not formatted at HEAD, and only the
  lines this change added were brought to the formatter's shape.

Checked while reading for the build: `localizedStatuses` renames a default status
to the page's language only when its name is one of the catalog's own, and the
fixtures name the five defaults exactly as the catalogs do in both languages, so
the page shows the fixture's names.
