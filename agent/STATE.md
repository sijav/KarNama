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

## Where things stand, 2026-09-14

**Codex's work of 2026-09-12 stays on main**, KN-477: login mocked at the
owner's word, Groq extraction on Render, Settings, drag and drop, collapse,
date validation, the growing paste field. What survived four Claude reviews of
its diff is its children, KN-483 to KN-503; the dark `color-scheme` fix waits in
`git stash@{0}` as KN-496. KN-482 moved the board into the skill's database.

**The owner's asks of 2026-09-14, done**: KN-479 (e058e19), each language led by
its region's flag from `country-flag-icons`; KN-480 (c0685be), Settings chooses
the language from the Select, its options led by flags; KN-478 (ce97840),
settings, sign out, language and add contact as Icon Buttons, the shell's own
controls one `ShellControls` row at the sidebar's foot on a desktop and in a
phone's Page Header, which closed KN-418.

**KN-481, "it should look like the figma", done (198a36f).** Every page was set
beside its frame at 1440 and 390; the card's notes hold each difference and what
became of it. The board and the network now open on the Header band their
frames draw, `apps/web/src/screens/band.ts`, and the shell gives a page no
padding, so the gutters are the file's 32 and 16, which closed KN-452; the Page
Header is 44 whatever its action; the desktop board's search is 320 with the
sort at the inline end; the columns are 16 apart; the network is two columns 24
apart, one column 12 apart on a phone; the board stays current while the add
flow is open. `App/Shell`'s `LaidOutAsTheFrames` asserts the numbers from the
shell in both languages. DESIGN.md section 8 records the page's frame.

**Filed from KN-481**: KN-512, the network's Sort Control; KN-513, relative
dates on cards; KN-514, the English job modal footer at 390; KN-518, the sign-in
card. **Blocked on the owner, asked 2026-09-14**: KN-515, a phone board header's
add button beside the shell's controls; KN-516, a phone board's sort row the
frame does not draw; KN-517, history's place among the job modal's tabs.

**Roasts**: KN-479's filed KN-506; KN-480's KN-508, KN-509 and KN-510; KN-478's
KN-511. KN-481's is with Codex, and it covers KN-452, closed in the same commit.

**Found on the way and filed**: KN-505, addresses as clean paths rather than
`#/`, the owner's question; KN-507, the Settings dialog's Theme and sample-data
parts are MUI defaults beside the Select. Two stories fail in a full run and are
not new: the Icon Button's and Nav Item's `Hover` in parallel, KN-365, and the
board's `Adding`, which calls the live API, KN-495.

## The owner's rules, most recent first

- **2026-09-14.** The board is the todo skill's database, and `agent/board.json`
  is its archive. The shared skills serve ALL projects: a change only adds, and
  is checked against a copy of every board on the machine. A model's work is
  never roasted by that model. A suggestion is not a directive (the CSV diff).
  Flags come from a package, not a political choice. Settings and a phone's sign
  out do not exist in Figma, so they are invented, as icons. "It should look like
  the figma." The owner reads on a phone: literal truth, no excuses.
- **2026-09-12, to Codex, still standing for the product.** Mock the login for
  now. Keep the sample data and the AI extraction. Do not change a layout nobody
  asked to change; a drag wrapper belongs in the correct spot. Commit and push
  after work. Never ask the owner to redeploy when nothing changed.
- **Push after every close, 2026-09-11.** Commit, close, push, then roast.
- **New components first, 2026-09-11**: only new component cards and their
  blockers are `critical`; a finding on a built component is `high` or lower.
- **No proof at the close, 2026-09-11**: test what changed, stories, unit tests,
  lint, tsc, look at it, close with one line of evidence. Roasts stay.
- **A finding about the loop rather than the product is `low`** unless it is
  actively breaking the work.
- **100 percent coverage is a product rule**: `apps/*`, `packages/*`, not
  `agent/scripts/**`, and markdown has no tests.
- **Do not invent gates.** Rule zero of `agent/RALPH.md`.
- **A finding is a CHILD of its task**, one level: `todo add --parent-task`.
- **Plans live beside the work**, `#<id> - <title>.md`, checked by
  `roast.py plan` before building, and they stay.

## The next step

Relay KN-481's roast when it lands: file what survives as KN-481's children and
record the roast for KN-452 as well. KN-483 is in progress, the posting page
that can freeze the API: `postingText` in `apps/api/src/extraction/posting.ts`
runs its entity and tag regexes over a body of up to 2 MB and cuts to 30,000
characters only at the end. Write its plan beside that file, roast the plan with
Codex, cut before the first regex, and prove it with a two megabyte body of
`&lt;` in `posting.test.ts` returning within a second, then the API suite.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
