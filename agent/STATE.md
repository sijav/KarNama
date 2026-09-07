# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale.

---

## The task spec

Build **KarNama** (کارنما), a job application tracker, and drive it with a Ralph
loop.

A job seeker adds a posting themselves, by link or by text, the product
structures it into a record, and the record carries a status through the search.
The value is the trail, not the listing.

**Scope is closed.** Scenarios 1 and 2, searching boards and showing aggregated
ads, were cut by the mentor's filter 4. **Crawling job sites is permanently
out.** Two owner additions: third parties can leave comments or suggested
changes, stored for later evaluation rather than applied, and there is an admin
panel over what users submit.

Stack and owner decisions:

- Monorepo, npm workspaces: `apps/web`, `apps/api`, `packages/graphql`.
- React 19, TypeScript, MUI, Storybook, Playwright, Vitest, 100 percent
  coverage. **Components first with their stories, then screens.**
- GraphQL with a NestJS server. Render free tier, Supabase Postgres, cold start
  about 50 seconds which the UI must handle honestly.
- GitHub Pages for the web app. Repo `sijav/KarNama`, public, **still empty, no
  remote has been added yet**.
- lingui, **English is the source**, Persian is the translation. A language
  button goes in existing chrome without disturbing the design.
- **Match the design exactly**, not approximately.
- **Auth is phone OTP** (mobile number, then a five digit code), email as a
  fallback behind the same interface, **provider mocked for the MVP**.
- **The Documentation canvas beats the Components canvas**: kanban board, not a
  list, and three nav destinations, not two.

## Where things stand

**Nothing of the product exists yet.** No app, no API, no components. What
exists is the machine that will build them, and its design contract.

- `agent/RALPH.md`, the six-step loop.
- `agent/scripts/todo.mjs`, the board, zero dependencies.
- `agent/scripts/roast.mjs`, the Codex harness on `gpt-5.6-terra`.
- `agent/scripts/lib/worktree.mjs`, the one definition of "unreviewed work".
- `agent/scripts/lib/card.mjs`, the one definition of the card digest.
- `agent/scripts/verify/KN-001.mjs`, eight real checks, tested against planted
  breaks.
- `agent/board.json`, **55 tasks**, valid, rendered to `agent/TODO_BOARD.md`.
- `AGENTS.md`, `DESIGN.md`, `TECH-DEBT.md`, `CLAUDE.md`, root workspace config.
- `.claude/ralph-loop.local.md`, the loop armed, promise `KARNAMA-DONE`.

`DESIGN.md` now carries the full verified token set, the corrected five-role
type scale, the kanban structure, the three destinations, phone OTP, and the
terminology rule. An independent checker confirms every colour, spacing, radius
and type value against Figma, and fails when any is corrupted.

## KN-001, in review, six roast rounds so far

Scores: **3.5, 1.5, 1.0, 5.0, 5.0, 5.5**. Every finding accepted, none rejected.
The board records rounds 1 and 2 only, because two rounds' replies predate the
manifest mechanism or were superseded before recording; the archives are all in
`agent/roasts/`.

What the rounds found and what was fixed: the gate was bypassable through `set
--status done`, `add --status done`, `move dropped`, recording a round against
the harness's own prompt file, `rm --force`, and swapping `verify` after a clear
round. The documented close path deadlocked because the harness and the board
had two disagreeing definitions of a dirty tree. A rename into `agent/roasts/`
hid real work from the close gate. The `review` state was decorative. The
"tokens transcribed" clause was false while the verifier passed.

The forgery line was **scoped, not chased**: `TECH-DEBT.md` entry 1 says the
gate defends against carelessness and drift, not deliberate fraud, because
nothing running locally under the author's own hand can prove the author honest.

## Next step

Round 7 is the next action for KN-001, against the current HEAD. Round 6's
critical, `verify` being swappable after a clear round, is fixed by folding
`verify` into the shared card digest, and verified: swapping it now returns
"KN-001 has been edited since the roast that cleared it".

When round 7 is clean at 9.5 or above: record it, then
`npm run todo -- move KN-001 done --evidence "..."`.

Then **KN-002**, which the owner named: fold the Documentation (`5:8`) and
Screens (`5:7`) canvases into `DESIGN.md` in full and rewrite the cards the new
decisions invalidate. `DESIGN.md` has already been corrected on navigation,
kanban, auth and terminology, so KN-002's remaining work is the 53-screen
inventory, the Job Record field list, the required-field rules, and **rewriting
KN-036 and KN-046, which still say email magic link**, and KN-043, which still
describes a list.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`. In that
order, every iteration, before touching anything.
