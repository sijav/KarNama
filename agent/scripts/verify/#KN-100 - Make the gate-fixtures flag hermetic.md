# Plan — KN-100, make the gate-fixtures flag hermetic

> **Recovered.** This plan was deleted on 2026-09-10 by KN-160's first version,
> which told me to remove a plan when its task closed on the grounds that git
> held every version. It did not: `.gitignore` carried `.claude/plan-*.md`, so
> this file had never been committed. It is restored here from the session
> transcript, at the location the corrected rule gives it, beside the verifiers
> it describes. KN-071's plan was deleted the same way and could not be
> recovered.
>
> Kept exactly as it was written, including the parts the plan check later
> corrected, because a plan is a record of what was intended at the time and
> editing it after the fact destroys the only thing it is good for.

## The task, from the board

**Why.** A flag that changes what the test suite runs is dangerous by
construction, and this one turns on for a value that reads as off. The failure
it produces is the worst kind: a suite failing for a reason nobody can find, in
an environment nobody thought about.

**Exit condition.** `KARNAMA_GATE_FIXTURES=0 npm test` passes and runs no
fixture, the ordinary run inside `agent/scripts/verify/KN-003.mjs` passes with
the variable set to any value in the parent environment, and both are proved by
planted environments.

## Both halves confirmed by reading, not assumed

`apps/web/vitest.config.ts:31` — `const gateMode = Boolean(process.env.KARNAMA_GATE_FIXTURES)`.
`Boolean("0")` is `true`. So `KARNAMA_GATE_FIXTURES=0` ENABLES the fixture that
is designed to fail.

`agent/scripts/verify/KN-003.mjs:50` — `env: { ...process.env, CI: '1', ... }`.
The parent environment is inherited whole, so the ordinary `npm test` at line 94
inherits whatever the shell or CI job already had. Line 156 sets it to `'1'` for
the run that WANTS gate mode, which is correct and stays.

## Steps

1. **`vitest.config.ts`: compare against the exact string.**
   `process.env.KARNAMA_GATE_FIXTURES === '1'`. Not truthiness, not `!== '0'`:
   an explicit opt-in is the only reading under which a stray value is safe.
2. **`KN-003.mjs`: scrub the variable for runs meant to be ordinary.** Delete
   the key rather than setting it to `''`, because `''` is falsy today but only
   because of the comparison in step 1, and a scrub should not depend on how the
   reader is written.
3. **Look for other readers.** `grep` the repository for the variable. If
   Storybook, Playwright or a CI workflow reads it, step 1 fixes only one of
   them and the plan is wrong about its size.
4. **`agent/scripts/verify/KN-100.mjs`**, proving both clauses by PLANTING the
   environment: run the suite with the variable at `0`, at `true`, at `yes`, and
   assert the fixture did not run; run KN-003's ordinary path with it set in the
   parent and assert it passes.
5. **Mutation-test it**: put `Boolean(...)` back, put the inherited env back, and
   check each is caught with its own message.
6. Gate, commit, fire the task roast in the background, take the next card.

## What I expect to be hard, and what I am unsure about

- **Proving "no fixture ran" rather than "the suite passed".** A suite that
  passes proves nothing on its own: the fixture is designed to FAIL, so if it
  had run the suite would be red, which means passing is evidence. But it is
  weak evidence, because a suite could pass for other reasons. Better to assert
  the reported test COUNT is the ordinary one, or that no `.gate.ts` file is
  named in the output.
- **How slow this is.** Each planted environment is a full web suite, 222 tests.
  Three or four of those is minutes, and KN-148 has just been through this: run
  the narrowest thing that still proves the point.
- **Whether `0` is even the interesting case.** The card names `"0"`, but any
  inherited value is the real hazard — `false`, `no`, an empty-looking value
  from a CI template. The check should cover a set, not the one example.

## How I will know it worked

`node agent/scripts/verify/KN-100.mjs` passes, the planted mutations each fail
with their own message, and `npm test` with the variable set to a variety of
falsy-looking values runs the ordinary suite.

## What actually happened, added on recovery

The plan check rejected step 4's weakest part: proving the scrub with a parent
value other than `'1'` proves nothing, because the exact comparison already
disables gate mode for any other value. The parent has to hold `'1'`, the one
value only scrubbing can neutralise.

The task's own roast then rejected the collection-level proof entirely: listing
the resolved unit project is not running KN-003, and the exit condition names
the run. KN-100 now runs KN-003 under a planted parent, which costs 124 seconds
and settles it.
