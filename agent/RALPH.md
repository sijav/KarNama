# The KarNama loop

The rules for every iteration. Re-read this file at the start of each one, in
full. It overrides default habits.

A loop, not willpower, carries the work: the Stop hook feeds this prompt back
every time an iteration tries to end. Behave as though nothing will catch you.
Never end an iteration on a summary, a checkpoint, or a "want me to do X?"
question.

---

## Rule zero · The owner outranks this file, and DO NOT INVENT GATES

Everything below was written by an assistant. It is a convenience, not an
authority. **A direct instruction from the owner beats any of it**, and the more
recent instruction wins.

**Never invent a gate the owner did not ask for.** No score thresholds, no
required rounds, no check that refuses to let finished work close, no new rule
that makes the loop harder to satisfy than the owner made it.

This gets broken by accident, not on purpose, and it looks like diligence while
it happens. A roast finds something real; the fix that suggests itself is a
check that refuses the next occurrence; the check becomes a card; and the card's
exit condition is now a gate nobody asked for. In one session that produced a
gate refusing to record a roast without a filed list, a gate refusing a card
whose exit condition hedged, a gate refusing a plan file in the wrong folder,
and a gate for em dashes. Every one of them was a real observation turned into
a rule the owner never wanted.

The test, before writing an exit condition that refuses anything:

> Did the owner ask for this refusal, or am I adding it because I found
> something? If the second, the fix is to DO the work, or to write the rule
> down, and not to build something that says no.

Enforcing a rule the owner DID give is not inventing a gate. `done` is terminal
because the owner said a finding never reopens a closed task. Making a check
honest about what it already claims to read is not a new gate either.

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

## Step 2b · Write the plan, and have it checked BEFORE you build

**Before touching a file, write down exactly what you are about to do.**

**The plan goes BESIDE THE WORK**, in the folder the change is about to be
written to, named `#<task id> - <title>.md`. A component fix puts it next to the
component; a change to the loop's own rules puts it in `agent/`. Where a task
spans several folders, the one holding the substance of the change wins, and
being wrong about that is cheap.

Beside the work, because a plan nobody reads is ceremony. Its whole value is
that the next person, including the next iteration of you with no memory of
this, meets it while looking at the thing it describes. A separate plan
directory guarantees they never do, and fills up with plans for work that has
since moved.

Two practical rules that follow:

- **A card title is not a filename.** Strip what the filesystem refuses,
  `< > : " / \ | ? *`, and trailing dots and spaces, which Windows mangles
  silently. Shortening a long title is fine. **The id is what must be exact**,
  because the id is what ties the file to the card.
- **The plan STAYS when the task closes.** It is committed with the work and
  left in place. That is the whole reason it lives in that folder rather than
  off to the side: whoever opens the folder later finds what was intended
  there, beside what was built. If a plan reads as stale next to the code, the
  fix is to correct the plan, not to remove the record.

  This file said the opposite for one iteration, on the argument that "git holds
  every version so nothing is lost". That argument was **false**: the old plan
  directory was listed in `.gitignore`, so the plans it was reasoning about had
  never been committed at all. Two were deleted on its say-so and one of them,
  KN-071's, is gone for good. The lesson is not really about plans: **check that
  the fallback you are relying on actually exists before you rely on it.**

It should say:

- the task, its **why** and its **exit condition**, quoted from the board
- the approach, in steps
- what you will change, file by file
- what you expect to be hard, and what you are unsure about
- how you will know it worked

Then hand that plan to another model **with web search**, every time you write
or change it:

```bash
python ~/.claude/skills/roast/roast.py plan \
  --title "KN-0XX <title>" \
  --why "<why, from the board>" \
  --exit-condition "<exit condition, from the board>" \
  --did "$(cat 'apps/web/src/whatever/#KN-0XX - the title.md')" \
  --ask "the step I am least sure of is X — does it hold?" \
  --ask "is there a simpler approach that meets the same exit condition?"
```

Judge the answer, fix the plan, and only then build. This is the cheapest review
in the loop by a wide margin: a wrong plan costs a paragraph to fix now and a
rewrite to fix later. The web search is not decoration either — a good share of
what makes a plan wrong is a fact about the outside world that moved, and this
repository has already lost time to exactly that, from `prisma migrate diff`
losing a flag to `get_metadata` behaving differently on a canvas than on a frame.

