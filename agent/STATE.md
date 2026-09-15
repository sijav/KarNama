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

**The owner answered four questions on 2026-09-15**, through the question tool; see the rules
below. KN-358 is closed on it; **KN-588** is to build the skip; **KN-590** waits on **KN-630**, the
pages; **KN-616** is to build the arc, medium, 3 points. DESIGN.md records three of them; section
4's "required there" is corrected when KN-588 is built. **Still waiting on the owner**: KN-515,
KN-516, KN-517 (asked 2026-09-14); the Search Bar and Sort Control taking KN-275's
`border/control`, and **KN-486**, the `fetch`-stubbing tests of `extraction.service.ts` (both asked
in chat 2026-09-15). **Filed and not yet asked**: KN-589 and KN-591. The Codex log the owner pasted
holds the Groq key; never repeat that key anywhere.

**Roasts run on Codex terra, pinned**: every roast and plan review passes
`--model gpt-5.6-terra`, AGENTS.md section 7.

**Closed today and recorded**: KN-348 (242280f; roast filed KN-628, KN-629); KN-349 (d3b3596;
roast found nothing); KN-358 (the design commit of the owner's answers; roast found nothing).
**KN-359 is closed** (0b8f9c3; board 69d7fff): the add modal's paste label is `unstyledText.pasteLabel`,
12 on 19 with no spacing, named beside the five type roles; the Input takes `labelStyle`; Paste and
PasteFilled read 401 and Error 423; its roast is recorded, KN-631 and KN-632 filed. KN-362 and
KN-370 are closed, below. Earlier: KN-345 (KN-626, KN-627), KN-343 (KN-625),
KN-338 (KN-624), KN-336, KN-335 (KN-621, KN-622), KN-332, KN-331 (KN-620), KN-024's round (KN-623).

**Rounds waiting**: KN-018 on KN-621 and KN-622; KN-024 on KN-623; KN-025 on KN-620; KN-020 on
KN-339, KN-383 and KN-624; KN-026 on KN-384, KN-385 and KN-625; KN-028 on KN-346, KN-626 and
KN-627; KN-031 on KN-628 and KN-629. **Still open from earlier**: KN-009 waits on KN-614; KN-021 on
KN-387; KN-022 on KN-327, KN-615, KN-616 and KN-619; KN-012 on KN-333, KN-334 and KN-357; KN-029 on
its other children.

**What fails in a full run**: the Job Card's `Pressed`, and at times ContactCard's
`Full On A Phone`, in parallel only, KN-365's kind. `session.test.ts` can overrun its 5 seconds
while the machine is loaded, KN-551: rerun the file alone, then the unit project. `App.tsx` line
107 uncovered, KN-491. The API's gate fails on `extraction.service.ts`, KN-486.

## The owner's rules, most recent first

- **2026-09-15, answered through the question tool.** The phone's add form keeps the title first,
  KN-358. The first sign-in may skip the name, as Figma's «بعداً کاملش می‌کنم» draws it, "As
  Figma", KN-588. KarNama writes terms and privacy pages and the sign-in note links to them,
  KN-590 and KN-630. The Loading State turns an arc instead of the dots, KN-616.
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

1. **KN-359's roast is recorded**: KN-631, the Input docs claiming the message line keeps its height,
   and KN-632, ErrorStep's diagnostics, filed.
2. **KN-362 is closed** (30565a4; board 945b8b5): the add modal's loading panel is a `group` named by
   the Loading State's line through `lineId`; the Loading State takes `announceFirstLine`, false in
   the add modal, so the first sentence is said once, by the focus. Two plan reviews shaped it.
   Its roast is recorded: KN-633, the first loading line reaching a screen reader only through the
   focus name, KN-634, the split props, and KN-635, two comments, filed.
3. **KN-370 is closed** (54b28fe; board cf8f745): DESIGN.md and the chip say the first strong code
   point, bidi class L, R or AL, decides, and where the ellipsis sits; `MarkLedDigitsResolveLtr`
   with its planted `rtl`. Its amended plan was not reviewed a second time. **Its roast is
   running**, `kn370-roast.mjs` writing `kn370-roast.txt`: judge, file with
   `--parent-task KN-370 --area docs --okr OKR-1`, record, relay.
   Its roast is recorded, nothing filed.
4. **KN-385 is closed** (6d35d00; board 5508947): the Contact Card builds its role line from the
   trimmed parts, the Contact Modal saves role and company trimmed, and both docs say every part but
   the name may be missing; the screens already trimmed before storing. Its roast is recorded:
   KN-636, blank email, phone, job and LinkedIn rows from a kept record, filed.
5. **KN-387 is dropped**: the Page Header's language switch it would have styled as text is, by the
   owner's decision of 2026-09-14, an Icon Button with its flag, built by KN-478 and KN-479, both
   done; `LanguageSwitch.tsx` draws `IconButton` with `LanguageFlag` in both placements.
6. **KN-631 is dropped** as a duplicate of KN-413, filed without searching the board first.
   **KN-413 is closed** (11a58d5; board ea9a49f): both Input docs open with what the line under the
   field does, 64 and 90 for a field of one line, wrapping and multiline stated, as its plan review
   narrowed it. **Its roast is running**, `kn413-roast.mjs` writing `kn413-roast.txt`: judge, file
   with `--parent-task KN-413 --area web --okr OKR-1`, record, relay.
   Its roast is recorded: KN-637, the multiline field measured by its frame, and KN-638, the plan's
   stale line, filed.
7. **KN-432 is closed** (cd47a99; board 0c1792d): both delete confirmations say "these" and lead
   their body with the count in the reader's digits beside the message when several are going; one
   keeps today's copy. The first build turned the copy singular as the dialog dissolved; a story
   caught it and the count is now held in state. **Its roast is running**, `kn432-roast.mjs`
   writing `kn432-roast.txt`: judge, file with `--parent-task KN-432 --area web --okr OKR-1`,
   record, relay.
8. **KN-434 is in progress**, medium, 1 point, web: JSDoc prose back in the TSX that story-docs
   owns and that prints in English on the Persian docs page, on the Icon Button's `href` and above
   stories in the screens, App and Button. Exit: no prop or story there carries prose the markdown
   holds, and the Persian docs page shows no English. Measured: seven `/** */` blocks above story
   exports print their English on the Persian Docs pages, `People`, `Adding` and `Selecting` on the
   board's, `Editing` on the network page's, `Navigating` and `FromAnOldAddress` on the shell's,
   `States` on the Button's; the Icon Button's page holds none, so that half is already gone. The
   markdown holds all seven in both languages. **KN-434 is closed** (8771719; board f92c240): four
   story blocks deleted, three code-explaining sentences kept as `//` comments, and, as its plan
   review added, the seven JSDoc prop descriptions in `JobsScreenProps` and `NetworkScreenProps`
   removed; the source scan and the five Persian Docs pages find none left. **Its roast is
   running**, `kn434-roast.mjs` writing `kn434-roast.txt`: judge, file with
   `--parent-task KN-434 --area web --okr OKR-1`, record, relay.
   Its roast is recorded: KN-639, the kept Editing comment describing blanks the story never saves,
   and KN-640, the Button form JSDoc, filed.
9. **KN-435 is closed** (d16713a; board 3728570): a blank rename keeps the modal open with the
   Status field's own error, "Write the status name", «نام وضعیت را بنویس», held by `tried` in the
   rename state; `BackingOut` finds the dialog again past a close's fade and reads the refusal. The
   unit project passed but for `session.test.ts` overrunning its 5 s under load, KN-551, which
   passed alone. **Its roast is running**, `kn435-roast.mjs` writing `kn435-roast.txt`: judge, file
   with `--parent-task KN-435 --area web --okr OKR-1`, record, relay.
10. **KN-439 is in progress**, medium, 1 point, web: the status fixtures' count disagrees with the
    board they describe. Exit: the count is gone, or equal to the job opportunities the fixtures put
    in that status, in both languages. Measure first: its reading is from 2026-09-12.

## What to read first

`AGENTS.md` (section 7), `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, `todo show KN-385`,
its plan beside `ContactCard.tsx`, and the scripts `kn385-apply-stories.mjs` and
`kn385-apply-component.mjs` in the scratchpad, written before its plan review. **Never chain a check through a pipe into
a commit or a close, write long scripts with the Write tool, keep apostrophes out of single-quoted
strings in scripts, find a story's controls inside `#storybook-root`, and read an accessibility
claim from the browser's own tree.** The Persian catalog is `apps/web/src/i18n/locales/fa-IR.ts`.
