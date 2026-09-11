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

**125 done, 207 open, 2 blocked, 2 dropped** of 336 (2026-09-11). Coverage 100
percent on all four metrics. **Deployed** on every push by
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
Control (KN-024), and Status Choice, Picker and Control (KN-020). Story
fixtures (KN-062). **Left, critical**: KN-026 Contact card, KN-015 Card, KN-027
Navigation, KN-028 Modal, KN-060 Kanban column, KN-029 Add and edit modal,
KN-030 Job modal, KN-031 Contact modal. The live site is a placeholder shell
until screens start.

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

**KN-214 is deliberately held at high**: lingui compiles `ignore` with no flags,
so `^[^\p{L}]*$` means "contains no p, {, L or }". Restore it to critical when
the last component closes. Until then, strings go through lingui by hand.

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

KN-020's roast is running; judge it, file at high or lower, record, push. Then
the components, by the law: KN-026 Contact card, KN-015 Card, KN-027 Navigation,
KN-028 Modal, KN-060 Kanban column, KN-029, KN-030, KN-031. When the last one
closes, restore KN-214 to critical. Findings filed today wait at high or lower,
KN-300 to KN-336; the Card and Board will want KN-305 (fixtures need a board
and all nine statuses) and KN-310 (the Icon Button cannot be a Tooltip trigger).

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`, every
iteration, then `npm run contract`.
