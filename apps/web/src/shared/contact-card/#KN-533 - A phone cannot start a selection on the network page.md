# KN-533 - A phone cannot start a selection on the network page: the full Contact Card shows its checkbox only on hover or focus

## The card

Found while judging KN-356's roast, 2026-09-14. `NetworkScreen.tsx` draws the full
Contact Card at every width, and the full card folds its checkbox and delete at
rest, unfolding them only on `:hover` or `:focus-within`. A phone has no hover, and
a tap on a person's name opens their modal. So a touch reader on a phone cannot
choose anyone, and the network's Bulk Action Bar, its bulk delete and the tab bar
giving the bar the foot of the screen are out of reach there.

**Why.** Deleting several people at once is the network bar's only job, and a
phone is where a reader tidies their network; a bar that cannot be raised there is
a feature that exists on one screen size, silently.

**Exit.** A phone can choose a person on the network page the way the file draws
it, the Bulk Action Bar comes up in the tab bar's place, a story at 390 by 844
chooses two people and deletes them, and App/Shell counts one element fixed at the
foot while a person is chosen.

## What the file says, read with use_figma on 2026-09-15

- **Contacts / Mobile, 252:411**: the Page Header «شبکه من» with its action, the
  Search Bar, a List of full Contact Cards, `Layout=Full, State=Default`, 358 by
  261 and 12 apart, and the Tab Bar.
- **Each card's prototype**: ON_HOVER changes it to Hover, 248:84, Smart Animate
  200 ms; ON_CLICK goes to Mobile Edit, 305:2018, Dissolve 150 ms; and **ON_PRESS
  goes to Mobile Selection, 305:1842, Smart Animate 250 ms**. That is the press the
  phone's job cards carry to the board's Mobile Selection, 243:325, which KN-428
  built as a held press.
- **Contacts / Mobile — Selection, 305:1842**: the first two cards `State=Selected`
  and the third `State=Default`, no Tab Bar, and the Bulk Action Bar
  `Type=Contacts`, 280 by 60, centred 24 above the foot, «۲ مخاطب انتخاب شده» and
  «حذف».
- **The Contact Card set, 248:116**, in its description: its title row is the job
  card's, the delete at one corner and the checkbox before the name, both joining
  the layout only in Hover or Selected and the checkbox moving the name as the job
  card's does; a click opens the Contact Modal in Edit. It says nothing of a press;
  the prototype carries that. The Full variant's checkbox toggles on a click.
- **The Checkbox, 204:11**, read for KN-428: on a phone a long press turns selection
  on and the Checkbox appears on every card. Mobile Selection draws its unchosen
  card at rest, as the board's 243:325 draws all of its cards; KN-428 followed the
  Checkbox, so every phone card shows its checkbox while any is chosen.

## What the code does today

- `NetworkScreen.tsx` draws the full `ContactCard` at every width with no phone
  behaviour; `wide`, MUI's md, sets only the search bar's layout and the grid.
- `ContactCard.tsx`'s full card folds its checkbox and delete unless `selected`,
  and unfolds them on `:hover` and `:focus-within`. Its name is the card's button,
  whose `::after` covers the card, so a press on the card's body lands on the name.
- **The job card does this for a phone already**, KN-428: `useHold` in
  `job-card/hold.ts`. That is 500 ms within 10 pixels; a contextmenu during a press
  is the hold; the click a hold's release sends opens nothing, and the next press
  clears that mark. It is spread on the article when `layout` is mobile. Its
  `selecting` prop unfolds the checkbox on every phone card while the board
  selects. The phone card has no hover and starts no text selection or callout.
- `NetworkScreen` already tells the shell when it is selecting, `onSelecting`, and
  the shell gives the tab bar's place to the bulk bar then, KN-356. App/Shell's
  `Selecting` proves it on the board with a held job card, counting what is fixed
  at the foot.
- `hold.ts` is imported only by `JobCard.tsx` and `JobCard.stories.tsx`.

## The approach

1. **The held press, shared.** `job-card/hold.ts` moves to `shared/hold/hold.ts`,
   exported from `shared/hold/index.ts`, so the contact card does not import the job
   card. The job card and its stories import it from there. Nothing in it changes.
2. **The Contact Card takes a phone's press**, as the job card's mobile layout and
   `selecting` do, through two props, `phone` and `selecting`:
   - On a phone the article carries the hold's events, starting only on a press
     that lands on the name's button, not on the checkbox, the delete or a link.
     A hold selects a card not already selected. The name's click opens nothing
     when it is the one a hold's release sent. And the card starts no text
     selection or callout.
   - The checkbox folds unless the card is selected or the page is selecting. On a
     phone it unfolds while the focus inside is the keyboard's, `:has(:focus-visible)`,
     as the job card's phone does, not `:focus-within`, which the focus a closing
     modal gives back to the name would match. The delete folds unless selected, as
     now.
   - On a phone the card has no hover. A phone keeps `:hover` after a tap, which
     would lift a tapped card's edge and unfold its checkbox and delete. The press
     unfolds over the file's 250 ms, the job card's phone motion.
3. **The network page passes them**: `phone` below md and `selecting` while anyone
   is chosen. The shell's tab bar already gives its place, KN-356.
4. **Stories and docs.**
   - The Contact Card: a phone's hold that selects, where the release's click
     opens nothing and a tap opens; what does not select, meaning a drift, a
     cancel, a second finger, a press on the checkbox or the delete, and a right
     click; and every phone card's checkbox shown unchecked while selecting, the
     name moved over by 28. The new props go in both languages' docs.
   - The network page, at 390 by 844 through the runner's viewport: one person
     held, the bar up, a second chosen by their checkbox, «۲» counted, both
     deleted through the bar and its confirmation, and gone.
   - App/Shell: on a phone's network page with the sample data, a person held
     leaves one element fixed at the foot, the bar 24 above it, and no tab bar;
     letting go brings the tab bar back.
