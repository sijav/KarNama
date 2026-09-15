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
KN-515, KN-516, KN-517. **Asked in chat on 2026-09-15, not answered**: whether the
Search Bar and the Sort Control take KN-275's `border/control`; `DESIGN.md` records
the question beside the decision of KN-273.

**KN-505 is closed** (7e7e879, the owner's instruction of 2026-09-15): the app's
addresses are paths under the base, `/KarNama/jobs`, `/add` and `/network`; the
build writes `404.html`, `jobs.html`, `add.html` and `network.html` beside
`index.html`; an old `#/network?from=a` is replaced by its path. Checked on the
live site after Pages run 34920990647: each page 200 with no redirect,
`/KarNama/nowhere` 404, `/KarNama/#/network` landing on `/KarNama/network`, in
English and Persian. Its roast filed **KN-579** (closing the add flow pushes
`/jobs` over `/add`, so Back reopens it), **KN-580** (the board's own add buttons
never write `/add`) and **KN-581** (a `KARNAMA_BASE` without its slash reads every
page as the board).

**KN-226**, the check that the published Storybook renders without errors, waits
on KN-494 alone. Its plan, `apps/web/e2e/storybook/#KN-226 - ....md`, weighs
`@storybook/test-runner` with `--failOnConsole` (a new dependency, the owner's yes
to install), a `webServer`, no Docs pages and an explicit timeout.

**Closed on 2026-09-15**, pushed and roasted by Codex: KN-554, KN-560, KN-561
(KN-566), KN-562 (KN-568), KN-563 (KN-569), KN-255 (KN-575), KN-570, KN-275
(KN-576), KN-279 (034e1b4, the selected Filter Chip's `border/selected` edge;
KN-578) and KN-505 (KN-579 to KN-581).

**`node agent/scripts/storybook/controls-sweep.mjs [--only <regex>]`**, committed
by KN-255, measures which stories' offered controls break their plays: 121 broken
on the tree after KN-570, carried by **KN-571 to KN-574**. It reads
`control.disable`; it does not yet report unapplied or untried changes, KN-575.

**How to measure the published Storybook**: build with `KARNAMA_STORYBOOK_BASE` in
Node's own `env`, never on a Git Bash command line, or build at the root without
it, when `import.meta.env.BASE_URL` compiles as `./`; hear the end on
`window.__STORYBOOK_ADDONS_CHANNEL__` hooked by a property setter;
`playFunctionThrewException` for a thrown play. A story's pinned globals beat URL
globals: look at dark through an unpinned story.

**What fails in a full run**: the storybook project fails KN-494's five stories,
AddJobModal `Review` among them, and the Job Card's `Pressed` in parallel only,
KN-365's kind. The API's coverage gate fails on auth and extraction files, KN-486.
`App.tsx` line 107, the provider's error above the page, is uncovered, KN-491's.

## The owner's rules, most recent first

- **2026-09-15.** "Bro GitHub pages do work with normal deep linking routing like
  ../daramad-name": real paths, a page per destination so each answers 200, and
  `404.html` for anything else, taken right after KN-279.
- **2026-09-14.** The board is the todo skill's database, and `agent/board.json`
  is its archive. The shared skills serve ALL projects: a change only adds, and
  is checked against a copy of every board on the machine. A model's work is
  never roasted by that model. A suggestion is not a directive. Flags come from a
  package. Settings and a phone's sign out do not exist in Figma, so they are
  invented, as icons. "It should look like the figma." The owner reads on a
  phone: literal truth, no excuses. An instruction carries its date, and a later
  one overrides an earlier.
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

## The next step

**KN-460 is in progress**, high: the mock's sign-in code rides in `AuthValue`, the
contract a real provider fills. The plan, beside `src/core/auth/AuthProvider.tsx`,
takes `mockCode` out of `AuthValue` and gives the code through a context private to
the mock, `{ auth, code }`, which `useMockCode()` hands out only to a reader of the
mock's own value, so a provider mounted inside the mock cannot show it. Codex found
it sound, the comparison needed, and asked that `connected.spec.ts`, which already
expects no notice in live mode, be run as well.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
