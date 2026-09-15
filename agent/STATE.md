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

**KN-215 is closed** (4d0abb0, pushed; board 1b5c153). `'^(props|stories)$'` is gone
from the lingui rule's ignore array, where it let both words through in every file.
`sectionOf` in `story-docs/parse.ts` returns the name its comparisons narrowed, and
`gate-fixtures/unlocalized-section-words.tsx` fails `eslint --no-ignore` with three
reports and gives none with the entry put back in memory; `KN-003.mjs` requires it by
name and requires its three reports, and `lingui-ignore.test.ts` refuses an entry that
lets either word through. Its exit was corrected after the plan review, since `npm run
lint` ignores the fixtures. It was KN-094's last child, so **two Codex roasts were
running** when this was written: KN-215's, `kn215-task-roast.log`, and KN-094's with
KN-215, `kn094-parent-roast.log`, both in the scratchpad.

**KN-586 is closed and its roast recorded** (709c4e5; board e5abce4; Pages passed). The
sign-in code step draws the Code Input, `shared/code-input`. Its roast filed **KN-602**,
low, a Persian digit typed into the middle of the code sends the caret to the end, and
**KN-603**, low, an input method's composition is cleared and full-width digits are
dropped. Found while building it: **KN-600**, api, low, a phone's own one-time-code
suggestion needs the live text message to name the site's origin; **KN-601**, medium,
`two-tabs.spec.ts`'s second test waits for words the signup step does not use.

**KN-427 is closed and its roast recorded** (084fa51): **KN-599**, low, its drag story
calls the synthetic DragEvents it dispatches the browser's own; **KN-598**, low, the
contact modal keeps a job opportunity another tab deleted, TECH-DEBT.md section 22.

**KN-587 is closed and its roast recorded** (c7698a3): **KN-597**, low, the sign-in
screen's focus mark outlives a `changeNumber` the live provider ignores.

**Open and filed today**: KN-592 to KN-603.

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

**When the two roasts land**, judge each: file KN-215's survivors as its children and
the round's on KN-094 as KN-094's (`--area web`, `--okr OKR-1` for anything under four
points), record with `todo roast <id> --file ... --filed ... --dismissed ...`, relay
both to the owner, and commit the rendered board. If KN-094's round finds nothing, the
parent is finished.

**KN-216 is next**, medium, 1 point, web: `.storybook/main.ts` indexes
`'../src/!(gate-fixtures)/**/*.stories.@(ts|tsx)'`, which needs a folder after `src`,
so a story file directly under `src` would be in neither Storybook nor the storybook
test project; the docs guard, `story-docs/guard.test.ts`'s `storyFiles`, globs every
story and excludes `gate-fixtures/**` by a rule of its own. The exit: a story file
directly under `src` is indexed and run, `src/gate-fixtures` stays excluded from both,
and the guard derives its list from the rule Storybook uses, proved by a fixture at
the root of `src` that appears in Storybook's index and in the guard alike.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md`, `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo show KN-216`, `.storybook/main.ts`,
`story-docs/guard.test.ts`, `story-docs/stories-glob.test.ts` and `vitest.config.ts`'s
storybook project.