5. **DESIGN.md**: the Contact Card section gains the phone's press, read from
   252:411's ON_PRESS and 305:1842, as the job card's paragraph does.

**File by file**:

- `shared/hold/hold.ts`, moved, and `shared/hold/index.ts`, new; the job card's
  component and stories take the new import.
- `shared/contact-card/ContactCard.tsx` and `ContactCard.stories.tsx`, and
  `story-docs/{en,fa}/Shared-ContactCard.md`.
- `screens/NetworkScreen.tsx` and `NetworkScreen.stories.tsx`, and
  `story-docs/{en,fa}/Screens-Network.md`.
- `app/App.stories.tsx` and `story-docs/{en,fa}/App-Shell.md`.
- `DESIGN.md`.

## How I will know it works

- The Contact Card's new stories pass under Vitest. Planted once each, and restored
  by hash: without the hold's events the hold story fails, and with the fold
  ignoring `selecting` the selecting story fails.
- The network page's phone story chooses two people and deletes them. App/Shell
  counts one element fixed at the foot while a person is chosen, and the tab bar is
  back after.
- The job card's hold stories still pass from the moved hook. The Contact Card,
  network page and App stories pass. The unit project, lint and tsc are clean.
- A look at the network page at 390 in fa-IR light and dark and in en-US: a person
  held, the bar up, the checkboxes shown.

## What I expect to be hard, and what I am unsure of

- **Whether an unchosen card shows its checkbox while selecting.** Mobile Selection
  draws the third card at rest, while the Checkbox's words and KN-428's board show
  it on every card. The plan follows KN-428, so a second person is chosen with a
  tap on their checkbox rather than a second hold.
- **The hover on a phone.** Dropping it only when `phone` is set leaves a desktop
  pointer's hover as it is. A tablet wider than md with touch keeps the desktop
  card, as the board's job card does.
- **Moving `hold.ts`** changes two imports and nothing else. The alternative is
  exporting it from the job card's barrel, which makes the contact card import the
  job card.
- **The App story's road to the network page on a phone**: the tab bar's «شبکه من»,
  after the sample data is loaded from Settings as `Selecting` loads it.

## Plan review, Codex, 2026-09-15

Approved, with two corrections, both taken. The reading holds: the phone's network
draws the full card and its press goes to Mobile Selection, the job card's is the
repository's own build of that press, and every phone card's checkbox shown while
selecting is right, since the unchosen card in 305:1842 is drawn at rest, not made
unreachable. Moving the hook to `shared/hold`, hold events gated on a class of the
name's button, the hover dropped only when `phone` is set, `:has(:focus-visible)`
as the job card has it, and the three stories are the shape it asks for.

1. **A finger leaving the card proves nothing about touch.** A touch browser
   captures the pointer after `pointerdown`, so `pointerout` and `pointerleave`
   rarely fire during a touch. The Contact Card's not-a-hold story keeps the drift
   and the cancel and makes no claim about a finger leaving the card.
2. **The look includes en-US dark**, the fourth of the combinations section 5 asks.

The likeliest mistake it names, hold events on the article without the name's own
class and its click through `heldClick`, is the job card's predicate and release
check, copied onto the name.

## Result, 2026-09-15

Built as planned, with the review's two corrections.

- `useHold` moved to `shared/hold`, unchanged, and the job card and its stories
  import it from there.
- The Contact Card takes `phone` and `selecting`. On a phone the article carries the
  hold's events, starting only on the name's own button, `KarnamaContactCard-name`,
  and the name's click goes through `heldClick`. The phone's card starts no text
  selection or callout and has no hover. Its checkbox and delete unfold on the
  keyboard's focus, `:has(:focus-visible)`, over 250 ms, and at once for a reader who
  asks for less motion. The checkbox folds unless the card is selected or, on a
  phone, the page is selecting; the delete folds unless selected.
- The network page passes `phone` below md and `selecting` while anyone it shows is
  chosen.
- Stories: the Contact Card's `FullOnAPhone`, `FullNotAHoldOnAPhone` and
  `FullSelectingOnAPhone`; the network page's `SelectingOnAPhone` at 390 by 844,
  which holds one person, chooses a second by their checkbox, counts «۲» and deletes
  both. App/Shell's `Selecting` gained the network rather than a second story that
  loads the sample data again: on the phone's network page a person held leaves one
  element fixed at the foot, the bar 24 above it, and no tab bar, and letting go
  brings the tab bar back. Both languages' docs name the new props and stories, and
  DESIGN.md's Contact Card section has the phone's press.

**Checks.** The four story files pass, 60 tests: the Contact Card's 16, the network
page's 12, App/Shell's 14 and the job card's 18. The unit project passes, 1459 tests
in 40 files. tsc is clean. Lint found one string in the new stories, the
`-webkit-user-select` passed to `getPropertyValue`, now read as `userSelect`, and is
clean. Planted and restored by hash: without the hold's events only `FullOnAPhone`
fails, and with the fold ignoring `selecting` only `FullSelectingOnAPhone` fails.
Prettier wrote the files clean at HEAD; `ContactCard.tsx`, `NetworkScreen.stories.tsx`
and `App.stories.tsx` keep HEAD's drift of 4, 2 and 14 lines, none of them new.

**The look.** The network story at 390 by 844 with its first person held, in fa-IR
light and dark and en-US light and dark: the bar up counting one, the held card
selected with its delete in view, and the other two cards' checkboxes shown
unchecked, their names moved over.
