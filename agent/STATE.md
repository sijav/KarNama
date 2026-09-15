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

**KN-325 is closed** (23ef6c9; board fc491a8; pushed), one point. `useSlow` reads a store per
start with `useSyncExternalStore`: its snapshot is the clock read on the first read and kept,
and its timer, set for every start, marks it past and tells React, so a `startedAt` already
past fifteen seconds shows the slow line on the render that gives it; before, a start moved
between two past starts flipped the line to the reading line and back 2 ms apart. The story
`StartMovesPastFifteenSeconds` moves the start behind a button, «Move the start back», presses
it with `fireEvent`, which `@storybook/react`'s `beforeAll` wraps in its act and the
instrumenter runs synchronously, and reads the slow line straight after; it failed alone at that
read, line 153, before the change and under a plant. The plan had two Codex reviews. Its Codex
roast was running when this was written, `kn325-task-roast.log` in the scratchpad.
**Measured and recorded**: react-hooks 7.1.1's `purity` refuses `Date.now()` while rendering,
and ESLint's `lintText` on a file's own path lints a design in memory, AGENTS.md section 7,
92a81d9. React 19.0.8's `act` errors when `IS_REACT_ACT_ENVIRONMENT` is off, which it is outside
Storybook's own act scopes, and a production build has no `act`.

**KN-324 is closed and its roast recorded** (fb21239, db7a721): the dots start on the file's
frame. **KN-615**, medium, the Loading State's stories fail for a viewer with reduced motion;
**KN-617**, low, AGENTS.md sends a new string through a `.po` catalog the app does not have, the
catalogs being the hand-written `src/i18n/locales/en-US.ts` and `fa-IR.ts`. KN-179 already holds
that `no-restricted-globals` is set in no ESLint config.

**Still open from earlier**: **KN-009 waits on KN-614**, then KN-009 is roasted with all its
children; KN-021 waits on KN-387; KN-022 on KN-326, KN-327, KN-615 and KN-616. KN-612 and
KN-613, low. **Open and filed today**: KN-592 to KN-617.

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

**KN-325's roast is recorded, nothing filed** (fe8e85b): its one edge case, a snapshot read
just before fifteen seconds and committed after them, is the ordinary change at fifteen seconds.
**KN-618** is filed, medium, a child of KN-477: the Settings dialog's sample data status region
mounts already holding its line, KN-326's kind.

**KN-326 is in progress**, medium, 1 point, a child of KN-022: the Loading State's first line
is not reliably announced, since its status region mounts already holding it. Its plan sits
beside `LoadingState.tsx` and is at its Codex review, `kn326-plan-review.log` in the scratchpad:
do not edit the Loading State, its stories, its story docs or DESIGN.md until it lands. The
design: the outer Box keeps `role="status"`; the dots and the visible line take `aria-hidden`,
the line still drawn on the first frame for KN-324; an out of sight span between them, the Bulk
Action Bar's clip and named edge, is empty on the mounting render and given the line a frame and
a task later; a new story `WritesItsFirstLineAfterMounting` destructures Storybook's `mount`,
used by no other story here, and reads the span empty, then filled. Linted in memory, clean.
The scripts are in the scratchpad: `kn326-plant.mjs`, `kn326-checks.mjs`, `kn326-look.mjs`,
`kn326-close.mjs`.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md` (the Loading State, the Input's error, the Bulk Action
Bar), `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo show KN-326`,
`LoadingState.tsx`, its stories, and how the Input and the Bulk Action Bar keep their live
regions. **Never chain a check through a pipe into a commit or a close, give every parallel
command its own `cd`, give a search that finds nothing a positive control, write a Grep glob
with a folder in it from the repo root, and lint a design in memory before writing it.**
