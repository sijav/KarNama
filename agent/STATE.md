# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale.

Numbers live in `board.json`, not here: `npm run todo -- next`, `show <id>`,
`list`.

---

## The task spec

Build **KarNama** (کارنما), a job application tracker, driven by a Ralph loop.
A job seeker adds a posting themselves, by link or text; the product structures
it into a record; the record carries a status through the search. **The value is
the trail, not the listing.**

**Scope is closed.** Searching boards and aggregating ads were cut. **Crawling
is permanently out.** Two owner additions: third parties can leave comments or
suggested changes, stored rather than applied, and an admin panel over them.

Monorepo, npm workspaces. React 19, TypeScript, MUI, Storybook, Vitest,
Playwright, 100 percent coverage. NestJS, GraphQL code first, Prisma, Postgres.
GitHub Pages for web, Render for the API, Supabase for the database, with a 50
second cold start the UI must handle honestly. lingui, **English is the source**.
**Components first with their stories, then screens. Match the design exactly.**
**Auth is phone OTP**, provider mocked for the MVP.

## Where things stand

35 done, 160 open, 2 dropped. **Two open criticals, and they are one redesign
seen twice**: **KN-193 - The close recogniser is not the head token, so any
command's arguments can be the close**, in progress, and **KN-197 - The order
check parses shell badly instead of refusing the shapes it cannot parse**. Both
are children of KN-184 and both live in `lib/prompt-order.mjs`. The reviewer's
one line covers both: stop treating shell text as tokenisable by two ad-hoc
parsers, and REFUSE expansion and escape syntax the way `&&` and `;` are already
refused, since refusing is the mechanism in that file that actually works.

**KN-190 closed and did not fix its own class.** It removed the `echo` instance
and left the general one: `readCommand('grep todo move <id> done')` is still
`closes: true`, so a marked block of that line, then the real roast, then the
real close returns `ok: true`. Its own amended exit condition says "the close is
the head token of its line" and the code never did that, and its verifier had no
counterexample for that clause, so 13 green checks established less than they
looked like. KN-190 stays done, because done is terminal; KN-193 carries the
work.

`apps/web`: 229 tests over 15 files, 100 percent on all four metrics, 8
Playwright tests. The unit project alone is 208, worth knowing because a
suite-wide count cannot say the unit project ran. `apps/api`: 96 tests.
`packages/graphql`: 4, with operations validated against the schema at
generation time.

## The owner's rules, most recent first

**Do not invent gates.** Rule zero, now at the top of `agent/RALPH.md`. It gets
broken by accident and looks like diligence: a roast finds something, the fix
that suggests itself is a check that refuses the next occurrence, that becomes a
card, and its exit condition is a gate nobody asked for. Four were removed on
2026-09-10. **Above all, no gates in the SKILLS**: an agent may use them however
it likes. Tests yes, refusals no.

**Finish, prove, commit, CLOSE, then roast.** A task is done when its verifier
passes, not when a reviewer approves. `done` is terminal, enforced. There is no
fix-in-task rule any more; the roasted card is already closed.

**A finding is a CHILD of the task it came out of**, one level. When the LAST
open child closes, roast the parent together with all its children, and repeat
until a round finds nothing. **KarNama's board cannot express this yet**, since
its `parent` field means BLOCKED BY, so findings record their parent in prose.
KN-188 carries the work; the global `todo` skill already has `--parent-task`.

**Test scope follows the same line**: no parent closes on the full suite, a
child closes on the tests for the files it changed.

**Plans live beside the work**, `#<id> - <title>.md`, and they STAY when the
task closes.

**Do not run this repository's machinery against another project.** SkipBureau's
rules were to be CHECKED once, not driven from here. Nothing under
`agent/scripts/verify` may name it or resolve a path above the root, and
`KN-166.mjs` asserts that.

## What keeps going wrong, one line each

**A check that searches for a string, and contains that string, flags itself.**
Four times on 2026-09-10 alone. Stripping comments is not enough when the needle
sits in a regex literal, which is code. Assemble the needle at runtime.

**A literal match against prose fails when the prose is REWORDED or WRAPPED.**
"not a\nreason" across a line break; "CHILD" against "CHILDREN"; markdown bold
splitting "**last** open child". Collapse whitespace, and match the concept.

**An ABSENCE proves nothing without a positive control on the same instrument.**
A listing that collected nothing looks exactly like a correctly scrubbed one.
**This applies to MUTATION testing too, and that is where it was missed.** I
declared a mutation impossible to catch after trying only NEGATIVE fixtures,
mentions that should not count. Every one of those fails safe by accident when
the rule is broken, so they all look identical. The isolating fixture was a
POSITIVE one, a legitimate command with a quoted argument,
`todo move <id> "done"`: `closes: true` with quote handling, `false` without.
A reviewer found it in one line. **Declaring something unprovable is a strong
claim and needs the same evidence as any other.**

