# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale.

Numbers live in `board.json`, not here: `node agent/scripts/todo.mjs next`,
`show <id>`, `list`.

---

## The task spec

Build **KarNama** (کارنما), a job application tracker, driven by a Ralph loop.
A job seeker adds a posting themselves, by link or text; the product structures
it into a record; the record carries a status through the search. **The value is
the trail, not the listing.**

**Scope is closed.** Searching boards and aggregating ads were cut. **Crawling
is permanently out.** Two owner additions: third parties can leave comments or
suggested changes, stored rather than applied, and an admin panel over them.

Monorepo, npm workspaces. React 19, TypeScript, MUI 9, Storybook 10, Vitest,
Playwright, 100 percent coverage. NestJS, GraphQL code first, Prisma, Postgres.
GitHub Pages for web, Render for the API, **Neon** for the database (chosen over
Supabase, which pauses after seven idle days, and Render's own Postgres, which
expires after thirty), with a 50 second cold start the UI must handle honestly. lingui, **English is the source**.
**Components first with their stories, then screens. Match the design exactly.**
**Auth is phone OTP**, provider mocked for the MVP.

## Where things stand

**57 done, 165 open, 3 blocked, 2 dropped.** Coverage 100 percent on all four
metrics in every workspace. Counts live in `board.json`.

**This stretch closed the component findings one by one**: the Checkbox has
its Hover story, driven by a REAL pointer and proved real by failing under a
dispatched one (KN-208, KN-220, KN-225); the Tooltip is the frame's 260 by 82,
padded 8 by 12, with its own unnamed shadow, sized by its own box-sizing and
found by a marker class (KN-210, KN-218, KN-222). Three lint holes closed on
the way (KN-094, KN-095, KN-224).

**Four components exist**: KN-013 Checkbox, KN-017 Filter chip, KN-032 Tooltip
and the language switch, all from Figma nodes and verified by reading computed
styles in a browser. **The live site is still a placeholder shell**, because
screens come after components, and the owner has seen it and said so.

**KN-214 is the most important open defect and is deliberately held.** The
lingui plugin compiles `ignore` patterns with NO flags, so `^[^\\p{L}]*$` means
'contains no p, {, L or }': every Persian string and every English word without
a p passes the gate. 82 strings in `src` pass only because of it. It is held at
high so the components come first, see below; restore it to critical when the
last component card closes. Until then, every component string goes through
lingui BY HAND and every story asserts both languages.

**IT IS DEPLOYED.** The web app is at https://sijav.github.io/KarNama/ and
Storybook, as a SEPARATE site, at https://sijav.github.io/KarNama/storybook/;
both redeploy from `.github/workflows/pages.yml` on every push to `main`. The
database is **Neon**, migrations applied, nine tables, and the API boots against
it and answers `{ health { status } }`. The API is not yet on Render: the
service needs `NPM_CONFIG_PRODUCTION=false` in its dashboard, because Render
does not retroactively apply `render.yaml` to a service it already created.

**KN-196 - Decide how a card is dropped onto a column collapsed to a count is
BLOCKED on the owner**, and the reason matters: they were asked, said no
preference, and then said to ask AGAIN once there is a running board to look at.
Nobody can judge how a drag feels from three bullet points. Do not decide it.

## The owner's rules, most recent first

**FINISH THE COMPONENTS FIRST**, 2026-09-10, after the owner opened the live
site and found a placeholder. Every open component card and every open finding
on a built component is `critical`; the selection law ranks by severity then by
the smaller story point, so three- to eight-point components had kept losing to
one-point gate cards. It is an ORDERING decision carried in the severity field,
and each raised card says so in a note. **Do not 'correct' those severities.**
KN-061 stays high because it waits on KN-196, the owner's decision.

**100 percent coverage is a PRODUCT rule.** `apps/*` and `packages/*`, not
`agent/scripts/**`, and **markdown has no tests**. In `AGENTS.md`.

**The loop must not eat itself.** On 2026-09-10 the owner stopped the session:
five cards had gone into a checker for the ordering of two lines in a markdown
file, each filed critical, while 65 component cards sat untouched. A roast of
the agent's own machinery always produces more machinery. **A finding about the
LOOP rather than the PRODUCT is `low` unless it is actively breaking the work.**
18 machinery cards were demoted on that basis; they are still real, they just do
not outrank building KarNama.

**Do not invent gates.** Rule zero, top of `agent/RALPH.md`. **Above all no
gates in the SKILLS**: an agent may use them however it likes. Tests yes,
refusals no.

**Finish, prove, commit, CLOSE, then roast.** `done` is terminal, enforced.

