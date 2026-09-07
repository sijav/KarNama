# Board

<!-- GENERATED FILE. Edit agent/board.json through agent/scripts/todo.mjs, never this file. -->

Project **KarNama** · 1 of 67 tasks done · 3 of 323 points.

Columns are statuses. Within a column the order is the order `npm run todo -- next`
would pick: severity first, then the smaller story point, then the older id. A task
whose blockers are unsettled is never picked, whatever its severity.

**Next up: `KN-058` Run verify commands without a shell** (critical, 2 pt, agent)

## Awaiting roast (1)

| id | title | sev | pt | area | blocked by | exit condition |
| -- | ----- | --- | -- | ---- | ---------- | -------------- |
| `KN-058` | Run verify commands without a shell | critical | 2 | agent | KN-001 | A verify command containing a shell operator is refused when set, an existing one is refused at close, the two current verifiers still run, and a deliberately failing verifier still blocks move done. |

## Backlog (65)

| id | title | sev | pt | area | blocked by | exit condition |
| -- | ----- | --- | -- | ---- | ---------- | -------------- |
| `KN-065` | move done must require a verify command | critical | 2 | agent | KN-001 | move done refuses a task with no verify command, the message names KN-054 as where the backfill happens, a task with a deliberately failing verify still cannot close, and validate reports the count of tasks lacking one. |
| `KN-002` | Read the Figma Documentations canvas and fold it into the contract | critical | 3 | design | KN-001 | DESIGN.md has a section per documentation frame, every open item in the file is either reflected in the board as a task or recorded as a decision, and the Job Record field list is written down. |
| `KN-004` | Read the remaining type scale and any missing tokens from Figma | critical | 3 | design | KN-001 | A named sweep of the Foundations canvas finds no token absent from DESIGN.md, every value in the DESIGN.md tables is traceable to a Figma node id, and the KN-001 verify script's type-scale check still passes. |
| `KN-005` | Theme: tokens, MUI theme, direction and colour scheme provider | critical | 5 | web | KN-003, KN-004 | A Tokens story renders every colour, spacing and radius token with its name and value, the theme switches light and dark and RTL and LTR from the Storybook toolbars, and a test asserts no component file contains a raw hex colour. |
| `KN-006` | lingui: English source catalog, Persian translation, runtime switch | critical | 5 | web | KN-003 | A bare string literal in a tsx file fails lint, the app defaults to Persian, switching to English flips direction and persists, the fa-IR catalog is 100 percent translated, and a test fails when it is not. |
| `KN-034` | Prisma schema, Postgres on Supabase, and migrations | critical | 5 | api | KN-033 | Migrations apply to an empty database and to an existing one, the schema covers every field the Figma job record names, status history records every transition with its timestamp, and a seed script produces a realistic archive to develop against. |
| `KN-035` | GraphQL codegen wired both ways | critical | 5 | graphql | KN-003, KN-033 | Changing the API schema without regenerating fails the build, the web app imports only generated types for GraphQL data, and no hand-written interface duplicates a generated one. |
| `KN-003` | Web app scaffold with the full quality gate | critical | 8 | web | KN-001 | On a clean checkout, lint, lint:tsc, test, build and build-storybook all pass in apps/web, and both a deliberately broken test and a deliberately unlocalized string fail the run when planted by hand. |
| `KN-033` | API scaffold: NestJS, GraphQL code first, and its quality gate | critical | 8 | api | KN-001 | lint, typecheck, test and build all pass in apps/api, the server starts, the GraphQL playground serves the schema, the health endpoint answers, and a missing required environment variable fails at startup with a clear message rather than at first request. |
| `KN-013` | Checkbox, 5 states | high | 2 | web | KN-005, KN-006, KN-007 | All five states match Figma, indeterminate is set through the DOM property rather than an attribute so it survives a re-render, and the control is reachable and toggleable by keyboard. |
| `KN-014` | Icon button, 2 tones by 3 states | high | 2 | web | KN-005, KN-006, KN-007, KN-008 | Six combinations match Figma, every instance requires an accessible label and a test fails when one is missing, and the hit target is at least 32 by 32. |
| `KN-016` | Search bar, 3 states | high | 2 | web | KN-005, KN-006, KN-007, KN-008 | Three states match Figma, clearing restores the default state and returns focus to the field, and the input is debounced without dropping the final keystroke. |
| `KN-017` | Filter chip, doubling as the status counter | high | 2 | web | KN-005, KN-006, KN-007 | Four states match Figma, the count updates with the filtered data, selecting and deselecting are both reachable by keyboard, and the selected state is announced rather than only shown. |
| `KN-032` | Tooltip | high | 2 | web | KN-005, KN-006, KN-007 | It matches Figma, appears on hover and on keyboard focus rather than hover alone, and does not trap the pointer. |
| `KN-055` | Record where a task started, so a roast can diff the whole task | high | 2 | agent | KN-001 | Moving a task to in_progress records startHead, npm run roast with no --base diffs from that commit, a task spanning three commits shows all three in the prompt, and a test proves the prompt contains a change from the first of them. |
| `KN-066` | Apply contract exceptions per sentence, not per field | high | 2 | agent | KN-001 | Each of the three card wordings the reviewer supplied is rejected, a card that only records a prohibition is still accepted, the sidebar and fourth-tab decisions have staleness anchors, and a planted violation in one sentence of a multi-sentence field is caught. |
| `KN-067` | Recording an adjudication must not overwrite the last one | high | 2 | agent | KN-001 | Re-recording a round preserves the earlier adjudication as an entry in a history, the card shows the latest while the history remains readable, and a test proves an earlier filed list cannot be erased. |
| `KN-010` | Status chip, 9 statuses by 2 sizes, display only | high | 3 | web | KN-005, KN-006, KN-007 | Nine statuses at both sizes match their Figma nodes, Size=M is used only where the design uses it, the chip has no tabindex and no click handler and a test asserts that, and the label is rendered from the STATUS RECORD rather than from the lingui catalog, so a status the user has renamed shows its new name. Only the five default names ship as catalog messages, as the seed values for a fresh account. |
| `KN-011` | Input, 6 states | high | 3 | web | KN-005, KN-006, KN-007 | All six states match Figma, the error state shows border/error with text/error helper copy, the helper line reserves its space so the field does not jump when an error appears, and the label is bound to the input for screen readers. |
| `KN-019` | Colour picker for the four custom status slots | high | 3 | web | KN-005, KN-006, KN-007 | The picker offers exactly the four reserved pairs, matches Figma, marks the current selection, is keyboard navigable, and cannot produce a colour outside the reserved set. |
| `KN-021` | Page header | high | 3 | web | KN-005, KN-006, KN-007, KN-009, KN-008 | Both drawn instances match Figma, the optional back and action slots each render and are each omittable, the language switch appears only at the mobile breakpoint, and the title is the page heading in the accessibility tree. |
| `KN-022` | Empty state and loading state | high | 3 | web | KN-005, KN-006, KN-007, KN-009 | Both match Figma, the empty state carries a call to action that starts the add flow, and the loading state stays honest past 15 seconds rather than looking hung, which is the cold start case. |
| `KN-023` | Tabs | high | 3 | web | KN-005, KN-006, KN-007 | Three states match Figma, the tablist follows the roving tabindex pattern with arrow key navigation, the active tab is announced as selected, and panels are associated with their tabs. |
| `KN-024` | Sort control | high | 3 | web | KN-005, KN-006, KN-007, KN-018 | Three states match Figma, the four permitted options are the only ones offered, the current sort is visible on the closed control, the menu is keyboard navigable, and changing sort is announced. |
| `KN-025` | Bulk action bar | high | 3 | web | KN-005, KN-006, KN-007, KN-013, KN-009 | Both types match Figma, the bar appears only when at least one row is selected, it reports the selection count, and it is reachable by keyboard when it appears rather than trapping focus behind the list. |
| `KN-050` | CI: lint, typecheck, test, build, both workspaces | high | 3 | infra | KN-003, KN-033 | The workflow passes on a clean checkout, fails when a deliberately broken test is planted, and installs the Playwright browser before the Storybook project runs. |
| `KN-051` | Deploy the web app to GitHub Pages | high | 3 | deploy | KN-050 | The app loads at its Pages URL, a deep link to a route works on a hard refresh, Storybook is reachable at /storybook/, and the deploy runs from a push to main with no manual step. |
| `KN-062` | Shared story fixtures | high | 3 | web | KN-003, KN-007 | Every component story that needs data uses the shared fixtures, a Docs page rendering many stories at once seeds without error, the fixtures never appear in the production bundle and a test asserts that, and each fixture set has a long value that exercises truncation in both languages. |
| `KN-007` | Storybook docs infrastructure, in both languages, with its guard | high | 5 | web | KN-003, KN-006 | Adding a story with no markdown entry fails the guard test, a Docs page reads fully in Persian and fully in English, and planting a deliberately missing prop entry is caught. |
| `KN-008` | Icon set, 30 icons at 24 by 24 | high | 5 | web | KN-005, KN-006, KN-007 | Every one of the 30 named icons renders, a story shows the full grid, each is 24 by 24 with 2px round strokes, colour follows the prop and falls back to text/secondary, and a test asserts the exported set matches the list in DESIGN.md. |
| `KN-009` | Button, 3 sizes by 5 styles by 5 states | high | 5 | web | KN-005, KN-006, KN-007 | All 75 combinations render from a single story driven by args, each matches the Figma node for that combination, Focus shows the border/focus ring on keyboard focus only, and Disabled is not reachable by keyboard. |
| `KN-012` | Select, option row and options menu | high | 5 | web | KN-005, KN-006, KN-007 | All five select states and all four option states match Figma, the listbox is keyboard navigable with arrows, Home, End and type-ahead, the open state traps focus correctly, and closing returns focus to the trigger. |
| `KN-018` | Menu and menu item | high | 5 | web | KN-005, KN-006, KN-007, KN-008 | All four item states match Figma, both menu types render, the menu closes on Escape and on outside click and returns focus to its trigger, and destructive items are distinguishable without relying on colour alone. |
| `KN-020` | Status choice, status picker and status control | high | 5 | web | KN-005, KN-006, KN-007, KN-010, KN-018, KN-019 | All three families match Figma, the control opens the picker, choosing a status closes it and reports the change, Escape cancels without changing anything, and the underlying chip still has no interactive attributes of its own. |
| `KN-026` | Contact card, full and compact | high | 5 | web | KN-005, KN-006, KN-007, KN-008, KN-014, KN-062 | Both layouts and all three states match Figma, every field the design draws is present, long values truncate rather than reflow the card, and email and phone are actionable links. |
| `KN-028` | Modal shell, confirm, and change status | high | 5 | web | KN-005, KN-006, KN-007, KN-009, KN-014 | Both modals match Figma, focus is trapped and returns to the trigger on close, Escape closes, the backdrop click behaviour matches the design, and the dialog has an accessible name and is announced as a dialog. |
| `KN-031` | Contact modal, add and edit | high | 5 | web | KN-005, KN-006, KN-007, KN-028, KN-011, KN-026 | Both modes match Figma, Edit is prefilled from the record, validation errors render in the Input error state, and cancelling discards without saving. |
| `KN-038` | Custom statuses: rename, recolour, delete | high | 5 | api | KN-037 | A renamed status shows its new name everywhere including old records, deletion is refused while postings remain in that status and the message says how many, the four custom slots cannot be exceeded, a record pointing at a deleted status still renders with the fallback colour, and tests cover each. |
| `KN-042` | App shell: routing, responsive navigation, and the language switch in place | high | 5 | web | KN-027, KN-006, KN-035 | All three routes render inside the shell, the nav switches between right sidebar and bottom tab bar at the breakpoint, a deep link to any of them works on a hard refresh, the language switch persists across a reload, and an API error renders the error state rather than a blank page. |
| `KN-044` | Add job flow | high | 5 | web | KN-042, KN-029, KN-037 | An e2e test pastes a link, corrects a field in Review, saves, and finds the record on My Jobs with status New, and a second test takes the Error path into Manual and saves from there. |
| `KN-045` | Job detail modal, wired | high | 5 | web | KN-043, KN-030, KN-038, KN-039 | An e2e test opens a card, changes its status, sees the history grow, adds a note and a contact, closes and reopens, and finds all of it still there. |
| `KN-046` | Auth screens: login, code, signup | high | 5 | web | KN-042, KN-036 | An e2e test signs in with a number and the code from the mock provider and reaches the board, a wrong or expired code shows an honest message with a way to resend, first login collects the name, and signing out clears the token and the Apollo cache rather than only the UI. |
| `KN-052` | Deploy the API to Render with Supabase Postgres | high | 5 | deploy | KN-033, KN-034, KN-050 | The deployed app talks to the deployed API from the Pages origin, a cold start shows the loading state and completes rather than timing out, migrations ran, and no secret is in the repository. |
| `KN-054` | Backfill a verify command on every board task | high | 5 | agent | KN-001 | Every task on the board has a verify command pointing at an existing script under agent/scripts/verify, npm run todo -- validate fails when one does not, each script has been shown to fail against a deliberately planted break rather than only to pass, and no task's verify field contains prose. |
| `KN-060` | Kanban column component | high | 5 | web | KN-005, KN-006, KN-007, KN-010, KN-015, KN-018 | The column renders with cards, with none, and at the mobile width, its header shows the live count, the Size=M chip is used only here, the Add Card row stays pinned at the bottom as the column scrolls, and every state matches its Figma node. |
| `KN-061` | Drag a card between columns, with a keyboard path | high | 5 | web | KN-060, KN-020 | A card drags between two columns and the status persists, a failed mutation rolls the card back to its original column, the same move is achievable by keyboard alone, and the change is announced to assistive technology. |
| `KN-063` | Accessibility gate | high | 5 | web | KN-003, KN-007 | An a11y violation planted in a story fails the test run, every action reachable by hover is reachable by keyboard, every icon-only control has an accessible name and a test asserts it, and each of the nine status base-on-container pairs is measured against the contrast bar with the result recorded. |
| `KN-015` | Card, desktop and mobile, with the status stripe | high | 8 | web | KN-005, KN-006, KN-007, KN-010, KN-008, KN-062 | All six desktop states and both mobile states match Figma, the stripe renders the right colour for all nine statuses, a deleted or unknown status falls back to the new colour rather than rendering no stripe, and the card is keyboard focusable and activatable. |
| `KN-027` | Navigation: nav item, desktop sidebar, mobile tab bar, and the language switch | high | 8 | web | KN-005, KN-006, KN-007, KN-008, KN-009 | The sidebar renders on the right in Persian and mirrors correctly in English, the tab bar replaces it at the mobile breakpoint, exactly three destinations exist and are named with the current terminology, the language switch changes locale and direction and persists, and no fourth tab bar entry was added. |
| `KN-029` | Add and edit job modal, all six steps | high | 8 | web | KN-005, KN-006, KN-007, KN-011, KN-012, KN-028 | All six steps match Figma, every step is reachable in a story, Error offers Manual as the way out, Review is fully editable before saving, and leaving the modal mid-flow asks before discarding. |
| `KN-030` | Job modal, four tabs | high | 8 | web | KN-005, KN-006, KN-007, KN-023, KN-028, KN-026, KN-020 | All four tabs match Figma, the modal opens from a card on the board, status history renders in the Info tab in reverse chronological order, and switching tabs does not lose unsaved note text. |
| `KN-036` | Auth: phone OTP, JWT, and the admin role | high | 8 | api | KN-034 | A user signs in with a number and a code against the mock provider, the code expires and a reused code is rejected, first login collects the required name, a non-admin is refused every admin operation at the resolver rather than only in the UI, and tests cover all of those. |
| `KN-037` | Job records: CRUD, status transitions, and status history | high | 8 | api | KN-034, KN-036, KN-057 | An e2e test creates a record, moves it through New, Applied, Interview and Offer, and reads back a history with four entries in order, and a test proves history cannot be edited or reordered through the API. |
| `KN-039` | Contacts, notes and file references | high | 8 | api | KN-037 | A contact, a note and a file can each be attached to a record and read back, deleting a record removes its attachments, and an upload larger than the configured limit is refused with a usable error rather than a 500. |
| `KN-048` | End to end tests for both surviving scenarios | high | 8 | web | KN-043, KN-044, KN-045 | Both scenarios pass end to end on a clean database, each asserts the stored record and its status history rather than only what is on screen, and both run in CI. |
| `KN-049` | Coverage to 100 percent, enforced | high | 8 | web | KN-048 | Coverage reports 100 percent against the stated exclusions, the build fails when a line is uncovered, and every exclusion has a written reason. |
| `KN-056` | The standalone network screen | high | 8 | web | KN-042, KN-026, KN-032, KN-039 | An e2e test opens the network route, adds a contact, edits it, selects two and deletes them through the bottom bar, and sees the empty state on a fresh account. The grid reads right to left and row by row in Persian and mirrors in English, with no array reversal in the code. |
| `KN-057` | Posting extraction: turn a pasted link or text into a Review payload | high | 8 | api | KN-034 | Extraction from raw text returns the documented field set with a named test fixture, a URL pointing at a private or link-local address is refused, a slow or oversized response is aborted within the configured bound, every failure path returns the error shape the UI maps to the Error state, and the mock provider makes all of it runnable with no network. |
| `KN-043` | The kanban board screen | high | 13 | web | KN-042, KN-015, KN-016, KN-017, KN-024, KN-025, KN-022, KN-037, KN-060, KN-061 | An e2e test seeds an archive, drags a card between two columns and sees the status change persist, filters and searches, selects several and acts through the bottom bar, and opens a card into the modal, all against the real API. The rightmost column is the first stage in Persian and the layout mirrors in English. |
| `KN-053` | README in both languages, tech debt and phase-next records | medium | 3 | docs | KN-051, KN-052 | Both readmes describe the product and the cuts and are accurate against the deployed app, TECH-DEBT.md has an entry per suppression with the check that retires it, and PHASE-NEXT.md records every deliberate cut. |
| `KN-059` | Decompose the board tool after ten rounds of patching | medium | 3 | agent | KN-001 | move() reads as a sequence of named guards none of which exceeds about fifteen lines, the argument parser exists once and both scripts import it, and every existing gate test still passes unchanged. |
| `KN-040` | Third-party feedback, stored for later evaluation | medium | 5 | api | KN-034 | A submission is stored with its target and a pending state, it never mutates the target, a submission whose target was deleted between submit and review is handled rather than orphaned, and rate limiting stops a flood from one source. |
| `KN-041` | Admin API: the moderation queue | medium | 5 | api | KN-040, KN-036 | A non-admin is refused every operation at the resolver, approving and rejecting both record who did it and when, and the queue paginates rather than loading everything. |
| `KN-064` | Third-party feedback submission surface | medium | 5 | web | KN-042, KN-040 | An anonymous visitor can submit a comment and a suggested change against a record, both arrive in the moderation queue in a pending state, the target record is not altered, the submitter is told it is pending review, and a flood from one source is rate limited. |
| `KN-047` | Admin panel screen | medium | 8 | web | KN-042, KN-041 | An e2e test signs in as an admin, approves one submission and rejects another, and sees both leave the pending queue, and a non-admin reaching the route is refused rather than shown an empty panel. |

