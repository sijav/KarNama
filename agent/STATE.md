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

**KN-587 is closed** (c7698a3, pushed; board 8cfafe1): under the code step's
action the Resend Timer counts down the API's minute in the reader's digits and
becomes a Footer Link «ارسال دوباره‌ی کد» at zero, the build's reading since the
file draws no end to it; «ویرایش شماره» returns to the number step with the
number kept and focused. The mock now gives `retryAt` and refuses an early resend;
`AuthValue` has `changeNumber`. Stories 18 of 18, unit 1477 of 1477, sign-in e2e 10
of 10. Its Codex roast was running when this was written, `kn587-task-roast.log`
in the scratchpad, and so was the Pages run for c7698a3. KN-591 was noted that the
timer shares the Terms Note's 2.54 to one, and KN-503 that the live provider's
`changeNumber` and the screen's restoring, error and busy branches run in no test.

**KN-574's roast is recorded** (da07398): **KN-596**, low, the Sidebar's Default and
InEnglish plays take the aside's second child for its User Row unchecked; filed
under KN-011, since KN-574 is itself KN-011's child. 74f5f0d's Pages run passed,
which holds KN-574; 5b343bc's own run was cancelled by that push.

**Learned in KN-587, to add to AGENTS.md section 7 once its roast lands** (the roast
may be reading AGENTS.md now):

- A play that must reach the end of a timer holds `Date.now` with `holdClock`,
  `shared/story-fixtures/clock.ts`. user-event, testing-library's `waitFor`,
  Storybook's instrumenter, React's scheduler and Vitest read no `Date.now` at call
  time, checked in node_modules; a component reading the clock on an interval shows
  the move at its next look, so the play waits with `findBy`.
- Playwright's `page.clock.install()` goes before the first navigation, in the
  spec's `beforeEach`; `runFor` fires a repeating interval, `fastForward` each due
  timer once.

**Open and filed today**: KN-592, KN-593, KN-594, KN-595, KN-596.

**What fails in a full run**: the Job Card's `Pressed` in parallel only, KN-365's
kind. `App.tsx` line 107 is uncovered, KN-491's. `RemoteAuthProvider.tsx` and
AuthScreen's live branches run in no test, KN-503's. The API's gate fails on
`extraction.service.ts`, KN-486. `session.test.ts` can overrun its 5 seconds while
a story run loads the machine, KN-551; alone it passes. DESIGN.md holds seven older
em dashes, KN-083's.

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

**When KN-587's roast lands**, judge it, file survivors as children of KN-587
(`--area web --okr OKR-1`), record with `todo roast KN-587 --file ... --filed ...
--dismissed ...`, relay it to the owner, add the two lessons above to AGENTS.md
section 7, and commit them with the rendered board.

**KN-427 is next**, high, 5 points: JobsScreen leaves 52 of its 149 branch arms to
no story, 26 of them the drag handlers KN-477 added, which the DragAndDrop story has
no play for. Its note of 2026-09-14 lists the other 26 by line; the lines have moved
since KN-422 and KN-477. The exit: every branch of `JobsScreen.tsx` is taken by a
story or carries a comment saying which state it belongs to and why no reader can
reach it. Measure first, as KN-587 did: the storybook project on
`JobsScreen.stories.tsx` with `--coverage.include=src/screens/JobsScreen.tsx
--coverage.reporter=json --coverage.reportOnFailure=true`, and list the untaken arms
from `coverage-final.json`.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md` (section 8), `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo show KN-427`, `JobsScreen.tsx` and its stories.
