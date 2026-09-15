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
KN-518**, not yet asked: KN-588 (the signup's skip against the required name),
KN-589 (the frames' text-message promise while the provider is mocked), KN-590
(terms and privacy pages that do not exist), KN-591 (the note's 2.54 to one).

**KN-533 is closed** (ff0542f, board d001af5, pushed). On a phone the network's
full Contact Card takes the job card's held press: `useHold` moved to
`shared/hold`, the card takes `phone` and `selecting`, the hold starts only on the
name's own button, and every phone card shows its checkbox while anyone is
chosen. Stories: the Contact Card's three phone stories, the network page's
`SelectingOnAPhone` at 390 by 844, and App/Shell's `Selecting`, which now also
holds a person on the phone's network. Its Codex roast was running when this was
written, and so was the Pages run for ff0542f, 34935295842. **A leftover it
made**: its three phone stories and the `phone` and `selecting` controls it added
break under Controls, AGENTS.md section 4's KN-255 rule, which is KN-572's scope
for the Contact Card file; noted there.

**KN-518 is closed** and its roast recorded (6db4a5b, its finding folded into
KN-461); the Pages run for 26d768d passed. The frames' code boxes are **KN-586**
and the countdown with a change of number **KN-587**, both high. **KN-226** is
closed and proven on ubuntu-latest. **KN-585**, medium: Input's
`TypingIntoABoundValue` loses keys only on a page slowed four times. **KN-569**
covers seven stories whose second play fails.

**How to measure the published Storybook**: build with `KARNAMA_STORYBOOK_BASE`
from PowerShell or Node's own `env`, never a Git Bash line; a play's end is the
`storyFinished` after `played` or `errored`. The scratchpad's `kn584-probe.mjs`
takes `WORKERS`, `REPEAT`, `THROTTLE`, `ONLY` and `REMOUNT`; `kn518-look.mjs`
screenshots the sign-in steps from a production build.

**What fails in a full run**: the Job Card's `Pressed` in parallel only, KN-365's
kind. `App.tsx` line 107 is uncovered, KN-491's. The API's gate fails on
`extraction.service.ts`, KN-486.

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

**KN-571 is in progress**, high, 3 points: the AddJobModal, JobModal,
ContactModal, ChangeStatusModal, ConfirmModal and Modal stories offer open, step,
tab and mode controls that break their plays. Each play story offers only the
controls its play holds for, reads its expectations from its args, or disables
the panel and says why, as the Checkbox, Filter Chip and Input stories do; measure
with `agent/scripts/storybook/controls-sweep.mjs` on a production Storybook.
AddJobModal's Review also fails on its size inside the manager, KN-559. Write the
plan beside the work in `shared/modal`, have Codex review it, then build. Judge
and record KN-533's roast when it lands, and read the Pages run for ff0542f to its
end.

## What to read first

`AGENTS.md` (sections 4 and 7), `DESIGN.md`, `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo show KN-571` and the six story files.
