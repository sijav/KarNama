# KN-419 · Two tabs of KarNama do not agree about who is signed in

**Why, from the board.** A reader who signs out on a shared machine expects every
tab to close, and the one that did not is the one somebody else finds open.

**Exit condition, from the board.** A storage event moves both providers: signing
out in one tab signs the other out, and a board changed in one tab is what the
other shows, each with a test.

Raised from low to high on 2026-09-14 by KN-431's roast: it is a data loss, not
only a disagreement.

## What the providers do today, read 2026-09-14

- **`RecordsProvider`** reads the board from storage once, when it mounts,
  `RecordsProvider.tsx` line 135, under `karnama.records:<owner>`, and on every
  change writes its whole copy back, lines 145 to 153. Nothing listens for another
  tab's writes.
- **`AuthProvider`**, the demo sign-in the Pages build ships with
  (`VITE_AUTH_MODE: demo` in `pages.yml`), reads the session from
  `karnama.session` once, `AuthProvider.tsx` line 108, and writes or removes it on
  every change, lines 83 to 90. Nothing listens there either.
- **`RemoteAuthProvider`**, the live mode, keeps its token in `sessionStorage`,
  `core/api/client.ts` lines 29 to 44, which is one tab's by design: tabs of the
  live mode never share a session, so nothing there follows another tab, and it is
  not in the shipped build. It is left as it is.
- **`OwnBoard`**, `AppProviders.tsx` lines 115 to 123, keys the records provider
  on the signed-in reader's phone, so a session that changes brings that reader's
  board with it.

## Measured, 2026-09-14

Two real tabs of the running app, Chromium, one browser context, so they share
localStorage and deliver storage events to each other:

- tab B opened first, signed in, on an empty board;
- tab A loaded the sample data: storage held 30 job opportunities under
  `karnama.records:09120000000`, and tab B still showed none;
- tab B added one job opportunity by hand: storage then held **1**, tab A's 30
  written over by tab B's stale copy;
- tab A still drew its cards from memory, and after a reload showed **1**;
- tab A signed out: the session left storage, and tab B still showed the board,
  with no sign-in screen.

## The approach

1. **`RecordsProvider` listens for `storage` on the window**, in an effect with
   its cleanup, depending on the owner and the fresh board. When the event's key
   is this reader's, `keyFor(owner)`, it reads the event's `newValue` through
   `readRecords` with the fresh board as the fallback, a removed or malformed
   value being the fresh board too, and a `null` key, another tab's `clear()`,
   the same. It sets `latest` first and then the state, and writes nothing back:
   the other tab has already written it. A file the other tab added has no bytes
   here, and its download does nothing, as for a file from an earlier visit.
2. **`AuthProvider` listens the same way** for `karnama.session`: a valid session
   in `newValue` is adopted, and a removed one, a malformed one, or a cleared
   store signs this tab out. Either way it sets `latest` and the session, and
   drops any code it was waiting on, both the pending ref and the sent state. It
   does not call `hold`, which writes back.
3. **The event's key and `newValue` are what is read**, not `storageArea`: a
   storage event is delivered only to the other documents, so neither tab hears
   its own writes, and each story's own storage, `.storybook/own-storage.ts`, is
   an in-memory stand-in that a real `StorageEvent` will not take as its area.
4. **`App` needs nothing new**: `OwnBoard` already brings the adopted reader's
   board, and a sign-out takes it away. Clearing the store in one tab resets every
   open tab, which is what clearing it means.

## The tests

The node unit project cannot see this: `RecordsProvider.test.tsx` and
`AuthProvider.test.tsx` render with `renderToString`, where no effect runs. So
the tests are stories in the browser project, which write the story's own
storage and dispatch the event another tab's write would deliver:

- **`ChangedInAnotherTab`**, the board's, in `JobsScreen.stories.tsx`: it writes
  the seeded records with one more job opportunity under the provider's key,
  dispatches `storage` with that key and value, and sees the new job opportunity
  on the board; then adds one on this board and finds both in what is stored,
  where today this tab's copy would have written the other's away.
- **`SignedOutInAnotherTab`**, the shell's, in `App.stories.tsx`: signed in by the
  decorator, it removes the session from its own storage, dispatches `storage`
  with the session's key and no value, and sees the sign-in screen.
- **`SignedInInAnotherTab`**, the shell's, from the plan review: signed out, it
  receives another tab's session with no name yet, sees the name step, saves a
  name, and reaches the board with that name kept. Saving a name reads `latest`,
  so this is what proves the adoption sets it.

**All three must fail on today's code first.** After the fix, the records
listener taken away must fail `ChangedInAnotherTab`; the session listener taken
away must fail both shell stories; and the adoption setting the session but not
`latest` must fail `SignedInInAnotherTab` where the name is saved.

And the real check: the two-tab measurement above run again, where tab B's add
must leave tab A's 30 and its own 1 stored, and tab A's sign-out must bring tab B
to the sign-in screen.

## Files

- `apps/web/src/core/records/RecordsProvider.tsx`: the listener.
- `apps/web/src/core/auth/AuthProvider.tsx`: the listener.
- `apps/web/src/screens/JobsScreen.stories.tsx` and its docs in both languages.
- `apps/web/src/app/App.stories.tsx` and its docs in both languages.

## What I am unsure of

