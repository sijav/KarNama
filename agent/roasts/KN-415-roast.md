# Roast: KN-415 - The screens' own coverage: the board's and the network's handlers are half untested

Reviewed 2026-09-12 against `2b5b205`, `981e0b3` and `551d5ff`, with `d902edf`
and `feb2ab1` read as the same task's earlier commits. Everything below was run
or read, not inferred. The coverage numbers quoted are from a real run of the
storybook project on this working tree.

## What is actually good, so the rest is not read as a sweep

- The board and the network really are driven end to end now. Renaming,
  recolouring, adding and deleting a column, the three roads into the add flow,
  the whole add form including both multi selects, the job modal's tabs, files
  and note, the phone board's card menu, the hash going both ways, and a sign in
  from a number to a name. That is a lot of real product, and it was not there
  before.
- Two genuine dead wires were found and cut, and one of them,
  `apps/web/src/screens/JobsScreen.tsx:150`, is a real product fix: the phone
  board was drawing the desktop card.
- `apps/web/src/core/records/records.test.ts:150-185` is real behaviour testing.
  `contactsOf` is asserted against a set with a non matching job and a null job,
  `contactMatches` is asserted on six inputs including a null field that must not
  match, and `readRecords` is asserted to drop four shapes that are not people.
  None of those is a line walker.
- Persian and English story docs are **equivalent, not stubs**. I read all seven
  pairs added by this task. `fa/Screens-Jobs.md`, `fa/Screens-Network.md`,
  `fa/App-Shell.md`, `fa/Screens-SignIn.md`, `fa/Shared-IconButton.md`,
  `fa/Shared-ContactCard.md` and `fa/Shared-AddJobModal.md` each carry a real
  translation of every entry, in the register the rest of the catalog uses.
  This is the one item on the brief's list that comes back clean.
- The `.focus()` question is answered honestly below, and the answer is not the
  bad one.

## Criticals

### C1. The exit condition was not met, and the close blames the wrong card with a claim that is measurably false

`agent/board.json`, KN-415's `evidence`, says: "The global threshold still
reports short, and not because of the screens: KN-103 makes the merged report
lose the browser project's hits ... **No test can close that gap: every
remaining hole in the report is a function a story demonstrably runs.**" On the
strength of that sentence, KN-103 - Coverage from the storybook project is
discarded for any file the unit project also touches was raised from high to
critical.

Measured, on this tree, storybook project only, `src/screens/JobsScreen.tsx`
alone:

```
  JobsScreen.tsx   |     100 |    84.21 |     100 |     100 | ...390-394,424,437
```

`vitest.config.ts:83` sets `thresholds: { statements: 100, branches: 100,
functions: 100, lines: 100 }`. **Branches are part of the threshold and
JobsScreen is at 84.21.** There are 15 uncovered branches in that one file, and
at least seven of them are reachable from a story nobody wrote:

| Line | Branch | A story could drive it by |
| ---- | ------ | ------------------------- |
| `JobsScreen.tsx:204` | the empty state's title when `found === 0` but jobs exist | typing a search that matches nothing |
| `JobsScreen.tsx:206` | the same state's body | the same |
| `JobsScreen.tsx:390` | `values.company` non empty in the job modal's contact save | filling company in the People story |
| `JobsScreen.tsx:391` | `values.email` non empty | the same |
| `JobsScreen.tsx:392` | `values.phone` non empty | the same |
| `JobsScreen.tsx:393` | `values.linkedin` non empty | the same |
| `JobsScreen.tsx:424` | saving a rename with a blank name | clearing the field and pressing Save |

The 204 and 206 pair is not a curiosity. It is the board's **"No results found"
empty state**, a state DESIGN.md draws at node `305:1684` and that KN-043 - The
kanban board screen built two commits earlier. It has no story at all. The
`Working` story types a search at `JobsScreen.stories.tsx:106` and deliberately
types a title that **does** match, so the one thing it would take to render that
state was avoided.

The commit message is worded to survive this: "JobsScreen is at 100 percent of
its statements and functions". True, and it steps around the number the gate
actually fails on. The card's exit condition does not: "npm test in apps/web
reports 100 percent again with no threshold error."

