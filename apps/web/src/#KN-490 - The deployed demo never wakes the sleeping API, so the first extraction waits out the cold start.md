# KN-490 - The deployed demo never wakes the sleeping API, so the first extraction waits out the cold start

## The card

**Why.** A reader who pastes a posting right after opening the app waits about fifty seconds for a
server that could have been woken when the page loaded.

**Exit.** With demo sign-in the app requests the health endpoint once on load, which a story or test
observes, and the add modal still explains a slow answer.

## Measured before planning, 2026-09-15

- **Who wakes the API today.** `warmApi` in `core/api/client.ts` sends one `Health` query when an
  address is set and ignores its failure. Its only caller is `RemoteAuthProvider`, in its mount
  effect, and `main.tsx` mounts that provider only when `VITE_AUTH_MODE` is `live`. Pages builds with
  `demo`, which mounts the mock `AuthProvider`, so nothing wakes Render on load.
- **Why not in the providers.** The Storybook preview wraps every story in `AppProviders` with the
  mock provider, so a warm-up there or in `AuthProvider` would send a request from every story; the
  dev Storybook's `.env.local` gives it an address. `main.tsx` runs once per page and no story or
  unit test loads it, and it is excluded from coverage.
- **What can observe it.** The unit project runs in node and cannot load `main.tsx`. The e2e suite
  builds the app with `VITE_AUTH_MODE: demo` and `VITE_API_URL: http://127.0.0.1:4400/graphql`, where
  nothing listens, and Apollo posts the query with its operation name, `Health`.
- **What a request on load meets in the other specs.** `shell.spec.ts`'s "the built bundle loads with
  no console error" collects every console error on load, and a refused connection may log one.
  `add-job`, `demo-session` and `posting-input` answer every GraphQL call themselves, which
  `warmApi` ignores; the rest listen for page errors only, which a caught rejection is not.
- **The slow answer.** The add modal's Loading State says from fifteen seconds that the server may
  be waking, and `LoadingState.stories.tsx` reads that line; nothing here touches it.

## The approach

1. **The e2e spec first.** `e2e/wakes-the-api.spec.ts` answers the API address with a healthy
   response, so nothing fails on the network, and records every request to it. It loads the app,
   waits for the board's heading and a second more, and reads exactly one request, the `Health`
   query. Against today's app it should read none.
2. **`main.tsx` wakes the API**, calling `warmApi` once before it renders, in either sign-in mode,
   with the comment saying why it is the page's job and not a sign-in provider's.
3. **`RemoteAuthProvider` stops calling it**, so live sign-in sends one request on load as well,
   not two.
4. **The other specs**: `shell.spec.ts`'s console test is run after the change. If it fails on the
   refused connection, that test answers the health query as the new spec does, rather than
   filtering the message out, which would hide a missing asset as well.

## What I will change

- `apps/web/src/main.tsx`
- `apps/web/src/core/auth/RemoteAuthProvider.tsx`
- `apps/web/e2e/wakes-the-api.spec.ts`, new
- `apps/web/e2e/shell.spec.ts`, only if its console test fails as described

## What I expect to be hard, and what I am unsure of

- **"Once" and StrictMode.** A call in the module body of `main.tsx` runs once a page, where an
  effect would run twice in development under StrictMode; the e2e reads a production build, where
  either would be once.
- **Counting after a settle.** One request is read a second after the board shows, which catches a
  second request sent at mount but not one sent much later; nothing in the app sends one later.
- **The e2e runs build the app**, each taking minutes, and run in two projects, desktop and phone.

## How I will know it works

- The new spec fails before the change, reading no request, and passes after it in both projects.
- The whole e2e suite passes after the change, `shell.spec.ts` included; tsc, lint and the unit
  project pass; and no changed file's Prettier drift grows.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved, with amendments, all taken. The new spec seeds a demo session before it navigates, with
`signedIn` as the other specs do, or it never reaches the board's heading; with the mock provider no
other call goes to the API, so the `Health` query is the only one it answers. It records only the
POSTs it answers and asserts their operation names are exactly `Health`, rather than counting every
request. `main.tsx` is the right place: its module runs once a page, whatever StrictMode does to
effects, and no story loads it; and `RemoteAuthProvider` loses nothing it relied on by giving up its
call, which only doubled the live request. `shell.spec.ts` should be expected to need the same
route, since Chromium logs a refused fetch as a console error even when the promise is caught, and
answering the request is the repair, not filtering the error. The Loading State's slow-answer story
stays among the checks.

## Built, 2026-09-15

- **The spec came first.** `e2e/wakes-the-api.spec.ts` seeds a demo session, answers the API
  address as a healthy API would, records the operation of every POST it answers, loads the app,
  waits for the board's heading and a second more, and asserts exactly one `Health`. Against the app
  as it was it failed in both projects, with no request at all.
- **The change.** `main.tsx` calls `warmApi` once in its module body, before it renders, with the
  comment saying why the page does it and not a provider; `RemoteAuthProvider` no longer calls it,
  so live sign-in sends one request too. The spec passes in both projects.
- **The shell spec was measured, not changed.** Its console test passed against the changed app in
  both projects: the refused connection to the build's address logged no console error in
  Playwright's Chromium, so the route the review expected it to need was not added.
- **The whole e2e suite**: 91 passed, 9 skipped and 2 failed, the two-tabs test of a tab part way
  through signing in, on the desktop, and the network test that deletes two people through the bar,
  on the phone. Both fail the same way with `main.tsx` and `RemoteAuthProvider.tsx` as HEAD has
  them, the change put back byte for byte afterwards, so neither is this change's: the first is
  KN-601, and the second is now KN-651.
- **Checks.** tsc and lint pass. The unit project passed except `session.test.ts`, whose two tests
  overran their 5 s under load, KN-551, and passed alone. The Loading State's seven stories pass,
  the slow answer's line among them. Prettier drift is 0 in the changed files and this plan; the new
  spec was written as Prettier writes it after the e2e runs, one line rewrapped.
- **No look.** Nothing a reader sees changed.
