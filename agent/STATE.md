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

## Where things stand, 2026-09-17

**Codex's work of 2026-09-12 stays on main**, KN-477, waiting on twenty-five
children. **KN-496 landed the dark `color-scheme` fix by hand**, so
`git stash@{0}` duplicates committed code; left for the owner to drop.

Closed most recently, with their commits: **KN-473** (2572b97), **KN-484**
(9ce2f7b), **KN-716** (32aeb50) and **KN-485** (0f5a1e4, board 195f8d2).
**KN-721 was DROPPED** (e25fd51), not built. Earlier closes are in the board; it
is the record, not this file.

In hand now: **KN-493**, every column folding when its name is pressed.

## What fails, and which failures are known

`npm test` exits 1, and none of it is new work. **Take the failures one at a
time rather than as a total**, and re-run a lone one alone before reading it as
a regression.

- **`session.test.ts`, two**, KN-551's pair.
- **A pointer driven set that MOVES between identical runs**, KN-699 and
  KN-365: `Button` Matrix, the `Input` family, `JobCard` Pressed, `NavItem`
  Hover, and sometimes two in `JobsScreen`.
- **`apps/api`, eight**, all `Test timed out in 5000ms` on database backed
  tests. The API coverage gate also fails at 80.37 percent, KN-486, so
  **coverage is not a signal in that workspace**.

The **story-docs guard** is the one that catches new work: an exported story
with no markdown entry fails it without anyone registering anything. Two
entries per story, `en` and `fa`.

## The trap that cost a whole iteration, 2026-09-17

**No state kept in the shell can go stale across a sign-out, in the product or
in a story.** `AppProviders` renders `OwnBoard`, which is
`<RecordsProvider key={session?.phone ?? ''}>`, and `main.tsx` renders `App`
inside that key, so ANY change of reader unmounts `App`, `Shell` and every ref
they hold. `AGENTS.md` already carried this from KN-419 and I read past it,
because it was phrased as something a story does. The line now carries the
consequence. **KN-721 was filed from a roast, taken, planned, reviewed twice and
built before this was measured, then dropped as impossible.**

The measurement that settled it: instrument the component with a per-mount
identity, not just the state you suspect. The identity changing is what told a
remount from a re-render, and nothing else would have.

## Drift, and the method that was wrong all week

**Drift is PRETTIER drift, measured with the repository's own configuration.**
`prettier --stdin-filepath <the file's real path>` resolves it; formatting a
copy in a temp directory does not, and calls most of the file drift.

A NEW file must measure 0 before it is committed, and `prettier --write` is safe
only where the committed copy already measures 0. **Hold a baseline rather than
improving it**: `App.stories.tsx` sits at 13 and `render.yaml` at 2 em dashes,
both pre-existing. **Read the drift, never chain it.** `eslint` runs from
`apps/web`; nothing lints `agent/scripts`.

**Generated files are not prettier's.** `apps/api/schema.gql` drifts by design;
`schema:check` compares it byte for byte with what the generator emits, so
formatting it would BREAK the build.

## Open children, and what is waiting

**KN-473 has five open children**: KN-717 medium, KN-718 low, KN-719 low,
KN-722 low, and KN-715 blocked on it. KN-716 closed, KN-721 dropped.

**KN-477 waits on twenty-five**, KN-724 and KN-725 among them, both from
KN-485's roast: the first is a real defect, that a missing base variable
suppresses every cross-field rule so the refusal names one thing when three are
wrong; the second a comment falsified by its own commit.

**KN-723** now carries three measured holes in `render.test.ts` and **the
dependency question is the owner's**: parsing `render.yaml` needs `yaml` as a
direct dev dependency, and their seven day `min-release-age` is deliberate.

**KN-698 waits on KN-704**; **KN-697 waits on KN-703**; **KN-016 waits on
KN-689**, blocked on the owner, **and KN-692**; **KN-062 waits on KN-686,
KN-687, KN-688, KN-694 and KN-705**.

**Also open**: KN-681, KN-682, KN-684, KN-673, KN-674, KN-676, KN-677, KN-699,
KN-702, KN-712, KN-713, KN-714, KN-720. **KN-683 IS FOR THE OWNER.** Still
waiting on the owner: KN-515, KN-516, KN-517, KN-486. Owner decided and still to
build: KN-588, KN-630, KN-590, KN-616. The Codex log the owner pasted holds the
Groq key; never repeat that key anywhere.

**KN-685's discipline still binds**: the fixtures' two sentinels are named
nowhere, this file included, because `todo render` writes every description into
the board and the database is committed.

## The owner's rules, most recent first

- **2026-09-16, global.** When they ask WHY, answer with the MECHANISM: the
  line, the file, the command, the condition that fired. **"I don't know" is a
  correct answer** where there is no evidence. **Never invent an authority.**
  **Do not just agree with them.**
- **2026-09-16, global.** When a rule is wrong, or two rules contradict, **STOP
  and ask through the question card**, quoting both with file and line. The
  contradiction gets REMOVED, not re-decided.
- **2026-09-16.** Do not hand-roll what the ecosystem solves. The search belongs
  in the ADDRESS. A story is not a caller. Write in plain words, short
  sentences. The 300 ms debounce STAYS.
- **2026-09-14.** The board is the todo skill's database. Shared skills serve
  ALL projects: a change only adds. **A model's work is never roasted by that
  model.** The owner reads on a phone: literal truth, no excuses. An instruction
  carries its date.
- **2026-09-11.** Push after every close. Only new component cards and their
  blockers are `critical`. **No proof at the close**, and per-task verifier
  scripts with mutations are retired; a one-off planted failure to check a new
  test is not one of those. **Do not invent gates.**
- **A finding is a CHILD of its task**, one level, with `--area` and `--okr`.
  **Plans live beside the work**, reviewed by `roast.py plan` before building,
  every time the plan changes.

## KN-485, closed 2026-09-17

The API started with demo extraction on and no secret, no chosen provider and no
key, reporting itself healthy while every extraction failed. The refusal rides
on `validate: parseEnv`, which Nest already calls, so it is a new rule and not
new wiring.

**The one thing worth carrying: a zod default is applied DURING parsing**, so a
`superRefine` cannot tell a value nobody chose from one chosen explicitly. The
provider lost its default to make the rule observable, and nothing downstream
noticed because both readers already carried that fallback themselves. Its own
roast then found the rule is skipped entirely when a base variable is missing:
KN-724.

## What to read first

`AGENTS.md` section 7, `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, and
for this card `apps/web/src/shared/kanban-column/KanbanColumn.tsx` with
`JobsScreen.tsx` and `KanbanColumn.stories.tsx`.

**A backgrounded run's "exit code 0" is the shell line's**, and a piped
command's `$?` is the LAST stage's. **A green total proves nothing about a new
test**: plant the failure once and watch it fail. **A story that passes where it
should fail is a measurement, not a relief.** A failure set that MOVES between
identical runs is a flake; one that holds still is a break. The runner names a
story's test by its DISPLAY name, spaced. **`npm run` truncates arguments at a
newline on Windows**: call node or python directly. **The Bash tool strips a
doubled backslash**, so a regex built through a shell heredoc matches the wrong
thing: write such scripts with Write. Plan reviews are NOT saved: `roast.py`
unlinks its scratch file, and `agent/roasts/` holds task roasts only.
