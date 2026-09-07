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
out** and a second teammate does not bring it back. Two owner additions: third
parties can leave comments or suggested changes, stored for later evaluation
rather than applied, and there is an admin panel over what users submit.

Stack and owner decisions:

- Monorepo, npm workspaces: `apps/web`, `apps/api`, `packages/graphql`.
- React 19, TypeScript, MUI, Storybook, Playwright, Vitest, 100 percent
  coverage. **Components first with their stories, then screens.**
- GraphQL with a NestJS server instead of react-query over local data.
- Render free web service for the API, Supabase Postgres. Cold start about 50
  seconds, which the UI has to handle honestly.
- Deploy the web app to GitHub Pages. Repo `sijav/KarNama`, public, still empty.
- lingui, **English is the source**, Persian is the translation, and a language
  button goes in the existing chrome without disturbing the design.
- **Match the design exactly**, not approximately.

Two decisions the owner made after reading the Figma Documentation canvas:

- **Auth is phone OTP**, following the design: mobile number then a five digit
  code. Email stays as a fallback behind the same interface. **For the MVP the
  provider is mocked**, no real SMS.
- **The Documentation canvas wins over the Components canvas.** The main screen
  is a **kanban board**, not a list, and navigation has **three** destinations:
  the board, افزودن فرصت شغلی, and a standalone شبکه من contacts page.

## What happened

Read `D:\Kar\Gandom\daramadname` for the conventions to carry over. Verified the
tooling: Codex on `gpt-5.6-terra`, `gh` authed as `sijav`, node 24, jq, git.

Figma: the original file is view-only and every MCP call against it fails. The
owner supplied a **copy**, `EITM6CbJY33dMY8IsMFR4R`, which works. Read the
Foundations, Components, Documentation and Screens canvases. Tokens, component
families, the 53-screen inventory and the stated decisions are in `DESIGN.md`
and in the notes on KN-002.

This work started in `D:\Kar\Gandom\SkipBureau`, which turned out to hold a
different product scaffolded minutes earlier by another session. Nothing there
was touched; the owner moved us here.

Then KN-001: the loop, the board, the tooling, and four roast rounds against it.

## Where things stand

Committed and working. Nothing of the product exists yet: no app, no API, no
components. What exists is the machine that will build them.

- `agent/RALPH.md`, the six-step loop with context re-injection at step 0.
- `agent/scripts/todo.mjs`, the board tool, zero dependencies so it runs on a
  fresh clone before `npm install`.
- `agent/scripts/roast.mjs`, the Codex harness on `gpt-5.6-terra`, which writes
  a manifest beside every reply binding it to the task, round and commit.
- `agent/scripts/verify/KN-001.mjs`, a real cross-platform exit-condition check.
- `agent/board.json`, 54 tasks, valid, rendered to `agent/TODO_BOARD.md`.
- `AGENTS.md`, `DESIGN.md`, `TECH-DEBT.md`, `CLAUDE.md`, root workspace config.
- `.claude/ralph-loop.local.md`, the loop **armed**, promise `KARNAMA-DONE`.

**The roast rounds are the story of this task.** Round 1 scored 3.5 with two
criticals, round 2 scored 1.5 with four, round 3 scored 1.0 with four. Every
finding was accepted; none were rejected. The gate was bypassable through `set
--status done`, through `add --status done`, through `move dropped`, and through
recording a round against the harness's own prompt file, which contains the
verdict template. Round 3 also found a hard deadlock that made every honest
close impossible, which I had found independently minutes earlier.

The forgery line was then **scoped rather than chased**: `TECH-DEBT.md` entry 1
now states that the gate defends against carelessness and drift, not deliberate
fraud, because nothing running locally under the author's own hand can prove the
author was honest.

## Next step

Round 4 is in flight against commit `9192be8` plus the anchoring fix. When it
lands: adjudicate, record with `npm run todo -- roast KN-001 ...`, and if it is
clean at 9.5 or above, close with `move KN-001 done --evidence "..."`.

Then **KN-002**, which the owner asked for by name: fold the Documentation
(`5:8`) and Screens (`5:7`) canvases into `DESIGN.md`, and file the tasks the
new decisions imply. The board still describes a list screen and two nav
destinations, and several cards need rewriting: KN-027 navigation (three
destinations), KN-043 (kanban with drag and drop, not a list), KN-036 and
KN-046 (phone OTP, mocked provider), plus new cards for the standalone contacts
page, the column-menu screens, and the terminology glossary.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`. In that
order, every iteration, before touching anything.
