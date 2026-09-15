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
asked**: KN-588, KN-589, KN-590, KN-591, and **KN-616**.

**Roasts run on Codex terra, pinned**: every roast and plan review passes
`--model gpt-5.6-terra`, AGENTS.md section 7.

**KN-345 is closed** (3261606; board 0690d8b; pushed), a child of KN-028: a Modal given a blank
title reports it through `console-guard`'s `report` from an effect and renders nothing.
`ReportsABlankTitle` reads the marked report and that the trigger opens no dialog; it failed alone
against the old shell. Its exit was edited on the board after the plan review, which turned down a
report that still drew the dialog. Its roast is recorded (1bfb23e), after a first launch
threw on an apostrophe in its script: `trim` leaves zero-width and direction marks, so a title of
only those is not refused, filed as **KN-627**, low. **KN-626** filed too: PanelModal's blank
title, the same gap. KN-028 waits on KN-346, KN-626 and KN-627.

**Earlier today, closed and recorded**: KN-343 (on KN-415's 2b5b205; KN-625 filed, raw mailto),
KN-338 (the Status Picker's add chip outside its group; KN-624 filed), KN-336, KN-335, KN-332,
KN-331, and KN-024's whole-task round (KN-623 filed).

**Rounds waiting**: KN-018 on KN-621 and KN-622; KN-024 on KN-623; KN-025 on KN-620; KN-020 on
KN-339, KN-383 and KN-624; KN-026 on KN-384, KN-385 and KN-625; KN-028 on KN-346 and KN-626.
**Still open from earlier**: KN-009 waits on KN-614; KN-021 on KN-387; KN-022 on KN-327, KN-615,
KN-616 and KN-619; KN-012 on KN-333, KN-334 and KN-357.

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

1. **KN-345's roast is recorded**, KN-627 filed; nothing is waiting on it.
2. **KN-348 is in progress**, medium, 1 point, a child of KN-031: an Edit Contact Modal can be
   written without the delete. Measured: `ContactModalProps` is already a union, from KN-386, the
   edit member's `initial` a required key that may be `undefined` while the record loads, which
   `TheRecordArrivesAfterItsId` needs; `onDelete` is optional in both members, and the Delete
   footer draws only when the mode is edit and `onDelete` is given. **Its plan is written**, beside
   `ContactModal.tsx`, with the in-memory tsc run that refused `onDelete` required in edit in four
   places: `JobsScreen.tsx:636`, an edit Contact Modal with no delete (the job modal's own
   `onDeleteContact` there deletes at once with `records.deleteContacts([id])`), the stories' meta
   `onDelete: fn()` beside its add mode, and the `Loading` and `LateRecord` renders. Raised to 2
   points. Next: its Codex plan review, `kn348-plan-review.mjs` in the scratchpad. The work: `onDelete` required
   in the edit member and `?: never` in the add one, KN-331's shape. **KN-331's lessons apply**,
   AGENTS.md section 7: the docs guard wants every callback's `fn()` in the meta, so the meta's
   `onDelete: fn()` stays; a story's args type lays the meta's args over each member, so a custom
   render spreading args into the component is refused, TS2375, and one render must hand the
   component only its member's props, as `barFor` in `BulkActionBar.stories.tsx` does; check tsc
   with a compiler host serving the drafts, not `lintText`. The Contact Modal stories have custom
   renders `Rerendering`, `Loading` and `LateRecord`. Read both edit callers, `JobsScreen.tsx` and
   `NetworkScreen.tsx`, for `onDelete`.

## What to read first

`AGENTS.md` (section 7), `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, `todo show KN-348`,
`ContactModal.tsx`, its stories and story docs, `#KN-331`'s plan in `shared/bulk-action-bar`.
**Never chain a check through a pipe into a commit or a close, write long scripts with the Write
tool, keep apostrophes out of single-quoted strings in scripts, find a story's controls inside
`#storybook-root`, and read an accessibility claim from the browser's own tree.**
