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

**KN-318 is closed** (3da53b9; board 4236843; pushed). The Button's own hover sits under
`@media (hover: hover)` while KN-316's forced `data-state="hover"` draws on every device,
both before the pressed rule. `e2e/storybook/button-touch.spec.ts` runs in the Storybook
check: in Playwright's Pixel 7 it taps the Matrix story's fifteen enabled Buttons and reads
each fill and text as at rest, **skipping with its reason if a tap leaves no `:hover`**, and
with desktop Chrome it hovers each until its fill changes. Against a production build of
the code before the fix, made into the scratchpad, the touch test failed. Its Codex roast
was running when this was written, `kn318-task-roast.log` in the scratchpad.

**KN-313 is closed and its roast recorded** (fa5c0e8): the Icon Button the same way, with
`e2e/storybook/icon-button-touch.spec.ts`. Its round filed **KN-612**, low, the comment
saying the device can hover where `(hover: hover)` reads the primary input only, and
**KN-613**, low, its touch check failing rather than skipping if a tap stops leaving
`:hover`, which would stop the Storybook publishing while the button is right: first
dismissed as the check's control, filed when KN-318's plan review raised it again.
**KN-312 is dropped** into KN-350, the Icon Button's reaction being 120 ms ease out.

**KN-304 is closed and its roast recorded** (bdac52f): a focused tab's ring over its line,
and the storybook runner's page at 1440 by 900 so a story is drawn one to one. Its roast
filed KN-611. KN-257 left KN-610, KN-230 left KN-609. **Open and filed today**: KN-592 to
KN-613.

**Running a single Storybook spec**: `STORYBOOK_DIR=<build> npx playwright test --config
playwright.storybook.config.ts storybook/button-touch`. A filter is a regular expression
matched against the path: `button-touch` alone also matches `icon-button-touch`, and a
backslash in one is eaten on the way through npx.

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

**When KN-318's roast lands**, judge it, file survivors as its children (`--area web
--okr OKR-1` for anything under four points), record with `todo roast KN-318 --file ...
--filed ... --dismissed ...`, relay it to the owner, and commit the rendered board.

**KN-319 is next**, medium, 1 point, web: in the derived dark palette a pressed Destructive
button is brighter than its default. **It is KN-009's last open child**, so when it closes,
KN-009 is roasted together with all its children. Its description says the three danger
fills go through `deriveDarkSurface`; `darkMode.ts` now derives them with `accentFill`,
walking each darker until white reads on it, KN-108, so measure the three dark fills, their
order of lightness and their contrast with `text/on-accent` before planning, and re-point the
card if its premise has moved.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md` (its dark mode paragraphs), `agent/RALPH.md`, the head
of `agent/TODO_BOARD.md`, then `todo show KN-319`, `apps/web/src/theme/darkMode.ts` and
its test. **Never chain a check through a pipe into a commit or a close, give every
parallel command its own `cd`, sum a breakdown before writing its total, and give a search
that finds nothing a positive control.**
