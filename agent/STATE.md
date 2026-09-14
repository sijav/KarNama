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
`git stash@{0}` as KN-496. KN-401 is unblocked.

**KN-482 is done**: the board is the todo skill's database, with objectives,
blocks, notes, evidence, roast rounds, validate, render and rm in both halves.

**KN-479 is done** (e058e19): `LanguageFlag` from `country-flag-icons` 1.6.20,
fa-IR Iran's and en-US the United States', in the language switch's icon
column, its Page Header button and its menu. Codex's roast found it correct and
one plan sentence reading backwards, KN-506. This iteration's check found
DESIGN.md's navigation paragraph still saying the switch has no icon, repaired
in 5c12ea5, and the contract failing on KN-492's wording since KN-477's
findings were filed, repaired in 19f0687.

**KN-480 is done** (c0685be): the Select's options take an optional `leading`,
drawn before the name in the row and before a single chosen name in the field;
Settings chooses the language from that Select, each language led by its flag.
The e2e specs pick the language from the list, which MUI portals outside the
dialog: 14 passed with the same 4 phone skips as before. Its roast goes to Codex.
Found while looking at it: the dialog's Theme and sample-data parts are MUI
defaults beside the Select's Label role, KN-507.

**The owner's asks still open**: KN-478, settings, sign out, language and add
contact as Icon Buttons with nothing in a row above a title, next; KN-481, every
page beside its Figma frame; KN-505, clean paths instead of `#/`. The
sample-data loader and the AI extraction stay.

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

Relay KN-480's roast when it lands, and file what survives as its children.
Take KN-478: `todo move KN-478 in_progress`, read the Icon Button, the Tooltip,
the Page Header, the Sidebar's foot, App.tsx's row of text buttons above each
title and the network page's add contact, and the Figma frames they sit in; the
icon set has no settings glyph, so the plan says where one comes from. Write the
plan beside the work, roast it, then build.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