## Done (1)

| id | title | sev | pt | area | blocked by | exit condition |
| -- | ----- | --- | -- | ---- | ---------- | -------------- |
| `KN-001` | The loop, the board, and the tooling that runs them | critical | 3 | agent | none | "npm run todo -- validate" exits 0, "npm run todo -- next" names a task, agent/TODO_BOARD.md renders, "npm run roast" reaches Codex and archives a reply, and AGENTS.md plus DESIGN.md both exist with the Figma tokens transcribed. |

## Cards

### `KN-001` The loop, the board, and the tooling that runs them

- **status** done · **severity** critical · **points** 3 · **area** agent
- **blocked by** none

agent/RALPH.md (the iteration rules), agent/scripts/todo.mjs (the board tool, zero dependencies), agent/scripts/roast.mjs (the Codex harness on gpt-5.6-terra), agent/board.json seeded with the plan, plus AGENTS.md, DESIGN.md, CLAUDE.md and the root workspace config.

**Why.** Nothing can be picked, tracked, reviewed or resumed until the board and the loop exist. The loop has no memory except these files, so they have to be real before any code is written, and a context reset before they exist loses everything.

**Exit condition.** "npm run todo -- validate" exits 0, "npm run todo -- next" names a task, agent/TODO_BOARD.md renders, "npm run roast" reaches Codex and archives a reply, and AGENTS.md plus DESIGN.md both exist with the Figma tokens transcribed.

