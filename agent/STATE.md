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

**Waiting on the owner.** Asked 2026-09-14: KN-515, KN-516, KN-517. Asked in chat
on 2026-09-15, neither answered yet: whether the Search Bar and the Sort Control
take KN-275's `border/control`; and **KN-486**, blocked: whether tests of
`extraction.service.ts` that stub `fetch` are allowed, after the owner told Codex
on 2026-09-12 "If you have AI test, remove that, I didn't ask for an AI API
test". The owner was told on 2026-09-15 that the Codex log they pasted holds the
Groq key they had pasted to Codex, that no file, commit or board entry holds it,
and to rotate it. Never repeat that key anywhere. **Filed for the owner by
KN-518 on 2026-09-15**, not yet asked: KN-588, the signup's skip against the
required name; KN-589, the frames' text-message promise while the provider is
mocked; KN-590, a terms and privacy note for pages that do not exist; KN-591, the
note's 2.54 to one contrast.

**KN-518 is closed** (37df5c8, board 26d768d, pushed). The sign-in card has the
file's measures on every step, `elevation.authCard`, the sidebar's Brand Row
moved to `shared/navigation/BrandRow`, and each step's heading at 24 on the normal
line, which measures the file's 38. The copy follows the frames where it promises
nothing untrue. Its Codex roast was running when this was written
(`kn518-task-roast.log` in the scratchpad), to be judged and recorded, and so was
the Pages run for 26d768d. The frames' code boxes are **KN-586** and the countdown
with a change of number **KN-587**, both high.

**KN-226 is closed and proven on ubuntu-latest**: 378 stories using 2 workers
passed in 6.5 minutes and the site deployed; its roast found nothing. **KN-584**
(080f4b4) is closed, its roast found nothing. **KN-585**, medium, OKR-2: Input's
`TypingIntoABoundValue` loses keys only on a page slowed four times, passed on
ubuntu-latest. **KN-569** covers seven stories whose second play fails.

**Measured for KN-518**: with `NODE_ENV=production`, `@lingui/core` 6.6.0
returns a message with a value raw, `{phone}`, since the catalogs load
uncompiled, KN-221; no message may take a value until that card.

**How to measure the published Storybook**: build with `KARNAMA_STORYBOOK_BASE`
from PowerShell or Node's own `env`, never a Git Bash line; a play that writes
its args says `storyFinished` for each render that causes, so a play's end is the
`storyFinished` after `played` or `errored`. The scratchpad's `kn584-probe.mjs`
takes `WORKERS`, `REPEAT`, `THROTTLE`, `ONLY` and `REMOUNT`; `kn518-look.mjs`
screenshots the sign-in steps from a production build.

**What fails in a full run**: the Job Card's `Pressed` in parallel only, KN-365's
kind. `App.tsx` line 107 is uncovered, KN-491's. The API's gate fails on
`extraction.service.ts`, KN-486.

## The owner's rules, most recent first

- **2026-09-15.** "Bro GitHub pages do work with normal deep linking routing like
  ../daramad-name": real paths, a page per destination, `404.html` for the rest.
- **2026-09-14.** The board is the todo skill's database. The shared skills
  serve ALL projects: a change only adds. A model's work is never roasted by that
  model. "It should look like the figma." The owner reads on a phone: literal
  truth, no excuses. An instruction carries its date; a later one overrides.
- **2026-09-12, to Codex, still standing.** Mock the login. Keep the sample data
  and the AI extraction. Do not change a layout nobody asked to change. Commit
  and push after work. Never ask the owner to redeploy when nothing changed. "If
  you have AI test, remove that": whether it reaches stubbed tests is asked.
- **2026-09-11.** Push after every close: commit, close, push, then roast. Only
  new component cards and their blockers are `critical`. No proof at the close:
  test what changed, look at it, close with one line. Roasts stay. A finding
  about the loop is `low`. 100 percent coverage. **Do not invent gates.**
- **A finding is a CHILD of its task**, one level, with `--area` and `--okr`.
  **Plans live beside the work**, checked by `roast.py plan` from the repository
  root before building, and they stay. Write long scripts with the Write tool.

## The next step

**KN-533 is in progress**, high: a phone cannot start a selection on the network
page, since the full Contact Card unfolds its checkbox only on hover or focus.
Read the file's network Mobile Selection, 305:1842, and the Contact Card's
description and reactions with use_figma, and the job card's held press of
KN-428, before planning. Judge and record KN-518's roast when it lands, and read
the Pages run for 26d768d to its end.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md`, `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo next` and KN-533's card.
