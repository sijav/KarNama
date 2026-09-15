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
KN-515, KN-516, KN-517.

**KN-226**, the check that the published Storybook renders without errors, waits
on KN-494 alone. Its plan, `apps/web/e2e/storybook/#KN-226 - ....md`, measured
eleven failing entries in a production Storybook; Codex ruled out letting them
through on a list. The replan weighs `@storybook/test-runner` with
`--failOnConsole` (a new dependency, the owner's yes to install), a `webServer`,
no Docs pages, an explicit timeout and the channel hooked by a property setter.

**Closed on 2026-09-15**, pushed and roasted by Codex: KN-554 (bb953c8), KN-560
(481b66c), KN-561 (bfeafa6, roast filed KN-566), KN-562 (abd9c82, roast filed
KN-568) and KN-563 (83877dc: an `updateArgs` during a play renders the story again
at once and its loaders restore every `fn()`, so Preferences keeps its mocks and
clears them as its play starts; roast found nothing; KN-569 carries its replay).
**KN-255** (97ce2e9): the Checkbox, FilterChip, StatusChip, Tooltip and
PreferencesProvider stories offer only the controls their plays hold for, or read
their args; the Checkbox gained a `Default` first so its Docs page keeps its
controls. **Its roast by Codex is running** (scratch `kn255-roast.log`).

**`node agent/scripts/storybook/controls-sweep.mjs [--only <regex>]`**, committed
by KN-255, builds Storybook, opens every story and each one with a play once per
offered control changed through URL args, and lists the broken ones and JSON
controls for elements. On the tree of 97ce2e9: 373 stories, 362 with a play,
**137 broken, carried by KN-570 to KN-574**, and six failing with nothing changed
(AddJobModal `Review` KN-559, JobModal's four KN-494, Input `Multiline` under
load). It must read `control.disable`, since `control: false` is prepared as
`{ disable: true }` with its inferred type kept.

**How to measure the published Storybook**: build with `KARNAMA_STORYBOOK_BASE` in
Node's own `env`, never on a Git Bash command line; serve under that base; fetch
what `iframe.html` names first; hear the end on
`window.__STORYBOOK_ADDONS_CHANNEL__`, hooked by a property setter;
`playFunctionThrewException` for a thrown play, whose `storyFinished` still says
`success`. `__STORYBOOK_PREVIEW__.onForceRemount({ storyId })` replays a story.

**What fails in a full run**: the storybook project fails KN-494's five modal
stories, and the Job Card's `Pressed` in parallel only, KN-365's kind. The API's
coverage gate fails on auth and extraction files, KN-486. KN-551:
`core/api/session.test.ts` can fail straight after storybook browser runs.

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

## The next step

**KN-570 is in progress**: JobsScreen's sixteen stories with a play fail when
`addOpen` is changed in Controls. The meta sets `addOpen: false` and callbacks,
and no story offers any other editable control. Next: the plan beside
`src/screens/JobsScreen.stories.tsx`, Codex's review, the change, the sweep with
`--only '^screens-jobs--'`, the JobsScreen stories under Vitest, unit, eslint,
tsc, the Docs page in both languages. Then read KN-255's roast when it lands.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
