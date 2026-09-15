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
in the backlog on KN-494 alone now. Its plan, `apps/web/e2e/storybook/#KN-226 -
....md`, measured eleven failing entries in a production Storybook; Codex ruled
out letting them through on a list. The replan weighs `@storybook/test-runner`
with `--failOnConsole` (a new dependency, the owner's yes to install), a
`webServer`, no Docs pages, an explicit timeout and the channel hooked by a
property setter. KN-559 and a note on KN-063 came from the same measurement.

**Closed on 2026-09-15**, each a story failing only in a production Storybook,
pushed and roasted by Codex: **KN-554** (bb953c8) IconButton `BlankName`;
**KN-560** (481b66c) App/Shell `SignedInInAnotherTab`, with KN-564 and KN-565
filed on the way; **KN-561** (bfeafa6) Button `States`, roast filed KN-566;
**KN-562** (abd9c82) the Input's English twin, roast filed KN-568; **KN-563**
(83877dc) SettingsDialog `Preferences`: an `updateArgs` during a play renders the
story again at once and that render's loaders restore every `fn()`, so the story
sets `parameters.test.restoreMocks` false and its play clears the mocks first.
Its roast found nothing. **KN-569** carries Preferences failing when played again
in one session, its first play's args kept, and under `colorScheme` dark.

**How to measure the published Storybook**: build with `KARNAMA_STORYBOOK_BASE` in
Node's own `env`, never on a Git Bash command line; serve under that base; fetch
what `iframe.html` names first; open `iframe.html?id=<id>&viewMode=story`, or
`index.html?path=/story/<id>` for the manager; hear the end on
`window.__STORYBOOK_ADDONS_CHANNEL__`, hooked by a property setter:
`playFunctionThrewException` for a thrown play, whose `storyFinished` still says
`success`. `__STORYBOOK_PREVIEW__.onForceRemount({ storyId })` replays a story.
The scratch scripts are this session's.

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

**KN-255 is in progress**: stories whose offered controls make their play
functions untrue. Measured on 2026-09-15 with KN-247's sweep generalised to every
story of a production Storybook of 83877dc, each offered control changed by its
type through URL args, verdict the errored phase or `playFunctionThrewException`:
372 stories in 438 seconds, 362 with a play, **155 broken by a control they
offer, in 35 files**. The card was re-pointed to the five components it named,
Checkbox (6 stories), FilterChip (6), StatusChip (4), PreferencesProvider (2) and
the Tooltip, which no longer breaks but offers `children` and `icon` as JSON; the
rest are **KN-570** JobsScreen, **KN-571** the modals, **KN-572** the cards and
board, **KN-573** the form controls, **KN-574** navigation, language and tokens.
Its exit's repository guard was dropped under rule zero, with a note; the rule
goes into `AGENTS.md` section 4 in words. Next: the plan beside the work, then
Codex. The sweep, `kn255-sweep.mjs`, is scratch; the plan weighs committing it,
since six cards' exits name it. The Docs page's Controls follow the primary
story, the first export, so restricting that story's controls empties the page's.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
