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

Closed most recently, with their commits: **KN-708** (6454eb9), **KN-389**
(5c5b31a), **KN-710** (996653f), **KN-711** (3c2df74), **KN-407** (7b0ca8d),
**KN-426** (1a8fc05), **KN-468** (9422275), **KN-473** (2572b97, board 1ceb651,
roast 7ff61aa) and **KN-484** (9ce2f7b, board 1c52933, roast d1eee9e). Earlier closes are in the board; it is
the record, not this file.

## What fails, and which failures are known

`npm test` exits 1, and none of it is new work. **Take the failures one at a
time rather than as a total**, and re-run a lone one alone before reading it as
a regression.

- **`session.test.ts`, two**, KN-551's pair.
- **A pointer driven set that MOVES between identical runs**, KN-699 and
  KN-365: `Button` Matrix, the `Input` family, `JobCard` Pressed, `NavItem`
  Hover, and sometimes two in `JobsScreen`. Stories driving the real pointer
  collide when story files run in parallel; the `JobsScreen` pair was re-run
  alone and passed 2 of 2.
- **`apps/api`, eight**, all `Test timed out in 5000ms` on database backed
  tests. The API coverage gate also fails at 80.37 percent, KN-486, so
  **coverage is not a signal in that workspace**: a threshold failure there is
  not evidence about a change, and a pass is not available to claim.

The **story-docs guard** is the one that catches new work: it reads the
repository, so an exported story with no markdown entry fails it without anyone
registering anything. Two entries per story, `en` and `fa`.

## Drift, and the method that was wrong all week

**Drift is PRETTIER drift, and it must be measured with the repository's own
configuration.** Formatting a copy in a temp directory loses that configuration:
the formatter falls back to double quotes, semicolons and an eighty column wrap
and calls most of the file drift. That method invented a 120 to 142 overrun on
`App.tsx` and nearly bought a round of comment cutting to fix a phantom.
`prettier --stdin-filepath <the file's real path>` resolves it and says 0.
`DESIGN.md` measures 236 under BOTH methods, which is what made the broken
numbers look corroborated. `AGENTS.md` section 7 carries this.

A NEW file must measure 0 before it is committed, and `prettier --write` is safe
only where the committed copy already measures 0. **Read the drift, never chain
it.** `eslint` runs from `apps/web`; nothing lints `agent/scripts`.

## Open children, and what is waiting

**KN-473 has four open children**, all from its roast, all `web`, all OKR-1:
**KN-716** high, **KN-717** medium, **KN-718** low, **KN-719** low. See the
section below for what they are.

**KN-715** is filed and blocked on KN-473: whether an ordinary navigation, where
the reader clicked a control that survives the change, should move focus at all.
Nobody has read it either way, and the one reading taken used a programmatic
click, which focuses nothing.

**KN-698 waits on KN-704 and KN-708 is closed**; **KN-697 waits on KN-703**;
**KN-016 waits on KN-689**, blocked on the owner, **and KN-692**; **KN-062 waits
on KN-686, KN-687, KN-688, KN-694 and KN-705**. **KN-695 is finished**, three
children and three rounds, the last finding nothing.

**Also open**: KN-681, KN-682, KN-684, KN-673, KN-674, KN-676, KN-677, KN-699,
KN-702, KN-712, KN-713, KN-714. **KN-683 IS FOR THE OWNER.** Still waiting on
the owner: KN-515, KN-516, KN-517, KN-486. Owner decided and still to build:
KN-588, KN-630, KN-590, KN-616. The Codex log the owner pasted holds the Groq
key; never repeat that key anywhere.

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
  test is not one of those, and `AGENTS.md` asks for it. **Do not invent gates.**
- **A finding is a CHILD of its task**, one level, with `--area` and `--okr`.
  **Plans live beside the work**, reviewed by `roast.py plan` before building.

## The two cards closed before this one, in one paragraph each

**KN-473** (2572b97). Refused as filed and re-scoped on the board BEFORE anything was built. The card said an unmount
leaves focus on a detached opener with nothing to catch it; MUI's `FocusTrap` does run and focuses the opener, and
focusing a detached element is inert, so the reader ends on the body because the restore MISSES. No cleanup inside
`ConfirmModal` could reach it, all four call sites being unconditional siblings whose fallbacks die with the screen,
so the remedy went to the shell. Its roast filed four children, KN-716 to KN-719, the first being my own overreach.

**KN-484** (9ce2f7b). All three address keys shared one bucket. The durable fact is in `AGENTS.md` section 7: behind
Cloudflare, `X-Forwarded-For` is caller controlled and `CF-Connecting-IP` is not. Two owner decisions, the second
replacing the first once I corrected my own bad reporting. Its roast filed KN-720, a blank header not falling through.

**Neither is retold further here on purpose.** What survives a card belongs in `AGENTS.md`, `DESIGN.md` or the plan
beside the work; this file points at the record rather than being a second copy of it, which is how it grew to twice
the length it is meant to be.

## KN-716, closed 2026-09-17, and the one durable thing it settled

**It was my own overreach from KN-473**, filed `high` by that card's roast and handed straight back by the selection
law. The shell focused the page region on EVERY change between the board and the network page, while `DESIGN.md` said
in the same commit that an ordinary navigation was unsettled and KN-715's.

**The design that survived two refusals**: a ONE-SHOT LATCH, the board only. `JobsScreen` reports its delete
confirmation through `onJobDeleteConfirmationOpenChange` from a layout effect with **no cleanup**; `App.tsx` consumes
and clears it on a screen change and keeps `activeElement === body` only as a SAFETY condition. Two earlier designs
were refused: keying on `body` alone, which is a symptom that also occurs on an ordinary navigation, and signalling
from both screens, which would have covered a network confirmation nobody measured.

**The missing cleanup is the whole design.** React runs a removed screen's layout-effect cleanup BEFORE taking its DOM
away, then runs the surviving shell's layout effect, so the `onSelecting` pattern would have erased the signal before
the shell could read it, in exactly the case it exists for.

**Two traps worth carrying, both now in `AGENTS.md` section 7.** Two guards in sequence can make each other
untestable: with the latch unset AND focus surviving, either one returns early, so no single mutation fails and the
proof shows a narrowing without showing which condition draws it. And the way you DRIVE a fixture can destroy the
condition it needs: the story meant to lose focus was first driven by clicking, and `userEvent.click` focuses what it
clicks, so it failed on its own premise assertion rather than passing blind.

**KN-473 now waits on three**: KN-717, KN-718, KN-719.

## What to read first

`AGENTS.md` section 7, `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, and
for this card `apps/api/src/extraction/extraction.resolver.ts` with
`auth.service.ts`, `env.ts`, `main.ts` and `render.yaml`.

**A backgrounded run's "exit code 0" is the shell line's**, and a piped
command's `$?` is the LAST stage's: `tsc | head; echo $?` reports `head`. Read
the exit code apart. **A green total proves nothing about a new test**: plant
the failure once and watch it fail. **A failure set that MOVES between identical
runs is a flake; one that holds still is a break**, and a lone failure is re-run
alone before it is read as a regression. The runner names a story's test by its
DISPLAY name, spaced. **`npm run` truncates arguments at a newline on Windows**:
call node or python directly. Plan reviews are NOT saved anywhere: `roast.py`
unlinks its scratch file after reading it and `agent/roasts/` holds task roasts
only, so the reviewer's own session transcript is the last copy.
