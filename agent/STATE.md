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

## Where things stand, 2026-11-04, evening

**The owner's order: the design, then the backend, then the rest.** OKR-3, the
redesign, then OKR-4, the backend, then OKR-1 and OKR-2. Within the design every
component card is `critical`, ahead of the record model (KN-731 to KN-741) and
the screens (KN-805 to KN-828); KN-829 reads the older cards against the
redesign last.

**KN-800, the Job Modal `210:276`, closed (fa70cd6)**, its roast running in the
background: the «…» menu, Popover Close, five tabs with «تاریخچه» last, a stage
saved with «ذخیره», an outcome handed over at once, «ذخیره» off until a change,
the Unsaved ask, people as Company Match and Related Person rows (unlink only,
`records.linkContact`, `companyMatches`), history rows with rounds. **Not yet
looked at against 210:101, 760:47508 and 210:208 by eye**: the Storybook dev
server had stopped; `preview_start storybook-static` serves the fresh build on
6007 for `$TEMP/kn790/shot.cjs` (point it at 6007). **KN-857** (the footerless
Change Status dialog over the job modal) is filed and critical. **KN-858**
(the e2e helper's old add-form copy) closed, 5c2cf64; KN-790 was roasted again
with it. Next: the look, then `todo next`.

**KN-790, the add form `166:82`, closed (f5a46d6)**: the paste steps on
PasteField and ManualPathLink, the Source Picker and the company's network note
(the Input's new `helperTone`), Review's fade, Manual's «جزئیات بیشتر» toggle and
Manual Details, the footer's StatusSelect and «افزودن». `useNetworkAt` in
`shared/related-person/network.ts` is shared with CompanyMatch, whose Persian
plural verb is now «هستند». `ownSources` and `peopleAtCompany` live in
`core/records`, unit-tested; the screen passes `common: []` until KN-739. The
expiry is «مهلت درخواست», 'Application deadline', in both modals. Its roast runs
in the background; **until it finishes, do not edit** AddJobModal, JobForm,
their stories, Input.tsx, network.ts, records.ts, JobsScreen.tsx or DESIGN.md.
KN-842 now waits on KN-790, not KN-817: nothing outside status-picker imports
the flat StatusPicker. Dates stay native until KN-818 and KN-813.

**Closed before it today**: KN-776, the Source Picker (b395f28); KN-804, the
Contact Modal (e3e6e26), with KN-598. Built today: `shared/kanban-card`,
`shared/interview-slot`, `shared/date-picker`, `shared/label-picker`,
`shared/source-picker`, the person modal; every push since KN-847 is green.
**Adoption is the screens'**: notes on KN-805, KN-812, KN-816, KN-817, KN-822
and KN-828 say what each swaps in. Open findings on built components: KN-849,
KN-852, KN-853, KN-855, KN-856. **A phone's header** ("Gear holds the rest",
2026-11-04): the title, the page's action and one settings gear.

## Learned, and the traps

- Figma's auto layout can include a stroke in layout
  (`strokesIncludedInLayout`): read it before taking a padding. An instance can
  override a component's colour, as 150:94's company helper does: read the
  instance's own fills, not only the component's.
- Before pushing, `storybook build`, then `playwright test --config
  playwright.storybook.config.ts -g <ids>`; ids come from each story file's
  `title`, `Screens/Jobs` is `screens-jobs--`.
- The lint rule's traps: a string literal passed to an unlisted function (pass
  the found element, or put the name in an exempt query), a string ternary
  outside `sx`, `i18nFor(x)._()` in one expression, a template of words, a
  default parameter literal; type a literal as a one-member union.
- **The Bash tool breaks on a heredoc holding a backtick**: write the script to
  the scratchpad with Write and run it. Python writes CRLF unless given
  `newline='\n'`; check with `grep -lU $'\r'`.
- A story's plain `Error` rejection is a network failure to `apiProblem`; fail
  as the server fails, a `CombinedGraphQLErrors` with the API's code.

**CI**: Pages builds the app and Storybook and runs `e2e/storybook`; the e2e
specs under `apps/web/e2e` are not in CI, run the ones a change touches.
drag-cards fails on the Saved column's fold, KN-849's.

**The redesign** is in Figma `K1EP8GCOmelU8o4vPR7a9f`, Screens `5:7`, with the
handoff in `DESIGN-HANDOFF.md`; read the instances on the screens for real copy
and sizing, and a variant's reactions for motion. The Figma session is
`7f5caf99-d185-4d31-ac22-a437ee09839b`.

**The backend is not done**: the live API answers with
`access-control-allow-origin https://sijav.github.io`. KN-836 lets the code
allow `https://kar-nama.ir`; KN-834 verifies the path once the owner sets
Render's WEB_ORIGIN and Cloudflare's Always Use HTTPS.

**Roasts** run on Sonnet 5.5 through the claude CLI,
`agent/scripts/roast-sonnet.py`, which passes `--remote-control`, one session
per kind. Each closed card is roasted in the background to `.claude/roasts/`;
**none is judged until every to-do is done**. Every closed card through KN-804
has its record; KN-790's was running at this writing. The scratchpad's
`roast-<id>.py` files hold the arguments; measure them, about 4 KB is fine.

## What fails, and which failures are known

`npm test` exits 1, none of it new: KN-551's `session.test.ts` two, KN-699,
KN-365's parallel pointer, KN-486's database timeouts. A heavy board story can
pass alone and time out at 15 s in its file's run: type short fixture names.
Coverage merges the two projects badly for a file both touch, KN-103: read a
file's misses from the storybook project's JSON, and keep pure helpers where
the unit project reaches them. **Search the board before filing a failure.**

## Drift, and the method

Drift is Prettier's, from the file's real path: `prettier --stdin-filepath
<path> < <file> | diff <file> -`. A new file measures 0; hold each baseline:
`DESIGN.md` 224 with 8 em dashes, `TECH-DEBT.md` 17, `AGENTS.md` 0,
`agent/RALPH.md` 5, `App.stories.tsx` 13, `JobsScreen.stories.tsx` 2, the
catalogs 22 and 19, `PasteField.stories.tsx` 8, `Input.stories.tsx` 71. A file
clean at HEAD may take `prettier --write`; the others get their new lines in
Prettier's form by hand. A DESIGN.md table row takes Prettier's form and must
not widen a column.

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
