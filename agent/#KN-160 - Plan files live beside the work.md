# Plan — KN-160, plan files live beside the work

This file is itself the first instance of the rule it describes: it sits in
`agent/`, which is the folder the work is about to be written to, and it is
named `#<id> - <title>.md`.

## The task, from the board

**What.** The owner's rule of 2026-09-10: the plan written before a task starts
goes in the folder the work is about to be written to, named
`#<task id> - <title>.md`, NOT in a separate directory. Today `RALPH.md` step 2b
and the loop skill both say `.claude/plan-<id>.md`.

**Why.** A plan nobody reads is ceremony. The whole value of writing one is that
the next person, including the next iteration of me, encounters it while looking
at the thing it describes. A separate plan folder guarantees they never do.

**Exit condition.** `agent/RALPH.md` step 2b and `~/.claude/skills/loop/SKILL.md`
both instruct the `#<id> - <title>.md` name in the folder the work will be
written to, no instruction anywhere still names `.claude/plan-<id>.md`, the
existing plan for KN-112 has been moved to its work folder under the new name,
and a check proves the loop files agree.

## The problem the rule has, which the rule does not mention

**A card title is not a filename.** Windows rejects `< > : " / \ | ? *` outright,
and this very card is titled `Plan files live beside the work, named #<id> -
<title>.md`, which contains four of them and would also end in a doubled `.md`.
So the rule needs a sanitisation clause or its first use fails.

The clause I intend to write:

- Strip the characters a filesystem refuses, rather than substituting them.
- Shortening a long title is fine. **The id is what must be exact**, because the
  id is what ties the file to the card; the title is there so a human scanning
  the directory knows what it is without opening it.
- Trailing dots and spaces go too, which Windows also silently mangles.

## Which folder is "the related folder"

The folder the work is **about to be written to**. Where a task spans several,
the one that holds the substance of the change:

- A component fix goes beside the component.
- A change to the loop's own rules goes in `agent/`, which is why this file is
  there even though it also edits a file under `~/.claude/`.
- Where it is genuinely ambiguous, the folder holding the file with the most
  substantial edit wins, and being wrong about it is cheap.

## Steps

1. **`agent/RALPH.md` step 2b**: replace the `.claude/plan-<id>.md` instruction
   with the new name and location, and add the sanitisation clause and the
   ambiguity rule above.
2. **`~/.claude/skills/loop/SKILL.md` step 3**: same change. It currently says
   "`.claude/plan-<task-id>.md` is a reasonable home", which is the sentence
   that has to go.
3. **Move the existing plans**, so the tree matches the rule rather than only
   the documentation describing it: `.claude/plan-KN-112.md` goes to
   `apps/web/src/core/preferences/`, and `.claude/plan-KN-100.md` is for a
   closed task and should be moved or deleted rather than left as the last
   inhabitant of a directory the rule abolishes.
4. **`agent/scripts/verify/KN-160.mjs`**: assert both loop files name the new
   shape, that neither still names the old one, and that the plan files on disk
   actually follow it. Reading a document is legitimate here because the
   deliverable IS the document, unlike KN-159 where the deliverable was a code
   path.
5. **Mutation-test it**: put the old instruction back in each file in turn, and
   in a third case leave a plan file at the old path, and require each to fail
   with its own message.

## Corrected by the plan check

- **A `.md` beside source is inert here**, confirmed against the configuration
  rather than assumed: `tsconfig` includes only `.ts` and `.tsx`, the coverage
  include is `src/**/*.{ts,tsx}`, and the Storybook glob takes `../src/**/*.mdx`
  and `*.stories.@(ts|tsx)`, so `.md` matches nothing. Vite bundles imports, not
  loose files. `#` needs quoting in a shell and escaping only in a `.gitignore`
  pattern, and these files are meant to be tracked rather than ignored.
- **The migration step was the weak one, and it was already wrong.** There are
  THREE plans, not two: `KN-071`, `KN-100` and `KN-112`. I knew about two.
  Every `.claude/plan-` reference gets classified before anything is edited,
  which also turns up `agent/STATE.md`.
- **Closed plans should not sit beside live code**, where the next reader takes
  a stale document for current intent.

## Decided here, and WRONG: that a plan is deleted when its task closes

I chose deletion over the check's suggested archive, reasoning that the archive
already existed because **git has every version of the file**. So `KN-071` and
`KN-100`, both closed, were deleted rather than moved.

**That reasoning was false and the deletion destroyed both files.**
`.gitignore` line 30 carried `.claude/plan-*.md`. The plans had never been
committed, so there was no version in git to fall back on. One `git check-ignore`
would have shown it and I never ran one. KN-100's plan is recoverable only
because it happened to have been read into this session's transcript; KN-071's
is gone permanently, and a marker stands where it was.

The corrected rule, which came from the owner via the loop skill: **the plan
STAYS when the task closes.** It is committed with the work and left in place,
which is the entire reason it lives in that folder. If a plan reads as stale
beside the code, the fix is to correct the plan, not to remove the record.

The transferable lesson is not about plans at all: **check that the fallback you
are relying on actually exists before you rely on it.** "Version control has it"
is a claim, and claims get checked.

## What I expect to be hard, and what I am unsure about

- **The verifier is a document check, and document checks in this repository
  have a specific failure mode**: the grep matches the prose explaining the
  banned thing. This plan file itself names `.claude/plan-<id>.md` several
  times, and if the check scans the whole repository for that string it will
  flag this very file and the card's own description. The check has to scan the
  INSTRUCTION files only, and it has to strip comment or quotation context, or
  it will report the defect it just fixed. That has already happened twice here,
  KN-128 and KN-072.
- **Whether `#` at the start of a filename causes trouble anywhere**: in a
  shell it is a comment character, so any command touching these paths needs
  quoting. Git handles it, but a `.gitignore` pattern or a glob might not.
- **Whether the rule should apply retroactively to closed tasks' plans.** I
  think moving KN-100's plan is pointless bookkeeping for work already closed,
  and deleting it loses a record. Leaving it is the third option and it
  contradicts the rule. I lean towards moving it beside the work it described.

## How I will know it worked

`node agent/scripts/verify/KN-160.mjs` passes, the planted mutations each fail
with their own message, no instruction file names the old path, and the plan
files on disk sit beside their work.
