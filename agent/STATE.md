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

**Codex's work of 2026-09-12 stays on main**, KN-477: login mocked at the owner's word, Groq
extraction on Render, Settings, drag and drop, collapse, date validation, the growing paste field,
the job modal's form. It waits on twenty-five children. **KN-496 landed the dark `color-scheme` fix
by hand**, so `git stash@{0}` duplicates committed code; left for the owner to drop.

**Closed 2026-09-16**: KN-514, KN-524, KN-535, KN-543, KN-544, KN-559, KN-658, KN-542, KN-564,
KN-565, KN-589, KN-665, KN-667, KN-591, KN-601, KN-669, KN-670, KN-618, KN-675, KN-626, KN-678,
KN-651, KN-679, KN-680, KN-666, KN-668, KN-672, **KN-306** (d8c9d9f), **KN-380** (17472be),
**KN-685** (43898ec). **Dropped**: KN-657, and **KN-663** (de6157c), filed on a false premise its own
plan review caught.

**THE E2E SUITE IS GREEN**: 93 passed, 0 failed, 9 skipped over 102 tests.

**KN-016 was roasted as a WHOLE TASK** with KN-314, KN-315 and KN-380, the round the board calls for
when the last child closes. Four survivors filed, **KN-689** to **KN-692**, and two clean bills worth
keeping: KN-314's invariant holds by derivation, `onSearch` is never called with a string the field
did not show; and the two handlers are not duplication, since extracting them would hide the
difference between typing and clearing. The reviewer could not run the suite in its sandbox, so every
timing claim was re-derived here before filing.

## What KN-685 established, and what it did NOT

The fixtures' two sentinels are now values **held by no other file in the repository**, measured over
`git ls-files -z --cached --others --exclude-standard`, tracked plus non-ignored untracked, 1281
files, compared as bytes. **The values are named nowhere**: not in the cards, the plans, the evidence,
the commit messages, this file, or the verifier's output, which prints their count and lengths only.
That is the fix rather than fastidiousness: `todo render` writes every description into the board and
the database is committed, so **naming a value is what puts it in the repository**, and it had already
disqualified all three replacements the card itself proposed. Read the values from the two JSON files.

**NOT established: that they stay unique.** A search settled it once; nothing re-checks it, and the
verifier says so in its own closing lines. A value copied into shipped source later makes a bundle hit
ambiguous.

**My plan was wrong first and the review caught it**, which is the part to carry: I argued the exit
condition was unsatisfiable and proposed replacing it with a property of my own. That was a false
generalisation from "the values I named are disqualified" to "no value can qualify". It is the mirror
of the overclaim this repository keeps recording against me, and worse, because an overclaim ships a
weak check while a false impossibility rewrites the requirement. All four lessons are in `AGENTS.md`
section 7 now.

## Open children, and what is waiting

**From KN-016**: **KN-689**, a parent that answers one commit late loses the search, where KN-016's
exit promises the final keystroke is never dropped; **KN-690**, the "at once" claims about clearing,
in three sites and both languages; **KN-691**, the docs say `placeholder` follows `label`, which the
component has never done; **KN-692**, no story pins that a layout change leaves a pending search
alone.

**KN-062 waits on five**: KN-686, KN-687, KN-688, and from KN-685's own roast **KN-693** and
**KN-694**. KN-685 is itself a child, so its findings flatten onto KN-062; one level, and the skill
says so as it files them. **KN-693 is mine and it is instructive**: KN-685 took the sentinel values
out of the verifier's success line, arguing that this loop pastes command output into evidence, and
left them in the two paths that print when something is WRONG, which is when output actually gets
quoted. The argument for the change condemned what it left behind. **KN-694 is the guard KN-685's
evidence said it could not write honestly**, supplied by the reviewer: derive the sentinels, scan
`git ls-files -z --cached --others --exclude-standard`, and fail unless each one's only holder is its
own locale JSON, reporting paths and never values. It claims a property of the worktree and nothing
about what the build read, which is what separates it from the sourcemap check that was dropped.

**Also open**: KN-681 and KN-682 from KN-666; KN-684 from KN-668; KN-673 and KN-674 from KN-618;
KN-676 and KN-677 from KN-675. **KN-683 IS FOR THE OWNER**: walking `text/secondary` to a readable
value touches a Figma-defined token across 43 sites, which is theirs to decide.

**Still waiting on the owner**: KN-515, KN-516, KN-517; the Search Bar and Sort Control taking
KN-275's `border/control`; **KN-486**, the `fetch`-stubbing tests of `extraction.service.ts`. Owner
decided and still to build: KN-588, KN-630, KN-590, KN-616. The Codex log the owner pasted holds the
Groq key; never repeat that key anywhere.

**Roasts run on Codex terra, pinned**: every roast and plan review passes `--model gpt-5.6-terra`.
`roast.py` takes the work as `--did`, the file list as `--files`, the diff as `--diff`; a plan goes in
`--did` too, and omitting `--fresh` resumes that mode's session so a re-review sees its own earlier
round. `todo roast` needs `--file`, and `--filed none` when a round finds nothing.