**`npm run` SILENTLY TRUNCATES every argument at its first newline on Windows**,
because it routes through cmd.exe. Everything after line one, including every
later flag, is dropped with no error. `npm run todo -- show "KN-190\nJUNK"`
prints KN-190's card; the same call through `node agent/scripts/todo.mjs` says
the two-line string does not exist. **So pass prose as ONE line, or call the
script with `node` directly.** A multi-line `--evidence` through npm would close
a card on half a sentence. KN-195. Nothing on the board was corrupted, checked.

**There are TWO roast harnesses and only one is board-recordable.**
`python ~/.claude/skills/roast/roast.py plan` checks a PLAN, writes to scratch,
records nothing. `node agent/scripts/roast.mjs <id>` is the TASK roast: it
archives to `agent/roasts/` with a `.meta.json` sidecar, and `todo roast --file`
verifies that digest, so a review run any other way cannot be recorded on the
card. RALPH.md line 199 and line 297 say exactly this and I still used the wrong
one.

**A proxy for the exit condition is not the exit condition.** KN-100 first
proved its clause with `vitest list` instead of running the verifier the card
named.

**Every version of a check that INFERS which thing is normative will be
defeated by words**, because words are what an editor changes. Three versions of
the prompt-order check proved it. Make the thing declare itself.

**The suite can CERTIFY a bug rather than miss it.** KN-112's test asserted the
stale write as expected. Read the existing expectations before assuming a bug is
merely uncovered.

**Check that the fallback you rely on EXISTS before you rely on it.** Two plan
files were deleted on the reasoning that git held them; `.gitignore` had been
ignoring them all along and one is gone for good. `git check-ignore -v`,
`git ls-files --error-unmatch`, `git cat-file -e HEAD:<path>`.

**Shell heredocs eat backslashes**, and a python heredoc silently applied
nothing three times on 2026-09-10 while reporting success. **Use the Edit tool
for code.**

**Do not edit source while a mutation harness or a roast is reading it.**

**The mutation that must SURVIVE is the strongest evidence available**:
reproduce the old implementation and watch it wave the defect through.

**A verifier built from examples tests the examples.** Go clause by clause
through the exit condition: each declared guarantee needs a fixture that passes
because it holds AND a mutation that breaks it and makes that fixture fail.
KN-190 was green on 13 checks with no test for its own central clause. Now in
RALPH.md step 3.

**Mutate the CONTRACT, not only the implementation.** When a check's authority
rests on a constant inside it, a list of ids, a registry, a threshold, that
constant is the thing to break. KN-149's harness broke the code eight ways and
never touched the registry, so dropping a card from the contract left all five
checks green. It proved the code enforces the list and said nothing about
whether the list is right. **The general fix is BOTH DIRECTIONS**: everything
the registry names must comply, and everything that complies must be named.

## The skills

`todo` and `roast` each ship a Node and a Python half, proved equivalent by
parity harnesses that drive both real entry points and compare what they
produced, not by asserting the files exist. `loop` ships no script on purpose.
Roast results go to a scratch directory, never into a project; only the session
list stays project-local, because it resumes conversations.

## Next step

**KN-193**, then **KN-197**. They are one piece of work: a narrow grammar for the
command block, where the close is the HEAD token, the roast is matched only from
UNQUOTED tokens, one place decides what is quoted, and `$(...)`, backticks,
`${...}` and escaped quotes join `&&` and `;` in the REFUSED list. Confirmed
false passes to kill, each reproduced by running it:

- `grep todo move <id> done` reads as a close, and a block of that line, the
  real roast, then the real close returns `ok: true`;
- `env echo todo move <id> done` walks past the printer list;
- `todo move <id> done "$(python <path>/roast.py task)"` is read as inert data
  when a shell runs it first;
- `sh -c '...' \"; todo move <id> done \" # x` hides its semicolon inside a fake
  quoted span, because the operator check is a second, disagreeing parser;
- `grep "/tmp/roast.py" task` reads as a roast.

Legitimate shapes that must keep working: `todo move <id> done`,
`todo move <id> "done"`, `npm run todo -- move <id> done`, and
`python <path>/roast.py task --title ... &`.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`, in that order,
every iteration. Then `npm run contract`, which is a regression checker over ten
rules and not a proof that the board matches the design.