A plan that survives checking is the normal outcome. "This is sound" is a
complete answer; the value was in checking while changing it was still free.

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

**When the work is a verifier, write it clause by clause against the exit
condition.** Every guarantee the card DECLARES gets two things: a fixture that
passes because the guarantee holds, and a mutation that breaks that guarantee
and makes that fixture fail. A verifier assembled from examples that seemed
worth testing will be green and prove less than it looks like: KN-190 shipped 13
passing checks and none of them tested its own central clause, "the close is the
head token of its line", which the code did not do. Reading the exit condition
as a list of clauses is what catches that, and it costs one pass.

This is a way of writing tests, not a rule that refuses anything. Nothing here
stops you closing a card.

Then run the gate in `AGENTS.md` section 5, including actually opening the
thing in a browser and looking at it in both languages.

**How much of the gate you run depends on whether the task has a parent**, the
owner's rule of 2026-09-10: a task with **no parent** closes on the **full
suite**; a **child** closes on the **tests for the files it changed**, plus lint
and the type checker where it touched. A child is one slice of a parent, and the
whole gate runs again when the parent closes. It is a rule about cost, not
rigour: the same checks run, once, where they mean something. If you cannot tell
which tests cover what you changed, run more rather than guess.


**Then commit.** A roast has to be *of* something, and the harness refuses to
run against a dirty worktree, so the review is bound to a revision instead of to
a smudge that keeps changing underneath it.

## Step 4 · Close it. The work is finished, so say so

**The task is done when the work is done and its verifier proves it. Not when a
reviewer approves of it.** This is the owner's rule of 2026-09-10 and it
reversed the previous order, which was review, then roast, then close on the
round.

```bash
npm run todo -- move KN-014 done --evidence "how the exit condition was actually checked"
```

The board asks for four things, and a roast is not among them:

1. The task's own **`verify` command passes**, run at close time, not quoted
   from memory.
2. **`--evidence`**, because the exit condition is prose and no script covers
   all of it. Writing down how it was checked puts the claim on the record where
   the roast can dispute it. Say what it does NOT establish, too.
3. A **clean worktree**, so the thing being closed is the thing that was
   committed.
4. The task was actually **taken** first. Closing a `backlog` card means the
   work happened off the board.

**Finish it properly before you close it.** Tests written, gate run, actually
works. "Close it and let the roast catch the rest" is how a card closes on
something broken, and the roast is not a test suite.

Why the order changed: the reviewer used to be a gatekeeper of CLOSING, so a
finished, verified, committed task sat open for minutes waiting on an opinion,
and when the opinion arrived the pull was to reopen and fix it. That is how one
three point card absorbed ten rounds while fifty six others waited. The reviewer
is a source of the NEXT tasks, not a judge of this one.

## Step 5 · Hand it to Codex for a roast, IN THE BACKGROUND, and take the next task

**You do not score your own work.** You know what you meant, so you read the
code as the thing you intended rather than as the thing you wrote. A different
model, with a clean context, does not have that problem.

**Fire it in the background and take the next task immediately.** Waiting on a
reviewer is dead time, and dead time is the largest single cost in this loop:
one roast is minutes, and this session spent most of an hour watching them. The
task is already closed. The review is about what to do NEXT, not about whether
this one is finished.

```bash
# KN-014 is already `done`. This runs against the closed, committed work.
npm run roast -- KN-014 \
  --summary "what I actually did, honestly, including what I am unsure about" \
  --ask "a real question about this task's mechanism" \
  --ask "a second one, aimed at where you think it is weakest" &
```

**While a roast is reading the worktree, do not edit the files it is reading.**
Changing them underneath produces findings about code that no longer exists, and
you cannot tell those from the real ones. This has already happened once here: a
roast reported a critical that was a mutation test running concurrently. Taking
the next task is usually fine because it touches different files; when it does
not, read rather than write until the roast lands.

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

## Step 6 · The roast lands: judge it, file EVERYTHING, then forget it or revert

**Codex's output is evidence, not a verdict.** Its score is its own opinion. Take
each finding and judge it yourself, against the code:

- **Real.** Reproduce it. Name the input or state that triggers it.
- **Wrong.** The reviewer misread something. Say what it misread. A finding
  dropped without a reason is a finding you did not check.

Then, and there is no longer any exception to this:

> **Every finding that survives adjudication becomes its OWN board entry, with
> all ten fields filled, at its own severity. The roasted task is already
> `done` and it STAYS done. Nothing here reopens it.**

