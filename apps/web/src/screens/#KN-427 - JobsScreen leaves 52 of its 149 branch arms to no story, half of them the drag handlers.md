# KN-427 - JobsScreen leaves 52 of its 149 branch arms to no story, half of them the drag handlers

## The card

Found by KN-415's roast, which measured the board screen at 84.21 percent of its
branches. The card asks that the branches be driven "from the stories that already
exist rather than new ones where possible".

**Why.** KN-415 closed saying the screens were done and the gate was held open by
KN-103 alone. That was too broad: the merge does throw away function counts, but
these branches are the screen's own and nothing but a missing story is keeping them
open. A closed card that overstates what it finished is worse than one that names
what is left.

**Exit.** Every branch of JobsScreen.tsx is either taken by a story or has a comment
saying which state it belongs to and why no reader can reach it.

## Measured before planning, 2026-09-15

The storybook project on `JobsScreen.stories.tsx` alone, at 1d56a8f, with a JSON
coverage report of `JobsScreen.tsx`: the 21 stories pass, and the screen's stories
take 113 of its 163 branch arms, 84 of its 97 functions and 196 of its 245
statements. The card's 149 arms predate KN-477 and KN-495, which grew the screen.
The 50 arms left, by what reaches them:

**The drag, 26 arms and 10 functions**, lines 99 to 121, 267 to 281 and 417 to 448.
`clearHover` and `endDrag`; the landed flash's timer and its cleanup; `onDragStart`,
its guard against a link or an input, and the click a drag swallows; `onDragOver`
with no drag on, again over the same column, and over a collapsed column with its
500 ms timer; `onDragLeave` into the column's own content and out of it; `onDrop`
with no drag on, onto the card's own column and onto another; and `stableDropTarget`
and `dropFeedback` while a drag is on. The DragAndDrop story has no play, and
`e2e/drag-cards.spec.ts` drags with a real mouse, which no coverage sees.

**Other paths a reader takes, 16 arms, 3 functions and a statement.**

- 204, the statement: `landingsFor` finds no shown column holding the job. On a
  phone, a job whose status was changed from inside its modal and then deleted there.
- 229 and 240: `move` and `remove` with nothing held. A second press on the Change
  Status or the Delete confirmation while it dissolves: neither button guards
  against one, `ConfirmModal.tsx` line 61 and `ChangeStatusModal.tsx` line 67, and
  the modal dissolves over 150 ms.
- 235: a rename saved blank.
- 328: a board given no `onSignOut`, whose phone header then draws no sign out. The
  app always passes one; the prop is optional.
- 456 and 457: a column collapsed from its open header.
- 609 to 613, 619 and 620: a person added with every field filled, and an add backed
  out of.
- 633 to 637: a person edited with the role emptied and the rest filled.
- 614 and 638: a person saved after another tab deleted the job they were being
  added to or edited on. The job modal goes with its job, and the contact modal,
  drawn by the screen, stays.

**Nowhere a reader reaches, 8 arms.**

- 84 and 189: a board with no status. `readRecords` falls back to the defaults for a
  stored board with none; `deleteStatus` refuses a column holding a job
  opportunity; and a board holding none shows the empty state, which has no column
  menu. Only a screen outside `RecordsProvider` has no status.
- 195: no holder for the shown column. The row of columns and a phone's pile are in
  the page whenever a card that can ask to be deleted is.
- 208: the control that asked to delete is not an HTML element. Every control that
  asks is an HTML button or menu item.
- 222: saving with no job open. The job modal that saves is drawn only while its job
  exists.
- 568: opening a person not on the board. The ids the job modal offers are those
  `contactsOf` read for it in the same render.
- 628: editing with no person. `personId` is not null only when `person` is defined,
  which TypeScript cannot see through `personId`.
- 688: a key typed into the rename field after Enter closed it. MUI's focus trap gives
  focus back when `open` turns false, before the 150 ms dissolve ends, so the key
  lands on the control focus went back to; measured before the comment is written.