**A finding is a CHILD of the task it came from**, one level. When the LAST open
child closes, roast the parent with all its children. **KarNama's board cannot
express this**, since its `parent` field means BLOCKED BY, so provenance is
recorded in prose as `CHILD OF KN-xxx`. KN-188 carries the work.

**Test scope follows the same line**: no parent closes on the full suite, a
child closes on the tests for the files it changed.

**Plans live beside the work**, `#<id> - <title>.md`, and they STAY.

## What keeps going wrong, one line each

**A check that searches for a string, and contains that string, flags itself.**
Now EIGHT times; the newest, a mutation guard in KN-095's verifier refused to
run because the fixture's COMMENT named the type the mutation removes. The newest two are the sharpest: KN-155's own EXIT CONDITION had
to be reworded because an exit condition saying "a check must refuse phrase X"
necessarily contains X; and `noLiterals.test.ts` rejected a COMMENT that spelled
out the pixel shorthand it was explaining. **It reads comments too.**

**An ABSENCE proves nothing without a positive control on the same instrument**,
and **this applies to MUTATION testing**. I declared a mutation impossible after
trying only NEGATIVE fixtures, which all fail safe by accident. The isolating
fixture was a POSITIVE one.

**Mutate the CONTRACT, not only the implementation.** KN-149's harness broke the
code eight ways and never touched the registry the code enforces, so dropping a
card from the contract left every check green.

**A verifier built from examples tests the examples.** Go clause by clause
through the exit condition; each guarantee needs a fixture AND a mutation that
makes that fixture fail. In `RALPH.md` step 3.

**Do not reimplement a tool's semantics — ASK THE TOOL.** The docs guard walked
the TypeScript AST to find stories and was wrong twice in one card. Storybook's
own `loadCsf(...).parse().indexInputs` is the oracle, and it corrected both me
and a reviewer: `export { A }` IS indexed, `export class` is NOT.

**A silently ignored prop looks exactly like a working one.** MUI 9 removed
`inputRef` from `SwitchBase`; passing it did nothing and the component still
looked right. Only a test asserting the DOM property caught it.

**`npm run` SILENTLY TRUNCATES every argument at its first newline on Windows.**
Use `node agent/scripts/todo.mjs` directly. KN-195.

**There are TWO roast harnesses.** `roast.py plan` checks a PLAN and records
nothing; `node agent/scripts/roast.mjs <id>` is the TASK roast and is the only
one the board can record, because `todo roast --file` verifies its sidecar.

**`String.replace` with a STRING replacement expands `$'` and `$&`.** A
mutation inserting a regex ending in `$'` pasted the rest of the file into the
middle of it, ESLint crashed, and the check blamed the fixture. **Always pass a
function**: `s.replace(anchor, () => text)`.

**A library's option can mean something other than its docs imply.** The
lingui plugin compiles `ignore` with `new RegExp(entry)` and no flags. Three
roasts probed the rule's exemptions and missed it, because every probe string
contained a p. **Read how the tool consumes the option.**

**The browser pane, while hidden, runs NO animation frames**, so no Storybook
play function starts there: every story sits on WAIT, `requestAnimationFrame`
never fires. That looks exactly like a broken story. Check the published
behaviour on a PRODUCTION Storybook build in headless Chromium instead: the
`storybook-static` launch config serves one, and KN-225.mjs does it committed.

**The production Storybook is not the Vitest one.** Storybook's own preview CSS
makes `body` border-box for a padded story; the Vitest page does not. KN-222's
first version passed under Vitest and failed in the built Storybook.

**Hand-written lingui catalogs are never compiled**, and lingui 6.6.0 compiles
ICU only outside production: any message with a count or placeholder renders
raw `{count, plural, ...}` in the deployed app. KN-221, and it blocks KN-212.

**Shell heredocs eat backslashes**, and one wrote a literal NUL byte into a
source file this session. **Use Edit for code.**

## The next step

`node agent/scripts/todo.mjs next` picks it, and serves component work first by
the owner's order. Open findings on the built components: KN-207, KN-209,
KN-211, KN-206, KN-223, KN-227, KN-226 (the published-Storybook smoke test),
KN-216; then the components themselves, KN-010, KN-011, KN-019, KN-023,
KN-062, KN-008, KN-009, KN-012. KN-212 waits on KN-221. A new story's title
goes into `StoryTitle` in `src/shared/story-docs/story-meta.ts` and its meta
must satisfy `StoryMeta`, or the lingui rule flags the title. KN-214 is held
at high on the owner's order; restore it to critical when the last
component closes.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`, in that order,
every iteration. Then `npm run contract`, a regression checker over ten rules and
not a proof that the board matches the design.
