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
and to rotate it. Never repeat that key anywhere.

**KN-494 is closed** (c3950d8): `readRecords` turns a date written before the date
picker, «۱۰ شهریور ۱۴۰۵», «September 1, 2026» or «1 September 2026», into its day
through `days.ts`, in UTC; a date no calendar reads stays as text in a text field
and no longer blocks a save; the fixtures hold days. Its roast filed **KN-582**
(the card's `formatDay` redraws kept text V8 can parse, and `dayOf`/`deadlineOf`
sort kept text as strings) and **KN-583** (an unreadable date costs about 1,600
`Intl` calls on every load), both medium, attached by the skill to KN-477.

**KN-486 (part), b0e2e3f**: every API file but `extraction.service.ts` at 100
percent with no network; `vitest.setup.ts` refuses `fetch` to any host but
127.0.0.1. **KN-505** (7e7e879, paths not hashes; KN-579 to KN-581) and **KN-460**
(047f316, the mock's code out of `AuthValue`; nothing found) are closed.

**Closed on 2026-09-15**, pushed and roasted: KN-554, KN-560, KN-561, KN-562,
KN-563, KN-255, KN-570, KN-275, KN-279, KN-505, KN-460 and KN-494.

**How to measure the published Storybook**: build with `KARNAMA_STORYBOOK_BASE`
from PowerShell or Node's own `env`, never a Git Bash line, which rewrites any
value starting with `/`, even `/` itself; hook `__STORYBOOK_ADDONS_CHANNEL__`
with a setter, since the preview assigns it plainly (`runtime.js` 12862);
`playFunctionThrewException` for a thrown play. On 76beef5 all 429 entries,
stories and Docs pages, opened bare with no error in 132 seconds, six at a time.

**What fails in a full run**: the Job Card's `Pressed` in parallel only, KN-365's
kind. `App.tsx` line 107 is uncovered, KN-491's. The API's gate fails on
`extraction.service.ts`, KN-486.

**The live-mode e2e** (`npm run e2e:connected` in `apps/web`) runs against
`agent/scripts/scenario-server.mjs`, PGlite and test doubles, from
`apps/api/dist`; it touches no shared system.

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

**KN-226 is in progress**, high: a committed check that opens every story of a
production Storybook and fails on a page or console error, before Pages
publishes. Its blockers are closed. The plan beside `apps/web/e2e/storybook`
is replanned (uncommitted): a Playwright spec, `published.spec.ts`, one test per
story, the channel hooked by a setter; its own server, `serve.ts`, run by Node
24 as TypeScript, refusing a build made for another base; `webServer` on port
6106 with no reuse; 120 seconds a story, no retries; the check in `pages.yml`
before the assembly. Drafts of the three files are in the scratchpad's
`kn226-draft`. **Codex is reviewing the replan**; build after it lands, then the
Hover mutation the exit names.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md`, `agent/RALPH.md`, the head of
`agent/TODO_BOARD.md`, then `todo next` and the KN-226 plan.
