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

**KN-321 is closed** (54e58dd; board 6e16e80; pushed), one point. `ControlsOnNarrowScreens`
keeps 390 by 844 for the click on signing out, and checks the shell's three controls in the
Page Header visible at 899 by 900 and hidden at 900 by 900, in place of 1440. With the
controls' line planted at `sm` the story failed at 899, and at `lg` at 900. KN-021 waits on
KN-387 alone. Its Codex roast was running when this was written, `kn321-task-roast.log` in
the scratchpad.

**The Grep tool matches a glob with a slash in it from the session's working directory**,
whatever path the search is given, AGENTS.md section 7, 070fcb4. Nine of this session's
searches came back empty that way where the glob written from the repo root finds matches;
seven had nothing resting on them, KN-304's plan's claim was caught by its review, and
KN-321's by its positive control.

**KN-319's roast is recorded, nothing filed** (03573b7): the focus ring under 3:1 on a filled
button is KN-399's, and `accentStep` on token pairs added later is outside the card.

**KN-318 and KN-313 are closed and their roasts recorded** (3da53b9, fa5c0e8): the Button's
and the Icon Button's hover sit under `@media (hover: hover)`, proved by
`e2e/storybook/button-touch.spec.ts` and `icon-button-touch.spec.ts` in the Storybook
check. KN-318 filed **KN-614**, low, a skipped touch check passing the Pages workflow
unseen; KN-313 filed **KN-612** and **KN-613**, low. **KN-009 waits on KN-614**, and when it
closes KN-009 is roasted with all its children. KN-312 is dropped into KN-350. KN-304 filed
KN-611; KN-257 KN-610; KN-230 KN-609. **Open and filed today**: KN-592 to KN-614.

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

**When KN-321's roast lands**, judge it, file survivors as its children (`--area web
--okr OKR-1` for anything under four points), record with `todo roast KN-321 --file ...
--filed ... --dismissed ...`, relay it to the owner, and commit the rendered board. KN-321 is
a child of KN-021, so a finding hangs off KN-021.

**KN-324 is next**, medium, 1 point, web, a child of KN-022: the Loading State's dots start
on a frame with all three dim, and no story reads their opacity; its exit asks for the first
painted frame to be the file's, the middle dot at 1 and the others at 0.4, and a story that
reads the three opacities at the start and one turn later. **Measure its premise first**: the
card predates the SQLite board, so read the Loading State's dots, their delays and DESIGN.md's
paragraph on them before planning.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md` (the Loading State), `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo show KN-324` and the Loading State's component and stories
under `apps/web/src/shared/loading-state/`. **Never chain a check through a pipe into a commit
or a close, give every parallel command its own `cd`, sum a breakdown before writing its
total, give a search that finds nothing a positive control, and write a Grep glob with a
folder in it from the repo root.**
