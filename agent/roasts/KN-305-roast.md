# Roast: KN-305, the fixtures hold a job opportunity in every status

Reviewed: commit `6fb39c9` "KN-305: the fixtures hold a job opportunity in every
status, and the board itself", and the close `f3d1b6e`.

Files read: `apps/web/src/shared/story-fixtures/index.ts`,
`story-fixtures.test.ts`, `fa-IR.json`, `en-US.json`,
`apps/web/src/core/records/records.ts`, `records.test.ts`, `index.ts`,
`RecordsProvider.tsx`, `apps/web/src/screens/JobsScreen.tsx`,
`JobsScreen.stories.tsx`, `apps/web/src/shared/kanban-column/KanbanColumn.tsx`
and its stories, `apps/web/src/shared/job-card/JobCard.stories.tsx`,
`ChangeStatusModal.stories.tsx`, `StatusPicker.stories.tsx`,
`StatusControl.stories.tsx`, `DESIGN.md`, `AGENTS.md`, `agent/RALPH.md`.

The test file passes: 10 tests, run on 2026-09-12.

## What is right, said first and briefly

The two locales are genuinely equivalent records. `job-7`, `job-8` and `job-9`
carry the same ids, the same statuses, the same dates, the same links (7 and 9
have one, 8 is null in both) and the same cities, and
`story-fixtures.test.ts:38-41` already pins that. The parse is typed, every
token is checked against the nine, the new field is frozen all the way down, and
the order array at `story-fixtures.test.ts:11` is written out by hand rather
than asked of the function that produced it, which the commit message is right
to be pleased about. The exit condition on the card is met to the letter.

That is also the problem. The card was written loosely enough that a board
nothing can use satisfies it.

---

## CRITICAL 1: the board is in a shape no consumer takes, and the one field every consumer keys on is missing

`apps/web/src/shared/story-fixtures/index.ts:105-109` declares
`BoardColumnFixture { token, name, jobs }`. There is no `id`.

Every real consumer of a status in this product is keyed by `id`, not by token:

- `apps/web/src/core/records/records.ts:38` types `Records.statuses` as
  `readonly StatusOption[]`, which is `{ id, token, name }`.
- `records.ts:146-150`, `jobsIn`, puts a job in a column by
  `job.draft.status === statusId`, the status **id**.
- `apps/web/src/screens/JobsScreen.tsx:65, 92, 93, 95, 96, 100` all look up by
  `column.id`.

And three story files already hand-roll the exact shape that was needed, the
same line copied three times:

```ts
fixtures(locale).statuses.map((status) => ({ id: status.token, token: status.token, name: status.name }))
```

`apps/web/src/shared/modal/ChangeStatusModal.stories.tsx:19`,
`apps/web/src/shared/status-picker/StatusControl.stories.tsx:22`,
`apps/web/src/shared/status-picker/StatusPicker.stories.tsx:13`. KN-305 then
wrote a **fourth** copy of that same line inside the fixtures themselves, at
`index.ts:187`, used it once, and threw the `id` away before exporting.

What it should be: export `statusOptions: readonly StatusOption[]` from the
fixtures. That one field deletes three duplicated lines in three story files on
the day it lands, and it is the shape `RecordsProvider`, `StatusPicker`,
`StatusControl`, `ChangeStatusModal` and `JobsScreen` all already take. The
board, if it is kept at all, carries `{ id, token, name, jobs }`.

The consequence is concrete and visible today.
`apps/web/src/screens/JobsScreen.stories.tsx:12-30`, `seeded()`, is the one
consumer KN-425 names. It cannot take `board`: it needs `Records`, meaning
`StatusOption[]` with ids and `JobEntry[]` whose `draft.status` is a status id,
and `JobFixture` is neither. So `seeded()` still calls `defaultStatuses` (five
statuses, no custom slots at all) and still does
`set.jobs.slice(0, 5).map((job, at) => ... statuses[at % statuses.length]`,
which assigns each job to a column by **array index**, deliberately ignoring the
job's own status. That round-robin is the drift KN-305 was opened to end, it is
still there after KN-305, and the new fixture cannot replace it without the
conversion KN-305 declined to write.

## CRITICAL 2: `board` is computed by a rule the product does not use, so it cannot be the expectation a board story is checked against

`index.ts:186-194` builds the board two ways, and both are wrong for the job:

