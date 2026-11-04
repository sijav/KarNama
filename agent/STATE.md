# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale. The board is the todo skill's
database, `.claude/todo.db`: `node
D:/Kar/Sijav-Skills/Sijav-Clauder/skills/todo/todo.mjs next`, `show <id>`,
`list`, `phase`. What keeps going wrong is `AGENTS.md` section 7.

## The task spec

**KarNama** (کارنما), a job application tracker built by a Ralph loop: a
posting added by link or text becomes a record that carries a status through
the search. **The value is the trail, not the listing**; crawling is out. React
19, MUI 9, Storybook 10, Vitest, Playwright; NestJS, GraphQL, Prisma, Postgres
on **Neon**. The web at **https://kar-nama.ir/** on GitHub Pages, Storybook at
`/storybook/`, the API on Render; lingui with **English ids**. **Components
first with their stories, then screens; match the design exactly.**

## Where things stand, 2026-11-04, noon

**The owner's order: the design, then the backend, then the rest.** OKR-3, the
redesign, has 52 open and 64 done; OKR-4, the backend, follows; then OKR-1 and
OKR-2. Within the design every component card is `critical`, ahead of the
record model (KN-731 to KN-741) and the screens (KN-805 to KN-828); KN-829 reads
the older cards against the redesign last. **`todo next` picks KN-771, the
relationship label picker `1086:3004`.**

**Closed today, among others**: KN-775 the person picker, KN-789 the Change
Status modal, KN-796 the Stats route, KN-848, KN-850 with KN-851 a phone's
header, KN-783 Tab Bar v2, KN-745 the redesigned card `793:1820`
(`shared/kanban-card`), KN-747 the interview slot `656:6291`
(`shared/interview-slot`, 7e418d3), and KN-754 the month calendar `773:16585`
with its day and arrows (`shared/date-picker`, c3cf9dd): Solar Hijri in
Persian, Gregorian in English, Saturday first, Friday `red/500`; and KN-756
the form's date dropdown `774:16896` (d0a7d79), on which the calendar now fills
its container and follows the chosen day; and KN-757 the calendar popover
`774:16705` (1e3773e), sharing the dropdown's shortcuts and footer in
`date-picker/parts.tsx`, with a time field over the time list. KN-847 made the Pages build green; every
push since is green.

**Pieces other cards build on**: `shared/popover`, `shared/date-picker`'s
TimeList (KN-754 and KN-756 join it), `cardFooter`, the grouped status picker,
the modals, `HistoryRow`, the menus, `SearchPicker`, `statusGroups`,
`KanbanCard` and its `interview` slot's `InterviewSlot`. **Adoption is the
screens'**: notes on KN-805, KN-812, KN-816, KN-817 and KN-828 say what each
swaps in; retiring waits on it: KN-842, KN-844, KN-852.

**Open findings on built components, after the new ones**: KN-853, the Kanban
Card's content 244 wide where the frame's edge takes layout space and leaves
242; KN-849, the stale drag-cards e2e spec.

**A phone's header, the owner's answer of 2026-11-04** ("Gear holds the rest"):
the title, the page's action and one settings gear; language and sign out live
in the Settings dialog; the title may be cut to fit.

## Learned, and the traps

- Figma's auto layout can include a stroke in layout
  (`strokesIncludedInLayout`): read it before taking a padding.
- `Math.round` of a hair below zero is `-0`, which `toBe(0)` rejects at a
  fractional zoom: use a helper that returns `|| 0`.
- The browser pane clips a right-to-left page: screenshot stories with the
  repository's Playwright. GitHub's SSH sometimes refuses a good key: retry.
- The lint rule's traps: a string ternary outside `sx`, `i18nFor(x)._()` in one
  expression, a template of words, a letter in a date literal, an unlisted
  class constant (add it to `structuralProps`), a bare style object; type a
  literal as a one-member union, `type Clear = 'rgba(0, 0, 0, 0)'`.
- Read a ref in the handler, not a helper made during render. The runner's
  `userEvent.click(el, { force: true })` hits what is drawn there.
- Git Bash mangles `\\`, long Persian and TSX in a heredoc: use Write.

**CI**: the Pages workflow builds the app and Storybook and runs
`e2e/storybook`'s specs. Watch a run in the background with `gh run watch`; a
lost connection ends the watch early, so read `gh run view <id>` after it.

**The redesign** is in Figma `K1EP8GCOmelU8o4vPR7a9f`, Screens `5:7`, with the
handoff in `DESIGN-HANDOFF.md`; read the instances on the screens for real copy
and sizing, and a variant's reactions for motion.

**The backend is not done**: the live API answers with
`access-control-allow-origin https://sijav.github.io`. KN-836 lets the code
allow `https://kar-nama.ir`; KN-834 verifies the path once the owner sets
Render's WEB_ORIGIN and Cloudflare's Always Use HTTPS.

**Roasts** run on Sonnet 5.5 through the claude CLI,
`agent/scripts/roast-sonnet.py`, which passes `--remote-control`, one session
per kind. Each closed card is roasted in the background to `.claude/roasts/`;
**none is judged until every to-do is done**. Every closed card through KN-747
has its record, through KN-756, and KN-757's was running at this writing; the
scratchpad's `roast-757.py` shows the arguments.

## What fails, and which failures are known

`npm test` exits 1, none of it new: KN-551's `session.test.ts` two, KN-699,
KN-365's parallel pointer, KN-486's database timeouts. Several story files share
one page, so a story never asks for something page-wide. **Search the board
before filing a failure.**

## Drift, and the method

Drift is Prettier's, from the file's real path: `prettier --stdin-filepath
<path> < <file> | diff <file> -`. A new file measures 0; hold each baseline:
`DESIGN.md` 224 with 9 em dashes, `AGENTS.md` 0, `agent/RALPH.md` 5,
`App.stories.tsx` 13, `JobsScreen.stories.tsx` 2. The catalogs and
`eslint.config.js` are not Prettier's at HEAD: never `--write` them. A
DESIGN.md table row takes Prettier's form and must not widen a column. Pass
Python `newline='\n'`.

## Open, and waiting

KN-723, KN-683, KN-515, KN-516, KN-517 and KN-486 wait on the owner; KN-477 on
twenty-four others. The Codex log the owner pasted holds the Groq key; never
repeat it. **KN-685 binds**: the fixtures' two sentinels are named nowhere.

## The owner's rules, most recent first

- **2026-11-04.** Fix the failing GitHub builds; run the actions on the current
  Node LTS. "Gear holds the rest" for a phone's header.
- **2026-11-03.** The design first, then the backend, then the rest; within the
  design, missing components and fixes to existing ones first. Finish every
  to-do, roast each to a file in the background, and only when all are done read
  the files, file their findings and work them. Roasts on Sonnet 5.5 through the
  claude CLI, never an Agent subagent. Build from Screens `5:7`.
- **2026-09-16 and 09-14.** Answer WHY with the mechanism; "I don't know" is
  a correct answer; do not just agree. The owner reads on a phone: literal truth.
- **2026-09-11.** Push after every close. No proof at the close. Do not invent
  gates. **A finding is a CHILD of its task**, one level. Plans live beside the
  work.

## What to read first

`AGENTS.md` sections 3 and 7, `agent/RALPH.md`, the head of `DESIGN.md`,
`DESIGN-HANDOFF.md`, and `todo next`. A backgrounded command's exit code is the
shell line's; a green total proves nothing about a new test; plant the failure
once and watch it fail.