**Roasts.** round 1 scored 3.5 with 2 critical(s); round 2 scored 5 with 2 critical(s); round 3 scored 5.5 with 1 critical(s); round 4 scored 2.5 with 3 critical(s); round 5 scored 4.5 with 2 critical(s); round 6 scored 8 with 1 critical(s); round 7 scored 4.5 with 2 critical(s)

### `KN-002` Read the Figma Documentations canvas and fold it into the contract

- **status** backlog · **severity** critical · **points** 3 · **area** design
- **blocked by** KN-001

Read canvas 5:8 "Documentations" in full, and canvas 5:7 "Screens", and write what they say into DESIGN.md: the flows, the open items, the field list of a Job Record, the rules the annotations state, and anything that contradicts what is already written.

**Why.** The owner asked for this explicitly, right after the loop and the board. The design file carries decisions that are nowhere else, and building from the component canvas alone means rediscovering them as bugs. A contradiction found now is a paragraph; found in a screen it is a rewrite.

**Exit condition.** DESIGN.md has a section per documentation frame, every open item in the file is either reflected in the board as a task or recorded as a decision, and the Job Record field list is written down.

### `KN-003` Web app scaffold with the full quality gate

- **status** backlog · **severity** critical · **points** 8 · **area** web
- **blocked by** KN-001

apps/web on Vite, React 19, TypeScript, MUI, ESLint flat config with zero warnings and the lingui rule, Prettier, Vitest with a unit project and a Storybook project in headless Chromium, Storybook 10, Playwright for e2e, and coverage reporting.

**Why.** Every component task depends on the gate being real. A gate added after the components exist gets weakened to fit them, which is how a 100 percent coverage target quietly becomes 60. Building it first makes the standard non-negotiable rather than aspirational.

**Exit condition.** On a clean checkout, lint, lint:tsc, test, build and build-storybook all pass in apps/web, and both a deliberately broken test and a deliberately unlocalized string fail the run when planted by hand.

### `KN-004` Read the remaining type scale and any missing tokens from Figma

- **status** backlog · **severity** critical · **points** 3 · **area** design
- **blocked by** KN-001

Sweep the Foundations canvas for any token DESIGN.md is still missing, and correct anything that disagrees. The type scale itself is already transcribed: KN-001's exit condition demanded it, so all five roles were read from documentation frame 416:21 during that task, and Body/Small was found to have been deleted from the design entirely.

**Why.** The theme is generated from the token table, so a font size that was guessed rather than read propagates into every component and is invisible until someone compares against Figma by eye. Only Body and Label are currently verified.

**Exit condition.** A named sweep of the Foundations canvas finds no token absent from DESIGN.md, every value in the DESIGN.md tables is traceable to a Figma node id, and the KN-001 verify script's type-scale check still passes.

### `KN-005` Theme: tokens, MUI theme, direction and colour scheme provider

- **status** backlog · **severity** critical · **points** 5 · **area** web
- **blocked by** KN-003, KN-004

tokens.ts holding the Figma token set as typed constants, theme.ts mapping them onto MUI, and AppThemeProvider owning both colour scheme (light, dark, system) and direction, swapping the Emotion cache for RTL and setting dir and lang on the document.

**Why.** Every component reads colour, spacing and radius from here, so it has to exist before the first one. It also has to own direction, because a component that gets direction from somewhere else will be laid out backwards in exactly one of the two languages.

**Exit condition.** A Tokens story renders every colour, spacing and radius token with its name and value, the theme switches light and dark and RTL and LTR from the Storybook toolbars, and a test asserts no component file contains a raw hex colour.

### `KN-006` lingui: English source catalog, Persian translation, runtime switch

- **status** backlog · **severity** critical · **points** 5 · **area** web
- **blocked by** KN-003

lingui configured with en-US as the source locale and fa-IR as the translation, the macro plugin wired into Vite, Storybook and both Vitest projects, the eslint lingui rule enforcing localized strings with type information, and a runtime locale switch that also flips direction.

**Why.** The rule is that message ids are English and Persian is a translation, and it only holds if the tooling enforces it from the start. Retrofitting localization onto components that were written with bare strings means touching every component again.

**Exit condition.** A bare string literal in a tsx file fails lint, the app defaults to Persian, switching to English flips direction and persists, the fa-IR catalog is 100 percent translated, and a test fails when it is not.

### `KN-007` Storybook docs infrastructure, in both languages, with its guard

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-003, KN-006