**What it should be.** KN-415 goes back to in_progress, or a child card is filed
naming those seven branches, and KN-103's severity note is corrected to say what
share of the shortfall is really the merge and what share is missing stories.
Raising another card to critical on a sentence that a two minute run contradicts
is the part that matters here, not the percentage.

### C2. The phone board can no longer start a selection at all, and nothing says so

`apps/web/src/screens/JobsScreen.tsx:150` now passes `layout={wide ? DESKTOP :
MOBILE}`. `apps/web/src/shared/job-card/JobCard.tsx:252` reads:

```tsx
{interactive && (layout === 'desktop' || selected) ? checkbox : null}
```

On the mobile layout the checkbox is rendered **only when the card is already
selected**, and nothing on the mobile card can make it selected: the phone
card's `CardMenu` offers change status, open link and delete, and no select.
Before this change the phone board drew the desktop card, whose checkbox was
folded behind hover but still mounted, still in the tab order and still
unfoldable by `:focus-within`. After it, the checkbox is not in the DOM.

So on a phone: no selection, therefore no Bulk Action Bar, therefore no bulk
delete, no bulk status change, no select all. `JobsScreen.tsx:295-310` still
renders the bar and still wires `onSelectAll`. DESIGN.md section 3's navigation
entry says the tab bar "gives way to the Bulk Action Bar while selecting, which
is the board's to do", and the Bulk Action Bar section says "On a phone it
wraps" against the file's own mobile bar `243:408`. The design expects phone
selection to exist.

Two open cards are now about a state the product cannot enter: KN-352 -
Unchecking the phone card's checkbox removes the control that holds focus, and
focus falls to the page, and KN-356 - Navigation cannot give the tab bar's place
to the Bulk Action Bar while cards are selected.

The commit reports only the half it fixed: "there was no way to delete a job
opportunity or move it from the board on a phone". It traded that for "there is
no way to select one". This task filed KN-424 - The job modal hands the contact
card a select handler it can never call for a single unreachable statement, and
filed nothing for a whole unreachable flow it created.

**What it should be.** Either the phone card carries a way in to selection, the
file's own `491:751` Selected state implies one, or the board stops rendering a
Bulk Action Bar it cannot raise on a phone, with a card recording which. Either
way KN-352 and KN-356 get a note saying they are currently unreachable.

### C3. Three of the headline assertions cannot fail

These are the stories written for exactly the handlers the card names, and each
one asserts a thing that was already true before the click.

**`apps/web/src/screens/JobsScreen.stories.tsx:184-189`, `Managing`, the collapse
and expand of rejected.**

```tsx
await userEvent.click(canvas.getByRole('button', { name: new RegExp(rejected) }))
await waitFor(async () => {
  await expect(canvas.getAllByText('هنوز فرصت شغلی‌ای تو این مرحله نیست').length).toBeGreaterThan(0)
})
```

`KanbanColumn.tsx:178` renders `<EmptyColumn />` whenever a column has no
children. By line 184 this story has already deleted `jobs[0]` (line 178), which
emptied column 0, and already added a new column (line 167), which is empty too.
So `getAllByText(...)` is non empty **before** the click, and `onExpand` could be
`() => undefined` and this passes. The one handler the card names by name has an
assertion that cannot see it.
*Should be:* assert the count goes from 2 to 3, or assert the rejected column's
own menu button appears, since DESIGN.md says a collapsed column draws a chevron
where the menu icon was and no menu.

**`apps/web/src/screens/JobsScreen.stories.tsx:133-136`, `Working`.** The comment
says "And the column it moved to now holds it", the assertion is
`canvas.getByText(first)).toBeInTheDocument()`. The card was on the board before
the move. `records.moveJobs` could be a no op and this passes.
*Should be:* find the offer column by its header and assert the title is inside
it, or assert the offer column's count.

**`apps/web/src/screens/JobsScreen.stories.tsx:371-377`, `BackingOut`.** The
comment says "A column takes a colour from the same menu"; the assertion is that
the purple radio is gone, which asserts the picker closed, not that the column
took a colour. `records.recolourStatus` could be a no op and this passes.
*Should be:* reopen the picker and assert purple is the checked radio, or read
the column chip's own fill.

