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
take KN-275's `border/control` (`DESIGN.md` records the question beside KN-273's
decision); and **KN-486**, blocked: whether tests of `extraction.service.ts` that
stub `fetch` are allowed, after the owner told Codex on 2026-09-12 "If you have AI
test, remove that, I didn't ask for an AI API test". The owner was also told, on
2026-09-15, that the Codex log they pasted on 2026-09-14 holds the Groq key they
had pasted to Codex, that no file, commit or board entry holds it, and to rotate
it. Never repeat that key anywhere.

**KN-486 (part), b0e2e3f**: every API file but `extraction.service.ts` is at 100
percent with no network and no database: `readPosting` against a mocked DNS lookup
and a scripted request, the pg adapter with `pg` mocked, the resolvers and the auth
service's refusals with stand-ins. `vitest.setup.ts` assigns a guard over `fetch`
that refuses any host but 127.0.0.1. A plant that switched the guard off let the
guard test's own requests be attempted, POSTs with no body or key to Groq, OpenAI,
Kavenegar and example.com; the test now sends them already aborted. `npm test` in
`apps/api` still fails on that one file.

**KN-505 is closed** (7e7e879): addresses are paths under the base, `/KarNama/jobs`,
`/add` and `/network`; the build writes `404.html`, `jobs.html`, `add.html` and
`network.html`; an old `#/network?from=a` is replaced by its path. Checked on the
live site after the deploy. Its roast filed **KN-579** (closing the add flow pushes
`/jobs` over `/add`, so Back reopens it), **KN-580** (the board's own add buttons
never write `/add`) and **KN-581** (a `KARNAMA_BASE` without its slash).

**KN-460 is closed** (047f316): `AuthValue` carries no code; the mock gives its code
through a private context paired with its own value, and `useMockCode` hands it
only to a component reading that value. `connected.spec.ts`'s no-notice check
looked for words the notice never had; it uses the catalog's words now, and a
planted notice fails it. Its roast found nothing.

**KN-226**, the check that the published Storybook renders without errors, waits
on KN-494 alone.

**Closed on 2026-09-15**, pushed and roasted by Codex: KN-554, KN-560, KN-561
(KN-566), KN-562 (KN-568), KN-563 (KN-569), KN-255 (KN-575), KN-570, KN-275
(KN-576), KN-279 (KN-578), KN-505 (KN-579 to KN-581) and KN-460.

**`node agent/scripts/storybook/controls-sweep.mjs [--only <regex>]`** measures
which stories' offered controls break their plays: 121 broken after KN-570,
carried by KN-571 to KN-574; it does not yet report unapplied changes, KN-575.

**How to measure the published Storybook**: build with `KARNAMA_STORYBOOK_BASE` in
Node's own `env`, never on a Git Bash command line, or build at the root without
it, when `import.meta.env.BASE_URL` compiles as `./`; hear the end on
`window.__STORYBOOK_ADDONS_CHANNEL__` hooked by a property setter;
`playFunctionThrewException` for a thrown play. A story's pinned globals beat URL
globals: look at dark through an unpinned story.

**What fails in a full run**: the storybook project fails KN-494's five stories,
AddJobModal `Review` among them, and the Job Card's `Pressed` in parallel only,
KN-365's kind. `App.tsx` line 107, the provider's error above the page, is
uncovered, KN-491's. The API's gate fails on `extraction.service.ts`, KN-486.

**The live-mode e2e** (`npm run e2e:connected` in `apps/web`) runs against
`agent/scripts/scenario-server.mjs`, PGlite and test doubles for SMS and AI, built
from `apps/api/dist`; it touches no shared system.

## The owner's rules, most recent first

- **2026-09-15.** "Bro GitHub pages do work with normal deep linking routing like
  ../daramad-name": real paths, a page per destination so each answers 200, and
  `404.html` for anything else, taken right after KN-279.
- **2026-09-14.** The board is the todo skill's database, and `agent/board.json`
  is its archive. The shared skills serve ALL projects: a change only adds, and
  is checked against a copy of every board on the machine. A model's work is
  never roasted by that model. A suggestion is not a directive. Flags come from a
  package. Settings and a phone's sign out do not exist in Figma, so they are
  invented, as icons. "It should look like the figma." The owner reads on a
  phone: literal truth, no excuses. An instruction carries its date, and a later
  one overrides an earlier.
- **2026-09-12, to Codex, still standing.** Mock the login for now. Keep the
  sample data and the AI extraction. Do not change a layout nobody asked to
  change. Commit and push after work. Never ask the owner to redeploy when
  nothing changed. "If you have AI test, remove that, I didn't ask for an AI API
  test": whether that reaches tests that stub `fetch` is asked, KN-486.
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

**KN-494 is in progress**, high: a job whose dates were written as text, «۱۰ شهریور
۱۴۰۵» in the story fixtures, shows an empty date and cannot be saved, and five
stories fail on it (AddJobModal Review; JobModal Note, Change Status, Save And
Delete, Starts Over For Another Record). It blocks KN-226.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
