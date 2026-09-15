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

**KN-313 is closed** (fa5c0e8; board 1f36f9e; pushed). The Icon Button's hover fill and icon
colour sit under `@media (hover: hover)`: a tap on a touch screen leaves `:hover` on what was
tapped, and MUI resets its own hover only in the style it gives a button with a ripple,
which this one has not. **`e2e/storybook/icon-button-touch.spec.ts`** runs in the Storybook
check against the production build, the Pages workflow's own: in Playwright's Pixel 7 it
taps each tone and reads what it drew at rest, `:hover` left on it, and with desktop Chrome
it hovers each and reads the fill. Against a build of the code before the fix, made into the
scratchpad, its touch test failed. `IconButton.tsx` keeps its 50 lines of formatting drift:
its `sx` body sits two spaces deeper than Prettier's, so a changed line stays one line there
and a comment goes where the file already matches. Its Codex roast was running when this
was written, `kn313-task-roast.log` in the scratchpad.

**KN-312 is dropped**: the file draws the Icon Button's hover over 120 ms ease out, read
with use_figma, not the 300 its exit asked, which DESIGN.md's motion paragraph sets aside,
and **KN-350** carries every built component's reactions; the reading is a note on KN-350.

**KN-304 is closed and its roast recorded** (bdac52f): a focused tab's ring paints over its
line, and the storybook runner's page is 1440 by 900, so a story is drawn one to one where it
was drawn at 0.8. Its roast filed **KN-611**, low, the pixel read taking the tab's middle
column only. **KN-257** (ab5168f) left **KN-610**, low; **KN-230** left **KN-609**, low.
Earlier today KN-228, KN-216, KN-215, KN-586, KN-427 and KN-587 left KN-597 to KN-608.
**Open and filed today**: KN-592 to KN-611.

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

**When KN-313's roast lands**, judge it, file survivors as its children (`--area web
--okr OKR-1` for anything under four points), record with `todo roast KN-313 --file ...
--filed ... --dismissed ...`, relay it to the owner, and commit the rendered board. KN-313
is a child of KN-014, which waits on KN-378 as well.

**KN-318 is next**, medium, 1 point, web: the Button's hover fill stays after a tap on a touch
screen, KN-313's sibling. The same shape should fit, measured first: which rules in
`Button.tsx` draw a hover across its styles and states, whether MUI's Button reset is
ripple-only as the IconButton's is, and which Button story renders unpinned; the probe is
`kn313-probe.mjs` in the scratchpad, and the check can grow beside
`e2e/storybook/icon-button-touch.spec.ts`. A production Storybook build takes about two
minutes and can be made into the scratchpad with `STORYBOOK_DIR` pointing the check at it.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md` (the Button family), `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo show KN-318`, `apps/web/src/shared/button/Button.tsx` and
`apps/web/e2e/storybook/icon-button-touch.spec.ts`. **Never chain a check through a pipe
into a commit or a close, give every parallel command its own `cd`, sum a breakdown before
writing its total, and give a search that finds nothing a positive control.**
