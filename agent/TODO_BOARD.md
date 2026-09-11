# Board

<!-- GENERATED FILE. Edit agent/board.json through agent/scripts/todo.mjs, never this file. -->

Project **KarNama** · 107 of 299 tasks done · 198 of 721 points.

Columns are statuses. Within a column the order is the order `npm run todo -- next`
would pick: severity first, then the smaller story point, then the older id. A task
whose blockers are unsettled is never picked, whatever its severity.

**Next up: `KN-287` Draw the Input's message line only when there is a helper or an error, as the screens draw it** (critical, 2 pt, web)

## In progress (1)

| id | title | sev | pt | area | blocked by | exit condition |
| -- | ----- | --- | -- | ---- | ---------- | -------------- |
| `KN-287` | Draw the Input's message line only when there is a helper or an error, as the screens draw it | critical | 2 | web | none | An Input with neither a helper nor an error draws no message line and is 64 tall, as the 91 screen instances draw it; with a helper or an error it is 90, the file's variants; an error appearing on a field without a helper adds the line with its message; an error on a field that has a helper replaces the helper with the error's message and the field's aria-describedby then names the error, and clearing the error brings the helper back; a blank error still draws no line; stories assert the 64 and the 90, the line appearing with the error, and the error replacing a helper, with a mutation that keeps the helper over the error failing by name, replacing ErrorDoesNotMoveTheField and WithoutAHelper's reserved line; every other place that asserts the reserved line is changed with it, KN-011's verifier and both languages' story docs included; DESIGN.md records the owner's reversal of KN-011's decision; and the Input's comment about the line always keeping its height is corrected. |

## Blocked (2)

| id | title | sev | pt | area | blocked by | exit condition |
| -- | ----- | --- | -- | ---- | ---------- | -------------- |
| `KN-073` | Confirm the employment type and job level option lists | high | 2 | design | KN-002 | DESIGN.md states the lists as confirmed with the source that confirmed them, section 6 no longer lists them as provisional, and KN-012 and KN-034 use the confirmed values. |
| `KN-077` | Settle the two copy strings that frame 505:3 records as not yet applied | high | 2 | design | KN-002 | DESIGN.md states the wording and the screen for both strings, section 6 no longer lists them, and agent/design-manifest.json records them as disposed so the capture-derived pending check stays green. |

## Backlog (187)

| id | title | sev | pt | area | blocked by | exit condition |
| -- | ----- | --- | -- | ---- | ---------- | -------------- |
| `KN-212` | The tooltip stories are Persian-only, so the four language and theme combinations cannot be checked | critical | 1 | web | KN-221 | At least one story renders text that actually changes with the Language toolbar, so English and Persian are visibly different, and the component is seen in all four combinations. Whether the lint exemption for title should be narrowed is answered either way rather than left, since it is what let this through. |
| `KN-264` | The Status Chip's dir=auto is proved in one direction, and DESIGN.md overstates it | critical | 1 | web | KN-062 | With KN-062's fixtures, a story renders a long Latin-led name in the Persian interface and asserts the chip is ltr and cut at its end, a digit-led Persian name resolves rtl, and DESIGN.md says what happens to a name with no letter at all instead of 'always'. |
| `KN-014` | Icon button, 2 tones by 3 states | critical | 2 | web | KN-005, KN-006, KN-007, KN-008 | Six combinations match Figma, every instance requires an accessible label and a test fails when one is missing, and the hit target is at least 32 by 32. |
| `KN-016` | Search bar, 3 states | critical | 2 | web | KN-005, KN-006, KN-007, KN-008 | Three states match Figma, clearing restores the default state and returns focus to the field, and the input is debounced without dropping the final keystroke. |
| `KN-223` | The tooltip's fixed-width policy is unstated, and no story shows a short or an overlong title | critical | 2 | web | KN-221 | The story docs state, in both languages, that the width is fixed at the frame's 260 by design and what a long title does, and two stories render a short and an overlong title through lingui, each asserting the 260 width and the long one asserting it wraps rather than overflows. |
| `KN-290` | Under forced colours the Checkbox's tick and dash keep their author colour, so a disabled mark looks enabled and a white one can vanish | critical | 2 | web | none | Under forced colours the tick and the dash are drawn in system colours, ButtonText when enabled and GrayText when disabled, the keyword kept so a check can read it whatever the palette, and each stays visible against the frame; a check in a production build reads checked and indeterminate, enabled and disabled, under forced colours, comparing the rendered mark with a same-page probe of its system colour, and a mutation back to the author colour fails it; and DESIGN.md's stroke section says what the mark takes there. |
| `KN-293` | The Checkbox's focus ring sits four pixels outside a root with no padding, so a host that clips flush at its edge removes it | critical | 2 | web | none | A focused Checkbox inside a host that clips its overflow flush at the Checkbox's own box still changes at least a two-pixel perimeter at 3:1, drawn inside that box or with the room kept by the Checkbox itself; a story renders it in an overflow hidden host with no padding and asserts from the rendered geometry that every pixel of the focus change lies inside the host, a mutation back to the outline outside fails it by name, and DESIGN.md says which. |
| `KN-294` | The Filter Chip's focus ring sits four pixels outside the chip, so a scrolling row of chips clips it at its edges | critical | 2 | web | none | A focused Filter Chip inside a host that clips its overflow flush at the chip's box still changes at least a two-pixel perimeter at 3:1, drawn inside the chip or with the room kept by the chip itself, selected and not; a story renders it in an overflow hidden host with no padding and asserts from the rendered geometry that every pixel of the focus change lies inside the host, a mutation back to the outline outside fails it by name, and DESIGN.md says which. |
| `KN-295` | KN-274's story measures the focus change from a model: rounded bands counted as rectangles, and transforms and filters not read | critical | 2 | web | none | FocusedWhileInvalid's area accounts for the rounded corners, from the exact quarter-ring areas of the edge's radius and the ring's or from a rendered reading, and still clears 4W + 4H; focusExtent requires what it does not model, transform, filter, clip-path and mask, to be none on the field, both pseudo-elements and the input, and counts the input's own outline; a transform and a filter on the ::after each fail FocusedWhileInvalid by name; the verifier also reads the rendered change on a field 80 wide or less, in light and dark, clearing 4W + 4H with nothing changed outside; and DESIGN.md's arithmetic states the corners' loss and the width above which the change clears the perimeter. |
| `KN-296` | An Input icon given as an array, a fragment or a component that renders only blank text still draws an empty slot | critical | 2 | web | none | An Input whose icon renders only blank text, through an array, a fragment or a component, draws no slot that takes room and its text box sits 16 from that edge, decided from what the slot rendered rather than from the prop; IconsTurnedOff covers an array of a space, a fragment holding a zero-width space and a component returning a space, each asserting a slot that takes no room; a mutation removing the rendered check fails it by name; and the comment on drawn() says nothing to read, with the lone-mark case named as deliberate. |
| `KN-019` | Colour picker for the four custom status slots | critical | 3 | web | KN-005, KN-006, KN-007 | The picker offers exactly the four reserved pairs, matches Figma, marks the current selection, is keyboard navigable, and cannot produce a colour outside the reserved set. |
| `KN-021` | Page header | critical | 3 | web | KN-005, KN-006, KN-007, KN-009, KN-008 | Both drawn instances match Figma, the optional back and action slots each render and are each omittable, the language switch appears only at the mobile breakpoint, and the title is the page heading in the accessibility tree. |
| `KN-022` | Empty state and loading state | critical | 3 | web | KN-005, KN-006, KN-007, KN-009 | Both match Figma, the empty state carries a call to action that starts the add flow, and the loading state stays honest past 15 seconds rather than looking hung, which is the cold start case. |
| `KN-023` | Tabs | critical | 3 | web | KN-005, KN-006, KN-007 | Three states match Figma, the tablist follows the roving tabindex pattern with arrow key navigation, the active tab is announced as selected, and panels are associated with their tabs. |
| `KN-024` | Sort control | critical | 3 | web | KN-005, KN-006, KN-007, KN-018 | Three states match Figma, the four permitted options are the only ones offered, the current sort is visible on the closed control, the menu is keyboard navigable, and changing sort is announced. |
| `KN-025` | Bulk action bar | critical | 3 | web | KN-005, KN-006, KN-007, KN-013, KN-009 | Both types match Figma, the bar appears only when at least one row is selected, it reports the selection count, and it is reachable by keyboard when it appears rather than trapping focus behind the list. |
| `KN-062` | Shared story fixtures | critical | 3 | web | KN-003, KN-007 | Every component story that needs data uses the shared fixtures, a Docs page rendering many stories at once seeds without error, the fixtures never appear in the production bundle and a test asserts that, and each fixture set has a long value that exercises truncation in both languages. |
| `KN-206` | The Checkbox has no accessible name and a target smaller than WCAG allows | critical | 3 | web | none | The component takes an id, and rendering one with no accessible name is impossible without it being visible: either the type requires one of aria-label, aria-labelledby or a wrapping label, or a check fails on a story that omits all three. Every story names its control. The interactive target is at least 24 by 24 while the DRAWN frame stays 20 by 20 from Figma, or the spacing exception is demonstrated for the specific placement and written down. A test asserts the hit area, not the frame. |
| `KN-221` | The catalogs are never compiled, so a message with a count or a placeholder renders raw ICU in production | critical | 3 | web | none | A message with a plural and a placeholder renders correctly in BOTH locales in a production build, checked by rendering it from the built output or under NODE_ENV=production rather than in development, with Persian digits in fa-IR; a mutation that loads the catalogs uncompiled again makes that check fail; and the catalog tests still prove every English id has a non-empty Persian translation. |
| `KN-226` | Nothing committed checks that the published Storybook renders its stories without errors | critical | 3 | infra | none | A committed check builds Storybook for production, opens every story in headless Chromium, and fails on any page error or console error; it runs before the Pages workflow publishes; and a mutation removing the Hover story's test-runner guard makes it fail on the emitted import error. |
| `KN-255` | The other components' stories keep controls that make their play functions untrue | critical | 3 | web | none | Every story with a play function, in every component, either reads its expectations from the active args or offers only the controls its assertions hold for, and no story offers a control whose values the component cannot take, such as the Tooltip's children; KN-247's check, run over every story and changing each control by its own type (booleans flipped, every option of a select, a number changed, text changed and emptied), fails on none; and a repository guard fails any story file with a story that has a play function and neither declares its controls nor disables them. |
| `KN-275` | Add a resting edge role for controls at 3:1, and draw the Input and the Checkbox with it | critical | 3 | web | none | tokens.ts carries a named role for a control's resting edge, a neutral in text/secondary's hue at 3.3:1 or more on bg/surface, bg/page and bg/surface-secondary, and darkMode.ts derives it and checks it at 3:1 or more on the three dark backgrounds, each ratio asserted by a unit test with a mutation back to border/default failing it; the Input's resting border and the Checkbox's unchecked frame use it, and the Input's Default story and the Checkbox's Unchecked story assert it; every other state of both still renders as drawn; DESIGN.md's token tables list the role as the owner's addition under KN-273; the token verifier and the contract pass; and the Input and the Checkbox are seen at rest in all four combinations. |
| `KN-279` | Give the selected Filter Chip a blue edge at 3:1, apart from its pressed edge | critical | 3 | web | KN-272 | A selected Filter Chip's edge is drawn in a named role at 3:1 or more against bg/surface, bg/page, bg/surface-secondary and its own fill, in light and in the derived dark, each ratio asserted by a unit test with a mutation back to the fill-coloured edge failing it; the Selected story asserts the edge; a pressed unselected chip is still told apart from a selected one, by at least 3:1 between their two indicators or by a difference that is not colour, such as the edge's width, and a focused chip beside a selected one keeps its ring visibly apart from the selected edge, both asserted on rendered chips side by side, including a chip held pressed from the keyboard; DESIGN.md records the edge under the owner's decision of KN-276; and the chip is seen unselected, selected and pressed in all four combinations. |
| `KN-008` | Icon set, 30 icons at 24 by 24 | critical | 5 | web | KN-005, KN-006, KN-007 | Every one of the 30 named icons renders, a story shows the full grid, each is 24 by 24 with 2px round strokes, colour follows the prop and falls back to text/secondary, and a test asserts the exported set matches the list in DESIGN.md. |
| `KN-009` | Button, 3 sizes by 5 styles by 5 states | critical | 5 | web | KN-005, KN-006, KN-007 | All 75 combinations render from a single story driven by args, each matches the Figma node for that combination, Focus shows the border/focus ring on keyboard focus only, and Disabled is not reachable by keyboard. |
| `KN-012` | Select, option row and options menu | critical | 5 | web | KN-005, KN-006, KN-007 | All five select states and all four option states match Figma, the listbox is keyboard navigable with arrows, Home, End and type-ahead, the open state traps focus correctly, and closing returns focus to the trigger. |
| `KN-018` | Menu and menu item | critical | 5 | web | KN-005, KN-006, KN-007, KN-008 | All four item states match Figma, both menu types render, the menu closes on Escape and on outside click and returns focus to its trigger, and destructive items are distinguishable without relying on colour alone. |
| `KN-020` | Status choice, status picker and status control | critical | 5 | web | KN-005, KN-006, KN-007, KN-010, KN-018, KN-019 | All three families match Figma, the control opens the picker, choosing a status closes it and reports the change, Escape cancels without changing anything, and the underlying chip still has no interactive attributes of its own. |
| `KN-026` | Contact card, full and compact | critical | 5 | web | KN-005, KN-006, KN-007, KN-008, KN-014, KN-062 | Both layouts and all three states match Figma, every field the design draws is present, long values truncate rather than reflow the card, and email and phone are actionable links. |
| `KN-028` | Modal shell, confirm, and change status | critical | 5 | web | KN-005, KN-006, KN-007, KN-009, KN-014 | Both modals match Figma, focus is trapped and returns to the trigger on close, Escape closes, the backdrop click behaviour matches the design, and the dialog has an accessible name and is announced as a dialog. |
| `KN-031` | Contact modal, add and edit | critical | 5 | web | KN-005, KN-006, KN-007, KN-028, KN-011, KN-026 | Both modes match Figma, Edit is prefilled from the record, validation errors render in the Input error state, and cancelling discards without saving. A contact SAVES with a full name and nothing else: neither email nor phone is marked required and neither blocks submission, which is the owner's decision on KN-071 and is deliberately more permissive than the file's own note about a contact with no contact route. |
| `KN-060` | Kanban column component | critical | 5 | web | KN-005, KN-006, KN-007, KN-010, KN-015, KN-018 | The column renders with cards, with none, and at the mobile width, its header shows the live count, the Size=M chip is used only here, the Add Card row stays pinned at the bottom as the column scrolls, and every state matches its Figma node. A column can render COLLAPSED to a count instead of its cards, and expands on click; the board decides which column starts collapsed, this component does not know which one it is. |
| `KN-015` | Card, desktop and mobile, with the status stripe | critical | 8 | web | KN-005, KN-006, KN-007, KN-010, KN-008, KN-062 | All six desktop states and both mobile states match Figma, the stripe renders the right colour for all nine statuses, a deleted or unknown status falls back to the new colour rather than rendering no stripe, and the card is keyboard focusable and activatable. |
| `KN-027` | Navigation: nav item, desktop sidebar, mobile tab bar, and the language switch | critical | 8 | web | KN-005, KN-006, KN-007, KN-008, KN-009 | The sidebar renders on the right in Persian and mirrors correctly in English, the tab bar replaces it at the mobile breakpoint, exactly three destinations exist and are named with the current terminology, the language switch changes locale and direction and persists, and no fourth tab bar entry was added. |
| `KN-029` | Add and edit job modal, all six steps | critical | 8 | web | KN-005, KN-006, KN-007, KN-011, KN-012, KN-028 | All six steps match Figma, every step is reachable in a story, Error offers Manual as the way out, Review is fully editable before saving, and leaving the modal mid-flow asks before discarding. |
| `KN-030` | Job modal, five tabs | critical | 8 | web | KN-005, KN-006, KN-007, KN-023, KN-028, KN-026, KN-020 | All FIVE tabs match Figma, the fifth being سابقه which the frame does not draw and which sits second, the modal opens from a card on the board, status history renders in its OWN tab in reverse chronological order rather than in the Info tab, and switching tabs does not lose unsaved note text. |
| `KN-217` | A string literal written 'as const' skips the lingui rule entirely, in any file | high | 1 | web | none | <Box title={'Delete this application' as const} /> and aria-label={'Delete' as const} fail npm run lint in a committed fixture, a story meta title written with 'as const' fails too, and 'as const' on an object or array literal, which is the idiom that is actually used, still passes. |
| `KN-260` | Stories inherit the real pointer where the last hover story left it | high | 1 | web | none | Every story starts with the test runner's pointer somewhere that hovers nothing, set once for the whole suite rather than per story; BlankErrorIsNoError drops its pointer-events workaround and TECH-DEBT 15 is deleted; and a check runs a story that leaves the pointer on a field followed by one asserting a resting border in the same spot, which fails without the reset. |
| `KN-269` | When a failed save arrives after the collapsed column has flashed is not decided | high | 1 | design | none | DESIGN.md states, as the owner's decision, when the collapsed column's success flash plays relative to the save and what happens to an optimistic move and its flash when the save fails; KN-061's exit condition names it; and a verifier checks the stated rule word for word in both places. |
| `KN-270` | The collapsed column's hover timer and flash have no rule for leaving, returning or a second drop | high | 1 | design | none | DESIGN.md states, as the owner's decision, whether leaving the collapsed column during a drag resets the 500 ms, what a second drop does to a running flash, how the one-second flash relates to the 300 ms state change, and whether the keyboard target expands; KN-061's exit condition names each; and a verifier checks each detail exactly, the 500 ms, the count ticking up and the flash's length included. |
| `KN-097` | MDX story files are linted by no lingui block at all | high | 2 | web | KN-087 | An .mdx file under src containing a bare English aria-label fails npm run lint, or the stories glob no longer accepts .mdx and DESIGN.md or AGENTS.md records which was chosen and why; either way a committed fixture proves it. |
| `KN-098` | Prove the STORYBOOK test project reports a failure too | high | 2 | agent | KN-088 | A committed story whose play function asserts something untrue is run by the real storybook project in gate mode and reported as a failure, it does not appear in an ordinary run, and emptying the stories glob makes agent/scripts/verify/KN-003.mjs fail. |
| `KN-099` | Scope the gate run and its passing count to the unit project | high | 2 | agent | KN-088 | The gate run is scoped to the unit project, emptying the unit include makes agent/scripts/verify/KN-003.mjs fail because the run reports no passing unit tests rather than because a source string changed, and the storybook project having any number of passing stories does not affect it. |
| `KN-108` | Dark destructive controls fail contrast, because on-accent is one token for two fills | high | 2 | web | KN-005 | Every derived contrastText clears 4.5 to one against every fill the theme pairs it with, a test enumerates those pairs from the theme rather than from a hand-written list, and it fails when a fill changes without its text following. |
| `KN-111` | Forbid the message-id forms the catalog scan cannot see | high | 2 | web | KN-006 | A Trans with a braced or template-literal id fails npm run lint, a committed fixture holds each form, and the catalog test still finds every id the codebase uses. |
| `KN-134` | ThemedTree sets i18n state while rendering | high | 2 | web | none | The full web suite produces no React warnings at all, asserted by a check that fails when one appears rather than by reading the output, and switching language still works in fa-IR and en-US with the choice surviving a reload. |
| `KN-167` | The API schema-entry test is flaky under load and fails the gate at random | high | 2 | api | none | The cause of the 19 second run is identified rather than papered over with a longer timeout, the test is made to run in a bounded time regardless of machine load, and the full apps/api suite passes twenty consecutive times under a parallel load that reproduces the original failure. |
| `KN-178` | The preferences story's localStorage restore races with other stories | high | 2 | web | none | The story cannot pollute the shared store: either the provider under test is given an injected storage rather than the real one, or the storybook project serializes these stories explicitly, or the story stubs window.localStorage for its own duration. Proved by running the story concurrently with a story that reads stored preferences and asserting the second is unaffected, not by reasoning about the scheduler. |
| `KN-183` | KN-114's verifier can silently overwrite a concurrent catalog edit | high | 2 | web | none | The blank and untranslated rules live in a pure function that takes the catalogs as an argument; catalog.test.ts calls it on the real imported ones; a test drives it with in-memory catalogs containing each evasion, empty, whitespace, format characters only, the id exactly and the id with punctuation and casing changed, and requires each to be reported naming the id; KN-114's verifier no longer writes to any tracked file; and its header no longer needs to warn that an interrupted run leaves the catalog planted. |
| `KN-195` | npm run silently truncates every argument at its first newline on Windows | high | 2 | agent | none | Either the scripts refuse an argument containing a newline with a message naming this cause, or the loop stops going through npm for anything carrying prose and RALPH.md and .claude/ralph-loop.local.md are updated to the invocation that works. A check demonstrates the truncation and its absence after the fix, using a free non-mutating command rather than a real roast. The existing board is audited for fields whose text ends mid-sentence, and the audit result is recorded whether or not it finds anything. |
| `KN-202` | The story-docs markdown contract is documented as rigid but silently accepts malformed files | high | 2 | web | none | parseStoryDoc reports a malformed file rather than absorbing it: an unknown level-two heading and a duplicate level-three name are each errors with their own message naming the file and the heading. The guard surfaces them. Both are unit tests, and a mutation removing either rejection makes its test fail. The existing eight docs files still parse unchanged, proved by the guard still passing. |
| `KN-203` | The Docs page reads its initial language from undocumented Storybook internals and fails silently to Persian | high | 2 | web | none | The Docs page either resolves the initial locale from something Storybook supports, or FAILS LOUDLY when it cannot, rather than defaulting silently: a visible note on the page saying the language could not be determined is enough, since a Docs page has somewhere to put it. A test covers the resolution path, or the reason it cannot be tested is recorded with the same evidence any other untestable claim needs in this repository. |
| `KN-234` | The token guard still accepts copy as a key or inside the font stack, and its retirement check trusts any lint failure | high | 2 | web | none | Every string-literal key in tokens.ts must be a token name DESIGN.md documents, not a shape; the font stack must equal the documented value exactly; planted cases for a copy key, copy after Vazirmatn and a copy family each fail the guard; and the retirement check requires a clean baseline lint and lingui errors attributable to tokens.ts, STORAGE_KEY and TOOLTIP_SURFACE once they are removed, reporting an unrelated error as unjudgeable rather than as the debt standing. |
| `KN-050` | CI: lint, typecheck, test, build, both workspaces | high | 3 | infra | KN-003, KN-033 | The workflow passes on a clean checkout, fails when a deliberately broken test is planted, and installs the Playwright browser before the Storybook project runs. |
| `KN-078` | Check documentation-frame coverage against the capture text, not an author-chosen fact list | high | 3 | agent | KN-002 | Deleting the substance of any one frame transcription from DESIGN.md while leaving its index row and its manifest facts intact makes agent/scripts/verify/KN-002.mjs fail, demonstrated by a planted mutation for at least three different frames. |
| `KN-079` | Capture the documentation canvas as text, not as truncated layer names | high | 3 | design | KN-002 | A committed text capture of canvas 5:8 contains the full body of every documentation frame, no name or text field in it is exactly at the truncation cap, agent/scripts/verify/KN-002.mjs scans that text rather than the metadata names, and planting a pending marker deep inside a long string makes the verifier fail. |
| `KN-085` | Inventory every Figma style and variable at file level, not by sampling use sites | high | 3 | design | KN-004 | A committed file-level inventory of every Figma style and variable, with its digest recorded, and agent/scripts/verify/KN-004.mjs failing when an entry in it is neither in a DESIGN.md table nor on a written exclusion list, proved by planting an entry that is in neither. |
| `KN-090` | Stop AppProviders mutating the lingui singleton during render | high | 3 | web | KN-003 | A story that mounts a Persian and an English AppProviders side by side renders each in its own language and direction, the switch still shows no flash of the previous catalog, and a test covers both. |
| `KN-091` | Move story prose out of the TSX and into story-docs, with the guard test | high | 3 | web | KN-003 | src/shared/story-docs/en and fa exist and carry the prose for every story, no .tsx under src holds a docblock above const meta or a story export, the Docs pages render the markdown in the toolbar language, and a guard test fails when a prop or a story is missing from either language. |
| `KN-096` | A literal type alias carries an unlocalized string past the lingui rule | high | 3 | web | KN-087 | The literal-type-alias form fails npm run lint or fails a dedicated check, a committed fixture holds it, and the check is proved by a planted break. |
| `KN-103` | Coverage from the storybook project is discarded for any file the unit project also touches | high | 3 | agent | KN-003 | A function reached only from a story and living in a file that also has unit tests counts as covered, a per-project coverage report exists, and a planted uncovered branch in such a file fails the run. |
| `KN-104` | Give the product a colour scheme setting that persists | high | 3 | web | KN-005 | A user can choose light, dark or system in the running app, the choice survives a reload, an e2e test proves both, and the same mechanism carries the language choice. |
| `KN-118` | Health says ok while the database is unreachable, and the URLs are only checked for emptiness | high | 3 | api | KN-033 | A malformed DATABASE_URL or WEB_ORIGIN fails at startup and names which, the health query reports the database separately from the process, and it does not say ok when the database cannot be reached, proved against a URL pointing at a closed port. |
| `KN-119` | Nothing tests CORS, the port binding or the startup path | high | 3 | api | KN-033 | A preflight from an unexpected origin does not receive that origin back, a test covers the CORS options and the port resolution without binding a port, main.ts is no longer excluded from coverage wholesale, and changing origin to true fails the run. |
| `KN-124` | Status history is documented as immutable and nothing enforces it | high | 3 | api | KN-034 | An UPDATE or a DELETE against status_history is rejected by the database, deleting a job record still removes its history through the cascade, and both are proved against PGlite. |
| `KN-127` | The resolver-registration check reads text rather than the container | high | 3 | api | KN-120 | A resolver registered in a way the text scan cannot see, a default export in a file not named *.resolver.ts, is detected, and the check reads the resolvers from a booted Nest context rather than from source text. |
| `KN-158` | The story-docs rule in AGENTS.md describes a system that does not exist | high | 3 | web | none | Either src/shared/story-docs/{en,fa} exists with a page for every story, the three existing stories are migrated off JSDoc on meta, and a guard test fails when either language is missing a prop or story; or AGENTS.md is corrected to describe what the repository actually does and the main.ts comment with it. Whichever is chosen, no story in the tree contradicts the written rule afterwards, proved by a check rather than by reading. |
| `KN-265` | Employment type becomes eight values, and a job can hold more than one | high | 3 | api | none | DESIGN.md's employment type list gives the eight values as the owner's decision of 2026-09-10, with the overlap noted, and says the field holds more than one; the Prisma schema has the eight and a record holds a list of them, through a migration that carries existing values over and is tested; the GraphQL schema and the generated types expose a list; the catalogs carry English ids and Persian for the two new values; and KN-073 is left holding only the job level list. |
| `KN-038` | Custom statuses: rename, recolour, delete | high | 5 | api | KN-037 | A renamed status shows its new name everywhere including old records, deletion is refused while postings remain in that status and the message says how many, the four custom slots cannot be exceeded, a record pointing at a deleted status still renders with the fallback colour, and tests cover each. |
| `KN-042` | App shell: routing, responsive navigation, and the language switch in place | high | 5 | web | KN-027, KN-006, KN-035 | All three routes render inside the shell, the nav switches between right sidebar and bottom tab bar at the breakpoint, a deep link to any of them works on a hard refresh, the language switch persists across a reload, and an API error renders the error state rather than a blank page. |
| `KN-044` | Add job flow | high | 5 | web | KN-042, KN-029, KN-037 | An e2e test pastes a link, corrects a field in Review, saves, and finds the record on My Jobs with status New, and a second test takes the Error path into Manual and saves from there. |
| `KN-045` | Job detail modal, wired | high | 5 | web | KN-043, KN-030, KN-038, KN-039 | An e2e test opens a card, changes its status, sees the history grow, adds a note and a contact, closes and reopens, and finds all of it still there. The modal renders FIVE tabs and status history renders in its OWN tab, second, NOT inside the info tab; the e2e test asserts where the history it watched grow actually appears, since a history that grows in the wrong place passes a test that only counts entries. |
| `KN-046` | Auth screens: login, code, signup | high | 5 | web | KN-042, KN-036 | An e2e test signs in with a number and the code from the mock provider and reaches the board, a wrong or expired code shows an honest message with a way to resend, first login collects the name, and signing out clears the token and the Apollo cache rather than only the UI. |
| `KN-052` | Deploy the API to Render free, with Neon free Postgres | high | 5 | deploy | KN-033, KN-034, KN-050 | The API answers at its Render URL, the web app reaches it across origins with the CORS policy WEB_ORIGIN sets, migrations have run against the Neon database, and a deploy follows a push to main with no manual step. The database choice is recorded with its reason so it is not silently reverted to a provider that expires or pauses. A check proves the deployed API responds and that render.yaml still pins the free plan and carries no DATABASE_URL value. |
| `KN-061` | Drag a card between columns, with a keyboard path | high | 5 | web | KN-060, KN-020, KN-269, KN-270 | A card drags between two columns and the status persists, a failed mutation rolls the card back to its original column, the same move is achievable by keyboard alone, and the change is announced to assistive technology. Onto the rejected column collapsed to a count, as the owner decided on 2026-09-10, KN-196: during a drag it expands after a short hover of 500 ms; it accepts a drop while still collapsed; once the card lands it recollapses with a brief highlight, and only if the drag opened it, the count ticking up, the header flashing the rejected status colour for about a second and the move announced, Moved to Rejected with the count; a column the user opened stays open; a failed save returns the card with no highlight; and the keyboard path offers it as one target, announced with its count. |
| `KN-063` | Accessibility gate | high | 5 | web | KN-003, KN-007 | An a11y violation planted in a story fails the test run, every action reachable by hover is reachable by keyboard, every icon-only control has an accessible name and a test asserts it, and each of the nine status base-on-container pairs is measured against the contrast bar with the result recorded. |
| `KN-146` | The migration guard should stop lexing SQL and ask Postgres instead | high | 5 | api | none | A migration containing an early COMMIT or an ABORT cannot produce a ledger row saying applied, proved by planting both against PGlite using syntax the scanner does NOT recognise, so the protection is demonstrably the structure rather than the screen. |
| `KN-214` | The lingui gate exempts every Persian string and most English words, because its no-letter pattern is compiled without the u flag | high | 5 | web | none | The no-letter entry is replaced by one that works WITHOUT flags, since the plugin passes none, and fails closed: only digits, whitespace, punctuation and symbols are exempt, so a letter in any script is checked. 'Delete', 'Save', 'مصاحبه' and 'حذف وضعیت' each fail npm run lint in a committed fixture, as aria-label, as title and as JSX text, and the existing fixtures fail only on the string under test rather than also on a child like x. Every one of the 82 strings is either localised or exempted by a named, scoped rule with a reason, never by a value shape. A check compiles each ignore entry exactly as the plugin does, new RegExp(entry) with no flags, and fails if any entry whitelists a known copy string, and that check is proved by a mutation restoring the \p{L} entry. |
| `KN-036` | Auth: phone OTP, JWT, and the admin role | high | 8 | api | KN-034 | A user signs in with a number and a code against the mock provider, the code expires and a reused code is rejected, first login collects the required name, a non-admin is refused every admin operation at the resolver rather than only in the UI, and tests cover all of those. |
| `KN-037` | Job records: CRUD, status transitions, and status history | high | 8 | api | KN-034, KN-036, KN-057 | An e2e test creates a record, moves it through New, Applied, Interview and Offer, and reads back a history with four entries in order, and a test proves history cannot be edited or reordered through the API. |
| `KN-039` | Contacts, notes and file references | high | 8 | api | KN-037 | A contact, a note and a file can each be attached to a record and read back, deleting a record removes its attachments, and an upload larger than the configured limit is refused with a usable error rather than a 500. A contact with a full name and no email and no phone is accepted and read back unchanged: the data layer carries no NOT NULL and no check constraint requiring either, per the owner's decision on KN-071. |
| `KN-048` | End to end tests for both surviving scenarios | high | 8 | web | KN-043, KN-044, KN-045 | Both scenarios pass end to end on a clean database, each asserts the stored record and its status history rather than only what is on screen, and both run in CI. |
| `KN-049` | Coverage to 100 percent, enforced | high | 8 | web | KN-048 | Coverage reports 100 percent against the stated exclusions, the build fails when a line is uncovered, and every exclusion has a written reason. |
| `KN-056` | The standalone network screen | high | 8 | web | KN-042, KN-026, KN-032, KN-039 | An e2e test opens the network route, adds a contact, edits it, selects two and deletes them through the bottom bar, and sees the empty state on a fresh account. The grid reads right to left and row by row in Persian and mirrors in English, with no array reversal in the code. |
| `KN-057` | Posting extraction: turn a pasted link or text into a Review payload | high | 8 | api | KN-034 | Extraction from raw text returns the documented field set with a named test fixture, a URL pointing at a private or link-local address is refused, a slow or oversized response is aborted within the configured bound, every failure path returns the error shape the UI maps to the Error state, and the mock provider makes all of it runnable with no network. |
| `KN-043` | The kanban board screen | high | 13 | web | KN-042, KN-015, KN-016, KN-017, KN-024, KN-025, KN-022, KN-037, KN-060, KN-061 | An e2e test seeds an archive, drags a card between two columns and sees the status change persist, filters and searches, selects several and acts through the bottom bar, and opens a card into the modal, all against the real API. The rightmost column is the first stage in Persian and the layout mirrors in English. رد شده is the last column, after پیشنهاد کار, and the board renders it collapsed to a count by default. |
| `KN-075` | Decide which fields the Review step of the add flow shows | medium | 1 | design | KN-002 | DESIGN.md names the Review field list with the reason for it, section 6 no longer lists the Review step as open, and agent/design-manifest.json records the disposition instead of the open item. |
| `KN-081` | Replace the truncation-cap frequency guess with a stated cap | medium | 1 | agent | KN-002 | The truncation figure in DESIGN.md is derived from a cap the manifest records with its provenance, or from per-name evidence of cutting, and a fixture capture with eleven repeated 36-character labels and no truncation does not report any name as truncated. |
| `KN-116` | Move the language switch out of the placeholder shell into the drawn chrome | medium | 1 | web | KN-006 | The switch renders at the bottom of the sidebar on desktop and as a Page Header trailing action on mobile, App.tsx contains no language control, and an e2e test finds it in both places at the two drawn viewports. |
| `KN-126` | Assert there is exactly one graphql in the dependency tree | medium | 1 | api | KN-120 | agent/scripts/verify/KN-033.mjs fails when more than one graphql version resolves, proved by a planted duplicate, and TECH-DEBT entry 10 names it as the check that retires the split. |
| `KN-139` | The board demands a verify command at the moment attaching one costs a roast round | medium | 1 | agent | none | Moving a task to review without a verify command is refused or warned about with the same message move done gives, proved by trying it, and the message says attaching it afterwards will invalidate the roast. |
| `KN-140` | KN-131's verifier regenerates generated.ts instead of restoring it | medium | 1 | agent | none | Starting the script with modified content in generated.ts leaves that exact content in place afterwards, proved by planting it, and a cleanup whose regeneration fails still restores the file. |
| `KN-156` | The close gate has no exit for unrelated work landing during a background roast | medium | 1 | agent | none | move done distinguishes changes that touch files the round read from changes that do not, names which files it compared, and accepts an unrelated change with its own flag and its own recorded sentence. A mutation that changes a file the round DID read still refuses with the original message. |
| `KN-157` | The roast record cannot say a finding was fixed rather than dismissed | medium | 1 | agent | none | todo roast accepts a way to record findings that were fixed in-task rather than filed, the summary line distinguishes the three cases, dismissed, filed and fixed, and re-recording KN-100 round 1 with it shows three findings fixed rather than nothing survived. |
| `KN-164` | CLI messages still instruct the obsolete close-after-roast flow | medium | 1 | agent | none | No message printed by todo.mjs instructs closing after a roast or implies a done task should be reopened; the post-adjudication line describes what is actually true, that the round is recorded and its findings are on the board; and a check asserts the obsolete phrasings are absent from the source's message strings. |
| `KN-169` | The KN-071 loss marker impersonates the plan it says was destroyed | medium | 1 | agent | none | The KN-071 loss record lives somewhere named for what it is rather than under a plan filename, the decision it concerns links to it, no file matching the plan naming convention denies being a plan, and a check proves that last property so the next marker cannot repeat it. |
| `KN-179` | no-restricted-globals does not cover stories, so a bare localStorage passed lint | medium | 1 | web | none | no-restricted-globals covers every file that runs in a browser including stories and .storybook, the existing bare uses are corrected, and a planted bare localStorage in a story FAILS npm run lint, proved by planting one rather than by reading the config. |
| `KN-180` | Verifiers claim to be read-only while their test runs write to node_modules | medium | 1 | agent | none | No verifier claims to be read-only when the commands it spawns write anywhere; those that need a writable tree say so in one line naming what they write; and a verifier that cannot complete reports that it could not RUN a check rather than counting it as a pass or a failure. |
| `KN-182` | KN-166's verifier makes this repository fail when a sibling project moves | medium | 1 | agent | none | KarNama's verification does not depend on any path outside this repository; a missing sibling is reported as unavailable rather than as a failure; and the rules check for SkipBureau lives in SkipBureau and gates SkipBureau, proved by running both with the sibling renamed. |
| `KN-186` | The plan-beside-the-work rule has no answer when the work IS in .claude | medium | 1 | agent | none | Both projects' rules say where a plan goes when the work itself is inside .claude, whichever answer is chosen, and the KN-181 plan is moved there and tracked so it cannot vanish. |
| `KN-215` | The props and stories value exemption is global, so aria-label="stories" passes | medium | 1 | web | none | aria-label="stories" and title="props" fail npm run lint in a committed fixture, the story-docs parser still recognises both headings, and the ignore array no longer names them. |
| `KN-216` | The Storybook stories glob drops a story at the root of src, and the docs guard excludes by a different rule | medium | 1 | web | none | A story file directly under src is indexed by Storybook and run by the storybook project, src/gate-fixtures is still excluded from both, and the docs guard derives its list from the same rule Storybook uses rather than a second one, proved by a fixture at the root of src that appears in Storybook's index and in the guard alike. |
| `KN-228` | The Hover story's canvas branch still keys off Storybook's private preview global | medium | 1 | web | none | The Hover story reads no Storybook or Vitest internal; the published Storybook still renders it as a canvas with no error, checked on a production build; and removing either repository flag makes the story fail in the environment that flag belonged to. |
| `KN-230` | The callback fn() rule reads only the meta's args, not what each story actually passes | medium | 1 | web | none | The guard fails for a story whose own args override a callback with anything but Storybook's fn(), and for an fn not imported from storybook/test, proved by a planted story of each kind, while the current stories still pass. |
| `KN-257` | The getComputedStyle lingui exemption covers every string, not the one selector it is for | medium | 1 | web | none | getComputedStyle is no longer in ignoreFunctions; the one selector the stories pass is exempted by an exact pattern with its reason beside it; lint passes; and a check shows a getComputedStyle call with a literal of copy is flagged while getComputedStyle(element, '::placeholder') is not. |
| `KN-069` | Narrow the KARNAMA_BOARD fence to a verifier-owned scratch directory | medium | 2 | agent | KN-065 | A KARNAMA_BOARD path in the temp tree but outside a karnama-prefixed scratch directory is refused, a path that is a hard link to a file outside the allowed roots is refused, the verifiers that use the override still work unchanged, and a test covers all three. |
| `KN-082` | Parse the capture as a tree, not with line patterns | medium | 2 | agent | KN-002 | The capture is parsed into a node tree, a nested ordinal-prefixed text node inside frame 505:3 does not change the copy-change count, an unclosed frame tag fails with a parse error rather than slicing to end of file, and both mutations are planted to prove it. |
| `KN-086` | Make the elevation checks order-aware and the regression exemption scoped | medium | 2 | agent | KN-004 | Swapping the two shadow columns of either elevation row fails the verifier, the sentence "Elevation/Card is the only elevation in the Figma file, as it used to be the only elevation documented" fails it, the paragraph that legitimately records the correction still passes, and the success line names elevation. |
| `KN-093` | Stop a later scoped ESLint block silently re-exempting a lingui hole | medium | 2 | agent | KN-087 | A config block scoped to src/shared/** that exempts aria-label makes agent/scripts/verify/KN-087.mjs fail, the check reads the resolved config for at least one path per top-level source folder, and the block being present is what the failure names. |
| `KN-105` | The no-raw-value test excludes src/theme, where a component with raw values lives | medium | 2 | web | KN-005 | The token modules are excluded by name rather than by directory, Tokens.stories.tsx is scanned and its raw values are gone, the scan also rejects rgb(), hsl() and named colours, and a planted violation in each covered form fails the run. |
| `KN-107` | Prove a system colour scheme change actually repaints the tree | medium | 2 | web | KN-005 | A test emulates a prefers-color-scheme change with the preference set to system and asserts the rendered background moved from the light value to the dark one, and it fails when the store returns a constant. |
| `KN-113` | Prove the portalled menu anchors correctly in RTL | medium | 2 | web | KN-006 | A story asserts the menu is anchored to the right of its trigger in RTL and to the left in LTR, and it fails when the direction is not propagated to the portal. |
| `KN-115` | The language names bypass the catalog entirely | medium | 2 | web | KN-006 | The language names come from the catalog with each locale name present in both catalogs as its own native spelling, the lingui rule sees them, and a missing one fails the catalog test. |
| `KN-117` | Re-triage severity, because 78 of 105 open cards are high | medium | 2 | agent | KN-001 | AGENTS.md defines each severity with a test a card can be held to, no level holds more than half the open board, and npm run todo -- validate reports the distribution so the next drift is visible. |
| `KN-121` | Remove the escape hatches in the API tests, and the comment that denies them | medium | 2 | api | KN-033 | No `as` and no eslint-disable under apps/api, the resolver test uses a stub the type system accepts on its own, and the claim in health.test.ts is true or gone. |
| `KN-125` | The seed builds SQL by concatenation and several values skip the quote helper | medium | 2 | api | KN-034 | Every value the seed writes goes through a parameter rather than into the SQL text, a seeded record containing an apostrophe and a backslash round trips intact, and the quote helper is gone. |
| `KN-130` | The no-data health reason is English copy outside the catalog | medium | 2 | web | KN-035 | No English sentence originates in apps/web/src/core, the empty-response case carries a code the component renders through the catalog, a network message still passes through untranslated, and the catalog test covers the new id. |
| `KN-137` | KN-128's verifier checks the exported type but never the exported document | medium | 2 | agent | none | Exporting a hand-built or widened document from apps/web/src/core/api makes the KN-128 verifier fail, proved by planting both cases, and the check that catches the widened one reads the document rather than its type, since the optional brand makes the type-level check unable to see it. |
| `KN-147` | Nothing proves the migration runner waits between lock attempts | medium | 2 | api | none | Deleting the retry delay makes the suite fail, proved by planting exactly that, and the test asserts elapsed time or scheduled timing rather than attempt count alone. |
| `KN-148` | The mutation harnesses re-run the whole suite once per regression | medium | 2 | agent | none | A verify that plants N regressions runs one full suite plus N filtered runs, and completes in under five minutes for KN-123, with every regression still caught, proved by running the harness before and after and comparing both the time and the caught count. |
| `KN-175` | Verifiers that need a scratch directory cannot run in the read-only review sandbox | medium | 2 | agent | none | The repository states, in AGENTS.md or RALPH.md, whether a verifier may require a writable scratch directory; verifiers that do are either made runnable in the review environment or carry a machine-readable marker saying they cannot be, and the roast prompt tells the reviewer which; and no future roast can raise this as a novel finding. |
| `KN-053` | README in both languages, tech debt and phase-next records | medium | 3 | docs | KN-051, KN-052 | Both readmes describe the product and the cuts and are accurate against the deployed app, TECH-DEBT.md has an entry per suppression with the check that retires it, and PHASE-NEXT.md records every deliberate cut. |
| `KN-059` | Decompose the board tool after ten rounds of patching | medium | 3 | agent | KN-001 | move() reads as a sequence of named guards none of which exceeds about fifteen lines, the argument parser exists once and both scripts import it, and every existing gate test still passes unchanged. |
| `KN-092` | Enforce the import conventions with a lint rule, and fix what already breaks them | medium | 3 | web | KN-003 | A file importing @mui/material/Button fails npm run lint, a file importing ../something fails it, no file under apps/web/src does either, and every folder with more than one file has an index.ts. |
| `KN-101` | Run destructive mutation verifiers in an isolated worktree | medium | 3 | agent | KN-088 | agent/scripts/verify/KN-088.mjs performs its mutation in a temporary git worktree, killing it mid-run leaves apps/web/vitest.config.ts byte-identical, and two concurrent runs both pass and leave the file byte-identical. |
| `KN-109` | Move apps/web/src to the folder structure AGENTS.md prescribes | medium | 3 | web | KN-003 | Every file under apps/web/src sits in core, pages, shared or locales, or is App.tsx or main.tsx, a check fails when a folder outside that set appears, and the whole gate still passes. |
| `KN-110` | Wire the lingui macro plugin so catalogs are extracted rather than hand written | medium | 3 | web | KN-006 | Components use the Trans and t macros with no explicit id, lingui extract produces the catalogs, the hand-written ones are gone, npm test and npm run build both pass, and TECH-DEBT entry 8 is removed. |
| `KN-129` | The duplicate-type scan only sees exported top-level declarations | medium | 3 | graphql | KN-035 | A local, unexported interface structurally identical to a generated type is detected in the web app, a differently named one is too, and an unrelated interface with some overlapping fields is not. |
| `KN-142` | Nothing checks that a tsconfig still covers what the bundler ships | medium | 3 | infra | none | Narrowing any workspace's tsconfig include so a file the bundler ships leaves the compiler program makes the gate fail, proved by planting exactly the health-only include a roast used, and the check derives the shipped files rather than listing them by hand. |
| `KN-143` | The mutation harnesses match test names in output, not test outcomes | medium | 3 | agent | none | A planted regression whose designated test still PASSES while some other test fails is reported as a MISS, proved by planting exactly that, and every verifier that plants regressions reads a machine-readable result rather than console text. |
| `KN-165` | Prove the roast recording path end to end with a stubbed reviewer | medium | 3 | agent | none | A verifier drives roast.mjs against a stubbed reviewer in an isolated repository, gets a genuine archive and manifest, records the round against a DONE task with todo.mjs roast, and asserts the round appears on the card; the stub is confined to the sandbox and no production path accepts it; and mutations to the manifest digest check are caught. |
| `KN-236` | The tooltip's attach check guesses a trigger's lateness with a timer and its props from one attribute | medium | 3 | web | none | A trigger that renders nothing for a second and then attaches correctly is never reported; one that renders DOM without taking the ref is reported however late it appears; a wrapper forwarding only the ref and aria-describedby is reported in a production build; each proved by a story, and the existing report stories still pass. |
| `KN-040` | Third-party feedback, stored for later evaluation | medium | 5 | api | KN-034 | A submission is stored with its target and a pending state, it never mutates the target, a submission whose target was deleted between submit and review is handled rather than orphaned, and rate limiting stops a flood from one source. |
| `KN-041` | Admin API: the moderation queue | medium | 5 | api | KN-040, KN-036 | A non-admin is refused every operation at the resolver, approving and rejecting both record who did it and when, and the queue paginates rather than loading everything. |
| `KN-064` | Third-party feedback submission surface | medium | 5 | web | KN-042, KN-040 | An anonymous visitor can submit a comment and a suggested change against a record, both arrive in the moderation queue in a pending state, the target record is not altered, the submitter is told it is pending review, and a flood from one source is rate limited. |
| `KN-047` | Admin panel screen | medium | 8 | web | KN-042, KN-041 | An e2e test signs in as an admin, approves one submission and rejects another, and sees both leave the pending queue, and a non-admin reaching the route is refused rather than shown an empty panel. |
| `KN-083` | Remove the em dashes the last DESIGN.md edits introduced | low | 1 | docs | KN-002 | No em dash appears in DESIGN.md, AGENTS.md, RALPH.md or STATE.md, and a check in the contract verifier fails when one is reintroduced. |
| `KN-102` | The gate-fixtures README describes a file and a mechanism that no longer exist | low | 1 | docs | KN-088 | Every file and mechanism the README names exists, no file in the directory is unmentioned, and a check in agent/scripts/verify/KN-003.mjs fails when a fixture is added or renamed without the README following. |
| `KN-106` | Localise the Storybook toolbar labels, or decide in writing that they stay English | low | 1 | web | KN-005 | Either the toolbar labels render from the catalog and a story proves it, or AGENTS.md states that Storybook chrome stays English with the reason and a check keeps product strings out of that directory. |
| `KN-122` | Prettier is named in the API scaffold and is in neither the scripts nor the gate | low | 1 | infra | KN-033 | npm run format:check fails on a deliberately misformatted file in each workspace, and both KN-003 and KN-033 verifiers run it. |
| `KN-133` | check-generated.mjs leaks a temp directory on every failure | low | 1 | graphql | none | Running the check against a deliberately invalid document leaves no karnama-codegen-* directory behind, proved by counting them before and after, and the same holds for the stale-file path. |
| `KN-135` | The graphql package's coverage thresholds pass on zero files | low | 1 | graphql | none | Either adding an uncovered file with real behaviour to packages/graphql makes npm test fail, proved by planting one, or the thresholds are gone and a comment says why coverage does not apply here. |
| `KN-138` | KN-128's verifier attributes compiler errors by substring, not by path | low | 1 | agent | none | A file elsewhere in the web app whose path ends with the probe's name is not counted as the probe, proved by creating one, running the verifier and removing it, rather than by editing the matcher and reasoning about it. |
| `KN-141` | NO_COLOR makes KN-131's verifier reject a correct compiler refusal | low | 1 | agent | none | The verifier passes with NO_COLOR=1 set, proved by running it that way, and the assertion names the planted file and the TypeScript error code rather than the source excerpt. |
| `KN-150` | KN-070's open-question check reads lines, not list items | low | 1 | agent | none | A wrapped bullet asking about رد شده makes the verifier fail, proved by planting one. |
| `KN-171` | The loop prompt fed by the Stop hook still teaches the old order | low | 1 | agent | none | .claude/ralph-loop.local.md states finish, prove, close, roast in that order, carries no fix-in-task rule, and describes the close gate as it actually is; a check asserts the prompt and RALPH.md do not contradict each other on the order; and a mutation reintroducing either stale rule fails that check with its own message. |
| `KN-172` | compact.py does the opposite of what the loop's compact step is for | low | 1 | agent | none | compact.py is gone; the loop skill's step 1 states plainly that compaction is the harness's to perform, that the agent cannot trigger it, and that the fallback is re-reading the rule files from disk; no instruction anywhere tells the agent to run a script that prints a context digest; and KN-161 is updated to reflect that the loop skill no longer ships a script. |
| `KN-187` | An em dash reached a rule file that forbids em dashes | low | 1 | docs | none | The em dashes written into markdown during this session are replaced with commas, in both projects, found with a Unicode-aware search so Persian text produces no false hit. |
| `KN-194` | The prompt-order source states things that are false, including that a mutation is impossible | low | 1 | agent | none | The false claims are gone from prompt-order.mjs, KN-190.mjs and the KN-190 plan file, replaced by what is actually true. readCommand('todo move <id> "done"') is a named check in the verifier, and disabling the tokeniser's quote handling makes it FAIL, proved by the mutation harness rather than asserted. STATE.md's positive-control line names mutation testing as a place it applies, since that is where it was missed. |
| `KN-198` | The required-card set is an unanchored constant, so shrinking the contract keeps the check green | low | 1 | agent | none | The verifier fails when a card carrying the canonical clause is not named by the registry, and fails when a named card does not carry it. Shrinking DECISION.cards to ['KN-043'] is a named failing case, run as a mutation against the real verifier rather than argued. Whether a single edit that removes the clause from a card AND drops that card from the registry can be caught is answered in the check's own header, honestly, including a plain no if that is the answer. |
| `KN-213` | The browser preflight does not stop KN-003, and KN-089 proves its order by reading source text | low | 1 | agent | none | Running KN-003.mjs with PLAYWRIGHT_BROWSERS_PATH pointed at an empty directory exits non-zero after the browser check alone, prints Chromium by name with the path and the command, and starts no lint, type-check or test process. KN-089.mjs proves that by RUNNING it that way rather than by reading its source, and a mutation that moves the preflight after lint, or discards its result, makes KN-089.mjs fail. A missing playwright package names npm install. |
| `KN-219` | KN-013's verifier reads the required states out of a prose sentence | low | 1 | agent | none | The required state list is read from a delimited, structured source that a reworded description cannot silently shorten, or KN-013.mjs refuses a description it cannot parse completely, proved by a description with a state added in a second sentence failing it. |
| `KN-232` | The docgen comment in .storybook/main.ts says any option replaces Storybook's defaults, which is false | low | 1 | web | none | The comment above reactDocgenTypescriptOptions in .storybook/main.ts states how the Vite docgen plugin and the component-manifest path actually treat user options, checked against the installed preset source, and the KN-229 verifier still passes. |
| `KN-237` | The Tooltip's children type rejects a trigger held as a plain ReactElement | low | 1 | web | none | A trigger typed as a plain ReactElement type-checks as the Tooltip's child, the merge of the trigger's own description still works and KeepsTheTriggersOwnDescription still passes, and no TypeScript escape hatch is used to get there. |
| `KN-240` | Nothing proves the theme's status colours come from the token set | low | 1 | web | none | A test asserts the light theme's status pairs are the token set's objects or equal to them key by key, and a mutation replacing one pair in buildTheme with a literal of the same value is caught by a check that the theme reads the token module rather than restating it. |
| `KN-256` | KN-088's verifier stopped proving its claim when KN-007 changed the unit include | low | 1 | web | none | node agent/scripts/verify/KN-088.mjs passes against the vitest.config.ts as it is now: emptying the unit include makes KN-003 fail because the unit project ran nothing, shown by its own output rather than a type error, and the constant check matches the include as written today. |
| `KN-268` | The catalog test's blank-translation check is weaker than the Input's blank rule | low | 1 | web | none | The catalog test and the Input decide blankness with the same predicate, moved to a module both can import without the i18n tests depending on an Input file, or the catalog test states and tests a deliberately different contract; either way a translation of only U+2800, U+034F or U+FE0F is caught by a planted case that fails the test. |
| `KN-277` | KN-273's verifier takes the question tool from the section's intro, not from the KN-273 paragraph | low | 1 | agent | none | The KN-273 paragraph itself says the answer came through the question tool, KN-273's verifier reads that from the paragraph rather than from the section, and its in-memory control that removes the phrase from the paragraph fails it. |
| `KN-278` | TECH-DEBT 16 retires on a text search, not on the English twin passing under Vitest | low | 1 | docs | none | TECH-DEBT 16's retirement check is behavioural: take the early return out of ControlsMatchTheCanvas and run ControlsMatchTheCanvasInEnglish under Vitest; the entry retires only when that passes, and the entry says so. |
| `KN-289` | KN-281's forced-colours check does not measure the tick's position, as KN-284's exit says it does | low | 1 | agent | none | KN-281's forced-colours check also opens the checked frame and asserts the tick at the same offset with forced colours on and off, or KN-284's exit is amended to name where that measurement lives. |
| `KN-299` | KN-286's verifier reads the first alert and textbox in the tree, not the ones of the field it types into | low | 1 | agent | none | KN-286's verifier resolves the described field's input and its own alert span through the DevTools protocol, reads the accessibility nodes whose backendDOMNodeId are theirs, and fails when either id is missing; a story order swapped, the bare field first, still reads the described field's nodes; and KN-286's and KN-298's verifiers pass. |
| `KN-054` | Turn the verify report into a failure once the debt is gone | low | 2 | agent | KN-001 | validate exits non-zero when any open task has no verify command, the message names them, and the board has none at the moment the change lands so the gate is green immediately rather than blocking every other task. |
| `KN-055` | Record where a task started, so a roast can diff the whole task | low | 2 | agent | KN-001 | Moving a task to in_progress records startHead, npm run roast with no --base diffs from that commit, a task spanning three commits shows all three in the prompt, and a test proves the prompt contains a change from the first of them. |
| `KN-066` | Apply contract exceptions per sentence, not per field | low | 2 | agent | KN-001 | Each of the three card wordings the reviewer supplied is rejected, a card that only records a prohibition is still accepted, the sidebar and fourth-tab decisions have staleness anchors, and a planted violation in one sentence of a multi-sentence field is caught. |
| `KN-067` | Recording an adjudication must not overwrite the last one | low | 2 | agent | KN-001 | Re-recording a round preserves the earlier adjudication as an entry in a history, the card shows the latest while the history remains readable, and a test proves an earlier filed list cannot be erased. |
| `KN-068` | Make verifyGate's revalidator mandatory, and test the real invocation | low | 2 | agent | KN-058 | verifyGate refuses to run without a revalidator, verifyGate with the real revalidator rejects bare node, node --version, a missing target and a symlinked target, and the KN-058 verifier runs to completion in a read-only working tree without writing into the repository. |
| `KN-074` | The harness stamps a round number that goes stale before it is recorded | low | 2 | agent | KN-001 | Two roast rounds run back to back can both be recorded, in order, with their own verdicts and filed lists, and a manifest that has already been recorded is still refused a second time. |
| `KN-076` | Let a settled open question be recorded as a decision, not only as a task | low | 2 | agent | KN-002 | An open-questions item written as a decision, with no task, passes agent/scripts/verify/KN-002.mjs; the same item with an invented decision whose text does not appear under the heading it claims still fails; a capturePending entry disposed of as a decision is held to the same standard; and closing KN-070 as decided leaves the verifier green. |
| `KN-080` | Bound the fix-in-task carve-out to once per task, and make the board enforce it | low | 2 | agent | KN-001 | A task whose roast rounds record a second fix-in-task is refused by move done with a message naming the first one, agent/RALPH.md states the bound in the same paragraph as the mechanical test, and a planted second carve-out on a scratch task proves the refusal fires. |
| `KN-144` | A NULL checksum in the ledger is adopted without proving the SQL ever ran | low | 2 | api | none | Adoption of a NULL checksum is either recorded in TECH-DEBT.md with what it does and does not prove, or gated behind an explicit acknowledgement, and a test covers whichever was chosen. |
| `KN-154` | KN-072 verifier accepts the two failures it exists to prevent | low | 2 | agent | KN-072 | KN-072.mjs parses the ACTUAL tab list out of the decision line and requires exactly the five names in it rather than searching a character window, and checks KN-030 placement on the stripped text with an affirmative un-negatable assertion. Both reproductions above are added as committed mutation cases and each fails the verifier with its own message. |
| `KN-163` | Adjudication is reported, not enforced, so findings can go unfiled forever | low | 2 | agent | none | KN-001 and KN-065 have their roast rounds adjudicated and re-recorded with what was filed, so the board carries no round whose findings were never judged. validate keeps REPORTING the count, which is how a regression becomes visible without refusing anything. |
| `KN-168` | KN-160's verifier passes on two blind spots it claims to cover | low | 2 | agent | none | The tree walk covers agent/ and every other directory, distinguishing a plan file from a plan-shaped one by its NAME rather than by which folder it is in; the instruction corpus is derived from a stated convention or from a registry that new instruction files must join, rather than from a hand-maintained list; and both blind spots are proved closed by mutations that currently pass and must then fail. |
| `KN-170` | An irreversible action must prove its rollback path before it runs | low | 2 | agent | none | AGENTS.md and agent/RALPH.md both carry the rule, naming the three git commands as the concrete instance and stating the general form; the wording makes clear it applies to any irreversible action and not only to deletion; and a check asserts both files carry it so it cannot quietly disappear the way the plan lifecycle rule did. |
| `KN-173` | rm destroys the card and its reason, so the terminal refusal promises something false | low | 2 | agent | none | A mis-closed card can be voided into a terminal tombstone that RETAINS the card, its reason and a link to its replacement; rm either keeps a record too or stops being named as the recovery route; the terminal refusal message describes what actually happens; and driving the real CLI proves the record survives. |
| `KN-174` | Extract the verifier sandbox builder, which has already diverged between two copies | low | 2 | agent | none | One sandbox builder in agent/scripts/verify/lib/, used by KN-159 and KN-162, with the fixtures either shared or requested explicitly by the caller; both verifiers still pass; and a check proves neither file builds a repository of its own any more. |
| `KN-177` | The global todo skill lets a closed task reopen, so SkipBureau's rule is honour-based | low | 2 | agent | none | The global todo skill refuses every transition out of done, naming the new-card route; re-closing is a no-op rather than an error; the refusal is proved by driving the real CLI against a throwaway database rather than by reading the source; a mutation removing the guard fails that check with its own message; and SkipBureau's board is unaffected apart from gaining the guard. |
| `KN-185` | Nothing establishes which prompt file the sibling Stop hook actually feeds | low | 2 | agent | none | The Stop-hook registration is traced to the exact prompt pathname it feeds, for both projects, and recorded where the next reader will find it; where a project's hook feeds a file nobody has been maintaining, that is filed; and the claim is supported by the resolved configuration rather than by the prompt's own text. |
| `KN-191` | The roast skill writes its transient result into the project, not a scratch directory | low | 2 | agent | none | The transient result file is written to a scratch location rather than into the project; roast-sessions.json stays project-local with its reason recorded; both halves agree on where and the parity test still passes; the gitignore entries for anything that no longer lands in the project are removed rather than left as fossils; and running a roast in a clean checkout leaves that checkout unchanged. |
| `KN-192` | A stale or inline marker masks the real block, so the marker is not yet a declaration | low | 2 | agent | none | The marker must be the only thing on its line, and there must be exactly ONE in a document; a second marker, an inline marker, and a stale marker above an old block with the real block unmarked are each reported by name; and each of the three is a case that fails before the change and passes after. |
| `KN-193` | The close recogniser is not the head token, so any command's arguments can be the close | low | 2 | agent | none | The close is recognised ONLY when the head token is todo, or npm with todo among its arguments, and the remaining tokens match the close shape; the roast is recognised only from UNQUOTED tokens. Each of these is a named failing case before the fix and passing after: grep todo move <id> done, env echo todo move <id> done, a cat heredoc whose body is a close, and grep "/tmp/roast.py" task. The end-to-end reproducer in this card returns ok false with the reason naming the order. The two places that interpret quotes agree, or there is one place. The legitimate shapes still pass: todo move <id> done, todo move <id> "done", npm run todo -- move <id> done, and python <path>/roast.py task --title ... & |
| `KN-197` | The order check parses shell badly instead of refusing the shapes it cannot parse | low | 2 | agent | none | There is ONE place that decides what is quoted. Command substitution, backticks and parameter expansion are REFUSED by name, as && and the semicolon already are, with a message saying the order cannot be read rather than guessing. A backslash before a quote is refused too, or handled by the single parser and proved. Both reproducers in this card are named failing cases before the fix and are refused after, each with a mutation that makes the case pass again. The real prompt's lines still resolve. |
| `KN-200` | The order check has never been run against a real loop prompt, and neither prompt carries the marker | low | 2 | agent | KN-171 | agent/RALPH.md and .claude/ralph-loop.local.md each carry exactly one marked block, and a verifier runs closesBeforeRoasting against BOTH real files by path rather than against a fixture, failing if either is unmarked, ambiguous or reversed. The check is proved by mutation on the real files: reversing the two lines in each prompt makes it fail, and removing a marker makes it fail with the unmarked reason. Any verifier that would pass when handed a file containing no marked block at all is a defect, and the check for that is named. KN-171's fix to the prompt's order lands with or before this, since a marked block that records the wrong order is worse than none. |
| `KN-251` | Nothing checks the Input's value control in the Controls panel follows what is typed | low | 2 | web | none | A check loads the whole Storybook, manager and preview, from a production build, sets value through the Controls panel's own field, types into the canvas, and reads the Controls panel's value field showing the typed text; and it fails with the binding taken out. |
| `KN-136` | Commit the mutation cases, so a verifier's claim can be re-run | low | 3 | agent | none | One command runs every committed mutation case and fails if any case does not apply or is not caught, proved by editing a verifier so a case stops applying and watching that command fail, and KN-128's eighteen cases are committed and pass. |
| `KN-145` | The migration guard cannot tell BEGIN ATOMIC from a transaction | low | 3 | api | none | A migration whose only BEGIN is a SQL-standard function body is applied, and a migration containing a real BEGIN alongside such a body is still refused, each proved by a planted case against PGlite. |
| `KN-188` | KarNama's board cannot record a finding as a child of the task it came from | low | 3 | agent | none | A KarNama card can be filed against the task it came out of, separately from its blockers; both are visible on the card and in the rendered board; move done reports what to roast and, when the last open child closes, names the parent and all its children; the one-level rule holds; and the whole thing is proved by driving the real CLI in an isolated repository rather than by reading the source. |

## Done (107)

| id | title | sev | pt | area | blocked by | exit condition |
| -- | ----- | --- | -- | ---- | ---------- | -------------- |
| `KN-087` | Stop the lingui rule exempting aria-label and title | critical | 1 | web | KN-003 | A component with aria-label="Delete this application" and one with title="Delete this application" both fail npm run lint, both are committed under src/gate-fixtures, and agent/scripts/verify/KN-003.mjs requires each to fail on the lingui rule by name. |
| `KN-196` | Decide how a card is dropped onto a column that is collapsed to a count | critical | 1 | design | none | DESIGN.md records the answer as a decision with who made it and when, covering hover-expand and its delay, whether a collapsed column accepts a drop, what the user sees after the drop lands, and what the keyboard path targets. Section 6 no longer lists it as open. KN-061's exit condition names the decided behaviour, and this card is removed as its blocker. |
| `KN-208` | KN-013 claimed five Figma states from five stories that are not the five states | critical | 1 | web | none | Every Figma state named on the card has a story, hover included, and hover is exercised with a real pointer rather than a dispatched event, since hover cannot be dispatched. KN-013.mjs checks the states by NAME against the card rather than counting stories, so adding a sixth story or renaming one cannot silently satisfy it. A mutation deleting the hover story fails it. |
| `KN-210` | The tooltip's drawn width is neither implemented nor checkable | critical | 1 | web | none | Either the component sets the width the frame actually specifies, from the frame rather than from the screenshot, or DESIGN.md records that the frame has no fixed width and that wrapping is content driven, with the component's reliance on a default stated where a reader will find it. A test pins whichever answer is true, so a MUI default change is caught rather than absorbed. |
| `KN-218` | The tooltip pads 12 where Figma pads 8 vertically, and draws no shadow where Figma draws one | critical | 1 | web | none | A story measures the open tip's computed padding as 8 top and bottom and 12 at each side, and its computed box-shadow as the value read from node 410:469; that value lives in the token set beside Card and Modal and is recorded in DESIGN.md's elevation table with the node it was read from; and a mutation restoring padding 12 on all sides fails the story. |
| `KN-220` | The Checkbox Hover story passes on its baseline alone if the test runner cannot load its pointer | critical | 1 | web | none | Under Vitest the Hover story imports the pointer API without a catch and fails loudly if it cannot, the published Storybook still renders it as a canvas with no error, and a mutation making the import fail under Vitest fails the story rather than passing it. |
| `KN-222` | The tooltip's 260 depends on the app's CSS reset, and the story finds the surface by its DOM position | critical | 1 | web | none | The tooltip surface sets its own box-sizing, and a story rendering it WITHOUT CssBaseline measures 260; the width story finds the surface by a marker the component puts on the tooltip slot itself rather than by DOM position; and a mutation removing the box-sizing fails the no-reset story. |
| `KN-224` | The tokens.ts lingui exemption has no TECH-DEBT record and nothing stops copy being added to the file | critical | 1 | web | none | TECH-DEBT.md has an entry for the tokens.ts exemption in the file's what, why, fix and retiring-check format, and a unit test fails if any string exported from src/theme/tokens.ts is not a design value, a colour, a length, a shadow or the font stack, proved by a mutation adding a copy string to the file. |
| `KN-225` | The Hover story tells Vitest from Storybook by an undocumented Vitest internal | critical | 1 | web | none | The story checks a flag this repository sets in the storybook project's Vitest setup, not a Vitest internal; the published Storybook still takes the canvas branch with no error; and a mutation removing the flag from the setup file fails the Hover story under npm test rather than passing it. |
| `KN-229` | The Tooltip's Controls table lost its children prop when its JSDoc went | critical | 1 | web | none | Storybook's docgen is configured with the same children rule as the guard, the other defaults it depends on kept; a production Storybook build reports children among the Tooltip's argTypes, checked from the built page rather than the config; and a mutation dropping the option makes that check fail. |
| `KN-239` | Two Status Chip stories ignore their args, so the Controls panel controls nothing | critical | 1 | web | none | Default renders from its args, so changing status, label or size in Controls changes the chip, asserted by a story that renders with non-default args; AllStatuses, a fixed matrix by design, disables the controls it cannot honour rather than showing them. |
| `KN-241` | The Input's focused-while-invalid border is an unrecorded invention, and its focus test checks one axis | critical | 1 | web | none | DESIGN.md records what a focused invalid field looks like and why; a story focuses an invalid field and asserts exactly that; the Focus story asserts the text keeps both its horizontal and vertical position when the border widens; and a mutation changing the focused-error border fails the new story. |
| `KN-242` | Most Input stories ignore their args, so the Controls panel controls nothing | critical | 1 | web | none | Default renders the Input from its args with the specimen copy as its defaults, a story with non-default args asserts the field follows them, and any story that is a fixed render by design disables the controls it cannot honour. |
| `KN-243` | The Input's Focus story measures the field's box, not its text | critical | 1 | web | none | The Focus story fails whenever focus changes anything that lays out the text inside the field: it asserts the input element's box and every computed property of the input are unchanged by focus, naming any property it exempts and why, and a mutation adding a focused-only text-indent to the input fails Focus by name. |
| `KN-246` | Changing defaultValue in the Input's Controls does not change the field | critical | 1 | web | none | Changing defaultValue in Controls after the story has rendered changes the text in the field: a check renders an Input story, changes the arg through Storybook's own arg update, and asserts the field shows the new value, and it fails with the fix taken out. |
| `KN-247` | The Input's interaction stories keep controls that make their play functions untrue | critical | 1 | web | KN-250 | Every Input story with a play function either reads its expectations from the active args or offers, through controls.include or by disabling controls, only the args its assertions follow; a check enumerates the stories and fails on one that offers any other control. |
| `KN-248` | Nothing checks the Input's placeholder stays put when an empty field takes focus | critical | 1 | web | KN-250 | A story focuses an empty Input and asserts that neither the input's layout nor its placeholder's computed style changes with focus, reading the placeholder through getComputedStyle(input, '::placeholder'), and a mutation adding a focused-only placeholder text-indent fails that story by name. |
| `KN-249` | Setting value in the Input's Controls freezes the field | critical | 1 | web | none | After value is set in Controls, typing into the field changes it and the value control follows what was typed, the story binding value through Storybook's args; or no story offers value. A check sets value through Storybook's own arg update on a built Storybook, types into the field, and asserts both the field and the story's args show the typed text, and it fails with the binding taken out. |
| `KN-250` | The document's direction and language are set after the first paint | critical | 1 | web | none | The document element's dir and lang are set in the commit that renders the tree, before paint, not in a passive effect: on a production Storybook build every story's play function starts with html dir and lang already matching its locale, recorded at the playing phase in both languages, and the Input's Focus story passes there; the built app, loaded with a stored English preference, has dir ltr by the time its first render's DOM exists; and a mutation back to useEffect fails the check. |
| `KN-252` | Resetting the Input's value control turns the same field from controlled to uncontrolled | critical | 1 | web | none | Switching the value control between set and unset starts the field over rather than changing its mode in place, so React never sees one input go from controlled to uncontrolled or back; a check in a development build, where React reports it, sets value, types, resets it, and finds no such report and a field showing its default again; a mutation removing the fix brings the report back. |
| `KN-254` | An empty error string puts the Input in its error state | critical | 1 | web | none | An error that is empty or only whitespace is no error: the field keeps its default border, is not aria-invalid, and shows its helper text; a story renders such an error and asserts all three; DESIGN.md or the component's story docs say the error state needs a message; and a mutation back to testing error against undefined fails that story by name. |
| `KN-258` | Changing defaultValue while value is set remounts the Input's field for nothing | critical | 1 | web | none | With value set, changing defaultValue in Controls leaves the same input element in place, still focused if it was, showing the same value; with value unset a new default still starts the field over; a check on a built Storybook does both, and a mutation back to keying on defaultValue in both modes fails the first. |
| `KN-259` | An Input error made only of invisible characters still turns the field red | critical | 1 | web | none | An error made only of whitespace and Unicode format characters is no error, while a message that merely contains them is still shown; BlankErrorIsNoError also renders an error of only a zero-width non-joiner and only a right-to-left mark and asserts they are no error, and a story with a real Persian message containing a ZWNJ still shows it; a mutation back to trim() fails the story by name. |
| `KN-261` | An Input error of only combining marks or blank symbols still turns the field red | critical | 1 | web | none | An error made only of whitespace, format characters, combining marks, variation selectors and the blank symbols named here is no error, while a real message containing any of them is still shown; the blank rule is defined once and tested at its boundaries, including each of those characters alone and each inside a real Persian message; and the comment says exactly what the rule covers. |
| `KN-262` | FromArgs copies the Input's blank-error rule instead of sharing it | critical | 1 | web | none | The blank rule lives in one module that the Input and its stories both import, with no second copy of the pattern anywhere under src; a unit test covers the rule's boundaries; and a mutation that widens the rule in that module changes what FromArgs expects without editing the story. |
| `KN-263` | The Status Chip centres its text with a 3px padding the spacing scale does not have | critical | 1 | web | none | The chip is the designed flex box again, centred by alignment with no vertical padding, and the name truncates with an ellipsis in an inner element; every story that measures the chip measures the chip, not the name; KN-238's verifier still passes with its mutations; and no padding or spacing in StatusChip.tsx resolves to anything but a spacing token or zero. |
| `KN-271` | The derived dark focus colour is 2.81:1 on the surface, below the 3:1 a focus indicator needs | critical | 1 | web | none | In the derived dark palette, border/focus and border/error each reach at least 3:1 against bg/page, bg/surface and bg/surface-secondary with their hue unchanged; darkMode.test.ts asserts all six ratios, and a mutation back to the unchecked derivation fails it; DESIGN.md's dark mode section says which borders are checked and at what ratio; and the Input's Focus state and the Checkbox's focus ring are seen in dark in both languages. |
| `KN-273` | The Input and the Checkbox are bounded by a 1.24:1 border, under the 3:1 WCAG 1.4.11 asks of a control's edge | critical | 1 | design | none | The owner has answered, through the question tool, whether the resting edge of an enabled Input and an unchecked Checkbox stays border/default as the file draws it or is raised to at least 3:1 against the surfaces it sits on; DESIGN.md records the answer as the owner's, with the date; and if it is raised, a card for the change exists. |
| `KN-276` | The selected Filter Chip is told apart by a 1.22:1 fill, under the 3:1 WCAG 1.4.11 asks of a state | critical | 1 | design | none | The owner has answered, through the question tool, whether the selected Filter Chip keeps the file's fill as its only sign of selection or gains one that meets WCAG 1.4.11 and 1.4.1, with the options and their trade named; DESIGN.md records the answer as the owner's, with the date; and if it changes, a card for the change exists that also covers KN-272's dark fill. |
| `KN-281` | The Checkbox frame draws a 1px edge where every state in the file draws 1.5 | critical | 1 | web | none | The Checkbox frame's edge is 1.5 in every state as the five variants of 204:11 draw it, painted inside the frame and taking no layout space; what a 1.5 edge renders as at device pixel ratios 1 and 2 is measured and recorded; the stories assert the width; and the comment that says the file draws every border at one is corrected. |
| `KN-284` | The Checkbox's forced-colours edge is a laid-out border, shrinking its frame's content box in that mode | critical | 1 | web | none | Under forced colours the Checkbox frame's edge is drawn over the frame without taking layout, a border on a pseudo-element for instance, so its content box stays 20 by 20 in that mode as in every other; KN-281's forced-colours check measures the content box and the glyph's position as well as the pixels, and a mutation back to a laid-out border fails it. |
| `KN-285` | Every Input on the file's screens turns its helper line off, while the Input always reserves it | critical | 1 | design | none | The owner has answered, through the question tool, whether an Input on a screen keeps its message line reserved as the component does or drops it as the 91 screen instances draw it, and where an error on a field with the line off is shown; DESIGN.md records the answer as the owner's, with the date; and if the line can be off, a card for the change exists. |
| `KN-288` | Under forced colours a disabled Checkbox draws the enabled edge, ButtonBorder, where GrayText says disabled | critical | 1 | web | none | Under forced colours a disabled Checkbox's edge is GrayText and every enabled state's is ButtonBorder, checked and indeterminate included; a check in a production build reads the rendered edge of all five states under forced colours, and a mutation giving disabled ButtonBorder again fails it; and DESIGN.md's stroke section says which colour each state takes there. |
| `KN-291` | An Input icon given as false or null draws an empty slot, moving the text as if an icon were there | critical | 1 | web | none | An Input given null, false, true or an empty string for either icon draws no slot and its text sits 16 from that edge, as with no icon at all; a story passes false for one icon and null for the other and asserts no slot and the 16, and a mutation back to the undefined check fails it by name. |
| `KN-292` | An Input icon given a blank string, a space or a zero-width character, still draws a slot with nothing in it | critical | 1 | web | none | An Input given a string icon that isBlank holds for, spaces, a line break, a zero-width space or a joiner, draws no slot and its text box sits 16 from that edge; IconsTurnedOff covers a space and a zero-width space among its cases and asserts no slot, and a mutation dropping the blank check fails it by name; and the story docs say the direct values draw no slot, while an element that renders nothing leaves a slot that collapses and takes no room. |
| `KN-297` | The Input's text measurement takes its direction from the input, so a placeholder with its own direction moves the text without failing a check | critical | 1 | web | none | textInsets and KN-266's production check refuse by name unicode-bidi plaintext on the input, which lets the content set the direction, a writing mode other than horizontal-tb on the input, and an input whose direction is not the field's; unicode-bidi plaintext on the input, a vertical writing mode on it, and the input set to the other direction, each present in every state, fail Default and the production check by name; and KN-283's verifier still passes. |
| `KN-298` | An Input's error replaced by another while the field has focus is not shown to reach its live region | critical | 1 | web | none | A story replaces one error with another on a focused Input, focus kept, and asserts the same alert holds the second error and the field is described by it; KN-286's verifier reads Chromium's accessibility tree after the replacement, the alert holding the second error, in both languages; and KN-286's plan says what is tested and that no check here hears a screen reader. |
| `KN-058` | Run verify commands without a shell | critical | 2 | agent | KN-001 | A verify command containing a shell operator is refused when set, an existing one is refused at close, the two current verifiers still run, and a deliberately failing verifier still blocks move done. |
| `KN-065` | move done must require a verify command | critical | 2 | agent | KN-001 | move done refuses a task with no verify command, the message names KN-054 as where the backfill happens, a task with a deliberately failing verify still cannot close, and validate reports the count of tasks lacking one. |
| `KN-088` | Prove the REAL test project reports a failure, not a separate config | critical | 2 | agent | KN-003 | The planted broken test is detected through the configuration npm test uses, and a mutation that empties the real unit project include makes agent/scripts/verify/KN-003.mjs fail rather than pass. |
| `KN-131` | Make the root build typecheck what it ships | critical | 2 | infra | none | Removing a selected field from the health operation and regenerating makes npm run build fail, proved by planting exactly that, and the failure names the consumer file rather than something incidental. Every workspace build either typechecks its own sources or the verifier records why it cannot. |
| `KN-162` | A closed task is still freely reopenable, so done does not mean done | critical | 2 | agent | none | move <id> in_progress, backlog, review or blocked all REFUSE when the task is done, and the refusal names the new-card route; dropped remains reachable if that is decided to be right; the refusal is proved by driving the real CLI in an isolated repository rather than by reading the source; and a mutation removing the guard fails the check with its own message. |
| `KN-181` | SkipBureau's active loop prompt fires the roast BEFORE the close, contradicting its own line | critical | 2 | agent | none | The command block in ../SkipBureau/.claude/ralph-loop.local.md closes before it roasts, matching its own prose; its step 1 says a false done is repaired by filing a card rather than by reopening; and a check covers BOTH that project's rule files rather than CLAUDE.md alone, so a contradiction between them fails rather than passing. |
| `KN-189` | Heading keywords pick the wrong block, so a reversed real block still passes | critical | 2 | agent | none | The normative block is identified by an explicit stable marker rather than by keywords in a heading; both fixtures the reviewer ran, an earlier step whose prose contains both words, and a real step whose heading uses different words, are covered as cases; and each fails before the fix and passes after. |
| `KN-190` | Command-shaped text inside a string counts as the command | critical | 2 | agent | none | The recognisers read a COMMAND rather than command-shaped text. The close is the head token of its line. The roast is matched among that line's tokens, because python <path>/roast.py task puts the roast in ARGUMENT position and an anchor would find nothing in the file this is written for. A quoted run stays ONE token, and a line whose head is a printer (echo, printf, cat) runs nothing, so a mention is not the command. The reviewer's echo fixture fails before the fix and passes after. A pipeline, a chain, a semicolon or a line continuation is REPORTED as unorderable rather than guessed at, and a single trailing ampersand is NOT, because backgrounding the roast is what the real prompt does. |
| `KN-201` | The docs guard only sees export const stories, so other valid CSF exports need no documentation | critical | 2 | web | none | The guard collects story names from every CSF export form: export const, export function, export class, and an export list. Each is a named failing case, planted in a real story file and run against the real guard, before the fix and passing after. A meta whose component is not a plain identifier is REPORTED rather than skipped, so the prop check never silently declines to run; if the component genuinely cannot be resolved, the guard says so and fails. The mutation that must survive: the existing export const stories keep working. |
| `KN-207` | The Checkbox breaks two standing repository rules: prose in the tsx, and no fn() on the callback | critical | 2 | web | none | Checkbox.tsx carries only comments that explain the code, and no prose that a Docs page prints; the prop descriptions live in story-docs, which already have them. onChange has an fn() in the shared args and a story asserts it is called with the event and the new checked value. A check catches a callback prop with no fn(), so this does not rest on remembering. |
| `KN-209` | The tooltip REPLACES an icon-only control's accessible name instead of describing it | critical | 2 | web | none | The tooltip DESCRIBES rather than labels: a trigger with its own aria-label keeps that name, and the tip is reachable through aria-describedby. A story asserts the computed accessible name of an icon-only trigger while the tip is open, and a mutation removing describeChild makes it fail. The case where the trigger has NO name of its own is decided deliberately and written down, because describing something unnamed leaves it unnamed. |
| `KN-211` | The tooltip accepts triggers it cannot actually attach to | critical | 2 | web | none | A trigger that does not forward props is either impossible to pass, by typing, or produces a clear failure rather than silence. A story covers a WRAPPER component trigger and not only a native button, and it fails if the wrapper stops forwarding. The Fragment case is handled or explicitly documented as unsupported. |
| `KN-227` | The token-file guard can be passed by a function, a Map, or copy assigned to fontFamily, and its retirement is a wish | critical | 2 | web | none | The guard reads every string literal in the SOURCE of src/theme/tokens.ts, not the runtime values, so a literal inside a function, a Map or any other construct is checked; the font stack is checked by value; mutations adding copy as a function return, as a Map entry and as the fontFamily value each fail it; and TECH-DEBT.md 13's retiring check is a condition a command can test, such as the three exemptions removed and npm run lint still green with every planted fixture failing. |
| `KN-231` | The tooltip's description appears only after the tip opens, so focus announces the trigger without it | critical | 2 | web | none | At the moment of keyboard focus, before the tip opens, the trigger already has an accessible description equal to the tip's text, asserted by a story that does not wait for the tip; the name is still the trigger's own; the same assertions run in fa-IR with the Persian name; and a mutation removing the always-present description fails the focus-time story. |
| `KN-233` | A trigger that takes the tooltip's ref but drops its event props is still silent in production | critical | 2 | web | KN-231 | A trigger that forwards its ref but drops its other props is reported in a PRODUCTION build as well as in development, proved by a story with such a wrapper checked on the production Storybook; a trigger that mounts after the first render is not falsely reported; a working trigger swapped for a broken one is reported; and the ReportsATriggerThatCannotAttach and KeepsTheTriggersName stories still pass. |
| `KN-235` | A trigger's own aria-describedby replaces the tooltip's description instead of joining it | critical | 2 | web | none | A trigger with its own aria-describedby keeps it AND gains the tooltip's, in that order, before and after focus, asserted by a story that checks the computed description contains both texts; no report is logged for it; the ref-only and cannot-attach reports still fire; and a mutation dropping the merge fails the story. |
| `KN-238` | A long renamed status name pushes the Status Chip out of its column | critical | 2 | web | none | A status name longer than its container is truncated with an ellipsis inside the chip, which never grows past its container; the full name stays readable by a screen reader; a story renders a long name inside a 276px container and asserts nothing overflows; and DESIGN.md records the decision. |
| `KN-244` | A focused invalid Input shows focus by one pixel of the same red | critical | 2 | web | KN-271 | A focused invalid field differs from the same field unfocused by at least a two-pixel perimeter changed at 3:1 contrast or more, the WCAG 2.4.13 measure the ordinary Focus state already meets; the field's border stays border/error so the error is still visible; the text does not move; DESIGN.md's section records the treatment, the measure and the reason; and FocusedWhileInvalid asserts it, with a mutation back to the one-pixel treatment failing that story by name. |
| `KN-245` | The Input's Controls show empty values while the canvas draws the specimen's copy | critical | 2 | web | none | With no control touched, every Controls value in the args-driven Input stories is what the canvas draws, label, placeholder and helper, in either language; changing one in Controls changes the canvas to exactly that value, and clearing the placeholder or helper removes it; a story asserts the rendered copy equals the args, and a mutation reintroducing a hidden fallback fails it. |
| `KN-253` | The Input's value binding loses keystrokes that arrive faster than Storybook's channel | critical | 2 | web | none | The field shows every edit as it happens and the arg follows without a stale value overwriting newer input: 20 keys typed with no delay all arrive in both the field and the arg, and a composition driven through the browser's own IME input ends with the composed text in both; a mutation back to the plain round trip loses keys again. |
| `KN-266` | The Input's border takes layout space, so its text sits a pixel inward of the file | critical | 2 | web | none | In every state the Input's text sits spacing/md, 16px, from the field's outer edge, as 95:5 and 95:19 draw it, with the stroke painted inside that padding and taking no layout space; no padding in Input.tsx is computed from a border width; the Default and Focus stories measure the text's distance from the edge at 16; and the other bordered components are checked for the same offset, each matching or carrying a card. |
| `KN-267` | The Input has no leading or trailing icon slot, which node 95:38 carries | critical | 2 | web | none | The Input takes an optional leading and an optional trailing icon, each 20 by 20 at spacing/2xs from the text in text/secondary, matching 95:38 with the icons on, in both directions; stories show each and both; and the label's boolean in the file is either honoured, with the accessible name then required another way, or the decision not to is recorded in DESIGN.md. |
| `KN-272` | In dark, a selected Filter Chip's text is 1.34:1 on its fill, and its pressed border 1.14:1 | critical | 2 | web | none | In the derived dark palette bg/brand/container is a dark tint of its own hue, derived as a fill the way the status containers are, text/brand clears 4.5:1 on it and border/focus clears 3:1 on it, and every pair the tests already hold still holds; darkMode.test.ts asserts both pairs as the Filter Chip draws them, and a mutation back to the surface derivation fails them; and the selected Filter Chip, resting and pressed, is seen in dark in both languages. |
| `KN-274` | The Input's focus ring for an invalid field sits outside a field that fills its container, so a host that clips at its edge removes it | critical | 2 | web | none | An invalid Input focused inside a host that clips its overflow flush at the field's edges still changes at least a two-pixel perimeter at 3:1, KN-244's measure, either because the change is drawn inside the field's own box or because the Input keeps the room itself; a story renders the field in an overflow hidden host with no padding and asserts, from the rendered geometry, that every pixel of the focus change lies inside every clipping ancestor, and a mutation back to a ring the host clips fails it by name; DESIGN.md's section says which; and the Checkbox's and the Filter Chip's rings are checked for the same, each matching or carrying a card. |
| `KN-280` | The bound Input takes a Controls value equal to an edit still in flight for its echo, and can stay apart from the arg | critical | 2 | web | none | Bound tells its own writes from anything else by a revision carried with each write, not by value, so an arg whose value is not the one sent at its revision is taken, whatever the queue holds; a check in a production build reproduces the sequence, an edit in flight, a Controls value equal to it arriving after a newer edit, and ends with the field and the arg equal; the exception is gone from the comment; the revision never reaches the Input or shows as a control; and KN-253's and KN-249's verifiers still pass. |
| `KN-282` | The Filter Chip's text sits at 13 where the file draws 12, and its pressed edge is 1 where the file draws 1.5 | critical | 2 | web | none | In every state the Filter Chip's text sits spacing/sm, 12px, from the chip's outer edge as 159:63 to 159:69 draw it, with the edge painted inside and taking no layout space; the pressed edge is 1.5 as 159:67 draws it; nothing in FilterChip.tsx computes a padding from a border width; the stories measure the text's distance from the edge; and the selected edge is left to KN-279. |
| `KN-283` | KN-266's text measurement reads the input's box, so a text-indent moves the text without failing a check | critical | 2 | web | none | The Input's stories and KN-266's production check measure where the text starts, the input's box edge plus its own padding, border and text-indent on the side the text starts from, given its direction and alignment, and read 16 as 95:5 draws it; a static text-indent, a padding on the input and a changed alignment, each present in every state, fail Default and the production check by name. |
| `KN-286` | An Input's error is not announced when it appears while the field has focus | critical | 2 | web | none | An error that appears on a focused Input is announced through a live region present before the error arrives, and the field keeps aria-invalid and its aria-describedby association; clearing the error restores the helper as the description or removes aria-describedby when there is none; a story asserts the live region's role and that it carries the error text after the error is set on a focused field, and a mutation removing the live region fails it by name. |
| `KN-001` | The loop, the board, and the tooling that runs them | critical | 3 | agent | none | "npm run todo -- validate" exits 0, "npm run todo -- next" names a task, agent/TODO_BOARD.md renders, "npm run roast" reaches Codex and archives a reply, and AGENTS.md plus DESIGN.md both exist with the Figma tokens transcribed. |
| `KN-002` | Read the Figma Documentations canvas and fold it into the contract | critical | 3 | design | KN-001 | DESIGN.md has a section per documentation frame, every open item in the file is either reflected in the board as a task or recorded as a decision, and the Job Record field list is written down. |
| `KN-004` | Read the remaining type scale and any missing tokens from Figma | critical | 3 | design | KN-001 | A named sweep of the Foundations canvas finds no token absent from DESIGN.md, every value in the DESIGN.md tables is traceable to a Figma node id, and the KN-001 verify script's type-scale check still passes. |
| `KN-005` | Theme: tokens, MUI theme, direction and colour scheme provider | critical | 3 | web | KN-003, KN-004 | A Tokens story renders every colour, spacing and radius token with its name and value, the theme switches light and dark and RTL and LTR from the Storybook toolbars, and a test asserts no component file contains a raw hex colour. |
| `KN-006` | lingui: English source catalog, Persian translation, runtime switch | critical | 3 | web | KN-003 | A bare string literal in a tsx file fails lint, the app defaults to Persian, switching to English flips direction and persists, the fa-IR catalog is 100 percent translated, and a test fails when it is not. |
| `KN-010` | Status chip, 9 statuses by 2 sizes, display only | critical | 3 | web | KN-005, KN-006, KN-007 | Nine statuses at both sizes match their Figma nodes, Size=M is used only where the design uses it, the chip has no tabindex and no click handler and a test asserts that, and the label is rendered from the STATUS RECORD rather than from the lingui catalog, so a status the user has renamed shows its new name. Only the five default names ship as catalog messages, as the seed values for a fresh account. |
| `KN-011` | Input, 6 states | critical | 3 | web | KN-005, KN-006, KN-007 | All six states match Figma, the error state shows border/error with text/error helper copy, the helper line reserves its space so the field does not jump when an error appears, and the label is bound to the input for screen readers. |
| `KN-120` | Make schema.gql a checked build artefact rather than a side effect of starting the server | critical | 3 | api | KN-033 | npm run build produces schema.gql without starting a server, the file is committed, and a check fails when the resolvers and the committed schema disagree. |
| `KN-128` | Generate typed GraphQL operations instead of asserting them by hand | critical | 3 | graphql | KN-035 | A query selecting a field that does not exist fails the build, the response type reflects the SELECTION rather than the whole object type, adding a required field to Health does not change HealthQueryData, and each is proved by a planted case. |
| `KN-034` | Prisma schema, Postgres on Supabase, and migrations | critical | 5 | api | KN-033 | Migrations apply to an empty database and to an existing one, the schema covers every field the Figma job record names, status history records every transition with its timestamp, and a seed script produces a realistic archive to develop against. |
| `KN-035` | GraphQL codegen wired both ways | critical | 5 | graphql | KN-003, KN-033, KN-120 | Changing the API schema without regenerating fails the build, the web app imports only generated types for GraphQL data, and no hand-written interface duplicates a generated one. |
| `KN-123` | The migration runner has no transaction, no lock, no failure state and no checksum | critical | 5 | api | KN-034 | A migration that throws halfway leaves the database unchanged and the ledger recording a failure, a second concurrent run waits rather than racing, an applied migration whose SQL changed fails the next deploy by checksum, and each of those is proved by a planted case against PGlite. |
| `KN-003` | Web app scaffold with the full quality gate | critical | 8 | web | KN-001 | On a clean checkout, lint, lint:tsc, test, build and build-storybook all pass in apps/web, and both a deliberately broken test and a deliberately unlocalized string fail the run when planted by hand. |
| `KN-033` | API scaffold: NestJS, GraphQL code first, and its quality gate | critical | 8 | api | KN-001 | lint, typecheck, test and build all pass in apps/api, the server starts, the GraphQL playground serves the schema, the health endpoint answers, and a missing required environment variable fails at startup with a clear message rather than at first request. |
| `KN-070` | Decide where رد شده belongs on the board | high | 1 | design | KN-002 | DESIGN.md records the answer as a decision with who made it, section 6 no longer lists it as open, and the column order in section 3 matches. |
| `KN-071` | Decide whether a contact needs an email or a phone | high | 1 | design | KN-002 | DESIGN.md records the answer as a decision, section 6 no longer lists it as open, and KN-031 and KN-039 state the resulting rule. |
| `KN-072` | Decide where status history belongs | high | 1 | design | KN-002 | DESIGN.md records the answer as a decision, section 6 no longer lists it as open, and KN-030 states where history renders. |
| `KN-100` | Make the gate-fixtures flag hermetic | high | 1 | agent | KN-088 | KARNAMA_GATE_FIXTURES=0 npm test passes and runs no fixture, the ordinary run inside agent/scripts/verify/KN-003.mjs passes with the variable set to any value in the parent environment, and both are proved by planted environments. |
| `KN-112` | Two preference setters called in one batch lose the first update | high | 1 | web | KN-006 | A test calls both setters in the same batch and both changes survive in the state and in what was written, and it fails against the current closure-based implementation. |
| `KN-114` | The catalog test counts an empty string as a translation | high | 1 | web | KN-006 | Setting any Persian message to an empty or whitespace-only string fails npm test and the failure names the id; so does setting one to its English id with the punctuation or casing changed, which is the next spelling of the same evasion and is named in this card's description; each is proved by planting it and watching the suite go red rather than by reading the checks. |
| `KN-132` | Pin the byte-compared generated files to LF, or stop comparing bytes | high | 1 | infra | none | A checkout with core.autocrlf=true passes npm run build and agent/scripts/verify/KN-128.mjs, proved by simulating that checkout rather than by reasoning about it, and .gitattributes covers every file any script compares byte for byte, derived from the scripts rather than listed by hand. |
| `KN-149` | The board cards for the rejected column do not require it to collapse | high | 1 | design | none | The cards that build the board name the collapsed-by-default count, the expand interaction, and رد شده's position after پیشنهاد کار in their exit conditions, and a check derives that from board.json rather than from a person having remembered. |
| `KN-151` | The design manifest still calls four settled questions open | high | 1 | design | none | node agent/scripts/verify/KN-002.mjs passes, the manifest records each settled question with the card that settled it, and re-opening any of them in the manifest without re-opening it in DESIGN.md still fails the check, proved by planting that. |
| `KN-152` | Use the current Contacts tab label in the history decision | high | 1 | design | KN-072 | DESIGN.md section 6 and section 3 name the modal tab افراد مرتبط, KN-030 and KN-045 use that label, KN-072.mjs requires it and REJECTS مخاطبین as the modal tab label, and a mutation restoring مخاطبین fails the verifier with its own message. |
| `KN-153` | Separate the owner-settled own-tab decision from the author-chosen tab ORDER | high | 1 | design | KN-072 | DESIGN.md marks the own-tab placement as owner-settled and the second position as an author proposal awaiting the owner, section 3 matches, and agent/scripts/verify/KN-072.mjs asserts the two are attributed separately so a mutation that moves the order back inside the owner block fails with its own message. |
| `KN-155` | KN-045 specified the modal arrangement KN-072 replaced, and the downstream sweep stopped short | high | 1 | web | KN-072 | KN-045 names five tabs with history in its own, its exit condition asserts WHERE history renders rather than only that it grows, and a check sweeps every OPEN card for the arrangement KN-072 replaced, refusing both the superseded tab count and any card that still puts the history block back where the owner took it from. This exit condition deliberately DESCRIBES those two shapes instead of quoting them: the sweep reads card prose, so a card quoting the banned wording is indistinguishable from a card instructing it, and this card would otherwise flag itself. |
| `KN-199` | KN-060 asks a reusable column component to own where the rejected column sits on the board | high | 1 | design | none | KN-043's exit condition names the rejected column's position after the offer column and its collapsed-to-a-count default; KN-060's names rendering collapsed to a count and expanding on click, and says nothing about where the column sits. KN-149's verifier requires the right clause of each card rather than one shared string, and a mutation that swaps the two clauses between the cards is caught. |
| `KN-204` | KN-201 closed on a verifier that never tested one of its own exit-condition clauses | high | 1 | agent | none | KN-201.mjs plants a meta whose component is not a plain identifier, at least the two real shapes memo(Thing) and an inline arrow, and requires the guard to FAIL naming the file; that case fails before the guard fix and passes after. The verifier no longer leaves a tracked file modified if it is killed mid-run, or the residual risk is stated in its header with the reason it is accepted. The as-Error cast is gone, replaced by an instanceof narrowing, and no cast of that shape exists in apps/web/src or apps/api/src, checked rather than assumed. |
| `KN-013` | Checkbox, 5 states | high | 2 | web | KN-005, KN-006, KN-007 | All five states match Figma, indeterminate is set through the DOM property rather than an attribute so it survives a re-render, and the control is reachable and toggleable by keyboard. |
| `KN-017` | Filter chip, doubling as the status counter | high | 2 | web | KN-005, KN-006, KN-007, KN-205 | Four states match Figma, the count updates with the filtered data, selecting and deselecting are both reachable by keyboard, and the selected state is announced rather than only shown. |
| `KN-032` | Tooltip | high | 2 | web | KN-005, KN-006, KN-007 | It matches Figma, appears on hover and on keyboard focus rather than hover alone, and does not trap the pointer. |
| `KN-089` | Make a clean clone able to run the gate without a manual browser download | high | 2 | infra | KN-003 | On a machine with no Playwright browsers, a documented single command brings the gate to green, agent/scripts/verify/KN-003.mjs reports the missing browser by name rather than failing opaquely, and the README says what to run. |
| `KN-094` | The token-name value exemption reaches aria-label and title | high | 2 | web | KN-087 | aria-label="delete/application" and title="delete/application" both fail npm run lint, a committed fixture holds both, the Foundations token story still passes, and agent/scripts/verify/KN-087.mjs requires the fixture by name. |
| `KN-095` | The stories-only title exemption covers every JSX title, not just meta.title | high | 2 | web | KN-087 | A story containing <Box title="Delete this application" /> fails npm run lint while the same file keeps its meta title App/Shell, a committed fixture holds both, and agent/scripts/verify/KN-087.mjs requires it by name. |
| `KN-159` | Close the task BEFORE the roast, and never let a finding reopen it | high | 2 | agent | none | move <id> done succeeds from in_progress with NO roast round recorded, provided the verify command passes, evidence is given and the worktree is clean; it still refuses from backlog; it still refuses when the verify command fails; roast accepts a done task; and RALPH.md documents finish, prove, close, roast in that order with findings always becoming cards. Proved by driving the real CLI in an isolated repository, not by reading the source. |
| `KN-160` | Plan files live beside the work, named #<id> - <title>.md | high | 2 | agent | none | agent/RALPH.md step 2b and ~/.claude/skills/loop/SKILL.md both instruct the #<id> - <title>.md name in the folder the work will be written to, no instruction anywhere still names .claude/plan-<id>.md, the existing plan for KN-112 has been moved to its work folder under the new name, and a check proves the loop files agree. |
| `KN-166` | Check the loop rules are written correctly in the SkipBureau project | high | 2 | agent | none | ../SkipBureau's loop and rule files state the finish, prove, close, roast order, the findings-become-cards rule with its blocking exception, and the plan-beside-the-work rule; anything that contradicts them is corrected or, where the difference is deliberate, recorded as deliberate with its reason; and the owner is told what was found and what was changed. |
| `KN-205` | The Checkbox hover and focus selectors reach the glyph, so the tick gets its own outline | high | 2 | web | none | The hover and focus rules are scoped to a marker the component owns rather than to a MUI class. Focusing a Checked and an Indeterminate checkbox outlines the FRAME ONLY, asserted by reading computed outline on every descendant and requiring exactly one to carry it. A mutation restoring the old descendant selector makes that assertion fail. The five Figma states still match tokens. |
| `KN-051` | Deploy the web app to GitHub Pages | high | 3 | deploy | KN-003 | The app loads at its Pages URL, a deep link to a route works on a hard refresh, Storybook is reachable at /storybook/, and the deploy runs from a push to main with no manual step. |
| `KN-161` | Give the roast, todo and loop skills BOTH a python and a node script | high | 3 | agent | none | roast, todo and loop each carry a python and a node entry point that produce the same behaviour on the same inputs, each SKILL.md documents both invocations, and a check runs both entry points of each skill and compares their observable result rather than asserting the files exist. |
| `KN-007` | Storybook docs infrastructure, in both languages, with its guard | high | 5 | web | KN-003, KN-006 | Adding a story with no markdown entry fails the guard test, a Docs page reads fully in Persian and fully in English, and planting a deliberately missing prop entry is caught. |
| `KN-184` | The order check reads the whole document, not the fenced block it claims to | low | 2 | agent | none | The check extracts the fenced code block belonging to the close-and-roast step and compares the order of the commands WITHIN it, so a document carrying an earlier correctly-ordered example and a reversed real block is reported rather than passed. |

## Dropped (2)

| id | title | sev | pt | area | blocked by | exit condition |
| -- | ----- | --- | -- | ---- | ---------- | -------------- |
| `KN-084` | Make the AGENTS.md section 5 gate runnable before any workspace exists | low | 1 | infra | KN-001 | npm run lint, npm run lint:tsc, npm test and npm run build each exit zero and say what they did on a clean checkout with no workspace directories, and each still fails honestly once apps/web exists and contains a failing check. |
| `KN-176` | KN-162 closed against an exit condition it deliberately did not meet | low | 1 | agent | none | KN-162's exit condition records the decision that done is terminal for every status including dropped, with the reasoning; a check refuses any OPEN card whose exit condition contains a hedge of that shape, if decided, if appropriate, or similar, so the next one cannot be written; and the check is proved by a card that currently passes and must then fail. |

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

- **status** done · **severity** critical · **points** 3 · **area** web
- **blocked by** KN-003, KN-004

tokens.ts holding the Figma token set as typed constants, theme.ts mapping them onto MUI, and AppThemeProvider owning both colour scheme (light, dark, system) and direction, swapping the Emotion cache for RTL and setting dir and lang on the document.

**Why.** Every component reads colour, spacing and radius from here, so it has to exist before the first one. It also has to own direction, because a component that gets direction from somewhere else will be laid out backwards in exactly one of the two languages.

**Exit condition.** A Tokens story renders every colour, spacing and radius token with its name and value, the theme switches light and dark and RTL and LTR from the Storybook toolbars, and a test asserts no component file contains a raw hex colour.

**Roasts.** round 1 scored 2.5 with 2 critical(s); round 2 scored 3 with 2 critical(s)

### `KN-006` lingui: English source catalog, Persian translation, runtime switch

- **status** done · **severity** critical · **points** 3 · **area** web
- **blocked by** KN-003

lingui configured with en-US as the source locale and fa-IR as the translation, the macro plugin wired into Vite, Storybook and both Vitest projects, the eslint lingui rule enforcing localized strings with type information, and a runtime locale switch that also flips direction.

**Why.** The rule is that message ids are English and Persian is a translation, and it only holds if the tooling enforces it from the start. Retrofitting localization onto components that were written with bare strings means touching every component again.

**Exit condition.** A bare string literal in a tsx file fails lint, the app defaults to Persian, switching to English flips direction and persists, the fa-IR catalog is 100 percent translated, and a test fails when it is not.

**Roasts.** round 1 scored 1.5 with 4 critical(s); round 2 scored 2 with 3 critical(s)

### `KN-007` Storybook docs infrastructure, in both languages, with its guard

- **status** done · **severity** high · **points** 5 · **area** web
- **blocked by** KN-003, KN-006

src/shared/story-docs with en/ and fa/ markdown per story, a loader that applies whichever language the Storybook toolbar is set to, and a guard test that fails when a prop or story has no entry, an entry names something that no longer exists, or the Persian side is missing what the English side documents.

**Why.** Documentation prose is banned from tsx files, so it needs somewhere else to live before the first component ships with a story. The guard is what stops the Persian side rotting into a stale copy of an older English page.

**Exit condition.** Adding a story with no markdown entry fails the guard test, a Docs page reads fully in Persian and fully in English, and planting a deliberately missing prop entry is caught.

**Roasts.** round 1 scored 2.8 with 1 critical(s)

### `KN-008` Icon set, 30 icons at 24 by 24

- **status** backlog · **severity** critical · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007

An Icon component rendering the 30 icons drawn at Figma node 239:44, each 24 by 24, 2px stroke, round cap and join, defaulting to text/secondary and overridable per instance. Sizes sm 16, md 20 and base 24 come from the token scale.

**Why.** Almost every other component contains an icon, so it blocks most of the component queue. Drawing them per component instead produces a set that drifts in weight and alignment, which is visible the moment two sit side by side.

**Exit condition.** Every one of the 30 named icons renders, a story shows the full grid, each is 24 by 24 with 2px round strokes, colour follows the prop and falls back to text/secondary, and a test asserts the exported set matches the list in DESIGN.md.

### `KN-009` Button, 3 sizes by 5 styles by 5 states

- **status** backlog · **severity** critical · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007

Sizes S, M and L, styles Primary, Secondary, Text, Destructive and Ghost, and states Default, Hover, Pressed, Disabled and Focus, built on MUI Button and restyled to Figma nodes 37:10, 33:58 and 37:71. 75 combinations in total.

**Why.** It is the most repeated control in the product and the one where a wrong radius or hover tone is most visible. Every screen and every modal uses it, so getting it exactly right once removes the question everywhere else.

**Exit condition.** All 75 combinations render from a single story driven by args, each matches the Figma node for that combination, Focus shows the border/focus ring on keyboard focus only, and Disabled is not reachable by keyboard.

### `KN-010` Status chip, 9 statuses by 2 sizes, display only

- **status** done · **severity** critical · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007

A display-only chip for the nine statuses at sizes S and M, from Figma node 82:2, taking base and container colours from the status token pairs. No click target and no focus ring, deliberately.

**Why.** Status is the spine of the product, so its visual language appears on every card, column header and filter. The design separates display from interaction on purpose, and merging them here would put a focus ring on every card on the board. The label is data rather than a translated constant, because a user can rename any status and a catalog cannot represent that.

**Exit condition.** Nine statuses at both sizes match their Figma nodes, Size=M is used only where the design uses it, the chip has no tabindex and no click handler and a test asserts that, and the label is rendered from the STATUS RECORD rather than from the lingui catalog, so a status the user has renamed shows its new name. Only the five default names ship as catalog messages, as the seed values for a fresh account.

**Roasts.** round 1 scored 5.4 with 0 critical(s)

### `KN-011` Input, 6 states

- **status** done · **severity** critical · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007

Text input with Default, Filled, Focus, Error, Disabled and Hover, from Figma node 95:38, with the label, helper and error line the design draws.

**Why.** Every form in the product uses it: add job, manual entry, contact, note, admin. An input whose error state was never built means the first validation failure has nowhere to render.

**Exit condition.** All six states match Figma, the error state shows border/error with text/error helper copy, the helper line reserves its space so the field does not jump when an error appears, and the label is bound to the input for screen readers.

**Roasts.** round 1 scored 5.4 with 0 critical(s)

### `KN-012` Select, option row and options menu

- **status** backlog · **severity** critical · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007

Select with Default, Filled, Focus, Disabled and Open from node 183:26, Option Row with Default, Hover, Selected and Disabled from 408:465, and the popover at 408:487. Includes the two domain selects the file draws, employment type and job level.

**Why.** The job record has enumerated fields, and the add and edit flows cannot be built without them. Hand-rolling a listbox is where keyboard support and screen reader semantics usually get lost, so this builds on the MUI primitive.

**Exit condition.** All five select states and all four option states match Figma, the listbox is keyboard navigable with arrows, Home, End and type-ahead, the open state traps focus correctly, and closing returns focus to the trigger.

### `KN-013` Checkbox, 5 states

- **status** done · **severity** high · **points** 2 · **area** web
- **blocked by** KN-005, KN-006, KN-007

Unchecked, Checked, Indeterminate, Hover and Disabled from Figma node 204:11, at 20 by 20.

**Why.** Bulk selection on the board needs it, and indeterminate is what a partially selected column header shows. A checkbox without an indeterminate state forces the header into a lie when some cards are selected.

**Exit condition.** All five states match Figma, indeterminate is set through the DOM property rather than an attribute so it survives a re-render, and the control is reachable and toggleable by keyboard.

**Roasts.** round 1 scored 5.4 with 0 critical(s)

### `KN-014` Icon button, 2 tones by 3 states

- **status** backlog · **severity** critical · **points** 2 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-008

Neutral and Danger tones, each with Default, Hover and Disabled, from Figma node 460:672, at 32 by 32 wrapping a 20px icon.

**Why.** Card actions, modal close and row menus all use it. It also has to carry an accessible name, because an icon-only control with no label is invisible to a screen reader.

**Exit condition.** Six combinations match Figma, every instance requires an accessible label and a test fails when one is missing, and the hit target is at least 32 by 32.

### `KN-015` Card, desktop and mobile, with the status stripe

- **status** backlog · **severity** critical · **points** 8 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-010, KN-008, KN-062

The job card at Figma node 137:44 with Default, Hover, Pressed, Selected, Static and Focus, the mobile variant at 491:751 with Default and Selected, and the 4px status stripe at 358:430 in all nine status colours.

**Why.** It is the product. The archive scenario is a list of these, and the whole value of the tool is that the list reads at a glance. The stripe is what makes status legible without reading, so its colour has to survive a status the user has renamed or deleted.

**Exit condition.** All six desktop states and both mobile states match Figma, the stripe renders the right colour for all nine statuses, a deleted or unknown status falls back to the new colour rather than rendering no stripe, and the card is keyboard focusable and activatable.

### `KN-016` Search bar, 3 states

- **status** backlog · **severity** critical · **points** 2 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-008

Default, Focus and Filled from Figma node 155:92, with the search icon and a clear affordance in the filled state.

**Why.** Finding one specific job opportunity in a growing archive is the second flow the design names. An archive you cannot search stops being useful at about the point it starts being valuable.

**Exit condition.** Three states match Figma, clearing restores the default state and returns focus to the field, and the input is debounced without dropping the final keystroke.

### `KN-017` Filter chip, doubling as the status counter

- **status** done · **severity** high · **points** 2 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-205

Default, Hover, Pressed and Selected from Figma node 159:71, carrying a count. On mobile it is the scrolling status chip bar that stands in for the columns; on desktop it is the counter and filter row.

**Why.** It is both the filter and the summary: how many are in each status is the answer to "where do I actually stand", which is the archive scenario in one line.

**Exit condition.** Four states match Figma, the count updates with the filtered data, selecting and deselecting are both reachable by keyboard, and the selected state is announced rather than only shown.

### `KN-018` Menu and menu item

- **status** backlog · **severity** critical · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-008

Menu Item with Default, Hover, Disabled and Destructive from node 181:22, and the two menus at 512:8350, Type=Status and Type=Card.

**Why.** Status management is inline through this menu, and the design gives it exactly three options: rename, change colour, delete. Reorder was removed. The card menu carries the destructive actions, and Destructive being a distinct drawn state means the design intends deletion to look different, not merely to be confirmed. The colour menu replaces the main menu rather than opening beside it.

**Exit condition.** All four item states match Figma, both menu types render, the menu closes on Escape and on outside click and returns focus to its trigger, and destructive items are distinguishable without relying on colour alone.

### `KN-019` Colour picker for the four custom status slots

- **status** backlog · **severity** critical · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007

The picker at Figma node 257:17, offering the four reserved custom status colour pairs rather than a free colour field.

**Why.** A user-defined status still has to read as a status, which is why the design reserves exactly four slots instead of a colour wheel. Building a free picker here would let a user choose a colour that collides with rejected or offer and quietly break the glance-readability of the list.

**Exit condition.** The picker offers exactly the four reserved pairs, matches Figma, marks the current selection, is keyboard navigable, and cannot produce a colour outside the reserved set.

### `KN-020` Status choice, status picker and status control

- **status** backlog · **severity** critical · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-010, KN-018, KN-019

Status Choice with Default, Hover and Selected from node 427:567, the Status Picker popover at 427:592, and Status Control with Default, Hover and Pressed at 199:21, which is the clickable wrapper the card uses around a display-only chip.

**Why.** Changing a status without opening anything is the core interaction of the organise scenario, whether by dragging a card between columns or by picking from the chip picker. The design deliberately keeps the chip inert and puts interaction in a wrapper, so this is where that separation is honoured or lost.

**Exit condition.** All three families match Figma, the control opens the picker, choosing a status closes it and reports the change, Escape cancels without changing anything, and the underlying chip still has no interactive attributes of its own.

### `KN-021` Page header

- **status** backlog · **severity** critical · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-009, KN-008

Title, optional back button and optional primary action, from Figma node 155:56 with the second instance at 155:72. Carries the language switch as a trailing action on mobile, per DESIGN.md section 4.

**Why.** Every screen has one, and it is where the language control lives on mobile: the tab bar carries the three drawn destinations and a fourth entry would change the design, so the switch belongs here instead.

**Exit condition.** Both drawn instances match Figma, the optional back and action slots each render and are each omittable, the language switch appears only at the mobile breakpoint, and the title is the page heading in the accessibility tree.

### `KN-022` Empty state and loading state

- **status** backlog · **severity** critical · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-009

Empty State at Figma node 159:80 for a job list with nothing in it, and Loading State at 159:92 for the extraction step in the add flow.

**Why.** The first thing a new user sees is the empty state, so it is the first impression of the product. The loading state covers extraction, and it also has to cover the Render free tier cold start, which can take about 50 seconds.

**Exit condition.** Both match Figma, the empty state carries a call to action that starts the add flow, and the loading state stays honest past 15 seconds rather than looking hung, which is the cold start case.

### `KN-023` Tabs

- **status** backlog · **severity** critical · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007

Tab Item with Default, Active and Hover from Figma node 204:20, and the tablist that composes them.

**Why.** The job detail modal has four tabs and the design puts the whole detail view behind them, so the modal cannot be built before this is.

**Exit condition.** Three states match Figma, the tablist follows the roving tabindex pattern with arrow key navigation, the active tab is announced as selected, and panels are associated with their tabs.

### `KN-024` Sort control

- **status** backlog · **severity** critical · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-018

Default, Hover and Open from Figma node 408:512.

**Why.** An archive that only grows needs an order the user chooses. The design permits exactly four: newest, oldest, nearest deadline, and company name alphabetically. Sorting by status is NOT one of them, because status is already the axis the board columns express.

**Exit condition.** Three states match Figma, the four permitted options are the only ones offered, the current sort is visible on the closed control, the menu is keyboard navigable, and changing sort is announced.

### `KN-025` Bulk action bar

- **status** backlog · **severity** critical · **points** 3 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-013, KN-009

Type=Jobs and Type=Contacts from Figma node 401:436, appearing when a selection exists.

**Why.** Managing an archive of hundreds means acting on many at once. Without it, cleaning up a stale search means opening every card.

**Exit condition.** Both types match Figma, the bar appears only when at least one row is selected, it reports the selection count, and it is reachable by keyboard when it appears rather than trapping focus behind the list.

### `KN-026` Contact card, full and compact

- **status** backlog · **severity** critical · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-008, KN-014, KN-062

Full and Compact layouts, each with Default, Hover and Selected, from Figma node 248:116. All contact information is on the card, the design gives it no detail view.

**Why.** A job lead is a person as often as it is a link. The design deliberately has no contact detail page, so everything has to fit on the card, which constrains what the contact record can hold.

**Exit condition.** Both layouts and all three states match Figma, every field the design draws is present, long values truncate rather than reflow the card, and email and phone are actionable links.

### `KN-027` Navigation: nav item, desktop sidebar, mobile tab bar, and the language switch

- **status** backlog · **severity** critical · **points** 8 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-008, KN-009

Nav Item with Default, Active and Hover from node 184:14, the sidebar at 185:11 which sits on the RIGHT on desktop, and the tab bar at 185:19 at the bottom on mobile. THREE destinations, per the Documentation canvas which supersedes the Components canvas annotation: فرصت‌های شغلی من (the board), افزودن فرصت شغلی, and شبکه من (the standalone network page). The language switch goes at the foot of the sidebar on desktop, per DESIGN.md section 4.

**Why.** It is the frame every screen sits in, and it is where the owner asked for the language button to go without disturbing the design. Getting the RTL side wrong here puts the sidebar on the wrong edge for the default language of the product.

**Exit condition.** The sidebar renders on the right in Persian and mirrors correctly in English, the tab bar replaces it at the mobile breakpoint, exactly three destinations exist and are named with the current terminology, the language switch changes locale and direction and persists, and no fourth tab bar entry was added.

### `KN-028` Modal shell, confirm, and change status

- **status** backlog · **severity** critical · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-009, KN-014

The modal shell with focus trap and Escape handling, Modal/Confirm at Figma node 150:92 for delete and archive, and Modal/Change Status at 150:93.

**Why.** Deleting a job opportunity is irreversible, and confirmation is the only thing between a user and losing part of their record. The shell also underpins the two larger modals, so its focus behaviour is inherited by both.

**Exit condition.** Both modals match Figma, focus is trapped and returns to the trigger on close, Escape closes, the backdrop click behaviour matches the design, and the dialog has an accessible name and is announced as a dialog.

### `KN-029` Add and edit job modal, all six steps

- **status** backlog · **severity** critical · **points** 8 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-011, KN-012, KN-028

The Add/Edit modal at Figma node 166:82 with Step=Paste, PasteFilled, Loading, Review, Manual and Error. Paste takes a link or the text of an ad, Loading covers extraction, Review shows the structured result for correction, Manual is the fallback, Error is the failure path.

**Why.** This is scenario 3, the organise scenario, in one component. It is also where the product makes its argument: the user pastes, and the product does the structuring. If Review is not correctable the extraction being wrong makes the record wrong permanently.

**Exit condition.** All six steps match Figma, every step is reachable in a story, Error offers Manual as the way out, Review is fully editable before saving, and leaving the modal mid-flow asks before discarding.

### `KN-030` Job modal, five tabs

- **status** backlog · **severity** critical · **points** 8 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-023, KN-028, KN-026, KN-020

The job detail modal at Figma node 210:276. The file draws four tab variants: Tab=Info 210:101, Tab=Note 210:145, Tab=Contacts 210:208, Tab=Files 210:275, each 720 by 617. The owner settled open item 18 on 2026-09-08 and status history is now its OWN tab rather than a block at the bottom of Info, so the modal has FIVE: اطلاعات آگهی, سابقه, یادداشت, افراد مرتبط, فایل‌ها, with سابقه second, directly after the information it is the history of. That is a deliberate departure from the frame, recorded in DESIGN.md section 3 and section 6 under KN-072. Everything else comes from the frame unchanged.

**Why.** The design replaced a detail page with this modal, so it is the only place the full record is visible. Status history is the record of the trail, which is the anchor of the whole product.

**Exit condition.** All FIVE tabs match Figma, the fifth being سابقه which the frame does not draw and which sits second, the modal opens from a card on the board, status history renders in its OWN tab in reverse chronological order rather than in the Info tab, and switching tabs does not lose unsaved note text.

### `KN-031` Contact modal, add and edit

- **status** backlog · **severity** critical · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-028, KN-011, KN-026

Mode=Add and Mode=Edit from Figma node 270:152.

**Why.** Contacts are added from inside the job modal, so this is how a person gets attached to an application. Edit exists because a phone number learned later is the common case.

**Exit condition.** Both modes match Figma, Edit is prefilled from the record, validation errors render in the Input error state, and cancelling discards without saving. A contact SAVES with a full name and nothing else: neither email nor phone is marked required and neither blocks submission, which is the owner's decision on KN-071 and is deliberately more permissive than the file's own note about a contact with no contact route.

### `KN-032` Tooltip

- **status** done · **severity** high · **points** 2 · **area** web
- **blocked by** KN-005, KN-006, KN-007

The tooltip at Figma node 410:469.

**Why.** Icon-only controls need a visible label on hover as well as an accessible one. It is small and nothing else blocks on it, which is why it sits at the end of the component queue.

**Exit condition.** It matches Figma, appears on hover and on keyboard focus rather than hover alone, and does not trap the pointer.

**Roasts.** round 1 scored 4.2 with 0 critical(s)

### `KN-033` API scaffold: NestJS, GraphQL code first, and its quality gate

- **status** done · **severity** critical · **points** 8 · **area** api
- **blocked by** KN-001

apps/api on NestJS with GraphQL code first, ESLint, Prettier, Jest or Vitest with coverage, a health endpoint, and configuration through environment variables with no secret committed.

**Why.** The web app cannot move past local fixtures without a schema to generate from, and the schema is the contract between the two halves. Building the gate with the scaffold is the same argument as on the web side.

**Exit condition.** lint, typecheck, test and build all pass in apps/api, the server starts, the GraphQL playground serves the schema, the health endpoint answers, and a missing required environment variable fails at startup with a clear message rather than at first request.

**Roasts.** round 1 scored 4.2 with 0 critical(s)

### `KN-034` Prisma schema, Postgres on Supabase, and migrations

- **status** done · **severity** critical · **points** 5 · **area** api
- **blocked by** KN-033

Prisma over Supabase Postgres. Models for user, job record, status, status history, contact, note, file reference, feedback submission, and the admin moderation state. Migrations checked in and runnable.

**Why.** The data model is the product: the trail is what compounds, so status history in particular has to be a first class table rather than a column that is overwritten. Getting it wrong later means a migration over real user data.

**Exit condition.** Migrations apply to an empty database and to an existing one, the schema covers every field the Figma job record names, status history records every transition with its timestamp, and a seed script produces a realistic archive to develop against.

**Roasts.** round 1 scored 3.5 with 2 critical(s)

### `KN-035` GraphQL codegen wired both ways

- **status** done · **severity** critical · **points** 5 · **area** graphql
- **blocked by** KN-003, KN-033, KN-120

packages/graphql holding the schema and the generated types, with codegen run from the API schema and consumed by the web app, plus a CI check that fails when the checked-in output is stale.

**Why.** The whole reason for a monorepo is that a schema change fails at typecheck rather than at runtime. Without the staleness check the generated types drift and the guarantee quietly disappears.

**Exit condition.** Changing the API schema without regenerating fails the build, the web app imports only generated types for GraphQL data, and no hand-written interface duplicates a generated one.

**Roasts.** round 1 scored 4 with 1 critical(s)

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

**Exit condition.** A contact, a note and a file can each be attached to a record and read back, deleting a record removes its attachments, and an upload larger than the configured limit is refused with a usable error rather than a 500. A contact with a full name and no email and no phone is accepted and read back unchanged: the data layer carries no NOT NULL and no check constraint requiring either, per the owner's decision on KN-071.

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

**Exit condition.** An e2e test seeds an archive, drags a card between two columns and sees the status change persist, filters and searches, selects several and acts through the bottom bar, and opens a card into the modal, all against the real API. The rightmost column is the first stage in Persian and the layout mirrors in English. رد شده is the last column, after پیشنهاد کار, and the board renders it collapsed to a count by default.

### `KN-044` Add job flow

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-042, KN-029, KN-037

The add route driving the modal through Paste, Loading, Review and save, with Manual and Error as the alternate paths, writing a real record.

**Why.** This is scenario 3, the organise scenario. It is the only way data enters the product, so if it is awkward the archive stays empty and nothing else matters.

**Exit condition.** An e2e test pastes a link, corrects a field in Review, saves, and finds the record on My Jobs with status New, and a second test takes the Error path into Manual and saves from there.

### `KN-045` Job detail modal, wired

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-043, KN-030, KN-038, KN-039

The FIVE-tab modal reading and writing real data. KN-072 settled that status history leaves the Info tab and gets its own tab, second, so the tabs are اطلاعات آگهی, سابقه, یادداشت, افراد مرتبط, فایل‌ها. Anyone building this card from its own text used to rebuild exactly the arrangement KN-072 rejected, because it said four tabs and its exit condition only asked that history GROW, never where it renders. The tab is افراد مرتبط, not مخاطبین: DESIGN.md renames it without exception, and the nav item مخاطبین became a different thing. KN-155 repaired this.

**Why.** It is where the trail is actually read. Status history in particular is the payoff of the whole data model, and this is the only place it surfaces.

**Exit condition.** An e2e test opens a card, changes its status, sees the history grow, adds a note and a contact, closes and reopens, and finds all of it still there. The modal renders FIVE tabs and status history renders in its OWN tab, second, NOT inside the info tab; the e2e test asserts where the history it watched grow actually appears, since a history that grows in the wrong place passes a test that only counts entries.

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

- **status** done · **severity** high · **points** 3 · **area** deploy
- **blocked by** KN-003

Build with the repository base path, publish to Pages on push to main, serve index.html as the 404 so client-side deep links work, and publish Storybook alongside at /storybook/.

**Why.** A deployed public page was one of the owner's pre-flight requirements, and the component library being reviewable at the same URL is what makes the component-first order legible to anyone else.

**Exit condition.** The app loads at its Pages URL, a deep link to a route works on a hard refresh, Storybook is reachable at /storybook/, and the deploy runs from a push to main with no manual step.

### `KN-052` Deploy the API to Render free, with Neon free Postgres

- **status** backlog · **severity** high · **points** 5 · **area** deploy
- **blocked by** KN-033, KN-034, KN-050

Deploy the API to Render free and the database to NEON free, not Supabase. The change from Supabase is forced by a fact rather than a preference, and it is recorded in DEPLOY.md so it is not re-litigated: Supabase pauses a free project after 7 days with no traffic and needs a manual unpause, which is exactly the traffic pattern a portfolio project has. Render's own free Postgres is worse: it EXPIRES 30 days after creation and the data is deleted after a 14 day grace period. Neon scales compute to zero but keeps the project reachable and does not expire. Render still hosts the API itself: free, no card, 750 instance-hours a month, sleeps after 15 minutes and wakes in about a minute, which DESIGN.md already requires the UI to handle honestly. render.yaml is committed at the repository root, so Render builds from the file rather than from form fields. It pins the free plan, the Frankfurt region, the workspace-aware build and start commands, autoDeploy on commit, NODE_ENV and WEB_ORIGIN. DATABASE_URL is sync false so the Neon pooled string is entered once in the dashboard and never committed. The remaining work needs a person, because creating the accounts does: sign in to Neon and Render with GitHub, create the project, connect the blueprint, paste the pooled connection string, and run the migrations once. DEPLOY.md has the exact steps. If it is to be automated instead, RENDER_API_KEY and NEON_API_KEY go in .env.deploy.local, which git check-ignore confirms is ignored by the *.local rule.

**Why.** The free tier sleeps after 15 minutes, so the first request after a nap takes about 50 seconds. That is a real user experience and it has to be designed for rather than discovered.

**Exit condition.** The API answers at its Render URL, the web app reaches it across origins with the CORS policy WEB_ORIGIN sets, migrations have run against the Neon database, and a deploy follows a push to main with no manual step. The database choice is recorded with its reason so it is not silently reverted to a provider that expires or pauses. A check proves the deployed API responds and that render.yaml still pins the free plan and carries no DATABASE_URL value.

### `KN-053` README in both languages, tech debt and phase-next records

- **status** backlog · **severity** medium · **points** 3 · **area** docs
- **blocked by** KN-051, KN-052

README.md and README.fa.md describing what the product is, what was deliberately cut and why, how to run it, and where it is deployed. TECH-DEBT.md and PHASE-NEXT.md started and kept current.

**Why.** The scope cuts are the most interesting decision in this project and the reasoning is currently only in a chat log. Writing down that crawling failed filter 4, rather than being merely unbuilt, is what stops it being re-proposed every month.

**Exit condition.** Both readmes describe the product and the cuts and are accurate against the deployed app, TECH-DEBT.md has an entry per suppression with the check that retires it, and PHASE-NEXT.md records every deliberate cut.

### `KN-054` Turn the verify report into a failure once the debt is gone

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** KN-001

KN-065 made a verify command mandatory to close and made validate REPORT how many open tasks lack one. This is the other half: once that count reaches zero, make validate FAIL on a task with no verify command rather than reporting, so the rule holds for cards filed in future rather than only for cards being closed.

**Why.** The original framing of this task, backfill a verifier onto every card, is superseded and would have been the wrong work: each task now writes its own verifier as part of being closed, because the close gate refuses without one. Writing sixty verifiers up front would mean writing each check before its work exists, and a check written that early describes what is easy to assert rather than what the task must prove. What is genuinely left is flipping the report to a failure, which can only happen once the count is zero, so this task waits for the board rather than driving it.

**Exit condition.** validate exits non-zero when any open task has no verify command, the message names them, and the board has none at the moment the change lands so the gate is green immediately rather than blocking every other task.

### `KN-055` Record where a task started, so a roast can diff the whole task

- **status** backlog · **severity** low · **points** 2 · **area** agent
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

- **status** backlog · **severity** critical · **points** 5 · **area** web
- **blocked by** KN-005, KN-006, KN-007, KN-010, KN-015, KN-018

The column itself, 300 by 684 from node 241:125: the 276 by 40 header carrying its status icon, its count and its menu trigger, the card slot, the column spacer, and the Add Card row pinned at the bottom as a plus only. Plus the Add Column tile at 241:34 labelled افزودن وضعیت, and the empty-column message. Composes Card, Status Chip at Size=M which is the only place the large chip is used, and Menu.

**Why.** Components before screens, and the column is a component the board screen composes rather than part of the screen. Building it inside the screen would mean its header, its empty state and its Add Card row never get reviewed in isolation, and the Size=M status chip has exactly one legitimate use which lives here.

**Exit condition.** The column renders with cards, with none, and at the mobile width, its header shows the live count, the Size=M chip is used only here, the Add Card row stays pinned at the bottom as the column scrolls, and every state matches its Figma node. A column can render COLLAPSED to a count instead of its cards, and expands on click; the board decides which column starts collapsed, this component does not know which one it is.

### `KN-061` Drag a card between columns, with a keyboard path

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** KN-060, KN-020, KN-269, KN-270

Dragging a card from one column to another changes its status, with the Drag and Drop Done states the design draws. Includes a keyboard-accessible alternative, since drag alone is unusable without a pointer, and the optimistic update plus rollback when the mutation fails.

**Why.** Moving a card between statuses IS the organise scenario, and it is the interaction the kanban form exists for. It is also the single most accessibility-hostile pattern in the product: a board that can only be operated by dragging excludes keyboard and screen reader users from the core action, so the keyboard path is part of the feature rather than a later improvement.

**Exit condition.** A card drags between two columns and the status persists, a failed mutation rolls the card back to its original column, the same move is achievable by keyboard alone, and the change is announced to assistive technology. Onto the rejected column collapsed to a count, as the owner decided on 2026-09-10, KN-196: during a drag it expands after a short hover of 500 ms; it accepts a drop while still collapsed; once the card lands it recollapses with a brief highlight, and only if the drag opened it, the count ticking up, the header flashing the rejected status colour for about a second and the move announced, Moved to Rejected with the count; a column the user opened stays open; a failed save returns the card with no highlight; and the keyboard path offers it as one target, announced with its count.

### `KN-062` Shared story fixtures

- **status** backlog · **severity** critical · **points** 3 · **area** web
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

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** KN-001

The contract checker exempts an entire card field when any part of it matches an allowed pattern. So a card reading On desktop, status is a dropdown; it is not a dropdown on mobile passes, and the same flaw defeats the sidebar and fourth-tab rules. Match and exempt at sentence level. Add the missing staleness anchors for sidebar-on-the-right and no-fourth-tab.

**Why.** An exception that covers a whole field means any card can be exempted from any rule by mentioning the prohibition somewhere in it, which is the easiest possible thing to do by accident when a card explains why a decision was made. A checker with that hole reports clean while the board drifts, which is worse than no checker because it is trusted.

**Exit condition.** Each of the three card wordings the reviewer supplied is rejected, a card that only records a prohibition is still accepted, the sidebar and fourth-tab decisions have staleness anchors, and a planted violation in one sentence of a multi-sentence field is caught.

### `KN-067` Recording an adjudication must not overwrite the last one

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** KN-001

Re-running roast against the same archive rebuilds and replaces that round, so the previous filed list, dismissal rationale, score and critical count are destroyed. Append an adjudication event to the round instead, keeping every recorded judgement in order, and render the latest while preserving the history.

**Why.** The board is meant to be the audit trail of what was reviewed and what the author accepted. Overwriting means an author can quietly lower criticals, swap a filed list for none, or erase that adjudication happened at all, and only the raw Codex reply survives to contradict it. The whole point of recording the adjudication separately from the reviewer verdict is that both are visible.

**Exit condition.** Re-recording a round preserves the earlier adjudication as an entry in a history, the card shows the latest while the history remains readable, and a test proves an earlier filed list cannot be erased.

### `KN-068` Make verifyGate's revalidator mandatory, and test the real invocation

- **status** backlog · **severity** low · **points** 2 · **area** agent
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

- **status** done · **severity** high · **points** 1 · **area** design
- **blocked by** KN-002

Frame 434:16 flags this with a warning and leaves it open: should the rejected status stay as the last column of the pipeline, or move off the board entirely? Get the decision from the designer or the owner, record it in DESIGN.md as a decision rather than a question, and update the column order and any card that assumes the current answer.

**Why.** It changes the board's column set, which is the main screen, so building the board while this is open means building something that may need re-ordering and re-testing. It is also cheap to settle now and expensive to settle after the drag-and-drop and column tasks are done.

**Exit condition.** DESIGN.md records the answer as a decision with who made it, section 6 no longer lists it as open, and the column order in section 3 matches.

**Roasts.** round 1 scored 6 with 0 critical(s)

### `KN-071` Decide whether a contact needs an email or a phone

- **status** done · **severity** high · **points** 1 · **area** design
- **blocked by** KN-002

Frame 434:2 says only a full name is required, and notes in the same breath that a contact with neither an email nor a phone has no contact route and is practically useless, leaving it for QA to decide whether one of the two becomes required. Get the decision, record it, and set the validation accordingly.

**Why.** It is a validation rule on a form that is already scheduled, so leaving it open means either building the permissive version and changing it later, or quietly choosing the strict one and calling it the design. The file explicitly asks for a decision rather than an assumption.

**Exit condition.** DESIGN.md records the answer as a decision, section 6 no longer lists it as open, and KN-031 and KN-039 state the resulting rule.

**Roasts.** round 1 scored 7 with 0 critical(s)

### `KN-072` Decide where status history belongs

- **status** done · **severity** high · **points** 1 · **area** design
- **blocked by** KN-002

The Components canvas flags this as its open item 18: status history currently sits at the bottom of the Info tab of the job modal, and the file says that is provisional. Get the decision on whether it stays there, becomes its own tab, or moves elsewhere, and record it.

**Why.** It is the payoff of the whole data model, since the trail is what the product is for, and it is currently placed by default rather than by choice. Building the modal around a provisional placement and moving it later means rebuilding a tab.

**Exit condition.** DESIGN.md records the answer as a decision, section 6 no longer lists it as open, and KN-030 states where history renders.

**Roasts.** round 1 scored 5 with 0 critical(s)

### `KN-073` Confirm the employment type and job level option lists

- **status** blocked · **severity** high · **points** 2 · **area** design
- **blocked by** KN-002

Frame 434:33 carries a red warning: the two enumerations came from the product owner and were never matched against jobinja.ir or jobvision.ir, because that environment's network blocked both. Check them against the real sources, or get the owner to confirm them as final, then remove the provisional marking.

**Why.** They are enum values that reach the database, the GraphQL schema and the Select components, so changing them after the schema exists is a migration rather than an edit. The design file marks them unconfirmed precisely so nobody treats them as settled.

**Exit condition.** DESIGN.md states the lists as confirmed with the source that confirmed them, section 6 no longer lists them as provisional, and KN-012 and KN-034 use the confirmed values.

### `KN-074` The harness stamps a round number that goes stale before it is recorded

- **status** backlog · **severity** low · **points** 2 · **area** agent
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

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** KN-002

agent/scripts/verify/KN-002.mjs recognises a "**Decided ...**" disposition when it parses an open-questions item, then discards that path: it requires a named board task, and requires the manifest to say that task owns the item, so an item settled with a written decision and no task is rejected. Citing the task that made the decision does not help either, because a closed task trips the "tracked by a closed task while still open" branch. Give a decision its own shape in the manifest and let the verifier accept it.

**Why.** The exit condition of KN-002 says every open item is "either reflected in the board as a task or recorded as a decision". Only the first can pass today, so KN-070 through KN-073 and KN-075 cannot be closed the way the contract says they may be: the moment one of them is decided and marked done, this verifier starts failing. Found by a roast as a major.

**Exit condition.** An open-questions item written as a decision, with no task, passes agent/scripts/verify/KN-002.mjs; the same item with an invented decision whose text does not appear under the heading it claims still fails; a capturePending entry disposed of as a decision is held to the same standard; and closing KN-070 as decided leaves the verifier green.

### `KN-077` Settle the two copy strings that frame 505:3 records as not yet applied

- **status** blocked · **severity** high · **points** 2 · **area** design
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

- **status** backlog · **severity** low · **points** 2 · **area** agent
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

- **status** done · **severity** high · **points** 2 · **area** infra
- **blocked by** KN-003

The exit condition of KN-003 says the gate passes on a clean checkout. It does not: the Storybook test project runs in real Chromium and Playwright downloads browsers in a postinstall that the owner allow-scripts policy blocks, so npm test on a fresh clone fails until someone runs npx playwright install chromium. Add an explicit, documented step that the gate itself runs or checks for, so the failure names the missing browser instead of looking like a broken suite.

**Why.** A roast rated this critical and it is a literal failure of the stated exit condition rather than a nitpick. It is also the first thing a new contributor or a CI job hits, and the error a missing browser produces does not say install a browser.

**Exit condition.** On a machine with no Playwright browsers, a documented single command brings the gate to green, agent/scripts/verify/KN-003.mjs reports the missing browser by name rather than failing opaquely, and the README says what to run.

**Roasts.** round 1 scored 4 with 1 critical(s)

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

- **status** done · **severity** high · **points** 2 · **area** web
- **blocked by** KN-087

The lingui rule ignores any value matching ^[a-z-]+/[a-z0-9-/]+$, added so a token name rendered as a label, bg/page, would pass. It applies to EVERY value, so aria-label="delete/application" and title="delete/application" both pass, verified by probe. Scope the exemption to where token names actually appear rather than to every string in the codebase, or drop it and localise the Foundations story labels.

**Why.** A roast rated this critical after finding it by probe. It is the third route into the same hole KN-087 closed twice: first the prop name, then a capitalised shape, now a lower-case one. The pattern across all three is an exemption written for one legitimate case that quietly covers every case, and the fix has to narrow the SCOPE rather than the pattern, or a fourth shape will be found.

**Exit condition.** aria-label="delete/application" and title="delete/application" both fail npm run lint, a committed fixture holds both, the Foundations token story still passes, and agent/scripts/verify/KN-087.mjs requires the fixture by name.

**Roasts.** round 1 scored 5 with 0 critical(s)

### `KN-095` The stories-only title exemption covers every JSX title, not just meta.title

- **status** done · **severity** high · **points** 2 · **area** web
- **blocked by** KN-087

The lingui block for *.stories.tsx exempts the property name title so a story meta can carry its sidebar path, App/Shell. ESLint matches the NAME wherever it appears, so <Box title="Delete this application" /> inside a story also passes, verified by probe, and that renders a real tooltip in Storybook. Exempt the meta object specifically, by shape or by position, rather than the property name across the whole file.

**Why.** A roast rated this critical. It is the same defect as the shape-based exemption it replaced, one level narrower: scoping to stories files was better than scoping to a value shape and is still too wide, because a story renders the same components a screen does and its JSX is not metadata.

**Exit condition.** A story containing <Box title="Delete this application" /> fails npm run lint while the same file keeps its meta title App/Shell, a committed fixture holds both, and agent/scripts/verify/KN-087.mjs requires it by name.

**Roasts.** round 1 scored 4 with 0 critical(s)

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

- **status** done · **severity** high · **points** 1 · **area** agent
- **blocked by** KN-088

vitest.config.ts reads Boolean(process.env.KARNAMA_GATE_FIXTURES), so any non-empty inherited value enables the deliberately failing fixture, including the string "0". agent/scripts/verify/KN-003.mjs spawns the ordinary npm test with the parent environment unchanged, so a CI job or a shell that has the variable set makes an ordinary run include a test designed to fail. Compare against the exact string "1" and scrub the variable explicitly for every run that is meant to be ordinary.

**Why.** A roast rated this major. A flag that changes what the test suite runs is dangerous by construction, and this one turns on for a value that reads as off. The failure it produces is the worst kind: a suite that fails for a reason nobody can find, in an environment nobody thought about.

**Exit condition.** KARNAMA_GATE_FIXTURES=0 npm test passes and runs no fixture, the ordinary run inside agent/scripts/verify/KN-003.mjs passes with the variable set to any value in the parent environment, and both are proved by planted environments.

**Roasts.** round 1 scored 5 with 0 critical(s)

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

### `KN-104` Give the product a colour scheme setting that persists

- **status** backlog · **severity** high · **points** 3 · **area** web
- **blocked by** KN-005

AppProviders takes a colorScheme preference of light, dark or system and resolves it, but nothing in the product sets it: main.tsx mounts with the default, so dark and system exist only through the Storybook toolbar. Put the choice somewhere the whole tree can reach, persist it, and give the user a control. The same shape is needed for the language switch, so build one mechanism and use it twice.

**Why.** A roast rated this critical and the reading is fair: a colour scheme nobody can choose is a colour scheme that does not exist outside Storybook. It is paired with the language button the owner asked for on the menu bar, and both need the same thing, a preference that survives a reload and is reachable from anywhere, so doing them together is cheaper than doing either alone.

**Exit condition.** A user can choose light, dark or system in the running app, the choice survives a reload, an e2e test proves both, and the same mechanism carries the language choice.

### `KN-105` The no-raw-value test excludes src/theme, where a component with raw values lives

- **status** backlog · **severity** medium · **points** 2 · **area** web
- **blocked by** KN-005

src/theme/noLiterals.test.ts skips the whole theme directory, because that is where hexes legitimately live. But Tokens.stories.tsx also lives there and it hardcodes 40, 16 and a 999 radius, which the no-raw-spacing rule forbids. Exclude only the files that are the token source rather than the directory, so a component that happens to sit next to them is still checked. The scan also misses rgb(), hsl() and named CSS colours, MDX, index.html inline styles and CSS files.

**Why.** A roast rated this major. The exclusion was written as a directory because that was easy, and the first component to sit in that directory is already breaking the rule the test exists to enforce. Every component folder will eventually hold a story next to a helper, so an exclusion by directory is the wrong shape from the start.

**Exit condition.** The token modules are excluded by name rather than by directory, Tokens.stories.tsx is scanned and its raw values are gone, the scan also rejects rgb(), hsl() and named colours, and a planted violation in each covered form fails the run.

### `KN-106` Localise the Storybook toolbar labels, or decide in writing that they stay English

- **status** backlog · **severity** low · **points** 1 · **area** web
- **blocked by** KN-005

The Language and Theme toolbars in .storybook/preview.tsx carry bare English strings, Language, Theme, Light, Dark (derived) and System, and the lingui rule does not reach .storybook because that directory is build configuration for a developer tool. Either route them through the catalog so a Persian reviewer sees Persian chrome, or record in AGENTS.md that Storybook chrome is English by decision, with the reason.

**Why.** A roast rated this major. The done gate asks every change to be reviewed in both languages, and the tool that review happens in is half English either way. It is a small thing that is either fine or not, and the cost of not deciding is that someone re-raises it every few months.

**Exit condition.** Either the toolbar labels render from the catalog and a story proves it, or AGENTS.md states that Storybook chrome stays English with the reason and a check keeps product strings out of that directory.

### `KN-107` Prove a system colour scheme change actually repaints the tree

- **status** backlog · **severity** medium · **points** 2 · **area** web
- **blocked by** KN-005

The tests around useSystemScheme register a listener, unregister it and resolve a preference, but nothing dispatches a media query change and then checks the rendered theme followed it. Add a story or a browser test that flips the emulated colour scheme with the preference set to system and asserts the page background changed.

**Why.** A roast rated this minor and it is the honest gap: what is tested is the plumbing around the subscription, not that the subscription does anything. useSyncExternalStore is exactly the kind of API where a wrong snapshot function still registers a listener and still never updates.

**Exit condition.** A test emulates a prefers-color-scheme change with the preference set to system and asserts the rendered background moved from the light value to the dark one, and it fails when the store returns a constant.

### `KN-108` Dark destructive controls fail contrast, because on-accent is one token for two fills

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** KN-005

theme.ts gives the single derived text/on-accent to both primary.contrastText and error.contrastText, and darkMode.ts walks that one value against the BRAND background only. On the derived error main it is 3.64 to one and on error hover 4.24, both under 4.5, so a dark destructive button is unreadable while the new contrast suite passes because it only checks blue. Derive a second on-accent for the danger fill, or make the walk take every background a token is used against.

**Why.** A roast rated this critical after recomputing every ratio, and it is the exact shape of the bug the contrast suite was written to catch, one level up: a token checked against one of its backgrounds and used against two. Destructive buttons are the ones where a misread is expensive, and the design has bg/danger/default and hover precisely so a delete looks like a delete.

**Exit condition.** Every derived contrastText clears 4.5 to one against every fill the theme pairs it with, a test enumerates those pairs from the theme rather than from a hand-written list, and it fails when a fill changes without its text following.

### `KN-109` Move apps/web/src to the folder structure AGENTS.md prescribes

- **status** backlog · **severity** medium · **points** 3 · **area** web
- **blocked by** KN-003

AGENTS.md fixes the layout as src/core for singletons, src/pages one folder per route, src/shared for components operations types and utils, src/locales for the catalogs, and says only these, with src itself holding App.tsx, main.tsx and the Storybook landing page. What exists is src/app, src/i18n, src/theme and src/gate-fixtures. Move i18n and theme into core, the catalogs into locales, App into src, and decide where gate-fixtures belongs since it is neither a singleton nor shared. Add a check so the next new folder cannot be invented.

**Why.** The structure was written down before any code existed and the first code ignored it, the same way the import conventions were ignored, and for the same reason: nothing checks. It matters now rather than later because the component queue is about to create thirty folders, and moving thirty is a different job from moving four. It pairs with KN-092, which adds the import lint, since both fixes touch every file.

**Exit condition.** Every file under apps/web/src sits in core, pages, shared or locales, or is App.tsx or main.tsx, a check fails when a folder outside that set appears, and the whole gate still passes.

### `KN-110` Wire the lingui macro plugin so catalogs are extracted rather than hand written

- **status** backlog · **severity** medium · **points** 3 · **area** web
- **blocked by** KN-006

Strings go through <Trans id="English sentence" /> and i18n._() with hand-written catalogs in src/i18n/locales. TECH-DEBT entry 8 records why: the macro transform needs @lingui/swc-plugin wired into @vitejs/plugin-react-swc, and that plugin is compiled against a specific swc ABI, so a mismatch fails the build for a reason unrelated to what was being built. Wire it, switch the components to the macro, run lingui extract into po files, and delete the hand-written catalogs.

**Why.** Message ids are written twice today, once in the JSX and once in the catalog, and only a test keeps them in step. The macro removes the second copy entirely and lingui extract keeps the catalog honest by construction, which is the difference between a rule and a habit. It is filed rather than done because the ABI risk is real and the runtime API already satisfies every clause of KN-006.

**Exit condition.** Components use the Trans and t macros with no explicit id, lingui extract produces the catalogs, the hand-written ones are gone, npm test and npm run build both pass, and TECH-DEBT entry 8 is removed.

### `KN-111` Forbid the message-id forms the catalog scan cannot see

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** KN-006

src/i18n/catalog.test.ts finds used ids with two regexes, <Trans id="..."> and i18n._(single or double quoted). <Trans id={"Delete this application"} />, a template literal, an identifier, or a reordered prop list all miss it, so the id never reaches the catalog and a Persian user silently gets the English fallback. Add the lingui rule that requires an explicit literal id, or a rule of our own that rejects a non-literal id, so the scan is sufficient BY CONSTRUCTION rather than by everyone happening to write it the same way.

**Why.** A roast rated this critical. The catalog test is what stands behind the claim that the Persian catalog is 100 percent translated, and a gate that only sees one spelling of a thing is a gate that measures spelling. The failure is silent and reaches the user, which is the worst combination: no error, no test failure, just English text on a Persian screen.

**Exit condition.** A Trans with a braced or template-literal id fails npm run lint, a committed fixture holds each form, and the catalog test still finds every id the codebase uses.

### `KN-112` Two preference setters called in one batch lose the first update

- **status** done · **severity** high · **points** 1 · **area** web
- **blocked by** KN-006

PreferencesProvider builds each setter over the locale and colorScheme captured in that render, so setLocale("en-US") followed synchronously by setColorScheme("dark") computes the second update from the stale locale: the state and the stored value both end up {locale: "fa-IR", colorScheme: "dark"} and the language change is gone. Use a functional state update and persist the value the updater computed.

**Why.** A roast rated this major and it is a plain correctness bug in new code. It is dormant only because there is one control today; the moment the settings surface offers both, a user changing two things at once loses one of them, and the symptom is a preference that sometimes does not stick, which is the hardest kind of bug to believe a report of.

**Exit condition.** A test calls both setters in the same batch and both changes survive in the state and in what was written, and it fails against the current closure-based implementation.

**Roasts.** round 1 scored 5.5 with 0 critical(s)

### `KN-113` Prove the portalled menu anchors correctly in RTL

- **status** backlog · **severity** medium · **points** 2 · **area** web
- **blocked by** KN-006

LanguageSwitch renders a MUI Menu, which portals out of the tree. The stories assert the items, their text and the accessible name, and never the geometry: nothing checks that the popover anchors to the right edge under direction rtl, which is the one thing a portal is most likely to get wrong because it renders outside the element that carries the direction. Assert the anchor position, or the computed direction on the portalled node, in both directions.

**Why.** A roast rated this minor and it is the design contract rather than a nicety: RTL is achieved with direction rtl and natural order, and a popover that escapes that is the classic way a right-to-left layout half works. Every component after this one that opens a menu or a dialog inherits whatever this proves.

**Exit condition.** A story asserts the menu is anchored to the right of its trigger in RTL and to the left in LTR, and it fails when the direction is not propagated to the portal.

### `KN-114` The catalog test counts an empty string as a translation

- **status** done · **severity** high · **points** 1 · **area** web
- **blocked by** KN-006

src/i18n/catalog.test.ts checks that every used id is a KEY in both catalogs and rejects only a Persian value exactly equal to its English id. Set a Persian message to the empty string and every test still passes, while the user sees nothing at all where a label should be. Reject empty and whitespace-only values, and reject a value that is the English id with punctuation changed, which is the next spelling of the same evasion.

**Why.** A roast rated this critical and it is the clause the whole test exists for: the exit condition says the fa-IR catalog is 100 percent translated and a test fails when it is not, and an empty string is not a translation. An empty label is also worse than an English one, because English text tells a Persian user the string was missed and a blank tells them nothing.

**Exit condition.** Setting any Persian message to an empty or whitespace-only string fails npm test and the failure names the id; so does setting one to its English id with the punctuation or casing changed, which is the next spelling of the same evasion and is named in this card's description; each is proved by planting it and watching the suite go red rather than by reading the checks.

**Roasts.** round 1 scored 7 with 0 critical(s)

### `KN-115` The language names bypass the catalog entirely

- **status** backlog · **severity** medium · **points** 2 · **area** web
- **blocked by** KN-006

src/i18n/index.ts holds locales as a plain object mapping fa-IR to the raw Persian string and en-US to English, and LanguageSwitch renders those values directly. They are user-facing strings in a .ts file that never go through lingui, which is the rule the whole gate exists for, and the lingui rule does not see them because it is a value in an object rather than a JSX literal. The RENDERED text must stay native, a reader who cannot read the current language has to find their own, but that is an argument about which translation to show, not an argument for having no catalog entry.

**Why.** A roast rated this major and the distinction is the right one: the self-naming exception explains why the text is not translated, it does not explain why it is invisible to the catalog. As written, the two strings a language switch shows are the only user-facing strings in the product that nothing checks.

**Exit condition.** The language names come from the catalog with each locale name present in both catalogs as its own native spelling, the lingui rule sees them, and a missing one fails the catalog test.

### `KN-116` Move the language switch out of the placeholder shell into the drawn chrome

- **status** backlog · **severity** medium · **points** 1 · **area** web
- **blocked by** KN-006

LanguageSwitch currently renders in App.tsx under the placeholder heading, with the sidebar placement on every breakpoint. DESIGN.md puts it at the bottom of the sidebar 185:11 on desktop and in the Page Header 155:56 as a trailing action on mobile, and says nothing else moves. Move it when those exist, choose the placement responsively, and delete the temporary block and its comment from App.tsx.

**Why.** A roast rated this major and it is right that the shell placement is not one of the two approved homes. It was put there deliberately, because a control only Storybook renders cannot show that a choice persists, and because the shell is itself a placeholder rather than a drawn frame, so nothing drawn is being reflowed. That reasoning expires the moment the sidebar exists.

**Exit condition.** The switch renders at the bottom of the sidebar on desktop and as a Page Header trailing action on mobile, App.tsx contains no language control, and an e2e test finds it in both places at the two drawn viewports.

### `KN-117` Re-triage severity, because 78 of 105 open cards are high

- **status** backlog · **severity** medium · **points** 2 · **area** agent
- **blocked by** KN-001

The selection law orders by severity, then points, then id. 78 of the 105 open tasks are high, 3 are critical, 21 medium and 3 low, so severity has stopped discriminating and the law is effectively picking by points and id. Most of the high ones arrived from roasts, where high was the honest rating of a finding in isolation and is not its rating against the other 77. Re-rate the board against a written definition of each level, and add that definition to AGENTS.md so the next fifty findings do not repeat it.

**Why.** The whole point of the law is that the script picks rather than the author, and a board where four fifths of the work shares one severity hands the choice back to whoever wrote the points. It also hides the genuinely urgent: three criticals are invisible in a list of seventy-eight highs. Found by looking at the distribution rather than at any one card.

**Exit condition.** AGENTS.md defines each severity with a test a card can be held to, no level holds more than half the open board, and npm run todo -- validate reports the distribution so the next drift is visible.

### `KN-118` Health says ok while the database is unreachable, and the URLs are only checked for emptiness

- **status** backlog · **severity** high · **points** 3 · **area** api
- **blocked by** KN-033

src/config/env.ts requires DATABASE_URL and WEB_ORIGIN to be non-empty strings and nothing more, so DATABASE_URL=not-a-postgres-url and WEB_ORIGIN=not a URL both start the service. Nothing connects to the database at any point, so the health query answers ok against a database that does not exist. Validate both as URLs with the schemes they must have, and make health a readiness check that reports the database separately from the process.

**Why.** A roast rated this major twice over and it is the deploy failure this whole config file was written to prevent, one level deeper: the point of requiring DATABASE_URL before listening is that a server which starts without a database and fails on the first query is worse than one that refuses to start. As written it starts and then reports itself healthy, which is the same failure with a green light on it.

**Exit condition.** A malformed DATABASE_URL or WEB_ORIGIN fails at startup and names which, the health query reports the database separately from the process, and it does not say ok when the database cannot be reached, proved against a URL pointing at a closed port.

### `KN-119` Nothing tests CORS, the port binding or the startup path

- **status** backlog · **severity** high · **points** 3 · **area** api
- **blocked by** KN-033

vitest.config.ts excludes src/main.ts from coverage, which is where CORS is configured, the port is bound and the CLI failure path lives. So the 100 percent figure is reported over a file set that omits the only code a deploy actually depends on, and a change to the allowed origin, to credentials, or to origin: true would keep the gate green. Export the parts of bootstrap that can be tested without listening, test the CORS options object directly, and add a preflight test against the running server in the probe.

**Why.** A roast rated this major. The excluded file is not an uninteresting one: origin: true instead of the configured value is the difference between a CORS policy and the absence of one, and it is a one-word edit that nothing would catch. The exclusion was written for the right reason, main.ts starts a real server, and the wrong conclusion was drawn from it.

**Exit condition.** A preflight from an unexpected origin does not receive that origin back, a test covers the CORS options and the port resolution without binding a port, main.ts is no longer excluded from coverage wholesale, and changing origin to true fails the run.

### `KN-120` Make schema.gql a checked build artefact rather than a side effect of starting the server

- **status** done · **severity** critical · **points** 3 · **area** api
- **blocked by** KN-033

autoSchemaFile writes schema.gql to process.cwd() when the application boots, and the file is gitignored. npm run build runs tsc only, so a fresh clone has no schema, and packages/graphql is supposed to generate the client types from it. That means the contract between the two halves can only be regenerated by someone able to boot the server with a full environment and a writable directory, and nothing can fail a build because the schema changed and the client types did not. Generate it in a build step, commit it, and add a check that the committed file matches what the resolvers produce.

**Why.** A roast rated this major and it is the load bearing one for everything after: KN-035 generates types from this file both ways, and a generated artefact that is neither committed nor reproducible is a contract nobody can diff. The one thing a code-first schema is for is that the server cannot disagree with the client, and that only holds if the file is checked.

**Exit condition.** npm run build produces schema.gql without starting a server, the file is committed, and a check fails when the resolvers and the committed schema disagree.

**Roasts.** round 1 scored 3.5 with 2 critical(s); round 2 scored 4 with 2 critical(s)

### `KN-121` Remove the escape hatches in the API tests, and the comment that denies them

- **status** backlog · **severity** medium · **points** 2 · **area** api
- **blocked by** KN-033

src/health/health.resolver.test.ts casts a fake object through unknown to ConfigService twice, and src/config/env.test.ts carries an eslint-disable for no-dynamic-delete with a cast beside it and no TECH-DEBT entry. AGENTS.md bans both, and TECH-DEBT is where anything suppressed is supposed to be recorded. Worse, a comment in health.test.ts says an `as` there "would be the first one in the repository", which was already false when it was written. Build a real ConfigService or a typed stub that satisfies the contract, drop the disable, and correct the comment.

**Why.** A roast rated these minor and they are, individually. Together they are the pattern the whole ban exists to stop: a cast in a test masks whether the mock satisfies the dependency it stands in for, so the test passes and the wiring is unproven. And a comment asserting the rule is kept, in a file next to two violations of it, is the thing that makes the next reader stop checking.

**Exit condition.** No `as` and no eslint-disable under apps/api, the resolver test uses a stub the type system accepts on its own, and the claim in health.test.ts is true or gone.

### `KN-122` Prettier is named in the API scaffold and is in neither the scripts nor the gate

- **status** backlog · **severity** low · **points** 1 · **area** infra
- **blocked by** KN-033

The KN-033 card says the scaffold includes Prettier. apps/api has no format or format:check script, the root .prettierrc is never applied to it by any command, and agent/scripts/verify/KN-033.mjs does not run it. A badly formatted API file passes every gate. Add the script, add it to the verifier, and do the same for apps/web, which has the same gap.

**Why.** A roast rated this minor. It matters slightly more than it looks because the web workspace has the same hole, so nothing in this repository actually enforces formatting anywhere, while both cards claim it. A formatter that is configured and never run is a configuration file pretending to be a rule.

**Exit condition.** npm run format:check fails on a deliberately misformatted file in each workspace, and both KN-003 and KN-033 verifiers run it.

### `KN-123` The migration runner has no transaction, no lock, no failure state and no checksum

- **status** done · **severity** critical · **points** 5 · **area** api
- **blocked by** KN-034

src/database/migrations.ts runs each migration and writes its ledger row as separate statements. A migration that fails halfway leaves partial DDL with no ledger row, so the next deploy replays it and fails permanently on the CREATE TYPE that already exists. Two runners racing can both see "not applied". An applied migration edited afterwards is silently skipped, because nothing records a checksum. Wrap each migration and its ledger row in one transaction, take an advisory lock for the run, record a failed state rather than nothing, and store a checksum that is compared on every deploy.

**Why.** A roast rated this critical and named the exact sequence. It is the single thing here most likely to cost real data: the first time a migration fails against Supabase, the retry makes it worse rather than better, and the recovery is manual SQL against a production database. Prisma migrate deploy solves all four and the runner exists only because Prisma 7 wants a live database at generate time, which is a smaller problem than this one.

**Exit condition.** A migration that throws halfway leaves the database unchanged and the ledger recording a failure, a second concurrent run waits rather than racing, an applied migration whose SQL changed fails the next deploy by checksum, and each of those is proved by a planted case against PGlite.

**Roasts.** round 1 scored 5 with 2 critical(s); round 2 scored 5 with 1 critical(s); round 3 scored 4 with 2 critical(s); round 4 scored 4 with 2 critical(s)

### `KN-124` Status history is documented as immutable and nothing enforces it

- **status** backlog · **severity** high · **points** 3 · **area** api
- **blocked by** KN-034

The schema comment says history is appended and never rewritten, and the verifier checks that StatusHistory has no updatedAt. Neither stops anything: the application role can UPDATE or DELETE rows in status_history like any other table. Enforce it, with a rule or a trigger that rejects UPDATE and DELETE except through the cascade from its job record, or with a role that lacks those grants, and change the comment to describe what is enforced rather than what is intended.

**Why.** A roast rated this critical. The trail is the product: DESIGN.md says the value is the trail rather than the listing, so a history table anyone can edit is the one table where a silent write is worth catching. The absence of an updatedAt column is a statement about intent that reads like a guarantee, which is the kind of claim this repository has been wrong about before.

**Exit condition.** An UPDATE or a DELETE against status_history is rejected by the database, deleting a job record still removes its history through the cascade, and both are proved against PGlite.

### `KN-125` The seed builds SQL by concatenation and several values skip the quote helper

- **status** backlog · **severity** medium · **points** 2 · **area** api
- **blocked by** KN-034

src/database/seed.ts has a quote helper that doubles apostrophes, and the note, the contacts, the feedback body, the user name and the phone are interpolated as raw literals instead. Nothing in the current data contains an apostrophe, so it works; a contact named O Brien or a feedback body containing we are, spelled with the apostrophe, breaks the statement. Doubling apostrophes is also only correct while standard_conforming_strings is on. Use parameters rather than interpolation throughout.

**Why.** A roast rated this minor and it is, until someone edits the seed. The failure is a syntax error from Postgres pointing at generated SQL, which is a bad ten minutes for whoever is just trying to add a row. Parameters remove the whole class rather than the current instance.

**Exit condition.** Every value the seed writes goes through a parameter rather than into the SQL text, a seeded record containing an apostrophe and a backslash round trips intact, and the quote helper is gone.

### `KN-126` Assert there is exactly one graphql in the dependency tree

- **status** backlog · **severity** medium · **points** 1 · **area** api
- **blocked by** KN-120

apps/api/vitest.config.ts runs two projects because graphql and @nestjs/graphql need opposite inlining under Vite, recorded as TECH-DEBT entry 10. The split is a test-runner workaround and is not evidence that production is safe: if a future dependency ever pulls a second physical copy of graphql, the built server hits the same identity failure at schema construction, which is startup rather than a request. Add npm ls graphql, or an equivalent, to the API verifier and fail when more than one version resolves.

**Why.** A roast raised it as the unmeasured half of a workaround it otherwise accepted. The failure is loud rather than silent, which is the good news, but it happens at boot on a deploy rather than in a test, and the check that would catch it in advance is one command.

**Exit condition.** agent/scripts/verify/KN-033.mjs fails when more than one graphql version resolves, proved by a planted duplicate, and TECH-DEBT entry 10 names it as the check that retires the split.

### `KN-127` The resolver-registration check reads text rather than the container

- **status** backlog · **severity** high · **points** 3 · **area** api
- **blocked by** KN-120

src/graphql/schema.test.ts proves the generator and the application share one list by grepping graphql.module.ts for providers: [...resolvers] and grepping other module files for a stray Resolver provider. That misses a resolver in a file not named *.resolver.ts, a default export, a re-export under another name, and a resolver registered through a dynamic module. Ask NEST instead: build the application context and compare the resolvers it actually instantiated against the generated schema fields.

**Why.** A roast rated the previous version of this critical because the two lists were genuinely separate, and they are one list now, which is the important half. What is left is that the CHECK is a text scan standing in for a runtime fact, and a text scan is what let the first version look fine. The application context already boots in the health test, so asking it is cheap.

**Exit condition.** A resolver registered in a way the text scan cannot see, a default export in a file not named *.resolver.ts, is detected, and the check reads the resolvers from a booted Nest context rather than from source text.

### `KN-128` Generate typed GraphQL operations instead of asserting them by hand

- **status** done · **severity** critical · **points** 3 · **area** graphql
- **blocked by** KN-035

HEAD_QUERY is a gql template with a hand-written TypedDocumentNode annotation, and HealthQueryData is Pick<Query, health>. Neither is generated or validated against the schema. Misspell a selected field, environmentTypo, and TypeScript accepts it because the annotation was asserted rather than derived, and the server rejects the request at runtime. The declared response type also claims the whole Health object rather than the three fields selected, so adding a required field to Health makes the type say Apollo returned something the query never asked for. The typescript-operations plugin is installed and unused; switch to generated operation types, or the client preset, so the document and its type come from the same place.

**Why.** A roast rated this critical and it is the card own why: the reason for a monorepo is that a schema change fails at typecheck rather than at runtime, and the one place that guarantee is exercised is the place it does not hold. A misspelled field is the most common GraphQL mistake there is, and it currently reaches production silently.

**Exit condition.** A query selecting a field that does not exist fails the build, the response type reflects the SELECTION rather than the whole object type, adding a required field to Health does not change HealthQueryData, and each is proved by a planted case.

**Roasts.** round 1 scored 7 with 2 critical(s); round 2 scored 8 with 0 critical(s); round 3 scored 9 with 0 critical(s); round 4 scored 9 with 0 critical(s); round 5 scored 9 with 0 critical(s); round 6 scored 9 with 0 critical(s)

### `KN-129` The duplicate-type scan only sees exported top-level declarations

- **status** backlog · **severity** medium · **points** 3 · **area** graphql
- **blocked by** KN-035

packages/graphql/src/handwritten.test.ts finds a duplicate only when it is a top-level export whose name exactly matches a generated type. A local interface LocalHealth with the same three fields, or an unexported interface Health inside a module, is invisible and can stand in for the generated type throughout a file. Compare SHAPES rather than names, or use the type checker: a declaration structurally identical to a generated type is the duplicate, whatever it is called.

**Why.** A roast rated this major. The clause is that no hand-written interface duplicates a generated one, and a scan matching names catches only the honest case: someone who writes LocalJobRecord to avoid the import is exactly the person the rule is for. Name matching also produces the wrong error for the right problem.

**Exit condition.** A local, unexported interface structurally identical to a generated type is detected in the web app, a differently named one is too, and an unrelated interface with some overlapping fields is not.

### `KN-130` The no-data health reason is English copy outside the catalog

- **status** backlog · **severity** medium · **points** 2 · **area** web
- **blocked by** KN-035

apps/web/src/core/api/health.ts returns { kind: down, reason: the API answered with nothing } when the response has no data and no error. That is user-facing English produced in a core module, in the same file whose comment says user-facing text must not originate there, so a Persian user sees English on exactly the failure that is hardest to explain. The lingui rule did not catch it because reason also carries network messages, which are not ours. Separate the two: a code the component translates, and a passthrough for whatever the network said.

**Why.** A roast rated this major and the sharpest part is that the comment beside it claims the opposite. A file that states a rule and breaks it in the next function is worse than one that does neither, because the next reader believes the comment.

**Exit condition.** No English sentence originates in apps/web/src/core, the empty-response case carries a code the component renders through the catalog, a network message still passes through untranslated, and the catalog test covers the new id.

### `KN-131` Make the root build typecheck what it ships

- **status** done · **severity** critical · **points** 2 · **area** infra
- **blocked by** none

apps/web/package.json build is "vite build" and nothing else. Vite transpiles per file and never typechecks, so the only typecheck of the web app is the separate "lint:tsc" script. npm run build therefore compiles and emits a bundle whose types were never verified. Concrete sequence found by a roast on KN-128: remove a selected field from packages/graphql/src/operations/health.graphql, regenerate, and run npm run build. Both generation checks agree because both sides regenerated, but nothing typechecks apps/web/src/core/api/health.ts, which still reads input.data.health.environment. The build passes and toHealthState returns { kind: 'up', environment: undefined }, which reaches the screen. Add typechecking to the web build, and check whether the API and graphql workspace builds have the same hole.

**Why.** npm run build is the command a deploy runs, and KN-051 will wire it to GitHub Pages. A build that does not typecheck what it emits is a deploy that ships a type error as a blank field. This is the same class as KN-120, where the build regenerated the artefact before comparing and therefore always passed: a gate that cannot fail is not a gate.

**Exit condition.** Removing a selected field from the health operation and regenerating makes npm run build fail, proved by planting exactly that, and the failure names the consumer file rather than something incidental. Every workspace build either typechecks its own sources or the verifier records why it cannot.

**Roasts.** round 1 scored 8 with 0 critical(s); round 2 scored 8 with 0 critical(s)

### `KN-132` Pin the byte-compared generated files to LF, or stop comparing bytes

- **status** done · **severity** high · **points** 1 · **area** infra
- **blocked by** none

.gitattributes pins apps/api/schema.gql to LF and the Figma captures to -text, both because they are compared byte for byte. Two files added since are compared the same way and are NOT pinned: packages/graphql/src/generated.ts, which packages/graphql/scripts/check-generated.mjs compares literally against a fresh generation, and packages/graphql/src/operations/health.graphql, which agent/scripts/verify/KN-128.mjs edits by matching the literal string "    environment\n". This machine has core.autocrlf=input so nothing converts on checkout and both work. On a machine with core.autocrlf=true the generated comparison reports the file stale when no schema changed, and the verifier's replacement stops matching. The verifier fails loudly there rather than silently passing, because it guards with "the operation could not be edited, so this check proves nothing", but a false failure on a clean clone is still a broken repository for whoever hits it. Either pin both files, or make the comparison normalise line endings and say so.

**Why.** The repository already learned this lesson twice and wrote the reason into .gitattributes both times. Every new byte-compared artefact has to be added there or the guarantee silently applies to a shrinking fraction of them. A contributor on default Windows git settings would see a stale-file failure on a fresh clone with no local change, which reads as the check being broken and trains people to bypass it.

**Exit condition.** A checkout with core.autocrlf=true passes npm run build and agent/scripts/verify/KN-128.mjs, proved by simulating that checkout rather than by reasoning about it, and .gitattributes covers every file any script compares byte for byte, derived from the scripts rather than listed by hand.

### `KN-133` check-generated.mjs leaks a temp directory on every failure

- **status** backlog · **severity** low · **points** 1 · **area** graphql
- **blocked by** none

packages/graphql/scripts/check-generated.mjs defines fail() at line 24 as a function that calls process.exit(1), and calls it from lines 68 and 73, both inside the try whose finally at line 76 removes the mkdtemp scratch directory. process.exit does not run finally blocks, so every failed check leaves a karnama-codegen-* directory in the OS temp folder. Both failure paths are the interesting ones: line 68 is codegen refusing an invalid document, which is exactly what agent/scripts/verify/KN-128.mjs triggers deliberately on every run, and line 73 is the stale-file path. Replace the exits inside the try with a thrown error handled after cleanup.

**Why.** Found by a roast, and the reason it matters is not the disk space: it is that the cleanup reads as correct and is not, so the next script written from this one as a template inherits the same bug. The verifier that plants a bad field runs this path on purpose, so the leak happens most often precisely when the checks are working.

**Exit condition.** Running the check against a deliberately invalid document leaves no karnama-codegen-* directory behind, proved by counting them before and after, and the same holds for the stale-file path.

### `KN-134` ThemedTree sets i18n state while rendering

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** none

The web test suite prints, on every run: "Cannot update a component (I18nProvider) while rendering a different component (ThemedTree). To locate the bad setState() call inside ThemedTree...". apps/web/src/app/AppProviders.tsx activates the locale on i18n during ThemedTree's render rather than in an effect or before mount, so a render of one component schedules a state update in another. React names this specifically because the update is not part of the render it interrupts: under concurrent rendering the two can disagree about which locale is active, which shows up as a flash of the wrong language or a catalog read before activation. Nothing currently fails because of it, which is why it has survived. It is 222 passing tests loud.

**Why.** This is the language switch, which the owner asked for by name, and it is in the provider every screen mounts under, so whatever it does wrong it does everywhere. A warning that prints on every test run also costs more than the bug: it trains everyone reading the output to skip a block of red, and the next real warning prints into that trained blindness.

**Exit condition.** The full web suite produces no React warnings at all, asserted by a check that fails when one appears rather than by reading the output, and switching language still works in fa-IR and en-US with the choice surviving a reload.

### `KN-135` The graphql package's coverage thresholds pass on zero files

- **status** backlog · **severity** low · **points** 1 · **area** graphql
- **blocked by** none

packages/graphql/vitest.config.ts sets thresholds of 100 for statements, branches, functions and lines, and then excludes src/generated.ts, src/index.ts and the tests. Those are the only files in src, so coverage reports "Statements: Unknown% ( 0/0 )" and the thresholds pass having measured nothing. Each exclusion is individually right: generated.ts is types with no runtime and index.ts is a re-export, and reporting 0 percent for either teaches people to ignore the number. The net effect is still a gate that cannot fail. Decide what this package's coverage means: either the thresholds apply to the first file with real behaviour, verified by planting an uncovered one, or the config says plainly that there is nothing to cover and drops the thresholds so nobody reads a guarantee that is not there.

**Why.** This repository's stated position is that a test asserting nothing is worse than no test because it reports green, and a threshold measuring nothing is the same thing one level up. It matters now rather than later because the package is about to grow: KN-129 and KN-130 add operations, and whoever adds the first piece of logic here will read three green 100s that were green before their file existed.

**Exit condition.** Either adding an uncovered file with real behaviour to packages/graphql makes npm test fail, proved by planting one, or the thresholds are gone and a comment says why coverage does not apply here.

### `KN-136` Commit the mutation cases, so a verifier's claim can be re-run

- **status** backlog · **severity** low · **points** 3 · **area** agent
- **blocked by** none

Every verifier under agent/scripts/verify has been mutation-tested and several commit messages state a count, but the mutation cases themselves are written to a scratch directory and thrown away. Nobody else can re-run them, which a roast pointed out when it declined to certify a claimed count it had no way to check. The cost is not only external: a mutation silently stops applying when the verifier it targets is edited, and the only reason that was caught three times while working KN-128 was a harness that reports MUTATION DID NOT APPLY instead of counting it as a pass. Give the cases a home, one file per verifier next to it, each case naming what it breaks and the message that must appear, run by a single command. Start with KN-128, whose eighteen cases exist and are known to pass, then backfill the ones whose counts are already in commit messages.

**Why.** This repository's rule is that a check nobody has seen fail is not a check. The mutation cases ARE the evidence that a verifier can fail, so throwing them away leaves the verifier and a number in a commit message that cannot be reproduced. It matters most when a verifier is edited, because a mutation that no longer applies looks exactly like a mutation that passed, and that is the failure that hides a broken checker.

**Exit condition.** One command runs every committed mutation case and fails if any case does not apply or is not caught, proved by editing a verifier so a case stops applying and watching that command fail, and KN-128's eighteen cases are committed and pass.

### `KN-137` KN-128's verifier checks the exported type but never the exported document

- **status** backlog · **severity** medium · **points** 2 · **area** agent
- **blocked by** none

agent/scripts/verify/KN-128.mjs proves things about HealthQuery and nothing about HealthDocument. Its source inspection reads only apps/web/src/core/api/health.ts, not the barrel index.ts, and its type probe imports only the type. So the web app can export a document that was never generated while every check passes: define HealthDocument in the barrel as a hand-built { kind: 'Document', definitions: [] }, or re-export the real one widened to plain DocumentNode, and the verifier is satisfied. I wrote a probe asserting the public and generated documents are assignable both ways and PROVED IT DOES NOT WORK: TypedDocumentNode is DocumentNode plus an OPTIONAL branded property, so a plain DocumentNode is assignable to it and the widening survives. A source check for a document literal in health.ts and index.ts catches the hand-built case; the widened case needs something that reads the document itself, such as comparing print(HealthDocument) from the barrel against the generated one at runtime. Both halves are worth having and neither is written.

**Why.** The card this came from exists because a hand-written document and a hand-written type drifted from the schema, and the verifier that proves the type is now generated does not prove the same of the document. A roast named the mutation and I confirmed the type-level fix for it does not work, so this is a measured gap rather than a suspected one. It matters when a second operation lands, because whatever shape that one takes will be copied from this one.

**Exit condition.** Exporting a hand-built or widened document from apps/web/src/core/api makes the KN-128 verifier fail, proved by planting both cases, and the check that catches the widened one reads the document rather than its type, since the optional brand makes the type-level check unable to see it.

### `KN-138` KN-128's verifier attributes compiler errors by substring, not by path

- **status** backlog · **severity** low · **points** 1 · **area** agent
- **blocked by** none

agent/scripts/verify/KN-128.mjs splits tsc output into errors on its probe and errors elsewhere, and the split decides whether the run may conclude anything. It classifies a line by searching it for the probe's name, so a diagnostic from any file whose path contains that name is read as the probe's. A roast reproduced this with TypeScript's own diagnostic formatter using e2e/src/core/api/kn-128-probe.ts. The line-start anchoring that would fix it is worth having, but note what it does NOT fix: a mutation test for this needs a colliding file to exist, so the case cannot be planted by editing the verifier alone, and the honest version of this task creates the colliding file, runs the verifier, and removes it.

**Why.** The probe-versus-elsewhere split is what lets that check say 'this run proves nothing' instead of reporting a collateral break as the wrong finding, which it did once already. A split that can misattribute is a split that can conclude from the wrong file, and the failure would look like a pass.

**Exit condition.** A file elsewhere in the web app whose path ends with the probe's name is not counted as the probe, proved by creating one, running the verifier and removing it, rather than by editing the matcher and reasoning about it.

### `KN-139` The board demands a verify command at the moment attaching one costs a roast round

- **status** backlog · **severity** medium · **points** 1 · **area** agent
- **blocked by** none

Closing KN-128 went: move to review, move to done, refused for having no verify command, set --verify, move to done again, refused because setting it changed the card digest and invalidated the roast that had cleared it. Both refusals are correct on their own. cardDigest deliberately includes verify, and agent/scripts/lib/card.mjs explains why: without it a task could be closed against a substituted check nobody reviewed. The trap is the ORDER. Nothing tells you to attach the command until the only remaining step is the one that rejects you for attaching it, and the price is a whole extra roast round on a card that was finished. Say it earlier: move to review should refuse, or at least warn loudly, when the task has no verify command, since that is the point where the reviewer is about to be handed the card.

**Why.** This cost a round on KN-128 after the loop had already been told not to spend rounds, and it will cost one on every task whose verifier is written during the work rather than before it, which is all of them. The rule being right is exactly why it should fire at the first moment it can rather than the last.

**Exit condition.** Moving a task to review without a verify command is refused or warned about with the same message move done gives, proved by trying it, and the message says attaching it afterwards will invalidate the roast.

### `KN-140` KN-131's verifier regenerates generated.ts instead of restoring it

- **status** backlog · **severity** medium · **points** 1 · **area** agent
- **blocked by** none

agent/scripts/verify/KN-131.mjs snapshots packages/graphql/src/generated.ts before it runs, but its finally block restores the OPERATION and then re-runs codegen:update to rebuild the generated file rather than writing the snapshot back. Two consequences. If the file had uncommitted content when the script started, that content is destroyed, because regeneration produces the canonical output rather than what was there. If codegen:update fails during cleanup, the REDUCED output is left behind. The snapshot comparison at the end detects both, so the script reports the damage, but detecting damage is not undoing it. Write GENERATED back from its snapshot in the finally, and keep the regeneration only as a way to leave dist and caches consistent.

**Why.** A verifier that destroys uncommitted work to run is one nobody should run, and this is the second time the same shape has appeared: KN-128's probe overwrote whatever sat at its path until it was made to refuse instead. Restoring from a snapshot is strictly simpler than regenerating and cannot fail halfway.

**Exit condition.** Starting the script with modified content in generated.ts leaves that exact content in place afterwards, proved by planting it, and a cleanup whose regeneration fails still restores the file.

### `KN-141` NO_COLOR makes KN-131's verifier reject a correct compiler refusal

- **status** backlog · **severity** low · **points** 1 · **area** agent
- **blocked by** none

agent/scripts/verify/KN-131.mjs requires the planted symbol kn131TypeError to appear in the build output. TypeScript honours NO_COLOR ahead of FORCE_COLOR, and its plain diagnostics are of the form 'src/foo.ts(1,14): error TS2322: Type string is not assignable to type number' with no source excerpt, so the variable name never appears. On a machine with NO_COLOR set the compiler refuses exactly as intended and the verifier reports 'failed, but never mentioned the planted error'. It passes here because this environment does not set NO_COLOR, which is the same conditional shape as KN-132: correct on this machine, broken on a reasonable other one. Match the planted file and the diagnostic code rather than the source excerpt.

**Why.** A verifier that fails on a correct refusal trains whoever hits it to distrust the verifier rather than the code, and NO_COLOR is set by default in plenty of CI images. The fix also makes the assertion stronger rather than weaker, since a diagnostic code is more specific than a name appearing somewhere in the output.

**Exit condition.** The verifier passes with NO_COLOR=1 set, proved by running it that way, and the assertion names the planted file and the TypeScript error code rather than the source excerpt.

### `KN-142` Nothing checks that a tsconfig still covers what the bundler ships

- **status** backlog · **severity** medium · **points** 3 · **area** infra
- **blocked by** none

KN-131 made every workspace build run the compiler, but nothing ties the compiler's PROGRAM to the module graph the bundler actually emits. A roast defeated it concretely: replace apps/web/tsconfig.json include with ["src/core/api/health.ts"] and every assertion still passes, because both web checks target that one consumer. src/main.tsx and the entire component tree leave the program. The reviewer confirmed against the installed compiler that a genuine error in the entrypoint, document.getElementById('root').toFixed(2), produces diagnostics under the real tsconfig and ZERO under the narrowed one, while Vite still enters through index.html, transpiles main.tsx and ships it. The same hole exists wherever an include or exclude list and a bundler entry can drift apart, so the check belongs at the level of the module graph: derive the files the build emits and require the compiler program to contain them, rather than trusting that a rejection in one fixed file proves coverage of the rest.

**Why.** This is the third variation of one idea and the first two were real: a build that names the compiler but passes --noCheck, and now a build that runs the compiler over a program missing the file it ships. Both leave the deploy shipping unchecked code while every gate reports green, which is the exact class KN-131 was opened to close. Filing rather than fixing because the exit condition as written asks that each build typecheck its own sources, which it does today; this asks for something stronger and deserves to be stated as its own thing.

**Exit condition.** Narrowing any workspace's tsconfig include so a file the bundler ships leaves the compiler program makes the gate fail, proved by planting exactly the health-only include a roast used, and the check derives the shipped files rather than listing them by hand.

### `KN-143` The mutation harnesses match test names in output, not test outcomes

- **status** backlog · **severity** medium · **points** 3 · **area** agent
- **blocked by** none

agent/scripts/verify/KN-123.mjs, and the same pattern in KN-128 and KN-131, decide a planted regression was caught by checking that the suite exited non-zero AND that the expected test name appears somewhere in the output. Vitest prints the names of tests that PASSED as well as ones that failed, so a run where the named test passed and something unrelated failed is counted as a catch. A roast pointed this out and gave a concrete instance: KN-123's mutation 6 makes its designated test fail through lock acquisition or timeout rather than through the transaction guard it is supposed to exercise, so the harness records the right name for the wrong reason. Consume a machine-readable result instead. Vitest writes JSON with --reporter=json, which carries each test's own status, so the harness can require that THIS test failed rather than that this string was printed.

**Why.** The whole argument for these harnesses is that a check nobody has seen fail is not a check, and a harness that mistakes a passing test for a failing one is the same defect one level up: it reports the guarantee is covered when it is not. It is worth fixing once, centrally, because three verifiers already share the pattern and every future one will copy it.

**Exit condition.** A planted regression whose designated test still PASSES while some other test fails is reported as a MISS, proved by planting exactly that, and every verifier that plants regressions reads a machine-readable result rather than console text.

### `KN-144` A NULL checksum in the ledger is adopted without proving the SQL ever ran

- **status** backlog · **severity** low · **points** 2 · **area** api
- **blocked by** none

applyMigrations adopts a ledger row whose checksum is NULL, writing the current file's checksum and moving on. Rows like that are written by the version of the runner that predated the column, so adopting them is what lets an existing database deploy at all. The limitation is that adoption cannot establish that the file's CURRENT text is what the database actually ran: if the old runner applied SQL A and the file now contains B, the ledger records B's checksum without B ever having executed, and every later deploy accepts that baseline. Anyone who can write to the ledger could also null a checksum deliberately and get the same effect, though that person can already rewrite the checksum directly, so it is a limitation of the migration policy rather than a hole in it. Decide and record: adopt but WARN loudly, or require an explicit one-off acknowledgement, and say plainly in TECH-DEBT.md what adoption does and does not prove.

**Why.** A roast raised it twice and both times classed it as a limitation rather than a rejection, which is exactly the kind of thing that gets forgotten because nobody rejected it. It matters at the moment it is least visible: the first deploy against a database that predates the checksum column, which is the real Supabase instance rather than a test.

**Exit condition.** Adoption of a NULL checksum is either recorded in TECH-DEBT.md with what it does and does not prove, or gated behind an explicit acknowledgement, and a test covers whichever was chosen.

### `KN-145` The migration guard cannot tell BEGIN ATOMIC from a transaction

- **status** backlog · **severity** low · **points** 3 · **area** api
- **blocked by** none

applyMigrations refuses any migration containing CREATE FUNCTION f() RETURNS integer LANGUAGE SQL BEGIN ATOMIC SELECT 1; END; which Postgres 14 and later accept. The scanner splits on semicolons and judges each statement by its first keyword, and a BEGIN ATOMIC body contains its own semicolons and ends with END, so distinguishing it from transaction control means tracking function-definition context rather than lexical context. The refusal is deliberate for now and the error message names the case and tells the author to write the body as a dollar-quoted block, which is what Prisma emits anyway. Recorded as TECH-DEBT 12 with the reasoning. Retire it by recognising the construct, with a planted case for a function body AND a real BEGIN in the same migration, so the fix cannot be a blanket exemption for anything containing the word ATOMIC.

**Why.** The two mistakes are not symmetric and the card should say so once rather than be re-litigated. Missing an ABORT costs a database, and a roast reproduced exactly that twice. Refusing a valid migration costs a deploy-time error with instructions. So the bias is correct today, but it is still a valid migration being refused, and the first person to hit it will be mid-deploy.

**Exit condition.** A migration whose only BEGIN is a SQL-standard function body is applied, and a migration containing a real BEGIN alongside such a body is still refused, each proved by a planted case against PGlite.

### `KN-146` The migration guard should stop lexing SQL and ask Postgres instead

- **status** backlog · **severity** high · **points** 5 · **area** api
- **blocked by** none

applyMigrations screens migration SQL for transaction control with a hand-written scanner. Four roast rounds found six holes in it, each a real data-loss path, each fixed: an inline COMMIT, ABORT and END; a command hidden between two ordinary strings that look like dollar quotes; ABORT split by a block comment, which Postgres reads as ABORT WORK; transaction control after a dollar sign inside an ASCII identifier; the same after a NON-ASCII identifier, since Postgres accepts accented and non-Latin letters in a name; and a comment ended by a bare carriage return rather than a newline. The pattern is the finding. Re-implementing Postgres's lexer in a guard is a losing game, and the sixth hole was found the same way as the first. Replace the screen with a structural check that does not care what the SQL says: wrap the batch so the runner can tell whether ITS transaction is the one that committed. A temp table created ON COMMIT DROP inside the transaction, with the ledger INSERT conditioned on that table still existing, makes an early COMMIT or ABORT unable to write a success row, whatever syntax produced it. Keep the scanner as a fast, friendly error, but stop it being the thing that protects the database.

**Why.** Every hole in this list let the runner record a migration as APPLIED when its table did not exist, or FAILED when it had committed, and both mean hand-written SQL against a production database to recover. The current guard is only as good as the next thing nobody thought of, and four rounds of evidence say there is always a next thing. A structural check has no vocabulary to be incomplete about. It also matters less than it sounds day to day, because Prisma generates these migrations and never emits transaction control, which is exactly why this is worth doing calmly rather than in another round of patches.

**Exit condition.** A migration containing an early COMMIT or an ABORT cannot produce a ledger row saying applied, proved by planting both against PGlite using syntax the scanner does NOT recognise, so the protection is demonstrably the structure rather than the screen.

### `KN-147` Nothing proves the migration runner waits between lock attempts

- **status** backlog · **severity** medium · **points** 2 · **area** api
- **blocked by** none

takeLock retries with await wait(retryMs) between attempts, and no test covers the delay. A roast pointed out across two rounds that deleting that line leaves every assertion in both contention tests passing: one counts attempts with lockRetryMs 0, the other denies the lock twice and then grants it regardless of elapsed time. So the runner could burn all thirty attempts as fast as the queries return and still look correct, which in production means a deploy failing rather than waiting for the other deploy to finish. Assert the timing: a controlled clock, or a recorded timestamp per attempt, requiring that no second acquisition happens before the configured interval, and plant the removal of ONLY the delay so the harness proves that specific line is load-bearing.

**Why.** The exit condition says a second concurrent run WAITS rather than racing. Refusing after N attempts proves it does not race, and eventually succeeding proves it can get in, but neither proves it waited, and waiting is the part that makes a real deploy survive a slower one ahead of it. It is also the last finding from four rounds that is still unaddressed.

**Exit condition.** Deleting the retry delay makes the suite fail, proved by planting exactly that, and the test asserts elapsed time or scheduled timing rather than attempt count alone.

### `KN-148` The mutation harnesses re-run the whole suite once per regression

- **status** backlog · **severity** medium · **points** 2 · **area** agent
- **blocked by** none

agent/scripts/verify/KN-123.mjs plants fifteen regressions and runs the ENTIRE database suite for each one, so a single verify is fifteen times a 68 second suite plus a baseline: about eighteen minutes. The close gate runs the verify, so every attempt to close the task pays it again, and the same shape is in KN-128's and KN-131's harnesses. Each regression names the one test that must fail, so vitest can be given that name with -t and run only it. Keep one full-suite baseline at the start, because a regression is only meaningful if everything passes first, then run each planted case narrowly. The saving is the difference between a check that gets run and one that gets skipped because it is too slow to bear.

**Why.** A verifier nobody wants to run stops being a verifier. Eighteen minutes is already long enough that the temptation is to close without it, which is precisely the failure the gate exists to prevent, and the harness gets slower every time a regression is added. It is also the single biggest wall-clock cost in this loop right now, ahead of the roasts themselves.

**Exit condition.** A verify that plants N regressions runs one full suite plus N filtered runs, and completes in under five minutes for KN-123, with every regression still caught, proved by running the harness before and after and comparing both the time and the caught count.

### `KN-149` The board cards for the rejected column do not require it to collapse

- **status** done · **severity** high · **points** 1 · **area** design
- **blocked by** none

KN-070 settled that رد شده sits last and is COLLAPSED to a count by default, expanding on click. That is a required interaction state, and the cards that build the board do not mention it: the full-height column card and KN-043 can both be satisfied completely while rendering رد شده as an ordinary always-open column. A roast found this by reading the downstream cards rather than the decision. Add the collapsed default, the count, and the expand interaction to the exit conditions of the column cards, and put the ordering exception there too, because someone building from a card does not necessarily re-read DESIGN.md section 3.

**Why.** A decision recorded only in the design document is a decision that gets built wrong by whoever works from the board, which is the normal way to work here. The whole point of settling KN-070 before the board is built was to avoid re-doing the columns, and that saving is lost if the requirement never reaches the cards that do the building.

**Exit condition.** The cards that build the board name the collapsed-by-default count, the expand interaction, and رد شده's position after پیشنهاد کار in their exit conditions, and a check derives that from board.json rather than from a person having remembered.

**Roasts.** round 1 scored 3 with 1 critical(s)

### `KN-150` KN-070's open-question check reads lines, not list items

- **status** backlog · **severity** low · **points** 1 · **area** agent
- **blocked by** none

agent/scripts/verify/KN-070.mjs decides whether رد شده is still listed as an open question by filtering for lines that begin with '- '. A bullet whose text wraps onto a continuation line therefore hides from it: a roast showed that '- **Unresolved status placement:**' with the question about رد شده on the next line passes the check. Markdown list items are not lines, and every other check in this repository that has read markdown line by line has had the same hole. Parse whole list items, joining continuations, before searching them.

**Why.** The check exists so a question cannot be recorded as settled in one section while still being asked in another, and a reader who hits both comes away not knowing which is current. A guard that only sees the first line of a bullet gives exactly that outcome while reporting green.

**Exit condition.** A wrapped bullet asking about رد شده makes the verifier fail, proved by planting one.

### `KN-151` The design manifest still calls four settled questions open

- **status** done · **severity** high · **points** 1 · **area** design
- **blocked by** none

agent/design-manifest.json carries an openItems list naming each question the design left open, and KN-002's verifier checks that every one of them is still listed as open in DESIGN.md. Recording the owner's four answers moved rejected-placement, contact-route, status-history-placement and review-step-fields out of the open list and into a Settled block, so the manifest and the document now disagree and KN-002's verifier FAILS. The manifest needs the same disposition the document has: each of the four marked as settled, with the card that settled it, so the check compares like with like rather than assuming every recorded question stays open forever. KN-073 and KN-077 are genuinely still open and must keep failing the check if they are ever quietly dropped.

**Why.** A verifier that fails on a task already marked done is a false done, and this one went red the moment the decisions were recorded — which is to say, the moment the work went RIGHT. That is worse than a plain bug: it punishes the correct action and trains whoever hits it to edit the check rather than the data. It was found by a plan roast before any of KN-071's work started, which is the whole argument for checking plans.

**Exit condition.** node agent/scripts/verify/KN-002.mjs passes, the manifest records each settled question with the card that settled it, and re-opening any of them in the manifest without re-opening it in DESIGN.md still fails the check, proved by planting that.

**Roasts.** round 1 scored 5 with 1 critical(s)

### `KN-152` Use the current Contacts tab label in the history decision

- **status** done · **severity** high · **points** 1 · **area** design
- **blocked by** KN-072

DESIGN.md section 6 settles the five-tab list as اطلاعات آگهی · سابقه · یادداشت · مخاطبین · فایل‌ها, but DESIGN.md around line 368 already renamed things: the NAV ITEM مخاطبین became شبکه من, and the contacts tab inside the job modal became افراد مرتبط. So the settled tab list names the tab with a label that now belongs to a different thing, and it is the superseded one. agent/scripts/verify/KN-072.mjs hardcodes مخاطبین in its TABS array and REQUIRES it, so the verifier now enforces the obsolete label. apps/api/prisma/schema.prisma already says the tab is Related People, so the repository contradicts itself across files.

**Why.** A builder reading the settled decision ships the wrong tab label, and the verifier tells them they are right. The terminology rename is a contract the design states without exception.

**Exit condition.** DESIGN.md section 6 and section 3 name the modal tab افراد مرتبط, KN-030 and KN-045 use that label, KN-072.mjs requires it and REJECTS مخاطبین as the modal tab label, and a mutation restoring مخاطبین fails the verifier with its own message.

### `KN-153` Separate the owner-settled own-tab decision from the author-chosen tab ORDER

- **status** done · **severity** high · **points** 1 · **area** design
- **blocked by** KN-072

DESIGN.md section 6 puts History goes second, directly after the information it is the history OF inside the block headed Settled by the owner, and section 3 reinforces that attribution. The owner settled that status history gets its OWN TAB. The owner did not choose second position; the author did, and said so. Recording an author choice inside an owner-settled block makes it unchallengeable by anyone reading the document later.

**Why.** The settled block is the one place in this repository whose authority comes from the owner rather than from the agent. Mixing an agent decision into it silently launders the agent decision, and the owner loses the chance to say no to something they were never asked about.

**Exit condition.** DESIGN.md marks the own-tab placement as owner-settled and the second position as an author proposal awaiting the owner, section 3 matches, and agent/scripts/verify/KN-072.mjs asserts the two are attributed separately so a mutation that moves the order back inside the owner block fails with its own message.

### `KN-154` KN-072 verifier accepts the two failures it exists to prevent

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** KN-072

Two holes, both reproduced. FIRST, at KN-072.mjs line 78 the five tab names are searched for anywhere inside entry.slice(0, 1200), so explanatory prose that merely MENTIONS a tab satisfies the check; the decision can drop a tab from the actual list and still pass. That is the same coincidence bug KN-002 and KN-071 were already fixed for. SECOND, at line 104 the contrast strip removes everything after not up to the next period, and the final clause then tests own tab against the UNSTRIPPED exit rather than against the stripped text. Confirmed by running: the card text All five tabs render. Status history does not render in its own tab; it renders in the Info tab. strips to All five tabs render. Status history does . and PASSES every check, although it states the exact opposite of the decision.

**Why.** This verifier exists because the first draft of the decision silently dropped two tabs. It currently certifies the failure it was written to catch, so the card it guards can be reversed without the gate noticing.

**Exit condition.** KN-072.mjs parses the ACTUAL tab list out of the decision line and requires exactly the five names in it rather than searching a character window, and checks KN-030 placement on the stripped text with an affirmative un-negatable assertion. Both reproductions above are added as committed mutation cases and each fails the verifier with its own message.

### `KN-155` KN-045 specified the modal arrangement KN-072 replaced, and the downstream sweep stopped short

- **status** done · **severity** high · **points** 1 · **area** web
- **blocked by** KN-072

KN-045 used to read: a four-tab modal reading and writing real data, info and status with history, notes, contacts and files. KN-072 settled that status history leaves the Info tab and gets its own, making FIVE tabs. Anyone building KN-045 from its own card rebuilds exactly the arrangement KN-072 rejected, and KN-045 verifies green because its exit condition only asks that history GROW, not where it renders. KN-072 updated KN-030 and stopped there, so the sweep for downstream cards was incomplete. FIXED: KN-045 now names five tabs and its exit condition asserts WHERE history renders, not only that it grows. The wording above is past tense on purpose, because the sweep this card adds refuses that phrase in any OPEN card and this card is an open card until it closes. That is not an exemption: the phrase is genuinely no longer true of KN-045, and a card reporting a fixed contradiction in the present tense would be wrong on its own terms.

**Why.** A settled decision that only reaches one of the cards that depend on it is not settled, it is contradicted. The stale card is the one an implementer actually works from.

**Exit condition.** KN-045 names five tabs with history in its own, its exit condition asserts WHERE history renders rather than only that it grows, and a check sweeps every OPEN card for the arrangement KN-072 replaced, refusing both the superseded tab count and any card that still puts the history block back where the owner took it from. This exit condition deliberately DESCRIBES those two shapes instead of quoting them: the sweep reads card prose, so a card quoting the banned wording is indistinguishable from a card instructing it, and this card would otherwise flag itself.

### `KN-156` The close gate has no exit for unrelated work landing during a background roast

- **status** backlog · **severity** medium · **points** 1 · **area** agent
- **blocked by** none

move done refuses when any file changed since the reviewed commit, and offers two ways out: run a new round, or close with --fixed-since because this change IS the fix the round asked for. Closing KN-072 hit a third case that fits neither. The four changed files were all KN-100 work and none of them was a file the round read; the files it did read were byte-identical. Since the loop now fires roasts in the BACKGROUND and takes the next card immediately, unrelated work landing between a roast and its adjudication is the normal case rather than an exception, so the gate will ask this question on almost every close and --fixed-since will be answered with a sentence that contradicts its own name.

**Why.** A gate whose only escape hatch is worded for a different situation trains people to type something untrue into it to get past. The gate is worth keeping, so the honest answer needs a door of its own.

**Exit condition.** move done distinguishes changes that touch files the round read from changes that do not, names which files it compared, and accepts an unrelated change with its own flag and its own recorded sentence. A mutation that changes a file the round DID read still refuses with the original message.

### `KN-157` The roast record cannot say a finding was fixed rather than dismissed

- **status** backlog · **severity** medium · **points** 1 · **area** agent
- **blocked by** none

todo roast takes --filed <ids> or --filed none, and --filed none prints Nothing survived adjudication. That is wrong whenever findings were REAL and fixed in-task, which RALPH step 5 explicitly requires when the finding is that the verifier passes without establishing its exit condition. KN-100 closed that way: three real findings, all reproduced, all repaired, and the board now records the round as though the roast turned up nothing worth keeping. The distinction has to be carried by prose in --fixed-since, where nothing can query it, so the board's own history understates what its reviews caught.

**Why.** The roast archive is the only record of what review actually found. A record that reads the same for a review that found nothing and a review that found three real defects makes the loop look less effective than it is, and hides the pattern that would tell you which verifiers keep passing dishonestly.

**Exit condition.** todo roast accepts a way to record findings that were fixed in-task rather than filed, the summary line distinguishes the three cases, dismissed, filed and fixed, and re-recording KN-100 round 1 with it shows three findings fixed rather than nothing survived.

### `KN-158` The story-docs rule in AGENTS.md describes a system that does not exist

- **status** backlog · **severity** high · **points** 3 · **area** web
- **blocked by** none

AGENTS.md says everything a Storybook Docs page prints lives in src/shared/story-docs/{en,fa}/<slug>.md, that there must be no JSDoc above const meta and no docblock above a story export, and that a guard test fails until both languages describe every prop and story. None of that is true of the repository. src/shared/story-docs does not exist. No guard test references it; the only mention anywhere is a COMMENT in .storybook/main.ts. All three existing stories, App, LanguageSwitch and Tokens, carry exactly the JSDoc above const meta that the rule forbids. And main.ts sets reactDocgen to react-docgen-typescript, which sources prop descriptions from TSDoc in the component, the opposite of the rule.

**Why.** A rule nobody can follow is worse than no rule: the next task that adds a story either violates the working agreement or silently absorbs building a documentation system, and neither is visible in its card. This was found because KN-112 needs a story and the plan check flagged the documentation it would owe. AGENTS.md is the working agreement, so a clause it states and the repository ignores is a contradiction at the top of the tree.

**Exit condition.** Either src/shared/story-docs/{en,fa} exists with a page for every story, the three existing stories are migrated off JSDoc on meta, and a guard test fails when either language is missing a prop or story; or AGENTS.md is corrected to describe what the repository actually does and the main.ts comment with it. Whichever is chosen, no story in the tree contradicts the written rule afterwards, proved by a check rather than by reading.

### `KN-159` Close the task BEFORE the roast, and never let a finding reopen it

- **status** done · **severity** high · **points** 2 · **area** agent
- **blocked by** none

The owner's rule of 2026-09-10 reversed the loop's order. It was: finish, move to review, roast, adjudicate, close on the round. It is now: finish with its tests and prove it works, close it on its own verifier, THEN roast the closed work in the background, and every finding becomes a new card that never reopens the closed task. agent/scripts/todo.mjs enforced the old order in three places: move done refused any status but review, it required a manifest-bound roast round with a --filed record, and it compared the worktree against the round's reviewed commit behind a --fixed-since escape. agent/RALPH.md documented the old order across steps 4, 5 and 6, including a fix-in-task rule with two clauses. The global loop and roast skills already had the new rule, so the project files were the ones out of sync.

**Why.** An order that holds finished work open until a reviewer replies makes the reviewer a gatekeeper of closing rather than a source of the next tasks, and it creates the exact deadlock the loop has hit repeatedly: fix what the review found, and now the work has changed since the review, so closing needs another round, which finds something smaller. One three point card took ten rounds that way while fifty six others waited. Closing first deletes the question instead of answering it.

**Exit condition.** move <id> done succeeds from in_progress with NO roast round recorded, provided the verify command passes, evidence is given and the worktree is clean; it still refuses from backlog; it still refuses when the verify command fails; roast accepts a done task; and RALPH.md documents finish, prove, close, roast in that order with findings always becoming cards. Proved by driving the real CLI in an isolated repository, not by reading the source.

**Roasts.** round 1 scored 4 with 1 critical(s)

### `KN-160` Plan files live beside the work, named #<id> - <title>.md

- **status** done · **severity** high · **points** 2 · **area** agent
- **blocked by** none

The owner's rule of 2026-09-10: the plan written before a task starts goes in the folder the work is about to be written to, named #<task id> - <title>.md, NOT in a separate directory. Today RALPH.md step 2b and the loop skill both say .claude/plan-<id>.md, which is a parallel tree: the plan sits nowhere near the code it describes, so nobody editing that code ever sees it, and the folder becomes a graveyard of plans for work that has since moved. Beside the work it is visible to whoever opens the directory, it moves when the code moves, and it is obvious when it is stale.

**Why.** A plan nobody reads is ceremony. The whole value of writing one is that the next person, including the next iteration of me, encounters it while looking at the thing it describes. A separate plan folder guarantees they never do.

**Exit condition.** agent/RALPH.md step 2b and ~/.claude/skills/loop/SKILL.md both instruct the #<id> - <title>.md name in the folder the work will be written to, no instruction anywhere still names .claude/plan-<id>.md, the existing plan for KN-112 has been moved to its work folder under the new name, and a check proves the loop files agree.

**Roasts.** round 1 scored 5.8 with 0 critical(s)

### `KN-161` Give the roast, todo and loop skills BOTH a python and a node script

- **status** done · **severity** high · **points** 3 · **area** agent
- **blocked by** none

The owner's rule of 2026-09-10: a skill should work whichever runtime is present. Today roast ships roast.py only, loop ships compact.py only, and todo ships todo.mjs only, so a project with node and no usable python cannot roast, and a project with python and no node cannot use the board. Each skill needs both entry points, behaving identically, and its SKILL.md has to say how to run each so the caller can pick without reading the directory.

**Why.** The skills are meant to be project-agnostic and they are not: each one silently assumes a runtime. The failure is quiet, a command that is simply not there, and it lands in the middle of a loop iteration rather than at setup time.

**Exit condition.** roast, todo and loop each carry a python and a node entry point that produce the same behaviour on the same inputs, each SKILL.md documents both invocations, and a check runs both entry points of each skill and compares their observable result rather than asserting the files exist.

### `KN-162` A closed task is still freely reopenable, so done does not mean done

- **status** done · **severity** critical · **points** 2 · **area** agent
- **blocked by** none

Found by the KN-159 roast. move has no transition guard on the CURRENT status. Its only in_progress guard asks whether some OTHER task is active, so move <id> in_progress succeeds on a task that is already done whenever nothing else is in progress. That permits exactly the sequence KN-159 exists to forbid: close, roast, reopen, fix what the roast found, close again. KN-159's claim that a roasted task STAYS done is therefore documentation rather than behaviour, and this session did precisely that to KN-100 before the rule changed.

**Why.** The rule that findings never reopen a closed task is the load-bearing half of the new order. A rule enforced only by intention breaks at the exact moment it matters, which is when a reviewer has just found something and the pull to polish is strongest.

**Exit condition.** move <id> in_progress, backlog, review or blocked all REFUSE when the task is done, and the refusal names the new-card route; dropped remains reachable if that is decided to be right; the refusal is proved by driving the real CLI in an isolated repository rather than by reading the source; and a mutation removing the guard fails the check with its own message.

**Roasts.** round 1 scored 4 with 0 critical(s)

### `KN-163` Adjudication is reported, not enforced, so findings can go unfiled forever

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** none

Found by the KN-159 roast. todo roast records a round with no filed field, and validate prints how many such rounds exist but still exits 0. So the honest sequence is unenforced: record an authentic roast of closed work without --filed and simply never come back. KN-001 and KN-065 already sit in exactly that state and have for some time, which is the proof that a report does not hold. The old close gate used to enforce this and KN-159 removed it, correctly, because it put the reviewer in front of the close; the enforcement has to move rather than disappear. The reviewer suggested requiring --filed on the first board recording after adjudication, which fits: under the new order you record the round AFTER judging it, so you always know what you filed.

**Why.** Every finding becomes a card is the mechanism that makes closing before review safe. If findings can be recorded and forgotten, closing early just loses them, and the loop gets the speed without the safety.

**Exit condition.** KN-001 and KN-065 have their roast rounds adjudicated and re-recorded with what was filed, so the board carries no round whose findings were never judged. validate keeps REPORTING the count, which is how a regression becomes visible without refusing anything.

### `KN-164` CLI messages still instruct the obsolete close-after-roast flow

- **status** backlog · **severity** medium · **points** 1 · **area** agent
- **blocked by** none

Found by the KN-159 roast. Two messages contradict the order KN-159 shipped. After adjudication, todo roast prints that move <id> done will now be accepted, but under the new order that task is ALREADY done, so following the instruction fails and nudges the reader towards reopening it first, which is the exact forbidden move. And todo next prints AWAITING ROAST, not blocking: <ids>. Adjudicate and close when it lands, which again describes closing after the roast. Operational instructions printed by the tool are followed more literally than documentation, because they arrive at the moment of acting.

**Why.** The tool's own output is the most trusted description of how the tool works. Leaving it describing the old order guarantees the old order gets followed by whoever reads it next, including a future iteration with no memory of this change.

**Exit condition.** No message printed by todo.mjs instructs closing after a roast or implies a done task should be reopened; the post-adjudication line describes what is actually true, that the round is recorded and its findings are on the board; and a check asserts the obsolete phrasings are absent from the source's message strings.

### `KN-165` Prove the roast recording path end to end with a stubbed reviewer

- **status** backlog · **severity** medium · **points** 3 · **area** agent
- **blocked by** none

Found by the KN-159 roast. agent/scripts/verify/KN-159.mjs proves a done task passes the roast STATUS guard only, by asserting the refusal names a missing archive rather than the status. The recording path beyond that is unproven, because a real round needs a harness-written reply plus a .meta.json manifest whose digest matches, and forging one in a test would weaken the forgery resistance that check exists for. The reviewer proposed the way through: a sandbox-local fake codex executable, so roast.mjs writes a REAL archive and manifest from deterministic reviewer output, and todo.mjs roast then records against it. Production forgery resistance is untouched; the test simply supplies the reviewer.

**Why.** The roast recording path is now the only route by which a finding reaches the board, since it is no longer part of the close gate. It is the least tested part of the loop and the part everything else now depends on.

**Exit condition.** A verifier drives roast.mjs against a stubbed reviewer in an isolated repository, gets a genuine archive and manifest, records the round against a DONE task with todo.mjs roast, and asserts the round appears on the card; the stub is confined to the sandbox and no production path accepts it; and mutations to the manifest digest check are caught.

### `KN-166` Check the loop rules are written correctly in the SkipBureau project

- **status** done · **severity** high · **points** 2 · **area** agent
- **blocked by** none

The owner's instruction of 2026-09-10: go to the sibling project at ../SkipBureau and make sure these rules are written correctly there, because the agent working it has been getting them wrong. The rules to check are the ones settled here: finish and prove a task BEFORE closing it, close on its own verifier rather than on a review, roast the closed work once in the background, every finding becomes a new to-do and never reopens the closed task, and the one exception is a finding that blocks the task now in hand, which means revert that task and take the board's next item. Also the plan-before-building rule and where the plan file lives. Read what is there before changing anything: that project has its own history and its rules may differ deliberately.

**Why.** The owner asked directly, and a loop running the wrong rules produces work that has to be redone. The rules here were settled through several expensive mistakes and the sibling project has no way to learn them except by being told.

**Exit condition.** ../SkipBureau's loop and rule files state the finish, prove, close, roast order, the findings-become-cards rule with its blocking exception, and the plan-beside-the-work rule; anything that contradicts them is corrected or, where the difference is deliberate, recorded as deliberate with its reason; and the owner is told what was found and what was changed.

**Roasts.** round 1 scored 2.5 with 1 critical(s)

### `KN-167` The API schema-entry test is flaky under load and fails the gate at random

- **status** backlog · **severity** high · **points** 2 · **area** api
- **blocked by** none

apps/api/src/graphql/schema-entry.test.ts failed one of its four cases during a full npm test run in apps/api, taking 19632ms for a file that takes 3.6 seconds when run alone, and the whole suite passed on an immediate re-run with no change in between. So the failure is timing, not logic: the case is slow enough that it crosses a timeout when the machine is loaded by the other eight test files. Observed on 2026-09-10 while running the API gate for an unrelated change.

**Why.** A gate that fails at random is worse than no gate, because the first thing anyone learns is to run it again, and after that a REAL failure gets re-run too. This one is especially bad placed: it guards the schema entry, which is the contract between the resolvers and the generated client, so the test everyone learns to ignore is the one protecting the thing that breaks silently.

**Exit condition.** The cause of the 19 second run is identified rather than papered over with a longer timeout, the test is made to run in a bounded time regardless of machine load, and the full apps/api suite passes twenty consecutive times under a parallel load that reproduces the original failure.

### `KN-168` KN-160's verifier passes on two blind spots it claims to cover

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** none

Found by the KN-160 roast, both reproduced by reading. FIRST, the check named every plan file in the tree walks the repository but skips the whole agent directory, which is exactly where agent work puts its plans and where two of them already live. Creating agent/plan-KN-999.md leaves the verifier green. The skip was added so the walk would not match the verifier's own plan file, and it blinded the check to the directory that matters most. SECOND, no instruction file still sends a plan to the old directory inspects three hardcoded paths, so a new operative file, say agent/WORKFLOW.md, instructing the old path is invisible and the verifier still passes. The source admits this, and the roast is right that documenting a hole does not make the exit condition true.

**Why.** A verifier whose stated coverage is wider than its real coverage is worse than a narrow one honestly described, because the next person reads the check name and stops looking. Both of these are the exact shape this repository keeps shipping: a check that passes for a reason unrelated to the thing it claims.

**Exit condition.** The tree walk covers agent/ and every other directory, distinguishing a plan file from a plan-shaped one by its NAME rather than by which folder it is in; the instruction corpus is derived from a stated convention or from a registry that new instruction files must join, rather than from a hand-maintained list; and both blind spots are proved closed by mutations that currently pass and must then fail.

### `KN-169` The KN-071 loss marker impersonates the plan it says was destroyed

- **status** backlog · **severity** medium · **points** 1 · **area** agent
- **blocked by** none

Found by the KN-160 roast. apps/api/prisma/#KN-071 - A contact needs only a full name.md carries the mandated plan filename and a # Plan heading, and its first sentence says the plan is gone. So anything keyed on the #KN-NNN filename, a person scanning the folder or a future check that collects plans, will find an incident report where it expects the historical plan, and the two are not interchangeable. The roast's suggestion is to keep the loss record somewhere that says what it is, such as agent/incidents/, and link it from the decision it relates to rather than putting it in the plan's chair.

**Why.** A file that says one thing in its name and the opposite in its first line will be classified by its name, by both people and automation. The record of a loss is worth keeping; keeping it disguised as the thing that was lost is how the loss gets forgotten twice.

**Exit condition.** The KN-071 loss record lives somewhere named for what it is rather than under a plan filename, the decision it concerns links to it, no file matching the plan naming convention denies being a plan, and a check proves that last property so the next marker cannot repeat it.

### `KN-170` An irreversible action must prove its rollback path before it runs

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** none

The general rule behind today's data loss, offered by the KN-160 roast and worth writing down because the specific fix, keep plan files, does not generalise. I deleted two files justified by the claim that git held them. It did not. The concrete guard is that the claim is one command away from being tested: git check-ignore -v <path> says whether it is ignored, git ls-files --error-unmatch <path> says whether it is tracked, git cat-file -e HEAD:<path> says whether a committed version exists. Any of those would have stopped the deletion. Stated generally: an irreversible action justified by a fallback needs a command that PROVES the fallback exists, run before the action, not an argument that it should.

**Why.** This class of mistake is not about plans and will not be prevented by the rule that fixed plans. Every future delete, overwrite, force push, revert, prune or reset carries the same shape: a confident sentence about recoverability that nobody checked. The cost is unbounded and the check costs one command.

**Exit condition.** AGENTS.md and agent/RALPH.md both carry the rule, naming the three git commands as the concrete instance and stating the general form; the wording makes clear it applies to any irreversible action and not only to deletion; and a check asserts both files carry it so it cannot quietly disappear the way the plan lifecycle rule did.

### `KN-171` The loop prompt fed by the Stop hook still teaches the old order

- **status** backlog · **severity** low · **points** 1 · **area** agent
- **blocked by** none

.claude/ralph-loop.local.md is the prompt the Stop hook feeds back every iteration, and it still carries the rules KN-159 replaced. Line 66 states the mechanical fix-in-task test that RALPH.md deleted, and line 76 makes step 6 Close it, after the roast, describing a close gate that requires a manifest-bound round and a record of what was filed, none of which is true any more. The prompt does say to follow RALPH.md exactly and that it is only the trigger, so the contradiction is survivable, but it is the single most-read instruction in the loop: it arrives at the start of every iteration and RALPH.md is read second. Two files giving different orders means the wrong one gets followed on the iteration where somebody is in a hurry.

**Why.** The loop is driven by whichever text is in front of you at the moment of deciding. A trigger prompt that contradicts the rule file is the most expensive kind of stale documentation, because it is re-read more often than the thing it contradicts.

**Exit condition.** .claude/ralph-loop.local.md states finish, prove, close, roast in that order, carries no fix-in-task rule, and describes the close gate as it actually is; a check asserts the prompt and RALPH.md do not contradict each other on the order; and a mutation reintroducing either stale rule fails that check with its own message.

### `KN-172` compact.py does the opposite of what the loop's compact step is for

- **status** backlog · **severity** low · **points** 1 · **area** agent
- **blocked by** none

The owner's correction of 2026-09-10. Step 1 of the loop skill is called compact and its purpose is to FREE the context window, so that when the next iteration begins the first thing read is the loop's own rules rather than a stale conversation. ~/.claude/skills/loop/compact.py does the reverse: it prints the git branch, recent commits, uncommitted changes and the project's context files, which INJECTS a summary into the context every iteration. That is the thing the step was meant to avoid. What the owner wants is the harness's own /compact. That cannot be invoked by the agent: /compact is user-initiated or automatic when the window fills, and text the assistant emits is not executed as a slash command. So the honest resolution is to delete compact.py, say in the skill that the step means taking the harness's compaction where the harness offers it, and otherwise rebuilding from disk by READING the rule files rather than by printing a digest of them. This also narrows KN-161, since the loop skill then has no script needing a second runtime.

**Why.** A step whose implementation does the opposite of its name will keep being run, because its name says it is right. It costs context on every single iteration, which is the resource the step exists to protect, and it does so silently.

**Exit condition.** compact.py is gone; the loop skill's step 1 states plainly that compaction is the harness's to perform, that the agent cannot trigger it, and that the fallback is re-reading the rule files from disk; no instruction anywhere tells the agent to run a script that prints a context digest; and KN-161 is updated to reflect that the loop skill no longer ships a script.

### `KN-173` rm destroys the card and its reason, so the terminal refusal promises something false

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** none

Found by the KN-162 roast and confirmed by reading. rm requires --reason, PRINTS it to stdout, then splices the task out of board.tasks. Neither the task nor the reason survives in board.json. KN-162's terminal refusal names rm as the route for a close that was an outright error and says it leaves a stated reason behind, which is not true: it destroys the completed card, its evidence, its roast history and the explanation of why it vanished. The roast's suggestion is a tombstone instead, a terminal voided record that keeps the card, its reason and a link to whatever replaced it, and that cannot reopen work, so any actual remaining work is still a new card.

**Why.** The only escape route from a terminal state is currently the most destructive command on the board, and it is advertised with a promise it does not keep. Someone following that advice after a mis-close loses the evidence and roast history of real work, and finds out afterwards.

**Exit condition.** A mis-closed card can be voided into a terminal tombstone that RETAINS the card, its reason and a link to its replacement; rm either keeps a record too or stops being named as the recovery route; the terminal refusal message describes what actually happens; and driving the real CLI proves the record survives.

### `KN-174` Extract the verifier sandbox builder, which has already diverged between two copies

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** none

Found by the KN-162 roast. KN-159 and KN-162 each build a throwaway git repository, copy agent/scripts into it, seed a board and commit, and I duplicated rather than extracted on the plan check's advice that the third caller is the moment to share it. The roast disagreed and it is right on the evidence: the two copies ALREADY differ. KN-159 writes both a passing and a failing sandbox verifier fixture; KN-162 writes only the passing one. So the isolation guarantee the two files claim is not the same guarantee, and nothing says which is correct. The threshold third caller is wrong for a helper that DEFINES what the tests are isolating from.

**Why.** Duplicated test infrastructure diverges silently, and when it does, two verifiers are testing subtly different worlds while both report success. The divergence here appeared within one session of the duplication being made.

**Exit condition.** One sandbox builder in agent/scripts/verify/lib/, used by KN-159 and KN-162, with the fixtures either shared or requested explicitly by the caller; both verifiers still pass; and a check proves neither file builds a repository of its own any more.

### `KN-175` Verifiers that need a scratch directory cannot run in the read-only review sandbox

- **status** backlog · **severity** medium · **points** 2 · **area** agent
- **blocked by** none

Found by the KN-162 roast, and raised once before by the KN-159 roast which declined to call it a defect. KN-162's verifier fails immediately with EPERM at mkdtempSync in the reviewer's read-only environment, before any check runs, so the reviewer cannot reproduce the evidence the close was granted on and has to take it on trust. The same is true of KN-058, KN-065 and KN-159. Two readings are available and the board should pick one rather than leaving it to whichever roast raises it: either isolation-testing verifiers are exempt and the exemption is written down so a reviewer knows not to treat it as a finding, or they are given a writable location the sandbox permits and become reproducible.

**Why.** A verifier a reviewer cannot run is a verifier whose result is a claim rather than a check, which is the thing this whole loop exists to avoid. It has now been raised by two separate roasts, which means it will keep being raised until it is decided.

**Exit condition.** The repository states, in AGENTS.md or RALPH.md, whether a verifier may require a writable scratch directory; verifiers that do are either made runnable in the review environment or carry a machine-readable marker saying they cannot be, and the roast prompt tells the reviewer which; and no future roast can raise this as a novel finding.

### `KN-176` KN-162 closed against an exit condition it deliberately did not meet

- **status** dropped · **severity** low · **points** 1 · **area** agent
- **blocked by** none

Found by the KN-162 roast. The card's exit condition, written before the work, said a task can still be dropped or re-closed idempotently IF THAT IS DECIDED TO BE RIGHT. The implementation decided it was not: dropped is refused along with every other transition out of done, and the verifier asserts the refusal. So the card's stated contract and the shipped behaviour disagree, and the close was granted against the hedge rather than against a decision. The hedge was the mistake: an exit condition containing if that is decided to be right cannot be satisfied or failed, which makes it unusable as a gate.

**Why.** An exit condition is the one part of a card that has to be checkable, and a hedged clause is how a card closes on whatever was built rather than on what was asked. The decision itself is settled and the roast agrees with it; what is wrong is the record.

**Exit condition.** KN-162's exit condition records the decision that done is terminal for every status including dropped, with the reasoning; a check refuses any OPEN card whose exit condition contains a hedge of that shape, if decided, if appropriate, or similar, so the next one cannot be written; and the check is proved by a card that currently passes and must then fail.

### `KN-177` The global todo skill lets a closed task reopen, so SkipBureau's rule is honour-based

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** none

Found while checking SkipBureau's loop rules for KN-166. Its CLAUDE.md correctly says a finding is not a reason to reopen what was just finished, and its board is .claude/todo.db driven by the GLOBAL todo skill. ~/.claude/skills/todo/todo.mjs has no guard on a task's current status, so a done task moves back to in_progress freely, exactly as KarNama's board did until KN-162 added a terminal guard. The project whose agent was described as getting the rules wrong is therefore the one where the tool does not enforce them. KarNama's fix is the model: refuse every transition out of done, put the guard ahead of the other status checks so the refusal reports the right cause, name a new card as the route for remaining work, and make re-closing an explicit no-op rather than letting it fall through to a message that tells the reader to reopen.

**Why.** A rule stated in a document and unenforced by the tool is followed exactly as often as the person reading it remembers, and the moment it matters most is when a reviewer has just found something. This is the same gap KN-162 closed here, still open in the shared tool that every other project uses.

**Exit condition.** The global todo skill refuses every transition out of done, naming the new-card route; re-closing is a no-op rather than an error; the refusal is proved by driving the real CLI against a throwaway database rather than by reading the source; a mutation removing the guard fails that check with its own message; and SkipBureau's board is unaffected apart from gaining the guard.

### `KN-178` The preferences story's localStorage restore races with other stories

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** none

Found by the KN-112 roast and the mechanism is concrete. PreferencesProvider.stories.tsx saves localStorage, clicks a button that makes the provider persist, and restores in a finally. That is not enough without serialization: story A captures the original value, story B starts while A's en-US and dark value is present and captures THAT as its own before, A restores the original, then B restores the polluted value, and the suite ends dirty. A story running between the write and the restore can also read the polluted value. The storybook project declares a browser instance and nothing about serial execution or storage isolation, so nothing rules the interleaving out. The symptom would be an unrelated story going flaky, which is the hardest kind of failure to trace back.

**Why.** The story is the only proof of the state half of KN-112, so it has to be trustworthy, and a test that can corrupt the shared browser is a test that manufactures failures elsewhere. Any story that mounts a provider without a seed reads whatever is stored.

**Exit condition.** The story cannot pollute the shared store: either the provider under test is given an injected storage rather than the real one, or the storybook project serializes these stories explicitly, or the story stubs window.localStorage for its own duration. Proved by running the story concurrently with a story that reads stored preferences and asserting the second is unaffected, not by reasoning about the scheduler.

### `KN-179` no-restricted-globals does not cover stories, so a bare localStorage passed lint

- **status** backlog · **severity** medium · **points** 1 · **area** web
- **blocked by** none

Found by the KN-112 roast. AGENTS.md says browser globals go through window.*, kept mockable and greppable, enforced by no-restricted-globals. PreferencesProvider.stories.tsx uses bare localStorage three times and the lint passed with --max-warnings 0, so the enforcement does not reach .stories.tsx, or localStorage is not in the restricted list. The violation is minor on its own; the hole is not, because the rule's whole value is that it is mechanical and it silently is not.

**Why.** A convention documented as enforced, that is not enforced, is worse than one documented as a habit: nobody checks it by hand because the linter is supposed to. This one was found by a reviewer rather than by the gate that claims to cover it.

**Exit condition.** no-restricted-globals covers every file that runs in a browser including stories and .storybook, the existing bare uses are corrected, and a planted bare localStorage in a story FAILS npm run lint, proved by planting one rather than by reading the config.

### `KN-180` Verifiers claim to be read-only while their test runs write to node_modules

- **status** backlog · **severity** medium · **points** 1 · **area** agent
- **blocked by** none

Found by the KN-112 roast. KN-112's header says read-only, runs commands, writes nothing to the repository. That is false: the vitest runs it spawns make Vite create apps/web/node_modules/.vite-temp files, which is why both of its runtime checks failed with EPERM in the reviewer's read-only environment while its static checks still ran and reported. So the file both overstates its own behaviour and can report a partial result that looks like a full one. Other verifiers that spawn vitest carry the same claim.

**Why.** A verifier's header is what a reviewer trusts when deciding whether it can be run and what a failure means. One that claims read-only and then half-runs produces exactly the confusing outcome seen here: two checks failing for the environment and three passing, with a summary that does not distinguish them.

**Exit condition.** No verifier claims to be read-only when the commands it spawns write anywhere; those that need a writable tree say so in one line naming what they write; and a verifier that cannot complete reports that it could not RUN a check rather than counting it as a pass or a failure.

### `KN-181` SkipBureau's active loop prompt fires the roast BEFORE the close, contradicting its own line

- **status** done · **severity** critical · **points** 2 · **area** agent
- **blocked by** none

Found by the KN-166 roast and confirmed by reading. ../SkipBureau/.claude/ralph-loop.local.md is the prompt its Stop hook feeds every iteration, so it is a rule file, and KN-166's check read only CLAUDE.md. Line 146 says THEN move it to done, and only then fire the roast, in the background. The code block immediately beneath it does the opposite: roast.py task ... & comes first and todo move <id> done second, so the reviewer can read and report on work before it is closed, which is the ordering the whole rule exists to prevent. That is the sijav failure mode, correct prose over a body that instructs the opposite, and KN-166 explicitly praised this project for not having it, on the strength of having read the wrong file. Separately, its step 1 says a false or premature done is repaired before any new work starts, which under the current rules means filing a card, but the wording invites reopening a closed task and should say which it means.

**Why.** The prompt arrives at the start of every iteration and is read before any rule file, and a copyable command block is followed more literally than the sentence above it. This is the file that actually drives that loop, and it currently disagrees with itself in the one place the owner has corrected twice.

**Exit condition.** The command block in ../SkipBureau/.claude/ralph-loop.local.md closes before it roasts, matching its own prose; its step 1 says a false done is repaired by filing a card rather than by reopening; and a check covers BOTH that project's rule files rather than CLAUDE.md alone, so a contradiction between them fails rather than passing.

**Roasts.** round 1 scored 3 with 2 critical(s)

### `KN-182` KN-166's verifier makes this repository fail when a sibling project moves

- **status** backlog · **severity** medium · **points** 1 · **area** agent
- **blocked by** none

Found by the KN-166 roast. agent/scripts/verify/KN-166.mjs derives ../SkipBureau from KarNama's own location and FAILS when it is absent, which I chose deliberately over skipping, on the grounds that a check passing when its subject is missing is worse. The reviewer's point is that both options are bad and a third exists: cloning KarNama alone, archiving the sibling, or checking out on another machine turns this repository's verification red for something that is not a KarNama defect. The rule verifier belongs in SkipBureau, gating SkipBureau. What can honestly live here is a non-gating cross-repo audit that reports subject unavailable as a distinct outcome from subject wrong.

**Why.** A gate that goes red for a reason outside the repository teaches people to ignore red. That is the most expensive thing a gate can teach, and it is the same lesson a flaky test teaches, which is separately filed as KN-167.

**Exit condition.** KarNama's verification does not depend on any path outside this repository; a missing sibling is reported as unavailable rather than as a failure; and the rules check for SkipBureau lives in SkipBureau and gates SkipBureau, proved by running both with the sibling renamed.

### `KN-183` KN-114's verifier can silently overwrite a concurrent catalog edit

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** none

Found by the KN-114 roast. agent/scripts/verify/KN-114.mjs snapshots apps/web/src/i18n/locales/fa-IR.ts, rewrites it seven times to plant evasions, and then restores that SNAPSHOT unconditionally in a finally. Anything that changes the catalog while it runs, a developer, a generator, a concurrent agent, is silently reverted to the snapshot with no warning and no diff to notice. Killing the run leaves a planted catalog behind, which the file's own header admits. The roast's alternative is better and hermetic: extract the two predicates, blank and untranslated, into a pure function taking an object of the two catalogs; have catalog.test.ts call it on the real imported catalogs so npm test runs the real validator; and unit-test that same function against invalid in-memory catalogs. Nothing is written, nothing is restored, and the thing proved is the exact validator the suite uses rather than a copy of it.

**Why.** This is the same class of defect that destroyed a plan file earlier today: a destructive operation whose safety rests on an assumption nobody checks, here that the file has not changed underneath. It is also unnecessary, because the proof can be made without writing to the repository at all.

**Exit condition.** The blank and untranslated rules live in a pure function that takes the catalogs as an argument; catalog.test.ts calls it on the real imported ones; a test drives it with in-memory catalogs containing each evasion, empty, whitespace, format characters only, the id exactly and the id with punctuation and casing changed, and requires each to be reported naming the id; KN-114's verifier no longer writes to any tracked file; and its header no longer needs to warn that an interrupted run leaves the catalog planted.

### `KN-184` The order check reads the whole document, not the fenced block it claims to

- **status** done · **severity** low · **points** 2 · **area** agent
- **blocked by** none

Found by the KN-181 roast. agent/scripts/verify/KN-166.mjs claims in its own comment to check the command block rather than the prose, and does not: it takes indexOf of the first todo move <id> done and the first roast.py task anywhere in the whitespace-collapsed document and compares those positions. So an editor who leaves an earlier harmless close-then-roast example anywhere above, and reverses the REAL step 5 fenced block, passes this check. That fails the card's requirement that a contradiction inside the command block fail, and it is worse than a check that never claimed it, because the comment tells the next reader the block is covered.

**Why.** The check exists because prose and a command block disagreed and the block is what gets copied. A check that reads the whole document cannot tell those apart, so it is blind to the exact defect it was written for while asserting the opposite.

**Exit condition.** The check extracts the fenced code block belonging to the close-and-roast step and compares the order of the commands WITHIN it, so a document carrying an earlier correctly-ordered example and a reversed real block is reported rather than passed.

**Roasts.** round 1 scored 3 with 2 critical(s)

### `KN-185` Nothing establishes which prompt file the sibling Stop hook actually feeds

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** none

Found by the KN-181 roast, and KN-181's own evidence admits it: that .claude/ralph-loop.local.md is what the hook injects was INFERRED from the file's frontmatter and from the harness bumping its iteration counter, not observed. Those show the file has loop-like state, not that the hook resolves that path. SkipBureau has no checked-in hook registration or settings file naming it, so the only support is the prompt's own self-description. If the hook resolves a different prompt, the live behaviour KN-181 set out to fix is still wrong and the card closed on a premise nobody checked. The observation available without running that loop is tracing the installed Stop-hook registration, the plugin or settings entry, to the pathname it resolves.

**Why.** KN-181 was filed critical because a live loop was following the wrong order. If the file that was fixed is not the file being read, nothing was fixed and the board records a critical as closed. The same question applies to KarNama's own prompt, which KN-171 assumes without checking.

**Exit condition.** The Stop-hook registration is traced to the exact prompt pathname it feeds, for both projects, and recorded where the next reader will find it; where a project's hook feeds a file nobody has been maintaining, that is filed; and the claim is supported by the resolved configuration rather than by the prompt's own text.

### `KN-186` The plan-beside-the-work rule has no answer when the work IS in .claude

- **status** backlog · **severity** medium · **points** 1 · **area** agent
- **blocked by** none

Found by the KN-181 roast. That card's plan was written to ../SkipBureau/.claude/, because the file it changed lives there and the rule says the plan goes in the folder the work lands in. SkipBureau's own rule also says never .claude/. Both rules are right and they contradict each other exactly when the work is a file in .claude, which is where every loop prompt lives, so this will recur on every card that touches one. The plan additionally sits untracked, so it can vanish in the same checkout or reset the card was careful to protect the real change from, and the plan itself argued for the prohibited location instead of noticing the conflict.

**Why.** A rule pair that contradicts itself on a whole class of work gets resolved differently each time by whoever hits it, and the resolution is invisible afterwards. This one produced a plan in a location its own project forbids, justified in the plan.

**Exit condition.** Both projects' rules say where a plan goes when the work itself is inside .claude, whichever answer is chosen, and the KN-181 plan is moved there and tracked so it cannot vanish.

### `KN-187` An em dash reached a rule file that forbids em dashes

- **status** backlog · **severity** low · **points** 1 · **area** docs
- **blocked by** none

Found by the KN-181 roast. The text added to ../SkipBureau/.claude/ralph-loop.local.md contains an em dash, and both projects' documentation rules say to use commas instead. KarNama's AGENTS.md states it for every .md and .mdx and warns to check with a Unicode-aware matcher rather than a byte-wise grep, which reports false hits inside Persian characters. Nothing enforces it, so it is caught only when a reviewer happens to look, and the markdown written during this session should be swept rather than only this one line.

**Why.** It is a small rule and it is stated twice, which makes an unenforced version of it worse than none: everybody believes it holds. The sweep matters more than the single line, because a session that wrote many markdown files probably introduced more than one.

**Exit condition.** The em dashes written into markdown during this session are replaced with commas, in both projects, found with a Unicode-aware search so Persian text produces no false hit.

### `KN-188` KarNama's board cannot record a finding as a child of the task it came from

- **status** backlog · **severity** low · **points** 3 · **area** agent
- **blocked by** none

The owner's rule of 2026-09-10: a roast's findings are filed as CHILDREN of the roasted task, one level, and when the last open child closes the parent and all its children are roasted together. The global todo skill now carries this as a parent_task column, with --parent-task on add and edit, and move done printing what to roast next. KarNama's own board cannot do it: board.json has a parent field and it means BLOCKED BY, a different relation entirely. A blocker must finish before the task can start; a finding comes out of a task that is already closed, so filing one as a blocker would deadlock it, and the selection law would refuse to hand it out. RALPH.md now states the rule and says the tool does not support it, which is honest and not a substitute.

**Why.** The rule is the thing that makes done mean something: a task is finished when everything its review turned up has been dealt with, not when somebody says so. Stating it in the loop file while the board cannot express it means every finding here is still a loose card, and the group roast that closes the cycle can never be triggered by anything but memory.

**Exit condition.** A KarNama card can be filed against the task it came out of, separately from its blockers; both are visible on the card and in the rendered board; move done reports what to roast and, when the last open child closes, names the parent and all its children; the one-level rule holds; and the whole thing is proved by driving the real CLI in an isolated repository rather than by reading the source.

### `KN-189` Heading keywords pick the wrong block, so a reversed real block still passes

- **status** done · **severity** critical · **points** 2 · **area** agent
- **blocked by** none

CHILD OF KN-184, recorded here because board.json cannot express parent_task yet, KN-188. Found by the KN-184 roast, which reproduced it. lib/prompt-order.mjs selects the normative block with findIndex over numbered lines containing both done and roast. Any EARLIER numbered step whose prose happens to contain both words wins. The reviewer ran a fixture with step 2 headed If a task is done, roast it only after closing it and step 5 headed Close the task, then request review, and closesBeforeRoasting returned ok true while step 5's block was reversed. The exit condition KN-184 closed against is therefore not met for that shape. I raised this risk in my own plan, asked whether heading keywords were more robust than counting fences or just more quietly brittle, and the plan check endorsed heading association without foreseeing it. The reviewer's answer is an explicit marker for the normative block rather than prose keywords.

**Why.** This is the second time this check has been fixed and the second time it has been fooled by a document that reads reasonably. Prose is not a selector: any rule that infers WHICH block is normative from the words around it can be defeated by words. A marker is the only thing that cannot drift, and the block matters because it is what gets copied.

**Exit condition.** The normative block is identified by an explicit stable marker rather than by keywords in a heading; both fixtures the reviewer ran, an earlier step whose prose contains both words, and a real step whose heading uses different words, are covered as cases; and each fails before the fix and passes after.

**Roasts.** round 1 scored 3 with 1 critical(s)

### `KN-190` Command-shaped text inside a string counts as the command

- **status** done · **severity** critical · **points** 2 · **area** agent
- **blocked by** none

CHILD OF KN-184, recorded here because board.json cannot express parent_task yet, KN-188. Found by the KN-184 roast, which reproduced it. lib/prompt-order.mjs finds the close and the roast with unanchored regexes over each line, so any line CONTAINING the text counts. The reviewer ran a block whose first line is echo "todo move <id> done", followed by the real roast command and then the real close, and got ok true: the echo was read as the close, so the order looked right while the actual commands ran the wrong way round. Skipping lines that start with a hash is not enough, because the text does not have to be in a comment to be inert. The fix is to recognise an actual command at the start of a line rather than command-shaped text anywhere in it.

**Why.** A check that reads text rather than commands can be satisfied by anything that mentions a command, including documentation of the very mistake it is looking for. That is the same shape as a grep matching the prose explaining a ban, which this repository has now shipped three times.

**Exit condition.** The recognisers read a COMMAND rather than command-shaped text. The close is the head token of its line. The roast is matched among that line's tokens, because python <path>/roast.py task puts the roast in ARGUMENT position and an anchor would find nothing in the file this is written for. A quoted run stays ONE token, and a line whose head is a printer (echo, printf, cat) runs nothing, so a mention is not the command. The reviewer's echo fixture fails before the fix and passes after. A pipeline, a chain, a semicolon or a line continuation is REPORTED as unorderable rather than guessed at, and a single trailing ampersand is NOT, because backgrounding the roast is what the real prompt does.

**Roasts.** round 1 scored 2 with 2 critical(s)

### `KN-191` The roast skill writes its transient result into the project, not a scratch directory

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** none

The owner asked why on 2026-09-10. Both halves of the roast skill write .claude/roast-result.md into whatever project they are run in. It is gitignored so it never reaches history, but it is still transient agent output living in a working tree: it shows up in file listings and editors, and gitignored-plus-untracked is precisely the category that vanishes without anyone noticing, which is how two plan files were destroyed earlier the same day. I did not choose the location, roast.py already used it and the Node port copied it faithfully, which explains it without justifying it. Note what must NOT move: roast-sessions.json holds the session ids that let a reviewer resume a conversation across sessions, so it has to stay project-local and persistent; a session-scoped scratch directory would silently start a fresh conversation every time. KarNama's own harness, agent/scripts/roast.mjs, archives to agent/roasts/ and that is tracked on purpose, since those are manifest-bound evidence rather than scratch.

**Why.** A tool that leaves working files in someone's project is a tool they have to tidy up after, and the answer to why is currently because it always did that. The distinction worth getting right is between state the tool NEEDS to keep, which belongs to the project, and output it happened to produce, which does not.

**Exit condition.** The transient result file is written to a scratch location rather than into the project; roast-sessions.json stays project-local with its reason recorded; both halves agree on where and the parity test still passes; the gitignore entries for anything that no longer lands in the project are removed rather than left as fossils; and running a roast in a clean checkout leaves that checkout unchanged.

### `KN-192` A stale or inline marker masks the real block, so the marker is not yet a declaration

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** none

CHILD OF KN-184, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-189 roast, and KN-189 is itself a child of KN-184, so this FLATTENS to KN-184: the rule is one level only. Recorded against KN-189 first, which would have fired the parent roast against a card with no open children while KN-184 still had one. That roast reproduced both halves. lib/prompt-order.mjs accepts the marker ANYWHERE in a line, so Note: <!-- roast-order --> above a correct fence counts as a declaration, and it accepts ANY NUMBER of marked blocks provided each is ordered. The reviewer ran a document with that inline marker above a correct fence plus a later UNMARKED reversed real fence and got ok true: the stale marker masked the moved real block. Two correctly ordered marked fences also pass. So the marker is not yet the declaration the card claimed; it is a token that anything can carry and that nothing is required to be unique. I chose checking every marked block deliberately, reasoning that two markers mean two normative blocks; the reviewer is right that it means a leftover marker satisfies the check while the block that matters drifts away unmarked.

**Why.** The whole point of KN-189 was to replace an inference with a declaration, because three inferences had each been defeated by words. A declaration that any line can carry, in any quantity, is not much better than an inference: it recreates the false-pass class one layer up, and it does it silently.

**Exit condition.** The marker must be the only thing on its line, and there must be exactly ONE in a document; a second marker, an inline marker, and a stale marker above an old block with the real block unmarked are each reported by name; and each of the three is a case that fails before the change and passes after.

### `KN-193` The close recogniser is not the head token, so any command's arguments can be the close

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** none

CHILD OF KN-184, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-190 roast, which reproduced it, and confirmed by running it here. KN-190 fixed the echo INSTANCE and left the CLASS. readCommand's close test is words.includes('move') and words.includes('done') and (command === 'todo' or words.includes('todo')), so the trailing disjunct lets any command whose ARGUMENTS happen to be the close shape count as the close. Confirmed reproducer: a marked block whose lines are grep todo move <id> done, then the real roast, then the real close returns ok true, so a block that roasts BEFORE it closes passes. That is the exact defect KN-190 was opened for. Also confirmed: env echo todo move <id> done and command echo ... bypass PRINTERS because their head is not a printer; a heredoc body is parsed as separate command lines, so cat <<EOF around a close masks the order; and the roast test accepts QUOTED tokens, so grep "/tmp/roast.py" task returns roasts true. KN-190's amended exit condition literally says the close is the head token of its line, and the implementation does not do it, so the card's green verifier did not establish its own exit condition. The reviewer also noted quote interpretation happens twice, in tokenise() and again in the line.replace() used for the operator check, and the two can disagree on escaped text; fold that into the fix rather than filing it separately.

**Why.** This is the check that guards the loop's own order, and it currently passes a block that roasts before it closes. Every downstream card that trusts it is trusting nothing. It also means a closed critical card did not fix the thing it was closed for, which is the most expensive shape of wrong here: the board says the defect is gone.

**Exit condition.** The close is recognised ONLY when the head token is todo, or npm with todo among its arguments, and the remaining tokens match the close shape; the roast is recognised only from UNQUOTED tokens. Each of these is a named failing case before the fix and passing after: grep todo move <id> done, env echo todo move <id> done, a cat heredoc whose body is a close, and grep "/tmp/roast.py" task. The end-to-end reproducer in this card returns ok false with the reason naming the order. The two places that interpret quotes agree, or there is one place. The legitimate shapes still pass: todo move <id> done, todo move <id> "done", npm run todo -- move <id> done, and python <path>/roast.py task --title ... &

### `KN-194` The prompt-order source states things that are false, including that a mutation is impossible

- **status** backlog · **severity** low · **points** 1 · **area** agent
- **blocked by** none

CHILD OF KN-184, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-190 roast. I wrote comments into prompt-order.mjs, KN-190.mjs and the plan file asserting that quote handling cannot be isolated by any mutation, and that tokenisation is what separates a mention from a command, and that quoted text is data rather than command. All three are false. The reviewer produced the distinguishing fixture in one line: readCommand('todo move <id> "done"') returns closes true with quote handling and closes false without it, which I verified by patching the source and running it. Quoted tokens also still participate in the roast test. The reason I missed it is worth keeping: I searched only NEGATIVE fixtures, mentions that should not count, and every one of those fails safe by accident when quoting is disabled. The isolating fixture is a POSITIVE one, a legitimate command with a quoted argument. That is the positive-control rule already written in STATE.md, applied to mutation testing rather than to absence.

**Why.** A comment that claims a protection cannot be tested is worse than no comment: it tells the next reader to stop looking, and it converts a gap into a settled fact. Declaring something unprovable is a strong claim and it needs the same standard of evidence as any other, which here means trying the positive case before concluding.

**Exit condition.** The false claims are gone from prompt-order.mjs, KN-190.mjs and the KN-190 plan file, replaced by what is actually true. readCommand('todo move <id> "done"') is a named check in the verifier, and disabling the tokeniser's quote handling makes it FAIL, proved by the mutation harness rather than asserted. STATE.md's positive-control line names mutation testing as a place it applies, since that is where it was missed.

### `KN-195` npm run silently truncates every argument at its first newline on Windows

- **status** backlog · **severity** high · **points** 2 · **area** agent
- **blocked by** none

Found on 2026-09-10 while roasting KN-190. npm run <script> -- <args> routes through cmd.exe on Windows, and cmd.exe ends the command line at the first newline, so a multi-line argument loses everything after line one AND every flag that followed it, with no error. Proved with a free non-mutating case: node agent/scripts/todo.mjs show "KN-190<newline>JUNK" correctly reports that the whole two-line string does not exist, while npm run todo -- show "KN-190<newline>JUNK" prints KN-190's card, because the second line never arrived. This is not repeated-flag mangling, which was my first guess and is wrong. It bit for real: RALPH.md line 297 documents the task roast as npm run roast -- <id> --summary "..." --ask "...", and a genuine summary is multi-line, so every --ask was dropped and the harness refused with 'roast needs at least one --ask'. Calling node agent/scripts/roast.mjs directly works. The dangerous direction is quiet rather than loud: npm run todo -- move <id> done --evidence "<multi-line>" would record a truncated evidence string and close the card, and the same applies to --desc, --why, --exit and --note. I checked every field this session wrote through npm, six of them across KN-190, KN-193 and KN-194, and none was truncated, because I happened to build every value on one line.

**Why.** The board's evidence field is the record of how an exit condition was checked, and a close that silently stores half of it is worse than one that fails: the card looks complete. It also means the loop's own documented roast command does not work on the platform this repository is developed on, so the review step degrades to whatever fits on one line.

**Exit condition.** Either the scripts refuse an argument containing a newline with a message naming this cause, or the loop stops going through npm for anything carrying prose and RALPH.md and .claude/ralph-loop.local.md are updated to the invocation that works. A check demonstrates the truncation and its absence after the fix, using a free non-mutating command rather than a real roast. The existing board is audited for fields whose text ends mid-sentence, and the audit result is recorded whether or not it finds anything.

### `KN-196` Decide how a card is dropped onto a column that is collapsed to a count

- **status** done · **severity** critical · **points** 1 · **area** design
- **blocked by** none

KN-070 settled that the rejected column sits last and renders collapsed to a count by default, expanding on click. It did NOT settle what happens when a card is DRAGGED onto it while collapsed, and rejected is the status cards are moved into most, so this is the common case rather than an edge. Open questions, all of them the owner's or the designer's call rather than a builder's: does the collapsed column expand on hover during a drag, and after what delay; does it accept a drop while still collapsed; does the count animate or does the column open to show where the card landed; and what does the keyboard path target, since a collapsed column has no visible slot to move a card into and the keyboard alternative is part of KN-061 rather than a later improvement. Raised while doing KN-149. I nearly folded these into KN-061's exit condition as though KN-070 had already answered them; a plan check pointed out that doing so would invent a design requirement while claiming to propagate an existing one. The frames may already draw some of this, so look at the Drag and Drop Done states before asking.

**Why.** KN-061 is drag a card between columns and it cannot be built correctly against an undecided target. Left open, whoever builds it picks an answer silently and the collapsed column either becomes undroppable, which breaks the main interaction for the most-used status, or springs open on hover in a way nobody chose. Deciding it costs a conversation now and a rebuild of the drag behaviour later, which is the same trade KN-070 was settled early to avoid.

**Exit condition.** DESIGN.md records the answer as a decision with who made it and when, covering hover-expand and its delay, whether a collapsed column accepts a drop, what the user sees after the drop lands, and what the keyboard path targets. Section 6 no longer lists it as open. KN-061's exit condition names the decided behaviour, and this card is removed as its blocker.

**Roasts.** round 1 scored 4 with 2 critical(s)

### `KN-197` The order check parses shell badly instead of refusing the shapes it cannot parse

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** none

CHILD OF KN-184, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by KN-190 round 1 and reproduced here by running each case. Two confirmed false passes, one root cause. FIRST, command substitution: the line todo move <id> done "$(python <path>/roast.py task)" is read as a plain close, because the tokeniser treats a quoted run as inert data, and a shell EXECUTES $(...) before it invokes todo. The marked block of that line followed by a visible roast returns ok true while the real order is roast, close, roast. Backticks and ${...} are the same hole. SECOND, escaped quotes: UNSUPPORTED is tested against line.replace(/"[^"]*"|'[^']*'/g, ''), which is a SECOND shell parser and disagrees with tokenise() about escapes. The valid line sh -c 'python /x/roast.py task' \"; todo move <id> done \" # x has its semicolon swallowed as part of a fake quoted span, so no operator is reported, and the block passes while the shell runs the inner roast first. The reviewer's one-line judgement is the fix: stop treating shell text as tokenisable by two ad-hoc parsers. This check already REFUSES shapes it cannot order, &&, ||, a pipeline, a semicolon, a continuation, and that is the mechanism that works. Expansion and escape syntax belong in the same list rather than in a parser that gets them subtly wrong.

**Why.** A checker that half-parses a language reports a confident answer about text it did not understand, which is worse than refusing, because refusing is visible. Two independent quote parsers guarantee a disagreement exists; the only question is which input finds it. Narrowing what the check accepts turns every one of these into a loud refusal instead of a silent pass.

**Exit condition.** There is ONE place that decides what is quoted. Command substitution, backticks and parameter expansion are REFUSED by name, as && and the semicolon already are, with a message saying the order cannot be read rather than guessing. A backslash before a quote is refused too, or handled by the single parser and proved. Both reproducers in this card are named failing cases before the fix and are refused after, each with a mutation that makes the case pass again. The real prompt's lines still resolve.

### `KN-198` The required-card set is an unanchored constant, so shrinking the contract keeps the check green

- **status** backlog · **severity** low · **points** 1 · **area** agent
- **blocked by** none

CHILD OF KN-149, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-149 roast and reproduced here by running it: change DECISION.cards in agent/scripts/verify/KN-149.mjs from ['KN-043', 'KN-060'] to ['KN-043'] and all five checks still pass, exit code 0. Nothing anchors the set. The 'real sentence' guard only asks that the list is non-empty, and the count consistency check compares the loop against DECISION.cards.length, which shrinks with it. So KN-060 can be dropped from the contract silently while the card that created the contract stays green, which defeats the exit condition's plural, the CARDS that build the board. The fix is a check I had in revision 1 of the plan and lost in revision 2: assert BOTH directions. Every card the registry names carries the clause, AND every card on the board that carries the clause is named by the registry. Shrinking the registry then fails loudly, because KN-060 still carries the clause and is no longer named. Consider anchoring the count outside the verifier as well, since both directions still passes if someone removes the clause from KN-060 AND drops it from the registry in one edit.

**Why.** A check whose authority rests on a constant inside itself is a check that anyone can narrow to nothing by editing one line, and narrowing it looks exactly like passing it. The general lesson is the reason this is worth a card rather than a note: my mutation harness broke the IMPLEMENTATION eight ways and never touched the CONTRACT, so it proved the code enforces the registry and said nothing about whether the registry is the right one.

**Exit condition.** The verifier fails when a card carrying the canonical clause is not named by the registry, and fails when a named card does not carry it. Shrinking DECISION.cards to ['KN-043'] is a named failing case, run as a mutation against the real verifier rather than argued. Whether a single edit that removes the clause from a card AND drops that card from the registry can be caught is answered in the check's own header, honestly, including a plain no if that is the answer.

### `KN-199` KN-060 asks a reusable column component to own where the rejected column sits on the board

- **status** done · **severity** high · **points** 1 · **area** design
- **blocked by** none

CHILD OF KN-149, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-149 roast, and I had raised it against myself in the questions sent with that roast, so this is agreed rather than contested. KN-149 put one identical clause into both KN-043 and KN-060: the rejected column is last, after the offer column, and renders collapsed to a count by default, expanding on click. Position on the board is the SCREEN's business, KN-043. KN-060 is a reusable column component and does not know which column it is or what sits beside it. As written its exit condition asks its implementer for something they cannot deliver from inside the component, and the likely response is to special-case layout in the component, which is the defect KN-149 existed to prevent, one card over. Split by ownership: KN-043 keeps position plus the collapsed default, KN-060 keeps the ability to render collapsed to a count and expand on click. Two clauses, each contracted to the card that can honour it, and KN-149's verifier registry becomes a clause per card rather than one shared string.

**Why.** A card that demands something its scope cannot deliver is worse than a card that is silent, because the person building it will find SOME way to satisfy the words, and the way available inside a component is to hard-code the board around it. Components before screens is the owner's standing rule, and it only works if a component's contract stops at what the component owns.

**Exit condition.** KN-043's exit condition names the rejected column's position after the offer column and its collapsed-to-a-count default; KN-060's names rendering collapsed to a count and expanding on click, and says nothing about where the column sits. KN-149's verifier requires the right clause of each card rather than one shared string, and a mutation that swaps the two clauses between the cards is caught.

### `KN-200` The order check has never been run against a real loop prompt, and neither prompt carries the marker

- **status** backlog · **severity** low · **points** 2 · **area** agent
- **blocked by** KN-171

Found on 2026-09-10 while planning KN-193, and verified three ways. FIRST, grep for roast-order across the repository returns only roast archives, one plan file and the rendered TODO_BOARD. agent/RALPH.md contains the marker ZERO times and .claude/ralph-loop.local.md contains it zero times. SECOND, every call site of closesBeforeRoasting is a synthetic fixture: eleven in KN-184.mjs and four in KN-190.mjs, all built by local block builders. No verifier reads either prompt. THIRD, running it against them by hand returns ok false, 'no block is marked', for both. So lib/prompt-order.mjs has been written, defeated and rewritten across KN-184, KN-189 and KN-190, and is about to be rewritten again by KN-193 and KN-197, while checking nothing. Meanwhile the defect it exists to catch is present RIGHT NOW in the file the Stop hook actually feeds the loop: .claude/ralph-loop.local.md roasts at step 4, roasts the roast at step 5, and closes at step 6, which is the order the owner reversed on 2026-09-10. KN-171 already carries that specific fix. This card is the other half, the reason it was never caught. The work is to put a marked block in both prompts and to have a verifier run the check against the real files, so a regression fails instead of being invisible.

**Why.** An instrument with no subject reports success forever. Four cards of effort went into making this check hard to fool, and none of that effort has ever been applied to a document that matters, which is why the wrong order has sat in the live loop prompt through every one of them. This is the most expensive shape of wrong in the repository, a green check over an unexamined thing, and it is the shape STATE.md already names twice under absence proving nothing.

**Exit condition.** agent/RALPH.md and .claude/ralph-loop.local.md each carry exactly one marked block, and a verifier runs closesBeforeRoasting against BOTH real files by path rather than against a fixture, failing if either is unmarked, ambiguous or reversed. The check is proved by mutation on the real files: reversing the two lines in each prompt makes it fail, and removing a marker makes it fail with the unmarked reason. Any verifier that would pass when handed a file containing no marked block at all is a defect, and the check for that is named. KN-171's fix to the prompt's order lands with or before this, since a marked block that records the wrong order is worse than none.

### `KN-201` The docs guard only sees export const stories, so other valid CSF exports need no documentation

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-007, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-007 roast and REPRODUCED here: I appended 'export function KeyboardOnly() { return null }' to LanguageSwitch.stories.tsx and the guard passed, 8 tests green, with no markdown entry for it. readStoryFile's AST walk collects story names only from ts.isVariableStatement, so a function-declaration export and an export-list export (export { Foo }) are invisible to it. That makes KN-007's stated exit condition, adding a story with no markdown entry fails the guard, FALSE for every CSF export form except export const. The same walk has a second hole with the same shape: 'component' is read only when it is an identifier, and the prop check then does 'if (!entry.component) continue', so a meta with an inline component expression skips prop documentation entirely and silently. Both are the AST reading being narrower than the thing it claims to cover, and both are fixed in the same function.

**Why.** This guard is the foundation twenty component cards are about to be built on, and its whole value is that nobody can forget to document a story. A hole that depends on which syntax an author happened to use is worse than no guard, because the green result is read as permission. The skip on a missing component is the more dangerous of the two: it fails OPEN by design, so the less a meta declares, the less it is asked for.

**Exit condition.** The guard collects story names from every CSF export form: export const, export function, export class, and an export list. Each is a named failing case, planted in a real story file and run against the real guard, before the fix and passing after. A meta whose component is not a plain identifier is REPORTED rather than skipped, so the prop check never silently declines to run; if the component genuinely cannot be resolved, the guard says so and fails. The mutation that must survive: the existing export const stories keep working.

**Roasts.** round 1 scored 4 with 1 critical(s)

### `KN-202` The story-docs markdown contract is documented as rigid but silently accepts malformed files

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-007, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-007 roast. parse.ts calls its format rigid and says the guard CHECKS it rather than reads it, but two malformed shapes pass silently. An unknown level-two section, say ## Accessibility written after the stories, is not a section the parser knows, so every line under it is folded into the PREVIOUS story's prose instead of being reported. And a duplicate ### name overwrites the earlier entry with no complaint, so documenting a prop twice quietly discards the first attempt. Neither is caught anywhere: parse.ts returns a best effort and the guard only compares the names it got back.

**Why.** An author who writes a section the format does not support gets no error, sees their prose swallowed into the wrong entry, and concludes the docs system is unreliable. That is the failure mode that gets a documentation convention abandoned, and it is the one this card exists to prevent, since twenty component cards are about to be written against this format.

**Exit condition.** parseStoryDoc reports a malformed file rather than absorbing it: an unknown level-two heading and a duplicate level-three name are each errors with their own message naming the file and the heading. The guard surfaces them. Both are unit tests, and a mutation removing either rejection makes its test fail. The existing eight docs files still parse unchanged, proved by the guard still passing.

### `KN-203` The Docs page reads its initial language from undocumented Storybook internals and fails silently to Persian

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-007, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-007 roast, and I had named it as the risk when sending that roast. localeInContext probes DocsContext at four guessed shapes because Storybook publishes no accessor for the current globals. If a Storybook upgrade moves all four, the page falls back to the product default and shows Persian regardless of what the toolbar or the URL actually says, and the channel listener does not repair it until somebody changes the toolbar by hand. Nothing fails: the page just quietly shows the wrong language, which is the exact failure the Language toolbar exists to make visible. The related half is that DocsPage.tsx and useDocsLocale.ts are excluded from coverage, so no automated test protects the subscription either; the exclusion is argued in vitest.config.ts and the argument may be right, but the consequence is that this whole path is checked by hand or not at all.

**Why.** A silent fallback to the default language is indistinguishable from working correctly whenever the default happens to be what you wanted, which for this product is most of the time. It would be found by a reader who does not read Persian, which is the worst possible discovery path.

**Exit condition.** The Docs page either resolves the initial locale from something Storybook supports, or FAILS LOUDLY when it cannot, rather than defaulting silently: a visible note on the page saying the language could not be determined is enough, since a Docs page has somewhere to put it. A test covers the resolution path, or the reason it cannot be tested is recorded with the same evidence any other untestable claim needs in this repository.

### `KN-204` KN-201 closed on a verifier that never tested one of its own exit-condition clauses

- **status** done · **severity** high · **points** 1 · **area** agent
- **blocked by** none

CHILD OF KN-201, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-201 roast and confirmed by grep: agent/scripts/verify/KN-201.mjs contains ZERO tests planting a meta whose component is not a plain identifier, although the card exit condition names it and the evidence claims four mutations caught including that one. The protection is real, the scratchpad harness proved it, but the COMMITTED artifact does not, so the claim is not reproducible from the repository. This is the KN-190 failure again in a milder form: green checks standing in for a clause nothing tests. Two more from the same round. The verifier writes into a TRACKED story file and restores it in a finally, which handles normal unwinding but not a kill or a crash mid-write, and this runs on every close of the card. It should work on a copy, or the guard should accept a directory to scan. And apps/web/src/shared/story-docs/guard.test.ts line 95 uses (error as Error), which AGENTS.md section headed No TypeScript escape hatches without asking forbids, and which is the ONLY such cast anywhere in apps/web/src or apps/api/src. It should be error instanceof Error ? error.message : String(error).

**Why.** A verifier that does not test a clause of its own exit condition is the exact thing this repository has now been burned by twice, and the second time it was in the fix for the first. The escape hatch is smaller but worse in one way: it is a standing rule broken in committed code, and it was the only instance in the whole application, so leaving it makes the rule negotiable.

**Exit condition.** KN-201.mjs plants a meta whose component is not a plain identifier, at least the two real shapes memo(Thing) and an inline arrow, and requires the guard to FAIL naming the file; that case fails before the guard fix and passes after. The verifier no longer leaves a tracked file modified if it is killed mid-run, or the residual risk is stated in its header with the reason it is accepted. The as-Error cast is gone, replaced by an instanceof narrowing, and no cast of that shape exists in apps/web/src or apps/api/src, checked rather than assumed.

### `KN-205` The Checkbox hover and focus selectors reach the glyph, so the tick gets its own outline

- **status** done · **severity** high · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-013, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-013 roast and REPRODUCED in a browser: the frame and the inner glyph are BOTH MuiBox-root, because the glyph is a Box rendered as an svg and MUI puts that class on every Box. The two descendant selectors in Checkbox.tsx, the hover one and the focus-visible one, therefore match two elements rather than one. Querying MuiBox-root inside a focused Checked story returns a DIV and an svg, and computed outline is 2px solid on BOTH. So tabbing to a checked or indeterminate checkbox draws a blue outline around the white 12px tick as well as around the frame. It is invisible on hover only because the glyph has no border to recolour, which means the same mistake is sitting unnoticed in the hover rule too. The fix is to stop selecting by a library class name: give the frame a marker the component owns and scope both rules to it.

**Why.** This is the FIRST component of the library and 37 more cards are queued behind it, so its shape is the template. A styling rule that reaches into another library's internal class names, and that happens to match a second element, is exactly the pattern not to copy 37 times. It is also a visible wrong state rather than a theoretical one.

**Exit condition.** The hover and focus rules are scoped to a marker the component owns rather than to a MUI class. Focusing a Checked and an Indeterminate checkbox outlines the FRAME ONLY, asserted by reading computed outline on every descendant and requiring exactly one to carry it. A mutation restoring the old descendant selector makes that assertion fail. The five Figma states still match tokens.

### `KN-206` The Checkbox has no accessible name and a target smaller than WCAG allows

- **status** backlog · **severity** critical · **points** 3 · **area** web
- **blocked by** none

CHILD OF KN-013, recorded in prose because board.json cannot express parent_task yet, KN-188. Two halves of one problem: the control is not yet usable in the places it is actually for. FIRST, no accessible name is guaranteed. aria-label and aria-labelledby are both optional, there is no id prop at all, and every story renders a control with no name, so the canonical examples model the unusable case. A board card needs something like Select Senior React developer at X, and a column header needs Select all Applied. A checkbox announced as merely checkbox is unusable by screen reader precisely where bulk selection matters most. SECOND, the interactive target is 20 by 20 because padding is explicitly zero, and WCAG 2.5.8 asks for 24 CSS pixels unless the spacing exception applies. The component comment claims the hit area comes back through a label that wraps it, which is neither implemented nor sufficient for an icon-only control on a card. Both were found by the KN-013 roast and both are true by inspection.

**Why.** Bulk selection is the feature this component exists for, and the people most likely to select in bulk are the ones a missing accessible name excludes. A 20 pixel target on a card that also drags is hard to hit for anyone, not only for people with motor impairments. Neither is a detail that gets fixed later once 37 components have copied the shape.

**Exit condition.** The component takes an id, and rendering one with no accessible name is impossible without it being visible: either the type requires one of aria-label, aria-labelledby or a wrapping label, or a check fails on a story that omits all three. Every story names its control. The interactive target is at least 24 by 24 while the DRAWN frame stays 20 by 20 from Figma, or the spacing exception is demonstrated for the specific placement and written down. A test asserts the hit area, not the frame.

### `KN-207` The Checkbox breaks two standing repository rules: prose in the tsx, and no fn() on the callback

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-013, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-013 roast, and I checked both claims against AGENTS.md rather than taking them on trust. Both are real. AGENTS.md, under Documentation lives in markdown never in the code: a tsx carries code and the SHORT comments that explain the code, and everything a Storybook Docs page prints belongs in story-docs. Checkbox.tsx carries long design and API documentation blocks, and its per-prop JSDoc is exactly what react-docgen prints into the Controls table, so that prose is duplicated: once in the tsx and once in the markdown the guard already requires. The markdown is the source; the JSDoc should be short or gone. AGENTS.md line 246: every callback prop gets an fn() so the Actions panel records it. onChange has none, and nothing asserts its documented event and checked contract.

**Why.** A rule that the first component of the library breaks is a rule the next 37 will break, and the reason the prose rule exists is that documentation kept in two places drifts. The fn() rule is smaller but it is the difference between a story a reviewer can interact with and one where nothing visible happens.

**Exit condition.** Checkbox.tsx carries only comments that explain the code, and no prose that a Docs page prints; the prop descriptions live in story-docs, which already have them. onChange has an fn() in the shared args and a story asserts it is called with the event and the new checked value. A check catches a callback prop with no fn(), so this does not rest on remembering.

**Roasts.** round 1 scored 5 with 0 critical(s)

### `KN-208` KN-013 claimed five Figma states from five stories that are not the five states

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-013, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-013 roast. The card names five Figma states, Unchecked Checked Indeterminate Hover and Disabled, and the story file exports Unchecked Checked Indeterminate Disabled and KeyboardOnly. HOVER HAS NO STORY. KeyboardOnly is worth having and is behaviour coverage, not a design state. So KN-013.mjs, which asserts that five stories pass in a real browser, proves five stories ran and NOT that the five drawn states are covered, while reading as though it did. I verified hover by hand with a real pointer and recorded that in the evidence, so the state itself is correct; what is missing is anything that would catch it changing. This is the KN-190 shape again: a green count standing in for a clause nobody tests.

**Why.** A verifier whose passing message implies more than it checked is worse than a missing check, because it stops anyone looking. Hover is also the one state that cannot be asserted from a story that never hovers, so it stays unproven by default unless something forces it.

**Exit condition.** Every Figma state named on the card has a story, hover included, and hover is exercised with a real pointer rather than a dispatched event, since hover cannot be dispatched. KN-013.mjs checks the states by NAME against the card rather than counting stories, so adding a sixth story or renaming one cannot silently satisfy it. A mutation deleting the hover story fails it.

**Roasts.** round 1 scored 7.8 with 0 critical(s)

### `KN-209` The tooltip REPLACES an icon-only control's accessible name instead of describing it

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-032, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-032 roast and REPRODUCED in a browser, and it is worse than the finding said. I put aria-label='Delete this status' on the trigger, focused it, and read the attributes back: MUI had added aria-labelledby pointing at the tooltip. ARIA precedence puts aria-labelledby ABOVE aria-label, so the button's accessible name becomes the tooltip text and its own label is discarded entirely. That is MUI's documented default: a tooltip LABELS its child unless describeChild is set, in which case it DESCRIBES it through aria-describedby. For an icon-only control, which the card says is the whole reason this component exists, labelling is exactly wrong: the button stops being 'Delete this status' and becomes a paragraph about moving jobs to another column. The fix is describeChild on the MUI Tooltip. What is missing is not only the prop but the test: not one of the six checks looks at the accessible name, so the component's central accessibility claim is unasserted.

**Why.** This component exists so icon-only controls have a visible label as well as an accessible one, and as shipped it takes the accessible one away. A screen reader user tabbing to a delete button is told a sentence about columns rather than that it deletes. It is also silent: nothing visual changes, and the tooltip looks perfect.

**Exit condition.** The tooltip DESCRIBES rather than labels: a trigger with its own aria-label keeps that name, and the tip is reachable through aria-describedby. A story asserts the computed accessible name of an icon-only trigger while the tip is open, and a mutation removing describeChild makes it fail. The case where the trigger has NO name of its own is decided deliberately and written down, because describing something unnamed leaves it unnamed.

**Roasts.** round 1 scored 7.2 with 0 critical(s)

### `KN-210` The tooltip's drawn width is neither implemented nor checkable

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-032, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-032 roast, and I had flagged it against myself when sending that roast. Figma node 410:469 is 292 wide. Nothing in the component sets a width or maxWidth, so wrapping comes from MUI's 300px default. For the one string in the frame the two are close enough to look identical, which is why it passed a visual check; for a longer title they wrap differently. The honest uncertainty is whether 292 is a SET width or just the natural wrap of that particular sentence. get_variable_defs returns no width variable for the node, so it cannot be settled from the variables alone and needs the frame's own layout properties. Until that is known, the component has an unstated dependency on a third-party default, and the evidence for KN-032 said the width was the one dimension not taken from a token without resolving it.

**Why.** A dimension that comes from a library default rather than from the design is invisible until the library changes it or a longer string wraps somewhere the file does not. It is also the exact shape of thing 'match the design exactly' exists to catch, and this one was noticed and then left.

**Exit condition.** Either the component sets the width the frame actually specifies, from the frame rather than from the screenshot, or DESIGN.md records that the frame has no fixed width and that wrapping is content driven, with the component's reliance on a default stated where a reader will find it. A test pins whichever answer is true, so a MUI default change is caught rather than absorbed.

**Roasts.** round 1 scored 3.5 with 2 critical(s)

### `KN-211` The tooltip accepts triggers it cannot actually attach to

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-032, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-032 roast. children is typed ReactElement, which admits a Fragment and admits any component that does not forward the props and ref MUI injects. MUI attaches its hover and focus listeners by cloning the child, so for those triggers the tooltip silently never opens. Every story uses a native button, so all six checks pass while the case an icon-only wrapper component hits is untested. That matters immediately: KN-014 builds the Icon button, and it is the trigger this component is for.

**Why.** A component that fails silently for a whole class of valid-looking input is worse than one that refuses: the caller gets no error, no warning, and a tooltip that simply never appears, which reads as their own mistake. The first real caller will be an icon button wrapper, which is precisely the shape at risk.

**Exit condition.** A trigger that does not forward props is either impossible to pass, by typing, or produces a clear failure rather than silence. A story covers a WRAPPER component trigger and not only a native button, and it fails if the wrapper stops forwarding. The Fragment case is handled or explicitly documented as unsupported.

**Roasts.** round 1 scored 4 with 1 critical(s)

### `KN-212` The tooltip stories are Persian-only, so the four language and theme combinations cannot be checked

- **status** backlog · **severity** critical · **points** 1 · **area** web
- **blocked by** KN-221

CHILD OF KN-032, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-032 roast. Both the tip text and the trigger label are Persian literals in the story args, so switching the Storybook Language toolbar to English changes nothing on screen. AGENTS.md section 5 requires every change to be seen in fa-IR and en-US, light and dark, and for this component two of those four are the same picture. The tip text is legitimately caller-provided and NOT a catalog message, so the fix is not to translate the component; it is that the STORY should pass something that changes with the locale, the way the FilterChip stories do. The lint rule does not catch it because the stories block exempts title, which is what the tooltip prop is called.

**Why.** The four-combination rule exists because English strings are longer and the direction flips, and a tooltip is a box sized by its text: it is one of the components most likely to break on a longer string. A story that shows the same Persian in both languages cannot show that.

**Exit condition.** At least one story renders text that actually changes with the Language toolbar, so English and Persian are visibly different, and the component is seen in all four combinations. Whether the lint exemption for title should be narrowed is answered either way rather than left, since it is what let this through.

### `KN-213` The browser preflight does not stop KN-003, and KN-089 proves its order by reading source text

- **status** backlog · **severity** low · **points** 1 · **area** agent
- **blocked by** none

CHILD OF KN-089, recorded in prose because board.json cannot express parent_task yet, KN-188. Two findings from the KN-089 roast, filed as one card because they are one fix and its proof. FIRST, confirmed by reading the code: check() in agent/scripts/verify/KN-003.mjs pushes a failure onto a list and returns, and nothing exits until the summary at the end. With Chromium absent the browser check fails first, then lint, the type checker, npm test and the builds all run anyway, and npm test adds the opaque missing-executable failure to the same list. The named message is first in that list, but it is printed after minutes, not in a second. The KN-089 evidence says the failure 'lands in a second rather than after minutes of lint and tsc', and the comment above the check says the same. Both are false. SECOND, confirmed: agent/scripts/verify/KN-089.mjs checks the order by finding the first 'chromiumStatus(' in the raw file and testing that it sits inside the first check block. A comment holding that text, or an 'if (false)' call, satisfies it while the real preflight is moved or its result thrown away. The injection test beside it only proves the message formatter, not that KN-003 prints it. Also from the roast: when the playwright PACKAGE cannot be loaded, the reason names no command, and the fix there is npm install, not setup:browsers.

**Why.** The only reason to put the browser check first was so nobody waits minutes for a failure that was knowable at once; a check that runs first and stops nothing buys none of that. It is also a false statement in closed evidence, and a verifier a comment can satisfy is the self-matching check again. The roast rated it critical against KN-089's own purpose. Filed LOW because it is gate tooling, nothing is broken on a machine that has the browser, and the loop rule of 2026-09-10 puts loop findings at low unless they are breaking the work.

**Exit condition.** Running KN-003.mjs with PLAYWRIGHT_BROWSERS_PATH pointed at an empty directory exits non-zero after the browser check alone, prints Chromium by name with the path and the command, and starts no lint, type-check or test process. KN-089.mjs proves that by RUNNING it that way rather than by reading its source, and a mutation that moves the preflight after lint, or discards its result, makes KN-089.mjs fail. A missing playwright package names npm install.

### `KN-214` The lingui gate exempts every Persian string and most English words, because its no-letter pattern is compiled without the u flag

- **status** backlog · **severity** high · **points** 5 · **area** web
- **blocked by** none

Found while working KN-095, by reading eslint-plugin-lingui 0.14.0 rather than by probing. The rule compiles every entry of the ignore option with new RegExp(item) and NO flags. The first entry in apps/web/eslint.config.js is '^[^\\p{L}]*$', meant as 'anything with no letter in it'. Without the u flag, \p is not a Unicode property escape, it is a plain p, so the class excludes only the four characters p, {, L and }. Every string that contains none of those four is whitelisted before any other check runs. Proved with the plugin's own construction: 'Delete', 'Save', 'Cancel', 'Close', 'مصاحبه' and 'حذف وضعیت' are all whitelisted; 'Delete this application' is not, only because 'application' has a p. Every committed gate fixture happens to contain a p, which is the only reason the gate has ever looked like it worked. A probe with a pattern that means what it says found 82 strings in apps/web/src passing only because of this. About five are real untranslated copy: the health reason 'the API answered with nothing' (KN-130), the language names (KN-115), the Persian args of the FilterChip and Tooltip stories, and the story-docs fallback message. The rest are identifiers the rule now correctly sees and must be answered one class at a time: hex colours in tokens.ts, CSS and DOM selectors, Storybook control types and layout values, event names, import.meta.glob options, locale codes, SVG attribute values.

**Why.** 'Every user-facing string goes through lingui with an ENGLISH id' is the rule the whole i18n design rests on, and the gate that enforces it has been passing almost all copy since the day it was written: all of the Persian, and every English word without a p. Sixty-five component cards are about to be built on that guarantee, and each one would report a clean lint over untranslated labels. It also explains why three roasts in a row found the rule's exemptions too wide and none found this: every probe string they used contained a p.

**Exit condition.** The no-letter entry is replaced by one that works WITHOUT flags, since the plugin passes none, and fails closed: only digits, whitespace, punctuation and symbols are exempt, so a letter in any script is checked. 'Delete', 'Save', 'مصاحبه' and 'حذف وضعیت' each fail npm run lint in a committed fixture, as aria-label, as title and as JSX text, and the existing fixtures fail only on the string under test rather than also on a child like x. Every one of the 82 strings is either localised or exempted by a named, scoped rule with a reason, never by a value shape. A check compiles each ignore entry exactly as the plugin does, new RegExp(entry) with no flags, and fails if any entry whitelists a known copy string, and that check is proved by a mutation restoring the \p{L} entry.

### `KN-215` The props and stories value exemption is global, so aria-label="stories" passes

- **status** backlog · **severity** medium · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-094, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-094 roast and confirmed from the config: '^(props|stories)$' sits in the ignore array, which applies to every string in every file, so aria-label="stories" and title="props" pass. It exists for one comparison in the story-docs parser, and the comment above it says it is 'named rather than shape-matched', which is true of the value and says nothing about where it applies. The rule's useTsTypes option already exempts a literal whose contextual type is a union of string literals, so a typed constant in the parser makes the exemption unnecessary.

**Why.** It is the same scope bug KN-087, KN-094 and KN-095 each closed a different instance of: an exemption written for one comparison that quietly applies to the whole codebase. The words themselves are unlikely copy, which is why it is medium rather than high, but a fourth instance left open after three were closed is the pattern continuing.

**Exit condition.** aria-label="stories" and title="props" fail npm run lint in a committed fixture, the story-docs parser still recognises both headings, and the ignore array no longer names them.

### `KN-216` The Storybook stories glob drops a story at the root of src, and the docs guard excludes by a different rule

- **status** backlog · **severity** medium · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-095, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-095 roast and confirmed from the glob: '../src/!(gate-fixtures)/**/*.stories.@(ts|tsx)' needs at least one directory segment after src, so src/App.stories.tsx would be silently absent from Storybook and from the addon-vitest project, which reads the same configuration. The docs guard, meanwhile, globs every story and excludes 'gate-fixtures/**', so it would still demand documentation for a story Storybook never shows. No current story is lost, since every story lives in a component folder, but the two lists are now two models of the same thing, and KN-095.mjs compares only the files that exist today, so it cannot see the drift.

**Why.** A story that silently is not a story is a component that is silently untested: it never renders in the browser project and never reaches the published library, and nothing fails. Two exclusion rules for one set of files is the shape of a drift nobody notices until it has happened.

**Exit condition.** A story file directly under src is indexed by Storybook and run by the storybook project, src/gate-fixtures is still excluded from both, and the docs guard derives its list from the same rule Storybook uses rather than a second one, proved by a fixture at the root of src that appears in Storybook's index and in the guard alike.

### `KN-217` A string literal written 'as const' skips the lingui rule entirely, in any file

- **status** backlog · **severity** high · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-095, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-095 roast and confirmed in eslint-plugin-lingui 0.14.0: the rule returns early for any literal whose direct parent is an 'as const' assertion, BEFORE the type check and before every other exemption. So <Box title={'Delete this application' as const} /> passes npm run lint in any file in src, product or story, and so does a story meta title written that way, which also bypasses the StoryMeta type KN-095 introduced, because the meta can then use plain Meta. A bare string literal almost never needs 'as const': a const binding or a contextual type already gives it a literal type.

**Why.** Every exemption this rule has had was written for one legitimate case and covered every case, and this one needs no configuration at all: it is built into the plugin. It is an escape hatch in the same sense AGENTS.md already forbids 'as' for, a place where the checker is told to stop checking, and it applies to accessible names and tooltips exactly as much as to anything else.

**Exit condition.** <Box title={'Delete this application' as const} /> and aria-label={'Delete' as const} fail npm run lint in a committed fixture, a story meta title written with 'as const' fails too, and 'as const' on an object or array literal, which is the idiom that is actually used, still passes.

### `KN-218` The tooltip pads 12 where Figma pads 8 vertically, and draws no shadow where Figma draws one

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

Found while working KN-210, from get_design_context on node 410:469 rather than from a screenshot. The frame is px spacing-sm (12) and py spacing-xs (8); the component pads spacing.sm on all four sides, so every tip is 8px taller than the design. The frame also carries a drop shadow, 0 6px 18px -2px at 24 percent black, and the component sets none. get_variable_defs shows the shadow is NOT bound to an effect style: it matches neither Elevation/Card nor Elevation/Modal, which DESIGN.md says are the only two. So it is an unnamed third shadow, and the decision is whether the token set gains a third elevation or the tooltip is mapped to an existing one. Match-the-design says the former, recorded in DESIGN.md in the same change.

**Why.** Both were missed by KN-032's check, which asserted that the right TOKENS were referenced and not that they were applied to the right sides, so a padding of 12 everywhere read as correct because 12 is a real token. The shadow is the only thing separating a dark tip from a dark page in the dark theme.

**Exit condition.** A story measures the open tip's computed padding as 8 top and bottom and 12 at each side, and its computed box-shadow as the value read from node 410:469; that value lives in the token set beside Card and Modal and is recorded in DESIGN.md's elevation table with the node it was read from; and a mutation restoring padding 12 on all sides fails the story.

**Roasts.** round 1 scored 7.5 with 0 critical(s)

### `KN-219` KN-013's verifier reads the required states out of a prose sentence

- **status** backlog · **severity** low · **points** 1 · **area** agent
- **blocked by** none

CHILD OF KN-208, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-208 roast and confirmed: cardStates() in agent/scripts/verify/KN-013.mjs takes the KN-013 description up to the first ' from Figma' and splits it on commas and 'and'. A state added later in the sentence, or in a second sentence, is invisible to it, and the title's count cross-check only notices when the title is updated too.

**Why.** The check was written to stop a count standing in for names, and it now depends on a sentence keeping one exact shape. It is verifier tooling and nothing is wrong with the Checkbox, so it is low, per the loop rule of 2026-09-10.

**Exit condition.** The required state list is read from a delimited, structured source that a reworded description cannot silently shorten, or KN-013.mjs refuses a description it cannot parse completely, proved by a description with a state added in a second sentence failing it.

### `KN-220` The Checkbox Hover story passes on its baseline alone if the test runner cannot load its pointer

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-208, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-208 roast and confirmed: the story catches EVERY rejection of import('vitest/browser') and returns, so under Vitest a resolution or initialisation failure makes Hover pass after asserting only the unhovered border. KN-013.mjs notices, because its two hover mutations then fail to fail, but an ordinary npm test does not. The fallback is meant only for Storybook's own UI, where there is no test runner, and Storybook's addon tells the two apart with globalThis.__vitest_browser__.

**Why.** A story that turns an infrastructure failure into a pass is a test that can go green having tested nothing, which is exactly what KN-208 was filed to stop. Raised to critical with the other component findings, on the owner's order of 2026-09-10 to finish the components first.

**Exit condition.** Under Vitest the Hover story imports the pointer API without a catch and fails loudly if it cannot, the published Storybook still renders it as a canvas with no error, and a mutation making the import fail under Vitest fails the story rather than passing it.

**Roasts.** round 1 scored 3.8 with 2 critical(s)

### `KN-221` The catalogs are never compiled, so a message with a count or a placeholder renders raw ICU in production

- **status** backlog · **severity** critical · **points** 3 · **area** web
- **blocked by** none

Found while working KN-212, and reproduced rather than inferred. src/i18n/locales/*.ts are hand-written maps loaded straight into i18n.load, and nothing compiles them. @lingui/core 6.6.0 compiles an ICU message at runtime ONLY outside production: with NODE_ENV unset, 'This status has {count, plural, one {# job opportunity} other {# job opportunities}}...' rendered as 'This status has 3 job opportunities...' and the Persian as '...۳ فرصت شغلی...'; with NODE_ENV=production, which is what vite build sets for the deployed app and the published Storybook, both rendered the raw '{count, plural, ...}' text and lingui printed 'Uncompiled message detected'. Nothing is broken today only because no message has a placeholder yet. The designed tooltip copy on node 410:469 has a count, and so will column headers, the bulk action bar and every other 'N job opportunities'. @lingui/vite-plugin, cli and format-po are already dev dependencies, which is the intended route; KN-110 wires extraction on the same path.

**Why.** It is a production-only failure, the worst kind: development and the test suite, which do not set NODE_ENV to production, render every message perfectly, and the deployed site shows the user curly-brace syntax. It blocks KN-212, whose story needs the tooltip's real counted sentence, and every component whose copy carries a number. Critical on the owner's order of 2026-09-10: the components wait on it.

**Exit condition.** A message with a plural and a placeholder renders correctly in BOTH locales in a production build, checked by rendering it from the built output or under NODE_ENV=production rather than in development, with Persian digits in fa-IR; a mutation that loads the catalogs uncompiled again makes that check fail; and the catalog tests still prove every English id has a non-empty Persian translation.

### `KN-222` The tooltip's 260 depends on the app's CSS reset, and the story finds the surface by its DOM position

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-210, recorded in prose because board.json cannot express parent_task yet, KN-188. Two findings from the KN-210 roast, both rated critical by the reviewer, filed as one card because they are the same lines and the same test. FIRST: the tooltip surface sets width 260 and padding 12 but no box-sizing, so it is 260 outer only because AppProviders renders CssBaseline, which makes everything border-box; under a bare ThemeProvider the same surface is 284. SECOND: the OnHover story measures the firstElementChild of the element carrying role=tooltip, which is MUI's popper, so it relies on MUI placing the drawn surface first; a transition wrapper of the same width would pass while measuring the wrong element. My own view is that both are major rather than critical, since every real render sits under CssBaseline and the current DOM is correct, but the board records the reviewer's rating and the fixes are one line each.

**Why.** A component whose drawn size depends on a global reset it does not own is correct by accident, and a test that finds its subject by position is checking whatever happens to be first. KN-210's whole point was to stop the width depending on something the component does not state. Critical on the owner's order of 2026-09-10, with the other component findings.

**Exit condition.** The tooltip surface sets its own box-sizing, and a story rendering it WITHOUT CssBaseline measures 260; the width story finds the surface by a marker the component puts on the tooltip slot itself rather than by DOM position; and a mutation removing the box-sizing fails the no-reset story.

**Roasts.** round 1 scored 4 with 1 critical(s)

### `KN-223` The tooltip's fixed-width policy is unstated, and no story shows a short or an overlong title

- **status** backlog · **severity** critical · **points** 2 · **area** web
- **blocked by** KN-221

CHILD OF KN-210, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-210 roast and confirmed: the component now makes every tip exactly 260 wide, which is what node 410:469 specifies, so a one-word title sits in a mostly empty 260 box and a long one wraps downward without limit. Figma draws one specimen, three lines, and its description says the tooltip's only current use is beside the disabled delete-status option. Nothing tells the next caller that the fixed width is deliberate, or what happens past three lines, and no story shows either case.

**Why.** A component's limits belong where its caller reads, and a caller who sees a 260 box around one word will assume it is a bug and override it. Critical on the owner's order of 2026-09-10, with the other component findings.

**Exit condition.** The story docs state, in both languages, that the width is fixed at the frame's 260 by design and what a long title does, and two stories render a short and an overlong title through lingui, each asserting the 260 width and the long one asserting it wraps rather than overflows.

### `KN-224` The tokens.ts lingui exemption has no TECH-DEBT record and nothing stops copy being added to the file

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-218, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-218 roast and confirmed against AGENTS.md section 6: nothing gets silenced without an entry in TECH-DEBT.md, and that covers ignore patterns. KN-218 added src/theme/tokens.ts to the lingui block's ignores and wrote the reason only into eslint.config.js. It also added nothing that would notice copy arriving in that file: today every literal in it is a design value, but a label or helper string added there later would pass the lingui rule without a word.

**Why.** It breaks a standing repository rule, in the one config the i18n guarantee rests on, and the exemption is only safe for as long as the file stays copy-free, which nothing checks. Critical on the owner's order of 2026-09-10 with the other findings on built components, since KN-218 was one.

**Exit condition.** TECH-DEBT.md has an entry for the tokens.ts exemption in the file's what, why, fix and retiring-check format, and a unit test fails if any string exported from src/theme/tokens.ts is not a design value, a colour, a length, a shadow or the font stack, proved by a mutation adding a copy string to the file.

**Roasts.** round 1 scored 2 with 3 critical(s)

### `KN-225` The Hover story tells Vitest from Storybook by an undocumented Vitest internal

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-220, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-220 roast and confirmed: the story returns early unless globalThis.__vitest_browser__ exists, and that global is a Vitest internal that Storybook's addon happens to read, not a documented API. If an upgrade renames it, every Hover run under Vitest takes the Storybook-UI branch and passes on the unhovered assertion: the exact false pass KN-220 closed, back without a single file in this repository changing. KN-013.mjs would notice through its hover mutations, but nothing in npm test or CI runs it.

**Why.** A guard keyed to someone else's private name moves when they rename it, silently. The repository can own the signal instead: the storybook project's Vitest setup file is loaded only under Vitest and is version-controlled. Critical on the owner's order of 2026-09-10 with the other findings on built components.

**Exit condition.** The story checks a flag this repository sets in the storybook project's Vitest setup, not a Vitest internal; the published Storybook still takes the canvas branch with no error; and a mutation removing the flag from the setup file fails the Hover story under npm test rather than passing it.

**Roasts.** round 1 scored 4.5 with 1 critical(s)

### `KN-226` Nothing committed checks that the published Storybook renders its stories without errors

- **status** backlog · **severity** critical · **points** 3 · **area** infra
- **blocked by** none

CHILD OF KN-220, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-220 roast and confirmed: the published path of the Hover story was proved by a scratch Playwright script against a production Storybook build, and that script is not in the repository. CI builds and publishes Storybook without opening a single story. The storybook Vitest project runs stories against the DEV build, so a failure that only exists in the production build, like a story importing a test-only module, ships to the public library unseen. The browser pane cannot stand in for it either: while hidden it runs no animation frames, so no play function starts there at all.

**Why.** Storybook is where the components are delivered, and it is public. A story that throws in the published build is a broken component page in front of whoever opens it, and nothing between a push and that page would say so. Critical on the owner's order of 2026-09-10: it guards the component library.

**Exit condition.** A committed check builds Storybook for production, opens every story in headless Chromium, and fails on any page error or console error; it runs before the Pages workflow publishes; and a mutation removing the Hover story's test-runner guard makes it fail on the emitted import error.

### `KN-227` The token-file guard can be passed by a function, a Map, or copy assigned to fontFamily, and its retirement is a wish

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-224, recorded in prose because board.json cannot express parent_task yet, KN-188. Three findings from the KN-224 roast, all confirmed by reading the guard, filed together because they are one test and one TECH-DEBT entry. FIRST: the guard skips the path fontFamily outright instead of checking its value, so fontFamily = 'Delete this application' passes. SECOND: it walks runtime values through Object.entries, which returns nothing for a function or a Map, so export const deleteLabel = () => 'Delete this application' and a Map of labels both pass while lingui still ignores the file. THIRD: TECH-DEBT.md 13's retiring check names a hoped-for rule rather than a condition anyone can test, so nothing can say when the exemption may go.

**Why.** The guard was written to stand where the lint cannot see, and a guard with three ways round it is the same silence with a green test on top. The roast scored KN-224 at 2 for exactly this. Critical on the owner's order of 2026-09-10 with the other findings on built components.

**Exit condition.** The guard reads every string literal in the SOURCE of src/theme/tokens.ts, not the runtime values, so a literal inside a function, a Map or any other construct is checked; the font stack is checked by value; mutations adding copy as a function return, as a Map entry and as the fontFamily value each fail it; and TECH-DEBT.md 13's retiring check is a condition a command can test, such as the three exemptions removed and npm run lint still green with every planted fixture failing.

**Roasts.** round 1 scored 2 with 3 critical(s)

### `KN-228` The Hover story's canvas branch still keys off Storybook's private preview global

- **status** backlog · **severity** medium · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-225, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-225 roast and confirmed: without the repository's story-test flag, the Checkbox Hover story returns only when globalThis.__STORYBOOK_PREVIEW__ exists, an undocumented Storybook internal. It fails CLOSED, since a rename makes the published Hover story throw rather than pass anything silently, but it is still a private name. The fully owned version is a second flag set in .storybook/preview-head.html, which Storybook injects into its own preview and the Vitest page does not load, checked after the test flag so the test path always wins.

**Why.** KN-225 moved the test side onto a signal the repository owns; the canvas side still borrows one. Medium rather than critical because nothing is broken and the failure it guards against would be loud, not silent.

**Exit condition.** The Hover story reads no Storybook or Vitest internal; the published Storybook still renders it as a canvas with no error, checked on a production build; and removing either repository flag makes the story fail in the environment that flag belonged to.

### `KN-229` The Tooltip's Controls table lost its children prop when its JSDoc went

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-207, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-207 roast and confirmed: react-docgen-typescript hides an undocumented children prop by default. KN-207 removed the Tooltip's per-prop JSDoc and set skipChildrenPropWithoutDoc: false in the story-docs guard, but NOT in .storybook/main.ts, which configures the parser Storybook's own Controls table reads. So the published Controls table now shows title and icon and no children, while the story-docs markdown on the same page documents children. A regression KN-207 introduced and nothing caught.

**Why.** It is visible to anyone who opens the component's Docs page, and it is the kind of drift KN-207 was meant to remove: two configurations of the same parser disagreeing about what a component's props are. Critical on the owner's order of 2026-09-10, as a finding on a built component, and because the regression is this session's.

**Exit condition.** Storybook's docgen is configured with the same children rule as the guard, the other defaults it depends on kept; a production Storybook build reports children among the Tooltip's argTypes, checked from the built page rather than the config; and a mutation dropping the option makes that check fail.

**Roasts.** round 1 scored 8 with 0 critical(s)

### `KN-230` The callback fn() rule reads only the meta's args, not what each story actually passes

- **status** backlog · **severity** medium · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-207, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-207 roast and confirmed: the story-docs guard requires an fn() in the META args for every on* prop. A story that overrides the callback with a plain function in its own args, or replaces it in a custom render, still passes, and its Actions panel records nothing. It also accepts any local function called fn, not only Storybook's spy.

**Why.** The rule's point is that every story's interactions are recorded, and it checks the default rather than what each story resolves to. Medium: nothing does this today, and the meta default covers every current story.

**Exit condition.** The guard fails for a story whose own args override a callback with anything but Storybook's fn(), and for an fn not imported from storybook/test, proved by a planted story of each kind, while the current stories still pass.

### `KN-231` The tooltip's description appears only after the tip opens, so focus announces the trigger without it

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-209, recorded in prose because board.json cannot express parent_task yet, KN-188. Two findings from the KN-209 roast, filed together because they are the same story and component. FIRST, major and confirmed from MUI's source: with describeChild and a non-string title, which ours always is, MUI sets aria-describedby only while the tip is OPEN, and it opens about 100ms after focus. A screen reader announces the focused control first and many do not re-announce when the attribute arrives, so a keyboard user can hear the name and never the description. KeepsTheTriggersName waits for the tip before asserting, which is exactly the window that hides it. MUI spreads the child's own props after its own, so an always-present description the trigger points to would survive. SECOND, minor: the accessible name is asserted in en-US only; the Persian name comes from the catalog and is never checked on the rendered button.

**Why.** KN-209 fixed the name and left the description timing-dependent, and the tooltip's whole reason to exist is telling a keyboard and screen-reader user what a control will do. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** At the moment of keyboard focus, before the tip opens, the trigger already has an accessible description equal to the tip's text, asserted by a story that does not wait for the tip; the name is still the trigger's own; the same assertions run in fa-IR with the Persian name; and a mutation removing the always-present description fails the focus-time story.

**Roasts.** round 1 scored 5 with 1 critical(s)

### `KN-232` The docgen comment in .storybook/main.ts says any option replaces Storybook's defaults, which is false

- **status** backlog · **severity** low · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-229, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-229 roast and confirmed from @storybook/react-vite's preset: the user's reactDocgenTypescriptOptions are passed to the Vite docgen plugin, which supplies its own default propFilter only when none is given. So the comment's reason for restating the defaults, that supplying any option replaces the whole default object, is wrong. The values set are still correct and match @storybook/react's component-manifest path; only the stated reasoning is false.

**Why.** A comment that explains configuration wrongly is how the next person reasons wrongly about an upgrade: they will trust it and remove or add options on a false model of how Storybook merges them. Low: nothing behaves wrongly today.

**Exit condition.** The comment above reactDocgenTypescriptOptions in .storybook/main.ts states how the Vite docgen plugin and the component-manifest path actually treat user options, checked against the installed preset source, and the KN-229 verifier still passes.

### `KN-233` A trigger that takes the tooltip's ref but drops its event props is still silent in production

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** KN-231

CHILD OF KN-211, recorded in prose because board.json cannot express parent_task yet, KN-188. Two findings from the KN-211 roast, filed together because they are one check. FIRST, critical and confirmed: KN-211's check only asks whether a node arrived through the ref. A wrapper that forwards the ref and drops the rest, forwardRef((_props, ref) => <button ref={ref} />), passes it, and loses MUI's hover and focus listeners, so the tip never opens. MUI's own check for that case runs only when NODE_ENV is not production, so the published app is silent. SECOND, major: the check runs once, after the first commit, so a trigger that mounts conditionally is falsely reported and a working trigger later swapped for a broken one is not reported at all. Once KN-231 gives the trigger an always-present aria-describedby through the props, the check can require that attribute on the node it received, which proves the props arrived as well as the ref, in every environment and after every change. Blocked by KN-231 for that reason.

**Why.** KN-211 promised a clear failure instead of silence, and the case the roast built is the realistic one: a wrapper written carelessly with forwardRef. A tooltip that never opens in production, with no report anywhere, is the defect KN-211 was filed for. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** A trigger that forwards its ref but drops its other props is reported in a PRODUCTION build as well as in development, proved by a story with such a wrapper checked on the production Storybook; a trigger that mounts after the first render is not falsely reported; a working trigger swapped for a broken one is reported; and the ReportsATriggerThatCannotAttach and KeepsTheTriggersName stories still pass.

**Roasts.** round 1 scored 3 with 2 critical(s)

### `KN-234` The token guard still accepts copy as a key or inside the font stack, and its retirement check trusts any lint failure

- **status** backlog · **severity** high · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-227, recorded in prose because board.json cannot express parent_task yet, KN-188. Three findings from the KN-227 roast, all confirmed by reading the guard and the verifier, filed together as one guard and one check. FIRST: keys are validated by a SHAPE, lowercase slash-separated, so delete/application passes as a key, and the Foundations page renders token keys as visible labels; the contract tests constrain the existing exports' keys, but a new export's keys are checked by the shape alone. SECOND: the font-stack pattern allows any text after Vazirmatn inside the first quoted family and any quoted family after it, so "'Vazirmatn', 'Delete this application'" passes. THIRD: KN-227.mjs's retirement check reads only the lint exit code, so an unrelated lint error makes the three exemptions look necessary forever.

**Why.** Every shape this repository has used as an exemption has let copy through, and the guard repeats the pattern one level down. The retirement check is the one command that says when TECH-DEBT 13 can go, and as written it cannot tell a reason from a coincidence. High rather than critical: it guards against copy being ADDED to the token file, which nothing does today, and it follows the component work.

**Exit condition.** Every string-literal key in tokens.ts must be a token name DESIGN.md documents, not a shape; the font stack must equal the documented value exactly; planted cases for a copy key, copy after Vazirmatn and a copy family each fail the guard; and the retirement check requires a clean baseline lint and lingui errors attributable to tokens.ts, STORAGE_KEY and TOOLTIP_SURFACE once they are removed, reporting an unrelated error as unjudgeable rather than as the debt standing.

### `KN-235` A trigger's own aria-describedby replaces the tooltip's description instead of joining it

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-231, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-231 roast and confirmed from MUI's source: MUI spreads the child's own props after the tooltip's, so <button aria-describedby="validation-help"> keeps only its own id and the tooltip's text is described neither before nor after focus. Worse since KN-233: the attach check reads the node's aria-describedby for the tooltip's id, finds it missing, and falsely reports that the trigger dropped its props, when it is a perfectly valid trigger. The fix is to merge the child's id list with the tooltip's on the child itself, by cloning it, so MUI's last-wins spread carries both.

**Why.** A trigger that already has a description, a validation hint or a field help text, is exactly where a tooltip is common, and the tooltip currently erases one of the two descriptions and then blames the trigger for it. Critical on the owner's order of 2026-09-10, as a finding on a built component, and because KN-233's report made it actively misleading.

**Exit condition.** A trigger with its own aria-describedby keeps it AND gains the tooltip's, in that order, before and after focus, asserted by a story that checks the computed description contains both texts; no report is logged for it; the ref-only and cannot-attach reports still fire; and a mutation dropping the merge fails the story.

**Roasts.** round 1 scored 8.5 with 0 critical(s)

### `KN-236` The tooltip's attach check guesses a trigger's lateness with a timer and its props from one attribute

- **status** backlog · **severity** medium · **points** 3 · **area** web
- **blocked by** none

CHILD OF KN-233, recorded in prose because board.json cannot express parent_task yet, KN-188. Two findings from the KN-233 roast, both confirmed, filed together because they are the same check. FIRST: a missing node is reported after a fixed 100ms, so a trigger that legitimately renders nothing for longer, while a permission or feature flag resolves, is falsely reported. SECOND: arriving props are inferred from one attribute, the description link, so a wrapper that forwards exactly the ref and aria-describedby but drops onFocus and onMouseOver passes while the tip can never open; MUI's own check catches that only in development. A sounder shape: hidden markers on both sides of the child, so 'rendered something but took no ref' is told from 'rendered nothing yet' without a timer, and the props proof taken from something the event handlers themselves produce. The roast's third finding, a trigger with its own description, was fixed by KN-235.

**Why.** The check promises a clear report instead of silence, and a check that cries wolf at a slow but correct trigger, or stays quiet for a selectively forwarding one, weakens that promise at its edges. Medium rather than critical: the careless wrapper that spreads nothing and the trigger that arrives a render late are both handled, MUI covers selective forwarding in development, and the tooltip's first real caller, the icon button, spreads its props.

**Exit condition.** A trigger that renders nothing for a second and then attaches correctly is never reported; one that renders DOM without taking the ref is reported however late it appears; a wrapper forwarding only the ref and aria-describedby is reported in a production build; each proved by a story, and the existing report stories still pass.

### `KN-237` The Tooltip's children type rejects a trigger held as a plain ReactElement

- **status** backlog · **severity** low · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-235, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-235 roast and confirmed: to read the trigger's own aria-describedby, KN-235 narrowed children to ReactElement<{ 'aria-describedby'?: string }>, so const trigger: ReactElement = <button /> can no longer be passed, although MUI's Tooltip accepts it. Reading the prop through a narrowing guard on unknown props would keep the merge without narrowing the public type. The roast's other minor, a duplicated id, is dismissed: the tooltip's id comes from useId inside the component and is never exposed, so a caller cannot already carry it.

**Why.** A public prop type stricter than the library it wraps turns valid call sites into type errors for no behavioural gain. Low: every current and planned caller writes its trigger inline as JSX, which the narrowed type accepts.

**Exit condition.** A trigger typed as a plain ReactElement type-checks as the Tooltip's child, the merge of the trigger's own description still works and KeepsTheTriggersOwnDescription still passes, and no TypeScript escape hatch is used to get there.

### `KN-238` A long renamed status name pushes the Status Chip out of its column

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-010, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-010 roast and confirmed: the chip is an inline-flex span with white-space nowrap and no maximum width, and the API puts no length bound on Status.name. A user who renames a status to a long name gets a chip wider than the 276px column header or the card it sits in, and the row overflows. The design shows only short names, so the behaviour for a long one is not drawn: truncating with an ellipsis inside the chip, the full name staying in the DOM for assistive technology, is the conventional answer and should be recorded in DESIGN.md as a decision.

**Why.** Renaming statuses is a feature the product advertises, and the first long name a user types breaks the board's layout. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** A status name longer than its container is truncated with an ellipsis inside the chip, which never grows past its container; the full name stays readable by a screen reader; a story renders a long name inside a 276px container and asserts nothing overflows; and DESIGN.md records the decision.

**Roasts.** round 1 scored 7.4 with 0 critical(s)

### `KN-239` Two Status Chip stories ignore their args, so the Controls panel controls nothing

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-010, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-010 roast and confirmed: Default always renders new at size S through a helper, and AllStatuses renders its fixed matrix, so the status, label and size controls in the Docs page and the canvas change nothing on either. The repository's rule is that stories render from their args.

**Why.** A Controls panel that silently does nothing is worse than none: it tells a reviewer the component ignores its props. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** Default renders from its args, so changing status, label or size in Controls changes the chip, asserted by a story that renders with non-default args; AllStatuses, a fixed matrix by design, disables the controls it cannot honour rather than showing them.

**Roasts.** round 1 scored 8.4 with 0 critical(s)

### `KN-240` Nothing proves the theme's status colours come from the token set

- **status** backlog · **severity** low · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-010, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-010 roast and confirmed: the AllStatuses story compares the chips with values read from tokens.ts, and theme.test.ts only counts the nine status keys, so a buildTheme that duplicated the nine light hexes inline instead of reading the status tokens would pass both.

**Why.** The token module is the contract DESIGN.md is checked against, and the theme is what components draw from; the link between them is the one nothing asserts. Low: the theme does read the tokens today.

**Exit condition.** A test asserts the light theme's status pairs are the token set's objects or equal to them key by key, and a mutation replacing one pair in buildTheme with a literal of the same value is caught by a check that the theme reads the token module rather than restating it.

### `KN-241` The Input's focused-while-invalid border is an unrecorded invention, and its focus test checks one axis

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Two findings from the KN-011 roast, filed together because they are the same state and the same story. FIRST, confirmed: node 95:38 draws six standalone states and no error-and-focus composite. The component draws one anyway, two pixels of border/error, which is the conventional answer but is neither in the file nor recorded as a decision, and no story shows it. SECOND: the Focus story proves the text does not move horizontally when the border widens and never checks the vertical position.

**Why.** Match the design exactly means a state the design does not draw is a decision to write down, not a default to slip in, and a user fixing a validation error is focused on an invalid field every time. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** DESIGN.md records what a focused invalid field looks like and why; a story focuses an invalid field and asserts exactly that; the Focus story asserts the text keeps both its horizontal and vertical position when the border widens; and a mutation changing the focused-error border fails the new story.

**Roasts.** round 1 scored 3 with 2 critical(s)

### `KN-242` Most Input stories ignore their args, so the Controls panel controls nothing

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-011 roast and confirmed: every story renders a fixed specimen through a helper, and Default forwards only onChange, so changing label, value, placeholder, helperText, error or disabled in Controls changes nothing. KN-239 fixed the same thing in the Status Chip; the rule is that stories render from their args.

**Why.** A Controls panel that silently does nothing tells a reviewer the component ignores its props. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** Default renders the Input from its args with the specimen copy as its defaults, a story with non-default args asserts the field follows them, and any story that is a fixed render by design disables the controls it cannot honour.

**Roasts.** round 1 scored 3.5 with 2 critical(s)

### `KN-243` The Input's Focus story measures the field's box, not its text

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-241 roast and reproduced: the Focus story compares the input element's bounding box before and after focus, and the text is not that box. A focused-only rule on the input itself, '& input': { textIndent: '3px' } inside .Mui-focused, moves the text three pixels when the field takes focus and leaves the box where it was, and all twelve Input stories pass with it. A focused change to the input's font family or letter spacing would slip past the same way. KN-241 asked that the text keep both its positions; the story checks a proxy for them.

**Why.** DESIGN.md's promise for the Focus state is that the text does not move a pixel when the field takes focus, and this story is the only thing holding it. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** The Focus story fails whenever focus changes anything that lays out the text inside the field: it asserts the input element's box and every computed property of the input are unchanged by focus, naming any property it exempts and why, and a mutation adding a focused-only text-indent to the input fails Focus by name.

**Roasts.** round 1 scored 5 with 1 critical(s)

### `KN-244` A focused invalid Input shows focus by one pixel of the same red

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** KN-271

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-241 roast and confirmed by measurement. The ordinary Focus state changes a two-pixel ring: the outer pixel goes from border/default #e5e7eb to border/focus #2563eb, 4.17:1, and the inner from bg/surface #ffffff to border/focus, 5.17:1, which meets the area and contrast measure of WCAG 2.4.13 Focus Appearance. The focused invalid state KN-241 decided in DESIGN.md changes only the inner pixel, #ffffff to border/error #ef4444, 3.76:1; the outer pixel is red before and after, 1:1. That is half the changed area, and someone who cannot resolve one pixel of thickness sees no focus at all. MUI's own outlined field and Material 3 do the same thing, so it is a convention, but it is weaker than this design's own Focus state, and the reason DESIGN.md gives only argues against staying at one pixel. The system already has a keyboard focus ring: the Checkbox draws a 2px border/focus outline at offset 2. Figma does not draw this state, so the treatment is a decision to record, not a reading.

**Why.** The person tabbing back into a field that failed validation is exactly the person who needs to see where focus is. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** A focused invalid field differs from the same field unfocused by at least a two-pixel perimeter changed at 3:1 contrast or more, the WCAG 2.4.13 measure the ordinary Focus state already meets; the field's border stays border/error so the error is still visible; the text does not move; DESIGN.md's section records the treatment, the measure and the reason; and FocusedWhileInvalid asserts it, with a mutation back to the one-pixel treatment failing that story by name.

**Roasts.** round 1 scored 5.5 with 1 critical(s)

### `KN-245` The Input's Controls show empty values while the canvas draws the specimen's copy

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-242 roast and confirmed from the code: the meta's args are label '' with no placeholder or helper, and JobTitle substitutes the catalog's specimen copy for each, so a reviewer opening Default sees an empty label control above a field labelled Job title, and empty placeholder and helper controls above a field that has both. Setting the helper to '' clears it, but resetting the control brings the specimen back, and an untouched control looks the same as an explicit empty one. The label cannot be emptied at all, since '' is the sentinel for the specimen's.

**Why.** Controls are how a reviewer reads a story's state, and values that disagree with the canvas describe it wrongly. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** With no control touched, every Controls value in the args-driven Input stories is what the canvas draws, label, placeholder and helper, in either language; changing one in Controls changes the canvas to exactly that value, and clearing the placeholder or helper removes it; a story asserts the rendered copy equals the args, and a mutation reintroducing a hidden fallback fails it.

**Roasts.** round 1 scored 8.2 with 0 critical(s)

### `KN-246` Changing defaultValue in the Input's Controls does not change the field

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-242 roast and reproduced on the production Storybook build: after Filled and FromArgs render, an updateStoryArgs on Storybook's own channel setting defaultValue to 'second' and helperText to a marker re-renders the same input node; the helper shows the marker, the value attribute becomes 'second', and the field still shows its first text. The Input is uncontrolled, React applies defaultValue when the input mounts and afterwards only updates the attribute, and Storybook re-renders on an arg change without remounting. So the defaultValue control on Filled, Focus, Disabled and FromArgs does nothing on the canvas, and FromArgs proves only that the first render reads its args.

**Why.** A control that does nothing tells a reviewer the component ignores the prop, which is what KN-242 was filed to stop. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** Changing defaultValue in Controls after the story has rendered changes the text in the field: a check renders an Input story, changes the arg through Storybook's own arg update, and asserts the field shows the new value, and it fails with the fix taken out.

**Roasts.** round 1 scored 7 with 0 critical(s)

### `KN-247` The Input's interaction stories keep controls that make their play functions untrue

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** KN-250

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-242 roast and confirmed from the code: the stories that prove a behaviour from fixed inputs keep every control. Typing types 42 and asserts onChange received it and the field is named title; set disabled, value, defaultValue or name in Controls and those claims are false for what the canvas shows, while the Interactions panel still reports the run that passed. Focus, Hover and LabelIsBound go wrong the same way under disabled or error. KN-242 disabled controls only on the fixed renders.

**Why.** The Interactions panel's ticks are worth something only if they describe the story on screen. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** Every Input story with a play function either reads its expectations from the active args or offers, through controls.include or by disabling controls, only the args its assertions follow; a check enumerates the stories and fails on one that offers any other control.

**Roasts.** round 1 scored 7 with 0 critical(s)

### `KN-248` Nothing checks the Input's placeholder stays put when an empty field takes focus

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** KN-250

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-243 roast and confirmed: the Focus story is filled through defaultValue, so no placeholder is drawn, and the input's computed style does not include its ::placeholder pseudo-element, so a focused-only rule such as '&.Mui-focused input::placeholder': { textIndent: '3px' } moves the placeholder of an empty field and nothing fails. Chromium does report placeholder styles through getComputedStyle(input, '::placeholder'): on Default it gives text/secondary, rgb(107, 114, 128), where the input itself gives rgb(17, 24, 39), and a planted pseudo-only text-indent reads back as 3px, so a story can measure it.

**Why.** The empty field is the one a user tabs into first on a new form, and DESIGN.md's promise for the Focus state is that the text does not move. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** A story focuses an empty Input and asserts that neither the input's layout nor its placeholder's computed style changes with focus, reading the placeholder through getComputedStyle(input, '::placeholder'), and a mutation adding a focused-only placeholder text-indent fails that story by name.

**Roasts.** round 1 scored 7 with 0 critical(s)

### `KN-249` Setting value in the Input's Controls freezes the field

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-246 roast and confirmed from the code: every story that offers controls offers value, and setting it makes the Input controlled, while the meta's onChange is fn(), which records the call and never updates the story's args. So a reviewer who sets value to anything and then types sees the field refuse every keystroke, React putting the controlled value back each time, and the Controls panel still presents the field as live. KN-246 fixed defaultValue, the uncontrolled half; this is the controlled half, which its verifier never exercised.

**Why.** A field that swallows typing looks like a broken component, not a story wired wrong, to anyone trying it in Storybook. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** After value is set in Controls, typing into the field changes it and the value control follows what was typed, the story binding value through Storybook's args; or no story offers value. A check sets value through Storybook's own arg update on a built Storybook, types into the field, and asserts both the field and the story's args show the typed text, and it fails with the binding taken out.

**Roasts.** round 1 scored 3.5 with 1 critical(s)

### `KN-250` The document's direction and language are set after the first paint

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found while doing KN-247 and traced on a production Storybook build: ThemedTree in src/app/AppProviders.tsx sets document.documentElement.dir and lang in a useEffect, which React runs after the browser paints a render that no user input triggered. Storybook's iframe starts with no dir and lang en, so every story's play function starts on a tree laid out left to right: recorded at each render phase, the Input's Focus story reaches 'playing' with html dir unset and the input's direction ltr, and 'errored' with dir rtl, lang fa-IR; its snapshot, since KN-243, sees direction change under it and fails with nothing changed. So the published Storybook shows Focus failing, which Vitest never did: it wraps the render in act(), which flushes effects before the play function. The app has the same gap on load: index.html ships dir rtl, so a user whose stored language is English gets a first frame laid out right to left. The comment directly above the effect explains why the catalog is activated during render rather than in an effect, the flash of the wrong language; direction has the same problem and was left in the effect.

**Why.** A tree painted in the wrong direction is the one bug an RTL-first product cannot have, and here it makes the deployed Storybook report a component as failing. It blocks KN-247, whose check runs every story on a production build. Critical on the owner's order of 2026-09-10.

**Exit condition.** The document element's dir and lang are set in the commit that renders the tree, before paint, not in a passive effect: on a production Storybook build every story's play function starts with html dir and lang already matching its locale, recorded at the playing phase in both languages, and the Input's Focus story passes there; the built app, loaded with a stored English preference, has dir ltr by the time its first render's DOM exists; and a mutation back to useEffect fails the check.

**Roasts.** round 1 scored 9.5 with 0 critical(s)

### `KN-251` Nothing checks the Input's value control in the Controls panel follows what is typed

- **status** backlog · **severity** low · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-249 roast and confirmed: KN-249's verifier loads only iframe.html and reads the preview's own story store, storyStoreValue.args, after typing. It never loads the manager, where the Controls panel lives, so a manager that failed to redraw the value control would pass it, while KN-249's exit condition says the value control follows what was typed. KN-249's evidence named the gap.

**Why.** The Controls panel is what a reviewer looks at, and the card claimed a behaviour of it that nothing observed. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** A check loads the whole Storybook, manager and preview, from a production build, sets value through the Controls panel's own field, types into the canvas, and reads the Controls panel's value field showing the typed text; and it fails with the binding taken out.

### `KN-252` Resetting the Input's value control turns the same field from controlled to uncontrolled

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-249 roast and confirmed from the code: value passes straight through to InputBase and the story's key changes only with defaultValue, so setting value in Controls and then resetting it to undefined turns the same input element from controlled to uncontrolled. React reports that in development as a component changing a controlled input to be uncontrolled, and the field is left holding whatever it last showed, with no arg behind it.

**Why.** It puts a React warning in the console of anyone trying the control, and a field in a state no real caller should ever produce. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** Switching the value control between set and unset starts the field over rather than changing its mode in place, so React never sees one input go from controlled to uncontrolled or back; a check in a development build, where React reports it, sets value, types, resets it, and finds no such report and a field showing its default again; a mutation removing the fix brings the report back.

**Roasts.** round 1 scored 8.4 with 0 critical(s)

### `KN-253` The Input's value binding loses keystrokes that arrive faster than Storybook's channel

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-249 roast, and measured while closing KN-249: every edit goes through updateArgs and Storybook's channel before React sees the new value, and a stale arg that arrives after a newer keystroke overwrites it. 20 keys typed at 0ms apart kept 2 and at 10ms kept 11; at 20ms and slower all 20 arrived. The roast names composition input as a path that can produce values closer together than that, including Persian transliteration and mobile keyboards' predictive text, where the last composition update and its commit can land in the same moment; that path is not reproduced here.

**Why.** Pasted or composed text that silently loses characters makes the component look broken to the person trying it. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** The field shows every edit as it happens and the arg follows without a stale value overwriting newer input: 20 keys typed with no delay all arrive in both the field and the arg, and a composition driven through the browser's own IME input ends with the composed text in both; a mutation back to the plain round trip loses keys again.

**Roasts.** round 1 scored 4 with 1 critical(s)

### `KN-254` An empty error string puts the Input in its error state

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found while doing KN-247 and reproduced by its sweep on the production Storybook: the Input treats every error other than undefined as an error. In Input.tsx the message is error ?? helperText, and aria-invalid and the border colour turn on error === undefined, so error '' draws the field in border/error, rgb(239, 68, 68), marks it aria-invalid, and replaces the helper text with an empty line; Default and Hover, rerun with error '', failed on exactly that border. A form library that clears a field's error to the empty string rather than to undefined leaves a valid field red with no message, and a screen reader announces it invalid with nothing to say why.

**Why.** The error state is the one a user is told to fix; showing it on a valid field, and with no message, is wrong both ways. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** An error that is empty or only whitespace is no error: the field keeps its default border, is not aria-invalid, and shows its helper text; a story renders such an error and asserts all three; DESIGN.md or the component's story docs say the error state needs a message; and a mutation back to testing error against undefined fails that story by name.

**Roasts.** round 1 scored 4 with 1 critical(s)

### `KN-255` The other components' stories keep controls that make their play functions untrue

- **status** backlog · **severity** critical · **points** 3 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found while doing KN-247: its sweep, pointed at every story outside the Input on a production build, finds the same fault in five more places, under controls a reviewer can really produce. Checkbox: Unchecked under indeterminate, Checked under checked false, Indeterminate under indeterminate false, Hover under indeterminate or disabled, Disabled under disabled false, KeyboardOnly under disabled. FilterChip: Default under selected or a new label, Selected under selected false, InEnglish under a new label, Toggling and KeyboardOnly under selected. StatusChip: ColumnHeaderSize, DisplayOnly and RenamedStatus under a new label, FromArgs under an empty one. Tooltip: every story under children, which Controls offers as text though the Tooltip needs an element, and WithIcon under icon. PreferencesProvider: Persian and English under the other locale. The sweep tried strings where some controls are selects or numbers, so its results for status, size, placement, family, count and a made-up locale are artifacts, not findings; the check has to change each control by its type.

**Why.** As in KN-247, the Interactions panel's ticks are worth something only if they describe the story on screen, and a Controls panel that offers the Tooltip's children as text invites a reviewer to break every Tooltip story. Critical on the owner's order of 2026-09-10, as a finding on built components.

**Exit condition.** Every story with a play function, in every component, either reads its expectations from the active args or offers only the controls its assertions hold for, and no story offers a control whose values the component cannot take, such as the Tooltip's children; KN-247's check, run over every story and changing each control by its own type (booleans flipped, every option of a select, a number changed, text changed and emptied), fails on none; and a repository guard fails any story file with a story that has a play function and neither declares its controls nor disables them.

### `KN-256` KN-088's verifier stopped proving its claim when KN-007 changed the unit include

- **status** backlog · **severity** low · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found while doing KN-248, rerunning every verifier that reads the lint or test config: node agent/scripts/verify/KN-088.mjs fails two checks. Its proof that an emptied unit project fails the gate empties unitInclude, and KN-003 now fails on a TypeScript error instead, 'unitInclude' implicitly has an 'any[]' type at vitest.config.ts line 80, so the proof no longer shows what it names. And its check that the ordinary include is a named constant carrying the .test.ts pattern no longer matches. KN-007, ad81b72, rewrote that constant after KN-088's last commit, dbfb656, and nothing reran KN-088 since. The gate may still work; what is broken is the evidence for it.

**Why.** A verifier that fails for a reason other than the one it names is a closed card whose proof has quietly stopped proving anything, and it is the proof that the done gate catches an empty test project.

**Exit condition.** node agent/scripts/verify/KN-088.mjs passes against the vitest.config.ts as it is now: emptying the unit include makes KN-003 fail because the unit project ran nothing, shown by its own output rather than a type error, and the constant check matches the include as written today.

### `KN-257` The getComputedStyle lingui exemption covers every string, not the one selector it is for

- **status** backlog · **severity** medium · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-248 roast and confirmed: KN-248 put getComputedStyle in lingui's ignoreFunctions so a story could pass '::placeholder', and the comment beside it justifies exactly that selector, but a function exemption skips every literal in every getComputedStyle call, so getComputedStyle(element, 'Job title') would pass lint. An exact pattern, '^::placeholder$', in ignore would exempt that one selector wherever it appears and nothing else. Harmless as written, since getComputedStyle renders nothing, but wider than its reason, which is the shape of hole this config's own comments keep closing.

**Why.** Every exemption in the lingui config is written to be exactly as wide as its reason, and this one is wider. Medium: it cannot put untranslated copy on screen by itself.

**Exit condition.** getComputedStyle is no longer in ignoreFunctions; the one selector the stories pass is exempted by an exact pattern with its reason beside it; lint passes; and a check shows a getComputedStyle call with a literal of copy is flagged while getComputedStyle(element, '::placeholder') is not.

### `KN-258` Changing defaultValue while value is set remounts the Input's field for nothing

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-252 roast and confirmed from the code: the story's key carries defaultValue in both modes, and a controlled field ignores defaultValue, so with value set a new defaultValue in Controls remounts the field, dropping focus and anything only the DOM holds, while what it shows stays the same. KN-252's evidence named it. The key should carry defaultValue only while the field is uncontrolled: the mode, then the default only when value is undefined.

**Why.** A reviewer adjusting the default of a controlled field sees it lose focus and flicker for a prop it does not even use. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** With value set, changing defaultValue in Controls leaves the same input element in place, still focused if it was, showing the same value; with value unset a new default still starts the field over; a check on a built Storybook does both, and a mutation back to keying on defaultValue in both modes fails the first.

**Roasts.** round 1 scored 10 with 0 critical(s)

### `KN-259` An Input error made only of invisible characters still turns the field red

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-254 roast and confirmed in Node: KN-254 treats an error as blank when trim() empties it, and trim() leaves the Unicode format characters in place. A zero-width space, U+200B, a zero-width non-joiner, U+200C, a zero-width joiner, a left-to-right or right-to-left mark, or a word joiner each survive it as one character, so an error made only of them still draws border/error, sets aria-invalid and replaces the helper with a line a person cannot see. The zero-width non-joiner is part of ordinary Persian text. Whitespace plus the format characters, /^[\s\p{Cf}]*$/u, treats all of them as blank and still keeps a real message with a ZWNJ inside it.

**Why.** It is the exact inaccessible state KN-254 set out to remove, reached by the character Persian text uses most. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** An error made only of whitespace and Unicode format characters is no error, while a message that merely contains them is still shown; BlankErrorIsNoError also renders an error of only a zero-width non-joiner and only a right-to-left mark and asserts they are no error, and a story with a real Persian message containing a ZWNJ still shows it; a mutation back to trim() fails the story by name.

**Roasts.** round 1 scored 8.3 with 0 critical(s)

### `KN-260` Stories inherit the real pointer where the last hover story left it

- **status** backlog · **severity** high · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found while closing KN-259: in the full suite, BlankErrorIsNoError failed because one of its four fields drew text/secondary, the Input's hover border, where it asserts border/default. The Hover stories move the test runner's REAL pointer, as they must, and nothing moves it back, so the next story that renders a field under that spot starts hovered. The Input's Default story asserts a resting border too and passes only because nothing it renders sits there. KN-259 routed around it with pointer-events none on the story's row, recorded as TECH-DEBT 15.

**Why.** A resting-state assertion that depends on where an earlier story left the mouse is a flaky test waiting for a layout change, and one already failed a full run. High rather than critical: it breaks the suite, not a component.

**Exit condition.** Every story starts with the test runner's pointer somewhere that hovers nothing, set once for the whole suite rather than per story; BlankErrorIsNoError drops its pointer-events workaround and TECH-DEBT 15 is deleted; and a check runs a story that leaves the pointer on a field followed by one asserting a resting border in the same spot, which fails without the reset.

### `KN-261` An Input error of only combining marks or blank symbols still turns the field red

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-259 roast and confirmed from the pattern: BLANK in Input.tsx is whitespace plus the format characters, \p{Cf}, and several characters that show a person nothing are outside that class. A combining mark on its own, such as U+034F the combining grapheme joiner, a variation selector such as U+FE0F, the Hangul filler U+3164 and the braille blank U+2800 each still make an error, so the field turns red and invalid with nothing to read. The comment above BLANK claims 'what a person cannot see', which is wider than the pattern. No form is likely to send one, which is why this is small.

**Why.** The claim in the code and the behaviour should agree, and an invisible message is the exact state KN-254 and KN-259 set out to remove. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** An error made only of whitespace, format characters, combining marks, variation selectors and the blank symbols named here is no error, while a real message containing any of them is still shown; the blank rule is defined once and tested at its boundaries, including each of those characters alone and each inside a real Persian message; and the comment says exactly what the rule covers.

**Roasts.** round 1 scored 7 with 0 critical(s)

### `KN-262` FromArgs copies the Input's blank-error rule instead of sharing it

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-259 roast and confirmed from the code: FromArgs in Input.stories.tsx decides what description to expect with its own copy of the component's pattern, /^[\s\p{Cf}]*$/u, rather than the component's rule. FromArgs leaves error unset by default, so the day the component's rule changes and the copy does not, no automated run notices; only a reviewer setting an error in Controls would see the play function disagree with the field.

**Why.** A test oracle that restates the rule it checks drifts silently the first time the rule moves. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** The blank rule lives in one module that the Input and its stories both import, with no second copy of the pattern anywhere under src; a unit test covers the rule's boundaries; and a mutation that widens the rule in that module changes what FromArgs expects without editing the story.

**Roasts.** round 1 scored 9 with 0 critical(s)

### `KN-263` The Status Chip centres its text with a 3px padding the spacing scale does not have

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-010, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-238 roast and confirmed from the code and the file: KN-238 made the chip an inline block and centred its line with block padding computed as (height minus line height) / 2, which is 4px for S and 3px for M. The design centres with flex and no vertical padding at all, get_design_context on 84:4 and 398:6185, and 3 is exactly the off-scale value the file's own cleanup corrected to 4, DESIGN.md's tokenised section. So the component states a spacing no token holds, even though it is computed rather than written. The inline block was chosen because text-overflow cannot reach a flex container's own text; the other way, which KN-238's plan weighed and set aside to keep one element, is the designed flex box with the text in an inner span that truncates.

**Why.** Every spacing in a component resolves to a token; the no-literal rule is only checkable because the design is fully tokenised, and a computed off-scale value is the same hole with a formula in front of it. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** The chip is the designed flex box again, centred by alignment with no vertical padding, and the name truncates with an ellipsis in an inner element; every story that measures the chip measures the chip, not the name; KN-238's verifier still passes with its mutations; and no padding or spacing in StatusChip.tsx resolves to anything but a spacing token or zero.

**Roasts.** round 1 scored 8.7 with 0 critical(s)

### `KN-264` The Status Chip's dir=auto is proved in one direction, and DESIGN.md overstates it

- **status** backlog · **severity** critical · **points** 1 · **area** web
- **blocked by** KN-062

CHILD OF KN-010, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-238 roast and confirmed: LongNameInEnglish proves a Persian-led name resolves rtl in the English interface, not the case that motivated dir=auto, a Latin-led name in the Persian interface such as 'Google استخدام', nor a digit-led one such as '۱۲۳ استخدام'. And DESIGN.md says the ellipsis ALWAYS cuts the end of a name, which is false for a name with no letter at all: digits or emoji alone have no strong character, so the chip falls back to the page's direction. A long Latin name as record data is a literal the lingui rule flags, which is why KN-238 left it to KN-062's fixtures; this card waits on them.

**Why.** A claim in the design contract should be exactly as strong as what the code does, and the mixed-script case is the one users of a Persian product actually type. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** With KN-062's fixtures, a story renders a long Latin-led name in the Persian interface and asserts the chip is ltr and cut at its end, a digit-led Persian name resolves rtl, and DESIGN.md says what happens to a name with no letter at all instead of 'always'.

### `KN-265` Employment type becomes eight values, and a job can hold more than one

- **status** backlog · **severity** high · **points** 3 · **area** api
- **blocked by** none

The owner's decision of 2026-09-10, answering KN-073's employment type question. Ship eight values, a superset of both Iranian job boards: the six in DESIGN.md, full-time تمام‌وقت, part-time پاره‌وقت, internship کارآموزی, remote دورکاری, contract قراردادی and project پروژه‌ای, plus freelance فریلنسری and temporary موقت. The owner accepted that contract and temporary, and freelance and project, overlap in practice. And a job can be full-time AND remote, so the field holds more than one value. KN-034's schema stores a single value from the old six, so this is a migration: the enum gains two values and the column becomes a list, carrying existing values over.

**Why.** These are database enum values, so the list and whether a job holds one or several are fixed by a migration, and today a posting that is full-time and remote cannot be recorded truthfully. High rather than critical: it is data, and the owner's order is components first.

**Exit condition.** DESIGN.md's employment type list gives the eight values as the owner's decision of 2026-09-10, with the overlap noted, and says the field holds more than one; the Prisma schema has the eight and a record holds a list of them, through a migration that carries existing values over and is tested; the GraphQL schema and the generated types expose a list; the catalogs carry English ids and Persian for the two new values; and KN-073 is left holding only the job level list.

### `KN-266` The Input's border takes layout space, so its text sits a pixel inward of the file

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found while reading 95:38 for KN-244. Both field frames, 95:5 Default and 95:19 Focus, have strokeAlign INSIDE and strokesIncludedInLayout false, with 16 of padding at each side, read with use_figma: the stroke is painted over the padding and the text sits 16 from the edge in every state. The Input draws a CSS border, which is laid out, so its text sits at 17, a pixel of border plus 16 of padding, and the focus state holds it at 17 by dropping the padding to 15, an off-scale value compensating for an offset the file does not have. A stroke that takes no space, an inset box-shadow for instance, with spacing/md padding in every state, is what the file draws.

**Why.** Every Input sits a pixel off the file, and the 15px focus padding is the same computed off-scale value KN-263 removes from the Status Chip. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** In every state the Input's text sits spacing/md, 16px, from the field's outer edge, as 95:5 and 95:19 draw it, with the stroke painted inside that padding and taking no layout space; no padding in Input.tsx is computed from a border width; the Default and Focus stories measure the text's distance from the edge at 16; and the other bordered components are checked for the same offset, each matching or carrying a card.

**Roasts.** round 1 scored 4 with 1 critical(s)

### `KN-267` The Input has no leading or trailing icon slot, which node 95:38 carries

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found while reading 95:38 for KN-244. The Input component set carries four boolean properties, the label, the helper text, and a leading and a trailing icon, 20 by 20 in text/secondary at spacing/2xs from the text, and its own description says so. The Input built for KN-011 has a required label, an optional helper, and no icon slot, so the Search Bar and anything else composed on an Input would each hand-roll one.

**Why.** A component missing part of what the file draws is not finished, and the icons are what later components build on. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** The Input takes an optional leading and an optional trailing icon, each 20 by 20 at spacing/2xs from the text in text/secondary, matching 95:38 with the icons on, in both directions; stories show each and both; and the label's boolean in the file is either honoured, with the accessible name then required another way, or the decision not to is recorded in DESIGN.md.

**Roasts.** round 1 scored 4.5 with 1 critical(s)

### `KN-268` The catalog test's blank-translation check is weaker than the Input's blank rule

- **status** backlog · **severity** low · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-261 roast and confirmed from the code: src/i18n/catalog.test.ts strips the format characters from a translation and then asks for any non-space character, so a Persian translation made only of the braille blank U+2800, the combining grapheme joiner, a variation selector, a Hangul filler or marks alone passes as a message, while its own prose says it rejects messages that render as nothing. KN-261's isBlank already draws that line for the Input; the two rules disagree about the same idea.

**Why.** A test whose name claims more than it checks lets the case it names through. Low: no translator types a braille blank, and the catalogs are hand-written.

**Exit condition.** The catalog test and the Input decide blankness with the same predicate, moved to a module both can import without the i18n tests depending on an Input file, or the catalog test states and tests a deliberately different contract; either way a translation of only U+2800, U+034F or U+FE0F is caught by a planted case that fails the test.

### `KN-269` When a failed save arrives after the collapsed column has flashed is not decided

- **status** backlog · **severity** high · **points** 1 · **area** design
- **blocked by** none

CHILD OF KN-196, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-196 roast and confirmed against DESIGN.md: the owner's decision has the column recollapse and flash once the card lands, and no highlight when the save fails. KN-061 updates optimistically, so the card lands at once and the server's answer can come seconds later, on a cold Render start fifty, after the flash has run. Whether the flash waits for the save, is cancelled when the save fails, or plays and is followed by the rollback is observable behaviour nobody has chosen.

**Why.** KN-061 would otherwise pick the commit point silently, and a flash that confirms a move the server then refused is the opposite of what the owner asked for. High rather than critical: it is decided before KN-061 is built, which follows the components.

**Exit condition.** DESIGN.md states, as the owner's decision, when the collapsed column's success flash plays relative to the save and what happens to an optimistic move and its flash when the save fails; KN-061's exit condition names it; and a verifier checks the stated rule word for word in both places.

### `KN-270` The collapsed column's hover timer and flash have no rule for leaving, returning or a second drop

- **status** backlog · **severity** high · **points** 1 · **area** design
- **blocked by** none

CHILD OF KN-196, recorded in prose because board.json cannot express parent_task yet, KN-188. Found by the KN-196 roast and confirmed against DESIGN.md: 500 ms of the card resting over the collapsed column opens it, but whether leaving and coming back restarts the 500 ms or resumes it is not said; a second card dropped within the one-second flash could restart, extend or be swallowed by it; the one-second flash sits beside the design's 300 ms state change without saying which is which; and choosing the collapsed column as the keyboard target does not say whether it expands. Each is ordinary use, not an edge.

**Why.** Each is behaviour a person sees on the most-used status, and KN-061 would have to invent it. High rather than critical: it is decided before KN-061 is built, ideally with a running column to look at, as the owner asked for drag questions.

**Exit condition.** DESIGN.md states, as the owner's decision, whether leaving the collapsed column during a drag resets the 500 ms, what a second drop does to a running flash, how the one-second flash relates to the 300 ms state change, and whether the keyboard target expands; KN-061's exit condition names each; and a verifier checks each detail exactly, the 500 ms, the count ticking up and the flash's length included.

### `KN-271` The derived dark focus colour is 2.81:1 on the surface, below the 3:1 a focus indicator needs

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188. Found while planning KN-244 and measured from darkSemantic: the derived dark border/focus #2d69ec is 2.81:1 against the derived bg/surface #2e2e2e, 3.22:1 against bg/page #1f242e and 3.30:1 against bg/surface-secondary #1e2228. darkMode.ts walks every text token away from the surface with ensureContrast and no border token at all, so the derivation never checked it. It is the colour every focus indicator in the dark theme is drawn in: the Input's Focus border sits on the field's own bg/surface, and the Checkbox's ring sits on whatever surface holds it, so in dark both change their pixels at 2.81:1, under the 3:1 of WCAG 1.4.11 for a state indicator and of 2.4.13. border/error passes, narrowly: 3.23:1 on the surface, 3.70 on the page, 3.80 on surface-secondary.

**Why.** Someone in the dark theme who moves by keyboard needs to see where focus is, and the dark palette is derived by rules this repository wrote, so no design review will catch it. KN-244's focus ring for an invalid field is drawn in border/focus as well, so its measure cannot hold in dark until this does. Critical on the owner's order of 2026-09-10, as a finding on built components.

**Exit condition.** In the derived dark palette, border/focus and border/error each reach at least 3:1 against bg/page, bg/surface and bg/surface-secondary with their hue unchanged; darkMode.test.ts asserts all six ratios, and a mutation back to the unchecked derivation fails it; DESIGN.md's dark mode section says which borders are checked and at what ratio; and the Input's Focus state and the Checkbox's focus ring are seen in dark in both languages.

**Roasts.** round 1 scored 6 with 1 critical(s)

### `KN-272` In dark, a selected Filter Chip's text is 1.34:1 on its fill, and its pressed border 1.14:1

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-271 roast, and KN-271 is itself a child of KN-011, so its findings sit beside it. The roast reported the pressed border; measuring it found the text as well. In the derived dark palette bg/brand/container comes out #207df9: darkSemantic sends it through deriveDarkSurface, which hands a chromatic colour to deriveDark, and the flip plus the chromatic floor turn the pale #dbeafe into a bright mid blue, the collapse the status containers had before deriveDarkFill. A selected Filter Chip paints that fill with text/brand #7494ec on it, 1.34:1, and its :active border in border/focus #3670ed, 1.14:1. Seen in production Storybook: shared-filterchip--selected in dark renders the chip light blue on bright blue. In light the same two pairs are 5.49 and 4.24. text/brand is checked only against the neutral surface and border/focus only against the three neutral backgrounds, so no test holds a pair a component actually draws.

**Why.** A selected filter is the one the user is looking at, and in the dark theme its label cannot be read. The Filter Chip doubles as the status counter above the board, so this lands on the main screen once screens exist. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** In the derived dark palette bg/brand/container is a dark tint of its own hue, derived as a fill the way the status containers are, text/brand clears 4.5:1 on it and border/focus clears 3:1 on it, and every pair the tests already hold still holds; darkMode.test.ts asserts both pairs as the Filter Chip draws them, and a mutation back to the surface derivation fails them; and the selected Filter Chip, resting and pressed, is seen in dark in both languages.

**Roasts.** round 1 scored 8.8 with 0 critical(s)

### `KN-273` The Input and the Checkbox are bounded by a 1.24:1 border, under the 3:1 WCAG 1.4.11 asks of a control's edge

- **status** done · **severity** critical · **points** 1 · **area** design
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-271 roast. The resting edge of an enabled Input and of an unchecked Checkbox is border/default #e5e7eb, 1.24:1 on bg/surface and 1.16:1 on bg/page, and the Input's own fill is bg/surface, 1.07:1 against the page, so nothing else draws its boundary. WCAG 1.4.11 asks 3:1 of the visual information needed to identify a control. The derived dark palette follows the design, 1.33 on the dark surface and 1.16 on the dark page. It is the file's own value, read from node 95:3 and the Checkbox frame, and matching the file exactly is the owner's standing rule, so raising it is a departure from the design and not a build decision.

**Why.** Someone with low vision may not find the field, or see where the checkbox is, which is the first thing a form asks of them. It cannot be fixed without departing from the file, so the owner has to choose between the design as drawn and the contrast rule. Critical on the owner's order of 2026-09-10, as a finding on built components.

**Exit condition.** The owner has answered, through the question tool, whether the resting edge of an enabled Input and an unchecked Checkbox stays border/default as the file draws it or is raised to at least 3:1 against the surfaces it sits on; DESIGN.md records the answer as the owner's, with the date; and if it is raised, a card for the change exists.

**Roasts.** round 1 scored 6.8 with 1 critical(s)

### `KN-274` The Input's focus ring for an invalid field sits outside a field that fills its container, so a host that clips at its edge removes it

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-244 roast, KN-244 being a child of KN-011. KN-244 shows focus on an invalid field with an outline two pixels wide at an offset of two, so every pixel of the change lies four pixels outside the field's box, and the Input fills its container. Any host that clips its overflow with less than four pixels of inline padding, a scroll area or an exact-sized box, removes the ring completely, and the user is back to one red pixel. FocusedWhileInvalid gives each field 16 pixels of opaque padding and asserts computed styles, so it passes in that host, and so does every KN-244 mutation. DESIGN.md warns that a clipping container must leave the room, which is a rule nothing enforces. The Checkbox and the Filter Chip draw the same ring, but they are small and rarely sit flush with a clipping edge; an Input is flush with its container by design.

**Why.** The person tabbing back into a field that failed validation needs to see where focus is in the form the product actually ships, not only in the story, and forms sit in modals and scroll areas, the hosts most likely to clip. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** An invalid Input focused inside a host that clips its overflow flush at the field's edges still changes at least a two-pixel perimeter at 3:1, KN-244's measure, either because the change is drawn inside the field's own box or because the Input keeps the room itself; a story renders the field in an overflow hidden host with no padding and asserts, from the rendered geometry, that every pixel of the focus change lies inside every clipping ancestor, and a mutation back to a ring the host clips fails it by name; DESIGN.md's section says which; and the Checkbox's and the Filter Chip's rings are checked for the same, each matching or carrying a card.

**Roasts.** round 1 scored 5.5 with 0 critical(s)

### `KN-275` Add a resting edge role for controls at 3:1, and draw the Input and the Checkbox with it

- **status** backlog · **severity** critical · **points** 3 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: the owner's decision on KN-273, 2026-09-10, a KN-011 child. The file draws the resting edge of the Input, 95:3, and of the unchecked Checkbox in border/default #e5e7eb, 1.24:1 on white and 1.13:1 on bg/surface-secondary, under WCAG 1.4.11's 3:1 for the edge that identifies a control. The owner chose a new named palette role for a control's resting edge, a grey in the file's own hue, over keeping the file's colour. It is used by the Input's resting border (the edge in Input.tsx) and the Checkbox's unchecked frame (Checkbox.tsx), and by the Select when KN-012 builds it; the Hover edge text/secondary and border/default for cards, dividers and the Filter Chip stay as drawn. The value is picked with margin, not at the line: text/secondary's hue and saturation walked lighter to the last value clearing 3.3:1 on all three light surfaces gives #7f8694, 3.66, 3.41 and 3.32, while #868d9a clears 3:1 by only 0.03. It is not a Figma variable, so the token tables mark it as the owner's addition and the token verifier must still pass, and its derived dark row needs its own check, since KN-271 covers only border/focus and border/error. The hover change becomes subtler, about 1.3:1 between rest and hover, which WCAG does not ask about and the owner accepted by keeping hover as drawn.

**Why.** An empty field or an unchecked box has nothing but its edge to be found by, and at 1.24:1 someone with low vision may not find it. The owner chose the fix on 2026-09-10. Critical on the owner's order of 2026-09-10, as a finding on built components.

**Exit condition.** tokens.ts carries a named role for a control's resting edge, a neutral in text/secondary's hue at 3.3:1 or more on bg/surface, bg/page and bg/surface-secondary, and darkMode.ts derives it and checks it at 3:1 or more on the three dark backgrounds, each ratio asserted by a unit test with a mutation back to border/default failing it; the Input's resting border and the Checkbox's unchecked frame use it, and the Input's Default story and the Checkbox's Unchecked story assert it; every other state of both still renders as drawn; DESIGN.md's token tables list the role as the owner's addition under KN-273; the token verifier and the contract pass; and the Input and the Checkbox are seen at rest in all four combinations.

### `KN-276` The selected Filter Chip is told apart by a 1.22:1 fill, under the 3:1 WCAG 1.4.11 asks of a state

- **status** done · **severity** critical · **points** 1 · **area** design
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-273 roast, KN-273 being a child of KN-011. The Filter Chip's selected state, node 159:71, fills the chip and its border with bg/brand/container #dbeafe and turns its text to text/brand; unselected it is bg/surface with border/default and text/secondary. The fill that shows the state is 1.22:1 against white, 1.14:1 against bg/page and 1.11:1 against bg/surface-secondary, and nothing but colour tells the two states apart, so WCAG 1.4.11's 3:1 for the visual information that identifies a state is not met, nor 1.4.1's rule that colour is not the only sign. The chip's own text exempts its boundary, as KN-273's plan said, but not its state; that plan was wrong to leave the chip out of the question. It is the file's own drawing, so changing it departs from 159:71 and is the owner's call. In dark the same fill is the bright #207df9 KN-272 is about.

**Why.** Someone who cannot see a 1.2:1 difference cannot tell which filters are on, and the Filter Chip doubles as the status counter above the board. Fixing it departs from the file, so the owner has to choose. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** The owner has answered, through the question tool, whether the selected Filter Chip keeps the file's fill as its only sign of selection or gains one that meets WCAG 1.4.11 and 1.4.1, with the options and their trade named; DESIGN.md records the answer as the owner's, with the date; and if it changes, a card for the change exists that also covers KN-272's dark fill.

**Roasts.** round 1 scored 7 with 0 critical(s)

### `KN-277` KN-273's verifier takes the question tool from the section's intro, not from the KN-273 paragraph

- **status** backlog · **severity** low · **points** 1 · **area** agent
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-273 roast. The check that the answer came through the question tool searches the whole 2026-09-10 settled section, whose intro already says 'confirmed the details through the question tool' about the other two decisions, so the KN-273 paragraph could lose its provenance and the check would still pass. The intro's 'the third was put and answered through the question tool alone' binds it in prose; the verifier does not.

**Why.** A verifier should fail when the thing it checks is missing. Low: it is about the loop's tooling rather than the product, and nothing is broken today.

**Exit condition.** The KN-273 paragraph itself says the answer came through the question tool, KN-273's verifier reads that from the paragraph rather than from the section, and its in-memory control that removes the phrase from the paragraph fails it.

### `KN-278` TECH-DEBT 16 retires on a text search, not on the English twin passing under Vitest

- **status** backlog · **severity** low · **points** 1 · **area** docs
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-245 roast, KN-245 being a child of KN-011. TECH-DEBT 16 says ControlsMatchTheCanvas checks that its args follow the language only in Storybook's preview, because portable stories apply no updateStoryArgs. Its retirement check is a search of node_modules for a listener, which can find one that does not rerender the composed story or update its args, and retire the entry while the English twin still could not pass under Vitest.

**Why.** A retirement check that can pass while the thing it retires is still true removes the record of a gap without closing it. Low: it is about the suppression record, not the product, and nothing is broken today.

**Exit condition.** TECH-DEBT 16's retirement check is behavioural: take the early return out of ControlsMatchTheCanvas and run ControlsMatchTheCanvasInEnglish under Vitest; the entry retires only when that passes, and the entry says so.

### `KN-279` Give the selected Filter Chip a blue edge at 3:1, apart from its pressed edge

- **status** backlog · **severity** critical · **points** 3 · **area** web
- **blocked by** KN-272

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: the owner's decision on KN-276, 2026-09-10, a KN-011 child. The selected Filter Chip keeps the file's pale bg/brand/container fill, and its one pixel edge turns a blue at 3:1 or more on every surface: #2563eb in light is 5.17 on bg/surface, 4.82 on bg/page, 4.70 on bg/surface-secondary and 4.24 against the fill inside it. That blue is border/focus, which the chip already draws as its pressed edge (&:active) and as its focus ring, so pressing an unselected chip would look selected until it is released: the selected edge gets a named role of its own, or a story proves pressed and selected stay apart. In dark the fill is KN-272's, which derives it today to a bright #207df9, so this waits for KN-272 and then checks the edge against the dark fill and the dark surfaces.

**Why.** Someone who cannot see a 1.2:1 fill cannot tell which filters are on, and the Filter Chip is the status counter above the board. The owner chose the edge on 2026-09-10. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** A selected Filter Chip's edge is drawn in a named role at 3:1 or more against bg/surface, bg/page, bg/surface-secondary and its own fill, in light and in the derived dark, each ratio asserted by a unit test with a mutation back to the fill-coloured edge failing it; the Selected story asserts the edge; a pressed unselected chip is still told apart from a selected one, by at least 3:1 between their two indicators or by a difference that is not colour, such as the edge's width, and a focused chip beside a selected one keeps its ring visibly apart from the selected edge, both asserted on rendered chips side by side, including a chip held pressed from the keyboard; DESIGN.md records the edge under the owner's decision of KN-276; and the chip is seen unselected, selected and pressed in all four combinations.

### `KN-280` The bound Input takes a Controls value equal to an edit still in flight for its echo, and can stay apart from the arg

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-253 roast, KN-253 being a child of KN-011. Bound tells its own writes from Controls by value: an arg found in its queue of sent values is taken as an echo. Storybook applies the preview's updateArgs to the store at once and rerenders with whatever the store holds when the rerender runs, so renders coalesce. Sequence: an edit x7a in flight, Controls set to x7a after a newer edit x7ab has reached the store, and a coalesced rerender delivering only the final x7a: it is found in the queue, taken as the echo of the first edit, and the field keeps x7ab while the arg is x7a, with no later change to repair it. KN-253 named the case as an exception rather than fixing it. A revision carried with each write, compared with the value sent at that revision, tells them apart where a value cannot.

**Why.** Controls are how a reviewer drives a story, and a panel value the canvas silently ignores describes the field wrongly, the failure KN-245 fixed for the copy. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** Bound tells its own writes from anything else by a revision carried with each write, not by value, so an arg whose value is not the one sent at its revision is taken, whatever the queue holds; a check in a production build reproduces the sequence, an edit in flight, a Controls value equal to it arriving after a newer edit, and ends with the field and the arg equal; the exception is gone from the comment; the revision never reaches the Input or shows as a control; and KN-253's and KN-249's verifiers still pass.

**Roasts.** round 1 scored 9.5 with 0 critical(s)

### `KN-281` The Checkbox frame draws a 1px edge where every state in the file draws 1.5

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found while checking the other bordered components for KN-266, a KN-011 child. Read with use_figma: every Checkbox variant, 204:7 Unchecked, 204:10 Checked, 512:730 Indeterminate, 512:733 Hover and 512:734 Disabled, is 20 by 20 with a stroke of weight 1.5, aligned INSIDE and not included in layout. Checkbox.tsx draws borderWidth 1, and its comment says the file draws every border at one, which the file contradicts. The frame's glyph is centred, so the layout border moves no text, but the edge is two thirds of the drawn weight. How a 1.5px stroke renders at a device pixel ratio of 1, where Chromium snaps border widths to whole device pixels, is part of the question.

**Why.** Match the design exactly is the owner's standing rule, and the Checkbox's edge is the one thing that says where it is. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** The Checkbox frame's edge is 1.5 in every state as the five variants of 204:11 draw it, painted inside the frame and taking no layout space; what a 1.5 edge renders as at device pixel ratios 1 and 2 is measured and recorded; the stories assert the width; and the comment that says the file draws every border at one is corrected.

**Roasts.** round 1 scored 5.5 with 1 critical(s)

### `KN-282` The Filter Chip's text sits at 13 where the file draws 12, and its pressed edge is 1 where the file draws 1.5

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found while checking the other bordered components for KN-266, a KN-011 child. Read with use_figma: the Filter Chip variants of 159:71 are 32 tall with padding 12 at each side and 0 above and below, their stroke INSIDE and not included in layout, and the text at x 12 and y 5. FilterChip.tsx draws a one pixel CSS border, which is laid out, with paddingInline spacing.sm, so its text sits 13 from the edge, a pixel inward, the offset KN-266 removes from the Input. The file's Pressed variant, 159:67, draws its edge at 1.5, where FilterChip.tsx keeps 1 and only changes the colour. The Selected variant, 159:69, draws no stroke at all; the owner's KN-276 decision replaces that with a blue edge, which KN-279 builds, so this card leaves the selected edge to it.

**Why.** The Filter Chip is the status counter above the board, drawn a pixel off the file in every state, and its pressed state is not the one drawn. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** In every state the Filter Chip's text sits spacing/sm, 12px, from the chip's outer edge as 159:63 to 159:69 draw it, with the edge painted inside and taking no layout space; the pressed edge is 1.5 as 159:67 draws it; nothing in FilterChip.tsx computes a padding from a border width; the stories measure the text's distance from the edge; and the selected edge is left to KN-279.

**Roasts.** round 1 scored 7.5 with 0 critical(s)

### `KN-283` KN-266's text measurement reads the input's box, so a text-indent moves the text without failing a check

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-266 roast, KN-266 being a child of KN-011. textInsets in Input.stories.tsx, and KN-266's production check, subtract the input element's bounding rect from the field's, which is the input's box, not where its text starts. A static '& input': { textIndent: '1px' } in Input.tsx moves the drawn text to 17 in every state while every inset check still reads 16, and KN-243's layout comparison, which compares focus with rest, does not see a change present in both. So the exit condition's 'the text sits 16 from the edge' is measured by proxy. The text's start is the input box's edge on the side the text starts from, plus the input's own padding, border and text-indent there, given its direction and text-align.

**Why.** The card that moved the Input's text to 16 has a check that would not notice it moving back, which is the check that says it was done. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** The Input's stories and KN-266's production check measure where the text starts, the input's box edge plus its own padding, border and text-indent on the side the text starts from, given its direction and alignment, and read 16 as 95:5 draws it; a static text-indent, a padding on the input and a changed alignment, each present in every state, fail Default and the production check by name.

**Roasts.** round 1 scored 4 with 1 critical(s)

### `KN-284` The Checkbox's forced-colours edge is a laid-out border, shrinking its frame's content box in that mode

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-281 roast, KN-281 being a child of KN-011. KN-281 draws the frame's 1.5 edge as an inset shadow and, under forced colours, where the shadow is removed, a real one pixel ButtonBorder border. With box-sizing border-box the frame stays 20 by 20, but that border takes layout: the content box shrinks to 18 by 18 in forced colours only. The glyph is centred, so it does not visibly move, but the edge is not the inside, out-of-layout stroke the file draws and the card promised, and KN-281's forced-colours check only compares two pixels, so it could not see it.

**Why.** An edge that takes layout space in one mode is the defect KN-266 and KN-281 exist to remove, and the check that should catch it reads a colour, not a size. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** Under forced colours the Checkbox frame's edge is drawn over the frame without taking layout, a border on a pseudo-element for instance, so its content box stays 20 by 20 in that mode as in every other; KN-281's forced-colours check measures the content box and the glyph's position as well as the pixels, and a mutation back to a laid-out border fails it.

**Roasts.** round 1 scored 4.5 with 1 critical(s)

### `KN-285` Every Input on the file's screens turns its helper line off, while the Input always reserves it

- **status** done · **severity** critical · **points** 1 · **area** design
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found while reading 95:38 for KN-267. All 91 Input instances on the Screens canvas, 5:7, read with use_figma, set Helper Text to false, keep Label on, and use no icon. The Input always draws its message line, 22 tall below a 4 gap, KN-011's decision that an error appearing never moves the field. So once screens are built from it, every field sits 26 taller than the file draws it, and a form of five fields is 130 taller. The file's boolean says the line can be off; the component's decision says it is always there. It is a choice between the drawn layout and a form that does not jump when an error appears, and whether a field with the line off can show an error at all, KN-254 having decided an error needs a message.

**Why.** Match the design exactly is the owner's standing rule, and every screen will be taller than drawn unless this is settled before screens are composed; the decision the component made is good for errors and wrong for the drawn layout, so the owner chooses. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** The owner has answered, through the question tool, whether an Input on a screen keeps its message line reserved as the component does or drops it as the 91 screen instances draw it, and where an error on a field with the line off is shown; DESIGN.md records the answer as the owner's, with the date; and if the line can be off, a card for the change exists.

**Roasts.** round 1 scored 6.8 with 0 critical(s)

### `KN-286` An Input's error is not announced when it appears while the field has focus

- **status** done · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the plan check on KN-285, KN-285 being a child of KN-011. The Input's message line is a plain element the field names in aria-describedby, with aria-invalid set while there is an error. When validation marks a focused field invalid, its description changes, but a changed description is not announced: a screen reader user typing into the field hears nothing until they leave it and come back. WCAG 4.1.3 treats an error that appears without moving focus as a status message, which needs a programmatic announcement, a live region such as role alert, present before the text arrives. Clearing the error must restore the helper as the description, or drop aria-describedby when there is none, as it does today.

**Why.** The person being told their input is wrong is the one who most needs to hear it, and today a screen reader says nothing at the moment it happens. It holds whichever way KN-285 is answered. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** An error that appears on a focused Input is announced through a live region present before the error arrives, and the field keeps aria-invalid and its aria-describedby association; clearing the error restores the helper as the description or removes aria-describedby when there is none; a story asserts the live region's role and that it carries the error text after the error is set on a focused field, and a mutation removing the live region fails it by name.

**Roasts.** round 1 scored 7.2 with 0 critical(s)

### `KN-287` Draw the Input's message line only when there is a helper or an error, as the screens draw it

- **status** in_progress · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: the owner's decision on KN-285, 2026-09-10, a KN-011 child. All 91 Input instances on the file's screens turn the Helper Text line off, and the Error variant's message is that line, so a field is 64 tall at rest (16 label, 4, 44 field) and the 90 tall Error variant when it fails. The Input always draws the line, KN-011's decision that an error never moves the field, which the owner reversed: the line is drawn only when there is something to say, a helper or an error, and an error appearing adds it with its message and moves what is below by 26. The ErrorDoesNotMoveTheField story asserts the old decision and WithoutAHelper that the empty line holds its place; both change. The blank-error rule, KN-254, still means no line for a blank error; the announcement of a new error is KN-286.

**Why.** Every screen is 26 taller per field than the file until this lands, and the owner chose the drawn layout over a form that never moves. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** An Input with neither a helper nor an error draws no message line and is 64 tall, as the 91 screen instances draw it; with a helper or an error it is 90, the file's variants; an error appearing on a field without a helper adds the line with its message; an error on a field that has a helper replaces the helper with the error's message and the field's aria-describedby then names the error, and clearing the error brings the helper back; a blank error still draws no line; stories assert the 64 and the 90, the line appearing with the error, and the error replacing a helper, with a mutation that keeps the helper over the error failing by name, replacing ErrorDoesNotMoveTheField and WithoutAHelper's reserved line; every other place that asserts the reserved line is changed with it, KN-011's verifier and both languages' story docs included; DESIGN.md records the owner's reversal of KN-011's decision; and the Input's comment about the line always keeping its height is corrected.

### `KN-288` Under forced colours a disabled Checkbox draws the enabled edge, ButtonBorder, where GrayText says disabled

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-284 roast, KN-284 being a child of KN-011. In normal colours a disabled Checkbox's edge is bg/surface-secondary, the same as its fill, so it reads as absent; under forced colours, where the shadow is removed, KN-284's ::before draws one pixel of ButtonBorder in every state, disabled included, so a disabled checkbox looks exactly like an enabled one in high contrast. The system colour for a disabled control is GrayText. Only the unchecked and checked frames are read under forced colours today, so nothing would notice.

**Why.** A disabled control that looks enabled in high contrast invites a click that does nothing, for exactly the people who rely on that mode. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** Under forced colours a disabled Checkbox's edge is GrayText and every enabled state's is ButtonBorder, checked and indeterminate included; a check in a production build reads the rendered edge of all five states under forced colours, and a mutation giving disabled ButtonBorder again fails it; and DESIGN.md's stroke section says which colour each state takes there.

**Roasts.** round 1 scored 4 with 1 critical(s)

### `KN-289` KN-281's forced-colours check does not measure the tick's position, as KN-284's exit says it does

- **status** backlog · **severity** low · **points** 1 · **area** agent
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-284 roast. KN-284's exit says KN-281's forced-colours check measures the content box and the glyph's position; it opens only the unchecked frame, which has no glyph, and reads its content box and two pixels. The tick's position under forced colours is measured, but in KN-284's own verifier, on the checked frame. The position cannot expose a symmetric border anyway, flex centring keeping the tick where it was, so the content box is the check that matters; the gap is between what the exit says and where the check lives.

**Why.** A verifier should check what its card says it checks. Low: it is about the loop's tooling, the tick's position is measured elsewhere, and nothing in the product is wrong.

**Exit condition.** KN-281's forced-colours check also opens the checked frame and asserts the tick at the same offset with forced colours on and off, or KN-284's exit is amended to name where that measurement lives.

### `KN-290` Under forced colours the Checkbox's tick and dash keep their author colour, so a disabled mark looks enabled and a white one can vanish

- **status** backlog · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-288 roast, KN-288 being a child of KN-011. The tick and the dash are SVG strokes in text/on-accent, set as an author colour. Under forced colours an SVG's forced-color-adjust is preserve-parent-color, which keeps an explicit author stroke, while the frame's brand fill is replaced by the system background. So a disabled checked or indeterminate Checkbox shows the same mark as an enabled one, where KN-288 made its edge GrayText, and a white mark on a light system background can disappear altogether. KN-288's checks read only the unchecked disabled frame's edge, so neither shows.

**Why.** A checkbox whose mark cannot be seen, or whose disabled mark looks enabled, fails exactly the people who turned on high contrast to see it. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** Under forced colours the tick and the dash are drawn in system colours, ButtonText when enabled and GrayText when disabled, the keyword kept so a check can read it whatever the palette, and each stays visible against the frame; a check in a production build reads checked and indeterminate, enabled and disabled, under forced colours, comparing the rendered mark with a same-page probe of its system colour, and a mutation back to the author colour fails it; and DESIGN.md's stroke section says what the mark takes there.

### `KN-291` An Input icon given as false or null draws an empty slot, moving the text as if an icon were there

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-267 roast, KN-267 being a child of KN-011. Input.tsx draws a slot unless leadingIcon or trailingIcon is exactly undefined, but a React node that renders nothing can also be null, false, true or an empty string. The ordinary conditional, leadingIcon={hasIcon && <SearchIcon />}, passes false when the icon is off: the Input then draws an empty 20 by 20 slot, and with the gap the text sits 40 from that edge instead of 16. No story passes an empty value.

**Why.** The conditional that turns an icon off is the way callers write it, and it leaves a hole in the field the width of an icon. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** An Input given null, false, true or an empty string for either icon draws no slot and its text sits 16 from that edge, as with no icon at all; a story passes false for one icon and null for the other and asserts no slot and the 16, and a mutation back to the undefined check fails it by name.

**Roasts.** round 1 scored 7.2 with 0 critical(s)

### `KN-292` An Input icon given a blank string, a space or a zero-width character, still draws a slot with nothing in it

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-291 roast, KN-291 being a child of KN-011. drawn() in Input.tsx treats every string but the empty one as an icon, and a string of only spaces, a line break, a tab or a zero-width space renders a text node, so :empty does not collapse the slot either: the Input draws a 20 by 20 slot with nothing to see in it, and the text box sits 40 from that edge instead of 16. The error line already has a rule for blank text, isBlank, KN-254, which the slots do not use. And the story docs say an empty fragment or an icon that renders nothing draws no slot, where the slot is there and collapsed.

**Why.** A slot with nothing to see is the hole KN-291 closed for false and null, reached by a blank string instead, and the Input already knows what blank means. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** An Input given a string icon that isBlank holds for, spaces, a line break, a zero-width space or a joiner, draws no slot and its text box sits 16 from that edge; IconsTurnedOff covers a space and a zero-width space among its cases and asserts no slot, and a mutation dropping the blank check fails it by name; and the story docs say the direct values draw no slot, while an element that renders nothing leaves a slot that collapses and takes no room.

**Roasts.** round 1 scored 5.5 with 0 critical(s)

### `KN-293` The Checkbox's focus ring sits four pixels outside a root with no padding, so a host that clips flush at its edge removes it

- **status** backlog · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-013, recorded in prose because board.json cannot express parent_task yet, KN-188: found while doing KN-274, which moves the Input's ring inside the field for the same reason. The Checkbox draws focus as an outline, two pixels of border/focus at an offset of two, on its 20 by 20 frame, and its root has no padding, so every pixel of the ring lies two to four pixels outside the root's box. A list row, a table cell or a scroll area that clips its overflow flush at the Checkbox removes the ring, and focus is then shown by nothing.

**Why.** Someone moving through a list of checkboxes with the keyboard needs to see which one has focus in every host the product puts them in. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** A focused Checkbox inside a host that clips its overflow flush at the Checkbox's own box still changes at least a two-pixel perimeter at 3:1, drawn inside that box or with the room kept by the Checkbox itself; a story renders it in an overflow hidden host with no padding and asserts from the rendered geometry that every pixel of the focus change lies inside the host, a mutation back to the outline outside fails it by name, and DESIGN.md says which.

### `KN-294` The Filter Chip's focus ring sits four pixels outside the chip, so a scrolling row of chips clips it at its edges

- **status** backlog · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-017, recorded in prose because board.json cannot express parent_task yet, KN-188: found while doing KN-274, which moves the Input's ring inside the field for the same reason. The Filter Chip draws focus as an outline, two pixels of border/focus at an offset of two, on the button itself, so every pixel of the ring lies two to four pixels outside the chip. A row of chips that scrolls sideways, overflow auto, clips in both directions, and with no padding it removes the ring from the first and last chips at the row's ends and from every chip's top and bottom.

**Why.** The status counter is a row of chips, the kind of row that scrolls on a narrow screen, and the person moving along it with the keyboard needs to see which chip has focus. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** A focused Filter Chip inside a host that clips its overflow flush at the chip's box still changes at least a two-pixel perimeter at 3:1, drawn inside the chip or with the room kept by the chip itself, selected and not; a story renders it in an overflow hidden host with no padding and asserts from the rendered geometry that every pixel of the focus change lies inside the host, a mutation back to the outline outside fails it by name, and DESIGN.md says which.

### `KN-295` KN-274's story measures the focus change from a model: rounded bands counted as rectangles, and transforms and filters not read

- **status** backlog · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-274 roast, KN-274 being a child of KN-011. FocusedWhileInvalid computes the area the focus change covers with band(), which counts the widened error edge and the ::after ring as rectangles though both have rounded corners, and the verifier reads rendered pixels only on a 568 wide field. The corners and their anti-aliasing cost about 44 square pixels there, 3536 measured against 3580 computed, a loss that does not shrink with the field, so the story's margin is a model rather than a reading, and no narrow field is measured. And focusExtent reads only outlines, outer shadows and the pseudo-elements' insets: a transform, a filter, a clip-path or a mask on the field, its pseudo-elements or the input can move paint past the field's edge while the helper still reports it inside.

**Why.** The story is the proof that focus shows on an invalid field whatever holds it, and a proof that counts a shape the field does not draw, or cannot see a paint effect, can pass while the ring is clipped or short. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** FocusedWhileInvalid's area accounts for the rounded corners, from the exact quarter-ring areas of the edge's radius and the ring's or from a rendered reading, and still clears 4W + 4H; focusExtent requires what it does not model, transform, filter, clip-path and mask, to be none on the field, both pseudo-elements and the input, and counts the input's own outline; a transform and a filter on the ::after each fail FocusedWhileInvalid by name; the verifier also reads the rendered change on a field 80 wide or less, in light and dark, clearing 4W + 4H with nothing changed outside; and DESIGN.md's arithmetic states the corners' loss and the width above which the change clears the perimeter.

### `KN-296` An Input icon given as an array, a fragment or a component that renders only blank text still draws an empty slot

- **status** backlog · **severity** critical · **points** 2 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-292 roast, KN-292 being a child of KN-011. drawn() decides from the prop, and applies the blank rule only when the prop itself is a string. An array such as [' '], a fragment such as <>{' '}</>, or a component that returns whitespace is an element or an array to drawn(), so a Slot is drawn, and what it renders is a text node, which keeps the slot from matching :empty: a 20 by 20 slot with nothing in it, the text box pushed to 40. And the comment on drawn() says a blank string gives nothing to see, where the Input's rule is nothing to read: a lone combining mark such as U+20DD, which isBlank calls blank, can draw in some fonts, and is hidden by design.

**Why.** The slot exists to hold an icon, and any way a caller hands it nothing to read should leave the field as it is without one; a hole the width of an icon, reached through an ordinary composition, is the defect KN-291 and KN-292 closed for the prop's own values. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** An Input whose icon renders only blank text, through an array, a fragment or a component, draws no slot that takes room and its text box sits 16 from that edge, decided from what the slot rendered rather than from the prop; IconsTurnedOff covers an array of a space, a fragment holding a zero-width space and a component returning a space, each asserting a slot that takes no room; a mutation removing the rendered check fails it by name; and the comment on drawn() says nothing to read, with the lone-mark case named as deliberate.

### `KN-297` The Input's text measurement takes its direction from the input, so a placeholder with its own direction moves the text without failing a check

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-283 roast, KN-283 being a child of KN-011. textInsets in Input.stories.tsx, and KN-266's production check with it, read the placeholder's alignment and indent when the field is empty, but take the direction from the input. A static input::placeholder rule giving the placeholder its own direction, rtl in an English field, draws it from the right while the check still reports 16 from the left; unicode-bidi plaintext on the input lets a Persian value in an English field run from the right, and a writing mode other than horizontal-tb turns the axis the check measures along; none is guarded.

**Why.** KN-283 exists so that a check which says the text sits 16 from its edge notices the text moving, and this is a way the text moves that it does not notice. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** textInsets and KN-266's production check refuse by name unicode-bidi plaintext on the input, which lets the content set the direction, a writing mode other than horizontal-tb on the input, and an input whose direction is not the field's; unicode-bidi plaintext on the input, a vertical writing mode on it, and the input set to the other direction, each present in every state, fail Default and the production check by name; and KN-283's verifier still passes.

**Roasts.** round 1 scored 8.1 with 0 critical(s)

### `KN-298` An Input's error replaced by another while the field has focus is not shown to reach its live region

- **status** done · **severity** critical · **points** 1 · **area** web
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-286 roast, KN-286 being a child of KN-011. ErrorAnnouncedWhileTyping takes the alert from empty to one error and back, and KN-286's verifier reads the accessibility tree once after that; nothing replaces one error with another while the field keeps focus, a validator moving from too short to cannot be empty, say, though KN-286's plan says the alert reads again when the error changes. Whether a screen reader then speaks the second error is for a listening check, but whether the region carries it is not.

**Why.** A field whose error changes as the user types is the ordinary case for a form that validates as it goes, and the person typing needs the error that is true now, not the first one. Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition.** A story replaces one error with another on a focused Input, focus kept, and asserts the same alert holds the second error and the field is described by it; KN-286's verifier reads Chromium's accessibility tree after the replacement, the alert holding the second error, in both languages; and KN-286's plan says what is tested and that no check here hears a screen reader.

**Roasts.** round 1 scored 7.5 with 0 critical(s)

### `KN-299` KN-286's verifier reads the first alert and textbox in the tree, not the ones of the field it types into

- **status** backlog · **severity** low · **points** 1 · **area** agent
- **blocked by** none

CHILD OF KN-011, recorded in prose because board.json cannot express parent_task yet, KN-188: found by the KN-298 roast, KN-298 being a child of KN-011. readTree in agent/scripts/verify/KN-286.mjs takes the first non-ignored alert and the first textbox in Chromium's whole accessibility tree, each on its own, while ErrorAnnouncedWhileTyping renders two Inputs. It reads the described field's today only because that field comes first in the page; nothing binds the alert it reads to the input it types into, and the alert's node id is compared without being required to be there.

**Why.** A verifier that happens to read the right node proves less than it says, and a reordered story would make it read the other field's without failing. About the loop's own checks rather than the product, so low, on the owner's rule of 2026-09-10.

**Exit condition.** KN-286's verifier resolves the described field's input and its own alert span through the DevTools protocol, reads the accessibility nodes whose backendDOMNodeId are theirs, and fails when either id is missing; a story order swapped, the bare field first, still reads the described field's nodes; and KN-286's and KN-298's verifiers pass.