src/shared/story-docs with en/ and fa/ markdown per story, a loader that applies whichever language the Storybook toolbar is set to, and a guard test that fails when a prop or story has no entry, an entry names something that no longer exists, or the Persian side is missing what the English side documents.

**Why.** Documentation prose is banned from tsx files, so it needs somewhere else to live before the first component ships with a story. The guard is what stops the Persian side rotting into a stale copy of an older English page.

**Exit condition.** Adding a story with no markdown entry fails the guard test, a Docs page reads fully in Persian and fully in English, and planting a deliberately missing prop entry is caught.

### `KN-008` Icon set, 30 icons at 24 by 24

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007

An Icon component rendering the 30 icons drawn at Figma node 239:44, each 24 by 24, 2px stroke, round cap and join, defaulting to text/secondary and overridable per instance. Sizes sm 16, md 20 and base 24 come from the token scale.

**Why.** Almost every other component contains an icon, so it blocks most of the component queue. Drawing them per component instead produces a set that drifts in weight and alignment, which is visible the moment two sit side by side.

**Exit condition.** Every one of the 30 named icons renders, a story shows the full grid, each is 24 by 24 with 2px round strokes, colour follows the prop and falls back to text/secondary, and a test asserts the exported set matches the list in DESIGN.md.

### `KN-009` Button, 3 sizes by 5 styles by 5 states

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007

Sizes S, M and L, styles Primary, Secondary, Text, Destructive and Ghost, and states Default, Hover, Pressed, Disabled and Focus, built on MUI Button and restyled to Figma nodes 37:10, 33:58 and 37:71. 75 combinations in total.

**Why.** It is the most repeated control in the product and the one where a wrong radius or hover tone is most visible. Every screen and every modal uses it, so getting it exactly right once removes the question everywhere else.

**Exit condition.** All 75 combinations render from a single story driven by args, each matches the Figma node for that combination, Focus shows the border/focus ring on keyboard focus only, and Disabled is not reachable by keyboard.

### `KN-010` Status chip, 9 statuses by 2 sizes, display only

- **status** backlog · **severity** high · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007

A display-only chip for the nine statuses at sizes S and M, from Figma node 82:2, taking base and container colours from the status token pairs. No click target and no focus ring, deliberately.

**Why.** Status is the spine of the product, so its visual language appears on every card, column header and filter. The design separates display from interaction on purpose, and merging them here would put a focus ring on every card on the board. The label is data rather than a translated constant, because a user can rename any status and a catalog cannot represent that.

**Exit condition.** Nine statuses at both sizes match their Figma nodes, Size=M is used only where the design uses it, the chip has no tabindex and no click handler and a test asserts that, and the label is rendered from the STATUS RECORD rather than from the lingui catalog, so a status the user has renamed shows its new name. Only the five default names ship as catalog messages, as the seed values for a fresh account.

### `KN-011` Input, 6 states

- **status** backlog · **severity** high · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007

Text input with Default, Filled, Focus, Error, Disabled and Hover, from Figma node 95:38, with the label, helper and error line the design draws.

**Why.** Every form in the product uses it: add job, manual entry, contact, note, admin. An input whose error state was never built means the first validation failure has nowhere to render.

**Exit condition.** All six states match Figma, the error state shows border/error with text/error helper copy, the helper line reserves its space so the field does not jump when an error appears, and the label is bound to the input for screen readers.

### `KN-012` Select, option row and options menu

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007

Select with Default, Filled, Focus, Disabled and Open from node 183:26, Option Row with Default, Hover, Selected and Disabled from 408:465, and the popover at 408:487. Includes the two domain selects the file draws, employment type and job level.

**Why.** The job record has enumerated fields, and the add and edit flows cannot be built without them. Hand-rolling a listbox is where keyboard support and screen reader semantics usually get lost, so this builds on the MUI primitive.

**Exit condition.** All five select states and all four option states match Figma, the listbox is keyboard navigable with arrows, Home, End and type-ahead, the open state traps focus correctly, and closing returns focus to the trigger.

### `KN-013` Checkbox, 5 states

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** KN-005, KN-006, KN-007

Unchecked, Checked, Indeterminate, Hover and Disabled from Figma node 204:11, at 20 by 20.

**Why.** Bulk selection on the board needs it, and indeterminate is what a partially selected column header shows. A checkbox without an indeterminate state forces the header into a lie when some cards are selected.

**Exit condition.** All five states match Figma, indeterminate is set through the DOM property rather than an attribute so it survives a re-render, and the control is reachable and toggleable by keyboard.

### `KN-014` Icon button, 2 tones by 3 states

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-008

Neutral and Danger tones, each with Default, Hover and Disabled, from Figma node 460:672, at 32 by 32 wrapping a 20px icon.

**Why.** Card actions, modal close and row menus all use it. It also has to carry an accessible name, because an icon-only control with no label is invisible to a screen reader.

**Exit condition.** Six combinations match Figma, every instance requires an accessible label and a test fails when one is missing, and the hit target is at least 32 by 32.

### `KN-015` Card, desktop and mobile, with the status stripe

- **status** backlog · **severity** high · **points** 8 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-010, KN-008, KN-062

The job card at Figma node 137:44 with Default, Hover, Pressed, Selected, Static and Focus, the mobile variant at 491:751 with Default and Selected, and the 4px status stripe at 358:430 in all nine status colours.

**Why.** It is the product. The archive scenario is a list of these, and the whole value of the tool is that the list reads at a glance. The stripe is what makes status legible without reading, so its colour has to survive a status the user has renamed or deleted.

**Exit condition.** All six desktop states and both mobile states match Figma, the stripe renders the right colour for all nine statuses, a deleted or unknown status falls back to the new colour rather than rendering no stripe, and the card is keyboard focusable and activatable.

### `KN-016` Search bar, 3 states

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-008

Default, Focus and Filled from Figma node 155:92, with the search icon and a clear affordance in the filled state.

**Why.** Finding one specific job opportunity in a growing archive is the second flow the design names. An archive you cannot search stops being useful at about the point it starts being valuable.

**Exit condition.** Three states match Figma, clearing restores the default state and returns focus to the field, and the input is debounced without dropping the final keystroke.

### `KN-017` Filter chip, doubling as the status counter

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** KN-005, KN-006, KN-007

Default, Hover, Pressed and Selected from Figma node 159:71, carrying a count. On mobile it is the scrolling status chip bar that stands in for the columns; on desktop it is the counter and filter row.

**Why.** It is both the filter and the summary: how many are in each status is the answer to "where do I actually stand", which is the archive scenario in one line.

**Exit condition.** Four states match Figma, the count updates with the filtered data, selecting and deselecting are both reachable by keyboard, and the selected state is announced rather than only shown.

### `KN-018` Menu and menu item

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-008

Menu Item with Default, Hover, Disabled and Destructive from node 181:22, and the two menus at 512:8350, Type=Status and Type=Card.

**Why.** Status management is inline through this menu, and the design gives it exactly three options: rename, change colour, delete. Reorder was removed. The card menu carries the destructive actions, and Destructive being a distinct drawn state means the design intends deletion to look different, not merely to be confirmed. The colour menu replaces the main menu rather than opening beside it.

**Exit condition.** All four item states match Figma, both menu types render, the menu closes on Escape and on outside click and returns focus to its trigger, and destructive items are distinguishable without relying on colour alone.

### `KN-019` Colour picker for the four custom status slots

- **status** backlog · **severity** high · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007

The picker at Figma node 257:17, offering the four reserved custom status colour pairs rather than a free colour field.

**Why.** A user-defined status still has to read as a status, which is why the design reserves exactly four slots instead of a colour wheel. Building a free picker here would let a user choose a colour that collides with rejected or offer and quietly break the glance-readability of the list.

**Exit condition.** The picker offers exactly the four reserved pairs, matches Figma, marks the current selection, is keyboard navigable, and cannot produce a colour outside the reserved set.

### `KN-020` Status choice, status picker and status control

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-010, KN-018, KN-019

Status Choice with Default, Hover and Selected from node 427:567, the Status Picker popover at 427:592, and Status Control with Default, Hover and Pressed at 199:21, which is the clickable wrapper the card uses around a display-only chip.

**Why.** Changing a status without opening anything is the core interaction of the organise scenario, whether by dragging a card between columns or by picking from the chip picker. The design deliberately keeps the chip inert and puts interaction in a wrapper, so this is where that separation is honoured or lost.

**Exit condition.** All three families match Figma, the control opens the picker, choosing a status closes it and reports the change, Escape cancels without changing anything, and the underlying chip still has no interactive attributes of its own.

