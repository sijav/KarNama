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

**KN-304 is closed** (bdac52f; board 9828274; pushed), two points. A focused tab's ring,
its `::before`, takes `zIndex: 1` over its indicator, the `::after`, which had painted over
the ring's outermost bottom row: grey on a hovered tab, and the brand line on a chosen tab
in dark. `FocusRingOverTheLine` reads the drawn pixels from the runner's screenshot, the
first story that does. **Building found the storybook runner drew every story at 0.8**:
Vitest's orchestrator scales the tester iframe to fit its page, left at Playwright's 1280
by 720, while Storybook gives each story 1200 by 900 and some plays 1440 by 900. The
project's page is 1440 by 900 in `vitest.config.ts` now, and the story refuses a scale
that is not a whole number. With it the storybook project passes 405 of 406, the one
failure JobCard's `Pressed`, which passes alone. **A mistake of mine it recorded**: the plan
first said no story sets a viewport, from a search whose brace glob matched no file, and the
second plan review found the plays that resize to 1440 by 900. AGENTS.md section 7 gained
how lingui's `useTsTypes` reads a call's argument, and the runner's scale. Its Codex roast was running when this was written, `kn304-task-roast.log`
in the scratchpad.

**KN-257 is closed and its roast recorded** (ab5168f): `getComputedStyle` left the lingui
rule's `ignoreFunctions`, and `'^::(before|after|placeholder)$'` is in `ignore`. Its roast
filed **KN-610**, low, the entry's comment calling the three selectors never copy where the
entry passes them as any string, a child of KN-011. **KN-230's roast** filed **KN-609**,
low, the docs guard skipping a callback written as a method, a child of KN-013.

**Earlier today**: KN-228 (f499ea7) filed nothing; KN-216 left KN-607 and KN-608; KN-215
left KN-604, medium, and KN-605 and KN-606; KN-586 left KN-600, KN-601, medium, KN-602 and
KN-603; KN-427 left KN-598 and KN-599; KN-587 left KN-597. **Open and filed today**: KN-592
to KN-610.

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

**When KN-304's roast lands**, judge it, file survivors as its children (`--area web
--okr OKR-1` for anything under four points), record with `todo roast KN-304 --file ...
--filed ... --dismissed ...`, relay it to the owner, and commit the rendered board. KN-304
is a child of KN-023, so a finding hangs off KN-023, which waits on KN-375, KN-376 and
KN-377.

**`todo next` picks KN-312**, medium, 1 point: the Icon Button's hover over 300 ms from a
motion token. **Its exit contradicts DESIGN.md**: the 300 is the prototype map's summary,
and DESIGN.md says the components' own reactions win, 200 ms ease in and out or 120 ms ease
out; its own note of 2026-09-11 says so and names **KN-350**, backlog, medium, 3 points,
which carries every built component's reactions, the Icon Button's included.
`IconButton.tsx` sets no transition, so it keeps MUI's 150. Settle it on the board before
touching a file: drop KN-312 as superseded by KN-350 with that reason, or re-point it to
the Icon Button's own reaction read with use_figma, then run `todo next` again.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md` (its motion paragraph in section 7), `agent/RALPH.md`,
the head of `agent/TODO_BOARD.md`, then `todo show KN-312` and `todo show KN-350`.
**Never chain a check through a pipe into a commit or a close, give every parallel command
its own `cd`, sum a breakdown before writing its total, and give a search that finds
nothing a positive control.**
