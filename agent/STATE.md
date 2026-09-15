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

**KN-228 is closed** (f499ea7; board and plan 0c3fd02; pushed). The twelve guards in ten
story files that took a play's canvas branch only when Storybook's private
`__STORYBOOK_PREVIEW__` existed read Vite's documented `import.meta.env.MODE !== 'test'`,
and `.storybook/vitest.setup.ts` refuses any other mode. The card named one story and a
`preview-head.html` flag, which could not work, since `@storybook/addon-vitest` puts the
preview head, body and `viteFinal` in the Vitest page too; it was re-pointed before
planning. Checked: 99 of 99 stories; each guard failing on its own message with the flag
removed; a mode set in the project's config stopped by the setup; a production build's
99 stories clean, and Checkbox Hover failing with its canvas branch removed. **The close
ran past a formatting check whose failure a pipe hid**, `prettier --check | tail && close`,
the lesson AGENTS.md section 7 already holds: f499ea7 carried an unformatted plan, fixed
in 0c3fd02. Its Codex roast was running when this was written, `kn228-task-roast.log` in
the scratchpad.

**KN-216 is closed and its roast recorded** (63304bb): a story at the root of `src` is
indexed and run, and the docs guard lists Storybook's own `getStoriesPathsFromConfig`.
Its roast and KN-095's round with it filed **KN-607**, low, KN-095.mjs's expected story
list, and **KN-608**, low, story-meta.ts's comment, both KN-095's children. **KN-215**
(4d0abb0) left **KN-604**, medium, the exempt names `status`, `include`, `query`,
`import` and `userName`, and **KN-605** and **KN-606**, low, KN-094's children; that round
dismissed a test refusing any new ignore entry as a gate nobody asked for, the owner's to
ask for.

**KN-586** (709c4e5) left **KN-600**, **KN-601**, medium, `two-tabs.spec.ts`'s stale second
test, and **KN-602** and **KN-603**; KN-427 left KN-598 and KN-599, and KN-587 left KN-597,
all low.

**Open and filed today**: KN-592 to KN-608.

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

**When KN-228's roast lands**, judge it, file survivors as its children (`--area web
--okr OKR-1` for anything under four points), record with `todo roast KN-228 --file ...
--filed ... --dismissed ...`, relay it to the owner, and commit the rendered board.

**KN-230 is next**, medium, 1 point, web: the docs guard, `story-docs/guard.test.ts`'s
`readStoryFile`, requires an `fn()` for every `on*` prop in the META args alone, read
from `_metaAnnotations.args`; a story whose own args override a callback with a plain
function, or a render that replaces it, still passes, and any function called `fn`
counts. Storybook's `CsfFile` holds each story's own annotations in `_storyAnnotations`.
Today every story file takes `fn` from `storybook/test`, and `on*:` keys stand 33 times
in 7 story files. The exit: the guard fails for a story whose own args override a
callback with anything but Storybook's `fn()`, and for an `fn` not imported from
`storybook/test`, proved by a planted story of each kind, while the current stories
still pass.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md`, `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo show KN-230`, `story-docs/guard.test.ts`'s
`readStoryFile` and its callback check, and the 33 `on*:` keys in the story files.
**Never chain a check through a pipe into a commit or a close**: read its exit code on
its own.