- **A write that crosses one on its way**: two tabs changing within the moment
  the event takes to arrive still leave the last write standing. Each tab now
  takes in the other's board before its next change, which closes what was
  measured; it does not make the store transactional, which only the API will.
- **A provider seeded with `initial`** listens too. Stories are the only thing
  that seeds one, and they are where the test lives.

## How I will know it worked

The three stories fail on today's code and pass after the fix; each plant fails
its story where it aims; the providers' node tests, the board's and the shell's
other stories still pass; the two tabs keep 31 job opportunities and sign out
together in the running app; lint, tsc and the unit project's docs guard pass.

## Plan review, Codex, 2026-09-14

Codex, with web search, approved the plan: localStorage's storage event reaches
the other same-origin tabs and never the writer, sessionStorage's does not cross
tabs, `clear()` delivers nulls, and nothing makes two writes transactional. Taken
from it: the session listener sets `latest` and drops the pending code, both the
ref and the state, and never calls `hold`, which would write back; each listener
is an effect with its cleanup and its dependencies; a malformed value is a fresh
board or a sign-out; and a third story, a valid session from another tab, since
without one the adoption and `latest` are unproved, and an unnamed reader
adopted that way must still be able to save their name. A Playwright test with
two pages in one browser context is the stronger durable proof of real delivery;
it is not taken here, since the stories prove the providers and the two-tab check
in the running app proves the delivery once.

## Amended while building, 2026-09-14

Four things the plan above did not have, found while writing the tests.

- **The stories cannot see which key the board listens on.** The preview wraps
  every story in `AppProviders`, whose own session provider has nobody signed
  in, so the board's provider in every story, the shell's included, sits outside
  the story's seeded reader and keeps the bare key. A listener watching the bare
  key instead of the reader's own would pass every story and miss every real
  write. So the two-tab measurement is a Playwright test after all,
  `e2e/two-tabs.spec.ts`, which is the running app with a real reader's key and
  the browser's own delivery, rather than a check run once. Desktop only: the
  storage the tabs share is the same at every width.
- **Nothing proved the session listener reads only its key.** Without that check
  another tab's change to the board, or its language, would sign this tab out,
  and no story wrote any other key where a session provider hears it.
  `SignedOutInAnotherTab` now starts with another tab's change to the board,
  which must show here with the reader still signed in.
- **The stories cannot see what the session adoption sets.** Plants 5 and 6
  below passed every story at first, `SignedInInAnotherTab` included, after it
  had been made to ask for a code first and to end with the other tab's
  sign-out. In a story the providers under the preview's board remount when
  another tab's reader arrives: the preview's own session provider takes the
  reader in and re-keys the board, and the story's provider, inside it, reads
  the session back from storage with a fresh `latest` and no code. The app's
  session provider sits above its board and never remounts. So the story went
  back to what it can prove, and a second e2e test does it the app's way: a tab
  part way through signing in, at the code step, is signed in by another tab's
  first login, saves the name, and asks for the number again when that tab
  signs out.
- **A cleared store** is the end of `ChangedInAnotherTab` for the board, a key of
  null leaving the fresh board, and the end of the e2e test for the session,
  where a real `clear()` in one tab signs the other out.

The stored value is read one way, `readBack` in each provider, whether it is read
at mount or arrives in an event, so a malformed value is handled once.

Plants, each restored byte for byte, and where each must fail:

1. The board's listener removed: `ChangedInAnotherTab` where the other tab's job
   opportunity should show, and `SignedOutInAnotherTab` where the board write
   should show.
2. The board's adoption not setting `latest`: `ChangedInAnotherTab` where the
   store must hold both.
3. The board's listener ignoring a null key: `ChangedInAnotherTab` at the clear.
4. The session listener removed: both shell stories, at the sign-in screen and
   at the name step.
5. The session adoption not setting `latest`: the second e2e test, where the
   name is saved.
6. The session adoption keeping the code: the second e2e test, at its end.
7. The session listener taking every key: `SignedOutInAnotherTab` at the board
   write.
8. The board listening on the bare key: the e2e test, where the second tab should
   show the samples.
9. The session listener removed: the e2e test, where the second tab should be
   signed out.

## Result, 2026-09-14

- **Red first.** On the old code, before the steps the plants below needed were
  added, `ChangedInAnotherTab` failed where the other tab's job opportunity
  should show, `SignedOutInAnotherTab` at the sign-in screen, and
  `SignedInInAnotherTab` at the name step.
- **Green.** The three stories pass, and so do both e2e tests on a fresh build.
  The e2e test checks 30 job opportunities and the added status stored after the
  second tab's change, rather than the 31 the plan named: the change is a status
  added, not a job opportunity typed in by hand.
- **Plants.** 1 to 4 and 7 fail their stories on the lines they aim at; 8 and 9
  fail the first e2e test at the second tab's samples and at its sign-in screen;
  5 and 6 fail the second e2e test where the name is saved and at its end. Every
  plant was restored byte for byte, checked by hash.
- **Coverage.** Run alone, the board's and the shell's stories reach every line
  and branch the two listeners add. The one line of each provider they leave is
  the catch for a malformed stored value, which the providers' node tests reach.
  The merged report cannot show both halves, KN-103.
- **The rest.** tsc, lint and prettier on what changed, the web unit project at
  1367, and the story docs guard pass. In the two story files only the board's
  `Adding` fails, KN-495, as it did before.
