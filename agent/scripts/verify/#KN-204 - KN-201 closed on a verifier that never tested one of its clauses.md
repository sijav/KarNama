# Plan — KN-204, the verifier did not test its own clause

## Three things, all small, all confirmed before filing

1. **The missing case.** `KN-201.mjs` plants three story-export forms and two
   non-story forms, and **nothing** that plants a meta whose `component` is not
   a plain identifier. The card's exit condition names it and the evidence
   claims it was caught. It WAS caught — by the scratchpad harness — but the
   committed artifact does not show it, so the claim is not reproducible from
   the repository. That is the KN-190 failure in a milder form.
2. **The escape hatch.** `guard.test.ts:95` uses `(error as Error)`.
   `AGENTS.md` forbids TypeScript escape hatches without asking, and a grep
   shows this is the **only** such cast in `apps/web/src` or `apps/api/src`.
3. **Interrupt safety.** `KN-201.mjs` appends to a TRACKED story file and
   restores it in a `finally`, which covers normal unwinding and not a kill.
   This runs on every close of the card.

## The fix for (3) is what makes (1) easy

Instead of appending to `LanguageSwitch.stories.tsx`, each case writes its own
**standalone, untracked** story file with its own meta, and removes it. That is
already how `KN-007.mjs` plants its case.

Two things get better at once. A kill mid-run now leaves an **untracked** file,
which `git status` shows and the next guard run flags loudly, instead of
silently corrupting a tracked file — the failure mode changes from invisible to
obvious. And a standalone file can carry any meta I like, so
`component: () => null` and `component: memo(Thing)` become ordinary cases
rather than surgery on a real file.

The residual risk is honest and stated: a leaked untracked `*.stories.tsx`
breaks the next guard run until it is deleted. That is loud, which is the point.

## What must not break

The five real cases already in `KN-201.mjs` must keep behaving: function
declaration, export list and renaming export list DEMANDED; exported class and
`__namedExportsOrder` NOT demanded. Moving them from "append to a real file" to
"write a standalone file" must not change any of those answers, and if it does,
that is a finding rather than something to adjust the expectation for.

## What I am unsure of

**Whether a standalone planted file changes what the export-list cases prove.**
Appending to a file with an existing meta and five stories is a different shape
from a fresh file with one meta and one story. I think the export FORM is what
is under test and the surrounding file is incidental, but if a case stops
failing after the move, the honest conclusion is that it was passing for a
reason I had not identified, and I will say so rather than restore the old shape
to keep the green.

## How I will know it worked

`node agent/scripts/verify/KN-201.mjs` passes with the two new
non-identifier-component cases added, and each of them fails if the guard's
`componentUnreadable` handling is reverted to the old skip. `git status` is
identical before and after a run. `npx eslint` is clean and no `as Error` cast
remains anywhere in `apps/web/src` or `apps/api/src`, checked by grep rather
than assumed.

---

## What the plan check corrected

**My stated residual risk was FALSE, and that is the more interesting one.** I
wrote that an interrupted run leaves an untracked file which "breaks the next
guard run until it is deleted", and called that loud, which is the point. It is
only true for the cases whose planted export is deliberately UNDOCUMENTED. For
the class, `__namedExportsOrder` and no-component cases, the fixture is a valid
documented story, so an interrupt after all three writes leaves something the
next guard run happily passes, and only `git status` shows it.

So the honest claim is narrower: interruption is made harmless for the TRACKED
file, not harmless in general. That is now what the verifier's header says. I
had written a comfortable version of the risk and would not have caught it,
because the case I pictured was the one where it holds.

**"FAIL naming the file" was not met.** The guard reported the story TITLE,
`Planted/Case`, and the exit condition says the file. A title identifies the
file only if you already know the mapping; a path is what somebody opens. The
guard now names both, and the verifier asserts the path appears rather than
only the phrase.

## The uncertainty I named, resolved

Moving the export-list cases from "append to a real story file" into standalone
fixtures did NOT change any of their answers. All three still fail as demanded.
So the export FORM was what they were testing, and the surrounding file was
incidental, which is what I hoped but had not shown.

## Mutations, as run

**Caught:** reverting the unreadable-component handling to the old `continue`
skip — this is the clause KN-201 claimed and never tested, and it is now proved.
**Caught:** emptying the story list so it no longer comes from `indexInputs`,
which fails 9 of the 11 checks. My predicted message for that one was wrong and
the harness said so; the mutation is caught, my expectation was not.
