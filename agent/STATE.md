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

**The owner's asks of 2026-09-14 are done**: KN-479 flags, KN-480 the language
Select in Settings, KN-478 the shell's controls as Icon Buttons, KN-481 the board
and network matched to their frames. **Blocked on the owner, asked 2026-09-14**:
KN-515, KN-516, KN-517. **Asked in chat on 2026-09-15**: whether the Search Bar and
the Sort Control take KN-275's `border/control`; `DESIGN.md` records the question
beside the decision of KN-273.

**KN-226**, the check that the published Storybook renders without errors, waits
on KN-494 alone. Its plan, `apps/web/e2e/storybook/#KN-226 - ....md`, weighs
`@storybook/test-runner` with `--failOnConsole` (a new dependency, the owner's yes
to install), a `webServer`, no Docs pages and an explicit timeout.

**Closed on 2026-09-15**, pushed and roasted by Codex: KN-554, KN-560, KN-561
(KN-566), KN-562 (KN-568), KN-563 (KN-569), **KN-255** (97ce2e9: five components'
stories offer only the controls their plays hold for; roast filed **KN-575**,
the sweep reading a dropped URL arg or an unstarted play as clean), **KN-570**
(34c1124: the Jobs screen offers no `addOpen`; nothing found) and **KN-275**
(8ee298d: `border/control`, `#7f8694` light and `#707786` dark, the resting edge of
the Input, the Checkbox and the Select, their disabled edges kept on
`border/default`; `KN-004.mjs`, already failing at HEAD on three hexes, fixed;
its roast filed **KN-576**, the decision's sentence that a disabled control keeps
the file's edge, which a disabled Input in error does not).

**`node agent/scripts/storybook/controls-sweep.mjs [--only <regex>]`**, committed
by KN-255, measures which stories' offered controls break their plays: 121 broken
on the tree after KN-570, carried by **KN-571 to KN-574**. It reads
`control.disable`; it does not yet report unapplied or untried changes, KN-575.

**How to measure the published Storybook**: build with `KARNAMA_STORYBOOK_BASE` in
Node's own `env`, never on a Git Bash command line, or build at the root without
it; hear the end on `window.__STORYBOOK_ADDONS_CHANNEL__` hooked by a property
setter; `playFunctionThrewException` for a thrown play. A story's pinned globals
beat URL globals: look at dark through an unpinned story.

**What fails in a full run**: the storybook project fails KN-494's five stories,
AddJobModal `Review` among them, and the Job Card's `Pressed` in parallel only,
KN-365's kind. The API's coverage gate fails on auth and extraction files, KN-486.

## The owner's rules, most recent first

- **2026-09-14.** The board is the todo skill's database, and `agent/board.json`
  is its archive. The shared skills serve ALL projects: a change only adds, and
  is checked against a copy of every board on the machine. A model's work is
  never roasted by that model. A suggestion is not a directive. Flags come from a
  package. Settings and a phone's sign out do not exist in Figma, so they are
  invented, as icons. "It should look like the figma." The owner reads on a
  phone: literal truth, no excuses.
- **2026-09-12, to Codex, still standing.** Mock the login for now. Keep the
  sample data and the AI extraction. Do not change a layout nobody asked to
  change. Commit and push after work. Never ask the owner to redeploy when
  nothing changed.
- **2026-09-11.** Push after every close: commit, close, push, then roast. Only
  new component cards and their blockers are `critical`; a finding on a built
  component is `high` or lower. No proof at the close: test what changed,
  stories, unit tests, lint, tsc, look at it, close with one line. Roasts stay. A
  finding about the loop is `low` unless it breaks the work. 100 percent coverage
  is a product rule. **Do not invent gates**, rule zero of `agent/RALPH.md`.
- **A finding is a CHILD of its task**, one level, `todo add --parent-task`, with
  `--area` and `--okr`. **Plans live beside the work**, `#<id> - <title>.md`,
  checked by `roast.py plan` from the repository root before building, and they
  stay. Write long scripts with the Write tool.

**KN-279** (034e1b4) is closed: `border/selected`, `#2563eb` light and `#3670ed`
dark, a selected Filter Chip's one pixel edge, told from pressing by width, 1.5
against 1, in a story that holds a real Space; **its roast is running**, scratch
`kn279-roast.log`.

**KN-505 is in progress, critical by the owner's instruction of 2026-09-15**: "Bro
GitHub pages do work with normal deep linking routing like ../daramad-name", and
asked when, "Right after KN-279". The app routes by hash on the false claim in
`routes.ts` that Pages cannot serve a deep link; `pages.yml` has copied
`index.html` to `404.html` since KN-051. Measured on the live site:
`/KarNama/network` answers 404 with the app, `/KarNama/404` answers 200 from
`404.html` with no redirect, `/KarNama/storybook` answers 301 to a trailing slash.
So the build writes `jobs.html`, `add.html` and `network.html`, each 200. The plan
is beside `src/app/routes.ts`, going to Codex. KN-577 was its duplicate, dropped.

## The next step (earlier in this iteration)

**KN-279 is in progress**: the selected Filter Chip's blue edge, the owner's
decision of KN-276. Measured: `#2563eb` is 4.82, 5.17 and 4.70 on the light
backgrounds and 4.24 on the selected fill; the dark `border/focus`, `#3670ed`, is
3.48, 3.04, 3.57 and 3.33 on the dark fill. The selected edge is the pressed edge's
colour, so the plan, beside `FilterChip.tsx`, makes `border/selected` a role of its
own and tells pressing apart by width, one pixel against 1.5, which may be too
little to see. Codex's plan review found it sound: width is a difference the exit
names, and more would need the owner; hold Space only after `vitest/browser`'s own
click, since the runner's keyboard may not act on a control focused otherwise.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
