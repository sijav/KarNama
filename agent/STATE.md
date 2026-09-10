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

**88 done, 183 open, 2 blocked, 2 dropped** of 275 (2026-09-10). Coverage 100
percent on all four metrics. **Deployed**: https://sijav.github.io/KarNama/ and
Storybook at https://sijav.github.io/KarNama/storybook/, both from
`.github/workflows/pages.yml` on every push. The API needs
`NPM_CONFIG_PRODUCTION=false` in Render's dashboard before it runs there.

**Six components exist**: Checkbox, Filter chip, Tooltip, language switch,
Status Chip (KN-010), Input (KN-011). The live site is a placeholder shell
until screens start, which is after components.

**Open children.** KN-011: KN-245 (next), KN-251 (low), KN-253, KN-255, KN-256
(low), KN-257 (medium), KN-260 (high), KN-266, KN-267, KN-272, KN-274, KN-275.
KN-010: KN-240 (low), KN-264 (waits on KN-062). A finding from a child's roast
sits under the same parent, one level. When a parent's last child closes, roast
the parent with all its children.

**This stretch, 2026-09-10.** KN-263: the Status Chip is the flex box again,
the name in an inner span. KN-271: the dark border/focus and border/error are
checked at 3:1, focus now `#3670ed`. KN-244: a focused invalid Input keeps two
pixels of border/error and takes the product's ring, outline 2px border/focus
at offset 2. KN-273: a question card, the owner chose a new 3:1 resting edge
role for controls, KN-275 builds it. Filed: KN-272, the dark selected Filter
Chip's text is 1.34:1 because bg/brand/container derives to a bright `#207df9`;
KN-274, the invalid ring lies outside a field that fills its container, so a
clipping host removes it. KN-273's roast was running at the time of writing.

**KN-214 is deliberately held at high**: lingui compiles `ignore` with no flags,
so `^[^\p{L}]*$` means "contains no p, {, L or }", and every Persian literal and
every English word without a p passes the gate. Restore it to critical when the
last component closes. Until then, strings go through lingui by hand.

**Owner decisions of 2026-09-10**, in DESIGN.md under "Settled by the owner on
2026-09-10": the drop onto the collapsed rejected column in full, KN-196;
employment type as eight values, more than one per job, KN-265; and a 3:1
resting edge role for controls, KN-273 and KN-275. The job level list and
KN-077 still wait.

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
- Vitest hides console output by default: `--silent=false --reporter=verbose` for probes.

## The next step

KN-245, then by the law: the two-point Input children KN-253, KN-266, KN-267,
KN-272, KN-274, then KN-275 (3), KN-206, KN-223 (blocked by KN-221), KN-226,
KN-255, KN-221, and the components KN-019, KN-023, KN-062, KN-008, KN-009,
KN-012. A new story title goes into `StoryTitle` in
`src/shared/story-docs/story-meta.ts`; a story with a play function declares
the controls it offers.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`, every
iteration, then `npm run contract`.
