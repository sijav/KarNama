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

**Closed on 2026-09-15**, pushed and roasted by Codex: KN-554, KN-560, KN-561
(roast filed KN-566), KN-562 (roast filed KN-568), KN-563 (an `updateArgs` during
a play renders the story again at once and its loaders restore every `fn()`;
KN-569 carries its replay), **KN-255** (97ce2e9: the Checkbox, FilterChip,
StatusChip, Tooltip and PreferencesProvider stories offer only the controls their
plays hold for; roast filed **KN-575**, the sweep reading a dropped URL arg or an
unstarted play as clean) and **KN-570** (34c1124: the Jobs screen's stories no
longer offer `addOpen`; roast found nothing).

**`node agent/scripts/storybook/controls-sweep.mjs [--only <regex>]`**, committed
by KN-255, builds Storybook, opens every story and each one with a play once per
offered control changed through URL args, and lists the broken ones and JSON
controls for elements. On 97ce2e9: 373 stories, 362 with a play, 137 broken, now
121 with KN-570's sixteen gone, carried by **KN-571 to KN-574**. It reads
`control.disable`, since `control: false` is prepared as `{ disable: true }`. It
does not yet report unapplied or untried changes, KN-575.

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

**KN-275 is in progress**: a named role for a control's resting edge at 3:1, the
owner's decision of 2026-09-10, KN-273. Measured: `border/default` is 1.24 on
white; `#7f8694`, text/secondary's hue made lighter, is 3.41, 3.66 and 3.32 on
the three light backgrounds; its dark row, derived and walked to 3 against the
dark surface as `border/focus` is, `#707786`, is 3.46, 3.02 and 3.55. The plan,
`apps/web/src/theme/#KN-275 - Add a resting edge role for controls at 3 to 1.md`,
names it `border/control` for the Input, the Checkbox and the Select, and leaves
the Search Bar and the Sort Control, built after the decision, to a card of their
own. Codex is reviewing it; then build, the two plants, the stories, KN-004.mjs,
the contract, and a look in all four combinations.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
