# KN-403 · KN-167 traded the schema-entry test's 5 second budget for a 60 second one: test runSchemaCommand in process and start only light processes

Beside the schema entry, per `agent/RALPH.md` step 2b. Child of KN-167, from its
roast.

## The card

**Why.** A test whose result depends on how busy the machine is fails the gate
at random, which is what KN-167 was filed to end; a bigger number only moves the
day it happens.

**Exit condition.** No test in apps/api starts a process that loads NestJS or
GraphQL; runSchemaCommand lives outside the entry file and its generate, current
check, stale check and unknown command are tested in process against the source,
covered; the schema entry's process test runs only commands that answer without
loading the schema, in the default budget; HUNG_AFTER_MS, the hook budget of 0
and TECH-DEBT 20 are gone; the apps/api suite passes.

## What is true today

- `src/graphql/schema-entry.ts` holds `runSchemaCommand` itself, the function
  that decides everything: an unknown command, `generate` writing `schema.gql`,
  `check` answering current or stale. It is excluded from coverage in
  `vitest.config.ts` as though it were six lines of wiring, which it is not.
- `runSchemaCommand` already loads `schema.ts`, and with it `@nestjs/core`,
  `@nestjs/graphql` and `graphql`, only after the command is known, KN-167, so
  an unknown command answers without them. Measured on the built entry at idle,
  2026-09-14, three runs each: an unknown command answers in 157 to 163 ms, exit
  1, and `check` in 762 to 770 ms, exit 0.
- `src/graphql/schema-entry.test.ts` spawns the BUILT entry four times together,
  check current, check stale, generate and an unknown command, three of which
  load NestJS and GraphQL. Its `beforeAll` has a budget of `0` and each spawn a
  60 second `HUNG_AFTER_MS`, TECH-DEBT 20. It tests `dist`, not the source.
- The database side is the shape to copy: `src/database/cli.ts` holds the logic,
  tested in process, and `cli-entry.ts` is six lines whose process test,
  `cli-entry.test.ts`, runs only commands that answer before anything heavy.
- The two are the only tests in apps/api that start a process.
- `generateSchema` builds in process in about 100 ms, and `schema.test.ts`
  already does it in the `schema` project, which inlines `graphql` and
  `@nestjs/graphql` so the scalars share one realm.

## The approach

1. **Move `runSchemaCommand` to `src/graphql/schema-command.ts`**, unchanged in
   what it says and returns, with one addition: the schema module is loaded
   through a parameter that defaults to `() => import('./schema.js')`, the way
   `runCommand` in `cli.ts` takes `connect`. That is what lets a test prove an
   unknown command never loads it, rather than trusting a comment.
2. **`schema-entry.ts` becomes the guard alone**: `isEntrypoint`, call
   `runSchemaCommand` with argv and the process's streams, set the exit code.
   Its coverage exclusion then says what is true.
3. **`src/graphql/schema-command.test.ts`, in process, in the `schema` project**:
   `check` against the repository finds `schema.gql` current and writes to
   `out` with 0; `check` in a temporary directory holding a stale schema writes
   the stale message to `err` with 1; `generate` into an empty temporary
   directory writes `Wrote schema.gql` to `out` with 0 and a file byte for byte
   the committed one; an unknown command writes its message to `err` with 1 and
   calls the loader not at all.
4. **`schema-entry.test.ts` keeps only light runs** of the built entry, as
   `cli-entry.test.ts` does, with `spawnSync` in each case's default budget: an
   unknown command, and no command at all, each exit 1 and name the command.
   Still skipped when `dist` is absent. `HUNG_AFTER_MS`, the `beforeAll` and its
   budget of `0` go.
5. **TECH-DEBT 20 is deleted**, its own retiring check met: the process test no
   longer loads NestJS, and the hook has its default budget.
6. **Rebuild `dist`** before the process test, so it runs the moved code, then
   the whole apps/api suite.

## What changes, file by file

- `apps/api/src/graphql/schema-command.ts`: new, `runSchemaCommand` with its
  loader parameter.
