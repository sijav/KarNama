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
- `agent/scripts/verify/KN-001.mjs` and `KN-004.mjs`, real checks, each tested
  against planted breaks rather than only against success.
- `AGENTS.md`, `DESIGN.md`, `TECH-DEBT.md`, `CLAUDE.md`, root workspace config.
- `.claude/ralph-loop.local.md`, the loop armed, promise `KARNAMA-DONE`.

`DESIGN.md` carries the verified token set, the corrected five-role type scale,
the kanban structure, three destinations, phone OTP, the terminology rule, the
inline-editing rules, and a section of open questions the design has NOT
settled. `agent/scripts/verify/KN-004.mjs` asserts the token tables against
Figma and fails when any value is corrupted.

## KN-001, still in review

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

Run the next roast round for KN-001 against the current HEAD. The harness picks
its own round number from the board, so do not assume one.

When a round comes back clean at 9.5 or above with zero criticals: record it,
then `npm run todo -- move KN-001 done --evidence "..."`.

Then **KN-002**, which the owner named. Its card carries detailed notes from the
Documentation and Screens canvases, read them with `npm run todo -- show
KN-002`. The stale cards KN-027, KN-036, KN-042, KN-043, KN-038 and KN-046 have
already been rewritten against the design, and the two missing tasks it would
have found, the standalone network screen and the posting extraction service,
are already filed. KN-002's remaining work is the full 53-screen inventory and
the Job Record field list.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`. In that
order, every iteration, before touching anything.