## High

### H1. Documentation prose went back into the TSX, six times, against the rule and against the file's own line

`AGENTS.md`: "No JSDoc above `const meta`, no docblock above a story export, no
`description:` inside `argTypes`." KN-207 - The Checkbox breaks two standing
repository rules: prose in the tsx, and no fn() on the callback is a closed card
about exactly this.

- `apps/web/src/shared/icon-button/IconButton.tsx:13-21`. An eight line JSDoc on
  the new `href` prop, placed seven lines under the file's own comment
  `// The props are documented in story-docs, not here, KN-207.` at line 6. It is
  not inert: `DocsPage.tsx:67` renders `<Controls />`, which reads Storybook's
  prepared `argTypes`, which `react-docgen-typescript` fills from this JSDoc. So
  the Persian docs page prints this English paragraph in the Description cell of
  the Controls table, the only prop in the table that has one, directly above the
  localized `### href` from `fa/Shared-IconButton.md`. That is the failure mode
  gate step 7 names word for word.
- Story docblocks, all added by this task, all duplicating a paragraph that
  already exists in `en/*.md`: `JobsScreen.stories.tsx:193-201` (`People`),
  `:437-443` (`Adding`), `:530-533` (`Selecting`);
  `NetworkScreen.stories.tsx:135-141` (`Editing`); `App.stories.tsx:124-131`
  (`Navigating`).

The story-docs guard does not catch any of this: `guard.test.ts` checks that
every prop and story has an entry in both languages and never checks the TSX for
prose. So the rule was enforced by habit and the habit lapsed.
*Should be:* delete all six. The prose is already in the markdown, in both
languages, and two copies of a paragraph is two paragraphs that will drift.

### H2. The network page's search box is announced as "search job opportunities", and the story wrote that down as a fact instead of a card

`apps/web/src/shared/search-bar/SearchBar.tsx:115-116` hardcodes
`placeholder: 'Search in title, company or note'` and
`aria-label: 'Search job opportunities'`. `NetworkScreen.tsx:95` uses that bar
for contacts. A screen reader on the contacts page hears "search job
opportunities"; a sighted reader is told to search a title and a note for a
person.

`apps/web/src/screens/NetworkScreen.stories.tsx:96-97`:

```tsx
// The bar's own accessible name, which the component fixes.
const search = canvas.getByLabelText('جستجوی فرصت‌های شغلی')
```

The covering looked straight at it, described it in a comment as though it were
a property of the component rather than a defect, and filed nothing. The same
session filed KN-423 - The Contact Card's checkbox has no accessible name,
though the card sets one and KN-424 for smaller things, so the standard was
applied inconsistently within one task. `en/Screens-Network.md` compounds it by
documenting "A search narrows the page by name, role, company, email or number",
which is what the code does and not what the placeholder says.
*Should be:* `SearchBar` takes a `label` and a `placeholder`, or at least a
`label`, the network page passes the contacts one, and the story finds the bar by
that name.

### H3. Select all, and bulk delete, ignore the search

`apps/web/src/screens/JobsScreen.tsx:307-309`:

```tsx
onSelectAll={() => {
  setSelected(records.jobs.map((entry) => entry.id))
}}
```

With a search narrowing the board to one visible card, "Select all" selects
every job on the board, the bar says so in a number the reader cannot reconcile
with what is on screen, and Delete destroys job opportunities that were never
drawn. This is the same defect class KN-422 - The board's column menu deletes a
status whose jobs a search is hiding, Rename does nothing, and the columns do
not scroll was raised for one commit earlier, in the same screen.

The irony is exact: the handler this task **deleted** from
`NetworkScreen.tsx:141` was `setSelected(shown.map((held) => held.id))`, which
was search aware. The dead code was more correct than the live code, and it was
cut without anyone noticing the live one.

`JobsScreen.tsx:107`'s `held` filters the selection by existence only, not by
visibility, so the same hole is open from the other direction: select two cards,
then search, and the bar still offers to delete two cards that are no longer
drawn. `NetworkScreen.tsx:134` does not even filter by existence, it passes
`selected.length` straight through.

