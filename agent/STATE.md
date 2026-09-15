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
and to rotate it. Never repeat that key anywhere. **Filed for the owner, not yet
asked**: KN-588, KN-589, KN-590, KN-591, KN-616, and now **KN-358**.

**Roasts run on Codex terra, pinned**: every roast and plan review passes
`--model gpt-5.6-terra`, AGENTS.md section 7.

**KN-348 is closed** (242280f; board c90cf75; pushed), a child of KN-031: `onDelete` is required in
the Contact Modal's edit member and `?: never` in its add member; the stories' meta is an edit
instance and `modalFor` builds the add; the board's edit Contact Modal closes into a Confirm modal
and deletes only on confirming. `DeletingAPersonAsksFirst` failed against the old board first. Its
roast is recorded (8707a1e): **KN-628** filed, focus after a confirmed delete lands on the job
modal's `div` with role presentation (Cancel measured by keyboard returns to the person row), and
**KN-629**, the Contact Modal's Docs Controls table lists only `mode`, from KN-571's `include`.

**KN-349 is closed** (d3b3596; board 0ec7a3f; pushed), a child of KN-031: `PanelModal` places the
Dialog's root on the visual viewport, `top`, `bottom: 'auto'` and `height` from two
`useSyncExternalStore` snapshots, and caps the Paper at `calc(100% - 32px)`.
`FooterAboveTheKeyboard` stands in a 544 visual viewport over 390 by 844 and failed first, Save at
679; `FooterInAPhoneView` at a literal 390 by 544 passed before and after, a size check only;
`WithoutAVisualViewport` stands in `null`. No real phone keyboard was run. **Its roast is running
in the background**, `kn349-roast.mjs` writing `kn349-roast.txt` in the scratchpad.

**Earlier today, closed and recorded**: KN-345 (KN-626, KN-627 filed), KN-343 (KN-625), KN-338
(KN-624), KN-336, KN-335 (KN-621, KN-622), KN-332, KN-331 (KN-620), and KN-024's whole-task round
(KN-623).

**Rounds waiting**: KN-018 on KN-621 and KN-622; KN-024 on KN-623; KN-025 on KN-620; KN-020 on
KN-339, KN-383 and KN-624; KN-026 on KN-384, KN-385 and KN-625; KN-028 on KN-346, KN-626 and
KN-627; **KN-031 on KN-628 and KN-629**. **Still open from earlier**: KN-009 waits on KN-614;
KN-021 on KN-387; KN-022 on KN-327, KN-615, KN-616 and KN-619; KN-012 on KN-333, KN-334 and
KN-357.

**What fails in a full run**: the Job Card's `Pressed`, and at times ContactCard's
`Full On A Phone`, in parallel only, KN-365's kind. `session.test.ts` can overrun its 5 seconds
while the machine is loaded, KN-551: rerun the file alone, then the unit project. `App.tsx` line
107 uncovered, KN-491. The API's gate fails on `extraction.service.ts`, KN-486.

## The owner's rules, most recent first

- **2026-09-15.** GitHub Pages deep links: real paths, a page per destination, `404.html` for the
  rest.
- **2026-09-14.** The board is the todo skill's database. The shared skills serve ALL projects: a
  change only adds. A model's work is never roasted by that model. "It should look like the figma."
  The owner reads on a phone: literal truth, no excuses. An instruction carries its date; a later
  one overrides.
- **2026-09-12, to Codex, still standing.** Mock the login. Keep the sample data and the AI
  extraction. Commit and push after work. Never ask the owner to redeploy when nothing changed.
- **2026-09-11.** Push after every close: commit, close, push, then roast. Only new component cards
  and their blockers are `critical`. No proof at the close. Roasts stay. A finding about the loop is
  `low`. 100 percent coverage. **Do not invent gates.**
- **A finding is a CHILD of its task**, one level, with `--area` and `--okr`. **Plans live beside
  the work**, checked by `roast.py plan` before building, and they stay.

## The next step

1. **KN-349's roast lands**: read the file `kn349-roast.txt` names, reproduce each finding, file the
   survivors with `--parent-task KN-349 --area web --okr OKR-1`, record with `todo roast KN-349`,
   render, commit, push, and relay it to the owner.
2. **KN-358 is in progress**, medium, 1 point, design, a child of KN-029: the phone's add form reads
   title before company, where 243:726 is said to draw the company first; its exit needs the
   owner's choice. Read 243:726 and the desktop Review, 150:94, in Figma, to state which order each
   draws and whether the phone's order is only the desktop row's left-to-right array stacked, since
   the design is right to left. Then block it with that reason, ask the owner through the question
   tool, with the filed owner cards that fit, and take `todo next`.

## What to read first

`AGENTS.md` (section 7), `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, `todo show KN-358`,
the job form's title and company fields. **Never chain a check through a pipe into a commit or a
close, write long scripts with the Write tool, keep apostrophes out of single-quoted strings in
scripts, find a story's controls inside `#storybook-root`, and read an accessibility claim from
the browser's own tree.** The Persian catalog is `apps/web/src/i18n/locales/fa-IR.ts`.
