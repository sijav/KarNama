# KN-543 - The API seeds the five default statuses with rejected before offer, against the design's order

## The card

**Why.** When the web reads its board from the API, a reader's rejected column would stand before
their offers, the order the owner settled against, while the seed's comment calls it the board's
order.

**Exit.** The API's seed writes the defaults' positions in the design's order, offer before rejected
and rejected last, and a test of the seed asserts that order.

Found by KN-440's plan review.

## Measured before planning, 2026-09-16

- **The seed.** `seed.ts` lines 40 to 46 hold `DEFAULT_STATUSES`, commented "The five the design
  ships with, in board order", listing new, applied, interview, rejected, offer. The loop at line
  141 writes each one's `position` from that list's index, line 145, so a board read by position
  draws rejected fourth and the offer column last.
- **The design's order is the other way.** Offer before rejected, rejected last, the owner's
  decision of KN-070 in DESIGN.md section 3. The web's own `DEFAULT_TOKENS`,
  `core/records/records.ts` line 44, is new, applied, interview, offer, rejected, and
  `records.test.ts` asserts it, including that rejected stays last however the statuses arrive.
- **Only `position` depends on that list's order.** The ids come from the `statusIds` record by key,
  and each seeded record's trail names its keys, so reordering the list moves nothing else.
- **`position` is written nowhere else in the API.** `prisma/schema.prisma` lines 88 to 100 call
  position 0 the first stage and hold a unique index on the user and the position; the only other
  writes are test inserts in `migrations.test.ts`. No resolver reads statuses yet.
- **What runs the seed.** There is no `seed.test.ts`. `cli.test.ts` migrates a fresh PGlite database
  through a `pg`-shaped client, seeds it, and asserts the sentence the CLI prints. `SqlRunner` is
  one method, `exec`, so the seed has no idea which Postgres it is talking to.

## The approach

1. **The test first**, a case in `cli.test.ts` beside the seed's own: migrate a fresh PGlite
   database, seed it, then read `key` and `position` from `statuses` ordered by position and assert
   new, applied, interview, offer, rejected at 0 to 4. It fails today, where rejected is 3.
2. **The seed's list takes the design's order**, offer before rejected, its comment naming KN-070 so
   the next reader sees which order is meant rather than the words "board order" alone.
3. **Proved by a plant**: the old order back in `DEFAULT_STATUSES` fails the new case where it reads
   the order, the file put back and its hash checked.

## What I will change

- `apps/api/src/database/seed.ts`
- `apps/api/src/database/cli.test.ts`

## What I expect to be hard, and what I am unsure of

- **Where the test belongs.** A `seed.test.ts` of its own would have to bootstrap the migrations
  before it could insert anything, while `cli.test.ts` already migrates and seeds along the path a
  deploy takes, so the case goes there, reading the rows rather than the CLI's sentence.
- **A database seeded before this change would keep the old positions**, since every insert is
  `ON CONFLICT DO NOTHING` on fixed ids. No such database is known to exist: DEPLOY.md's table,
  lines 9 and 10, records the API on Render and the database on Neon as not yet created, and the
  deploy runs the migrations by hand, never the seed. So nothing is filed about correcting data, and
  a seeded database, if one ever exists, is a card of its own then.
- **The API's coverage gate fails on `extraction.service.ts`**, KN-486, so the workspace's whole
  test command is not the measure here; the database tests are run directly.

## How I will know it works

- The new case fails before the change, reading rejected at position 3, and passes after.
- The plant, the old order put back, fails it again, and `seed.ts` is put back by its hash.
- `cli.test.ts` and `migrations.test.ts` pass; tsc and lint pass for the api workspace; no changed
  file's Prettier drift grows, and this plan's is 0.
- No look in a browser: no screen reads statuses from the API yet, so nothing drawn changes.

## Plan review, 2026-09-16, Codex gpt-5.6-terra

Approved for the fresh seed, with one correction taken above. Reordering `DEFAULT_STATUSES` is the
whole fix, since `position` comes from its index alone while the ids and the job trails are keyed by
status; the case belongs in `cli.test.ts`, which drives the same migrate then seed path and reads
the rows rather than the sentence the CLI prints, and PGlite answers ordinary Postgres results, so
the assertion is a sound one at the SQL level. The correction: nothing is to be filed for a deployed
database on this evidence, since DEPLOY.md records the API and the database as not yet created and
the deploy runs the migrations rather than the seed, which its table's own lines 9 and 10 confirm.
The old order planted back is proof enough and should fail at the row order, and no browser check is
needed, since no screen reads these statuses yet. The amended plan goes back to it before building.

## Second plan review, 2026-09-16, Codex gpt-5.6-terra

Approved as amended. The correction takes out the only unsupported assumption about a deployment,
leaving a fresh-seed fix with a test that reads the persisted rows and a mutation that proves the
assertion means something, meeting the exit condition without a speculative data migration.

## Built, 2026-09-16

- **The test first.** A case in `cli.test.ts`, beside the seed's own, migrates a fresh PGlite
  database, seeds it, and reads `key` and `position` from `statuses` ordered by position. Before the
  change it failed with rejected at 3 and the offer column at 4; after it the five read new,
  applied, interview, offer, rejected at 0 to 4.
- **The seed's list** puts the offer column before rejected, and its comment now says what the order
  decides, each status's `position` being its index there, naming KN-070 and the web's own
  `DEFAULT_TOKENS`.
- **The plant.** With the old order put back the case fails on the row order; with nothing planted
  it passes, 1 with 12 skipped. The plant script's first run proved nothing and reported a pass: its
  `-t` matched no test, so all 13 were skipped and the run still exited 0. The skipped count in its
  own output gave it away, the script now refuses a run that matches nothing, and the case name it
  was given is the test's.
- **Checks.** The api workspace's four database test files pass whole, 68 of 68; tsc and lint on the
  changed files pass; drift 0 on `seed.ts`, on `cli.test.ts` and on this plan. No look in a browser,
  since no screen reads these statuses yet.
