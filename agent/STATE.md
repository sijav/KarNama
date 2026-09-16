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

## Where things stand, 2026-09-16

**Codex's work of 2026-09-12 stays on main**, KN-477: login mocked at the owner's
word, Groq extraction on Render, Settings, drag and drop, collapse, date
validation, the growing paste field, the job modal's form. Its surviving review
findings are KN-484 to KN-503 and KN-521. **KN-496 landed the dark `color-scheme`
fix by hand**, so `git stash@{0}`, which parked the same change, now duplicates
committed code; it is left for the owner to drop.

**Closed 2026-09-16**, each roast recorded: KN-514 (ebd4f57), KN-524 (a43bb15), KN-535 (74d9239),
KN-543 (f5ab9f5), KN-544 (962fd07), KN-559 (16b8034), KN-658 (247d8b9), KN-542 (5c3989c), KN-564
(b45b50c), **KN-565** (e9c53b0), **KN-589** (d4b86c0), **KN-665** (d739f36), **KN-667** (12791df),
**KN-591** (874d4ce; board f8c8e13). **Dropped**: KN-657.

**KN-589 and its two children are the story of this stretch.** The code step said «ارسال شده به
۰۹۱۲…», which asserts delivery the mock never makes; the first plan called that line true and
proposed no copy change, and its review caught the contradiction. The id became `Code for`, «کد
مربوط به», in eight places, three of which hardcode the Persian. Its exit had named the OWNER as
choosing; they declined, so the exit was amended and **the decision is recorded as the author's**.
KN-665 then repaired three descriptions that still said the removed thing, and KN-667 a comment
that overclaimed what its assertion covers. The third whole-task round found nothing.

**KN-591** raised the sign-in note and the resend timer from `text/disabled`, 2.54 to one, to
`text/secondary`, 4.83 light and 4.57 dark measured from the browser. It also closed the gap that
hid it: `darkMode.test.ts` checked the dark palette's text and, in light, only the status chips, so
the light palette's text was never contrast-checked. Its guard is proved able to fail.

**Cards filed 2026-09-16**: KN-660 to KN-667. Open and worth knowing: **KN-663**, the catalog test
never compares an English message with its id, so a renamed id leaves the old English on screen and
484 tests stay green; **KN-664**, the resend controls and the mock provider's naming still presuppose
a send; **KN-666**, the sidebar's «فضای کار» label is the same 2.54 defect; **KN-662**, the two
Empty State instances draw different bodies.

**Still waiting on the owner**: KN-515, KN-516, KN-517 (asked 2026-09-14); the Search Bar and Sort
Control taking KN-275's `border/control`, and **KN-486**, the `fetch`-stubbing tests of
`extraction.service.ts` (both asked in chat 2026-09-15). The Codex log the owner pasted holds the
Groq key; never repeat that key anywhere.

**Roasts run on Codex terra, pinned**: every roast and plan review passes `--model gpt-5.6-terra`.

## What fails, measured 2026-09-16

The unit project is 1529 of 1531: the two are `session.test.ts` under load, KN-551, which passes
alone 2 of 2 every time. The storybook project loses whichever pointer-driven stories run beside
each other, KN-365 — JobCard's `Pressed`, NavItem's `Hover`, Input's `Multiline` and `Latin In A
Persian Page` in one run, each passing alone. The full e2e suite is 91 passed, 2 failed, 9 skipped:
**KN-601**, now in progress, and KN-651, the phone network selection. `App.tsx` line 107 uncovered,
KN-491. The API's gate fails on `extraction.service.ts`, KN-486, so the api workspace's database
tests are run directly, `npx vitest run src/database`, 68 of them.

## The owner's rules, most recent first

- **2026-09-16, through the question tool.** The sign-in note and the resend timer take a colour at
  4.5 to one or better, KN-591; the file's 2.54 is not followed. Asked in the same breath which
  wording the mocked sign-in steps should use, the owner answered "Is that really important that you
  stopped working for? Who cares!" **So a question of that kind is not asked again.** Where a rule
  already decides a thing, the rule decides it, the decision and its reasoning are recorded where
  the next reader will find them, and the work goes on. What is worth their time is what only they
  can settle.
- **2026-09-15, answered through the question tool.** The phone's add form keeps the title first,
  KN-358. The first sign-in may skip the name, "As Figma", KN-588. KarNama writes terms and privacy
  pages and the sign-in note links to them, KN-590 and KN-630. The Loading State turns an arc, KN-616.
- **2026-09-15.** GitHub Pages deep links: real paths, a page per destination, `404.html` for the rest.
- **2026-09-14.** The board is the todo skill's database. The shared skills serve ALL projects: a
  change only adds. A model's work is never roasted by that model. "It should look like the figma."
  The owner reads on a phone: literal truth, no excuses. An instruction carries its date.
- **2026-09-12, to Codex, still standing.** Mock the login. Keep the sample data and the AI
  extraction. Commit and push after work. Never ask the owner to redeploy when nothing changed.
- **2026-09-11.** Push after every close. Only new component cards and their blockers are `critical`.
  No proof at the close. Roasts stay. A finding about the loop is `low`. 100 percent coverage. **Do
  not invent gates.**
- **A finding is a CHILD of its task**, one level, with `--area` and `--okr`. **Plans live beside
  the work**, checked by `roast.py plan` before building, and they stay.

## The next step

1. **KN-591's roast is running**, `kn591-roast.mjs` writing `kn591-roast.txt`: judge each finding
   against the code, file survivors with `--parent-task KN-591`, record the round, relay it.
2. **KN-601 is in progress**, medium, 1 point, web, and it is one of the two standing e2e failures.
   `apps/web/e2e/two-tabs.spec.ts` line 92 fills `getByLabel('اسم و فامیل')`, which is the CONTACT
   MODAL's `Full name`, and line 93 presses «ادامه», which **no catalog holds at all**, so it can
   never match. The signup step draws `First and last name`, «نام و نام خانوادگی», and `Start`,
   «شروع کن», at `AuthScreen.tsx` lines 208 and 217. The test times out at 30 seconds on desktop;
   the file's first test passes in 3.3. Drift on that spec is 0. Write the plan beside the work,
   have it reviewed, then fix and run the spec against a fresh build.

## What to read first

`AGENTS.md` section 7, `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, `todo show KN-601`, and
`apps/web/e2e/two-tabs.spec.ts`. **Never chain a check through a pipe into a commit or a close,
write long scripts with the Write tool, keep apostrophes out of single-quoted strings in scripts,
and read an accessibility claim from the browser's own tree.** A backgrounded run's "exit code 0" is
the shell line's, not the runner's: read the summary out of the file. Give a `-t` filter a positive
control. When a story changes, run the unit project too. When a script edits several files, compute
them all in memory and write only if every count matches. And a story proves a rendered line only
where the story itself pins the global: a helper parameter proves a token.
