# KN-167 · The API schema-entry test is flaky under load and fails the gate at random

Beside the schema entry. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** The cause of the 19 second run is
identified rather than papered over with a longer timeout, the test is made to
run in a bounded time regardless of machine load, and the full apps/api suite
passes twenty consecutive times under a parallel load that reproduces the
original failure.

## The cause, measured

- Every case started the built command with `spawnSync`, one after another.
  A start that checks or generates loads NestJS and GraphQL in a fresh process:
  about 1 second at idle on this 32-core machine, of which importing
  `@nestjs/graphql` alone is 0.6 to 0.8 seconds and bare `node` 0.1. The
  unknown-command case paid the same second, because the entry imported
  `schema.ts` before it read its command. Node's compile cache saves nothing
  here, 1062 against 1066 ms, so it is not the compiling.
- `spawnSync` blocks the worker, and vitest 4.1.11 still fails a case whose
  block overran its budget: the runner compares the elapsed time when the case
  resolves, its comment citing vitest issue 2920. Each case had the default 5
  seconds.
- The cost of a start is CPU, so it grows with load. In a plain full suite run,
  with three PGlite files booting a WebAssembly Postgres for every case beside
  it, the four starts took 1.3 to 2.1 seconds each; with 64 busy loops on the
  32 cores, 2.3 to 3.3 seconds, and the file 11.4 seconds.
- 19.6 seconds for four starts is about 4.9 each, so on 2026-09-10 something
  loaded the machine enough to push one start past 5 seconds. What that load
  was is not known, and the failure itself was not recreated: 128 busy loops
  gave the same 2.2 to 2.9 seconds a start as 64.

## What was done

- The entry reads its command first and loads `schema.ts` only for `generate`
  and `check`, with a dynamic import, so a mistyped command answers in 0.2
  seconds instead of 1.
- The test starts its four runs together, once, in a `beforeAll`, with an
  asynchronous `spawn` that does not block the worker, and the cases read what
  the runs wrote. Under the same 64 busy loops, the old test file, run against
  the new entry, spent 8.4 seconds in its cases, three heavy starts of 2.5 to
  2.8 in a row, and the new one 4.1: the three heavy starts at once cost about
  one and a half starts.
- The runs have no speed budget. 4.1 seconds inside the hook's default 10 would
  have left the next heavy load a margin of about a quarter, which is the same
  failure later. How fast a fresh process starts is the machine's, not the
  command's, so each run gets a hang guard instead: `spawn` stops a run after 60
  seconds, more than ten times the slowest start measured, and the hook
  rejects, naming the command and saying it hung. The hook's own budget is off,
  `0`, so the guard is the one limit, recorded as TECH-DEBT 20. With the guard
  set to 200 ms, the file fails, exit 1, with "schema-entry check ended by
  SIGTERM, stopped as hung after 200 ms".
- The temporary directories are removed after the runs.

## What is not claimed

- Bounded regardless of load means here: the file's result does not depend on
  load, and its time is one batch of starts, never more than the 60 second
  guard. A machine slow enough to take a minute over a one-second start still
  fails it, and should.
- The twenty consecutive runs were not done: the owner's rule of 2026-09-11
  dropped regression batches at the close. The full apps/api suite passed once
  after the change, 101 of 101 with coverage.
