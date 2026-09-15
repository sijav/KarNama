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

**KN-257 is closed** (ab5168f; board 6803bfd; pushed). `getComputedStyle` is out of the
lingui rule's `ignoreFunctions`, which exempted every literal in every call of it, and
`'^::(before|after|placeholder)$'` is in `ignore`. The story files hold 44 selector
literals, 27 `::before`, 15 `::after` and 2 `::placeholder`; without the function
exemption the rule reports 42, the other two sitting under Input's `eslint-disable` block
for KN-214. `src/gate-fixtures/unlocalized-computed-style.tsx` holds one call with a
literal of copy, required by name in KN-003.mjs. **Its plan review caught two mistakes of
mine**: the card, the plan and board commit 8483710 said 42 literals beside a breakdown
that made 44, ripgrep's count mode counting lines, now a line in AGENTS.md section 7; and
a fixture of four calls held to one report could not say which call failed, so the fixture
holds only the copy and the stories under lint show the selectors pass. Its Codex roast was
running when this was written, `kn257-task-roast.log` in the scratchpad.

**KN-230 is closed and its roast recorded** (9bf6c7e): the docs guard reads storybook/test's
`fn` by the name each story file imports it by, and each story's own `on*` args keys. Its
roast filed **KN-609**, low, the guard skipping a callback a story's own args write as a
method, `onPress() {}`, a child of KN-013; it dismissed a namespace-imported spy being
refused, a loud false rejection, and Tabs' render wiring `setValue`, outside the exit.

**KN-228 is closed and its roast recorded** (f499ea7, plan fixed in 0c3fd02): twelve plays
know the published Storybook by `import.meta.env.MODE !== 'test'`, and `vitest.setup.ts`
refuses any other mode; nothing filed. **Its close ran past a formatting check whose
failure a pipe hid.**

**KN-216** (63304bb) left **KN-607** and **KN-608**, low, KN-095's children. **KN-215**
(4d0abb0) left **KN-604**, medium, the exempt names `status`, `include`, `query`, `import`
and `userName`, and **KN-605** and **KN-606**, low; that round dismissed a test refusing
any new ignore entry as a gate nobody asked for, the owner's to ask for. **KN-586**
(709c4e5) left **KN-600**, **KN-601**, medium, `two-tabs.spec.ts`'s stale second test, and
**KN-602** and **KN-603**; KN-427 left KN-598 and KN-599, and KN-587 left KN-597, all low.

**Open and filed today**: KN-592 to KN-609.

**What fails in a full run**: the Job Card's `Pressed` in parallel only, KN-365's
kind. `App.tsx` line 107 is uncovered, KN-491's. `RemoteAuthProvider.tsx` and
AuthScreen's live branches run in no test, KN-503's. The API's gate fails on
`extraction.service.ts`, KN-486. `session.test.ts` can overrun its 5 seconds while
a story run loads the machine, KN-551. `two-tabs.spec.ts`'s second test, KN-601.
DESIGN.md holds seven older em dashes, KN-083's. The board screen's six commented
arms stay untaken by design, KN-427.

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

**When KN-257's roast lands**, judge it, file survivors as its children (`--area web
--okr OKR-1` for anything under four points), record with `todo roast KN-257 --file ...
--filed ... --dismissed ...`, relay it to the owner, and commit the rendered board. KN-257
is a child of KN-011, so a finding hangs off KN-011, which waits on 18 more.

**KN-304 is next**, medium, 1 point, web, a child of KN-023: on a hovered or chosen tab
the indicator, the tab's `::after`, paints over the focus ring, its `::before`, along the
ring's bottom band, grey over blue. Its exit asks a focused tab's ring unbroken in every
state, the indicator drawn beneath it or clear of it, shown in a story that focuses a
hovered tab and reads the ring's bottom band as `border/focus`. Measure before planning:
how the Tabs draw and stack the two pseudo-elements, what the Figma draws for a focused
tab that is hovered or chosen, and whether a story already reads the ring.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md`, `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo show KN-304`, `apps/web/src/shared/tabs/`, and the
Figma frame of the tabs. **Never chain a check through a pipe into a commit or a close,
give every parallel command its own `cd`, and sum a breakdown before writing its total.**
