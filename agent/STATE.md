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

## Where things stand, 2026-11-04, afternoon

**The owner's order: the design, then the backend, then the rest.** OKR-3, the
redesign, then OKR-4, the backend, then OKR-1 and OKR-2. Within the design every
component card is `critical`, ahead of the record model (KN-731 to KN-741) and
the screens (KN-805 to KN-828); KN-829 reads the older cards against the
redesign last.

**KN-776, the Source Picker `1223:96580`, is in progress**: Default with its
hint, Empty, Open with the reader's sources and the common ones, Hover, and
Typing with the quiet normalisation, «منظورتون این بود؟» and «ساختن منبع «…»»;
its menu opens upward, out of the layout, at the end of a scrolling form. Read
the node, write the plan beside it, stories first.

**KN-804, the Contact Modal `270:152`, closed (e3e6e26)**: the Label Picker and
Linked Jobs in the body, the primary off until it can save, «حذف از شبکه» at the
footer's inline start; values carry `label` and `jobIds`. Until KN-738 the
screens go through `apps/web/src/screens/personModal.ts`. KN-598 closed with it.
Its roast and KN-598's run in the background, KN-804's first; KN-855 holds the
Label Picker's older coverage gaps.

**Closed today, among others**: KN-775, KN-789, KN-796, KN-848, KN-850 with
KN-851, KN-783, KN-745 (`shared/kanban-card`), KN-747 (`shared/interview-slot`),
KN-754, KN-756 and KN-757 (`shared/date-picker`), KN-854, KN-771
(`shared/label-picker`), KN-804 and KN-598. KN-847 made the Pages build green; every push since is
green.

**Pieces other cards build on**: `shared/popover`, `shared/date-picker`,
`cardFooter`, the grouped status picker, the modals, `HistoryRow`, the menus,
`SearchPicker`, `statusGroups`, `KanbanCard` with `InterviewSlot`,
`LabelPicker`, `LinkedJobs`. **Adoption is the screens'**: notes on KN-805,
KN-812, KN-816, KN-817, KN-822 and KN-828 say what each swaps in; retiring
waits on it: KN-842, KN-844, KN-852.

**Open findings on built components**: KN-853, the Kanban Card's content 244
wide where the frame leaves 242; KN-849, the stale drag-cards e2e spec.

**A phone's header, the owner's answer of 2026-11-04** ("Gear holds the rest"):
the title, the page's action and one settings gear; language and sign out live
in the Settings dialog.

## Learned, and the traps

- Figma's auto layout can include a stroke in layout
  (`strokesIncludedInLayout`): read it before taking a padding.
- The story runner is 1200 by 900; the published check 1280 by 720, where a
  tall modal scrolls its body: measure `scrollHeight` and offsets, and allow
  for MUI lifting a popover into the window. Before pushing a popover's
  stories run `storybook build` then `playwright test --config
  playwright.storybook.config.ts -g <ids>`.
- An act warning from `ForwardRef(PopperTooltip)` is a Popper whose state
  changed outside act: an inline `modifiers` array, or focus lost to the body
  that a Dialog's focus trap takes back on its 50 ms interval.
- Focusing from an effect makes React warn outside act: `flushSync` in the
  handler, then focus. A disabled default button blocks implicit submission.
- Coverage is 100% in every file; a story's coverage of a file the unit project
  touches is discarded, KN-103. A guard that cannot be false is a failed branch.
- Screenshots: the browser pane cannot render while hidden; use
  `%TEMP%/kn804/shot.cjs` (Playwright through apps/web's `@playwright/test`).
- The lint rule's traps: a string literal passed to an unlisted function, a
  string ternary outside `sx`, `i18nFor(x)._()` in one expression, a template
  of words, a letter in a date literal; type a literal as a one-member union.
- Git Bash mangles `\\`, long Persian and TSX in a heredoc: use Write.

**CI**: the Pages workflow builds the app and Storybook and runs
`e2e/storybook`'s specs. Watch a run with `gh run watch` in the background,
then read `gh run view <id>`.

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
**none is judged until every to-do is done**. Every closed card through KN-771
has its record, KN-804's and KN-598's were running at this writing; the
scratchpad's `roast-<id>.py` files hold the arguments.

## What fails, and which failures are known

`npm test` exits 1, none of it new: KN-551's `session.test.ts` two, KN-699,
KN-365's parallel pointer, KN-486's database timeouts. A heavy board story can
pass alone and time out at 15 s in its file's run: type short fixture names.
**Search the board before filing a failure.**

## Drift, and the method

Drift is Prettier's, from the file's real path: `prettier --stdin-filepath
<path> < <file> | diff <file> -`. A new file measures 0; hold each baseline:
`DESIGN.md` 224 with 9 em dashes, `TECH-DEBT.md` 17, `AGENTS.md` 0,
`agent/RALPH.md` 5, `App.stories.tsx` 13, `JobsScreen.stories.tsx` 2. Several
story files are off only by Prettier's import order at HEAD: format your own
lines by hand there. The catalogs and `eslint.config.js` are not Prettier's at
HEAD: never `--write` them. A DESIGN.md table row takes Prettier's form and
must not widen a column. Pass Python `newline='\n'`.

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
