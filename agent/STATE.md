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

## KN-484, closed 2026-09-17, and what it settled

**All three address keys shared one bucket**, not just extraction: `extract-demo`, `sms-ip` and `verify-ip` all read
`context.req.ip ?? context.req.socket.remoteAddress ?? ''` while `trust proxy` is 0, so Express reported Render's
proxy. The card's why called the SMS and verify case future; it was already true.

**The durable fact, now in `AGENTS.md` section 7**: behind Cloudflare, `X-Forwarded-For` is CALLER CONTROLLED and
`CF-Connecting-IP` is not. Cloudflare overwrites the latter on every request and only APPENDS to the former, so a
limit keyed on `X-Forwarded-For` is one the caller chooses, which is worse than one shared bucket because it looks
fixed. Express's numeric `trust proxy` reads that same header from the right, so a hop count inherits the problem, and
Render publishes no chain length anyway.

**Two owner decisions, and the second replaced the first.** I reported that Render documented nothing and the owner
chose to measure the header on the deployed service; that question rested on my incomplete reading, and told the
truth, the owner ruled: use `CF-Connecting-IP`. Both are on the card in order. No deployed header logging was done.

`src/client-ip.ts` reads the header with the old chain behind it, all three call sites use it, and `sourceText` is
exported so the length rule has one definition with the resolver refusing before any limit, authentication first.
**Its roast filed KN-720**: a BLANK header does not fall through, since `??` catches only null and undefined, and the
test comment claims the opposite while testing only the empty array.

## The next step: KN-716, the shell moves focus on an ordinary navigation

**In progress**, high, 2 points, web, a child of KN-473 and my own overreach from it.

**Measured**: focusing a nav control and activating it, in both directions, leaves `document.activeElement` on `MAIN`.
The effect takes focus off the control the reader chose, which `DESIGN.md` line 842 says is unsettled and KN-715's.

**The first design was refused by the review and the reason matters**: `activeElement === body` IS reliable at
layout-effect time, because React runs the layout effect after commit and before paint while MUI restores focus in a
PASSIVE effect. But `body` is a SYMPTOM, not the cause: focus also lands there on an ordinary navigation when focus
was inside the outgoing screen, so keying on it would decide KN-715's question by another route. The policy must be a
narrowly named transient signal from the confirmation path, with `body` kept only as a safety condition.

**The hazard found by reading the precedent**: `onSelecting` is the house way a screen tells this shell something, and
it is a layout effect that CLEARS ITSELF on unmount. Copying it would set the signal false before the shell reads it,
in exactly the case the signal exists for. KN-473's own sentinel is never cleared in a cleanup, which is checked
against the committed code, and that is the precedent to follow instead.

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