## The approach

1. **The drag, as DragAndDrop's play**, on the desktop board. The browser's own drag
   events are dispatched as the job modal's Files story drops a file: a `DragEvent`
   with a `DataTransfer`, bubbling from a card's article, or its link, to the
   handlers React holds on the article and on the column's section. This proves the
   handlers; the real drag stays the e2e's.
   - With no drag on, a `dragover` and a `drop` on a column change nothing.
   - From a card's link, `dragstart` is prevented and no drag begins.
   - From the card, `dragstart` carries the job's id. The play then waits for the
     drag to be on in the page, the collapsed column's content no longer taking the
     pointer, before anything else: a click on the card's title then opens nothing.
   - Over the collapsed rejected column its ring shows; a second `dragover` there
     changes nothing; `waitFor` sees it open with its card once its 500 ms are up. A
     `dragleave` into its own content keeps the ring, and one out of it clears it.
   - Dropped on the card's own column, nothing moves; `dragend` on the card's article
     ends the drag, and the column the drag opened is closed again.
   - Dragged again and dropped on another column, the card is in that column, the
     status region says where it went, and `waitFor` sees the column ringed in its
     status's colour and then, a second later, not.
2. **The other paths, in the stories that already walk near them**, as the card asks.
   - `Managing`: once the rejected column is open, its header collapses it again
     (456, 457).
   - `BackingOut`: a rename saved blank keeps the column's name (235).
   - `Working`: the Change Status confirmation's button, held before the first
     press, pressed again as it dissolves, moves the card once (229). `Selecting`:
     the Delete confirmation's the same, deleting the two and nothing else (240).
   - `OnAPhone`: a card opened, its status changed inside the modal, and the job
     deleted there leaves focus on the board (204).
3. **Three new stories, for what no story walks near.**
   - `PeopleInFull`: an add backed out of (619, 620); a person added with every field
     (609 to 613); then edited with the role emptied, the rest kept (633 to 637).
   - `PersonForAJobDeletedElsewhere`: another tab deletes the job while a person is
     being added to it, and again while one is being edited on another, each written
     as the storage event its write delivers, as ChangedInAnotherTab does; each saves
     the person with no job (614, 638).
   - `WithoutSigningOut`: at a phone's width, a board given no `onSignOut` draws its
     header's language and settings controls and no sign out (328).
4. **Where no reader reaches.** Two are written so the branch is not there: `save` is
   written inside the job modal's own branch, where `job` is known (222), and the
   contact modals' choice narrows `person` itself rather than through `personId`
   (628). The other six get the comment the exit asks for, beside each: the state it
   belongs to and why no reader reaches it, 688's with what was measured.
5. **What a play finds decides.** If a second press on a dissolving confirmation does
   not reach its handler after all, that arm gets a measured comment instead.
6. **The docs**, in both languages: DragAndDrop, Managing, BackingOut, Working,
   Selecting and OnAPhone say what their plays now walk, and the three new stories
   get entries.

## File by file

- `apps/web/src/screens/JobsScreen.tsx`: `save` inside the job modal's branch; the
  contact modals' branch narrowing `person`; six comments.
- `apps/web/src/screens/JobsScreen.stories.tsx`: DragAndDrop's play; Managing,
  BackingOut, Working, Selecting and OnAPhone extended; PeopleInFull,
  PersonForAJobDeletedElsewhere and WithoutSigningOut added.
- `apps/web/src/shared/story-docs/{en,fa}/Screens-Jobs.md`.

## What I expect to be hard, and what I am unsure of

- **Dispatched drag events.** Chromium lets a page build a `DragEvent` with a
  `DataTransfer`, and React handles one as it handles the browser's own. The
  collapsed column's `pointer-events: none` on its children, while a drag is on,
  changes hit-testing, not a dispatched event.
- **Sequencing the drag.** State set by one dispatched event is not in the page until
  React renders, so each step waits for what the page shows before the next.
