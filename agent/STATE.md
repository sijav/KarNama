# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale.

**This file does not restate anything the board already knows.** Numbers that
live in `board.json` are read from there:

```bash
npm run todo -- next            # what to work on
npm run todo -- show KN-033     # a card, its roast rounds and its notes
npm run todo -- list            # everything, with blockers marked
```

---

## The task spec

Build **KarNama** (کارنما), a job application tracker, and drive it with a Ralph
loop.

A job seeker adds a posting themselves, by link or by text, the product
structures it into a record, and the record carries a status through the search.
**The value is the trail, not the listing.**

**Scope is closed.** Searching boards and showing aggregated ads were cut.
**Crawling job sites is permanently out.** Two owner additions: third parties can
leave comments or suggested changes, stored for later evaluation rather than
applied, and there is an admin panel over what users submit.

Stack and standing decisions:

- Monorepo, npm workspaces. `apps/web` exists. `apps/api` and
  `packages/graphql` do not.
- React 19, TypeScript, MUI, Storybook, Playwright, Vitest, 100 percent
  coverage. **Components first with their stories, then screens.**
- GraphQL with NestJS. Render free tier, Supabase Postgres, cold start about 50
  seconds which the UI must handle honestly.
- GitHub Pages for the web app.
- lingui, **English is the source**, Persian is the translation.
- **Match the design exactly**, not approximately.
- **Auth is phone OTP**, mobile number then a five digit code, email as a
  fallback behind the same interface, **provider mocked for the MVP**.
- **The Documentation canvas beats the Components canvas**: a kanban board, not
  a list, and three nav destinations, not two.

## Where things stand

`sijav/KarNama` is live and pushed. **`apps/web` works and its gate is real.**

Green and checked by running: lint with `--max-warnings 0`, `tsc`, 209 tests
across 13 files at 100 percent on all four coverage metrics, vite build,
Storybook build, and 8 Playwright tests on desktop 1440x900 and mobile 390x844,
the viewports the Screens canvas draws.

What exists: the token set, a light theme from it and a DERIVED dark one, the
RTL emotion cache, lingui with English source ids, a persisted preference store,
a working `LanguageSwitch`, and an almost empty shell. **A user can switch the
language and it survives a reload**, proved end to end.

**`src/gate-fixtures/` is the part worth knowing about.** Five components that
are supposed to fail the lint, one test that is supposed to fail, all committed,
all excluded from an ordinary run, all driven through the REAL tools by
`agent/scripts/verify/KN-003.mjs`, which requires each to fail for the right
reason. `KARNAMA_GATE_FIXTURES=1 npm test` is how the broken test reaches the
real unit project.

Every verifier here has been mutation tested: KN-002 twelve breaks, KN-003 six,
KN-004 twelve, KN-005 nine, KN-006 eight, KN-087 four. All caught.

## What the roasts keep proving, in one line each

**An unchecked claim replaced by another unchecked claim is not a fix.** KN-002
spent four rounds on it. The cure is always the same: derive the number from a
committed artefact and make the document match it.

**A test that measures the wrong quantity passes while the thing is broken.**
KN-005's dark palette had every HSL assertion green while eight of nine status
chips sat at 1.0 to 1.5 contrast. HSL lightness is not contrast.

**"It is written" is not "it works".** KN-006 wrote the language preference,
read it back, and threw it away on the next mount, because the root forced a
locale over it. The verifier asked whether the write happened, not whether it
survived. Only the reload test found it.

**Do not mutate the worktree while a roast is reading it.** One critical in
KN-003's round was my own mutation test caught mid-run.

**The loop's carve-out has no bound.** `RALPH.md` step 5 permits fixing in-task
when the verifier "passes dishonestly", and every roast of a verifier can be
phrased that way. **KN-080** bounds it to once per task, which is the rule I have
been applying since: one fix round, then everything is a card.

## Next step

`npm run todo -- next` picks it. Do not choose by hand.

It hands back **KN-033, the API scaffold**: NestJS, GraphQL code first, its own
quality gate, a health endpoint, configuration from the environment with no
secret committed. Eight points, and the first code outside `apps/web`.

**The board grows faster than it shrinks.** Ten tasks are done and 105 are open,
39 of them filed by roasts. That is the loop working, but it means the promise
condition is a long way off, and it is worth telling the owner plainly rather
than discovering it at task 200.

**Severity has stopped discriminating**: 78 of the 105 open cards are high, 3
critical. The selection law orders by severity first, so it is effectively
picking by points and id. Filed as **KN-117** with a definition to write into
`AGENTS.md`.

Clusters worth taking together rather than one at a time: **KN-111, KN-114,
KN-115** are all "the catalog test or the lingui rule is incomplete".
**KN-092, KN-109** are both "nothing enforces a convention AGENTS.md states",
and both touch every file, so they are cheaper before the component queue than
after. **KN-091** is story-docs and every component added meanwhile is another
one to migrate.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`. In that
order, every iteration, before touching anything. Then `npm run contract`, which
is the only trustworthy answer to "do the cards still agree with the design":
that reconciliation was claimed complete twice and was wrong twice, because the
cards someone remembered were edited instead of every card being checked.
