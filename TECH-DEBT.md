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
agent types. The board then lets the task close when those numbers clear the bar.

**Why it is like that.** The recorded numbers are deliberately the *adjudicated*
ones, not Codex's. Adjudication is the point of step 5 of the loop: reviewers do
misread code, and a finding that is wrong has to be droppable. A script cannot
tell a correct dismissal from a convenient one.

**What is done about it.** The round is now bound to an actual harness run:

- The harness writes a `.meta.json` beside every reply holding the task id, the
  round, the model, the reviewed commit, a digest of the task card and a digest
  of the reply. `roast` requires it, and refuses a reply whose digest no longer
  matches, a reply belonging to another task, or one whose round does not follow.
- `*.prompt.md` is refused outright. Round 2 of KN-001 demonstrated the exploit:
  the harness writes the verdict TEMPLATE into its own prompt file, so before
  this, `--file <the prompt>` recorded a fabricated clear round with one flag.
- The reviewer's own numbers are parsed from the **last** verdict block and
  stored alongside the adjudicated ones, so the two are visible side by side.
  Recording kinder numbers requires `--dismissed`.

**What is still true, and the threat model this gate is actually for.**

The manifest is ordinary JSON in a repository the author can write to. An author
who wants to fake a clear round can write a reply, write a matching sidecar,
commit both, and close the task. Three roast rounds found three different
versions of that path, and a fourth would find a fifth, because the property
being asked for is unobtainable: **nothing running locally under the author's
own hand can prove the author was honest.**

So the gate is scoped deliberately. It defends against **carelessness and
drift**, which are the failures that actually happen in a loop:

- closing a task nobody reviewed, because it felt finished
- recording a round against the wrong file, or a stale one
- letting a clear round outlive the code it reviewed
- softening a verdict while reading it, and forgetting that you did
- typing a flag wrong and silently changing what the board picks next

It does **not** defend against deliberate fraud, and no claim anywhere in this
repository should say that it does. Earlier versions of this entry and of
`RALPH.md` implied it, which was the more dangerous error, because a guard
believed to be stronger than it is stops being checked.

**What would actually fix it.** A verdict the author cannot produce: a signed
reply from the model provider, a CI job that runs the roast on a machine the
author does not control, or a human sign-off on close.

**The check that retires this.** When `done` requires a verdict artifact
produced outside the author's own working copy.

## 2. Task exit conditions are not machine-checked yet

Codex was right that the earlier version of this entry overclaimed. It said
prose exit conditions "cannot" be machine-checked, which was too broad and was
hiding a tractable problem behind a debt note.

**What.** Every task carries an `exit` field naming the condition under which it
may be called done. A task may also carry an optional `verify` field holding a
command, and `move <id> done` now runs it and refuses to close on a non-zero
exit. **Most tasks do not have one yet.**

**Why it is not finished.** The exit conditions were written before `verify`
existed. Backfilling them is real work and it is on the board as its own task
rather than done half-heartedly here.

**What is done about it.** `verify` runs where it is set. `move done` also
refuses when the worktree is dirty, or when HEAD has moved since the round that
cleared the task, so a passing check cannot be recycled across a later change.
`--evidence` is required for the part no command covers.

**The check that retires this.** When every task on the board has a `verify`
command, and `validate` fails on a task that has none.

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

## 4. Codex cannot run `npm` inside its sandbox on Windows

**What.** The reviewer shells through PowerShell, where `npm.ps1` is blocked by
execution policy: "File C:\Program Files\nodejs\npm.ps1 cannot be loaded because
running scripts is disabled on this system." Every `npm run todo -- ...`
instruction it reads is therefore unrunnable for it.

**Why it matters.** A reviewer that cannot execute the tool it is reviewing
falls back to reading, and a roast that only reads finds a different, smaller
class of defect. It showed up as six failed commands in one round, and one of
them made the reviewer report a false problem.

**What is done about it.** The roast prompt now tells the reviewer to call
`node agent/scripts/todo.mjs <command>` directly, and says outright that the npm
failure is an environment limitation rather than a finding.

**The check that retires this.** When the reviewer can run the documented
commands as documented, either because the sandbox stops using PowerShell or
because the execution policy allows the npm shim.

## 5. The Figma original is unreadable, we work from a copy

**What.** `DESIGN.md` points at file `EITM6CbJY33dMY8IsMFR4R`, which is a copy.
The original, `K1EP8GCOmelU8o4vPR7a9f`, refuses every MCP call with "you don't
have edit access".

**The risk.** The copy can drift from the original. If the designer keeps working
in the original, we build against a snapshot without knowing it.

**The check that retires this.** When the account the Figma MCP authenticates as
has edit access to the original, and `DESIGN.md` points at it.
