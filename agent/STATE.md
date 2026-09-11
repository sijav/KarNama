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

**109 done, 187 open, 2 blocked, 2 dropped** of 300 (2026-09-11). Coverage 100
percent on all four metrics. **Deployed**: https://sijav.github.io/KarNama/ and
Storybook at https://sijav.github.io/KarNama/storybook/, both from
`.github/workflows/pages.yml` on every push. The API needs
`NPM_CONFIG_PRODUCTION=false` in Render's dashboard before it runs there.

**Six components exist**: Checkbox, Filter chip, Tooltip, language switch,
Status Chip (KN-010), Input (KN-011). The live site is a placeholder shell
until screens start, which is after components.

**Open children**, critical unless marked. KN-011: KN-251 (low), KN-255,
KN-256 (low), KN-257 (medium), KN-260 (high), KN-268 (low), KN-275, KN-277
(low), KN-278 (low), KN-279, KN-289 (low), KN-295, KN-296, KN-299 (low).
KN-013: KN-206, KN-293 (in progress). KN-017: KN-294. KN-010: KN-240 (low),
KN-264 (waits on KN-062). When a parent's last child closes, roast the parent
with all its children.

**2026-09-10 and 2026-09-11, closed and roasted**: KN-263, 271, 244, 273, 245,
276, 253, 266, 281 (the Checkbox edge is the file's 1.5 as an inset shadow),
284 (its forced-colours edge a ::before), 285 (the owner chose the screens'
message line), 288 (disabled GrayText under forced colours), 267, 272, 291,
274 (the invalid Input's ring an ::after inside the field), 292, 280, 282, 283,
286, 297, 298, 287 (the Input's message line only when it speaks, 64 bare and
90 with a message; 8, nothing filed), 290 (under forced colours the Checkbox's
marks take ButtonText, or GrayText disabled, on a ButtonFace frame; 6.0, its
one critical dismissed: the verifier's ButtonText-differs-from-GrayText guard
is a positive control, and reporting "could not run" there is KN-180's clause,
noted on it). KN-300 filed (medium, docs): em dashes in four story docs and two
plans.

**KN-293 in progress.** Figma, read 2026-09-11: every Checkbox instance, ten
on Components and eight on Screens, sits flush at the inline start of a
card's Title Group, 2.5 from its top and bottom, in a frame that clips. The
ring cannot go inside the frame (a checked frame is the ring's blue; a two
pixel band inside 20 is 144, short of 160), so the plan gives the root
`spacing/2xs` of padding: 28 by 28 round the 20 frame, the ring's ~184 inside,
measured on the frame's 4W + 4H. Plan beside Checkbox.tsx, checked by
roast.py plan (scratchpad kn293plan.out) before building. KN-274's verifier's
Checkbox row must move its perimeter to the frame.

**KN-214 is deliberately held at high**: lingui compiles `ignore` with no flags,
so `^[^\p{L}]*$` means "contains no p, {, L or }". Restore it to critical when
the last component closes. Until then, strings go through lingui by hand.

**Owner decisions of 2026-09-10** are in DESIGN.md under "Settled by the owner
on 2026-09-10": KN-196, KN-265, KN-273 and KN-275, KN-276 and KN-279, KN-285
and KN-287. The job level list and KN-077 still wait.

## The owner's rules, most recent first

- **Finish the components first**, 2026-09-10: every open component card and
  finding on a built component is `critical`. KN-061 stays high, behind KN-196.
- **A finding about the loop rather than the product is `low`** unless it is
  actively breaking the work.
- **100 percent coverage is a product rule**: `apps/*`, `packages/*`, not
  `agent/scripts/**`, and markdown has no tests.
- **Do not invent gates.** Rule zero of `agent/RALPH.md`. Tests yes, refusals no.
- **Finish, prove, commit, close, then roast.** `done` is terminal.
- **A finding is a CHILD of its task**, one level, recorded in prose as
  `CHILD OF KN-xxx` because `parent` means BLOCKED BY (KN-188).
- **A root task closes on the full suite; a child on the tests for its files**,
  plus lint and tsc.
- **Plans live beside the work**, `#<id> - <title>.md`, checked by
  `roast.py plan` before building, and they stay. A roast calling them
  misplaced misreads step 2b and is dismissed.

## What keeps going wrong, one line each

- An absence proves nothing without a positive control, in mutation testing too.
- Mutate the contract, not only the implementation; go clause by clause.
- A silently ignored prop looks exactly like a working one; assert the DOM.
- `npm run` truncates arguments at a newline on Windows: call `node agent/scripts/todo.mjs`.
- Two roast harnesses: `roast.py plan` for plans, `roast.mjs <id>` for tasks; `roast.mjs` needs `--summary`.
- A roast refuses a dirty worktree: logs go to the scratchpad, never the repo.
- `String.replace` with a string expands `$'` and `$&`: pass a function.
- The hidden browser pane runs no animation frames; check a production build headless.
- The production Storybook is not the Vitest one: body box-sizing, and act().
- A story's pinned globals beat URL globals; view dark through an unpinned story.
- Portable stories apply no updateArgs; anything that needs the store is proved in a production build.
- Read the file with use_figma before trusting a code comment about it.
- Verifiers that run each other chain: KN-288 runs KN-284, KN-281 and more; changing a line a verifier anchors on breaks it, so grep the verifiers first.
- Forced colours: box-shadow removed, borders kept, SVG author strokes kept.
- The Bash tool's heredocs turn a doubled backslash into one: write long files with Write.
- A pixel count of a focused text field includes the selection Tab makes: collapse it first.
- Storybook 10: `inferControls` trims a story's arg types to its listed controls, so a URL arg outside the list is dropped.
- A story's own play may have focused its control: blur, click an empty corner, then Tab.
- The Emotion cache's RTL plugin flips `direction` in styles: set it by `dir` in a mutation.
- A mutation that fails to fail is a finding about the mutation first.
- `git add` of a roast's `.prompt.md` fails: it is gitignored; add the archive and its meta only.
- `:focus-visible` after Storybook's untrusted `userEvent.tab()` depends on the page's earlier input; a real Tab comes from Playwright.

## The next step

Judge KN-293's plan check, fix the plan, then build it: Checkbox.tsx padding,
the FocusedInAClippingHost story and its docs, DESIGN.md's section, KN-274's
verifier retargeted, KN-293.mjs, the notes on KN-206, KN-015 and KN-026. Then
by the law: KN-294, KN-295, KN-296, then KN-206, KN-279, KN-275, KN-226,
KN-255, KN-221, and the components KN-019, KN-023, KN-062, KN-008, KN-009,
KN-012.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`, every
iteration, then `npm run contract`.