1. The order comes from the product's own `columnOrder`
   (`records.ts:78-86`), imported at `index.ts:3`. But `JobsScreen.tsx:64`
   already calls `columnOrder(records.statuses)` itself. So the fixture
   pre-computes, from the same function, a value its consumer computes anyway.
   A board story that renders `JobsScreen` and reads its expected column order
   from `fixtures(locale).board` is comparing `columnOrder` with `columnOrder`.
   That is precisely what KN-425's exit condition asks for: "the board stories
   render `fixtures(locale).board` and name their expectations from it".
2. The placement comes from `jobs.filter((job) => job.status === column.token)`,
   filtering by **token**. The product places a card with `jobsIn`
   (`records.ts:146-150`), filtering by **id**, then searching, then sorting. So
   the fixture's placement is not the board's placement. A story that checks a
   rendered board against `board[i].jobs` proves nothing about `jobsIn`, and
   would pass with the sort or the search broken.

There is a second cost to the import. `index.ts:3` imports the barrel, which
AGENTS.md section 4 requires, and `apps/web/src/core/records/index.ts:22`
re-exports `RecordsProvider`. So the Storybook-only fixtures module now pulls
`RecordsProvider.tsx` into its graph, and with it React, `@lingui/react`,
`shared/add-job`, `shared/job-modal`, `shared/contact-card` and
`shared/status-picker`. `index.ts:10-13` still tells the reader this folder is
"Storybook only" data.

On the guard test: it breaks the **spirit**, not the letter.
`story-fixtures.test.ts:21-26` scans shipped files for imports **of**
story-fixtures, so an import in the other direction is invisible to it, and
there is no cycle today because the guard forbids the return edge. But the
folder's whole claim was to be independent sample data, and it is now a function
of `core/records`. Fixtures are fixed input. This one moves when the code moves.

What it should be: write the board out in each locale's JSON, as an array of
`{ id, token, jobs: [job ids] }`, parse it, and let the fixture test assert that
the written order is the design's, that every job is placed once, and that no
job sits in a column whose status it does not have. Then the fixture is an
independent expectation and a `columnOrder` regression is visible when a board
story disagrees with it, which is the only reason to have a board fixture at
all.

---

## Findings

### `story-fixtures.test.ts:79` forbids the one column the design draws an empty state for

`expect(column.jobs.length).toBeGreaterThan(0)` on every column makes it a test
**failure** to ever give the fixtures an empty column. `DESIGN.md:662-664` draws
one: node `241:46`, «هنوز فرصت شغلی‌ای تو این مرحله نیست», centred in an 80 tall
dashed box, and `KanbanColumn.tsx:177` renders it whenever
`Children.toArray(children).length === 0`. KN-353 in the same folder exists
because that path was broken. The assertion that was wanted is "every job stands
in exactly one column and every job is placed", which lines 76-77 already make.
Drop line 79, and give one column no jobs on purpose.

### A board of nine columns holding one card each is not a board

Every column has exactly one job opportunity, because there are exactly nine
jobs and exactly nine statuses. That board cannot draw any of the states the
design actually specifies:

- **Rejected collapsed to a count.** `DESIGN.md:1198-1206`, the owner's KN-070:
  "«رد شده» stays as the last column, collapsed to a count by default", rendered
  as «رد شده ▸ 14». `KanbanColumn.stories.tsx:187` has to write `count: 14` by
  hand because the fixtures cannot supply it. The board fixture has no
  `collapsed` field either.
- **A column that scrolls.** `DESIGN.md:659-661`: the cards scroll between the
  40 tall header and the 36 tall Add Card row inside 684. One card never
  overflows.
- **Sorting.** The Sort Control's four orders (`records.ts:137-143`) all draw
  the identical board when no column has two cards.
- **An empty column.** Forbidden outright by line 79 above.

A derived board can express none of these, and that is the answer to whether a
derived board is a fixture: it is not. An author cannot put two jobs in one
column in a chosen order, cannot empty a column, cannot collapse one. All of
those are data decisions and deriving throws the pen away. What should be in the
JSON is a board with an uneven distribution: rejected holding five or six so the
collapse and the count mean something, one column holding zero, one holding
three in a deliberate order so a sort story has something to reorder, and the
rest one or two.

### The `count` field now contradicts the board, and custom-2 is the flagrant case

`fa-IR.json:3-11` and `en-US.json:3-11` give each status a `count`: new 12,
applied 7, interview 3, rejected 14, offer 1, custom-1 2, **custom-2 0**,
custom-3 5, custom-4 1. The board now puts exactly one job in each of the nine.
Eight of the nine disagree with their own count, and `custom-2` says zero while
holding `job-7`.

