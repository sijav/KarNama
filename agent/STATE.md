# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale. The board is the todo skill's
database, `.claude/todo.db`: `node ~/.claude/skills/todo/todo.mjs next`,
`show <id>`, `list`, `okr`. What keeps going wrong is `AGENTS.md` section 7.

## The task spec

Build **KarNama** (کارنما), a job application tracker, driven by a Ralph loop. A
job seeker adds a posting by link or text; the product structures it into a
record that carries a status through the search. **The value is the trail, not
the listing.** Scope is closed; crawling is permanently out. Owner additions:
third-party comments stored rather than applied, and an admin panel over them.

Monorepo, npm workspaces. React 19, TypeScript, MUI 9, Storybook 10, Vitest,
Playwright, 100 percent coverage. NestJS, GraphQL code first, Prisma, Postgres
on **Neon**. GitHub Pages for web, Render for the API with a 50 second cold
start the UI must handle honestly. lingui, **English ids**. **Components first
with their stories, then screens. Match the design exactly.**

## Where things stand, 2026-09-14

**Codex's work of 2026-09-12 stays on main**, KN-477: login mocked at the
owner's word, Groq extraction on Render, Settings, drag and drop, collapse,
date validation, the growing paste field. What survived four Claude reviews of
its diff is its children, KN-484 to KN-503 and KN-521 still open; the dark
`color-scheme` fix waits in `git stash@{0}` as KN-496.

**The owner's asks of 2026-09-14, done**: KN-479 language flags; KN-480 the
language Select in Settings; KN-478 the shell's controls as Icon Buttons.
**KN-481** matched the board and network to their frames (198a36f). **Blocked
on the owner, asked 2026-09-14 in chat**: KN-515 a phone board header's add
button, KN-516 a phone board's sort row, KN-517 history's place among the modal's
tabs.

**Closed today since**: KN-483, KN-401, KN-403, KN-405, KN-423. **KN-428
(63f6870)**: a phone starts a selection with a press held on a card, through
`useHold` in `shared/job-card/hold.ts`; its roast filed KN-528 to KN-530; KN-527
is the tablet's gap. **KN-352 (26f86f1)** and **KN-356 (6bf0c27)**: stories
proving what was already built; their roasts filed KN-531, KN-533, a phone
cannot select a person on the network page at all, and KN-534. **KN-431
(38ac449)** on the board and **KN-532 (c06b85f)** on the network page: the bulk
bar counts, selects and deletes only what the search shows. KN-431's roast filed
KN-535 and KN-536 and raised KN-419; KN-532's filed KN-537.

**KN-419 (30f6b8e)**: another tab's sign-out, sign-in and board now reach every
open tab, through a `storage` listener in `RecordsProvider` and in the demo
`AuthProvider`. Measured before: a tab opened before the samples were loaded
wrote its empty board over all thirty with its next change, and a sign-out left
the other tab on the board. Proved by `ChangedInAnotherTab`,
`SignedOutInAnotherTab`, `SignedInInAnotherTab`, and `e2e/two-tabs.spec.ts`,
which proves what no story can: every story's providers sit under the preview's
own board, so a story's board keeps the bare key and its providers remount when
a reader arrives (`AGENTS.md` section 7). Its roast filed **KN-538**, a storage
event handled late bringing an older board back over a newer write, and
**KN-539**, two tabs signing in at the same moment each adopting the other's
session: both are the listeners trusting the event's value rather than what is
stored.

**KN-427 re-pointed, not worked**: JobsScreen leaves 52 of its 149 branch arms
to no story, 26 of them KN-477's drag handlers; its note lists every arm by line
and it waits in the backlog at 5 points.

**What fails in a full run, and why**: the web unit project passes whole, 1367.
The storybook project fails the five modal stories KN-494 carries, the board's
`Adding`, which calls the live API, KN-495, and the Job Card's `Pressed` in
parallel only, KN-365's kind. The API's 156 tests pass and its coverage gate
fails on auth and extraction files, KN-486. Of the e2e suite, only
`two-tabs.spec.ts` was run on 2026-09-14, on desktop, and it passes.

## The owner's rules, most recent first

- **2026-09-14.** The board is the todo skill's database, and `agent/board.json`
  is its archive. The shared skills serve ALL projects: a change only adds, and
  is checked against a copy of every board on the machine. A model's work is
  never roasted by that model. A suggestion is not a directive (the CSV diff).
  Flags come from a package, not a political choice. Settings and a phone's sign
  out do not exist in Figma, so they are invented, as icons. "It should look like
  the figma." The owner reads on a phone: literal truth, no excuses.
- **2026-09-12, to Codex, still standing for the product.** Mock the login for
  now. Keep the sample data and the AI extraction. Do not change a layout nobody
  asked to change; a drag wrapper belongs in the correct spot. Commit and push
  after work. Never ask the owner to redeploy when nothing changed.
- **Push after every close, 2026-09-11.** Commit, close, push, then roast.
- **New components first, 2026-09-11**: only new component cards and their
  blockers are `critical`; a finding on a built component is `high` or lower.
- **No proof at the close, 2026-09-11**: test what changed, stories, unit tests,
  lint, tsc, look at it, close with one line of evidence. Roasts stay.
- **A finding about the loop rather than the product is `low`** unless it is
  actively breaking the work.
- **100 percent coverage is a product rule**: `apps/*`, `packages/*`, not
  `agent/scripts/**`, and markdown has no tests.
- **Do not invent gates.** Rule zero of `agent/RALPH.md`.
- **A finding is a CHILD of its task**, one level: `todo add --parent-task`.
- **Plans live beside the work**, `#<id> - <title>.md`, checked by
  `roast.py plan` before building, and they stay.

## The next step

KN-437 is in progress: the story fixtures gain `statusOptions`, the nine statuses
in the product's own shape, and `records`, the product's own `Records` built
from them; the board fixture's columns carry their status's id; the three status
stories read `statusOptions` and lose their maps; and the board's `Board` and
`InEnglish` stories are seeded from `fixtures(locale).records`, with `Board`
checking the page against `fixtures(locale).board`. The plan is
`apps/web/src/shared/story-fixtures/#KN-437 - The board fixture cannot be handed to anything.md`,
and its roast with Codex was running when this was written. Take what survives
into the plan, then build it, every new check failing first. After it, `todo
next`: KN-538 is the medium child of KN-419, and KN-539 waits on it.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
