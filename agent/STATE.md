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
roast 7ff61aa). Earlier closes are in the board; it is the record, not this file.

## What fails, measured 2026-09-17 on commit 2572b97

`npm test` exits 1. **None of it is the web change, and the count was checked
rather than assumed**: 11 failures in `apps/web`, 8 in `apps/api`.

- **2 were mine and are fixed**: the story-docs guard, which failed because two
  new stories had no markdown entries. It reads the repository rather than a
  fixture, so a story with no entry fails it without anyone registering it.
  Back to 12 of 12 once four entries were written, two per language.
- **2 are KN-551's** `session.test.ts` pair.
- **7 are pointer driven and pass in isolation.** The two `JobsScreen` ones were
  re-run alone and passed, 2 of 2, which is KN-365's signature. The other five,
  `Button` Matrix, three in the `Input` family, `JobCard` Pressed and `NavItem`
  Hover, are attributed to KN-699's moving set rather than re-run: **two were
  measured, five are attributed**, and the distinction is the honest one.
- **The 8 in `apps/api`** are all `Test timed out in 5000ms` on database backed
  tests, in a workspace the web change does not reach. The API gate also fails
  on `extraction.service.ts`, KN-486.

`npm run lint` is 0 across all three workspaces, `tsc --noEmit` 0, `npm run
build` 0 including the API's `schema:check`, and no coverage threshold failed.

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

## KN-473, closed 2026-09-17, and what its roast found

**The card was REFUSED as filed and re-scoped before anything was built**, and
its title, description and exit were rewritten on the board first. Measured end
to end: a delete confirmation open on the board, then Back, lands on the network
page with `document.activeElement` on the page body.

**The card's mechanism was wrong and this is the durable part.** It said nothing
catches the unmount. MUI's `FocusTrap` registers a cleanup on its `[open]`
effect that focuses the recorded opener when React removes the tree; focusing a
DETACHED element is inert, measured, so the reader ends on the body because the
restore MISSES, not because nothing ran. `ConfirmModal` unmounts only when its
host screen does, all four call sites being unconditional siblings, and both
callers end their fallback at the screen's own root, so no cleanup there could
reach it. The remedy went to the shell: `main` takes a ref and `tabIndex={-1}`,
and a `useLayoutEffect` moves focus there when a derived `'jobs' | 'network'`
changes, collapsing the add route so opening the add flow does not fight its
trap.

**The roast found one real thing and I agree with it.** The effect fires on
EVERY change between the two screens, an ordinary navigation click included,
which is exactly what `DESIGN.md` says is unsettled and hands to KN-715, and
what the plan review told me in advance not to fold in. I recorded that answer
and built the broad version anyway: **KN-716**, high. Also **KN-717**, focus at
the moment sign-in completes, where the control the reader used has just
unmounted and the first-run rule reads the arriving board as a cold load;
**KN-718**, the page region takes focus with no name, so nothing says which
screen arrived; **KN-719**, the English docs entry says the browser gives focus
back where MUI's trap calls `.focus()` itself. Nothing was rejected.

## The next step: KN-484, the rate limit behind Render

**In progress**, medium, 2 points, `api`, from KN-477's review.
`extraction.resolver.ts` 20 keys the demo limit on
`context.req.ip ?? context.req.socket.remoteAddress ?? ''`, `env.ts` 27 defaults
`TRUST_PROXY_HOPS` to 0 with a max of 5, `main.ts` 29 sets `trust proxy` from
it, and `render.yaml` never declares it. `auth.limit` counts and checks in ONE
atomic upsert, so there is no refund and validating before counting means
validating before `limit` is called at all. `extract()` rejects
`trim().length < 10 || > 30_000`.

**TWO THINGS ARE UNSETTLED AND BOTH GO IN THE PLAN.** First, `app.set('trust
proxy')` lives in `bootstrap()`, which `Test.createTestingModule` never runs, so
a test that sets it itself proves Express and NOT the production path, which is
the same false proof KN-473 refused. Second, **Render documents no hop count**:
its own article says traffic crosses Cloudflare AND Render's load balancers and
tells you to read `x-forwarded-for`, so the exit's "as Render documents it,
checked rather than guessed" is not satisfiable as written, and a fixed 1 would
hand back Cloudflare's address rather than the reader's.

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