### `KN-021` Page header

- **status** backlog · **severity** high · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-009, KN-008

Title, optional back button and optional primary action, from Figma node 155:56 with the second instance at 155:72. Carries the language switch as a trailing action on mobile, per DESIGN.md section 4.

**Why.** Every screen has one, and it is where the language control lives on mobile: the tab bar carries the three drawn destinations and a fourth entry would change the design, so the switch belongs here instead.

**Exit condition.** Both drawn instances match Figma, the optional back and action slots each render and are each omittable, the language switch appears only at the mobile breakpoint, and the title is the page heading in the accessibility tree.

### `KN-022` Empty state and loading state

- **status** backlog · **severity** high · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-009

Empty State at Figma node 159:80 for a job list with nothing in it, and Loading State at 159:92 for the extraction step in the add flow.

**Why.** The first thing a new user sees is the empty state, so it is the first impression of the product. The loading state covers extraction, and it also has to cover the Render free tier cold start, which can take about 50 seconds.

**Exit condition.** Both match Figma, the empty state carries a call to action that starts the add flow, and the loading state stays honest past 15 seconds rather than looking hung, which is the cold start case.

### `KN-023` Tabs

- **status** backlog · **severity** high · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007

Tab Item with Default, Active and Hover from Figma node 204:20, and the tablist that composes them.

**Why.** The job detail modal has four tabs and the design puts the whole detail view behind them, so the modal cannot be built before this is.

**Exit condition.** Three states match Figma, the tablist follows the roving tabindex pattern with arrow key navigation, the active tab is announced as selected, and panels are associated with their tabs.

### `KN-024` Sort control

- **status** backlog · **severity** high · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-018

Default, Hover and Open from Figma node 408:512.

**Why.** An archive that only grows needs an order the user chooses. The design permits exactly four: newest, oldest, nearest deadline, and company name alphabetically. Sorting by status is NOT one of them, because status is already the axis the board columns express.

**Exit condition.** Three states match Figma, the four permitted options are the only ones offered, the current sort is visible on the closed control, the menu is keyboard navigable, and changing sort is announced.

### `KN-025` Bulk action bar

- **status** backlog · **severity** high · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-013, KN-009

Type=Jobs and Type=Contacts from Figma node 401:436, appearing when a selection exists.

**Why.** Managing an archive of hundreds means acting on many at once. Without it, cleaning up a stale search means opening every card.

**Exit condition.** Both types match Figma, the bar appears only when at least one row is selected, it reports the selection count, and it is reachable by keyboard when it appears rather than trapping focus behind the list.

### `KN-026` Contact card, full and compact

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-008, KN-014, KN-062

Full and Compact layouts, each with Default, Hover and Selected, from Figma node 248:116. All contact information is on the card, the design gives it no detail view.

**Why.** A job lead is a person as often as it is a link. The design deliberately has no contact detail page, so everything has to fit on the card, which constrains what the contact record can hold.

**Exit condition.** Both layouts and all three states match Figma, every field the design draws is present, long values truncate rather than reflow the card, and email and phone are actionable links.

### `KN-027` Navigation: nav item, desktop sidebar, mobile tab bar, and the language switch

- **status** backlog · **severity** high · **points** 8 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-008, KN-009

Nav Item with Default, Active and Hover from node 184:14, the sidebar at 185:11 which sits on the RIGHT on desktop, and the tab bar at 185:19 at the bottom on mobile. THREE destinations, per the Documentation canvas which supersedes the Components canvas annotation: فرصت‌های شغلی من (the board), افزودن فرصت شغلی, and شبکه من (the standalone network page). The language switch goes at the foot of the sidebar on desktop, per DESIGN.md section 4.

**Why.** It is the frame every screen sits in, and it is where the owner asked for the language button to go without disturbing the design. Getting the RTL side wrong here puts the sidebar on the wrong edge for the default language of the product.

**Exit condition.** The sidebar renders on the right in Persian and mirrors correctly in English, the tab bar replaces it at the mobile breakpoint, exactly three destinations exist and are named with the current terminology, the language switch changes locale and direction and persists, and no fourth tab bar entry was added.

### `KN-028` Modal shell, confirm, and change status

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-009, KN-014

The modal shell with focus trap and Escape handling, Modal/Confirm at Figma node 150:92 for delete and archive, and Modal/Change Status at 150:93.

**Why.** Deleting a job opportunity is irreversible, and confirmation is the only thing between a user and losing part of their record. The shell also underpins the two larger modals, so its focus behaviour is inherited by both.

**Exit condition.** Both modals match Figma, focus is trapped and returns to the trigger on close, Escape closes, the backdrop click behaviour matches the design, and the dialog has an accessible name and is announced as a dialog.

### `KN-029` Add and edit job modal, all six steps

- **status** backlog · **severity** high · **points** 8 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-011, KN-012, KN-028

The Add/Edit modal at Figma node 166:82 with Step=Paste, PasteFilled, Loading, Review, Manual and Error. Paste takes a link or the text of an ad, Loading covers extraction, Review shows the structured result for correction, Manual is the fallback, Error is the failure path.

**Why.** This is scenario 3, the organise scenario, in one component. It is also where the product makes its argument: the user pastes, and the product does the structuring. If Review is not correctable the extraction being wrong makes the record wrong permanently.

**Exit condition.** All six steps match Figma, every step is reachable in a story, Error offers Manual as the way out, Review is fully editable before saving, and leaving the modal mid-flow asks before discarding.

### `KN-030` Job modal, four tabs

- **status** backlog · **severity** high · **points** 8 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-023, KN-028, KN-026, KN-020

The job detail modal at Figma node 210:276 with tabs Info, Note, Contacts and Files. Status history sits at the bottom of the Info tab, which the file flags as open item 18. Build it where the file puts it.

**Why.** The design replaced a detail page with this modal, so it is the only place the full record is visible. Status history is the record of the trail, which is the anchor of the whole product.

**Exit condition.** All four tabs match Figma, the modal opens from a card on the board, status history renders in the Info tab in reverse chronological order, and switching tabs does not lose unsaved note text.

### `KN-031` Contact modal, add and edit

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-028, KN-011, KN-026

Mode=Add and Mode=Edit from Figma node 270:152.

**Why.** Contacts are added from inside the job modal, so this is how a person gets attached to an application. Edit exists because a phone number learned later is the common case.

**Exit condition.** Both modes match Figma, Edit is prefilled from the record, validation errors render in the Input error state, and cancelling discards without saving.

### `KN-032` Tooltip

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** KN-005, KN-006, KN-007

The tooltip at Figma node 410:469.

**Why.** Icon-only controls need a visible label on hover as well as an accessible one. It is small and nothing else blocks on it, which is why it sits at the end of the component queue.

**Exit condition.** It matches Figma, appears on hover and on keyboard focus rather than hover alone, and does not trap the pointer.

### `KN-033` API scaffold: NestJS, GraphQL code first, and its quality gate

- **status** backlog · **severity** critical · **points** 8 · **area** api
- **blocked by** KN-001

apps/api on NestJS with GraphQL code first, ESLint, Prettier, Jest or Vitest with coverage, a health endpoint, and configuration through environment variables with no secret committed.

**Why.** The web app cannot move past local fixtures without a schema to generate from, and the schema is the contract between the two halves. Building the gate with the scaffold is the same argument as on the web side.

**Exit condition.** lint, typecheck, test and build all pass in apps/api, the server starts, the GraphQL playground serves the schema, the health endpoint answers, and a missing required environment variable fails at startup with a clear message rather than at first request.

### `KN-034` Prisma schema, Postgres on Supabase, and migrations

- **status** backlog · **severity** critical · **points** 5 · **area** api
- **blocked by** KN-033

Prisma over Supabase Postgres. Models for user, job record, status, status history, contact, note, file reference, feedback submission, and the admin moderation state. Migrations checked in and runnable.

**Why.** The data model is the product: the trail is what compounds, so status history in particular has to be a first class table rather than a column that is overwritten. Getting it wrong later means a migration over real user data.

**Exit condition.** Migrations apply to an empty database and to an existing one, the schema covers every field the Figma job record names, status history records every transition with its timestamp, and a seed script produces a realistic archive to develop against.

### `KN-035` GraphQL codegen wired both ways

- **status** backlog · **severity** critical · **points** 5 · **area** graphql
- **blocked by** KN-003, KN-033

