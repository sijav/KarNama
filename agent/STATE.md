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

**KN-216 is closed** (63304bb, pushed; board 832ebbc). `.storybook/main.ts` indexes
`'../src/{*,!(gate-fixtures)/**/*}.stories.@(ts|tsx)'`, so a story at the root of `src`
is indexed and run; the docs guard lists Storybook's own `getStoriesPathsFromConfig`
rather than a glob of its own, and a test on a scratch tree proves the root story in and
`gate-fixtures` out. A story planted once at the real root was in `index.json`, ran in
the storybook project and was asked for by the guard, then removed. It was KN-095's last
child, so **two Codex roasts were running** when this was written: KN-216's,
`kn216-task-roast.log`, and KN-095's with KN-216 and KN-217, `kn095-parent-roast.log`,
both in the scratchpad.

**KN-215 is closed and its roast recorded** (4d0abb0): `'^(props|stories)$'` is gone
from the lingui rule. Its roast filed **KN-604**, medium, the exempt names `status`,
`include`, `query`, `import` and `userName` pass copy in every file, and **KN-605**, low,
AGENTS.md's `useTsTypes` line is too narrow. KN-094's round with it filed **KN-606**, low,
KN-087.mjs's comment names a stories-only lint block that is gone, and dismissed a test
that refuses any new ignore entry as a gate nobody asked for, the owner's to ask for. All
three are KN-094's children.

**KN-586 is closed and its roast recorded** (709c4e5). The sign-in code step draws the
Code Input. Filed from it: **KN-600**, api, low; **KN-601**, medium, `two-tabs.spec.ts`'s
second test waits for words the signup step does not use; **KN-602** and **KN-603**,
low. **KN-427** (084fa51) left **KN-598** and **KN-599**, low, and **KN-587** (c7698a3)
**KN-597**, low.

**Open and filed today**: KN-592 to KN-606.

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

**When the two roasts land**, judge each: file KN-216's survivors as its children and
the round's on KN-095 as KN-095's (`--area web`, `--okr OKR-1` for anything under four
points), record with `todo roast <id> --file ... --filed ... --dismissed ...`, relay
both to the owner, and commit the rendered board. If KN-095's round finds nothing, the
parent is finished.

**KN-228 is next**, medium, 1 point, web: without the repository's story-test flag, the
Checkbox Hover story returns only when `globalThis.__STORYBOOK_PREVIEW__` exists, an
undocumented Storybook internal. The card's fix is a second flag of the repository's
own, set in `.storybook/preview-head.html`, which Storybook injects into its preview and
the Vitest page does not load, read after the test flag. The exit: the Hover story reads
no Storybook or Vitest internal; the published Storybook still renders it as a canvas
with no error, checked on a production build; and removing either repository flag makes
the story fail in the environment that flag belonged to.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md`, `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo show KN-228`, the Checkbox stories' Hover story,
`.storybook/preview-head.html` if it exists, where `__KARNAMA_STORY_TEST__` is set, and
`npm run check:storybook` in `apps/web`.
