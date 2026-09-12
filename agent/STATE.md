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

**187 done, 258 open, 5 blocked, 2 dropped** of 452 (2026-09-12). The pages are
built and live: the board, the add flow, the job modal, the network page and
sign-in, all six page cards closed under the owner's instruction of 2026-09-12
to build the pages now. **Deployed** on every push by `.github/workflows/pages.yml`:
https://sijav.github.io/KarNama/ and Storybook at
https://sijav.github.io/KarNama/storybook/. **Pushed after every close since the
owner asked, 2026-09-11**. The API needs `NPM_CONFIG_PRODUCTION=false` in
Render's dashboard before it runs there.

**Coverage: 99.67 percent of statements on the full `npm test`, and the global
100 percent gate cannot be reached at all while KN-103 stands.** Proved on
2026-09-12: run the browser project alone and `shared/job-selects` reports 100
percent of its statements and 100 of its functions; run both projects together
and the same folder reports 94.73 and 80. The merge takes the unit project's
zeros for files it merely imports. KN-103 is critical for that reason. The
screens' own remaining branches are KN-427, which is a separate and smaller
thing.

**The board carries objectives now**, the owner's instruction of 2026-09-12:
OKR-1 is the MVP, the pages, and it is served first whatever the severities say;
OKR-2 is everything after it. `node agent/scripts/todo.mjs okr` prints both. A
roast finding under four points joins the objective in hand.

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

- A button draws in the browser's font, Arial in Chromium: since KN-351 the theme gives every ButtonBase the product's face; a native `<button>` outside ButtonBase still needs it.
- A flex item with `overflow: hidden` may shrink below its content: a list of cards in a scrolling flex column needs `flex-shrink: 0` on them.
- MUI's Chip is `max-width: 100%` of its group: beside a count, hold it in a `min-width: 0` item or the count is pushed out.
- Figma's hidden layer gives up its room: fold a control to no room and fade it, never `display: none`, which drops it from the Tab order.
- A bare literal `'x' as const` skips the lingui rule entirely (KN-217); type the binding against a union instead.
- Stories that drive the real pointer collide when story files run in parallel (KN-365): rerun a lone failure alone before reading it as a regression.
- A radio group's arrows: Blink flips left and right by direction, WebKit never does; the pickers take the two keys themselves (KN-301).
- The Browser pane's key action wants `ArrowLeft`, not `Left`, and a click first: a script's focus does not give the frame the keyboard; its phone emulation's tap did not open a menu, so drive such a look from the page.
- Storybook's resetMousePosition never runs here: addon-vitest adds its setup file only when the ROOT config enables the browser; parkPointer is the one reset, TECH-DEBT 19.
- A board write while a roast starts can throw, printed only as "Node.js v24" under `tail`: rerun the command without `tail` before trusting it.
- A story's expected colour borrowed on the element under test reads the start of that element's own transition: compute tokens on an element without one, KN-365.
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
- Storybook loads Vazirmatn since KN-322, and waits for both scripts' faces before a story renders.
- A test that starts a process has no speed budget: vitest fails a case whose blocked worker overran its budget; start the runs together with an async spawn and a hang guard (KN-167).
- React warns in plain strings and through console.warn too; a guard keyed on `%s` hears only the printf ones (KN-401).

## The next step

Since the last head, closed, pushed and roasted, findings filed at high or
lower: KN-415 (the screens' handlers are driven by stories; coverage 88 to 99.67
percent, and two dead wires cut: the board never told its cards they were on a
phone, so a phone could not delete or restage one, and the network page passed a
select-all the bar never offers), KN-305 (the fixtures hold a job opportunity in
every one of the nine statuses and the board itself), KN-310 (the Icon Button
can be a Tooltip's trigger), KN-315 (the Search Bar has the two sizes the
screens draw), KN-429 (four story assertions that could not fail), KN-443 (the
contacts page caps its bar only from md up), KN-430 (each page's search box is
named for what it searches), KN-433 (an Icon Button goes somewhere or can be
turned off, never both) and KN-447 (each shape hands back the element it
renders).

Those roasts filed KN-427 to KN-452. The ones that matter most, in order: a
phone cannot start a selection at all, so the bulk bar can never be raised there
(KN-428); select all and bulk delete ignore the search, which is the KN-422 data
loss in the other half of the same screen (KN-431); recolouring a status moves
its column, because the board's order ranks by the colour token (KN-440); and
the shell gives every page 24 of gutter where the file draws 16 (KN-452), which
also carries the 358 assertion KN-443's own exit asked for and did not get.

Roasts now go through `npm run roast -- <id> --summary … --ask …`, the repo's own
harness, because only its archive can be recorded with `todo roast`. Three
earlier roasts this iteration came from a subagent instead and so are on the
board as cards but not as roast records. KN-365 is still the two full-run
flakes, both reading a colour through its own transition. KN-269, KN-270,
KN-358 and KN-396 wait on the owner. Then the law, which serves OKR-1 first.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`, every
iteration, then `npm run contract`.