packages/graphql holding the schema and the generated types, with codegen run from the API schema and consumed by the web app, plus a CI check that fails when the checked-in output is stale.

**Why.** The whole reason for a monorepo is that a schema change fails at typecheck rather than at runtime. Without the staleness check the generated types drift and the guarantee quietly disappears.

**Exit condition.** Changing the API schema without regenerating fails the build, the web app imports only generated types for GraphQL data, and no hand-written interface duplicates a generated one.

### `KN-036` Auth: phone OTP, JWT, and the admin role

- **status** backlog · **severity** high · **points** 8 · **area** api
- **blocked by** KN-034

A mobile number, then a five digit code, then a JWT. Login, Code and Signup as drawn at page-map row 6. The name is asked only on first login and is required there. The SMS provider sits behind an interface with a mock implementation that logs the code, so the MVP needs no SMS credit; email stays as a second channel behind the same interface. One ADMIN role gates the admin surface. Third-party feedback stays anonymous.

**Why.** The design draws phone OTP and the owner confirmed it over an earlier email magic link decision, adding that the provider is mocked for the MVP. The archive accrues over months so it has to survive a device change, which rules out a device-only token, and passwordless avoids storing passwords and building reset flows for a two-scenario MVP.

**Exit condition.** A user signs in with a number and a code against the mock provider, the code expires and a reused code is rejected, first login collects the required name, a non-admin is refused every admin operation at the resolver rather than only in the UI, and tests cover all of those.

### `KN-037` Job records: CRUD, status transitions, and status history

- **status** backlog · **severity** high · **points** 8 · **area** api
- **blocked by** KN-034, KN-036, KN-057

Create, read, update, archive and delete a job record, using the extraction service for the pasted path. Every status change appends to history with its timestamp, and history is never rewritten. Required fields are title, company and status, per frame 434:2; status always has a value and defaults to ذخیره‌شده.

**Why.** This is both surviving scenarios on the server side. History being append only is the anchor: the value of the product is that it can tell you what happened and when, and an overwritten status cannot.

**Exit condition.** An e2e test creates a record, moves it through New, Applied, Interview and Offer, and reads back a history with four entries in order, and a test proves history cannot be edited or reordered through the API.

### `KN-038` Custom statuses: rename, recolour, delete

- **status** backlog · **severity** high · **points** 5 · **area** api
- **blocked by** KN-037

Per-user status definitions, which are the kanban columns. The five defaults can be renamed, up to four custom statuses can be created using the four reserved colour slots, and deleting a status has to define what happens to the records holding it. The column menu has exactly THREE options, rename, change colour and delete: reorder was removed from the design. Delete is refused while the column still holds postings, and the UI explains why.

**Why.** The design draws four reserved slots and inline management, so this is a first class feature rather than a setting. Deletion is the sharp edge: records pointing at a deleted status must not become unreadable, which is why the card falls back to the new colour.

**Exit condition.** A renamed status shows its new name everywhere including old records, deletion is refused while postings remain in that status and the message says how many, the four custom slots cannot be exceeded, a record pointing at a deleted status still renders with the fallback colour, and tests cover each.

### `KN-039` Contacts, notes and file references

- **status** backlog · **severity** high · **points** 8 · **area** api
- **blocked by** KN-037

Contacts attached to a job record, free-text notes, and file references. Files are stored through Supabase storage rather than in the database, and the record holds the reference.

**Why.** These are the three tabs of the job modal beside Info, so the modal cannot be wired without them. Storing files in Postgres would exhaust the free tier quickly and make backups unusable.

**Exit condition.** A contact, a note and a file can each be attached to a record and read back, deleting a record removes its attachments, and an upload larger than the configured limit is refused with a usable error rather than a 500.

### `KN-040` Third-party feedback, stored for later evaluation

- **status** backlog · **severity** medium · **points** 5 · **area** api
- **blocked by** KN-034

Anonymous submissions from people who are not the owner of a record: a comment, or a suggested change. Stored with their target and a pending state, never applied automatically.

**Why.** The owner asked for this specifically: other people can say something and it is kept for evaluation. Applying a suggestion automatically would let a stranger edit someone else's archive, which is why the state machine matters more than the form.

**Exit condition.** A submission is stored with its target and a pending state, it never mutates the target, a submission whose target was deleted between submit and review is handled rather than orphaned, and rate limiting stops a flood from one source.

### `KN-041` Admin API: the moderation queue

- **status** backlog · **severity** medium · **points** 5 · **area** api
- **blocked by** KN-040, KN-036

Admin-only operations to list, read, approve and reject submissions, and to see what users have filled in. Every action is attributed and timestamped.

**Why.** The owner asked for an admin panel over what users submit. Attribution is what makes it reviewable later: an approval nobody can trace is indistinguishable from a data change nobody authorised.

**Exit condition.** A non-admin is refused every operation at the resolver, approving and rejecting both record who did it and when, and the queue paginates rather than loading everything.

### `KN-042` App shell: routing, responsive navigation, and the language switch in place

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-027, KN-006, KN-035

The three routes the design draws, the board, add, and the network page, inside the responsive nav frame, with the Apollo client, auth state and error boundary wired, and the language switch working from the sidebar on desktop and the page header on mobile.

**Why.** It is the frame the screens sit in, and it is the first point where the front and the back meet. Building screens before it means each one invents its own layout and they disagree.

**Exit condition.** All three routes render inside the shell, the nav switches between right sidebar and bottom tab bar at the breakpoint, a deep link to any of them works on a hard refresh, the language switch persists across a reload, and an API error renders the error state rather than a blank page.

### `KN-043` The kanban board screen

- **status** backlog · **severity** high · **points** 13 · **area** web
- **blocked by** KN-042, KN-015, KN-016, KN-017, KN-024, KN-025, KN-022, KN-037, KN-060, KN-061

The board, not a list. Columns ARE statuses, laid out RTL so the rightmost column is the first stage, scrolling horizontally on desktop and collapsing to one column plus a scrolling status chip bar on mobile. Cards drag between columns. Includes the toolbar (sort and search), the column header with its count and menu, the per-column Add Card row, the Add Column tile labelled افزودن وضعیت, bulk selection via the bottom floating bar, and the empty and search-empty states.

**Why.** This is scenario 4, the archive, and it is the screen the product is judged on. The kanban form is the point rather than a decoration: seeing how many sit in each stage IS the view of where you stand, which is the thing nobody else keeps for you. An earlier version of this card described a plain list, which the Documentation canvas supersedes.

**Exit condition.** An e2e test seeds an archive, drags a card between two columns and sees the status change persist, filters and searches, selects several and acts through the bottom bar, and opens a card into the modal, all against the real API. The rightmost column is the first stage in Persian and the layout mirrors in English.

### `KN-044` Add job flow

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-042, KN-029, KN-037

The add route driving the modal through Paste, Loading, Review and save, with Manual and Error as the alternate paths, writing a real record.

**Why.** This is scenario 3, the organise scenario. It is the only way data enters the product, so if it is awkward the archive stays empty and nothing else matters.

**Exit condition.** An e2e test pastes a link, corrects a field in Review, saves, and finds the record on My Jobs with status New, and a second test takes the Error path into Manual and saves from there.

### `KN-045` Job detail modal, wired

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-043, KN-030, KN-038, KN-039

The four-tab modal reading and writing real data: info and status with history, notes, contacts and files.

**Why.** It is where the trail is actually read. Status history in particular is the payoff of the whole data model, and this is the only place it surfaces.

**Exit condition.** An e2e test opens a card, changes its status, sees the history grow, adds a note and a contact, closes and reopens, and finds all of it still there.

### `KN-046` Auth screens: login, code, signup

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-042, KN-036

The three screens at page-map row 6, both desktop (407:6951, 407:6972, 407:7000) and mobile (407:7022, 407:7043, 407:7071): enter a mobile number, enter the five digit code, and the first-login signup that collects the name. Includes the expired code, wrong code and resend paths.

**Why.** Everything in the archive belongs to someone, so nothing else can be real until sign-in is. The failure cases matter more than the happy path: a mistyped or expired five digit code is the common experience of an OTP flow, and a resend that silently does nothing is the usual way it goes wrong.

**Exit condition.** An e2e test signs in with a number and the code from the mock provider and reaches the board, a wrong or expired code shows an honest message with a way to resend, first login collects the name, and signing out clears the token and the Apollo cache rather than only the UI.

### `KN-047` Admin panel screen

- **status** backlog · **severity** medium · **points** 8 · **area** web
- **blocked by** KN-042, KN-041