It is renderable. `KanbanColumn.tsx:13-25` takes `name`, `colour`, `count` and
`children` as separate props, so a story taking `count` from
`fixtures(locale).statuses` and the cards from `fixtures(locale).board` draws
«سفارشی ۲» with «۰» beside it over one visible card, and the empty message is
suppressed because `Children.toArray(children).length !== 0`. Two numbers for
the same thing inside one fixture set is exactly the drift this card was opened
to end.

Worse: `count` is read by **nothing**. Grepped the whole of `apps/web/src`:
`KanbanColumn.stories.tsx:35-40` sets `count: cards` from the number of cards it
renders, and the three `StatusOption` mappings above drop it. `count` survives
only in `StatusFixture` (`index.ts:22`) and `RawFixtures` (`index.ts:129-130`).
Delete it from both JSON files and both types, and let a column's count be
`board[i].jobs.length`. If a large count is wanted for the collapsed rejected
column, put the jobs in the column.

### The ORDER comment claims a provenance DESIGN.md does not have

`story-fixtures.test.ts:8-11`:

> The board's columns from the inline start, DESIGN.md section 6 and KN-070: the
> design's five in their order, the custom statuses where a reader's own stages
> go, and rejected last whatever else is on the board.

The array itself is **correct** against the code. `columnOrder`
(`records.ts:78-86`) ranks new 0, applied 1, interview 2, offer 3, a custom
token 3.5 and rejected 4, and `Array.prototype.sort` is stable, so the nine
statuses in the JSON's order come out as the array says. Verified by running it.

The citation is not correct. DESIGN.md section 6 and KN-070 settle one thing
only, that rejected is last (`DESIGN.md:1198-1206`), and the five in their order
come from **section 3** (`DESIGN.md:924-935`), not section 6. Where a custom
status ranks appears nowhere in DESIGN.md. It is an author's decision, written
in `records.ts:81-83`: "A custom status has no place in the design's order, so
it goes before rejected". The comment should cite section 3 for the five,
section 6 and KN-070 for rejected being last, and `records.ts` for the custom
slots, naming it as the code's decision and not the design's. As written, a
reader who follows the citation lands in a section titled "Open questions the
design has not settled" and finds no rule about custom statuses at all.

Two further notes on that test. It duplicates `records.test.ts:45`, which
already asserts by hand that `columnOrder` yields
`['new','applied','interview','offer','own','rejected']`. Change the product's
rule and two suites fail, one of them in a file named "story fixtures" for a bug
in `core/records`. And `story-fixtures.test.ts:48-59`, the "job opportunity in
every one of the nine statuses" test, is entirely implied by the board test:
`ORDER` has all nine tokens and line 79 demands each column be non-empty. One of
the two is dead weight.

### Nothing uses the board, and the card that would use it was filed at the bottom of the pile

Grepped: `board` appears in `index.ts` and in its own test, nowhere else. KN-425
is filed to adopt it and sits at `severity low`, `points 2`, `backlog`. Under
the selection law in RALPH.md step 2 (severity, then points, then id), a `low`
loses to every `high` and `critical` in OKR-1, so this fixture is likely to sit
unread for a long time.

KN-425's exit condition is also scoped to `src/screens`: "No story under
src/screens builds its own list of statuses or picks jobs by index". That leaves
the index-picking outside `src/screens` untouched, and there is plenty:
`KanbanColumn.stories.tsx:16-18` does `fixtures(locale).jobs.slice(0, count)`,
so the column headed «سفارشی ۲» draws cards whose statuses are `applied` and
`interview`; `JobCard.stories.tsx:16` does `fixtures(locale).jobs[index]`. That
is the same drift, in the component stories, and nothing is filed for it.

**Was it worth doing as it stands? No.** The card's `why` gives two reasons and
neither survives:

- "The Card has to show its stripe in all nine status colours."
  `JobCard.stories.tsx:274-295`, `StripeInEveryColour`, already draws nine cards
  by mapping `Object.keys(status)` over one job's args and overriding `status`.
  It never needed nine job opportunities and it does not read them now.
- "the Board a column per status with its cards." No board story reads the new
  field, and the one that would cannot, per Critical 1.

What did land and is worth keeping: three more job opportunities in both
languages, so `custom-2`, `custom-3` and `custom-4` have real data for whoever
does write that story. That is a fifteen line JSON change. The 31 lines of
derivation in `index.ts` and the 38 lines of test around it bought nothing yet
and will have to be rewritten to be usable.

