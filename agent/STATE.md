# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale.

---

## The task spec

Build **KarNama** (کارنما), a job application tracker, in this repo, and drive
it with a Ralph loop.

The product: a job seeker adds an ad themselves, by link or by text, the product
structures it into a record, and the record carries a status through the search.
New, Applied, Interview, Rejected, Offer, plus up to four the user defines. The
value is the trail, not the listing.

**Scope is closed.** Scenarios 1 and 2, searching boards and showing aggregated
ads, were cut by the mentor's filter 4. Crawling job sites is permanently out
and a second teammate does not bring it back. Two additions from the owner:
third parties can leave comments or suggested changes, stored for later
evaluation rather than applied, and there is an admin panel over what users
submit.

The stack, and the owner's decisions:

- Monorepo, npm workspaces: `apps/web`, `apps/api`, `packages/graphql`.
- React 19, TypeScript, MUI, Storybook, Playwright, Vitest, 100 percent
  coverage, component first.
- GraphQL and a NestJS server instead of react-query over local data.
- Render free web service for the API, Supabase Postgres. Cold start about 50
  seconds, which the UI has to handle honestly.
- Auth: email magic link, JWT, one ADMIN role.
- Deploy the web app to GitHub Pages. Repo `sijav/KarNama`, public, empty.
- lingui for Persian and English, **English is the source**, Persian is the
  translation, and a language button goes in the existing chrome without
  disturbing the design.

Ordering the owner set explicitly: **components first, with their stories, then
screens.** And **match the design exactly**, not approximately.

## What happened

Read `D:\Kar\Gandom\daramadname` end to end for the conventions to carry over,
its `AGENTS.md` is the source of the rules in ours. Verified the tooling: Codex
on `gpt-5.6-terra`, `gh` authed as `sijav`, node 24, git.

Established Figma access. The original file is view-only and every MCP call
against it fails; the owner supplied a **copy**, `EITM6CbJY33dMY8IsMFR4R`, which
works. Read the Foundations canvas and transcribed the full token set into
`DESIGN.md`, plus the component families and the decisions the annotations
state.

One wrong turn worth remembering: this work started in
`D:\Kar\Gandom\SkipBureau`, which turned out to hold a **different product**
scaffolded minutes earlier by another session. Nothing there was touched. The
owner moved us to `D:\Kar\Gandom\KarNama`.

Then built KN-001: the loop, the board and the tooling.

## Where things stand

Committed and working:

- `agent/RALPH.md`, the six-step loop, with the context re-injection at step 0.
- `agent/scripts/todo.mjs`, the board tool, zero dependencies so it runs on a
  fresh clone before `npm install`. It enforces the ten required fields, the
  selection law, and refuses to close a task whose last roast left a critical
  open or scored below 9.5.
- `agent/scripts/roast.mjs`, the Codex harness on `gpt-5.6-terra`.
- `agent/board.json`, 53 tasks, validating clean, and `agent/TODO_BOARD.md`
  rendered from it.
- `AGENTS.md`, `DESIGN.md`, `CLAUDE.md`, root workspace config, `.gitignore`.

The validator earned its keep immediately: it caught two real defects in the
seed, a dependency cycle and a severity inversion, both caused by hardcoded task
ids that shifted when tasks were reordered.

Nothing else exists yet. No app, no API, no components.

## Next step

Finish KN-001 by exercising the roast harness against it, which is part of its
own exit condition, adjudicate the findings, record the measurement, and close
it. Then arm the loop and take KN-002.

KN-002 is what the owner asked for next, in their words: read the Figma
**Documentations** canvas (`5:8`) and the **Screens** canvas (`5:7`) and fold
what they say into `DESIGN.md`, including the Job Record field list and the open
items.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`. In that
order, every iteration, before touching anything.
