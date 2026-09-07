# Tech debt

Nothing gets silenced, pinned, widened or routed around without an entry here:
what it is, what causes it, what would fix it, and **the check that tells you it
can be removed**.

A suppressed warning with no record is a decision nobody can revisit, because
the reason is the first thing lost. "Nothing to do about it right now" is the
reason to write it down, not the reason to skip it.

Deliberate scope cuts are decisions rather than debt, and go in
[PHASE-NEXT.md](./PHASE-NEXT.md).

---

## 1. A recorded roast score is still the agent's own claim

**What.** `npm run todo -- roast <id> --score N --criticals N` writes numbers the
agent types. The board then lets the task close when those numbers clear the
bar. Nothing proves the agent judged honestly.

**Why it is like that.** The recorded numbers are deliberately the *adjudicated*
ones, not Codex's. Adjudication is the point of step 5 of the loop: reviewers do
misread code, and a finding that is wrong has to be droppable. A script cannot
tell a correct dismissal from a convenient one.

**What is already done about it.** Three guards, all in `todo.mjs`:

- `--file` is required, the file must exist, and it must contain a `VERDICT`
  block, so a round cannot be recorded for a Codex run that never happened.
- If the recorded criticals are **fewer**, or the score **higher**, than the
  archive itself reports, `--dismissed` is required, so softening the verdict
  means writing down which findings were rejected and why.
- `move <id> done` re-checks the archive, so a round cannot be recorded against
  a real file that is later deleted.

**What would actually fix it.** Having something other than the author record
the number: a second Codex pass that reads the adjudication and rules on whether
the dismissals hold, or a human sign-off on close.

**The check that retires this.** When a task can only reach `done` with a
verdict written by a process the author does not control.

## 2. Exit conditions are prose, so no script checks them

**What.** Every task carries an `exit` field naming the condition under which it
may be called done. `todo.mjs` checks that the field is present and longer than
25 characters. It does not, and cannot, check that the condition was met.

**Why it is like that.** The conditions are things like "a deliberately broken
test fails the run when planted by hand" and "the sidebar renders on the right
in Persian". Those are exactly the checks worth having and exactly the ones that
are not expressible as an assertion in a board tool.

**What is already done about it.** `move <id> done` requires `--evidence`, a
written statement of how the condition was checked, stored on the task. That
does not verify anything, but it puts the claim on the record where a later
reader, or the next roast, can dispute it.

**The check that retires this.** When each task's exit condition is a named test
id that CI runs, and `move done` verifies that test passed in the current commit.

## 3. `npm run roast` shells out through cmd.exe on Windows

**What.** `agent/scripts/roast.mjs` spawns `codex` with `shell: true` on win32
and quotes the arguments itself.

**Why.** `codex` on Windows is a `.cmd` shim, and Node refuses to spawn one
without a shell. Without this the harness failed with `spawnSync codex ENOENT`
before ever reaching the model, and because the call was piped through `tail`
the pipeline still exited 0, so it looked like a completed run that produced no
reply.

**The risk.** Shell quoting is done by hand, so a repository path containing a
quote or a shell metacharacter could still break the invocation.

**The check that retires this.** When Node can spawn a `.cmd` directly, or when
the harness resolves and invokes the underlying `node` entry point rather than
the shim.

## 4. The Figma original is unreadable, we work from a copy

**What.** `DESIGN.md` points at file `EITM6CbJY33dMY8IsMFR4R`, which is a copy.
The original, `K1EP8GCOmelU8o4vPR7a9f`, refuses every MCP call with "you don't
have edit access".

**The risk.** The copy can drift from the original. If the designer keeps working
in the original, we build against a snapshot without knowing it.

**The check that retires this.** When the account the Figma MCP authenticates as
has edit access to the original, and `DESIGN.md` points at it.