`JobsScreen.stories.tsx:563-568` clicks Select all with no search active and
asserts the count equals `seeded().jobs.length`, which **enshrines** the wrong
semantics as the expected ones.
*Should be:* select all takes what the search found, `cardsOf` over every column,
and the story asserts that with a search active.

### H4. The confirm modal says "this job opportunity" while deleting several

`apps/web/src/screens/JobsScreen.tsx:457-458`:

```tsx
title={i18n._('Delete this job opportunity?')}
body={i18n._('This job opportunity is deleted for good and cannot be brought back.')}
```

`setDeleting(held)` at line 302 puts N ids into that modal.
`JobsScreen.stories.tsx:576-581`, `Selecting`, deletes **two** through it and
asserts nothing about a single word of its copy. `NetworkScreen.tsx:165-166` has
the same pair for contacts. The Bulk Action Bar right above it pluralises
correctly through `Intl.PluralRules` at `BulkActionBar.tsx:32`; the modal that
actually destroys the records does not.
*Should be:* the confirm takes the count and pluralises, the way the bar does,
and the `Selecting` story reads the title before it presses Delete.

### H5. `.focus()` is legitimate, but it was used **instead of** the assertion that matters

The brief asks whether this is a backdoor. It is not, and the answer is worth
stating precisely.

`JobCard.tsx:133` folds on `&:hover .CHECK, &:focus-within .CHECK`. So
`box.focus()` really does travel the reader's keyboard road, and it is the road
the design intends, KN-341. The mouse road is exercised too, once on each screen:
`JobsScreen.stories.tsx:125-126` uses `userEvent.hover(card)` and
`NetworkScreen.stories.tsx:123-124` uses `userEvent.hover(check)`. So the hover
path is not entirely unproven, and `BackingOut`'s comment at lines 403-407 gives
an honest reason for not relying on hover there.

What is missing is what `.focus()` cannot say. DESIGN.md, the job card section:
"they stay in the keyboard's path, and Tab meets the Checkbox, the title, the
link and the delete in the order they are drawn." `element.focus()` jumps
straight to the element. Not one of the five call sites, `JobsScreen.stories.tsx:409`,
`:548`, `NetworkScreen.stories.tsx:231`, `:242`, `:264`, presses Tab. Give the
checkbox `tabIndex={-1}`, or move the delete before the title in the DOM, and
every one of these stories still passes while the contract DESIGN.md writes down
is broken.
*Should be:* one story on each screen walks in with `userEvent.tab()` from the
card's own opener and asserts the order, rather than five that teleport.

### H6. The ContactCard mail change is defensible and landed wrong

The change itself, `apps/web/src/shared/contact-card/ContactCard.tsx:243-247`, is
the right call on its merits: an icon control that opens an address should be an
anchor, the full card's own email row is already a `Link` at line 154, and a
reader gets middle click, copy address, and "link" from a screen reader. It also
kills a branch that could never be covered, the `if (contact.email !== null)`
inside a handler that only renders when email is non null. That is honest.

Three things are wrong with how it landed:

1. **DESIGN.md was not corrected in the same change.** The Contact Card section
   says the compact card carries "the mail and delete Icon Buttons", and the Icon
   Button family at `460:672` is a button. AGENTS.md: "Where the code and the
   file disagree, Figma wins and `DESIGN.md` gets corrected in the same change."
   The diff touches no `.md` outside story-docs. The sentence two lines later,
   "Email and phone are mailto and tel links", is about the full card's rows, so
   this is a real ambiguity that was resolved in code and left unresolved in the
   contract.
2. **`href` and `disabled` now contradict each other.**
   `IconButton.tsx:64,68`: MUI's `ButtonBase` renders an anchor when given an
   `href`, and for a non `button` component it sets `aria-disabled` and does not
   set `disabled`. So `<IconButton href="..." disabled />` renders a link that
   looks disabled, is out of nothing, and still navigates on click and on Enter.
   No story covers the pair, and `en/Shared-IconButton.md`'s `### disabled` still
   says "takes it out of the tab order", which is now only true for the button
   form.
3. It is a product and design change made inside a coverage task, with no card
   of its own, announced in the third paragraph of the commit message.