The moderation queue: list submissions, read one against its target, approve or reject, and browse what users have filled in.

**Why.** The owner asked for a way to manage what users submit. Without a surface the feedback table fills up and nobody ever reads it, which is the same as not collecting it.

**Exit condition.** An e2e test signs in as an admin, approves one submission and rejects another, and sees both leave the pending queue, and a non-admin reaching the route is refused rather than shown an empty panel.

### `KN-048` End to end tests for both surviving scenarios

- **status** backlog · **severity** high · **points** 8 · **area** web
- **blocked by** KN-043, KN-044, KN-045

Playwright specs for scenario 3, organise, and scenario 4, archive, driving the real app against the real API and asserting the resulting data rather than only the UI.

**Why.** The scenarios are the definition of the product, so they are the definition of done. Asserting the data rather than the buttons is what makes a passing run mean the scenario still works.

**Exit condition.** Both scenarios pass end to end on a clean database, each asserts the stored record and its status history rather than only what is on screen, and both run in CI.

### `KN-049` Coverage to 100 percent, enforced

- **status** backlog · **severity** high · **points** 8 · **area** web
- **blocked by** KN-048

Bring both workspaces to full coverage and fail the build below the threshold, with the exclusion list limited to barrels, stories, generated code and entry points, each exclusion justified.

**Why.** The target is a floor rather than a trophy, and an unenforced target is a number that only goes down. Justifying each exclusion is what stops the list becoming the place uncovered code goes to hide.

**Exit condition.** Coverage reports 100 percent against the stated exclusions, the build fails when a line is uncovered, and every exclusion has a written reason.

### `KN-050` CI: lint, typecheck, test, build, both workspaces

- **status** backlog · **severity** high · **points** 3 · **area** infra
- **blocked by** KN-003, KN-033

A GitHub Actions workflow running the full gate on push and pull request, including the Storybook browser project and the codegen staleness check.

**Why.** The gate only means something if it runs somewhere the author cannot skip it. The Storybook project needs a browser installed in CI or the whole project fails to launch rather than failing a test.

**Exit condition.** The workflow passes on a clean checkout, fails when a deliberately broken test is planted, and installs the Playwright browser before the Storybook project runs.

### `KN-051` Deploy the web app to GitHub Pages

- **status** backlog · **severity** high · **points** 3 · **area** deploy
- **blocked by** KN-050

Build with the repository base path, publish to Pages on push to main, serve index.html as the 404 so client-side deep links work, and publish Storybook alongside at /storybook/.

**Why.** A deployed public page was one of the owner's pre-flight requirements, and the component library being reviewable at the same URL is what makes the component-first order legible to anyone else.

**Exit condition.** The app loads at its Pages URL, a deep link to a route works on a hard refresh, Storybook is reachable at /storybook/, and the deploy runs from a push to main with no manual step.

### `KN-052` Deploy the API to Render with Supabase Postgres

- **status** backlog · **severity** high · **points** 5 · **area** deploy
- **blocked by** KN-033, KN-034, KN-050

A Render free web service running the API against Supabase Postgres, with CORS for the Pages origin, migrations run on deploy, secrets in the environment, plus a warm ping from the web app and an honest loading state for the cold start.

**Why.** The free tier sleeps after 15 minutes, so the first request after a nap takes about 50 seconds. That is a real user experience and it has to be designed for rather than discovered.

**Exit condition.** The deployed app talks to the deployed API from the Pages origin, a cold start shows the loading state and completes rather than timing out, migrations ran, and no secret is in the repository.

### `KN-053` README in both languages, tech debt and phase-next records

- **status** backlog · **severity** medium · **points** 3 · **area** docs
- **blocked by** KN-051, KN-052

README.md and README.fa.md describing what the product is, what was deliberately cut and why, how to run it, and where it is deployed. TECH-DEBT.md and PHASE-NEXT.md started and kept current.

**Why.** The scope cuts are the most interesting decision in this project and the reasoning is currently only in a chat log. Writing down that crawling failed filter 4, rather than being merely unbuilt, is what stops it being re-proposed every month.

**Exit condition.** Both readmes describe the product and the cuts and are accurate against the deployed app, TECH-DEBT.md has an entry per suppression with the check that retires it, and PHASE-NEXT.md records every deliberate cut.

### `KN-054` Backfill a verify command on every board task

- **status** backlog · **severity** high · **points** 5 · **area** agent
- **blocked by** KN-001

Give every task on the board a verify command, each one a node script under agent/scripts/verify that asserts as much of that task's exit condition as a command can, then make validate fail on a task that has none. A verify command is always executable: there is no way to write prose into that field, because move done runs whatever is there. Where part of a condition genuinely cannot be commanded, for example that a layout was looked at in both languages, the script asserts everything around it and the remainder is stated in the --evidence that closing already requires.

**Why.** Codex's round 2 roast on KN-001 was right that calling prose exit conditions unverifiable was too broad, and that the debt note was hiding a tractable problem. move done already runs verify where it is set, but almost no task sets it, so the gate is mostly decorative.

**Exit condition.** Every task on the board has a verify command pointing at an existing script under agent/scripts/verify, npm run todo -- validate fails when one does not, each script has been shown to fail against a deliberately planted break rather than only to pass, and no task's verify field contains prose.

### `KN-055` Record where a task started, so a roast can diff the whole task

- **status** backlog · **severity** high · **points** 2 · **area** agent
- **blocked by** KN-001

When a task moves to in_progress, record the current HEAD on it as startHead. Make the roast harness default --base to that instead of HEAD~1, so a roast sees everything the task changed rather than only its last commit. Show it on the card.

**Why.** A task spans several commits. The harness defaults to HEAD~1, so from task two onward every roast reviews only the final commit of the task and silently misses the rest, which is a reviewer looking at a fraction of the work while reporting on all of it. KN-001 only avoided this because it passed the empty tree as an explicit base.

**Exit condition.** Moving a task to in_progress records startHead, npm run roast with no --base diffs from that commit, a task spanning three commits shows all three in the prompt, and a test proves the prompt contains a change from the first of them.

### `KN-056` The standalone network screen

- **status** backlog · **severity** high · **points** 8 · **area** web
- **blocked by** KN-042, KN-026, KN-032, KN-039

شبکه من, the third nav destination, drawn at page-map row 5: the contacts list on desktop (252:2) and mobile (252:411), selection states, add and edit modals, the bottom bulk bar, delete confirmation, and the empty state. The grid is two columns ordered right to left and row by row, achieved with direction rtl and the natural array order rather than by reversing the array.

**Why.** It is a drawn destination with ten screens and the board had no task that composes it. Contact Card and Contact Modal exist as components, but nothing routed them, loaded their data, or handled selection, so the screen would have been discovered missing only when the navigation task tried to link to it.

**Exit condition.** An e2e test opens the network route, adds a contact, edits it, selects two and deletes them through the bottom bar, and sees the empty state on a fresh account. The grid reads right to left and row by row in Persian and mirrors in English, with no array reversal in the code.

### `KN-057` Posting extraction: turn a pasted link or text into a Review payload

- **status** backlog · **severity** high · **points** 8 · **area** api
- **blocked by** KN-034

The service behind the Loading step. Takes either a URL or the raw text of a posting and returns the structured fields the Review step edits: title, company, location, employment type, job level, experience, salary, posted and expiry dates, source, description and skills. Behind an interface with a deterministic mock for dev and tests. URL fetching must be SSRF-safe (no private or link-local addresses, no redirects to them), time-bounded, size-capped, and must map every failure onto the drawn Error state whose way out is the Manual form.

**Why.** This is the product's actual argument, that the user pastes and the product does the structuring, and it was the one piece with no task. KN-029 draws Loading, Review and Error, KN-044 tests pasting a link, and KN-037 said only create from a pasted link or text, so the extraction behaviour, its failure mapping and its safety boundary would have been discovered when the UI first needed a real payload. Fetching a user-supplied URL from the server is also the one place in this product with a genuine security surface.

**Exit condition.** Extraction from raw text returns the documented field set with a named test fixture, a URL pointing at a private or link-local address is refused, a slow or oversized response is aborted within the configured bound, every failure path returns the error shape the UI maps to the Error state, and the mock provider makes all of it runnable with no network.

### `KN-058` Run verify commands without a shell

- **status** review · **severity** critical · **points** 2 · **area** agent
- **blocked by** KN-001