### The Persian records: two things wrong

`fa-IR.json:22` and `en-US.json:22`: the company is «همراه اول داده» / "Hamrah
Aval Data". «همراه اول» is MCI, a real and trademarked Iranian mobile operator.
Every other employer in the set is invented: «فناوران نوین پارس», «دیجی‌نو»,
«راهکار داده», «بینش هوشمند», «گروه نرم‌افزاری آسمان», «مهر آسمان پارسیان». A real
national brand will end up in a Storybook Docs page and in screenshots as an
employer with a fabricated posting. Invent one, «همراه داده پارس» or similar.
The set does hold two other real names, «جابینجا» as a source and
«کاورلتر-دیجی‌کالا.docx» as a file name, but a job board and a file name are not
a fabricated employer.

`fa-IR.json:23` and `en-US.json:23`: "Mobile team technical lead" is translated
«مدیر فنی تیم موبایل». Those are different jobs. «مدیر فنی» is a technical
manager or director; an Iranian posting for a lead says «سرتیم موبایل»,
«تک‌لید موبایل» or «سرپرست تیم موبایل». Either make the Persian «سرتیم تیم موبایل»
or make the English "Mobile team technical manager", but the two languages
should not name different seniorities for the same record.

The rest is idiomatic and does look like an Iranian board. «کارشناس پشتیبانی
فنی» and «کارشناس امنیت شبکه» are exactly the wording Jobinja and Jobvision use.
Tabriz, Karaj and «تهران، دورکاری» are a real spread and the Persian comma is
used correctly. No complaint on the dates, the links or the shape.

### `set.board` is not covered by the freeze invariant

`story-fixtures.test.ts:106` asserts frozen over
`[set.statuses, set.jobs, set.contacts, set.notes]`. `set.board` is not in the
list, nor are its columns or their `jobs` arrays. The whole design of this
folder rests on "parsed once, frozen, and read" (`index.ts:15-17`), because a
Docs page renders every story at once. The new field is in fact frozen at
`index.ts:186-193`, so this is one line of test, not a bug: add `set.board` to
the list and check each column and each column's `jobs`.

### No plan file, so the cheapest review in the loop did not happen

`agent/RALPH.md` step 2b: "The plan goes BESIDE THE WORK, in the folder the
change is about to be written to, named `#<task id> - <title>.md`", and "The
plan STAYS when the task closes". `git show --name-only 6fb39c9` lists four code
files and two board files, no plan. The folder holds
`#KN-062 - Shared story fixtures.md` from the parent task, so the convention is
plainly in use here. A plan sent to another model with web search is exactly
what catches "the shape you are about to export has no `id` and the consumer
keys on `id`" before 31 lines get written. This is the second-cheapest finding
in this roast and it is a process one.

### One product bug noticed while reading, not this commit's

`records.ts:79-83` ranks by `entry.token`, not by `entry.id`. DESIGN.md's colour
rules (KN-019, node `376:30`) let a reader recolour any status to any of the
nine, and `RecordsValue.recolourStatus(id, token)`
(`RecordsProvider.tsx:38`) does exactly that. So recolouring a reader's own
status to offer's green moves its column to offer's slot, and recolouring it to
rejected's red sends it to the end of the board. The fixtures cannot surface
this because `index.ts:187` passes `id: entry.token`, making id and token the
same thing. Worth its own card against `core/records`.

---

## What to do, shortest path

1. Delete `count` from both JSON files and from `StatusFixture` and
   `RawFixtures`. It is read by nothing and it now lies.
2. Export `statusOptions: readonly StatusOption[]` from the fixtures, and delete
   the three hand-rolled copies in `ChangeStatusModal.stories.tsx:19`,
   `StatusControl.stories.tsx:22`, `StatusPicker.stories.tsx:13`.
3. Write the board out in the JSON, `{ id, token, collapsed?, jobs: [ids] }`,
   with an uneven distribution: rejected holding five or six, one column empty,
   one holding three. Drop the `columnOrder` import and the
   `toBeGreaterThan(0)`, and assert instead that the written order is the
   design's, that every job is placed exactly once, and that no job sits under a
   status it does not have.
4. Fix the ORDER comment's citation, and drop whichever of the two new tests you
   like less.
5. Rename «همراه اول داده» to an invented company, and settle lead against
   «مدیر فنی».
6. Raise KN-425 above `low` and widen it past `src/screens`, or the fixture
   stays unread.

VERDICT
score: 4/10
criticals: 2
