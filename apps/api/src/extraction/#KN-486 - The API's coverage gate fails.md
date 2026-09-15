# KN-486 - The API's 100 percent coverage gate fails: extraction, the posting fetcher and the database adapter are barely tested

## The card

**Why**, from the board: Coverage is a product rule, and the fetcher is the code
that guards against reading private addresses: untested, a refactor can open it
with every test green.

**Exit condition**, from the board: npm test in apps/api passes its 100 percent
thresholds, and a test stubs fetch to throw for any host but 127.0.0.1, so no test
can reach a provider.

Filed from KN-477's review, A-04 and H-07. High, three points.

## The owner's words this touches

- **2026-09-11**: 100 percent coverage is a product rule.
- **2026-09-12, to Codex**, read in the log the owner pasted on 2026-09-14, right
  after Codex had sent real requests to Groq with the owner's key: "If you have AI
  test, remove that, I didn't ask for an AI API test". Codex deleted
  `extraction.test.ts` in ea9863b and wrote in `AUTH-AND-EXTRACTION.md`: "AI
  provider tests were removed at the owner's request; deployment checks must not
  submit ads to the AI provider." The deleted tests replaced `fetch` with a stub
  and never sent a request anywhere.

The two can be read together (no test may reach an AI provider, and our own code
is still tested) or apart (no test of the AI extraction at all), and only the owner
can say which. **Asked in chat on 2026-09-15.** Until the answer, this plan builds
everything that is not a test of `extraction.service.ts`.

## What is there, measured on 2026-09-15

`npx vitest run --coverage` in `apps/api`: 156 tests in 14 files pass, and the
thresholds fail at 82.56 percent of statements, 70.71 of branches, 82.47 of
functions and 83.84 of lines. The files under 100:

- **`src/extraction/extraction.service.ts`**, 17.02 of statements, lines 48 to 119:
  everything after the length check. No test file.
- **`src/extraction/posting.ts`**, 64.22, lines 49 to 101: `readPosting`, the DNS
  check, the pinned lookup, redirects, status and type checks and the size limit.
  `posting.test.ts` tests `publicAddress`, `postingUrl` and `postingText` only.
- **`src/auth/database.service.ts`**, 16.66, lines 18 to 32: the `pg` pool adapter.
  Every test replaces `AuthDatabase` with PGlite, so its own `query` and
  `transaction` never run.
- **`src/auth/auth.resolver.ts`**, 50 of branches, lines 17 to 22: the `req.ip ??
req.socket.remoteAddress ?? ''` fallbacks, since supertest always sets `req.ip`.
- **`src/auth/auth.service.ts`**, lines 14 and 15: the callbacks that turn Persian
  and Arabic-Indic digits into Latin ones; the test sends a Latin number.
- **`src/extraction/extraction.resolver.ts`**, line 25: extraction by a signed-in
  account, and the same address fallbacks.

## The approach

1. **`posting.ts`'s `readPosting`, with no network**: `vi.mock('node:dns/promises')`
   answers the lookup, and `vi.mock('node:http')` and `vi.mock('node:https')` put a
   fake `request` in place that records its options and plays a response written
   by the test. Cases: a private address in the answer refused before any request;
   an empty answer refused; the request's `lookup` option handing back the checked
   address, one or all; 200 `text/html` read; a status other than 200, a type other
   than text refused; a redirect followed, a relative one resolved, a fourth one
   refused, one with no location refused, a location that is not a URL refused; a
   body over two million bytes destroyed with `POSTING_TOO_LARGE`; a request or
   response error passed on; an aborted signal refused.
2. **`database.service.ts`**, with `vi.mock('pg')`: the pool made from
   `DATABASE_URL` with its limits; `query` passing its values; `transaction`
   running BEGIN, the work and COMMIT, or ROLLBACK and the error, releasing the
   client both ways; `onModuleDestroy` ending the pool.
3. **The resolvers**, called directly with a stub `AuthService` and
   `ExtractionService`: the address from `req.ip`, else the socket's, else empty,
   for both auth mutations and demo extraction; extraction by a signed-in account
   counted against that account.
4. **`auth.service.ts`**: `phoneNumber` given Persian and Arabic-Indic digits.
5. **No test can reach a provider**: `vitest.setup.ts` replaces `fetch` with one
   that throws for any host but 127.0.0.1 and localhost, and a test asserts it
   throws for Groq's and OpenAI's addresses. A test that stubs `fetch` itself gets
   the guard back from `vi.unstubAllGlobals()`.
