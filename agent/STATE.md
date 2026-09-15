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
and to rotate it. Never repeat that key anywhere. **Filed for the owner, not yet
asked**: KN-588, KN-589, KN-590, KN-591, and **KN-616**, Figma's Loading State
description asking for a turning `spinnerArc` the node does not draw.

**Roasts run on Codex terra, pinned**: every roast and plan review passes
`--model gpt-5.6-terra`, AGENTS.md section 7.

**KN-326 is closed** (9914921; board e51b1a8; pushed), one point. The Loading State's status
region says `aria-atomic`, hides its dots and visible line from assistive technology, the line
still drawn from the first frame for KN-324, and holds an out of sight span, the Bulk Action
Bar's clip, empty on the render that mounts the state and given the line 100 ms later by a timer
the effect's cleanup clears, so a screen reader hears the first line as a change. The story
`WritesItsFirstLineAfterMounting` mounts the state from «Extract details», the add flow's own
message, pressed with `fireEvent`, and reads the span empty then filled; it failed against
HEAD's component and under a plant. No screen reader was run. **Found building it and recorded,
AGENTS.md section 7, b9d540b**: addon-docs' Stories block leaves out every story whose play
destructures `mount`, whatever `parameters.docs.story.autoplay` says. Its Codex roast was
running when this was written, `kn326-task-roast.log` in the scratchpad.

**KN-325 is closed and its roast recorded, nothing filed** (23ef6c9, fe8e85b): a `startedAt`
already past fifteen seconds shows the slow line on its first render, read from a store per
start with `useSyncExternalStore`; react-hooks 7's `purity` refuses `Date.now()` while
rendering, and ESLint's `lintText` lints a design in memory, AGENTS.md section 7, 92a81d9.
**KN-324** is closed and recorded (fb21239, db7a721). **Filed today and open**: KN-615, the
Loading State's stories under reduced motion; KN-617, AGENTS.md's `.po` catalog instructions;
**KN-618**, the Settings dialog's status region, KN-326's kind, a child of KN-477.

**Still open from earlier**: **KN-009 waits on KN-614**, then KN-009 is roasted with all its
children; KN-021 waits on KN-387; KN-022 on KN-327, KN-615 and KN-616. KN-612 and KN-613,
low. **Open and filed today**: KN-592 to KN-618.

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

**When KN-326's roast lands**, judge it, file survivors with `--parent-task KN-326`, which
hangs them off KN-022 (`--area web --okr OKR-1` under four points), record with `todo roast
KN-326 --file ... --filed ... --dismissed ...`, relay it to the owner, and commit the board.

**KN-331 is in progress**, medium, 1 point, a child of KN-025: a Jobs Bulk Action Bar given no
`onSelectAll` or `onChangeStatus` silently drops the file's buttons, both callbacks being
optional so the Contacts type need not pass them; its exit asks that a Jobs bar cannot be
written without both, by its type or by two components, and that the docs guard still reads
every prop, react-docgen reading only the props a union shares. **Measure first**: the props,
how the Jobs type draws its buttons, and every place a Bulk Action Bar is written today.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md` (the Bulk Action Bar), `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo show KN-331`, `BulkActionBar.tsx`, its stories and story
docs, and where it is used. **Never chain a check through a pipe into a commit or a close,
give every parallel command its own `cd`, give a search that finds nothing a positive
control, write a Grep glob with a folder in it from the repo root, and lint a design in memory
before writing it.**
