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

**138 done, 229 open, 4 blocked, 2 dropped** of 373 (2026-09-11). Coverage
99.33 percent on the full `npm test`; KN-340 carries the gap. **Deployed** on every push by
`.github/workflows/pages.yml`: https://sijav.github.io/KarNama/ and Storybook
at https://sijav.github.io/KarNama/storybook/. **Pushed after every close since
the owner asked, 2026-09-11**; before that 83 commits had sat unpushed and the
owner could see none of the day's work. The API needs
`NPM_CONFIG_PRODUCTION=false` in Render's dashboard before it runs there.

**Every component card is closed, 2026-09-11**: the components are DESIGN.md's
component table, each with its stories and docs under `apps/web/src/shared/`,
and story fixtures (KN-062). KN-214 closed after them. No critical card is open,
so the law serves high cards, smallest first; the screens come after. The live
site is the shell with the navigation until then.

**Open children** are found by `CHILD OF KN-xxx` in the board's descriptions,
most of them the Input's (KN-011); when a parent's last child closes, roast the
parent with all its children. History before this head, which cards closed and
what their roasts scored, is on the board and in `agent/roasts/`.

**The lingui gate since KN-214**: a string it flags is copy, or needs a named
exemption in `eslint.config.js` with its reason (TECH-DEBT 17), never a
typed-constant dodge for copy.

**Owner decisions of 2026-09-10** are in DESIGN.md under "Settled by the owner
on 2026-09-10": KN-196, KN-265, KN-273 and KN-275, KN-276 and KN-279, KN-285
and KN-287. The job level list and KN-077 still wait.

## The owner's rules, most recent first

- **Push after every close, 2026-09-11.** The owner asked "You don't push?"
  and then "Wanna commit and push?": commit, close, push, then roast.
- **New components first, 2026-09-11**, replacing 2026-09-10's rule: only new
  component cards and their blockers are `critical`; a finding on a built
  component is `high` or lower ("a missing feature of another"). Eleven cards
  dropped to high that day. KN-061 stays high, behind KN-196.
- **No proof at the close, 2026-09-11**: `move done` needs one line of evidence
  and a clean worktree, and runs nothing. Test what changed, stories, unit
  tests, lint, tsc, look at it, close; no per-task verifier scripts, pixel
  checks or regression batches. Later bugs are later cards. Roasts stay.
- **A finding about the loop rather than the product is `low`** unless it is
  actively breaking the work.
- **100 percent coverage is a product rule**: `apps/*`, `packages/*`, not
  `agent/scripts/**`, and markdown has no tests.
- **Do not invent gates.** Rule zero of `agent/RALPH.md`. Tests yes, refusals no.
- **Finish, test what changed, commit, close, then roast.** `done` is terminal.
- **A finding is a CHILD of its task**, one level, recorded in prose as
  `CHILD OF KN-xxx` because `parent` means BLOCKED BY (KN-188).
- **Plans live beside the work**, `#<id> - <title>.md`, checked by
  `roast.py plan` before building, and they stay. A roast calling them
  misplaced misreads step 2b and is dismissed.

## What keeps going wrong, one line each

- A ButtonBase with text draws in the browser's button font: give it `fontFamily: 'inherit'` (KN-351 for the two built ones).
- A flex item with `overflow: hidden` may shrink below its content: a list of cards in a scrolling flex column needs `flex-shrink: 0` on them.
- MUI's Chip is `max-width: 100%` of its group: beside a count, hold it in a `min-width: 0` item or the count is pushed out.
- Figma's hidden layer gives up its room: fold a control to no room and fade it, never `display: none`, which drops it from the Tab order.
- A bare literal `'x' as const` skips the lingui rule entirely (KN-217); type the binding against a union instead.
- Stories that drive the real pointer collide when story files run in parallel (KN-365): rerun a lone failure alone before reading it as a regression.
- A radio group's arrows: Blink flips left and right by direction, WebKit never does; the pickers take the two keys themselves (KN-301).
- The Browser pane's key action wants `ArrowLeft`, not `Left`, and a click first: a script's focus does not give the frame the keyboard.
- The component's own prototype reaction beats the prototype map's summary: hovers are 200 ms ease in and out or 120 ms ease out, never the map's 300 (KN-350).
- `prettier --write` on a file committed unformatted rewrites all of it: the catalogs and DESIGN.md are kept by hand, so restore and re-apply only the change.
- The lingui rule skips a literal typed against a union and one compared with `===`; `i18n._()` is recognised only on an instance named `i18n`.
- An absence proves nothing without a positive control: plant the failure once and see the check catch it.
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
- Forced colours: box-shadow removed, borders kept, SVG author strokes kept.
- The Bash tool's heredocs turn a doubled backslash into one: write long files with Write.
- A pixel count of a focused text field includes the selection Tab makes: collapse it first.
- Storybook 10: `inferControls` trims a story's arg types to its listed controls, so a URL arg outside the list is dropped.
- A story's own play may have focused its control: blur, click an empty corner, then Tab.
- The Emotion cache's RTL plugin flips `direction` in styles: set it by `dir` in a mutation.
- `git add` of a roast's `.prompt.md` fails: it is gitignored; add the archive and its meta only.
- `:focus-visible` after Storybook's untrusted `userEvent.tab()` depends on the page's earlier input; a real Tab comes from Playwright.
- Never compute a colour with computedColour INSIDE waitFor: it rewrites the element's style, waitFor's observer reruns on it, and the loop kills the browser connection (KN-014).
- A story that writes args back must carry a revision (the KN-280 Held pattern) or a late render brings an older value back; the production build shows it, the runner does not.
- In RTL the story root puts inline content at the right: clip screenshots to the element, not to the root's left.
- MUI's sx reads a bare width or height from 0 to 1 as a fraction: a width of 1 is 100 percent. Write one pixel as `1px`.
- MUI's Popper mirrors only the -start and -end placements in RTL, never left and right (KN-335); Popover places by left and right and does not mirror at all.
- The lingui rule ignores every string under an `sx` key: shared style objects live under `{ sx: ... }` (select/options.tsx).
- A synthetic hover sets no `:hover`: use `vitest/browser`'s pointer under the story-test flag, and aim at an element nothing covers (a Radio's root, not its icon under the invisible input).
- A menu under a trigger at the viewport's edge is clamped 16 from it: give story triggers room.
- A focus trap takes focus back while it is open: refocus after it closes, in the transition's onExited.
- Storybook loads no Vazirmatn (KN-322): text widths in stories are the system font's.

## The next step

Since the last head: KN-264's roast recorded (5.0; KN-370 medium, the contract
should name the first strong character and the visual end; KN-371 and KN-372
low, story gaps), KN-369 noted as KN-011's child. KN-301 closed and pushed:
Blink already points a radio group's arrows by direction, WebKit does not, so
the Color Picker takes left and right itself, `arrowsAcross` in
`theme/sides.ts`, TECH-DEBT 18; KN-373 gives it to the Status Picker. KN-301's
roast is running (log in the scratchpad), judge and record it. A Docs page with
a story pinned to English ends in English under the Persian toolbar: noted on
KN-090, which already names the mechanism. KN-269, KN-270 and KN-358 wait on the
owner. Then the law: KN-302 next. The board screen will want KN-305, KN-310,
KN-341, KN-352, KN-355, KN-356, KN-363 and KN-364.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`, every
iteration, then `npm run contract`.
