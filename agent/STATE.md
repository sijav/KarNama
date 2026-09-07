# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale.

**This file does not restate anything the board already knows.** It went stale
twice by carrying round counts and task statuses that had moved on, at exactly
the point a context reset trusts it. Numbers that live in `board.json` are read
from there:

```bash
npm run todo -- next            # what to work on
npm run todo -- show KN-001     # a card, its roast rounds and its notes
npm run todo -- list            # everything, with blockers marked
```

---

## The task spec

Build **KarNama** (کارنما), a job application tracker, and drive it with a Ralph
loop.

A job seeker adds a posting themselves, by link or by text, the product
structures it into a record, and the record carries a status through the search.
**The value is the trail, not the listing.**

**Scope is closed.** Scenarios 1 and 2, searching boards and showing aggregated
ads, were cut by the mentor's filter 4. **Crawling job sites is permanently
out**, and a second teammate does not bring it back. Two owner additions: third
parties can leave comments or suggested changes, stored for later evaluation
rather than applied, and there is an admin panel over what users submit.

Stack and standing decisions:

- Monorepo, npm workspaces: `apps/web`, `apps/api`, `packages/graphql`.
- React 19, TypeScript, MUI, Storybook, Playwright, Vitest, 100 percent
  coverage. **Components first with their stories, then screens.**
- GraphQL with NestJS. Render free tier, Supabase Postgres, cold start about 50
  seconds which the UI must handle honestly.
- GitHub Pages for the web app. Repo `sijav/KarNama`, public, **empty, and no
  git remote has been added yet**.
- lingui, **English is the source**, Persian is the translation.
- **Match the design exactly**, not approximately.
- **Auth is phone OTP**, mobile number then a five digit code, email as a
  fallback behind the same interface, **provider mocked for the MVP**.
- **The Documentation canvas beats the Components canvas**: a kanban board, not
  a list, and three nav destinations, not two.

## Where things stand

**Nothing of the product exists yet.** No app, no API, no components. What
exists is the machine that will build them, and a design contract that has been
verified against Figma rather than asserted.

- `agent/RALPH.md`, the loop. `agent/scripts/todo.mjs`, the board, zero
  dependencies. `agent/scripts/roast.mjs`, the Codex harness on
  `gpt-5.6-terra`. `agent/scripts/lib/{worktree,card}.mjs`, the single
  definitions of "unreviewed work" and "the reviewed card".
- `agent/scripts/verify/KN-001.mjs`, `KN-004.mjs` and `contract.mjs`, real
  checks, each tested against planted breaks rather than only against success.
  A `verify` command must be `node agent/scripts/verify/<name>.mjs`, and both
  that directory and the target are resolved with `realpathSync` and required to
  sit inside the real repository root.
- `AGENTS.md`, `DESIGN.md`, `TECH-DEBT.md`, `CLAUDE.md`, root workspace config.
- `.claude/ralph-loop.local.md`, the loop armed, promise `KARNAMA-DONE`.

`DESIGN.md` carries the verified token set, the corrected five-role type scale,
the kanban structure, three destinations, phone OTP, the terminology rule, the
inline-editing rules, and a section of open questions the design has NOT
settled. `agent/scripts/verify/KN-004.mjs` asserts the token tables against
Figma and fails when any value is corrupted.

## The loop's law was corrected, and this is the correction

The owner caught a real mistake. The rule is: **finish a task, roast it, roast
the roast, FILE what survives as new to-dos, and move on to the next to-do.**
What was built instead was roast, fix, re-roast until a score cleared a bar, and
that is why one three point task absorbed eleven rounds while sixty others
waited, each round finding smaller things than the last.

So `move done` no longer looks at a score. It requires a manifest-bound round, a
record of **what was filed** from adjudicating it, `--evidence`, a passing
`verify`, and no unreviewed work. **A task with surviving findings closes**,
because its findings are on the board where they get scheduled against
everything else.

Fix a finding inside the task only when it is cheap, obviously right, and inside
that task's exit condition. Everything else is a card. Do not re-roast to grind
a score up.

## KN-001, closed after eleven rounds

Read its round history with `npm run todo -- show KN-001`. Every finding across
every round was accepted and none rejected. What they found, in summary: the
close gate was bypassable six different ways, the documented close path
deadlocked, a rename could hide work from the gate, the `review` state was
decorative, the "tokens transcribed" claim was false while the verifier passed,
and most recently the board's own cards contradicted the design contract.

The forgery line was **scoped, not chased**. `TECH-DEBT.md` entry 1 states that
the gate defends against carelessness and drift, not deliberate fraud, because
nothing running locally under the author's own hand can prove the author honest.

## Next step

`npm run todo -- next` picks it. Do not choose by hand.

KN-058 is in review with its roast running. When it lands: adjudicate, file the
survivors, record with `--filed`, close with `--evidence`, then take the next
card. The board currently hands back the gate repairs KN-001's final round
produced, KN-065 first, then KN-002 and the scaffold.

**The board was NOT complete.** The owner asked, and the honest answer was no.
Auditing it found five missing things, now filed: the kanban column as its own
component (KN-060), dragging a card between columns with a keyboard path
(KN-061), shared story fixtures (KN-062), an accessibility gate (KN-063), and
the third-party feedback submission surface (KN-064), which had an API and a
moderation queue but nothing anyone could submit through.

67 tasks, 317 points, every one reachable from the dependency graph. Read the
current numbers from the board rather than from this paragraph.

Then **KN-002**, which the owner named. Its card carries detailed notes from the
Documentation and Screens canvases; read them with `npm run todo -- show KN-002`.

Cards that contradicted the design have been rewritten, and the two tasks the
plan was missing, the standalone network screen and the posting extraction
service, are filed as KN-056 and KN-057.

**Do not take that reconciliation on trust.** It was claimed complete twice and
was wrong twice, both times because the cards someone remembered were edited
instead of every card being checked. That is now a command, not a memory:

```bash
npm run contract
```

One rule per settled design decision, each naming its `DESIGN.md` anchor, each
with an exception list so a card that records a prohibition is not mistaken for
one that instructs it. It carries a canary, so a clean result means the rules can
still fire, and it fails when `DESIGN.md` stops saying what a rule assumes.

KN-002's remaining work is the full 53-screen inventory and the Job Record field
list, and it ends by running that check rather than asserting the result.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`. In that
order, every iteration, before touching anything.
