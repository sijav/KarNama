# The KarNama loop

The rules for every iteration. Re-read this file at the start of each one, in
full. It overrides default habits.

A loop, not willpower, carries the work: the Stop hook feeds this prompt back
every time an iteration tries to end. Behave as though nothing will catch you.
Never end an iteration on a summary, a checkpoint, or a "want me to do X?"
question.

---

## Step 0 · Compact, then re-inject the context

**This is a compaction you perform, not one you request.** You cannot run
`/compact`; that lever belongs to the owner. What you can do is make the context
reset harmless, by making sure nothing you need lives only in the conversation.

At the start of every iteration, in this order:

1. Read `agent/STATE.md`. It is the compressed head, and the only memory of
   earlier iterations you may rely on. When it disagrees with the repository,
   the repository is right and `STATE.md` is stale. Fix it.
2. **Re-inject the context. Read these four files, every iteration, no
   exceptions, before touching anything:**

   | File                  | What it carries                                          |
   | --------------------- | -------------------------------------------------------- |
   | `AGENTS.md`           | the working agreement, rules, conventions, the done gate |
   | `DESIGN.md`           | the design contract, tokens, node ids, component list    |
   | `agent/RALPH.md`      | this file, the loop                                      |
   | `agent/TODO_BOARD.md` | the rendered board                                       |

3. Treat everything else from earlier iterations as gone. If a fact mattered and
   it is not in one of those four files, in `TECH-DEBT.md`, or in the code, then
   it was never recorded. Record it now, before you lose it.

At the **end** of every iteration, rewrite `agent/STATE.md`. It holds, in this
order: the task spec, what happened, where things stand, the next step (or the
current one if unfinished), and what to read first. Keep it under about 120
lines. A context reset that loses work is a failure of this step, not of the
harness.

## Step 1 · Roast the previous iteration, before anything new

Ask this of the last summary in `agent/STATE.md`, out loud, every time:

> **Is this implementation really done? Is something left over?**

Then check against reality, not against the summary. Run the thing. Read the
code. Read `git status` and `git diff`. Run the tests and read the output rather
than the exit code you expected.

Did the last summary say done, finished, complete, verified, green, passing,
committed or fixed when that was not actually true? Was a caveat buried at the
bottom where it reads as a footnote instead of as a blocker? Repair it before
any new work starts.

If it is not done, finish it. Do not pick up anything new. **An unfinished task
that has been declared finished is the most expensive failure in this loop**,
because everything built on top of it inherits the lie.

## Step 2 · Pick the work

```bash
npm run todo -- next
```

The script picks, not you, and it applies the law:

> Work already **in progress** outranks work **awaiting its roast**, which
> outranks anything **new**. Only then does **severity** decide, then the
> **smaller story point**, then the **older id**. A task whose blockers are not
> all settled is not a candidate at all, whatever its severity.

**Exactly one task may be in progress**, and the tool enforces it. That is what
makes "finish before starting" safe: with two open at once, a merely high task
left in progress outranks an unblocked critical one indefinitely.

If you disagree with the pick, the fix is to correct the severity, the points or
the parents on the board and run it again. Never to override it in your head.

Move it before you touch a file:

```bash
npm run todo -- move KN-014 in_progress
```

If something genuinely stops the task, park it with a stated cause, because a
blocked task is invisible to the selection law and a block with no reason is a
task that silently leaves the board:

```bash
npm run todo -- move KN-014 blocked --reason "waiting on the owner's call about phone OTP versus magic link"
```

**The to-do is written before the work, always.** The moment the owner asks for
something it becomes a board entry, before you begin it. The moment you discover
work it becomes a board entry, before you do it. This holds for everything, not
only code.

Every task carries all ten fields, filled at creation: `id`, `title`, `desc`,
`why` (the story: who needs this, what breaks without it), `severity`, `points`,
`area`, `parent` (blocking ids, `[]` when nothing blocks it), `status`, and
`exit` (the condition under which it may be called done, which must be
checkable, normally a named test or scenario). `npm run todo -- add` refuses an
incomplete task, which is the point.