- **Real timers.** The 500 ms opening and the second's flash run on the page's own
  timers; `waitFor` at two seconds.
- **Longer plays.** The card prefers the stories that exist, and each addition is a
  few lines at the end of a play that already walks there; what fits none of them is
  a new story.
- **328 is a prop the app always passes**, so its story is the screen's contract, not
  a reader's path. The prop is optional, and the story is the honest way to take the
  arm without pretending no one can.

## Plan review, Codex gpt-5.6-terra, 2026-09-15

Sound, with corrections, all taken.

1. **`dragend` on the card's article**, where `JobCard` holds `onDragEnd`; the column
   holds only drag-over, leave and drop. Taken in step 1.
2. **The second press on the button held before the first**, pressed again while the
   dialog is still mounted. Taken in step 2.
3. **The key after Enter is not a story.** In the installed MUI, the focus trap gives
   focus back when `open` turns false, before the Fade ends, so no reader reaches the
   field's late change: a measured comment. Taken in the list above and step 4; it is
   measured here before the comment claims it.
4. **Wait for each render.** After a dispatched `dragstart`, wait for the page to show
   the drag before the click or the column's events, and use `waitFor` for the
   timers. Taken in step 1.

**Confirmed.** React receives dispatched bubbling `DragEvent`s through its handlers
with `dataTransfer` and `relatedTarget`, and the children's `pointer-events: none`
does not stop them; this is handler coverage, and native drag semantics stay the
e2e's. Writing `save` inside its branch and narrowing `person` is within the exit and
more truthful than comments on guards TypeScript can prove needless.

## How I will know it works

- The same measurement again: the story run's JSON leaves untaken only the arms the
  comments name, each checked by line; every function called; the 24 stories pass.
- The unit project, eslint and tsc.
- The DragAndDrop play seen passing in the dev Storybook's Interactions panel, and the
  Screens/Jobs Docs page read in both languages.

## Result, 2026-09-15

Built as planned after the review.

- **The drag.** DragAndDrop's play dispatches the browser's own drag events on the
  board's real cards and columns and takes every drag arm.
- **The other paths.** Managing folds the rejected column again; BackingOut saves a
  blank rename; Working and Selecting press their confirmation's held button a second
  time, which does reach `move` and `remove`, as the review said; OnAPhone deletes a job
  moved inside its modal, and focus lands on the board.
- **New stories.** PeopleInFull, PersonForAJobDeletedElsewhere and WithoutSigningOut.
- **Where no reader reaches.** `save` is written inside the job modal's branch and
  `editing` narrows `person`, so 222 and 628 are gone. Six comments name the states no
  reader reaches; 688's carries its measurement. In three rounds in the dev Storybook,
  focus was already on the column's menu button when Enter closed the rename, and a key
  pressed straight after changed nothing.

**Found along the way.**

1. **KN-598.** The contact modal keeps a job opportunity another tab deleted: MUI warns
   that its Select's value is out of range, and the field shows the raw id.
   PersonForAJobDeletedElsewhere allows that one warning, TECH-DEBT.md section 22.
2. **The records keep the newest person first**, so that story expects that order.
3. **The fixture types a contact's fields as a string or null**, so PeopleInFull
   refuses by name a field the fixture stops filling.

**Checks.**

- The board's stories, 24 of 24. Coverage of `JobsScreen.tsx` from them: 97 of 97
  functions, 155 of 161 branch arms and 242 of 243 statements. What is left is exactly
  the six commented arms, at lines 89, 195, 203, 218, 580 and 704, and the statement at
  203. The measurement before planning left 50 arms, 13 functions and 49 statements.
- The unit project, 1477 of 1477; tsc and eslint clean; `JobsScreen.tsx` formatted, and
  the stories file keeping only the four lines of drift it had at HEAD.
- In the dev Storybook: DragAndDrop's play left the first job opportunity in the second
  column with no page or console error, and the Screens/Jobs Docs page prints the ten
  entries checked in fa-IR and in en-US, with Board as the control.
