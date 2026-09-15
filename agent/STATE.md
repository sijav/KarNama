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

**KN-427 is closed** (084fa51, pushed; board d7766b5). JobsScreen's 24 stories take
97 of 97 functions and 155 of 161 branch arms of `JobsScreen.tsx`, where they took
113 of 163; the six arms left, lines 89, 195, 203, 218, 580 and 704, each carry a
comment naming the state and why no reader reaches it, 704's measured three times
in the dev Storybook. DragAndDrop's play dispatches the browser's own drag events.
New stories PeopleInFull, PersonForAJobDeletedElsewhere and WithoutSigningOut; `save`
and the contact modal's record rewritten so two unreachable arms are gone. Its Codex
roast was running when this was written, `kn427-task-roast.log` in the scratchpad,
and so was the Pages run for 084fa51.

**KN-598, filed by KN-427's new story**, low: the contact modal keeps a job
opportunity another tab deleted, so MUI warns of an out-of-range Select value and
the field shows the raw id. PersonForAJobDeletedElsewhere allows that one warning,
TECH-DEBT.md section 22, which KN-598's exit removes.

**KN-587 is closed and its roast recorded** (c7698a3, board a00e60e): **KN-597**,
low, the sign-in screen's focus mark outlives a `changeNumber` the live provider
ignores while a request is out. Its Pages run passed. AGENTS.md section 7 now holds
KN-587's lessons: `holdClock` for a play that must reach a timer's end, Playwright's
clock before the first navigation, and a Codex roast that cannot run Vitest.

**Open and filed today**: KN-592 to KN-598.

**What fails in a full run**: the Job Card's `Pressed` in parallel only, KN-365's
kind. `App.tsx` line 107 is uncovered, KN-491's. `RemoteAuthProvider.tsx` and
AuthScreen's live branches run in no test, KN-503's. The API's gate fails on
`extraction.service.ts`, KN-486. `session.test.ts` can overrun its 5 seconds while
a story run loads the machine, KN-551. DESIGN.md holds seven older em dashes,
KN-083's. The board screen's six commented arms stay untaken by design, KN-427.

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

**When KN-427's roast lands**, judge it, file survivors as children of KN-427
(`--area web --okr OKR-1`), record with `todo roast KN-427 --file ... --filed ...
--dismissed ...`, relay it to the owner, and commit the rendered board.

**KN-586 is next**, high, 5 points: the sign-in code step has one field where Auth
Code `407:6972` and `407:7043` draw a Code Row, `407:6981`: five boxes filling the row
8 apart, 56 tall, radius md, `bg/surface` with one pixel of `border/default`, the
current box two pixels of `border/focus`, each digit 20 SemiBold in `text/primary`,
centred, in the reader's digits. The exit asks for typing, pasting, the phone's
one-time-code autofill and Backspace across the boxes, one field a screen reader
meets, and the sign-in stories and e2e signing in through it. It is a component of its
own: read the file's Components page for one before planning, and the boxes' strokes,
text and reactions with use_figma.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md` (sections 1, 2 and 8), `agent/RALPH.md`, the head
of `agent/TODO_BOARD.md`, then `todo show KN-586`, `AuthScreen.tsx`, its stories, the
Input component and `e2e/sign-in.spec.ts`.
