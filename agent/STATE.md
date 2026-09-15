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

**KN-332 is closed** (6ed2856; board 4a06a30; pushed), one point, a child of KN-012. A single
Select handed MUI its first value but drew each row's check from the whole list, so two values
checked two rows; it now takes `held`, the list when multiple and its first value otherwise, for
both. `TwoValuesWithoutMultiple`, its Controls off at the plan review's ask, failed alone against
the old component with two rows checked. Seen in fa-IR light and dark, and in en-US through
`__STORYBOOK_PREVIEW__.onUpdateArgs`, since the URL's args left a list arg unchanged. Its Codex
roast was running when this was written, `kn332-task-roast.log` in the scratchpad. KN-012 waits
on KN-333, KN-334 and KN-357.

**KN-331 is closed and its roast recorded** (5999321; recorded in 0bec7ed). The Bulk Action
Bar's props are a union, the job list's member requiring both callbacks and the network's naming
them optional `never`, and every story draws its bar through `barFor`: the docs guard keeps every
callback's `fn()` in the meta, so a story of the network's type still held the job callbacks,
which tsc refused in a spread and Show code printed. The roast found the union mutable, reproduced:
`delete props.onSelectAll` and `props.type = 'jobs'` compile, readonly refuses both, and
`Object.assign` still compiles. Filed **KN-620**, low, a child of **KN-025**, so KN-025's
whole-task round, over KN-330, KN-331 and KN-620, waits until KN-620 closes.

**AGENTS.md section 7 gained, today** (21938a1, d271046): ESLint's `lintText` types what a draft
imports from the files on disk; a play runs only when a story mounts or is remounted; a union's
story args and Show code; a look hands a story a list through the preview, not the URL; an open
MUI list hides the field from role queries.

**Earlier today**: KN-326 closed and recorded (9914921, cf3c9a7), KN-619 filed; KN-325 and KN-324
closed and recorded. **Filed today and open**: KN-615, KN-617, KN-618, KN-619, KN-620.

**Still open from earlier**: **KN-009 waits on KN-614**; KN-021 waits on KN-387; KN-022 on
KN-327, KN-615, KN-616 and KN-619; **KN-025 on KN-620**; KN-012 on KN-333, KN-334 and KN-357.
KN-612 and KN-613, low.

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

**When KN-332's roast lands**, judge it, file survivors with `--parent-task KN-332`, which hangs
them off KN-012 (`--area web --okr OKR-1` under four points), record with `todo roast KN-332
--file ... --filed ... --dismissed ...`, relay it to the owner, and commit the board.

**KN-335 is in progress**, medium, 1 point, a child of KN-018: the Tooltip maps its start
placement to MUI's `left` and relies on MUI to mirror it, but MUI's Popper mirrors only the
`-start` and `-end` placements, read in `BasePopper.js`'s `flipPlacement`, so in a right to left
page the blocked delete's reason is asked for the physical left; the StatusMenu's
`DeleteBlocked` story showed it on the right only because Popper flipped it for want of room. Its
exit: start asks MUI for right in a right to left page and left in a left to right one, and a
story with room on both sides checks the tip sits at the inline start. `theme/sides.ts` already
has `inlineStartOf`.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md` (the Tooltip), `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo show KN-335`, `Tooltip.tsx`, its stories and story docs, and
`StatusMenu.stories.tsx`'s `DeleteBlocked`. **Never chain a check through a pipe into a commit or
a close, give every parallel command its own `cd`, give a search that finds nothing a positive
control, write a Grep glob with a folder in it from the repo root, and check a draft that imports
another draft with a compiler host, not `lintText`.**