6. **`extraction.service.ts`**: waits on the owner. If stubbed tests are allowed,
   they come back from ea9863b's parent, fitted to the code as it is now, the link
   path with `readPosting` mocked. If not, the thresholds cannot pass without the
   owner deciding what happens to that file.

## How I will know it works

- `npm test` in `apps/api`: every file above but `extraction.service.ts` at 100,
  and the whole suite green; eslint and tsc in `apps/api`.
- Plants, each restored by hash: the pinned lookup handing back the hostname's
  first answer unchecked, the redirect limit raised, the size limit removed, and
  ROLLBACK dropped, each failing a test.
- The guard: a test that calls the real `fetch` for a provider's host fails.

## What I am unsure of

- **Whether the owner's words cover stubbed tests**, above.
- **`vi.mock` of Node's built-ins under `unplugin-swc`**: `posting.ts` imports
  `lookup` and `request` by name at the top, so the mocks have to be hoisted above
  that import; vitest does that for `vi.mock`, and the plan checks it before
  writing the cases.
- **The guard and `supertest`**: supertest does not use `fetch`, so the guard does
  not touch the auth tests; the SMS adapter's test stubs `fetch` itself.

## Plan review, Codex, 2026-09-15

Sound for the fetcher, the adapter, the resolvers and the digits, and right to hold
the extraction service's tests: ea9863b deleted even stubbed tests right after the
owner's words, so stubbed tests are not clearly allowed. The card cannot close
while that waits; the rest at 100 is progress, not a passing `npm test`.

**Two changes, both taken**: the guard lets 127.0.0.1 alone through, as the exit
says, and not `localhost`; and it is assigned in `vitest.setup.ts` rather than
stubbed, because `vi.unstubAllGlobals()` in `sms.test.ts` puts back what was there
before the first stub, so a test proves that a stub and its removal leave the guard
in place.

**The details, taken**: the fake request calls the `lookup` it was given, in both
of its forms, as a socket would, and `destroy(error)` raises the request's `error`;
`AuthDatabase.query` is also called with no values, a branch of its own. The
plants check the tests; they are not a gate of the card.

## Where it stands, 2026-09-15

Built, and waiting on the owner for the rest.

- **`read-posting.test.ts`**: `readPosting` against a mocked DNS lookup and a fake
  request that plays back a scripted response and asks the request's own `lookup`
  in both forms. The checked address is the one handed back; http and https; a
  bracketed IPv6 host; a private answer and an empty one refused before any
  request; an aborted signal; a status other than 200 or none; a type other than
  text or none; a relative redirect followed and checked; a redirect to a private
  address refused; three redirects followed and a fourth refused; a redirect with
  no location or one that is no URL; exactly two million bytes read and one more
  refused; request and response errors.
- **`database.service.test.ts`**: the pool from `DATABASE_URL` with its limits and a
  refusal without one; a query with a copy of its values and one with none; a
  transaction committed and one rolled back, the client released both ways; the
  pool ended.
- **`auth.resolver.test.ts` and `extraction.resolver.test.ts`**: the address from
  the request, from its socket or nothing; extraction by a signed-in account.
- **`auth.service.test.ts`**, found while measuring, since the report names a file's
  uncovered branches only once its lines are covered: Persian and Arabic-Indic
  digits, numbers that are not one, a missing or short `AUTH_SECRET`, a transaction
  that gives back neither a refusal nor a login, a name of spaces, one over 100
  characters and one of exactly 100.
- **`vitest.setup.ts`** assigns the guard, and `network-guard.test.ts` shows it
  refusing Groq, OpenAI, Kavenegar, example.com and localhost, letting 127.0.0.1
  through, and still there after a stub and `vi.unstubAllGlobals()`.

Measured: the API suite, 203 tests in 20 files, every file at 100 but
`extraction.service.ts` at 17.02 of statements, so `npm test` still fails its
thresholds; eslint, tsc and prettier clean.

Plants, each restored by hash: the DNS check reading the first answer only, a
fourth redirect followed, the size limit raised, ROLLBACK dropped, and the guard
letting every host through, each failing its test.

**What the guard's plant did**: with the guard off, the guard test's own requests
were attempted for real, POSTs with no body and no key to api.groq.com,
api.openai.com, api.kavenegar.com and example.com, and one to localhost. The test
now sends every such request already aborted, and the same plant fails it in 1 to 8
milliseconds with Node's abort error and no connection.

**Waiting on the owner**, asked in chat on 2026-09-15: whether tests of
`extraction.service.ts` that stub `fetch` are allowed. KN-486 is blocked until then.
