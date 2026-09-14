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

**The owner's asks of 2026-09-14, done today**: KN-479 (e058e19), each language
led by its region's flag from `country-flag-icons`; KN-480 (c0685be), Settings
chooses the language from the Select, its options led by flags, the Select
gaining an optional `leading`; KN-478 (ce97840), settings, sign out, language and
add contact as Icon Buttons with tips that say what their names do not. The
shell's own controls are one `ShellControls` row, at the sidebar's foot on
desktop and after the page's action in a phone's Page Header, so a phone can
sign out, which closed KN-418; Codex's row above every title is gone; the
language menu opens above its button from the sidebar and below it from a
header; the gear is Lucide 1.41.0's `settings`, copied into the glyph set with
its licence in `apps/web/src/shared/icon/LICENSE-lucide.txt`.

**Roasts**: KN-479's found one plan sentence reading backwards, KN-506.
KN-480's found its proof thin: KN-508, KN-509, KN-510. KN-478's is with Codex.

**Found on the way and filed**: KN-505, addresses as clean paths rather than
`#/`, the owner's question; KN-507, the Settings dialog's Theme and sample-data
parts are MUI defaults beside the Select. Repaired on the way: DESIGN.md's
navigation paragraph (5c12ea5) and the contract failing on KN-492's wording
(19f0687). Two stories fail in a full run and are not new: the Icon Button's and
Nav Item's `Hover` in parallel, KN-365, and the board's `Adding`, KN-495.

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

Relay KN-478's roast when it lands and file what survives as its children.
Take KN-481, the owner's "it should look like the figma": move it in progress,
write its plan beside the screens in `apps/web/src/screens/`, roast the plan,
then set each page, the board, the add flow, the job modal, the network and
sign-in, at 1440 and 390 in fa-IR light beside its frame on canvas `5:7`
(DESIGN.md section 8 names them), write every difference into the card's
notes, fix those under four points and file the rest. Figma screenshots come
inline from `use_figma`'s `node.screenshot()`; the app's come headless with
Playwright against the dev server.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
