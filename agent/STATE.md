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

**Closed today, earlier**: KN-483, KN-401, KN-403, KN-405, KN-423, KN-428 (a
phone's held press selects), KN-352, KN-356, KN-431 and KN-532 (the bulk bar
follows the search). Their roasts filed KN-527 to KN-537.

**KN-419 (30f6b8e)**: another tab's sign-out, sign-in and board reach every open
tab, through a `storage` listener in `RecordsProvider` and the demo
`AuthProvider`; proved by three stories and `e2e/two-tabs.spec.ts`, which proves
what no story can, since every story's providers sit under the preview's own
board (`AGENTS.md` section 7). Its roast filed **KN-538**, a late event bringing
an older board back, and **KN-539**, two sign-ins at the same moment.

**KN-437 (85947b4)**: the story fixtures hand the board to the product:
`fixtures(locale).statusOptions`, `records` built through `jobFrom`, board
columns with their status id; five stories lost their own status maps; `Board`
and `InEnglish` are seeded from the records. Its roast filed **KN-540** and
**KN-541**, `Board` checking containment and document order only.

**KN-438 (dd579f0)**: the seeded board is uneven in both languages, custom-2
empty, new three, rejected six; a shape test replaced KN-305's one-in-every-status
test. Its roast filed nothing.

**KN-440 (28b0437)**: a status keeps its column when its colour changes:
`columnOrder` ranks the design's five by their id, which is their token and never
changes, and every other status before rejected in the order added. Its plan
review filed **KN-542**, the sample loader still matching a status by colour, and
**KN-543**, the API seed putting rejected before offer; its roast filed
**KN-544**, the board still collapsing a column by its colour, and **KN-545**,
its story not proving the recolour happened.

**KN-427 re-pointed, not worked**: JobsScreen leaves 52 of its 149 branch arms
to no story, 26 of them KN-477's drag handlers; its note lists every arm by line
and it waits in the backlog at 5 points.

**What fails in a full run, and why**: the web unit project passes whole, 1373.
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
- **A finding is a CHILD of its task**, one level: `todo add --parent-task`,
  always with `--area`.
- **Plans live beside the work**, `#<id> - <title>.md`, checked by
  `roast.py plan` before building, and they stay. Run `roast.py` from the
  repository root, or it leaves a `.claude/` wherever it ran.

## The next step

KN-446 is in progress: the Icon Button's `TooltipTrigger` type names seven props
while each branch spreads the rest onto MUI's button, so the type bounds nothing,
and the rest is also what carries `data-mui-internal-clone-element`, the marker
MUI's Tooltip reads back to check its child forwards props. The plan,
`apps/web/src/shared/icon-button/#KN-446 - The Icon Button's TooltipTrigger type enforces nothing.md`,
narrows the runtime to the type: forward the declared trigger and opener props
by name, declare and forward the clone marker with a comment on why, and drop
the rest. Its roast with Codex was running when this was written; do not edit
`IconButton.tsx` or its stories until it lands. Then write the story that hands
the button undeclared props and finds none reach it, failing first, then the
change, then the plants: the marker left out fails `InATooltip` on MUI's console
error, and the rest spread put back fails the new story.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
