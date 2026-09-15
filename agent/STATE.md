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

**KN-343 is closed on earlier work** (board f1b9394): its exit was already met by KN-415's
2b5b205, the compact Contact Card's mail an Icon Button link with a mailto href that
`WritingToThem` reads, measured on 2026-09-15 as an `A` 32 by 32 beside the delete, and nothing was
changed. Its roast found the mailto built from the raw address in both layouts, so an address
holding `?` or `#` breaks the link: filed as a low child of KN-026, the card after KN-624.

**KN-338 is closed and its roast recorded, nothing filed** (d8ba566, 52be8ff): the Status Picker's
add chip stands outside its radio group in a row of inline flow, the group an inline element and
each radio and the chip an inline item with 8 after and below it. Built in the page first and read
from Chromium's own accessibility tree through the DevTools protocol; `display: contents` was not
used because Safari's handling of it cannot be checked here. **KN-624**, low, filed from building
it: components hand their click event to callbacks typed to take nothing, and Storybook warns
"Accessing the Story Store is deprecated" while its channel serializes it.

**KN-336, KN-335, KN-332 and KN-331 are closed and recorded.** KN-024's whole-task round filed
**KN-623**, its docs' claim that the order is read out; its motion finding is KN-350's.

**Rounds waiting**: **KN-018 on KN-621 and KN-622**; **KN-024 on KN-623**; **KN-025 on KN-620**;
KN-020 on KN-339, KN-383 and KN-624; KN-026 on KN-384, KN-385 and the mailto card.
**Filed today and open**: KN-615, KN-617 to KN-625.

**Still open from earlier**: **KN-009 waits on KN-614**; KN-021 waits on KN-387; KN-022 on KN-327,
KN-615, KN-616 and KN-619; KN-012 on KN-333, KN-334 and KN-357. KN-612 and KN-613, low.

**A Storybook spec alone**: `STORYBOOK_DIR=<build> npx playwright test --config
playwright.storybook.config.ts storybook/button-touch`. A filter is a regular expression on
the path, and a backslash in one is eaten on the way through npx.

**What fails in a full run**: the Job Card's `Pressed`, and at times ContactCard's
`Full On A Phone`, in parallel only, KN-365's kind: rerun a lone failure alone. `App.tsx`
line 107 is uncovered, KN-491's. `RemoteAuthProvider.tsx` and AuthScreen's live branches
run in no test, KN-503's. The API's gate fails on `extraction.service.ts`, KN-486.
`session.test.ts` can overrun its 5 seconds while a story run or lint loads the machine, KN-551,
seen again on 2026-09-15: rerun the file alone, then the unit project. `two-tabs.spec.ts`'s second
test, KN-601. DESIGN.md holds seven older em dashes, KN-083's. The board screen's six commented
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

**KN-345 is in progress**, medium, 1 point, a child of KN-028: a Modal given a blank title has no
accessible name. Planned, the plan beside `Modal.tsx`, its Codex plan review running when this was
written, `kn345-plan-review.log` in the scratchpad. The plan: the Modal reports a blank title
through `shared/console-guard.ts`'s `report`, from an effect keyed on the title, as the Tooltip,
the Icon Button and the Checkbox report misuse, and a story `ReportsABlankTitle` captures the
report with `passOnUnmarked`. The card's exit asks for a refusal by the type or a thrown error in
development: the type cannot see a runtime title, and nothing in `apps/web/src` throws in
development only, so the plan asks the review and, if it agrees, edits the exit with the reason.
`PanelModal` has the same gap and is to be filed as its own card. HEAD drift of `Modal.tsx`, its
stories and both docs is 0.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md` (the modals), `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo show KN-345`, its plan beside `Modal.tsx`, `Modal.tsx`,
`Modal.stories.tsx`, `shared/console-guard.ts`, and the Tooltip's `ReportsATriggerThatCannotAttach`.
**Never chain a check through a pipe into a commit or a close, give every parallel command its own
`cd` in a subshell, give a search that finds nothing a positive control, find a docs paragraph by
its headings rather than by retyping Persian, find a story's controls inside `#storybook-root`,
read an accessibility claim from the browser's own tree through the DevTools protocol, and write
long scripts with the Write tool.**
