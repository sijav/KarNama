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

**Roasts run on Codex terra, pinned**: every roast and plan review passes
`--model gpt-5.6-terra`, AGENTS.md section 7.

**KN-324 is closed** (fb21239; board acfa4b6; pushed), one point. The Loading State's dots
are lit at the ends of their 900 ms cycle and each delayed by how many turns ago it was lit,
-300, 0 and -600 ms, so the first frame painted is the file's, 0.4, 1 and 0.4, where all
three had started at 0.4 and the file's frame first showed 450 ms in. `Reading` pauses each
dot's animation once ready and reads the opacities at 0 and one turn on; it failed at 0
before the change and at 300 with the delays reversed. DESIGN.md says the motion starts on
the file's frame, and that the Figma description still names a `spinnerArc` the node does
not draw. **KN-615** is filed, medium, measured: the Loading State's stories fail for a
Storybook viewer with reduced motion, in `drawsTheFrame`. Its Codex roast was running when
this was written, `kn324-task-roast.log` in the scratchpad.

**KN-321 is closed and its roast recorded, nothing filed** (54e58dd, 026d15f): the Page
Header's shell controls are checked at 899 and 900. **The Grep tool matches a glob with a
slash in it from the session's working directory**, AGENTS.md section 7, 070fcb4; a `cd` in
a foreground Bash call moves that directory for the session, so put it back.

**KN-318 and KN-313 are closed and their roasts recorded** (3da53b9, fa5c0e8). KN-318 filed
**KN-614**, low; KN-313 filed **KN-612** and **KN-613**, low. **KN-009 waits on KN-614**, and
when it closes KN-009 is roasted with all its children. KN-022 waits on KN-325, KN-326,
KN-327 and KN-615; KN-021 on KN-387. **Open and filed today**: KN-592 to KN-615.

**A Storybook spec alone**: `STORYBOOK_DIR=<build> npx playwright test --config
playwright.storybook.config.ts storybook/button-touch`. A filter is a regular expression on
the path, and a backslash in one is eaten on the way through npx.

**What fails in a full run**: the Job Card's `Pressed`, and at times ContactCard's
`Full On A Phone`, in parallel only, KN-365's kind: rerun a lone failure alone. `App.tsx`
line 107 is uncovered, KN-491's. `RemoteAuthProvider.tsx` and AuthScreen's live branches
run in no test, KN-503's. The API's gate fails on `extraction.service.ts`, KN-486.
`session.test.ts` can overrun its 5 seconds while a story run loads the machine, KN-551.
`two-tabs.spec.ts`'s second test, KN-601. DESIGN.md holds seven older em dashes, KN-083's.
The board screen's six commented arms stay untaken by design, KN-427.

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

**When KN-324's roast lands**, judge it, file survivors with `--parent-task KN-324`, which
hangs them off KN-022 (`--area web --okr OKR-1` under four points), record with `todo roast
KN-324 --file ... --filed ... --dismissed ...`, relay it to the owner, and commit the
rendered board.

**KN-325 is next**, medium, 1 point, web, a child of KN-022: a Loading State whose
`startedAt` moves past fifteen seconds shows the reading line for a render first; its exit
asks for the slow line on the first render, whether mounted with such a start or changed to
it, and a story that changes it while mounted. **It edits the files KN-324's roast reads,
`LoadingState.tsx` and its stories: read, do not write, until that roast lands.** Measure
first: `useSlow` keeps the start it saw run past and turns only on a zero delay timer; find
whether reading the clock while rendering passes the react-hooks lint before planning on it.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md` (the Loading State), `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo show KN-325`, `LoadingState.tsx`'s `useSlow`, `wait.ts`
and the Loading State's stories. **Never chain a check through a pipe into a commit or a
close, give every parallel command its own `cd`, sum a breakdown before writing its total,
give a search that finds nothing a positive control, and write a Grep glob with a folder in
it from the repo root.**
