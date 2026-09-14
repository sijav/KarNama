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
in the backlog on KN-494 and KN-563, the last two of its blockers. Its plan,
`apps/web/e2e/storybook/#KN-226 - ....md`, measured eleven failing entries in a
production Storybook, and Codex ruled out letting them through on a list: the
exit condition fails on any console error, so the check would stop every deploy.
The replan weighs `@storybook/test-runner` with `--failOnConsole` (a new
dependency, the owner's yes to install), a `webServer`, no Docs pages, an explicit
timeout and the channel hooked by a property setter. The same measurement filed
KN-559 and a note on KN-063: 34 entries fail accessibility in production.

**Closed on 2026-09-15**, each a story failing only in a production Storybook,
pushed and roasted by Codex:
- **KN-554** (bb953c8): IconButton `BlankName` waits for its report. Nothing filed.
- **KN-560** (481b66c): App/Shell `SignedInInAnotherTab` waits for the providers'
  storage listeners. Nothing filed; KN-564 and KN-565 filed on the way.
- **KN-561** (bfeafa6): Button `States` records its matrix in a layout effect.
  Its roast filed KN-566, words that claim a paint.
- **KN-562** (abd9c82): the Input's render reads its specimen through `i18nFor` of
  the story's globals, not the shared singleton `AppProviders` switches after the
  render. Its roast filed **KN-568**, the docs saying the English twin follows the
  toolbar it pins; filed under KN-013, since KN-562 is KN-013's child. KN-567
  carries the other story renders that read the singleton.

**How to measure the published Storybook**: build with `KARNAMA_STORYBOOK_BASE` in
Node's own `env`, never on a Git Bash command line; serve under that base; fetch
what `iframe.html` names first; open `iframe.html?id=<id>&viewMode=story`, or
`index.html?path=/story/<id>` for the manager; hear the end on
`window.__STORYBOOK_ADDONS_CHANNEL__`, hooked by a property setter:
`playFunctionThrewException` for a thrown play, whose `storyFinished` still says
`success`. React's production bundle prints no dev warnings. The scratch scripts
are this session's.

**What fails in a full run**: the storybook project fails KN-494's five modal
stories, and the Job Card's `Pressed` in parallel only, KN-365's kind. The API's
coverage gate fails on auth and extraction files, KN-486. KN-551:
`core/api/session.test.ts` can fail straight after storybook browser runs, and
passes alone.

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

**KN-563 is in progress**: SettingsDialog's `Preferences` fails in a production
Storybook, `expected "onLocaleChange" to be called with [ 'fa-IR' ]`, no calls.
The cause, confirmed on 2026-09-15: the story's handler calls the args' spy, then
`updateArgs`; an args update during a play renders the story again at once
(`onUpdateArgs` and `rerender` in Storybook 10.5.10's `preview/runtime.js`), and
that render's loaders include `resetAllMocksLoader`, whose `restoreAllMocks()`
clears the call before the play reads it. The Vitest runner applies no args
update, so it never shows. A build with only `parameters.test.restoreMocks:
false` added to Preferences passed bare and inside the manager, every step. The
plan beside the story weighs keeping the mocks across the story's renders
against a record the story keeps itself; Codex reviews it before the build.

That second render also runs `beforeEach` again, so `withOwnStorage` stands a
fresh memory storage in mid-play, and `afterEach` and `storyFinished` fire for
it; the play is not run again.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