Before filing anything, **search the board for it first**. A match is not a new
task; it is evidence the existing one matters more than its severity says.

**A card may not instruct anything `DESIGN.md` forbids.** This went wrong twice:
both times the board was "reconciled" by editing the cards someone remembered,
and both times several more still carried superseded instructions, which a
builder would have implemented faithfully. Run the check rather than trusting
the memory:

```bash
npm run contract
```

It also fails when `DESIGN.md` stops saying what its rules assume, so a reversed
decision cannot leave the old answer quietly enforced.

## Step 3 · Do the work

Linear. One unit at a time. No parallel fan-out, no workflows, no sub-agents.
Pause to fix a bug you notice, then continue.

Two ordering rules the owner set explicitly:

- **Components before screens.** Every component is built and storybooked on its
  own before any screen composes it. A screen assembled from components that
  were never reviewed in isolation is a screen nobody can review.
- **Match the design exactly.** Not approximately, not in spirit. Every size,
  state, variant and token comes from Figma, and where the code and the file
  disagree, Figma wins and `DESIGN.md` gets corrected in the same change. If the
  design is genuinely ambiguous, read the node again before guessing, and ask
  the owner if it is still ambiguous.

Then run the gate in `AGENTS.md` section 5. All of it, including actually
opening the thing in a browser and looking at it in both languages.

**Then commit, before the roast.** A roast has to be *of* something. The harness
refuses to run against a dirty worktree, and `move done` refuses to close a task
whose HEAD has moved since the round that cleared it, so the review is bound to
a revision instead of to a smudge that keeps changing underneath it.

## Step 4 · Hand it to Codex for a roast

**You do not score your own work.** You know what you meant, so you read the
code as the thing you intended rather than as the thing you wrote. A different
model, with a clean context, does not have that problem.

```bash
npm run todo -- move KN-014 review
npm run roast -- KN-014 \
  --summary "what I actually did, honestly, including what I am unsure about" \
  --ask "a real question about this task's mechanism" \
  --ask "a second one, aimed at where you think it is weakest"
```

The questions are what make this worth doing. Generic questions get generic
answers that find nothing. Ask about the specific mechanism, and aim at what you
are least sure of rather than at what you are proudest of. Good shapes:

- Does the status stripe still resolve a colour when the status is a custom one
  the user has since deleted?
- Does the Persian catalog fall back to the English id, or to an empty string,
  when a message is missing?
- The card has six states in Figma. Which of them does this component not
  actually reach, and can you get it into that state from the story?

The harness sends the task card, the exit condition, your summary and the diff,
gives Codex read access to the repository, and archives the reply under
`agent/roasts/`.

## Step 5 · Roast the roast, then file what survives and MOVE ON

**Codex's output is evidence, not a verdict.** Its score is its own opinion. Take
each finding and judge it yourself, against the code:

- **Real.** Reproduce it. Name the input or state that triggers it.
- **Wrong.** The reviewer misread something. Say what it misread. A finding
  dropped without a reason is a finding you did not check.

Then, and this is the part that was wrong for ten rounds:

> **Every finding that survives adjudication becomes its OWN board entry, with
> all ten fields filled, at its own severity. It does not hold this task open.**

Fix a finding here only when it is cheap, obviously right, and inside this
task's exit condition. Everything else is a card. The board then schedules it
against everything else waiting, which is the whole point of having a board.

**Filing is cheaper than fixing, and the gate makes that concrete.** Fixing a
finding changes the work after the review, so the round no longer describes what
exists and the close is refused until a new round runs. Filing costs nothing:
the task closes now and the card is scheduled. So the question to ask of each
finding is not "could I fix this quickly" but "is this inside the exit condition
of the task I am closing". If it is not, it is a card, and reaching for it
anyway buys a whole extra round.