- `apps/api/src/graphql/schema-entry.ts`: the guard only.
- `apps/api/src/graphql/schema-command.test.ts`: new, the four cases in process.
- `apps/api/src/graphql/schema-entry.test.ts`: two light runs.
- `TECH-DEBT.md`: entry 20 removed.

## What I expect to be hard, and what I am unsure about

- **Which project the new test lands in.** `src/graphql/**/*.test.ts` goes to
  the `schema` project, which inlines what an in-process schema build needs, and
  that is where it belongs; I will confirm it runs there and not in `api`.
- **Whether a light start of the entry stays light.** The entry imports
  `isEntrypoint` from `database/cli.ts`, which imports `pg` and the env parser.
  Not NestJS or GraphQL, so the exit holds, but if a start is slower than a
  second I will move `isEntrypoint` somewhere lighter rather than raise a budget.
- **Whether "loads NestJS" can be checked, not just read.** The loader parameter
  proves it for the function; for the built entry the check is that the unknown
  command's path never reaches `import('./schema.js')`, which the in-process
  test covers.
- **The suite's last clause.** `npm test` in apps/api fails its coverage gate
  today on code this card does not touch, KN-486; this card must not add to it,
  and its new file must be covered whole.

## How I will know it worked

`schema-command.test.ts` passes its four cases in process and covers every line
and branch of `schema-command.ts`; `schema-entry.test.ts` passes its two light
runs against a fresh `dist` in the default budget; `grep` finds no
`HUNG_AFTER_MS` and no TECH-DEBT 20; moving the call to the loader above the
command check fails the unknown-command case; lint and `tsc` are clean; the
apps/api tests pass, with its coverage gate no worse than KN-486 leaves it.

## The plan review, and what changed

Codex, plan kind with web search, 2026-09-14, archived at
`%TEMP%/claude-roast/2b1874631dd1/20260914T141747-plan-kn-403-kn-167-traded-the-schema-entry-test-s-5-s-a74775.md`.

- **The design is sound**: the module move, the `schema` project for the
  in-process test, the default dynamic import, and the built entry kept to an
  unknown and an absent command with `spawnSync` in the default budget. It ran
  the current built entry for both, and each exited 1 before the schema import.
  Accepted.
- **`import 'reflect-metadata'` first in the new test**, because Vitest isolates
  each file and `vitest.setup.ts` does not install it. Accepted; the draft had it.
- **The loader parameter proves less than the plan said**: that the unknown
  command's branch never calls its loader, not that nothing imports `schema.ts`
  at the top of the module. Accepted, and the claim above is narrowed to the
  branch. A static import added later would make the entry's light runs load
  NestJS again without failing a test; that is written down here rather than
  guarded, because this card's exit is about which commands the process test
  runs, and a source guard would be a new gate nobody asked for.
- **"The apps/api suite passes" cannot be claimed while KN-486's coverage gate
  fails.** Accepted as a fact and not solved here: under the owner's rule of
  2026-09-11 a close tests what changed, so KN-403 closes on its own tests,
  lint, `tsc` and its new file's coverage, and its evidence says the gate still
  fails on the files KN-486 carries, none of them touched here.
- **A fresh rebuild does not stop the built-entry test from skipping or passing
  against a stale `dist`**, which KN-404 carries. Accepted: not claimed.
- **The light start measured**: 157 to 163 ms for an unknown command, with
  `pg` and the env parser loaded through `isEntrypoint`, so `isEntrypoint` stays
  where it is.

## Found while building

- **The in-process check timed out at 5000 ms, alone and in the full suite.**
  `schema.test.ts` imports `schema.ts` at the top of its file, so the first
  import of the inlined NestJS and GraphQL, seconds in the `schema` project,
  happens while the file loads, outside any case's budget. The new test reached
  it only through `runSchemaCommand`'s dynamic import, inside its first case.
  The fix is the same top-of-file import in the test, not a longer budget; the
  command module itself still imports nothing heavy at its top.
