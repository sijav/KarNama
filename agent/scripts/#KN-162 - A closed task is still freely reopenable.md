# Plan — KN-162, done does not currently mean done

## The task, from the board

**What.** Found by the KN-159 roast. `move` has no transition guard on the
CURRENT status. Its only `in_progress` guard asks whether some OTHER task is
active, so `move <id> in_progress` succeeds on a task that is already `done`
whenever nothing else is in progress. That permits exactly the sequence KN-159
exists to forbid: close, roast, reopen, fix what the roast found, close again.

**Why.** The rule that findings never reopen a closed task is the load-bearing
half of the new order, and it is currently documentation rather than behaviour.
A rule enforced only by intention breaks at the exact moment it matters, which
is when a reviewer has just found something and the pull to polish is strongest.

**Exit condition.** `move <id> in_progress`, `backlog`, `review` or `blocked`
all REFUSE when the task is done, naming the new-card route; the refusal is
proved by driving the real CLI in an isolated repository rather than by reading
the source; and a mutation removing the guard fails the check with its own
message.

## Confirmed, not assumed

- The reopen works today. This session did it: KN-100 went `done` back to
  `in_progress` before the rule changed, and nothing objected.
- Nothing else in the repository moves a task out of `done`. `roast.mjs` only
  mentions `move done` in comments; `lib/verify.mjs` likewise. So a terminal
  `done` breaks no existing caller.
- `set --status` is already refused, and `add` only accepts `backlog` or
  `in_progress`, so `move` is the single door this guard has to cover.

## The decision this needs, and my answer

**Is `done` terminal for EVERY status, or does `dropped` stay reachable?**

Terminal for every one. I cannot construct a case where moving a finished task
to `dropped` is the honest record: `dropped` means "we are not doing this", and
the work was done. Allowing it would mostly serve as a two-step route back out
of `done`, which is the thing being closed off.

That leaves the genuine mistake, closing the wrong id. The board already has a
repair route for exactly that, `rm <id> --reason "..."`, and the refusal message
should name it, because a rule with no legitimate escape gets worked around
rather than followed.

So the message names two routes and no others:

- remaining work → **a new card**, which is the whole point of closing first;
- a close that was an outright error → **`rm`**, which is deliberate, explains
  itself, and leaves a reason behind.

## Steps

1. In `move`, before any status-specific handling, refuse when
   `task.status === 'done'` and the requested status differs. Re-closing an
   already-done task with the same status is a no-op rather than an error,
   because refusing it would only punish a retry.
2. Word the refusal so it teaches the rule rather than just blocking: say the
   task is closed, that a finding becomes a new card, and name `rm` for a
   genuine mis-close.
3. `agent/scripts/verify/KN-162.mjs`, reusing KN-159's sandbox shape: build a
   throwaway git repository, copy the real scripts, drive the real CLI. Assert
   all four transitions out of `done` are refused, that the message names the
   card route, and that `dropped` is refused too.
4. Prove the guard does not break closing: a task must still go
   `in_progress → done` in the same sandbox, or the guard could be refusing
   everything and every check above would still pass.
5. Mutation-test: remove the guard, and narrow it to only `in_progress`, and
   require each to fail with its own message.

## What I expect to be hard, and what I am unsure about

- **Ordering inside `move`.** The guard has to come before the `in_progress`
  "only one at a time" check, or reopening a done task while nothing else is
  active will report the wrong reason. The message a user sees is the thing they
  act on, so a correct refusal for the wrong reason is still a defect.
- **Whether the sandbox needs its own copy of KN-159's helper.** Two verifiers
  now build the same throwaway repository. Duplicating it is cheaper today and
  wrong by the third one; a shared `lib/sandbox.mjs` is probably right, but
  extracting it is scope this card did not ask for. I lean towards duplicating
  now and filing the extraction, and I want that judgement checked.
- **Whether this makes an honest mistake unrecoverable.** `rm` deletes rather
  than reopens, so a task closed in error loses its history rather than
  returning to the queue. That is a real cost and I am accepting it, because the
  alternative is an escape hatch that the exact pressure this card exists to
  resist would push everyone through.

## How I will know it worked

`node agent/scripts/verify/KN-162.mjs` passes, the planted mutations each fail
with their own message, closing still works, and the existing board verifiers
KN-058, KN-065 and KN-159 all still pass.