*Should be:* a DESIGN.md line settling the compact card's mail control, and
`IconButton` either refusing `href` with `disabled` at the type level, `href` and
`onClick`/`disabled` as a discriminated pair, or rendering `aria-disabled` plus a
click guard with a story for it.

### H7. The sign in story asserts the screen stopped asking, not that anyone signed in

`apps/web/src/screens/AuthScreen.stories.tsx:100-106`. After `Continue`:

```tsx
// With a name, the screen has nothing left to ask: the shell takes over,
// which a story of the screen alone shows as the sign-in step gone.
await expect(canvas.queryByText('تو را چه صدا کنیم؟')).toBeNull()
```

`AuthScreen.tsx:48` picks the step from `auth.signingUp`, then `auth.awaiting`,
then the number step. When `saveName` runs, both flags clear and the screen falls
back to **"Sign in to KarNama" with an empty phone field**, which is not "the
shell takes over", it is the first step again. The assertion is satisfied by that
fallback. A `saveName` that stored nothing, or stored the empty string, passes
this story identically.
*Should be:* assert the session, the way `App.stories.tsx:117` asserts the
language choice in `localStorage`, or assert the name comes back from
`useAuth()`.

Smaller, same story: `:89-93` asks for a second code and asserts only that a
second one was logged. The comment claims "the last one sent is the one that
works". A `resend` that returned the same code passes. Nothing tries the first
code after the second was sent.

## Medium

### M1. Two of the new node tests execute lines rather than test behaviour

`apps/web/src/core/records/RecordsProvider.test.tsx:196-211`, "is read through
its own hook, which is what every screen uses", renders a probe inside the
provider and asserts `statuses.length === 5`. `useRecords` is
`useContext(RecordsContext)`, one line, and the default context has
`statuses: []`, so the test can fail, but only by the provider failing, which
every other test in the file already covers. It adds a function call to the
report and no information.

`RecordsProvider.test.tsx:163-194` is two unrelated tests in one `it`: storage
that throws, and the per reader key. The second half is real and good; the first
half's assertion after stubbing a throwing `localStorage` is
`expect(held.statuses).toHaveLength(5)`, which is true with or without storage.
The failure it really guards is the render throwing, and that is not what it
says.

`apps/web/src/core/auth/AuthProvider.test.tsx:113-134` has the same shape:
`expect(held.session).toBeNull()` is true when nothing is seeded either way. The
real guard is the render, so say so.
*Should be:* split the storage test from the key test, and assert the thing that
distinguishes a guarded read from an unguarded one, which is that the provider
mounted and its setters still work, not the value of a field that is null in both
worlds.

### M2. `AnswerAfterLeaving` proves a negative with a fixed sleep and module level state

`apps/web/src/shared/add-job/AddJobModal.stories.tsx:349` holds a module scoped
`let settleLeft`, and `:375-378`:

```tsx
settleLeft?.(foundIn('fa-IR'))
await new Promise((resolve) => setTimeout(resolve, 100))
await expect(... queryByRole('textbox', { name: 'عنوان شغلی' })).toBeNull()
```

A negative assertion behind a fixed wait is the one kind of assertion that gets
**weaker** as the machine gets slower: on a loaded runner the 100 ms expires
before the resolved promise has been flushed through React, and the story passes
without having tested the guard. `:343` shows the pattern was already in the
file, so this is a precedent being followed rather than invented, but it is still
the wrong shape. The module level `settleLeft` also leaks across renders of the
docs page, which mounts every story in the file.
*Should be:* `waitFor` on something that becomes true when the answer is
correctly discarded, for example the paste field still holding `LINK` **and** the
extract button still enabled, rather than a sleep and a `queryBy ... toBeNull`.

### M3. Line walking inside otherwise good stories

- `JobsScreen.stories.tsx:280-282`, `People`: types the whole posting link into
  `لینک آگهی` and never asserts it, never saves it, never reads it back. It exists
  to run an `onChange`.
- `JobsScreen.stories.tsx:501-505`, `Adding`: line 499 chooses `columns[1]` as
  the new job's status, then the save asserts only `canvas.getByText(title)`
  somewhere on the board. The status the story went to the trouble of choosing is
  never checked.
