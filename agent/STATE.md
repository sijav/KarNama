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
**KN-481** matched the board and network to their frames (198a36f); its roast
filed KN-519 and KN-520, its audit KN-512 to KN-514 and KN-518. **Blocked on the
owner, asked 2026-09-14 in chat**: KN-515 a phone board header's add button,
KN-516 a phone board's sort row, KN-517 history's place among the modal's tabs.

**Closed today since**: KN-483, KN-401, KN-403, KN-405; KN-423 (5159f0f), the
Checkbox names its input. **KN-428 (63f6870)**: a phone starts a selection with
a press held on a card, as Card / Mobile 491:751 and the Checkbox 204:11 say in
their descriptions, through `useHold` in `shared/job-card/hold.ts` and a
`selecting` prop; KN-527 carries the same gap on a tablet; Safari on an iPhone
was not checked; its roast filed KN-528, KN-529 and KN-530. **KN-352
(26f86f1)**: no product change; `UncheckingOnAPhone` proves focus stays on a
phone card's checkbox when the last card chosen is unchecked by keyboard; its
roast filed KN-531. **KN-356 (6bf0c27)**: no product change, its groundwork
924e515 having built it; App/Shell's `Selecting` counts what is fixed at a
phone's foot, the tab bar at rest, only the Bulk Action Bar while a card is
held, the tab bar again after, and fails when Navigation ignores `selecting` or
App never passes it. Its roast is with Codex.

**KN-427 re-pointed, not worked**: JobsScreen leaves 52 of its 149 branch arms
to no story, 26 of them KN-477's drag handlers; its note lists every arm by line
and it waits in the backlog at 5 points.

**What fails in a full run, and why**: the web unit project passes whole, 1367.
The storybook project fails the five modal stories KN-494 carries, the board's
`Adding`, which calls the live API, KN-495, and the Job Card's `Pressed` in
parallel only, KN-365's kind. The API's 156 tests pass and its coverage gate
fails on auth and extraction files, KN-486.

**Found on the way and filed**: KN-505, clean paths rather than `#/`, the
owner's question; KN-507, the Settings dialog's Theme and sample-data parts.

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

Relay KN-356's roast when it lands, judge it and file what survives as its
children. KN-431 is in progress, a data loss: on the board, select all takes
every job opportunity rather than what the search found, and the bulk delete and
status change act on the whole selection whether the search shows it or not, so
a reader who searches, selects all and deletes loses what was hidden. Read how
JobsScreen and NetworkScreen select and delete around a search, write a story
that searches, selects all and deletes and watch it fail on today's code, then
the plan beside JobsScreen, its roast, the fix, and the story passing with the
hidden job opportunities surviving. Do not edit App's stories or the shell's
docs until KN-356's roast has landed: it is reading them.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