move done executes a task's verify command with shell true, so anything after the accepted script prefix is interpreted by the shell. node agent/scripts/verify/KN-001.mjs || exit 0 passes validation and then masks a failing verifier. Parse the command into an executable and its arguments and spawn it directly, with no shell.

**Why.** The verify command is the one mechanical check that a task's exit condition holds, and a shell operator turns it into a check that always passes. It is not a forgery concern, it is the ordinary case of someone appending something to a command line and quietly disabling the gate.

**Exit condition.** A verify command containing a shell operator is refused when set, an existing one is refused at close, the two current verifiers still run, and a deliberately failing verifier still blocks move done.

### `KN-059` Decompose the board tool after ten rounds of patching

- **status** backlog · **severity** medium · **points** 3 · **area** agent
- **blocked by** KN-001

move() now handles state transitions, blocking, dropping, roast adjudication, artifact validation, revision binding, dirty-work checks, verifier execution and evidence collection in one function. The argument parser is duplicated in todo.mjs and roast.mjs. Split the lifecycle rules into named guards, move the parser into agent/scripts/lib, and leave move() reading as the list of conditions it enforces.

**Why.** It grew a rule at a time across ten roast rounds and it shows. The next lifecycle rule added to that function is the one that lands in the wrong place or interacts with a check nobody remembered, and the duplicated parser has already drifted once between the two scripts.

**Exit condition.** move() reads as a sequence of named guards none of which exceeds about fifteen lines, the argument parser exists once and both scripts import it, and every existing gate test still passes unchanged.

### `KN-060` Kanban column component

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-010, KN-015, KN-018

The column itself, 300 by 684 from node 241:125: the 276 by 40 header carrying its status icon, its count and its menu trigger, the card slot, the column spacer, and the Add Card row pinned at the bottom as a plus only. Plus the Add Column tile at 241:34 labelled افزودن وضعیت, and the empty-column message. Composes Card, Status Chip at Size=M which is the only place the large chip is used, and Menu.

**Why.** Components before screens, and the column is a component the board screen composes rather than part of the screen. Building it inside the screen would mean its header, its empty state and its Add Card row never get reviewed in isolation, and the Size=M status chip has exactly one legitimate use which lives here.

**Exit condition.** The column renders with cards, with none, and at the mobile width, its header shows the live count, the Size=M chip is used only here, the Add Card row stays pinned at the bottom as the column scrolls, and every state matches its Figma node.

### `KN-061` Drag a card between columns, with a keyboard path

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-060, KN-020

Dragging a card from one column to another changes its status, with the Drag and Drop Done states the design draws. Includes a keyboard-accessible alternative, since drag alone is unusable without a pointer, and the optimistic update plus rollback when the mutation fails.

**Why.** Moving a card between statuses IS the organise scenario, and it is the interaction the kanban form exists for. It is also the single most accessibility-hostile pattern in the product: a board that can only be operated by dragging excludes keyboard and screen reader users from the core action, so the keyboard path is part of the feature rather than a later improvement.

**Exit condition.** A card drags between two columns and the status persists, a failed mutation rolls the card back to its original column, the same move is achievable by keyboard alone, and the change is announced to assistive technology.

### `KN-062` Shared story fixtures

- **status** backlog · **severity** high · **points** 3 · **area** web
- **blocked by** KN-003, KN-007

A fixtures module under src/shared/story-fixtures holding realistic sample data for stories: job opportunities across every status, contacts, notes and a seeded board, in Persian and English. Storybook only, never bundled into the app. Seeding is idempotent and safe when several stories on one Docs page seed at once.

**Why.** A Docs page renders every story of a component at once, so several stories seed simultaneously. Getting that wrong produces constraint errors on every Docs page from clear and write runs interleaving, which is a real failure this exact stack has produced before. Realistic data also matters: a card with a one word title hides the truncation the design relies on, and English strings are longer than Persian so a fixture that fits one may overflow the other.

**Exit condition.** Every component story that needs data uses the shared fixtures, a Docs page rendering many stories at once seeds without error, the fixtures never appear in the production bundle and a test asserts that, and each fixture set has a long value that exercises truncation in both languages.

### `KN-063` Accessibility gate

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-003, KN-007

Wire the Storybook a11y addon into the test run so a violation fails the build rather than showing a warning, and add the checks the design specifically needs: focus visible on every interactive element, keyboard reachability for every action including the ones the design only draws on hover, correct roles for the board columns and the tab lists, an accessible name on every icon-only control, and contrast on the status chip pairs in both directions.

**Why.** The design draws a Focus state for every interactive component, which is a commitment, and the product hides real actions behind hover: the card checkbox and delete icon appear on hover only. Without a gate those become mouse-only actions and nobody notices until someone cannot use the product. The status colours are also the one place contrast is easy to lose, since a base colour on its own container is exactly the pairing that fails.

**Exit condition.** An a11y violation planted in a story fails the test run, every action reachable by hover is reachable by keyboard, every icon-only control has an accessible name and a test asserts it, and each of the nine status base-on-container pairs is measured against the contrast bar with the result recorded.

### `KN-064` Third-party feedback submission surface

- **status** backlog · **severity** medium · **points** 5 · **area** web
- **blocked by** KN-042, KN-040

The web surface for someone who is not the owner of a record leaving a comment or a suggested change, which is then stored pending review rather than applied. Anonymous, no account, rate limited, and it must make clear to the person submitting that their suggestion is a suggestion.

**Why.** The owner asked for this directly: other people can say something and it is kept for evaluation. KN-040 builds the API and KN-041 builds the moderation queue, but nothing built the surface a person actually submits through, so the feature would have been half present, with a table filling from nowhere and an admin screen reviewing an empty queue.

**Exit condition.** An anonymous visitor can submit a comment and a suggested change against a record, both arrive in the moderation queue in a pending state, the target record is not altered, the submitter is told it is pending review, and a flood from one source is rate limited.

### `KN-065` move done must require a verify command

- **status** backlog · **severity** critical · **points** 2 · **area** agent
- **blocked by** KN-001

Make verify mandatory rather than optional at close. Today a task with no verify closes on a manifest-bound round, a filed list and any non-empty prose evidence, so its exit condition is never mechanically checked. Require a verify command on any task reaching done, and make validate report how many tasks still lack one.

**Why.** The done gate currently proves that a review happened and that its findings were filed. It does not prove the work works. Most of the board has no verify command, so as it stands almost every task can close while its test, its deployment or its visual check is plainly false, which is precisely the failure the gate exists to prevent.

**Exit condition.** move done refuses a task with no verify command, the message names KN-054 as where the backfill happens, a task with a deliberately failing verify still cannot close, and validate reports the count of tasks lacking one.

### `KN-066` Apply contract exceptions per sentence, not per field

- **status** backlog · **severity** high · **points** 2 · **area** agent
- **blocked by** KN-001

The contract checker exempts an entire card field when any part of it matches an allowed pattern. So a card reading On desktop, status is a dropdown; it is not a dropdown on mobile passes, and the same flaw defeats the sidebar and fourth-tab rules. Match and exempt at sentence level. Add the missing staleness anchors for sidebar-on-the-right and no-fourth-tab.

**Why.** An exception that covers a whole field means any card can be exempted from any rule by mentioning the prohibition somewhere in it, which is the easiest possible thing to do by accident when a card explains why a decision was made. A checker with that hole reports clean while the board drifts, which is worse than no checker because it is trusted.

**Exit condition.** Each of the three card wordings the reviewer supplied is rejected, a card that only records a prohibition is still accepted, the sidebar and fourth-tab decisions have staleness anchors, and a planted violation in one sentence of a multi-sentence field is caught.

### `KN-067` Recording an adjudication must not overwrite the last one

- **status** backlog · **severity** high · **points** 2 · **area** agent
- **blocked by** KN-001

Re-running roast against the same archive rebuilds and replaces that round, so the previous filed list, dismissal rationale, score and critical count are destroyed. Append an adjudication event to the round instead, keeping every recorded judgement in order, and render the latest while preserving the history.

**Why.** The board is meant to be the audit trail of what was reviewed and what the author accepted. Overwriting means an author can quietly lower criticals, swap a filed list for none, or erase that adjudication happened at all, and only the raw Codex reply survives to contradict it. The whole point of recording the adjudication separately from the reviewer verdict is that both are visible.

**Exit condition.** Re-recording a round preserves the earlier adjudication as an entry in a history, the card shows the latest while the history remains readable, and a test proves an earlier filed list cannot be erased.

