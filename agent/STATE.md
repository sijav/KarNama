# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale. The board is the todo skill's
database, `.claude/todo.db`: `node ~/.claude/skills/todo/todo.mjs next`,
`show <id>`, `list`, `okr`.

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

## Where things stand, 2026-09-14

**Codex worked on main on 2026-09-12**, on the owner's instruction to do a fast,
messy job for a presentation, without the loop, the board or roasts: twelve
commits from `leftout-backup` (6d058b4) to `codex-backup` (1709bc0). Server
login, then mock login at the owner's word; extraction through Groq with
ALLOW_DEMO_EXTRACTION and AUTH_SECRET, configured on Render and working;
Settings (language, theme, sample data); drag and drop; collapse; date
validation; the growing paste field. Pages deploys demo login against Render.

**KN-477 is done: Codex's work stays on main.** Four Claude reviewers read its
diff by area, since Codex's work is never roasted by Codex. What survived is
its children, KN-483 to KN-503: among them a regex DoS in the API (KN-483,
high), API coverage at 80.37 percent (KN-486, high), six failing stories from
ISO-only dates and JobsScreen waiting on the live API (KN-494, KN-495, high),
and Gregorian date pickers (KN-497, OKR-2). The dark `color-scheme` fix waits in
`git stash@{0}` as KN-496. KN-401 is unblocked and resumes on main.

**KN-482 is done**: the board is the todo skill's database, and the skill gained
objectives, blocks, notes, evidence, roast rounds, validate, render and rm, in
both halves, with every other project's board unaffected. Its Codex roast found
the close early, STATE.md stale and the board unrendered, repaired in bf9dd01.

**KN-479 is done** (e058e19): `LanguageFlag` draws a locale's region flag from
`country-flag-icons` 1.6.20, fa-IR Iran's and en-US the United States'. The
language switch's sidebar row is laid out as a Nav Item with the flag in the
icon column, and the flag leads the name in the Page Header and the menu.
DESIGN.md section 5 records it. Its roast is with Codex.

**The owner's asks of 2026-09-14**: KN-480, in progress, Settings picks the
language from a Select whose options carry flags; KN-478, settings, sign out,
language and add contact as Icon Buttons with nothing in a row above a title
(noted there: the language menu opens over its own button); KN-481, every page
set beside its Figma frame; KN-505, addresses as clean paths rather than `#/`,
from the owner's question about the hash. The sample-data loader and the AI
extraction stay.

## The owner's rules, most recent first

- **2026-09-14.** The board is the todo skill's database, and `agent/board.json`
  is its archive. The shared skills serve ALL projects: a change only adds, and
  is checked against a copy of every board on the machine. A model's work is
  never roasted by that model. A suggestion is not a directive (the CSV diff).
  Flags come from a package, not a political choice. Settings and a phone's sign
  out do not exist in Figma, so they are invented, as icons. "It should look like
  the figma." The owner reads on a phone: literal truth, no excuses.
- **2026-09-12, to Codex, still standing for the product.** Mock the login for
  now. Keep the sample data and the AI extraction. Do not change a layout nobody
  asked to change; a drag wrapper belongs in the correct spot. Commit and push
  after work. Never ask the owner to redeploy when nothing changed.
- **Push after every close, 2026-09-11.** Commit, close, push, then roast.
- **New components first, 2026-09-11**: only new component cards and their
  blockers are `critical`; a finding on a built component is `high` or lower.
- **No proof at the close, 2026-09-11**: test what changed, stories, unit tests,
  lint, tsc, look at it, close with one line of evidence. Roasts stay.
- **A finding about the loop rather than the product is `low`** unless it is
  actively breaking the work.
- **100 percent coverage is a product rule**: `apps/*`, `packages/*`, not
  `agent/scripts/**`, and markdown has no tests.
- **Do not invent gates.** Rule zero of `agent/RALPH.md`.
- **A finding is a CHILD of its task**, one level: `todo add --parent-task`.
- **Plans live beside the work**, `#<id> - <title>.md`, checked by
  `roast.py plan` before building, and they stay.

## What keeps going wrong, one line each

