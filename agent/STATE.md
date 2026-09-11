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

**137 done, 226 open, 4 blocked, 2 dropped** of 369 (2026-09-11). Coverage
99.33 percent on the full `npm test`; KN-340 carries the gap. **Deployed** on every push by
`.github/workflows/pages.yml`: https://sijav.github.io/KarNama/ and Storybook
at https://sijav.github.io/KarNama/storybook/. **Pushed after every close since
the owner asked, 2026-09-11**; before that 83 commits had sat unpushed and the
owner could see none of the day's work. The API needs
`NPM_CONFIG_PRODUCTION=false` in Render's dashboard before it runs there.

**Components built**: Checkbox, Filter chip, Tooltip, language switch, Status
Chip (KN-010), Input (KN-011), and on 2026-09-11 the Color Picker (KN-019),
Tabs (KN-023), Icon (KN-008), Icon Button (KN-014), Search Bar (KN-016), Button
(KN-009), Page Header (KN-021), Empty State and Loading State (KN-022), Bulk
Action Bar (KN-025), Select with the option rows and the employment type and
job level selects (KN-012), Menu with the Status and Card menus (KN-018), Sort
Control (KN-024), Status Choice, Picker and Control (KN-020), Contact Card
(KN-026), the Modal with Confirm, Change Status and the panel modal (KN-028),
the Contact Modal (KN-031), the job card (KN-015), the kanban column with the
Add Column tile (KN-060), the navigation with the sidebar, tab bar and nav item
(KN-027), the add job modal (KN-029) and the Job Modal (KN-030). Story fixtures
(KN-062). **Every component card is closed, 2026-09-11**, and KN-214 closed
after them: the lingui gate now checks every letter. No critical card is open;
the law serves high cards next, smallest first. The live site is the shell with
the navigation until the screens start.

**Open children**, high unless marked, since 2026-09-11. KN-011: KN-251
(low), KN-255, KN-256 (low), KN-257 (medium), KN-260, KN-268 (low), KN-275,
KN-277 (low), KN-278 (low), KN-279, KN-289 (low), KN-295, KN-296, KN-299 (low).
KN-013: KN-206. KN-010: KN-240 (low), KN-264 (waits on KN-062). When a
parent's last child closes, roast the parent with all its children.

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

**KN-293 and KN-294 closed, 2026-09-11.** The Checkbox's root carries
`spacing/2xs` of room round its 20 by 20 frame, 28 by 28, so its focus ring
lies inside its own box (9.1, nothing filed); KN-015 and KN-026 carry the host
contract for the Title Groups. The Filter Chip draws a three pixel ring inside
itself, since its Chips row is 32 and clips. Then the owner changed the
priorities and the close, above: 111 done, 22 component cards critical, every
other open card high or lower.

**KN-214 closed, 2026-09-11**: the no-letter entry is a class written with
`\s` and `\uXXXX`, which means the same with no flags; 622 flagged strings were
answered by named exemptions in `eslint.config.js`, typed constants and the
catalog. A string the rule flags now is copy, or needs a named exemption with
its reason, never a typed-constant dodge for copy.

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
- The component's own prototype reaction beats the prototype map's summary: hovers are 200 ms ease in and out or 120 ms ease out, never the map's 300 (KN-350).
- `prettier --write` on a file committed unformatted rewrites all of it: the catalogs and DESIGN.md are kept by hand, so restore and re-apply only the change.

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
- Never compute a colour with computedColour INSIDE waitFor: it rewrites the element's style, waitFor's observer reruns on it, and the loop kills the browser connection (KN-014).
- The lingui rule's KN-214 bug flags any string with a lowercase p or a capital L: type strings against a union (skipped), keep path data and Persian sample data in JSON, find nodes by instanceof, and name an English catalog instance `i18n` so `i18n._()` is recognised.
- A story that writes args back must carry a revision (the KN-280 Held pattern) or a late render brings an older value back; the production build shows it, the runner does not.
- Importing a verifier module runs it: never `import()` one to read a constant.
- In RTL the story root puts inline content at the right: clip screenshots to the element, not to the root's left.
- MUI's sx reads a bare width or height from 0 to 1 as a fraction: a width of 1 is 100 percent. Write one pixel as `1px`.
- MUI's Popper mirrors only the -start and -end placements in RTL, never left and right (KN-335); Popover places by left and right and does not mirror at all.
- The lingui rule ignores every string under an `sx` key: shared style objects live under `{ sx: ... }` (select/options.tsx).
- A synthetic hover sets no `:hover`: use `vitest/browser`'s pointer under the story-test flag, and aim at an element nothing covers (a Radio's root, not its icon under the invisible input).
- A menu under a trigger at the viewport's edge is clamped 16 from it: give story triggers room.
- A focus trap takes focus back while it is open: refocus after it closes, in the transition's onExited.
- Storybook loads no Vazirmatn (KN-322): text widths in stories are the system font's.

## The next step

Since the last head: KN-217 ('as const' copy fails the lint), KN-260 (a
pointer park before every story, which the roast showed repeats Storybook's own
resetMousePosition and is worse, KN-369 filed to remove it) and KN-264 (the
Status Chip's direction both ways) closed and pushed; KN-264's roast is running,
judge and record it. KN-269 and KN-270 are blocked on the owner's decisions
about the collapsed column, put to the owner in the session summary; KN-358,
the phone form's field order, waits on them too. Then the law: KN-301 next, then KN-369. The board screen will want KN-305 (fixtures need a board and all
nine statuses), KN-310, KN-341, KN-352, KN-356 (the tab bar gives way to the
Bulk Action Bar), KN-363 and KN-364 (the Job Modal's record identity and
status on Save), and KN-355 (the phone shell lost the language switch).

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`, every
iteration, then `npm run contract`.