When you do fix in-task, you owe exactly one more round, against the fixed code.
That is not grinding a score, it is the review describing what actually exists.

**Do not re-roast the same task until it scores well.** That was the original
mistake: a three point task absorbed ten rounds while fifty six others waited,
and each round found smaller things than the last. One roast, one adjudication,
file the survivors, next task. A second round is for when the first was
answering the wrong question, not for grinding a score upward.

Record the round, then adjudicate, then record what you filed:

```bash
npm run todo -- roast KN-014 --score 8 --criticals 1 --file agent/roasts/KN-014-round-1.<stamp>.md
# judge the findings, file the survivors as tasks, then:
npm run todo -- roast KN-014 --score 8 --criticals 1 --file <same archive> --filed KN-058,KN-059
```

Re-running against the same archive updates that round rather than inventing a
second one. `--filed none` is the honest record when nothing survived.

`--file` must exist and carry a `VERDICT` block, so a round cannot be recorded
for a run that never happened. If your numbers are **kinder** than the archive's
own, `--dismissed "..."` is required, naming what you rejected and why.
Softening a verdict is allowed; softening it silently is not.

**Relay the roast to the owner in your reply**, including what you filed. The
archive and the tool output are invisible to them.

## Step 6 · Close it

```bash
npm run todo -- move KN-014 done --evidence "how the exit condition was actually checked"
```

The board requires three things, and a score is not among them:

1. A **manifest-bound roast round** exists, from the harness, for this card, at
   this revision.
2. That round records **what was filed** from it, so the findings went somewhere
   the board will schedule rather than into a paragraph nobody reads.
3. **`--evidence`**, because the exit condition is prose and no script can check
   it. Writing down how it was checked puts the claim on the record where the
   next roast can dispute it.

Plus the task's own `verify` command must pass, the worktree must hold no
unreviewed work, and no work may have changed since the reviewed commit.

A task with surviving findings still closes. Its findings are on the board.

**Relay the roast to the owner in your reply.** The archive file and the tool
output are invisible to them. Say what was found, what you accepted, what you
rejected and why, and the score. A roast that is not relayed did not happen as
far as the owner is concerned.

## Step 7 · Record, commit, continue

- Write anything newly learned into `AGENTS.md`, `DESIGN.md` or `TECH-DEBT.md`
  now, while you still know it. Next iteration you will not.
- Anything suppressed, pinned, widened or routed around goes in `TECH-DEBT.md`
  with the check that says when it can be removed. A deliberate scope cut goes
  in `PHASE-NEXT.md` instead. Those are decisions, not debt.
- Commit, with a message that says what changed and why. The roast reviews a
  commit, so the order is: finish, commit, roast.
- Rewrite `agent/STATE.md`.
- **Go straight to `npm run todo -- next`.** Do not stop to summarise, do not
  re-open the task you just closed, and do not start polishing it because the
  roast mentioned something. That something is a card now.

---

## Asking the owner

Use the question tool when, and only when, a decision is genuinely the owner's:
it changes what gets built, and no amount of reading the repository settles it.
The tool stops the loop and gets a real answer, which is the whole reason it
exists.

Do not use it for something you can determine yourself. Do not use it to ask
permission to continue. Do not end an iteration on a question that is really a
request for reassurance.

**The owner does not read everything written here.** A question through the tool
is the channel that reaches them. A paragraph in a summary is not.

## Completion

Output `<promise>KARNAMA-DONE</promise>` only when every board task is `done` or
`dropped`, every closed task carries a manifest-bound roast round whose findings
were filed, and the product is live-verified in a browser in both languages.

The board emptying is the condition, not a score. Findings become cards, cards
get worked, and the loop ends when there are none left.

Never output it falsely to escape the loop, however long the loop is taking. If
the loop should stop, the promise becomes true by finishing the work.

## Control

```bash
touch .claude/ralph-loop.paused          # pause, state kept, delete to resume
rm .claude/ralph-loop.local.md           # stop
```