- A button draws in the browser's font, Arial in Chromium: since KN-351 the theme gives every ButtonBase the product's face; a native `<button>` outside ButtonBase still needs it.
- A button centres its text: a name that fills a flex row sits mid-row unless the row sets `textAlign: 'start'`; measure where a name starts with a Range over its text, not with its box (KN-479).
- An open MUI Menu or Dialog hides the rest of the page from roles: take the trigger's box before opening it, or select the trigger by CSS.
- A flex item with `overflow: hidden` may shrink below its content: a list of cards in a scrolling flex column needs `flex-shrink: 0` on them.
- MUI's Chip is `max-width: 100%` of its group: beside a count, hold it in a `min-width: 0` item or the count is pushed out.
- Figma's hidden layer gives up its room: fold a control to no room and fade it, never `display: none`, which drops it from the Tab order.
- A bare literal `'x' as const` skips the lingui rule entirely (KN-217); type the binding against a union instead.
- Stories that drive the real pointer collide when story files run in parallel (KN-365): rerun a lone failure alone before reading it as a regression.
- A radio group's arrows: Blink flips left and right by direction, WebKit never does; the pickers take the two keys themselves (KN-301).
- The Browser pane's key action wants `ArrowLeft`, not `Left`, and a click first; its type action inserts text without key events, and its drag does not start an HTML5 drag: dispatch DragEvents from the page.
- Storybook's resetMousePosition never runs here: addon-vitest adds its setup file only when the ROOT config enables the browser; parkPointer is the one reset, TECH-DEBT 19.
- A story's expected colour borrowed on the element under test reads the start of that element's own transition: compute tokens on an element without one, KN-365.
- The component's own prototype reaction beats the prototype map's summary: hovers are 200 ms ease in and out or 120 ms ease out, never the map's 300 (KN-350).
- `prettier --write` on a file committed unformatted rewrites all of it: the catalogs and DESIGN.md are kept by hand, so restore and re-apply only the change.
- The lingui rule skips a literal typed against a union and one compared with `===`; `i18n._()` is recognised only on an instance named `i18n`.
- An absence proves nothing without a positive control: plant the failure once and see the check catch it, and check the plant really happened.
- A silently ignored prop looks exactly like a working one; assert the DOM.
- `npm run` truncates arguments at a newline on Windows: call node or python directly.
- `String.replace` with a string expands `$'` and `$&`: pass a function.
- The hidden Browser pane runs no animation frames and its screenshots time out: look headless with Playwright from a scratchpad script, `createRequire` from `apps/web/package.json`, at `deviceScaleFactor` 2.
- `roast.py` keeps its sessions under `.claude/` of the directory it runs in: run it from the repository root, or it leaves an `apps/web/.claude/` behind.
- A background roast that names `HEAD~1` reads whatever HEAD is when it starts: name the commit, `e058e19~1 e058e19`.
- The production Storybook is not the Vitest one: body box-sizing, and act().
- A story's pinned globals beat URL globals; view dark through an unpinned story.
- Portable stories apply no updateArgs; anything that needs the store is proved in a production build.
- Read the file with use_figma before trusting a code comment about it.
- Forced colours: box-shadow removed, borders kept, SVG author strokes kept.
- The Bash tool's heredocs turn a doubled backslash into one, so a search string written `\\n` becomes a newline and matches nothing: write scripts with Write, or build a backslash with chr(92).
- `diff | head && echo same` prints same whatever diff found: compare with `cmp -s`.
- Python on Windows prints `\r\n` where Node prints `\n`, and a test reading pipes as text cannot see it: compare bytes.
- node:sqlite's busy timeout defaults to zero, so a second writer fails at once with "database is locked": pass `{ timeout }`.
- A second checkout for comparison needs `git -c core.longpaths=true` (plan filenames pass 260 characters) and node_modules as junctions, removed with `cmd /c rmdir` before `git worktree remove`; the Storybook browser project cannot load its setup file through junctioned node_modules.
- When two stores claim one truth, retire one in the same change: the JSON board and the skill's database drifted for a week unnoticed.
- A pixel count of a focused text field includes the selection Tab makes: collapse it first.
- Storybook 10: `inferControls` trims a story's arg types to its listed controls, so a URL arg outside the list is dropped.
- A story's own play may have focused its control: blur, click an empty corner, then Tab.
- The Emotion cache's RTL plugin flips `direction` in styles: set it by `dir` in a mutation, or write `ltr /* @noflip */`.
- `:focus-visible` after Storybook's untrusted `userEvent.tab()` depends on the page's earlier input; a real Tab comes from Playwright.
- Never compute a colour with computedColour INSIDE waitFor: it rewrites the element's style, waitFor's observer reruns on it, and the loop kills the browser connection (KN-014).
- A story that writes args back must carry a revision (the KN-280 Held pattern) or a late render brings an older value back; the production build shows it, the runner does not.
- In RTL the story root puts inline content at the right: clip screenshots to the element, not to the root's left.
- MUI's sx reads a bare width or height from 0 to 1 as a fraction: a width of 1 is 100 percent. Write one pixel as `1px`, which the literal guard refuses, so name it.
- MUI's Popper mirrors only the -start and -end placements in RTL, never left and right (KN-335); Popover places by left and right and does not mirror at all.
- The lingui rule ignores every string under an `sx` key: shared style objects live under `{ sx: ... }` (select/options.tsx).
- A synthetic hover sets no `:hover`: use `vitest/browser`'s pointer under the story-test flag, and aim at an element nothing covers.
- A menu under a trigger at the viewport's edge is clamped 16 from it: give story triggers room.
- A focus trap takes focus back while it is open: refocus after it closes, in the transition's onExited.
- A test that starts a process has no speed budget: vitest fails a case whose blocked worker overran its budget; start the runs together with an async spawn and a hang guard (KN-167).
- React warns in plain strings and through console.warn too; a guard keyed on `%s` hears only the printf ones (KN-401).

## The next step

KN-480 is in progress: write its plan beside the work in
`apps/web/src/shared/settings/`, roast the plan with `roast.py plan` from the
repository root, then build. Settings' language radios become the product's
Select, each option and the chosen value led by its `LanguageFlag`; Theme and
Load sample data stay as they are; the e2e specs that pick English by radio
(settings, layout-overflow, drag-cards) pick it from the Select. Relay KN-479's
roast when it lands and file what survives as its children. Then `todo next`.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`, every
iteration, then `todo next` and `node agent/scripts/verify/contract.mjs`.