- `JobsScreen.stories.tsx:509-512`, `Adding`: opens a column's Add Card row and
  cancels, asserting only that the dialog went away. The comment says the flow
  opens "for that column"; nothing checks which column it opened for, which is
  the only thing that distinguishes this road from the header's.
- `NetworkScreen.stories.tsx:53-58`, `People`, and `:61-63`, `InEnglish`:
  `InEnglish` has no play at all and `People` asserts one name is present. Fine as
  render checks, but they are three of the six stories on that page.

### M4. The contact save logic is now duplicated across two screens, and the copies are covered unequally

`JobsScreen.tsx:386-398` and `NetworkScreen.tsx:56-69` are the same function:
trim each optional field, map empty to null, look up the job title, branch on add
versus save. The network copy has every branch driven by `Editing`, which fills
all six fields. The board copy has only `name` and `role` driven by `People`,
which is precisely why `JobsScreen.tsx:390-393` are four of the fifteen uncovered
branches in C1. Two copies means every branch has to be driven twice, and one of
them was not.
*Should be:* one `contactFrom(values, titleOf)` in `core/records`, tested once in
the node project, called from both screens.

### M5. Saving a rename with a blank name silently discards it

`JobsScreen.tsx:422-426`. Clear the field, press Save, the modal closes and
nothing changed, with no message and no sign that anything was refused. The
Input has an `error` prop and DESIGN.md has a whole section on what a blank error
means. This is the false side of the uncovered branch at line 424, so it is both
a product hole and a coverage hole in one place.

### M6. Four story-docs markdown files are prettier dirty

```
[warn] apps/web/src/shared/story-docs/en/Screens-Jobs.md
[warn] apps/web/src/shared/story-docs/fa/Screens-Jobs.md
[warn] apps/web/src/shared/story-docs/en/Screens-SignIn.md
[warn] apps/web/src/shared/story-docs/fa/Screens-SignIn.md
```

A missing blank line before `### People` and before `### SigningIn`, in both
languages, where the entries were appended by hand. `npm run lint` is
`eslint . --max-warnings 0` and never touches markdown, so the gate cannot see
it, which is why it is here rather than in the gate.

## Low

### L1. `OnAPhone` renders nothing of what it documents in Storybook itself

`JobsScreen.stories.tsx:604`: `if (!('__KARNAMA_STORY_TEST__' in globalThis))
return`. A reader who opens the OnAPhone story in Storybook sees the desktop
board, while `en/Screens-Jobs.md`'s entry describes the phone board with no note.
`en/App-Shell.md`'s `LanguageOnAPhone` entry does carry that note ("in Storybook
itself, narrow the window and use the switch yourself"). Same technique, one
entry tells the reader and the other does not.

### L2. `Selecting` matches the count by a single Persian digit

`JobsScreen.stories.tsx:567` uses `toHaveTextContent(formatCount('fa-IR', 5))`,
a substring match on `۵`. It works today because the board has five jobs. At
fifteen it would match `۱۵` too. `NetworkScreen.stories.tsx:240,245` has the same
shape with `۲` and `۱`.

### L3. The phone board's status chips cannot be untoggled

`JobsScreen.tsx:277-279`: `onToggle` only ever calls `setChosen(column.id)`. A
FilterChip whose toggle cannot toggle off is a radio wearing a checkbox's API.
Not caused by this task, but `OnAPhone` is the first story to drive it and did
not notice.

## On the two brief questions not answered above

**Is `wide ? 'desktop' : 'mobile'` the right breakpoint source?** Yes for the
board, and it did **not** silently change the desktop. `wide` is
`theme.breakpoints.up('md')`, MUI's 900, which is the same threshold DESIGN.md
ties the sidebar to tab bar switch to and the same `wide` the board already used
to choose between columns and status chips at line 215. `wide` true yields
`DESKTOP`, which is exactly what `JobCard` defaulted to before, so the desktop is
byte for byte unchanged. The real cost is C2, not the breakpoint.

**Does `IconButton`'s `href` belong in that component?** Yes in principle, an
icon only control that navigates is a link and the component is the right place
to say so. No as written, because of H6.2: the prop is added without settling
what it means next to `disabled`, and the markdown that documents `disabled` is
now wrong for half the component's states.

VERDICT
score: 5/10
criticals: 3