## What fails, measured 2026-09-16

The unit project is **1529 of 1531 over 42 of 43 files**, measured twice today either side of a
fixture change and identical both times: the two are `session.test.ts` under load, KN-551, by name,
`keeps demo authentication separate from a stored server token` and its live twin, and they pass
alone. The storybook project loses whichever pointer-driven stories run beside each other, KN-365.
**The e2e suite passes whole**; **"a fresh build" means `CI=1`**, since the config reuses a running
server otherwise, and its webServer runs `tsc --noEmit` first, so a mutation that leaves a symbol
unused stops the server rather than failing a test. `App.tsx` line 107 uncovered, KN-491. The API's
gate fails on `extraction.service.ts`, KN-486, so the api workspace's database tests are run directly,
`npx vitest run src/database`, 68.

**eslint runs from `apps/web`**, which is where the config is; the root has none. The root `lint`
script runs per workspace and `agent/` is not one, so **nothing lints `agent/scripts` at all**: a
verifier's cover is Prettier drift and `node --check`.

## The owner's rules, most recent first

- **2026-09-16, in chat.** "are you commiting and pushing after fixes", yes, and every close is a work
  commit, the card closed with evidence, the board rendered and committed, then a push.
- **2026-09-16, through the question tool.** The sign-in note and the resend timer take 4.5 to one or
  better, KN-591. Asked in the same breath which wording the mocked sign-in steps should use: "Is that
  really important that you stopped working for? Who cares!" **So a question of that kind is not asked
  again.** Where a rule already decides a thing, the rule decides it.
- **2026-09-15, through the question tool.** The phone's add form keeps the title first, KN-358. The
  first sign-in may skip the name, "As Figma", KN-588. KarNama writes terms and privacy pages and the
  sign-in note links to them, KN-590 and KN-630. The Loading State turns an arc, KN-616.
- **2026-09-14.** The board is the todo skill's database. The shared skills serve ALL projects: a
  change only adds. A model's work is never roasted by that model. "It should look like the figma."
  The owner reads on a phone: literal truth, no excuses. An instruction carries its date.
- **2026-09-12, to Codex, still standing.** Mock the login. Keep the sample data and the AI
  extraction. Commit and push after work. Never ask the owner to redeploy when nothing changed.
- **2026-09-11.** Push after every close. Only new component cards and their blockers are `critical`.
  No proof at the close. Roasts stay. A finding about the loop is `low`. **Do not invent gates.**
- **A finding is a CHILD of its task**, one level, with `--area` and `--okr`. **Plans live beside the
  work**, checked by `roast.py plan` before building, and they stay.

## The next step

**KN-690 is in progress**, medium, 1 point, web, a child of KN-016. Its plan is written beside the
work at `apps/web/src/shared/search-bar/` and is with the reviewer; nothing is built.

**The card names three sites and a search found five false sentences across four files.** The fourth
file is `SearchBar.stories.tsx` line 184, inside the `Clearing` story, and it **contradicts a correct
comment four lines below it**: line 188 already says, in KN-380's own words, that the search now runs
from an effect so the field commits first. Correcting three sites and leaving that one is the defect
this card exists to prevent, so it is in scope though the exit does not name it. Two hits are TRUE and
must not be touched: `en` and `fa` line 5 both say what is typed is reported at once, and `onChange`
really is called synchronously in the handler. The phrase in the three older plans beside the
component stays, since a dated plan records what was true when it was written, the line KN-685's
review drew for the e2e spec.

Three sentences say clearing searches "at once" or "straight away" without the condition they
actually carry, and the Persian says it with «بی‌درنگ»: `SearchBar.tsx` line 56, and in both
story-docs files the opening paragraph and the `onSearch` entry. KN-380 moved that call out of
`clear()` into the effect, so it runs after the field commits as empty rather than inside the handler,
and it does **not** run at all where the parent refuses the clear, which is exactly what the
`ClearIgnored` story asserts. Its exit asks that each of the three sites say what happens, naming
`Clearing` and `ClearIgnored` as the two cases, in both languages.

## What to read first

`AGENTS.md` section 7, `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, and for this card
`apps/web/src/shared/search-bar/SearchBar.tsx` with both `Shared-SearchBar.md` files. **Never chain a
check through a pipe into a commit or a close, write long scripts with the Write tool, and keep
apostrophes out of single-quoted strings in scripts.** A backgrounded run's "exit code 0" is the shell
line's, not the runner's, and a run that skipped every test exits 0 too: **read the summary line, and
refuse it on "skipped" or a zero total**, keeping "could not run" distinct from "does not hold". When
a script edits several files, compute them all in memory and write only if every count matches. A
story proves a rendered line only where the story itself pins the global. Drift is **Prettier** drift,
lines a format would change, HEAD's copy against the worktree's; `prettier --write` is safe only on a
file whose committed copy already measures 0.