### A finding is a CHILD of the task it came out of

The owner's rule of 2026-09-10. A finding is not a loose card: it is filed
against the task that was roasted, as its child.

- **One level.** A child never gets children of its own. Anything found while
  doing a child belongs to the same parent.
- **When the LAST open child of a parent closes**, roast the parent **together
  with all of its children**: a review of what was done for the whole task, not
  for the last piece. The question that round asks is whether the parent is
  actually finished now.
- Anything THAT round finds becomes a new child of the same parent, and it
  repeats until a round finds nothing.

That is what makes "done" mean something. Without it, a task is finished when
somebody says so; with it, a task is finished when everything its review turned
up has also been dealt with, and the board can tell you which.

**The board tool here does not support this yet.** `agent/board.json` has a
`parent` field and it means BLOCKED BY, which is a different relation: a
blocker must finish before the task can start, while a finding comes out of a
task that is already closed. Filing a finding as a blocker would deadlock it.
Until the tool carries both, record the parent in the finding's description and
say so. The global `todo` skill already has `--parent-task`.

**There is no fix-in-task rule any more, because there is no open task to fix
in.** The roasted card closed at step 4, before the reviewer ever saw it. This
deleted a rule that had been rewritten three times and argued with every time:
"fix when the verifier fails", then "fix when the verifier fails or passes
dishonestly", each version a little more elaborate and each one still requiring
a judgement call in the exact moment when the temptation to polish is strongest.
Closing first makes the question disappear rather than answering it.

So when the roast says the verifier proves less than it claims: that is a card,
and it is often a good one. File it with the same care as any other, naming what
the verifier fails to establish, and let the board schedule it.

**Then, having filed them, decide ONE thing:**

> Does any card you just filed **block the task now in your hands**? Not the
> task that was roasted, the one you are building RIGHT NOW.
>
> - **No.** Then FORGET IT and carry on. Do not read them again, do not
>   reprioritise, do not "just quickly" do the small one. They are scheduled.
> - **Yes.** Then stop, revert, and take the blocker. Below.

"No" is the common answer and forgetting is the correct behaviour, not
negligence: the card is scheduled work, and finishing what is in your hands is
worth more than reacting to it.

### The one exception: a finding that blocks what you are doing now

The blocked thing is **the task now in your hands**, never the roasted one. The
roasted card is closed and no finding reopens it. What can go wrong is that you
are building something that rests on what the roast just showed is wrong, and
every further minute on it is thrown away.

If a card you just filed blocks the task in progress, stop rather than build
further on it:

1. **Cancel the current task.** `move <id> backlog` with a note saying why.
2. **Revert what you did for it.** Do not leave half a change in the tree that
   was built on a wrong assumption. Save the diff somewhere scratch if it was
   expensive, then take it out of the tree.
3. **Take the next card from the board**, `npm run todo -- next`, which will
   usually be the blocker you just filed, because you filed it at the severity
   its content deserves. Do not hand-pick it. If the law does not select it, the
   severity you gave it was wrong, and that is worth noticing.
4. **Replan the cancelled task** when you come back to it, from step 2b, against
   the new reality. The old plan was written before you knew this.

Reverting feels wasteful and is not. Work resting on something known to be wrong
is thrown away later anyway, at a worse moment, with more stacked on top of it.

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

## Step 7 · Record, commit, continue

- Write anything newly learned into `AGENTS.md`, `DESIGN.md` or `TECH-DEBT.md`
  now, while you still know it. Next iteration you will not.
- Anything suppressed, pinned, widened or routed around goes in `TECH-DEBT.md`
  with the check that says when it can be removed. A deliberate scope cut goes
  in `PHASE-NEXT.md` instead. Those are decisions, not debt.
- Commit, with a message that says what changed and why. The roast reviews a
  commit, so the order is: **finish, prove, commit, close, roast.**
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
mv .claude/ralph-loop.local.md .claude/ralph-loop.paused   # pause, state kept
mv .claude/ralph-loop.paused .claude/ralph-loop.local.md   # resume
rm .claude/ralph-loop.local.md                             # stop
```

The installed Stop hook, ralph-wiggum 1.0.0, reads only whether
`.claude/ralph-loop.local.md` exists: an empty `ralph-loop.paused` beside it
pauses nothing, as 2026-09-10 found. So a pause moves the state file aside, and
a resume moves it back. Both names are gitignored.
