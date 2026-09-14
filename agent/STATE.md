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
its diff is its children, KN-484 to KN-503 and KN-521 still open; the dark
`color-scheme` fix waits in `git stash@{0}` as KN-496. KN-482 moved the board
into the skill's database.

**The owner's asks of 2026-09-14, done**: KN-479 (e058e19), each language led by
its region's flag from `country-flag-icons`; KN-480 (c0685be), Settings chooses
the language from the Select, its options led by flags; KN-478 (ce97840),
settings, sign out, language and add contact as Icon Buttons, the shell's own
controls one `ShellControls` row at the sidebar's foot on a desktop and in a
phone's Page Header, which closed KN-418.

**KN-481, "it should look like the figma", done (198a36f).** Every page was set
beside its frame at 1440 and 390; the card's notes hold each difference and what
became of it. The board and the network open on the Header band their frames
draw, `apps/web/src/screens/band.ts`, and the shell gives a page no padding, so
the gutters are the file's 32 and 16, which closed KN-452. `App/Shell`'s
`LaidOutAsTheFrames` asserts the numbers from the shell in both languages.
Its roast filed KN-519, the network's cards should be the frame's fixed 556
wrapping, and KN-520, the story never checks a phone's last card. Filed from its
audit: KN-512 network sort, KN-513 relative dates, KN-514 English job modal
footer, KN-518 sign-in card. **Blocked on the owner, asked 2026-09-14**: KN-515
a phone board header's add button, KN-516 a phone board's sort row, KN-517
history's place among the job modal's tabs.

**KN-483 done (bab5444, a186a87)**: `postingText` in
`apps/api/src/extraction/posting.ts` takes linear time on a hostile page; its
block and tag patterns were quadratic and are scans now with the patterns'
exact output. Its plan review refused the card's cut-first fix, which would
lose deep postings, and amended the exit before the build. Its roast found the
comment overclaimed, fixed, and that the API's `npm test` fails its coverage
gate, which KN-486 carries; KN-521 is the unclosed-script question.

**KN-401 done (fd9338e)**: the console guard was already on main, and was
checked rather than rebuilt. Temporary controls showed any unmarked
`console.error` or `console.warn` failing its test in both projects while
`report()` and `allowConsole` pass. Its full runs found two regressions of this
session's own, fixed in 723610d: KN-481's shell story had a `'1px'` string the
literal guard refuses, and Icon's `All Icons` still counted thirty glyphs after
KN-478's gear. KN-401's roast is with Codex.

**What fails in a full run, and why**: the unit project passes whole, 1348
tests. The storybook project fails the five modal stories KN-494 carries (Save
never calls `onSave`), the board's `Adding`, which calls the live API, KN-495,
and the Job Card's `Pressed` in parallel only, KN-365's kind. The API's tests
pass, 154, and its coverage gate fails, KN-486.

**Found on the way and filed**: KN-505, addresses as clean paths rather than
`#/`, the owner's question; KN-507, the Settings dialog's Theme and sample-data
parts are MUI defaults beside the Select.

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

Relay KN-401's roast when it lands and file what survives as its children.
KN-403 is in progress: the API's schema-entry test starts the built schema
command as heavy processes with a 60 second budget. Move `runSchemaCommand` out
of `apps/api/src/graphql/schema-entry.ts` into a module tested in process, as
`database/cli.ts` holds `runCli` beside its six-line `cli-entry.ts`, keep the
entry's process test to commands that never load the schema, and remove
`HUNG_AFTER_MS`, the hook budget of 0 and TECH-DEBT 20. Write the plan beside the
schema entry and roast it with Codex before building.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
