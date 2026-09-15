# KN-542 - Loading the sample data takes a status of the reader's own for a deleted default when it wears that default's colour

## The card

**Why.** The sample data is how a tester fills a board, and loading it should give back the design's
five statuses rather than fill a reader's own stage with job offers.

**Exit.** `withSamples` matches a default only by its id, and a unit test with the default offer
deleted and a status of the reader's own coloured offer's green finds the default restored and the
reader's status holding nothing new.

Found by KN-440's plan review, and again by KN-544's roast, which is why it was raised from low to
medium: two reviews have turned up the same hole.

## Measured before planning, 2026-09-16

- **The loader.** `samples.ts` line 24:
  `const existing = statuses.find((held) => held.id === entry.id) ?? statuses.find((held) => held.token === entry.token)`.
  The second find is identity decided by colour.
- **A default's id is its token, and never changes.** `emptyRecords`, `records.ts` line 176, builds
  the five through `defaultStatuses`, which gives each its token as its id; a status the reader adds
  takes `newId('status')`, so its id is never one of the five. KN-440 settled that which status a
  column is, is its id, and KN-544 made the board's first fold read the id too.
- **So**: a reader who deletes an empty default and gives a status of their own that default's
  colour has the sample job opportunities meant for it land in their own status, and the default is
  never restored. With all five present the id match wins and the fallback never fires.
- **Who calls it.** `withSamples` has one caller, `RecordsProvider`'s `loadSamples`, line 192, which
  Settings' «بارگذاری داده‌های نمونه» drives; `App.stories.tsx` drives that twice, each on a board
  holding all five defaults, so neither meets the fallback.
- **The tests.** `samples.test.ts` holds three cases. Its third already keeps a **recoloured**
  default, `{ id: 'new', token: 'custom-1', name: 'My inbox' }`, matched by id, so dropping the
  fallback leaves it as it is.

## The approach

1. **The test first**, a fourth case in `samples.test.ts`: a board whose statuses are the five
   defaults less `offer`, plus a status of the reader's own wearing offer's green. After loading,
   the board holds a status whose id is `offer` again, the reader's own status is still there
   wearing its colour, **a sample job opportunity sits in the restored `offer`**, and none sits in
   the reader's status. Both halves are asserted: the restored column alone would not prove the
   samples meant for it went there. It fails today, where they land in the reader's status and no
   default comes back.
2. **The loader matches a default by its id alone.** The `??` fallback goes, and the comment says
   which status a status is, is its id, KN-440 and KN-544, and never the colour a reader may give it.
3. **A plant**: the fallback put back fails the new case, and `samples.ts` is restored by its hash.

## What I will change

- `apps/web/src/core/records/samples.ts`
- `apps/web/src/core/records/samples.test.ts`

## What I expect to be hard, and what I am unsure of

- **A renamed default** keeps its id, so it is still matched, which the third case already holds.
- **A default deleted and a status of the reader's own added in its place** now gets the default
  back as a column of its own. That is the intent of restoring the five, and `columnOrder` puts it
  where the design has it, by its id.
- **What a reader sees** changes only on a board in that state, and no story holds one: the proof is
  the unit test, as the exit asks. Building a story for it would be a change of its own shape.
- **Records already loaded** are preserved, which the second case holds: loading twice changes
  nothing.

## How I will know it works

- The new case fails before the change and passes after it; with the fallback planted back it fails
  again, and `samples.ts` is put back by its hash.
- `samples.test.ts`'s other three cases, the records tests, and the unit project pass; the App
  stories that load the sample data pass; tsc and lint pass; no changed file's Prettier drift grows,
  and this plan's is 0.

## Plan review, 2026-09-16, Codex gpt-5.6-terra

Approved with one small amendment to the test, taken above. It read the path itself: `withSamples`
is the only place in the records layer that treats a matching colour as identity, `RecordsProvider`
only calls it and `readRecords` keeps ids, so dropping the token lookup is the whole product fix,
and `Array.find` returning the first match means the id lookup already wins wherever the default is
still there. The amendment: the case must assert that a generated sample job opportunity sits in the
restored `offer` as well as that none sits in the reader's own status, since "restored" and "the
reader's status gained nothing" together would not prove the samples meant for that column went to
it. The colour-fallback plant will fail that case. A board carrying duplicate or hand-edited default
ids stays malformed stored data the model cannot tell apart, which this change neither introduces
nor worsens, and no story is needed for a loader contract. The amended plan goes back to it before
building.

## Second plan review, 2026-09-16, Codex gpt-5.6-terra

Approved. The amended case proves the whole contract: Job offer restored by its id, its sample job
opportunities carrying that restored id, and the reader's green status receiving none. Dropping the
token fallback is the complete fix, no other records, provider or storage path reads a colour as
identity, the fallback planted back will fail at the assertions the case aims at, and a story would
add no stronger evidence for a loader transformation.

## Built, 2026-09-16

- **The test first.** The fourth case in `samples.test.ts` builds a board of the five defaults less
  `offer` plus a status of the reader's own wearing offer's colour. On the old loader it failed at
  its first read, "expected [ 'new', 'applied', 'interview', …(2) ] to include 'offer'": the
  reader's status had been taken for the default, and the default never came back.
- **The loader** matches a default by its id alone. The `??` fallback is gone, and the comment says
  which status a status is, is its id, KN-440 and KN-544, and what matching a colour as well cost.
- **The plant.** With the fallback put back the case fails at that same read; with nothing planted
  it passes, 1 with 3 skipped. `samples.ts` was put back and its hash checked.
- **Checks.** All four cases of `samples.test.ts` pass; the App stories that load the sample data
  pass, 14 of 14; tsc and lint pass; drift is 0 on the loader, on the test and on this plan. The
  unit project passed 1523 of 1525, its two failures `session.test.ts` under load, KN-551, which
  passed alone, 2 of 2.
- **One thing those checks surfaced, and it was not this card's.** The unit project's literal guard
  failed on `AddJobModal.stories.tsx`: KN-559, closed an hour earlier, had written MUI's cap as the
  text `calc(100% - 64px)`, which the guard refuses anywhere under `src` outside `theme`. It was
  filed as KN-658, repaired and closed on a commit of its own before this one, and the unit run
  above is the one after that.
