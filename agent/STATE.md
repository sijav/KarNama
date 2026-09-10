# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale. Counts live in `board.json`:
`node agent/scripts/todo.mjs next`, `show <id>`, `list`.

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
with their stories, then screens. Match the design exactly.** Phone OTP, mocked.

## Where things stand

**100 done, 190 open, 2 blocked, 2 dropped** of 294 (2026-09-10). Coverage 100
percent on all four metrics. **Deployed**: https://sijav.github.io/KarNama/ and
Storybook at https://sijav.github.io/KarNama/storybook/, both from
`.github/workflows/pages.yml` on every push. The API needs
`NPM_CONFIG_PRODUCTION=false` in Render's dashboard before it runs there.

**Six components exist**: Checkbox, Filter chip, Tooltip, language switch,
Status Chip (KN-010), Input (KN-011). The live site is a placeholder shell
until screens start, which is after components.

**Open children**, all critical unless marked. KN-011: KN-206, KN-251 (low),
KN-255, KN-256 (low), KN-257 (medium), KN-260 (high), KN-268 (low), KN-275,
KN-277 (low), KN-278 (low), KN-279, KN-280, KN-282, KN-283,
KN-286, KN-287, KN-289 (low), KN-290, KN-292. KN-013: KN-293. KN-017: KN-294.
KN-010: KN-240 (low), KN-264 (waits on KN-062). A finding from a child's roast
sits under the same parent, one level. When a parent's last child closes,
roast the parent with all its children.

**This stretch, 2026-09-10.** Closed: KN-263, KN-271, KN-244, KN-273, KN-245,
KN-276, KN-253, KN-266, KN-281 (the Checkbox edge is the file's 1.5, drawn as an
inset shadow, since Chromium floors border widths to whole CSS pixels), KN-284
(its forced-colours fallback is a ::before), KN-285 (question: the owner chose
to follow the screens, the message line drawn only when there is a helper or
an error, KN-287 builds it), KN-288 (disabled takes GrayText under forced
colours), KN-267 (icon slots), KN-272 (in dark the brand container is a navy
fill, DARK_FILLS), KN-291 (an icon turned off draws no slot), KN-274 (the
invalid Input's focus ring is an `::after` four in from the edge, since the
outline outside was lost to any host that clips at the field's edge; KN-244's
verifier is retargeted at it). Every Input on the screens keeps its label and
turns the helper line off (91 of 91).

**Owed after KN-274, not yet done**: its roast, base `50d05f7`, log in the
scratchpad, with `--summary` and `--ask`; and the Input verifier batch (KN-011,
KN-241 to KN-267, KN-291), not rerun since the focus rule changed, though the
line they anchor on was kept.

**The owner paused the loop on 2026-09-10** and then shut the machine down. An
empty `.claude/ralph-loop.paused` did not pause it: the installed hook reads
only whether `.claude/ralph-loop.local.md` exists. So at 21:56 the state was
moved into `.claude/ralph-loop.paused`, iteration 82. Resume with
`mv .claude/ralph-loop.paused .claude/ralph-loop.local.md`; RALPH.md's Control
section now says so.

**KN-214 is deliberately held at high**: lingui compiles `ignore` with no flags,
so `^[^\p{L}]*$` means "contains no p, {, L or }", and every Persian literal and
every English word without a p passes the gate. Restore it to critical when the
last component closes. Until then, strings go through lingui by hand.

**Owner decisions of 2026-09-10**, in DESIGN.md under "Settled by the owner on
2026-09-10": the drop onto the collapsed rejected column in full, KN-196;
employment type as eight values, more than one per job, KN-265; a 3:1 resting
edge role for controls, KN-273 and KN-275; a blue edge for a selected Filter
Chip, KN-276 and KN-279; and the message line drawn only when needed, as the
screens draw it, KN-285 and KN-287. The job level list and KN-077 still wait.

## The owner's rules, most recent first

- **Finish the components first**, 2026-09-10: every open component card and
  finding on a built component is `critical`, an ordering decision noted on each
  card. Do not "correct" those severities. KN-061 stays high, behind KN-196.
- **A finding about the loop rather than the product is `low`** unless it is
  actively breaking the work. The loop exists to build KarNama.
