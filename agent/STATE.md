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

**KN-586 is closed** (709c4e5, pushed; board 548708c). The sign-in code step draws
the Code Input, `shared/code-input`: one real text field, numeric, with the
one-time-code hint and no `maxLength`, laid over five `aria-hidden` boxes 56 tall and
8 apart; the box at the caret takes two pixels of `border/focus`, digits show in the
reader's digits, and a refused code takes the Input's alert line with red resting
edges. `latinDigits` moved from `core/auth` to `i18n/digits.ts`. Its 11 stories cover
`CodeInput.tsx` whole, and the sign-in e2e types the code with real keys, 10 of 10.
Autofill is proven only as far as the field goes: a phone's own suggestion needs the
live text message to name the site's origin, **KN-600**, api, low. Its Codex roast
was running when this was written, `kn586-task-roast.log` in the scratchpad, and so
was the Pages run for 709c4e5.

**KN-601, found while testing KN-586**, medium: `two-tabs.spec.ts`'s second test waits
for the contact modal's 'Full name' and a button no catalog names, where the signup
step says 'First and last name' and 'Start', so it times out on desktop. The spec
came with KN-419, 30f6b8e.

**KN-427 is closed and its roast recorded** (084fa51, board 97ba59d; both Pages runs
passed). The roast confirmed the exit; **KN-599**, low: its drag story, docs and plan
call the synthetic DragEvents the play dispatches the browser's own drag events.
**KN-598**, low, from its new story: the contact modal keeps a job opportunity another
tab deleted, so MUI warns of an out-of-range Select value; PersonForAJobDeletedElsewhere
allows that one warning, TECH-DEBT.md section 22, which KN-598's exit removes.

**KN-587 is closed and its roast recorded** (c7698a3): **KN-597**, low, the sign-in
screen's focus mark outlives a `changeNumber` the live provider ignores while a
request is out.

**Open and filed today**: KN-592 to KN-601.

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

**When KN-586's roast lands**, judge it, file survivors as children of KN-586
(`--area web --okr OKR-1`), record with `todo roast KN-586 --file ... --filed ...
--dismissed ...`, relay it to the owner, and commit the rendered board.

**KN-215 is next**, medium, 1 point, web: `apps/web/eslint.config.js` puts
`'^(props|stories)$'` in `lingui/no-unlocalized-strings`' ignore array, which skips
those two values in every file, so `aria-label="stories"` and `title="props"` pass.
It was written for the story-docs parser's section names; `parse.ts` already types
them as a `Section` union, which `useTsTypes` may exempt without the entry. The exit:
`aria-label="stories"` and `title="props"` fail `npm run lint` in a committed fixture,
the parser still recognises both headings, and the ignore array no longer names
them. The fixtures live in `src/gate-fixtures`, which an ordinary lint run ignores.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md`, `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo show KN-215`, `eslint.config.js`'s `linguiOptions`,
`story-docs/parse.ts`, `src/gate-fixtures/README.md` and
`src/i18n/lingui-ignore.test.ts`.
