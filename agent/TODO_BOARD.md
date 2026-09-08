# Board

<!-- GENERATED FILE. Edit agent/board.json through agent/scripts/todo.mjs, never this file. -->

Project **KarNama** · 8 of 103 tasks done · 24 of 387 points.

Columns are statuses. Within a column the order is the order `npm run todo -- next`
would pick: severity first, then the smaller story point, then the older id. A task
whose blockers are unsettled is never picked, whatever its severity.

**Next up: `KN-005` Theme: tokens, MUI theme, direction and colour scheme provider** (critical, 3 pt, web)

## Awaiting roast (1)

| id | title | sev | pt | area | blocked by | exit condition |
| -- | ----- | --- | -- | ---- | ---------- | -------------- |
| `KN-005` | Theme: tokens, MUI theme, direction and colour scheme provider | critical | 3 | web | KN-003, KN-004 | A Tokens story renders every colour, spacing and radius token with its name and value, the theme switches light and dark and RTL and LTR from the Storybook toolbars, and a test asserts no component file contains a raw hex colour. |

## Backlog (93)

| id | title | sev | pt | area | blocked by | exit condition |
| -- | ----- | --- | -- | ---- | ---------- | -------------- |
| `KN-006` | lingui: English source catalog, Persian translation, runtime switch | critical | 3 | web | KN-003 | A bare string literal in a tsx file fails lint, the app defaults to Persian, switching to English flips direction and persists, the fa-IR catalog is 100 percent translated, and a test fails when it is not. |
| `KN-034` | Prisma schema, Postgres on Supabase, and migrations | critical | 5 | api | KN-033 | Migrations apply to an empty database and to an existing one, the schema covers every field the Figma job record names, status history records every transition with its timestamp, and a seed script produces a realistic archive to develop against. |
| `KN-035` | GraphQL codegen wired both ways | critical | 5 | graphql | KN-003, KN-033 | Changing the API schema without regenerating fails the build, the web app imports only generated types for GraphQL data, and no hand-written interface duplicates a generated one. |
| `KN-033` | API scaffold: NestJS, GraphQL code first, and its quality gate | critical | 8 | api | KN-001 | lint, typecheck, test and build all pass in apps/api, the server starts, the GraphQL playground serves the schema, the health endpoint answers, and a missing required environment variable fails at startup with a clear message rather than at first request. |
| `KN-070` | Decide where رد شده belongs on the board | high | 1 | design | KN-002 | DESIGN.md records the answer as a decision with who made it, section 6 no longer lists it as open, and the column order in section 3 matches. |
| `KN-071` | Decide whether a contact needs an email or a phone | high | 1 | design | KN-002 | DESIGN.md records the answer as a decision, section 6 no longer lists it as open, and KN-031 and KN-039 state the resulting rule. |
| `KN-072` | Decide where status history belongs | high | 1 | design | KN-002 | DESIGN.md records the answer as a decision, section 6 no longer lists it as open, and KN-030 states where history renders. |
| `KN-100` | Make the gate-fixtures flag hermetic | high | 1 | agent | KN-088 | KARNAMA_GATE_FIXTURES=0 npm test passes and runs no fixture, the ordinary run inside agent/scripts/verify/KN-003.mjs passes with the variable set to any value in the parent environment, and both are proved by planted environments. |
| `KN-013` | Checkbox, 5 states | high | 2 | web | KN-005, KN-006, KN-007 | All five states match Figma, indeterminate is set through the DOM property rather than an attribute so it survives a re-render, and the control is reachable and toggleable by keyboard. |
| `KN-014` | Icon button, 2 tones by 3 states | high | 2 | web | KN-005, KN-006, KN-007, KN-008 | Six combinations match Figma, every instance requires an accessible label and a test fails when one is missing, and the hit target is at least 32 by 32. |
| `KN-016` | Search bar, 3 states | high | 2 | web | KN-005, KN-006, KN-007, KN-008 | Three states match Figma, clearing restores the default state and returns focus to the field, and the input is debounced without dropping the final keystroke. |
| `KN-017` | Filter chip, doubling as the status counter | high | 2 | web | KN-005, KN-006, KN-007 | Four states match Figma, the count updates with the filtered data, selecting and deselecting are both reachable by keyboard, and the selected state is announced rather than only shown. |
| `KN-032` | Tooltip | high | 2 | web | KN-005, KN-006, KN-007 | It matches Figma, appears on hover and on keyboard focus rather than hover alone, and does not trap the pointer. |
| `KN-054` | Turn the verify report into a failure once the debt is gone | high | 2 | agent | KN-001 | validate exits non-zero when any open task has no verify command, the message names them, and the board has none at the moment the change lands so the gate is green immediately rather than blocking every other task. |
| `KN-055` | Record where a task started, so a roast can diff the whole task | high | 2 | agent | KN-001 | Moving a task to in_progress records startHead, npm run roast with no --base diffs from that commit, a task spanning three commits shows all three in the prompt, and a test proves the prompt contains a change from the first of them. |
| `KN-066` | Apply contract exceptions per sentence, not per field | high | 2 | agent | KN-001 | Each of the three card wordings the reviewer supplied is rejected, a card that only records a prohibition is still accepted, the sidebar and fourth-tab decisions have staleness anchors, and a planted violation in one sentence of a multi-sentence field is caught. |
| `KN-067` | Recording an adjudication must not overwrite the last one | high | 2 | agent | KN-001 | Re-recording a round preserves the earlier adjudication as an entry in a history, the card shows the latest while the history remains readable, and a test proves an earlier filed list cannot be erased. |
| `KN-068` | Make verifyGate's revalidator mandatory, and test the real invocation | high | 2 | agent | KN-058 | verifyGate refuses to run without a revalidator, verifyGate with the real revalidator rejects bare node, node --version, a missing target and a symlinked target, and the KN-058 verifier runs to completion in a read-only working tree without writing into the repository. |
| `KN-073` | Confirm the employment type and job level option lists | high | 2 | design | KN-002 | DESIGN.md states the lists as confirmed with the source that confirmed them, section 6 no longer lists them as provisional, and KN-012 and KN-034 use the confirmed values. |
| `KN-074` | The harness stamps a round number that goes stale before it is recorded | high | 2 | agent | KN-001 | Two roast rounds run back to back can both be recorded, in order, with their own verdicts and filed lists, and a manifest that has already been recorded is still refused a second time. |
| `KN-076` | Let a settled open question be recorded as a decision, not only as a task | high | 2 | agent | KN-002 | An open-questions item written as a decision, with no task, passes agent/scripts/verify/KN-002.mjs; the same item with an invented decision whose text does not appear under the heading it claims still fails; a capturePending entry disposed of as a decision is held to the same standard; and closing KN-070 as decided leaves the verifier green. |
| `KN-077` | Settle the two copy strings that frame 505:3 records as not yet applied | high | 2 | design | KN-002 | DESIGN.md states the wording and the screen for both strings, section 6 no longer lists them, and agent/design-manifest.json records them as disposed so the capture-derived pending check stays green. |
| `KN-080` | Bound the fix-in-task carve-out to once per task, and make the board enforce it | high | 2 | agent | KN-001 | A task whose roast rounds record a second fix-in-task is refused by move done with a message naming the first one, agent/RALPH.md states the bound in the same paragraph as the mechanical test, and a planted second carve-out on a scratch task proves the refusal fires. |
| `KN-089` | Make a clean clone able to run the gate without a manual browser download | high | 2 | infra | KN-003 | On a machine with no Playwright browsers, a documented single command brings the gate to green, agent/scripts/verify/KN-003.mjs reports the missing browser by name rather than failing opaquely, and the README says what to run. |
| `KN-094` | The token-name value exemption reaches aria-label and title | high | 2 | web | KN-087 | aria-label="delete/application" and title="delete/application" both fail npm run lint, a committed fixture holds both, the Foundations token story still passes, and agent/scripts/verify/KN-087.mjs requires the fixture by name. |
| `KN-095` | The stories-only title exemption covers every JSX title, not just meta.title | high | 2 | web | KN-087 | A story containing <Box title="Delete this application" /> fails npm run lint while the same file keeps its meta title App/Shell, a committed fixture holds both, and agent/scripts/verify/KN-087.mjs requires it by name. |
| `KN-097` | MDX story files are linted by no lingui block at all | high | 2 | web | KN-087 | An .mdx file under src containing a bare English aria-label fails npm run lint, or the stories glob no longer accepts .mdx and DESIGN.md or AGENTS.md records which was chosen and why; either way a committed fixture proves it. |
| `KN-098` | Prove the STORYBOOK test project reports a failure too | high | 2 | agent | KN-088 | A committed story whose play function asserts something untrue is run by the real storybook project in gate mode and reported as a failure, it does not appear in an ordinary run, and emptying the stories glob makes agent/scripts/verify/KN-003.mjs fail. |
| `KN-099` | Scope the gate run and its passing count to the unit project | high | 2 | agent | KN-088 | The gate run is scoped to the unit project, emptying the unit include makes agent/scripts/verify/KN-003.mjs fail because the run reports no passing unit tests rather than because a source string changed, and the storybook project having any number of passing stories does not affect it. |
| `KN-010` | Status chip, 9 statuses by 2 sizes, display only | high | 3 | web | KN-005, KN-006, KN-007 | Nine statuses at both sizes match their Figma nodes, Size=M is used only where the design uses it, the chip has no tabindex and no click handler and a test asserts that, and the label is rendered from the STATUS RECORD rather than from the lingui catalog, so a status the user has renamed shows its new name. Only the five default names ship as catalog messages, as the seed values for a fresh account. |
| `KN-011` | Input, 6 states | high | 3 | web | KN-005, KN-006, KN-007 | All six states match Figma, the error state shows border/error with text/error helper copy, the helper line reserves its space so the field does not jump when an error appears, and the label is bound to the input for screen readers. |
| `KN-019` | Colour picker for the four custom status slots | high | 3 | web | KN-005, KN-006, KN-007 | The picker offers exactly the four reserved pairs, matches Figma, marks the current selection, is keyboard navigable, and cannot produce a colour outside the reserved set. |
| `KN-021` | Page header | high | 3 | web | KN-005, KN-006, KN-007, KN-009, KN-008 | Both drawn instances match Figma, the optional back and action slots each render and are each omittable, the language switch appears only at the mobile breakpoint, and the title is the page heading in the accessibility tree. |
| `KN-022` | Empty state and loading state | high | 3 | web | KN-005, KN-006, KN-007, KN-009 | Both match Figma, the empty state carries a call to action that starts the add flow, and the loading state stays honest past 15 seconds rather than looking hung, which is the cold start case. |
| `KN-023` | Tabs | high | 3 | web | KN-005, KN-006, KN-007 | Three states match Figma, the tablist follows the roving tabindex pattern with arrow key navigation, the active tab is announced as selected, and panels are associated with their tabs. |
| `KN-024` | Sort control | high | 3 | web | KN-005, KN-006, KN-007, KN-018 | Three states match Figma, the four permitted options are the only ones offered, the current sort is visible on the closed control, the menu is keyboard navigable, and changing sort is announced. |
| `KN-025` | Bulk action bar | high | 3 | web | KN-005, KN-006, KN-007, KN-013, KN-009 | Both types match Figma, the bar appears only when at least one row is selected, it reports the selection count, and it is reachable by keyboard when it appears rather than trapping focus behind the list. |
| `KN-050` | CI: lint, typecheck, test, build, both workspaces | high | 3 | infra | KN-003, KN-033 | The workflow passes on a clean checkout, fails when a deliberately broken test is planted, and installs the Playwright browser before the Storybook project runs. |
| `KN-051` | Deploy the web app to GitHub Pages | high | 3 | deploy | KN-003 | The app loads at its Pages URL, a deep link to a route works on a hard refresh, Storybook is reachable at /storybook/, and the deploy runs from a push to main with no manual step. |
| `KN-062` | Shared story fixtures | high | 3 | web | KN-003, KN-007 | Every component story that needs data uses the shared fixtures, a Docs page rendering many stories at once seeds without error, the fixtures never appear in the production bundle and a test asserts that, and each fixture set has a long value that exercises truncation in both languages. |
| `KN-078` | Check documentation-frame coverage against the capture text, not an author-chosen fact list | high | 3 | agent | KN-002 | Deleting the substance of any one frame transcription from DESIGN.md while leaving its index row and its manifest facts intact makes agent/scripts/verify/KN-002.mjs fail, demonstrated by a planted mutation for at least three different frames. |
| `KN-079` | Capture the documentation canvas as text, not as truncated layer names | high | 3 | design | KN-002 | A committed text capture of canvas 5:8 contains the full body of every documentation frame, no name or text field in it is exactly at the truncation cap, agent/scripts/verify/KN-002.mjs scans that text rather than the metadata names, and planting a pending marker deep inside a long string makes the verifier fail. |
| `KN-085` | Inventory every Figma style and variable at file level, not by sampling use sites | high | 3 | design | KN-004 | A committed file-level inventory of every Figma style and variable, with its digest recorded, and agent/scripts/verify/KN-004.mjs failing when an entry in it is neither in a DESIGN.md table nor on a written exclusion list, proved by planting an entry that is in neither. |
| `KN-090` | Stop AppProviders mutating the lingui singleton during render | high | 3 | web | KN-003 | A story that mounts a Persian and an English AppProviders side by side renders each in its own language and direction, the switch still shows no flash of the previous catalog, and a test covers both. |
| `KN-091` | Move story prose out of the TSX and into story-docs, with the guard test | high | 3 | web | KN-003 | src/shared/story-docs/en and fa exist and carry the prose for every story, no .tsx under src holds a docblock above const meta or a story export, the Docs pages render the markdown in the toolbar language, and a guard test fails when a prop or a story is missing from either language. |
| `KN-096` | A literal type alias carries an unlocalized string past the lingui rule | high | 3 | web | KN-087 | The literal-type-alias form fails npm run lint or fails a dedicated check, a committed fixture holds it, and the check is proved by a planted break. |
| `KN-103` | Coverage from the storybook project is discarded for any file the unit project also touches | high | 3 | agent | KN-003 | A function reached only from a story and living in a file that also has unit tests counts as covered, a per-project coverage report exists, and a planted uncovered branch in such a file fails the run. |
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
| `KN-075` | Decide which fields the Review step of the add flow shows | medium | 1 | design | KN-002 | DESIGN.md names the Review field list with the reason for it, section 6 no longer lists the Review step as open, and agent/design-manifest.json records the disposition instead of the open item. |
| `KN-081` | Replace the truncation-cap frequency guess with a stated cap | medium | 1 | agent | KN-002 | The truncation figure in DESIGN.md is derived from a cap the manifest records with its provenance, or from per-name evidence of cutting, and a fixture capture with eleven repeated 36-character labels and no truncation does not report any name as truncated. |
| `KN-069` | Narrow the KARNAMA_BOARD fence to a verifier-owned scratch directory | medium | 2 | agent | KN-065 | A KARNAMA_BOARD path in the temp tree but outside a karnama-prefixed scratch directory is refused, a path that is a hard link to a file outside the allowed roots is refused, the verifiers that use the override still work unchanged, and a test covers all three. |
| `KN-082` | Parse the capture as a tree, not with line patterns | medium | 2 | agent | KN-002 | The capture is parsed into a node tree, a nested ordinal-prefixed text node inside frame 505:3 does not change the copy-change count, an unclosed frame tag fails with a parse error rather than slicing to end of file, and both mutations are planted to prove it. |
| `KN-086` | Make the elevation checks order-aware and the regression exemption scoped | medium | 2 | agent | KN-004 | Swapping the two shadow columns of either elevation row fails the verifier, the sentence "Elevation/Card is the only elevation in the Figma file, as it used to be the only elevation documented" fails it, the paragraph that legitimately records the correction still passes, and the success line names elevation. |
| `KN-093` | Stop a later scoped ESLint block silently re-exempting a lingui hole | medium | 2 | agent | KN-087 | A config block scoped to src/shared/** that exempts aria-label makes agent/scripts/verify/KN-087.mjs fail, the check reads the resolved config for at least one path per top-level source folder, and the block being present is what the failure names. |
| `KN-053` | README in both languages, tech debt and phase-next records | medium | 3 | docs | KN-051, KN-052 | Both readmes describe the product and the cuts and are accurate against the deployed app, TECH-DEBT.md has an entry per suppression with the check that retires it, and PHASE-NEXT.md records every deliberate cut. |
| `KN-059` | Decompose the board tool after ten rounds of patching | medium | 3 | agent | KN-001 | move() reads as a sequence of named guards none of which exceeds about fifteen lines, the argument parser exists once and both scripts import it, and every existing gate test still passes unchanged. |
| `KN-092` | Enforce the import conventions with a lint rule, and fix what already breaks them | medium | 3 | web | KN-003 | A file importing @mui/material/Button fails npm run lint, a file importing ../something fails it, no file under apps/web/src does either, and every folder with more than one file has an index.ts. |
| `KN-101` | Run destructive mutation verifiers in an isolated worktree | medium | 3 | agent | KN-088 | agent/scripts/verify/KN-088.mjs performs its mutation in a temporary git worktree, killing it mid-run leaves apps/web/vitest.config.ts byte-identical, and two concurrent runs both pass and leave the file byte-identical. |
| `KN-040` | Third-party feedback, stored for later evaluation | medium | 5 | api | KN-034 | A submission is stored with its target and a pending state, it never mutates the target, a submission whose target was deleted between submit and review is handled rather than orphaned, and rate limiting stops a flood from one source. |
| `KN-041` | Admin API: the moderation queue | medium | 5 | api | KN-040, KN-036 | A non-admin is refused every operation at the resolver, approving and rejecting both record who did it and when, and the queue paginates rather than loading everything. |
| `KN-064` | Third-party feedback submission surface | medium | 5 | web | KN-042, KN-040 | An anonymous visitor can submit a comment and a suggested change against a record, both arrive in the moderation queue in a pending state, the target record is not altered, the submitter is told it is pending review, and a flood from one source is rate limited. |
| `KN-047` | Admin panel screen | medium | 8 | web | KN-042, KN-041 | An e2e test signs in as an admin, approves one submission and rejects another, and sees both leave the pending queue, and a non-admin reaching the route is refused rather than shown an empty panel. |
| `KN-083` | Remove the em dashes the last DESIGN.md edits introduced | low | 1 | docs | KN-002 | No em dash appears in DESIGN.md, AGENTS.md, RALPH.md or STATE.md, and a check in the contract verifier fails when one is reintroduced. |
| `KN-102` | The gate-fixtures README describes a file and a mechanism that no longer exist | low | 1 | docs | KN-088 | Every file and mechanism the README names exists, no file in the directory is unmentioned, and a check in agent/scripts/verify/KN-003.mjs fails when a fixture is added or renamed without the README following. |

## Done (8)

| id | title | sev | pt | area | blocked by | exit condition |
| -- | ----- | --- | -- | ---- | ---------- | -------------- |
| `KN-087` | Stop the lingui rule exempting aria-label and title | critical | 1 | web | KN-003 | A component with aria-label="Delete this application" and one with title="Delete this application" both fail npm run lint, both are committed under src/gate-fixtures, and agent/scripts/verify/KN-003.mjs requires each to fail on the lingui rule by name. |
| `KN-058` | Run verify commands without a shell | critical | 2 | agent | KN-001 | A verify command containing a shell operator is refused when set, an existing one is refused at close, the two current verifiers still run, and a deliberately failing verifier still blocks move done. |
| `KN-065` | move done must require a verify command | critical | 2 | agent | KN-001 | move done refuses a task with no verify command, the message names KN-054 as where the backfill happens, a task with a deliberately failing verify still cannot close, and validate reports the count of tasks lacking one. |
| `KN-088` | Prove the REAL test project reports a failure, not a separate config | critical | 2 | agent | KN-003 | The planted broken test is detected through the configuration npm test uses, and a mutation that empties the real unit project include makes agent/scripts/verify/KN-003.mjs fail rather than pass. |
| `KN-001` | The loop, the board, and the tooling that runs them | critical | 3 | agent | none | "npm run todo -- validate" exits 0, "npm run todo -- next" names a task, agent/TODO_BOARD.md renders, "npm run roast" reaches Codex and archives a reply, and AGENTS.md plus DESIGN.md both exist with the Figma tokens transcribed. |
| `KN-002` | Read the Figma Documentations canvas and fold it into the contract | critical | 3 | design | KN-001 | DESIGN.md has a section per documentation frame, every open item in the file is either reflected in the board as a task or recorded as a decision, and the Job Record field list is written down. |
| `KN-004` | Read the remaining type scale and any missing tokens from Figma | critical | 3 | design | KN-001 | A named sweep of the Foundations canvas finds no token absent from DESIGN.md, every value in the DESIGN.md tables is traceable to a Figma node id, and the KN-001 verify script's type-scale check still passes. |
| `KN-003` | Web app scaffold with the full quality gate | critical | 8 | web | KN-001 | On a clean checkout, lint, lint:tsc, test, build and build-storybook all pass in apps/web, and both a deliberately broken test and a deliberately unlocalized string fail the run when planted by hand. |

## Dropped (1)

| id | title | sev | pt | area | blocked by | exit condition |
| -- | ----- | --- | -- | ---- | ---------- | -------------- |
| `KN-084` | Make the AGENTS.md section 5 gate runnable before any workspace exists | low | 1 | infra | KN-001 | npm run lint, npm run lint:tsc, npm test and npm run build each exit zero and say what they did on a clean checkout with no workspace directories, and each still fails honestly once apps/web exists and contains a failing check. |

## Cards

### `KN-001` The loop, the board, and the tooling that runs them

- **status** done · **severity** critical · **points** 3 · **area** agent
- **blocked by** none

agent/RALPH.md (the iteration rules), agent/scripts/todo.mjs (the board tool, zero dependencies), agent/scripts/roast.mjs (the Codex harness on gpt-5.6-terra), agent/board.json seeded with the plan, plus AGENTS.md, DESIGN.md, CLAUDE.md and the root workspace config.

**Why.** Nothing can be picked, tracked, reviewed or resumed until the board and the loop exist. The loop has no memory except these files, so they have to be real before any code is written, and a context reset before they exist loses everything.

**Exit condition.** "npm run todo -- validate" exits 0, "npm run todo -- next" names a task, agent/TODO_BOARD.md renders, "npm run roast" reaches Codex and archives a reply, and AGENTS.md plus DESIGN.md both exist with the Figma tokens transcribed.

**Roasts.** round 1 scored 3.5 with 2 critical(s); round 2 scored 5 with 2 critical(s); round 3 scored 5.5 with 1 critical(s); round 4 scored 2.5 with 3 critical(s); round 5 scored 4.5 with 2 critical(s); round 6 scored 8 with 1 critical(s); round 7 scored 4.5 with 2 critical(s)

### `KN-002` Read the Figma Documentations canvas and fold it into the contract

- **status** done · **severity** critical · **points** 3 · **area** design
- **blocked by** KN-001

Read canvas 5:8 "Documentations" in full, and canvas 5:7 "Screens", and write what they say into DESIGN.md: the flows, the open items, the field list of a Job Record, the rules the annotations state, and anything that contradicts what is already written.

**Why.** The owner asked for this explicitly, right after the loop and the board. The design file carries decisions that are nowhere else, and building from the component canvas alone means rediscovering them as bugs. A contradiction found now is a paragraph; found in a screen it is a rewrite.

**Exit condition.** DESIGN.md has a section per documentation frame, every open item in the file is either reflected in the board as a task or recorded as a decision, and the Job Record field list is written down.

**Roasts.** round 1 scored 4 with 2 critical(s); round 2 scored 2.5 with 2 critical(s); round 3 scored 2 with 2 critical(s); round 4 scored 2.5 with 1 critical(s)

### `KN-003` Web app scaffold with the full quality gate

- **status** done · **severity** critical · **points** 8 · **area** web
- **blocked by** KN-001

apps/web on Vite, React 19, TypeScript, MUI, ESLint flat config with zero warnings and the lingui rule, Prettier, Vitest with a unit project and a Storybook project in headless Chromium, Storybook 10, Playwright for e2e, and coverage reporting.

**Why.** Every component task depends on the gate being real. A gate added after the components exist gets weakened to fit them, which is how a 100 percent coverage target quietly becomes 60. Building it first makes the standard non-negotiable rather than aspirational.

**Exit condition.** On a clean checkout, lint, lint:tsc, test, build and build-storybook all pass in apps/web, and both a deliberately broken test and a deliberately unlocalized string fail the run when planted by hand.

**Roasts.** round 1 scored 3 with 3 critical(s)

### `KN-004` Read the remaining type scale and any missing tokens from Figma

- **status** done · **severity** critical · **points** 3 · **area** design
- **blocked by** KN-001

Sweep the Foundations canvas for any token DESIGN.md is still missing, and correct anything that disagrees. The type scale itself is already transcribed: KN-001's exit condition demanded it, so all five roles were read from documentation frame 416:21 during that task, and Body/Small was found to have been deleted from the design entirely.

**Why.** The theme is generated from the token table, so a font size that was guessed rather than read propagates into every component and is invisible until someone compares against Figma by eye. Only Body and Label are currently verified.

**Exit condition.** A named sweep of the Foundations canvas finds no token absent from DESIGN.md, every value in the DESIGN.md tables is traceable to a Figma node id, and the KN-001 verify script's type-scale check still passes.

**Roasts.** round 1 scored 4 with 1 critical(s)

### `KN-005` Theme: tokens, MUI theme, direction and colour scheme provider

- **status** review · **severity** critical · **points** 3 · **area** web
- **blocked by** KN-003, KN-004

tokens.ts holding the Figma token set as typed constants, theme.ts mapping them onto MUI, and AppThemeProvider owning both colour scheme (light, dark, system) and direction, swapping the Emotion cache for RTL and setting dir and lang on the document.

**Why.** Every component reads colour, spacing and radius from here, so it has to exist before the first one. It also has to own direction, because a component that gets direction from somewhere else will be laid out backwards in exactly one of the two languages.

**Exit condition.** A Tokens story renders every colour, spacing and radius token with its name and value, the theme switches light and dark and RTL and LTR from the Storybook toolbars, and a test asserts no component file contains a raw hex colour.

### `KN-006` lingui: English source catalog, Persian translation, runtime switch

- **status** backlog · **severity** critical · **points** 3 · **area** web
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
- **blocked by** KN-003

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

### `KN-054` Turn the verify report into a failure once the debt is gone

- **status** backlog · **severity** high · **points** 2 · **area** agent
- **blocked by** KN-001

KN-065 made a verify command mandatory to close and made validate REPORT how many open tasks lack one. This is the other half: once that count reaches zero, make validate FAIL on a task with no verify command rather than reporting, so the rule holds for cards filed in future rather than only for cards being closed.

**Why.** The original framing of this task, backfill a verifier onto every card, is superseded and would have been the wrong work: each task now writes its own verifier as part of being closed, because the close gate refuses without one. Writing sixty verifiers up front would mean writing each check before its work exists, and a check written that early describes what is easy to assert rather than what the task must prove. What is genuinely left is flipping the report to a failure, which can only happen once the count is zero, so this task waits for the board rather than driving it.

**Exit condition.** validate exits non-zero when any open task has no verify command, the message names them, and the board has none at the moment the change lands so the gate is green immediately rather than blocking every other task.

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

- **status** done · **severity** critical · **points** 2 · **area** agent
- **blocked by** KN-001

move done executes a task's verify command with shell true, so anything after the accepted script prefix is interpreted by the shell. node agent/scripts/verify/KN-001.mjs || exit 0 passes validation and then masks a failing verifier. Parse the command into an executable and its arguments and spawn it directly, with no shell.

**Why.** The verify command is the one mechanical check that a task's exit condition holds, and a shell operator turns it into a check that always passes. It is not a forgery concern, it is the ordinary case of someone appending something to a command line and quietly disabling the gate.

**Exit condition.** A verify command containing a shell operator is refused when set, an existing one is refused at close, the two current verifiers still run, and a deliberately failing verifier still blocks move done.

**Roasts.** round 1 scored 7 with 0 critical(s); round 2 scored 8 with 0 critical(s); round 3 scored 8 with 0 critical(s)

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

- **status** done · **severity** critical · **points** 2 · **area** agent
- **blocked by** KN-001

Make verify mandatory rather than optional at close. Today a task with no verify closes on a manifest-bound round, a filed list and any non-empty prose evidence, so its exit condition is never mechanically checked. Require a verify command on any task reaching done, and make validate report how many tasks still lack one.

**Why.** The done gate currently proves that a review happened and that its findings were filed. It does not prove the work works. Most of the board has no verify command, so as it stands almost every task can close while its test, its deployment or its visual check is plainly false, which is precisely the failure the gate exists to prevent.

**Exit condition.** move done refuses a task with no verify command, the message names KN-054 as where the backfill happens, a task with a deliberately failing verify still cannot close, and validate reports the count of tasks lacking one.

**Roasts.** round 1 scored 3.5 with 1 critical(s); round 2 scored 4 with 1 critical(s); round 3 scored 3 with 1 critical(s); round 4 scored 7.5 with 0 critical(s)

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

### `KN-068` Make verifyGate's revalidator mandatory, and test the real invocation

- **status** backlog · **severity** high · **points** 2 · **area** agent
- **blocked by** KN-058

verifyGate takes revalidate as an optional argument. move done passes verifyCommand; KN-058's verifier passes nothing, so it exercises a weaker mode than the close does and would stay green if close-time revalidation broke. Without the callback verifyGate accepts bare node and node --version, neither of which runs a verifier, so its documented string-or-null contract is false: null can mean node exited zero rather than an approved verifier ran. Make revalidate required, add cases for a missing target and for the symlink and real-path checks, and make the verifier runnable in a read-only sandbox, which it currently is not because it writes scratch files.

**Why.** A test that calls a function differently from the way production calls it proves the wrong thing, and this one has now been flagged three rounds running in three different forms. The optional argument is the root cause rather than the test: an interface whose contract only holds when an optional argument is supplied will eventually be called without it. It also cannot run in the read-only sandbox a reviewer uses, so the one place an outsider could check it is the one place it does not work.

**Exit condition.** verifyGate refuses to run without a revalidator, verifyGate with the real revalidator rejects bare node, node --version, a missing target and a symlinked target, and the KN-058 verifier runs to completion in a read-only working tree without writing into the repository.

### `KN-069` Narrow the KARNAMA_BOARD fence to a verifier-owned scratch directory

- **status** backlog · **severity** medium · **points** 2 · **area** agent
- **blocked by** KN-065

The override currently accepts any path under the repository or anywhere under the system temp tree. That is much wider than the stated need, which is a scratch board a verifier just created. Narrow it: accept only a path inside a directory the running process made, or match the karnama- prefix the verifiers use, so a leaked value cannot make render overwrite a TODO_BOARD.md beside an unrelated permitted file.

**Why.** The fence exists to stop an environment variable redirecting writes, and a fence with a hole the size of the whole temp tree only stops the careless case. Rendering writes a sibling file next to whatever board it is given, so the blast radius is larger than the board itself: any directory with a board.json in it also gets its TODO_BOARD.md overwritten.

**Exit condition.** A KARNAMA_BOARD path in the temp tree but outside a karnama-prefixed scratch directory is refused, a path that is a hard link to a file outside the allowed roots is refused, the verifiers that use the override still work unchanged, and a test covers all three.

### `KN-070` Decide where رد شده belongs on the board

- **status** backlog · **severity** high · **points** 1 · **area** design
- **blocked by** KN-002

Frame 434:16 flags this with a warning and leaves it open: should the rejected status stay as the last column of the pipeline, or move off the board entirely? Get the decision from the designer or the owner, record it in DESIGN.md as a decision rather than a question, and update the column order and any card that assumes the current answer.

**Why.** It changes the board's column set, which is the main screen, so building the board while this is open means building something that may need re-ordering and re-testing. It is also cheap to settle now and expensive to settle after the drag-and-drop and column tasks are done.

**Exit condition.** DESIGN.md records the answer as a decision with who made it, section 6 no longer lists it as open, and the column order in section 3 matches.

### `KN-071` Decide whether a contact needs an email or a phone

- **status** backlog · **severity** high · **points** 1 · **area** design
- **blocked by** KN-002

Frame 434:2 says only a full name is required, and notes in the same breath that a contact with neither an email nor a phone has no contact route and is practically useless, leaving it for QA to decide whether one of the two becomes required. Get the decision, record it, and set the validation accordingly.

**Why.** It is a validation rule on a form that is already scheduled, so leaving it open means either building the permissive version and changing it later, or quietly choosing the strict one and calling it the design. The file explicitly asks for a decision rather than an assumption.

**Exit condition.** DESIGN.md records the answer as a decision, section 6 no longer lists it as open, and KN-031 and KN-039 state the resulting rule.

### `KN-072` Decide where status history belongs

- **status** backlog · **severity** high · **points** 1 · **area** design
- **blocked by** KN-002

The Components canvas flags this as its open item 18: status history currently sits at the bottom of the Info tab of the job modal, and the file says that is provisional. Get the decision on whether it stays there, becomes its own tab, or moves elsewhere, and record it.

**Why.** It is the payoff of the whole data model, since the trail is what the product is for, and it is currently placed by default rather than by choice. Building the modal around a provisional placement and moving it later means rebuilding a tab.

**Exit condition.** DESIGN.md records the answer as a decision, section 6 no longer lists it as open, and KN-030 states where history renders.

### `KN-073` Confirm the employment type and job level option lists

- **status** backlog · **severity** high · **points** 2 · **area** design
- **blocked by** KN-002

Frame 434:33 carries a red warning: the two enumerations came from the product owner and were never matched against jobinja.ir or jobvision.ir, because that environment's network blocked both. Check them against the real sources, or get the owner to confirm them as final, then remove the provisional marking.

**Why.** They are enum values that reach the database, the GraphQL schema and the Select components, so changing them after the schema exists is a migration rather than an edit. The design file marks them unconfirmed precisely so nobody treats them as settled.

**Exit condition.** DESIGN.md states the lists as confirmed with the source that confirmed them, section 6 no longer lists them as provisional, and KN-012 and KN-034 use the confirmed values.

### `KN-074` The harness stamps a round number that goes stale before it is recorded

- **status** backlog · **severity** high · **points** 2 · **area** agent
- **blocked by** KN-001

roast.mjs computes the round number from the board at RUN time, as roasts.length + 1, and readArchive later requires meta.round to equal roasts.length + 1 at RECORD time. Running two roasts before recording either makes the first unrecordable, because both manifests claim the same round and only one can be next. Either stamp something order-independent, such as the reviewed commit plus a sequence within it, or let the record command accept any manifest for this task whose round has not already been recorded.

**Why.** It bit on KN-002: two rounds ran before either was recorded, so the first round's verdict cannot be entered on the board at all and survives only as a file on disk. The board is meant to be the audit trail of what was reviewed, and a round it structurally cannot accept is a hole in that trail. It also pushes toward recording immediately, which is the opposite of the adjudicate-then-record flow the loop asks for.

**Exit condition.** Two roast rounds run back to back can both be recorded, in order, with their own verdicts and filed lists, and a manifest that has already been recorded is still refused a second time.

### `KN-075` Decide which fields the Review step of the add flow shows

- **status** backlog · **severity** medium · **points** 1 · **area** design
- **blocked by** KN-002

Frame 376:31 draws the add flow as one modal with Paste, Loading and Review, and 434:2 fixes what a job record requires, but neither says which fields the Review step puts in front of the user before they save. Decide the field list, write it into DESIGN.md, and move the item out of the open-questions section.

**Why.** DESIGN.md carried "The Review fields are provisional until the Job Record shape is finalised" as bare prose in section 3, with no task and no cross-reference. A roast found it. Showing every field and showing only the three required ones are both defensible, so whoever builds the Review screen would silently pick one and it would ship as a decision nobody made.

**Exit condition.** DESIGN.md names the Review field list with the reason for it, section 6 no longer lists the Review step as open, and agent/design-manifest.json records the disposition instead of the open item.

### `KN-076` Let a settled open question be recorded as a decision, not only as a task

- **status** backlog · **severity** high · **points** 2 · **area** agent
- **blocked by** KN-002

agent/scripts/verify/KN-002.mjs recognises a "**Decided ...**" disposition when it parses an open-questions item, then discards that path: it requires a named board task, and requires the manifest to say that task owns the item, so an item settled with a written decision and no task is rejected. Citing the task that made the decision does not help either, because a closed task trips the "tracked by a closed task while still open" branch. Give a decision its own shape in the manifest and let the verifier accept it.

**Why.** The exit condition of KN-002 says every open item is "either reflected in the board as a task or recorded as a decision". Only the first can pass today, so KN-070 through KN-073 and KN-075 cannot be closed the way the contract says they may be: the moment one of them is decided and marked done, this verifier starts failing. Found by a roast as a major.

**Exit condition.** An open-questions item written as a decision, with no task, passes agent/scripts/verify/KN-002.mjs; the same item with an invented decision whose text does not appear under the heading it claims still fails; a capturePending entry disposed of as a decision is held to the same standard; and closing KN-070 as decided leaves the verifier green.

### `KN-077` Settle the two copy strings that frame 505:3 records as not yet applied

- **status** backlog · **severity** high · **points** 2 · **area** design
- **blocked by** KN-002

Of the sixteen copy changes enumerated in documentation frame 505:3, two are marked in the frame itself as NOT applied. Item 10, the Review-step helper copy, says the node does not exist in the file after searching all five Add/Edit states on both breakpoints, so its placement needs confirming or the string needs adding. Item 15, the new-status helper copy, says the text was not found and needs manual review. Decide the wording and where each string lives, write both into DESIGN.md, and remove them from the open list.

**Why.** DESIGN.md claimed all sixteen changes "were applied" and that nothing is left in the Figma file alone. Both statements were false, and a roast caught it by reading the committed capture rather than the document. Two user-facing strings with no agreed wording and no agreed home will otherwise be invented by whoever builds the Add flow and the status picker, which is the same silent decision the open-questions section exists to prevent.

**Exit condition.** DESIGN.md states the wording and the screen for both strings, section 6 no longer lists them, and agent/design-manifest.json records them as disposed so the capture-derived pending check stays green.

### `KN-078` Check documentation-frame coverage against the capture text, not an author-chosen fact list

- **status** backlog · **severity** high · **points** 3 · **area** agent
- **blocked by** KN-002

agent/scripts/verify/KN-002.mjs proves each of the 14 frame ids appears somewhere in DESIGN.md, which the frame-index table alone satisfies, and then checks three or four author-chosen facts as substrings under the claimed heading. The facts are picked by the same person who wrote the section, so a frame can be substantially untranscribed while every check passes. Derive what must be covered from the committed capture instead: the frame title and its section headings are in the capture, so require each captured section heading of a frame to be answered somewhere in the claimed DESIGN.md section, and report coverage rather than a boolean.

**Why.** A roast rated this major and it is the honest limit of the current verifier: the capture upgraded the ID inventory from a claim to evidence, but the CONTENT check is still self-attestation. That gap is what let frame 505:3 be summarised as sixteen applied changes when two of them were explicitly pending in the frame text.

**Exit condition.** Deleting the substance of any one frame transcription from DESIGN.md while leaving its index row and its manifest facts intact makes agent/scripts/verify/KN-002.mjs fail, demonstrated by a planted mutation for at least three different frames.

### `KN-079` Capture the documentation canvas as text, not as truncated layer names

- **status** backlog · **severity** high · **points** 3 · **area** design
- **blocked by** KN-002

agent/figma-capture/documentation-5-8.xml is a get_metadata dump, and get_metadata returns layer NAMES. Figma caps auto-generated text layer names, so 63 of the 148 names in the capture are exactly 26 or 28 characters and visibly cut mid-phrase; only frame 505:3, whose layers were named deliberately, carries full text. Everything derived from the capture therefore sees a prefix. Re-capture the 14 frames with get_design_context or an equivalent that returns the text content, commit that alongside the metadata, and point the capture-pending scan and the coverage check at the text.

**Why.** Two roasts in a row rated this critical and both were right. The pending-item inventory in agent/design-manifest.json is presented as derived from source, which is only true for the part of each string that survived truncation: a pending marker at character 60 of a truncated node is absent from the artefact and undetectable. The inventory is a floor, not a ceiling, and until this is done DESIGN.md cannot honestly claim the canvas is fully absorbed. It is also the precondition for KN-078, which cannot check coverage against content that is not in the repository.

**Exit condition.** A committed text capture of canvas 5:8 contains the full body of every documentation frame, no name or text field in it is exactly at the truncation cap, agent/scripts/verify/KN-002.mjs scans that text rather than the metadata names, and planting a pending marker deep inside a long string makes the verifier fail.

### `KN-080` Bound the fix-in-task carve-out to once per task, and make the board enforce it

- **status** backlog · **severity** high · **points** 2 · **area** agent
- **blocked by** KN-001

agent/RALPH.md step 5 allows fixing in-task when the verify script fails OR when the verifier passes dishonestly. The second clause has no bound, so it can be invoked every round: KN-002 used it three rounds running, because every roast of a verifier can be phrased as "it passes without establishing the exit condition". Bound it: the carve-out may be used at most once per task, after which every finding is a card. Record fixed-in-task on the roast round so the board can count it, and have move done refuse a close where the carve-out was used more than once without an explicit owner override.

**Why.** The owner corrected this loop once already, for exactly this failure: roast, fix, re-roast, over and over, while the rest of the board waited. The mechanical test was meant to end the argument, and the second clause quietly reopened it. Three rounds on a three point task is the same mistake in a smaller size, and the loop file currently licenses it.

**Exit condition.** A task whose roast rounds record a second fix-in-task is refused by move done with a message naming the first one, agent/RALPH.md states the bound in the same paragraph as the mechanical test, and a planted second carve-out on a scratch task proves the refusal fires.

### `KN-081` Replace the truncation-cap frequency guess with a stated cap

- **status** backlog · **severity** medium · **points** 1 · **area** agent
- **blocked by** KN-002

agent/scripts/verify/KN-002.mjs infers the layer-name truncation cap as the largest name length that occurs more than ten times, then counts names within two of it as truncated. On the current capture that gives 28 and 64 of 148, which is right, but the inference is unsound: a capture with eleven ordinary repeated labels of length 36 and eight names actually cut at a higher cap would pick 36 and require DESIGN.md to state a number that means nothing. Record the cap in the manifest with how it was established, or detect truncation per name rather than by frequency.

**Why.** The check exists so DESIGN.md cannot overclaim what the capture supports, and a check that can report a normal label set as truncated undermines exactly the number it is protecting. A roast rated it major and the reasoning is correct. It becomes moot if KN-079 lands a text capture first, in which case close this by deleting the check rather than by fixing it.

**Exit condition.** The truncation figure in DESIGN.md is derived from a cap the manifest records with its provenance, or from per-name evidence of cutting, and a fixture capture with eleven repeated 36-character labels and no truncation does not report any name as truncated.

### `KN-082` Parse the capture as a tree, not with line patterns

- **status** backlog · **severity** medium · **points** 2 · **area** agent
- **blocked by** KN-002

The copy-change count in agent/scripts/verify/KN-002.mjs slices the capture between the line matching frame 505:3 and the next line matching a closing frame tag, then counts text nodes whose name starts with a Persian ordinal. That bounds the current frame only because the frame happens to be flat: an ordinal-prefixed text inside a nested group would be counted, and a missing matching close makes the slice run to end of file with no error. The frame-derivation check has the same shape, matching frames by two-space indentation. Parse the XML into a tree and address nodes by structure.

**Why.** Two checks that present themselves as source-derived are actually format-dependent, so they pass by accident of the current dump rather than by verified structure. A roast rated it major. The failure mode is silent: the count changes and nothing reports it, which is the same class of defect the derived counts were introduced to remove.

**Exit condition.** The capture is parsed into a node tree, a nested ordinal-prefixed text node inside frame 505:3 does not change the copy-change count, an unclosed frame tag fails with a parse error rather than slicing to end of file, and both mutations are planted to prove it.

### `KN-083` Remove the em dashes the last DESIGN.md edits introduced

- **status** backlog · **severity** low · **points** 1 · **area** docs
- **blocked by** KN-002

AGENTS.md section on writing forbids em dashes in documentation and asks for commas. The paragraphs added to DESIGN.md while closing KN-002, the capture-limitation note in the documentation-canvas section and the open-questions bullets, use them. Sweep DESIGN.md and the other markdown for em dashes and rewrite those sentences with commas.

**Why.** The convention exists so the prose reads in one voice, and a violation left in the contract file is the one the next writer copies. It is filed rather than fixed because fixing it would change the work after the round that reviewed it and force another review round on a task that is otherwise finished, which is precisely the loop the owner corrected.

**Exit condition.** No em dash appears in DESIGN.md, AGENTS.md, RALPH.md or STATE.md, and a check in the contract verifier fails when one is reintroduced.

### `KN-084` Make the AGENTS.md section 5 gate runnable before any workspace exists

- **status** dropped · **severity** low · **points** 1 · **area** infra
- **blocked by** KN-001

package.json declares workspaces apps/web, apps/api and packages/graphql, none of which exist yet, so npm run lint, lint:tsc, test and build all exit non-zero with "No workspaces found!". AGENTS.md section 5 tells every agent to run those four commands and read the output. Today they produce four errors and no information, which trains the reader to ignore them. Make each script succeed with an honest "nothing to check yet" when no workspace is present, or gate them on the directories existing.

**Why.** The first four steps of the done gate are the ones every task runs, and a gate that always errors is a gate nobody can distinguish from a real failure. It was found by actually running the gate on a docs task rather than assuming it was inert, which is the check AGENTS.md itself asks for.

**Exit condition.** npm run lint, npm run lint:tsc, npm test and npm run build each exit zero and say what they did on a clean checkout with no workspace directories, and each still fails honestly once apps/web exists and contains a failing check.

### `KN-085` Inventory every Figma style and variable at file level, not by sampling use sites

- **status** backlog · **severity** high · **points** 3 · **area** design
- **blocked by** KN-004

The token sweep samples thirteen component frames and diffs each against DESIGN.md. The component inventory lists about thirty five families, so Icon Button 460:672, Checkbox 204:11, Menu Item 181:22, Select 183:26, Confirm Modal 150:92, Add-Edit Modal 166:82 and Mobile Card 491:751 are among those never sampled. More fundamentally, sampling use sites cannot find a style or variable nothing uses, so no amount of extra sampling closes it. Pull a file-level inventory instead, through the Figma MCP search or library tools, commit it under agent/figma-capture the way the canvas captures are committed, and have the verifier require every entry to be either present in DESIGN.md or listed as deliberately excluded with a reason.

**Why.** A roast rated this critical and the reasoning holds: a third effect style used only by the Icon Button, or a variable nothing references yet, would be absent from DESIGN.md while every check stayed green. The theme is generated from that table, so a missing token becomes a literal in a component, which is the exact defect the no-literal rule exists to prevent. This is also the honest general form of the sweep: the current one can only ever say "nothing new in the frames I looked at".

**Exit condition.** A committed file-level inventory of every Figma style and variable, with its digest recorded, and agent/scripts/verify/KN-004.mjs failing when an entry in it is neither in a DESIGN.md table nor on a written exclusion list, proved by planting an entry that is in neither.

### `KN-086` Make the elevation checks order-aware and the regression exemption scoped

- **status** backlog · **severity** medium · **points** 2 · **area** agent
- **blocked by** KN-004

Three defects in agent/scripts/verify/KN-004.mjs, all in the elevation work. First, the row check tests only that each fragment occurs somewhere in the row, so swapping shadow 1 and shadow 2 leaves it green even though stack order changes rendering: check each column separately. Second, the guard against the old "only elevation" claim exempts a whole sentence containing "was false", "earlier version", "no longer" or "used to", so "Elevation/Card is the only elevation in the Figma file, as it used to be the only elevation documented" passes: scope the exemption to the clause carrying the claim, or match the corrective phrasing exactly rather than anywhere in the sentence. Third, the success line lists colours, spacing, radius and type but not elevation, so a green run does not mention the thing under review.

**Why.** A roast rated the first two major and the third minor, and all three are real. The order blindness matters because the elevation table is the artefact the theme is generated from, and two shadows in the wrong order is a visible difference that the check was written specifically to catch. The exemption bypass matters because the guard exists to stop a false statement returning, and it currently accepts one with a historical clause bolted on.

**Exit condition.** Swapping the two shadow columns of either elevation row fails the verifier, the sentence "Elevation/Card is the only elevation in the Figma file, as it used to be the only elevation documented" fails it, the paragraph that legitimately records the correction still passes, and the success line names elevation.

### `KN-087` Stop the lingui rule exempting aria-label and title

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** KN-003

eslint.config.js ignores prop names matching aria-[a-z]+ and title, so a bare English string in either passes the lint. Both are user-facing: aria-label IS the accessible name a screen reader speaks, and title is the tooltip a sighted user hovers. Remove them from ignoreNames, wrap the strings the codebase already has, and add a case to src/gate-fixtures that proves an unlocalized aria-label fails.

**Why.** A roast rated this critical and it is the hole in exactly the place the gate exists to cover: the rule is meant to make "every user-facing string goes through lingui" mechanical, and the current config lets the copy a blind user hears go untranslated while reporting green. The exemption was added to stop the rule firing on structural props like role and dir and swept these two up with them.

**Exit condition.** A component with aria-label="Delete this application" and one with title="Delete this application" both fail npm run lint, both are committed under src/gate-fixtures, and agent/scripts/verify/KN-003.mjs requires each to fail on the lingui rule by name.

**Roasts.** round 1 scored 1.5 with 4 critical(s); round 2 scored 2 with 4 critical(s)

### `KN-088` Prove the REAL test project reports a failure, not a separate config

- **status** done · **severity** critical · **points** 2 · **area** agent
- **blocked by** KN-003

agent/scripts/verify/KN-003.mjs proves a broken test fails by running vitest against src/gate-fixtures/vitest.gate.config.ts, which is an independent configuration. The real unit and storybook projects could be excluded, skipped or misconfigured and that check would still report 1 failed. Drive the proof through the real vitest.config.ts instead: temporarily include the fixture, or add a mode the project honours, so what is proved is that npm test would have caught it.

**Why.** A roast rated this critical and the logic is right: the check answers "can vitest fail" when the question is "would the gate this repository actually runs have failed". The same shape of mistake, proving a thing like the thing, is what AGENTS.md warns about under do not verify by inference.

**Exit condition.** The planted broken test is detected through the configuration npm test uses, and a mutation that empties the real unit project include makes agent/scripts/verify/KN-003.mjs fail rather than pass.

**Roasts.** round 1 scored 4 with 1 critical(s)

### `KN-089` Make a clean clone able to run the gate without a manual browser download

- **status** backlog · **severity** high · **points** 2 · **area** infra
- **blocked by** KN-003

The exit condition of KN-003 says the gate passes on a clean checkout. It does not: the Storybook test project runs in real Chromium and Playwright downloads browsers in a postinstall that the owner allow-scripts policy blocks, so npm test on a fresh clone fails until someone runs npx playwright install chromium. Add an explicit, documented step that the gate itself runs or checks for, so the failure names the missing browser instead of looking like a broken suite.

**Why.** A roast rated this critical and it is a literal failure of the stated exit condition rather than a nitpick. It is also the first thing a new contributor or a CI job hits, and the error a missing browser produces does not say install a browser.

**Exit condition.** On a machine with no Playwright browsers, a documented single command brings the gate to green, agent/scripts/verify/KN-003.mjs reports the missing browser by name rather than failing opaquely, and the README says what to run.

### `KN-090` Stop AppProviders mutating the lingui singleton during render

- **status** backlog · **severity** high · **points** 3 · **area** web
- **blocked by** KN-003

AppProviders calls i18n.activate(locale) in the render body, guarded by a locale comparison. Under concurrent rendering React can render a subtree, mutate the singleton, then abandon that render, leaving a committed tree reading the wrong catalog. Two providers mounted at once, which a Storybook Docs page does, share the same singleton and whichever renders last wins for both. The dir and lang effect on document.documentElement has the same last-writer-wins problem and no cleanup. Give each provider its own I18n instance, or move activation into a store React can subscribe to.

**Why.** A roast rated this major and the analysis is correct. It was written this way to avoid a flash of the previous language, which an effect does cause, so the fix has to keep synchronous activation without mutating shared state during render. It matters as soon as anything renders two locales at once, which the Docs page and any side-by-side comparison do.

**Exit condition.** A story that mounts a Persian and an English AppProviders side by side renders each in its own language and direction, the switch still shows no flash of the previous catalog, and a test covers both.

### `KN-091` Move story prose out of the TSX and into story-docs, with the guard test

- **status** backlog · **severity** high · **points** 3 · **area** web
- **blocked by** KN-003

AGENTS.md requires that everything a Storybook Docs page prints lives in src/shared/story-docs/{en,fa}/<slug>.md, with no JSDoc above const meta, no docblock above a story export and no description inside argTypes, and it says a guard test fails until both languages describe every prop and story. Neither the directory nor the guard exists, and App.stories.tsx and Tokens.stories.tsx both carry prose docblocks above their meta. Create the structure, move the prose, wire the Docs pages to read it, and write the guard.

**Why.** A roast rated this major and it is a contract the repository already states and the first components will copy. Prose in a TSX is prose only the person editing the file sees, in one language, and the product is bilingual by rule: a Docs page that is English at the top and Persian once you scroll is the failure mode AGENTS.md section 5 names.

**Exit condition.** src/shared/story-docs/en and fa exist and carry the prose for every story, no .tsx under src holds a docblock above const meta or a story export, the Docs pages render the markdown in the toolbar language, and a guard test fails when a prop or a story is missing from either language.

### `KN-092` Enforce the import conventions with a lint rule, and fix what already breaks them

- **status** backlog · **severity** medium · **points** 3 · **area** web
- **blocked by** KN-003

AGENTS.md requires MUI from the top-level barrel only, absolute src/... imports with no relative parent imports, and an index.ts barrel in every folder with more than one file. apps/web violates all three throughout: every component deep-imports @mui/material/Box, AppProviders reaches up through ../i18n and ../theme/rtl, and there are no barrels. Nothing lints for it, which is why the very first files written broke it. Add no-restricted-imports for the MUI deep paths and a rule against relative parent imports, add a tsconfig path alias for src, then fix the existing files.

**Why.** A roast caught the deep imports in two fixtures and the same violation is in every file. Deep MUI imports were once a bundle-size trick and are now just an inconsistency, and a relative parent import breaks the moment a file moves. This matters most NOW, before the component queue: 30 component folders written the wrong way is a rename nobody wants, and the convention only holds if the lint holds it.

**Exit condition.** A file importing @mui/material/Button fails npm run lint, a file importing ../something fails it, no file under apps/web/src does either, and every folder with more than one file has an index.ts.

### `KN-093` Stop a later scoped ESLint block silently re-exempting a lingui hole

- **status** backlog · **severity** medium · **points** 2 · **area** agent
- **blocked by** KN-087

ESLint replaces rule options rather than merging them, so a config block added later and scoped to part of the tree, say src/shared/**, can reconfigure lingui/no-unlocalized-strings with aria-label exempt for those files only. Every existing check would still pass: the fixtures live in src/gate-fixtures and would keep failing, and KN-087s config check reads the shared options constant, which the override does not touch. Check the RESOLVED configuration instead, with ESLint calculateConfigForFile over a sample of paths across the tree, and require the same exemption list everywhere.

**Why.** A roast rated this major and it is the general form of the bug the whole task was about: an exemption added for a good local reason that quietly widens somewhere it should not. It is also how the last two holes got in, once as a name and once as a shape, so the third will arrive as a scope.

**Exit condition.** A config block scoped to src/shared/** that exempts aria-label makes agent/scripts/verify/KN-087.mjs fail, the check reads the resolved config for at least one path per top-level source folder, and the block being present is what the failure names.

### `KN-094` The token-name value exemption reaches aria-label and title

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** KN-087

The lingui rule ignores any value matching ^[a-z-]+/[a-z0-9-/]+$, added so a token name rendered as a label, bg/page, would pass. It applies to EVERY value, so aria-label="delete/application" and title="delete/application" both pass, verified by probe. Scope the exemption to where token names actually appear rather than to every string in the codebase, or drop it and localise the Foundations story labels.

**Why.** A roast rated this critical after finding it by probe. It is the third route into the same hole KN-087 closed twice: first the prop name, then a capitalised shape, now a lower-case one. The pattern across all three is an exemption written for one legitimate case that quietly covers every case, and the fix has to narrow the SCOPE rather than the pattern, or a fourth shape will be found.

**Exit condition.** aria-label="delete/application" and title="delete/application" both fail npm run lint, a committed fixture holds both, the Foundations token story still passes, and agent/scripts/verify/KN-087.mjs requires the fixture by name.

### `KN-095` The stories-only title exemption covers every JSX title, not just meta.title

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** KN-087

The lingui block for *.stories.tsx exempts the property name title so a story meta can carry its sidebar path, App/Shell. ESLint matches the NAME wherever it appears, so <Box title="Delete this application" /> inside a story also passes, verified by probe, and that renders a real tooltip in Storybook. Exempt the meta object specifically, by shape or by position, rather than the property name across the whole file.

**Why.** A roast rated this critical. It is the same defect as the shape-based exemption it replaced, one level narrower: scoping to stories files was better than scoping to a value shape and is still too wide, because a story renders the same components a screen does and its JSX is not metadata.

**Exit condition.** A story containing <Box title="Delete this application" /> fails npm run lint while the same file keeps its meta title App/Shell, a committed fixture holds both, and agent/scripts/verify/KN-087.mjs requires it by name.

### `KN-096` A literal type alias carries an unlocalized string past the lingui rule

- **status** backlog · **severity** high · **points** 3 · **area** web
- **blocked by** KN-087

With useTsTypes enabled, assigning a string through a literal type alias and passing the variable to a prop passes the lint: type Label = "Delete this application"; const label: Label = "Delete this application"; <IconButton aria-label={label} />. No as, no any, no suppression, so nothing else in the gate objects either. Decide whether the rule can be configured to follow it, and if it cannot, add a check that flags a literal type alias whose value is a sentence.

**Why.** A roast rated this critical and it is the only one of the routes that needs no exemption at all: it walks past the rule through the type system. It matters because it is the shape a well-meaning contributor would write when trying to centralise strings, so it will arrive by accident rather than by evasion.

**Exit condition.** The literal-type-alias form fails npm run lint or fails a dedicated check, a committed fixture holds it, and the check is proved by a planted break.

### `KN-097` MDX story files are linted by no lingui block at all

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** KN-087

.storybook/main.ts includes ../src/**/*.mdx in its stories glob, and neither lingui block in eslint.config.js matches an .mdx file: the source block is src/**/*.{ts,tsx} and the stories block is **/*.stories.tsx. So a supported src/foo.stories.mdx can render <button aria-label="Delete this application" /> with no enforcement whatsoever. Either lint MDX with eslint-plugin-mdx and apply the rule, or stop accepting MDX in the stories glob and say so.

**Why.** A roast rated this critical. It is worse than the other routes because it needs no trick at all, and it lands exactly where KN-091 is heading: that card moves story prose into markdown, so MDX is about to carry real copy rather than being a theoretical path.

**Exit condition.** An .mdx file under src containing a bare English aria-label fails npm run lint, or the stories glob no longer accepts .mdx and DESIGN.md or AGENTS.md records which was chosen and why; either way a committed fixture proves it.

### `KN-098` Prove the STORYBOOK test project reports a failure too

- **status** backlog · **severity** high · **points** 2 · **area** agent
- **blocked by** KN-088

KN-088 proves the real unit project detects a broken test. The storybook project, which runs every story in headless Chromium and is where component behaviour is actually checked, has no such proof: its story set comes from the stories glob in .storybook/main.ts, so a fixture story needs that glob to admit it. Add a gate story with a play function that asserts something untrue, admitted only in gate mode, and require the run to report it.

**Why.** The storybook project is the half of the suite that renders anything. If it silently ran zero stories, or swallowed a failing play function, every component task after this would report green having checked nothing, and the unit project passing would hide it. This is the same question KN-088 asks, aimed at the project that matters more.

**Exit condition.** A committed story whose play function asserts something untrue is run by the real storybook project in gate mode and reported as a failure, it does not appear in an ordinary run, and emptying the stories glob makes agent/scripts/verify/KN-003.mjs fail.

### `KN-099` Scope the gate run and its passing count to the unit project

- **status** backlog · **severity** high · **points** 2 · **area** agent
- **blocked by** KN-088

agent/scripts/verify/KN-003.mjs runs KARNAMA_GATE_FIXTURES=1 npm test and reads the suite-wide summary line, Tests 1 failed | N passed, which aggregates the unit and storybook projects. Only the fixture filename is project-attributed. Once the storybook project has twenty passing stories, a unit project with no ordinary tests at all satisfies every assertion. Run the gate command with --project unit, or read project-scoped structured output, so the passing count proves the unit include is populated.

**Why.** A roast rated this critical and the arithmetic is right: the twenty-passing-tests assertion is the one meant to prove the ordinary include still works, and it is the one not scoped to the project it is about. It is invisible today because there are only seven stories, and it becomes wrong silently the moment the component queue starts, which is the next thing this project does.

**Exit condition.** The gate run is scoped to the unit project, emptying the unit include makes agent/scripts/verify/KN-003.mjs fail because the run reports no passing unit tests rather than because a source string changed, and the storybook project having any number of passing stories does not affect it.

### `KN-100` Make the gate-fixtures flag hermetic

- **status** backlog · **severity** high · **points** 1 · **area** agent
- **blocked by** KN-088

vitest.config.ts reads Boolean(process.env.KARNAMA_GATE_FIXTURES), so any non-empty inherited value enables the deliberately failing fixture, including the string "0". agent/scripts/verify/KN-003.mjs spawns the ordinary npm test with the parent environment unchanged, so a CI job or a shell that has the variable set makes an ordinary run include a test designed to fail. Compare against the exact string "1" and scrub the variable explicitly for every run that is meant to be ordinary.

**Why.** A roast rated this major. A flag that changes what the test suite runs is dangerous by construction, and this one turns on for a value that reads as off. The failure it produces is the worst kind: a suite that fails for a reason nobody can find, in an environment nobody thought about.

**Exit condition.** KARNAMA_GATE_FIXTURES=0 npm test passes and runs no fixture, the ordinary run inside agent/scripts/verify/KN-003.mjs passes with the variable set to any value in the parent environment, and both are proved by planted environments.

### `KN-101` Run destructive mutation verifiers in an isolated worktree

- **status** backlog · **severity** medium · **points** 3 · **area** agent
- **blocked by** KN-088

agent/scripts/verify/KN-088.mjs mutates apps/web/vitest.config.ts in the shared checkout and restores it in a finally block. finally does not survive SIGKILL, an interrupt, an OOM or a crash, two concurrent runs can snapshot each others broken state and restore it, and the snapshot is a UTF-8 decode and re-encode rather than the byte copy the comment claims. Copy the repository into a temporary worktree with git worktree add, mutate there, and leave the shared checkout untouched. Apply the same treatment to the scratchpad mutation scripts, which have the same shape.

**Why.** A roast rated this major. Every verifier in this repository is documented as read-only and this one is the exception, which is exactly the file most likely to be run twice at once or interrupted. Leaving a broken config behind would be blamed on the gate rather than on the script that broke it, and that is an expensive hour.

**Exit condition.** agent/scripts/verify/KN-088.mjs performs its mutation in a temporary git worktree, killing it mid-run leaves apps/web/vitest.config.ts byte-identical, and two concurrent runs both pass and leave the file byte-identical.

### `KN-102` The gate-fixtures README describes a file and a mechanism that no longer exist

- **status** backlog · **severity** low · **points** 1 · **area** docs
- **blocked by** KN-088

apps/web/src/gate-fixtures/README.md names failing.test.ts, which is now failing.gate.ts, says vitest excludes the directory through the config, which is now flag-controlled inclusion, and says the verifier runs the tools against "these two files", of which there are now six. Rewrite it against what is there, and add the two mechanisms it never described: gate mode, and the fixtures being required by name as well as discovered.

**Why.** A roast rated this minor and it is the only kind of documentation that actually gets read, a README sitting in the directory it describes. A false one is worse than none, because it tells the next reader that the exclusion is in the config and they will go looking for it.

**Exit condition.** Every file and mechanism the README names exists, no file in the directory is unmentioned, and a check in agent/scripts/verify/KN-003.mjs fails when a fixture is added or renamed without the README following.

### `KN-103` Coverage from the storybook project is discarded for any file the unit project also touches

- **status** backlog · **severity** high · **points** 3 · **area** agent
- **blocked by** KN-003

The two vitest projects both produce v8 coverage. For a file only the browser project touches, like src/app/App.tsx, the browser numbers are reported. For a file BOTH touch, the unit project numbers win and the browser ones are lost: src/theme/useColorScheme.ts reported its hook as uncovered while every story exercises it through AppProviders. Reproduce it, then merge the two reports properly, with a per-project report to compare against so the merge can be checked rather than believed.

**Why.** The 100 percent number is the standard this project is built around and it is currently overstated, silently, for exactly the files that have both a unit test and a story, which is what every component in the queue will be. A component whose branches are only reached from a story would read as uncovered and get a pointless unit test, or worse, someone would lower the threshold to fit.

**Exit condition.** A function reached only from a story and living in a file that also has unit tests counts as covered, a per-project coverage report exists, and a planted uncovered branch in such a file fails the run.