- **100 percent coverage is a product rule**: `apps/*`, `packages/*`, not
  `agent/scripts/**`, and markdown has no tests.
- **Do not invent gates.** Rule zero of `agent/RALPH.md`. Tests yes, refusals no.
- **Finish, prove, commit, close, then roast.** `done` is terminal.
- **A finding is a CHILD of its task**, one level, recorded in prose as
  `CHILD OF KN-xxx` because `parent` means BLOCKED BY (KN-188).
- **A root task closes on the full suite; a child on the tests for its files**,
  plus lint and tsc.
- **Plans live beside the work**, `#<id> - <title>.md`, checked by
  `roast.py plan` before building, and they stay. Roasts twice called them
  misplaced documentation; that misreads step 2b and is dismissed each time.

## What keeps going wrong, one line each

- A check that searches for a string and contains it flags itself; noLiterals reads comments.
- An absence proves nothing without a positive control, in mutation testing too.
- Mutate the contract, not only the implementation.
- A verifier built from examples tests the examples: go clause by clause.
- Ask the tool, do not reimplement it: `loadCsf` is the oracle for stories.
- A silently ignored prop looks exactly like a working one; assert the DOM.
- `npm run` truncates arguments at a newline on Windows: call `node agent/scripts/todo.mjs`.
- Two roast harnesses: `roast.py plan` for plans, `roast.mjs <id>` for tasks.
- A roast refuses a dirty worktree: never redirect its log into the repo; use the scratchpad.
- `String.replace` with a string expands `$'` and `$&`: pass a function.
- Read how a tool consumes an option; lingui's no-flag `ignore` is KN-214.
- The hidden browser pane runs no animation frames; check a production build headless.
- The production Storybook is not the Vitest one: body box-sizing, and act().
- storyFinished reports success for a play that threw; read the errored phase.
- A story's pinned globals are `story.storyGlobals`, and they beat URL globals:
  AllStatuses and most Input stories are pinned light, so view dark through an unpinned one.
- Arg changes re-render without remounting or rerunning play; Rerun remounts.
- lingui's useTsTypes skips array-literal members, never rest arguments.
- When a story changes run the whole unit project; when a config changes, rerun its verifiers.
- Never edit a file while background verifiers that mutate it are running.
- Write, Edit and heredocs rewrite backslash escapes: build a backslash from char code 92.
- Hand-written lingui catalogs are never compiled: ICU renders raw in production (KN-221).
- The real pointer stays where the last hover story left it (KN-260).
- A derived palette is only as checked as its tests: text was, borders and fills were not (KN-271, KN-272).
- Portable stories apply no updateArgs; anything that needs the store is proved in a production build (TECH-DEBT 16).
- Storybook runs its own hooks' effects after play in its preview: write args from a React effect in a child.
- A roast has three times called a plan beside the work misplaced documentation: dismiss it, it misreads step 2b.
- Read the file with use_figma before trusting a code comment about it: the Checkbox said 1, the file says 1.5.
- Verifiers that run each other chain: KN-288 runs KN-284, KN-281, KN-266 and five more; close in the background.
- Forced colours: box-shadow is removed, borders are kept, SVG author strokes are preserved (KN-290).
- A roast base must be a real commit: check `git log` before passing --base.
- Vitest hides console output by default: `--silent=false --reporter=verbose` for probes.
- The Bash tool's heredocs turn a doubled backslash into one, and some long bodies fail outright: write long files with Write.
- A pixel count of a focused text field includes the selection Tab makes: collapse it first (KN-274).
- `roast.mjs` needs `--summary` and takes `--ask`; without a summary it refuses and exits.

## The next step

Roast KN-274 and run the Input verifier batch (both owed, above),
then by the law: KN-280, KN-282, KN-283, KN-286, KN-287, KN-290, KN-292,
KN-293, KN-294, then KN-279 (3), KN-275 (3), KN-206, KN-226, KN-255, KN-221,
and the components KN-019, KN-023, KN-062, KN-008, KN-009, KN-012. The KN-282
plan draft is in the session scratchpad.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`, every
iteration, then `npm run contract`.
