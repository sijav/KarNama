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

## Where things stand, 2026-09-15

**Codex's work of 2026-09-12 stays on main**, KN-477: login mocked at the owner's
word, Groq extraction on Render, Settings, drag and drop, collapse, date
validation, the growing paste field, the job modal's form. Its surviving review
findings are KN-484 to KN-503 and KN-521; the dark `color-scheme` fix waits in
`git stash@{0}` as KN-496.

**Waiting on the owner.** Asked 2026-09-14: KN-515, KN-516, KN-517. Asked in chat
on 2026-09-15, neither answered yet: whether the Search Bar and the Sort Control
take KN-275's `border/control`; and **KN-486**, blocked: whether tests of
`extraction.service.ts` that stub `fetch` are allowed, after the owner told Codex
on 2026-09-12 "If you have AI test, remove that, I didn't ask for an AI API
test". The owner was told on 2026-09-15 that the Codex log they pasted holds the
Groq key they had pasted to Codex, that no file, commit or board entry holds it,
and to rotate it. Never repeat that key anywhere. **Filed for the owner by
KN-518**, not yet asked: KN-588, KN-589, KN-590, KN-591.

**Roasts run on Codex terra, pinned.** `roast.py`'s task and plan chains end in
`claude/sonnet`, and their Codex reserve `gpt-5.6` is refused on this ChatGPT
account with a 400, so when terra is out of usage Claude's work went to Claude:
KN-533's first roast did and was stopped. Every roast and plan review now passes
`--model gpt-5.6-terra`, which tries terra alone; AGENTS.md section 7 records it.

**KN-571 is closed** (e1df5cc, pushed): the six modal story files offer only the
controls their plays hold for and that show. The controls sweep on a fresh
production build finds none broken, untried or unapplied, where it found 39. Modal
gained a `Default` that opens in its own canvas and waits behind its trigger on the
Docs page, pinned to fa-IR; ContactModal's `mode` has `control: false`. Its Codex
roast was running when this was written (`kn571-task-roast.log` in the scratchpad),
to be judged and recorded, and so was the Pages run for e1df5cc. **KN-594**, filed
while planning it: the AddJobModal, JobModal and ContactModal Docs pages are
covered by their own open dialogs, 19, 15 and 2.

**KN-533 is closed** and its roast recorded: **KN-592**, medium, no e2e holds a real
touch on the network page as board.spec.ts's does; **KN-593**, low, the phone and
selecting docs and DESIGN.md's two phone-selection paragraphs say more than the
code; KN-527 noted, the network card has the board's md-and-wider touch gap too.
**KN-572** notes that KN-533's three phone stories break under Controls. Its Pages
run passed.

**Measured, and in AGENTS.md section 7**: a Docs page draws stories inline, so an
open modal covers it, and a frame of its own follows no toolbar; the Docs Controls
block trims by `include`, never by `disable`, so a control no story can hold needs
`control: false`. The unit project's `session.test.ts` can overrun its 5 seconds
while a story run loads the machine, KN-551; alone it passes.

**How to measure**: `node agent/scripts/storybook/controls-sweep.mjs --only
'<regex>' --out <file>` builds a production Storybook and sweeps each story's
controls; read its JSON for what each story offered and whether it was tried. The
published Storybook: build with `KARNAMA_STORYBOOK_BASE` from PowerShell or Node's
`env`, never a Git Bash line.

**What fails in a full run**: the Job Card's `Pressed` in parallel only, KN-365's
kind. `App.tsx` line 107 is uncovered, KN-491's. The API's gate fails on
`extraction.service.ts`, KN-486.

## The owner's rules, most recent first

- **2026-09-15.** "Bro GitHub pages do work with normal deep linking routing like
  ../daramad-name": real paths, a page per destination, `404.html` for the rest.
- **2026-09-14.** The board is the todo skill's database. The shared skills
  serve ALL projects: a change only adds. A model's work is never roasted by that
  model. "It should look like the figma." The owner reads on a phone: literal
  truth, no excuses. An instruction carries its date; a later one overrides.
- **2026-09-12, to Codex, still standing.** Mock the login. Keep the sample data
  and the AI extraction. Do not change a layout nobody asked to change. Commit
  and push after work. Never ask the owner to redeploy when nothing changed. "If
  you have AI test, remove that": whether it reaches stubbed tests is asked.
- **2026-09-11.** Push after every close: commit, close, push, then roast. Only
  new component cards and their blockers are `critical`. No proof at the close:
  test what changed, look at it, close with one line. Roasts stay. A finding
  about the loop is `low`. 100 percent coverage. **Do not invent gates.**
- **A finding is a CHILD of its task**, one level, with `--area` and `--okr`.
  **Plans live beside the work**, checked by `roast.py plan` from the repository
  root before building, and they stay. Write long scripts with the Write tool.

## The next step

**KN-574 is next**, high, 3 points: the LanguageSwitch, LanguageFlag, Sidebar,
NavItem, TabBar, Icon and Tokens stories offer controls that break their plays.
KN-571's way: measure with the sweep first, since the card's list is from 83877dc;
offer per story only what its play holds for and what shows, read the args where
the play can, and keep each Docs page's table, a disabled first story keeping it.
Plan beside the work, reviewed with `--model gpt-5.6-terra`. Judge and record
KN-571's roast when it lands, and read the Pages run for e1df5cc to its end.

## What to read first

`AGENTS.md` (sections 4 and 7), `DESIGN.md`, `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo show KN-574`, KN-571's plan in
`apps/web/src/shared/modal/`, and the seven story files.
