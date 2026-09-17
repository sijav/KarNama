# KN-389 · A column a search emptied says it has none at this stage, while its count says it has one

Child of KN-060, from the KN-353 roast. The column's count is the status's live count; its empty message, node `241:46`,
says «هنوز فرصت شغلی‌ای تو این مرحله نیست». When a search hides a column's only card the two appear together, and the
message is false: the status does hold a job opportunity, the search is hiding it.

**Why**, from the board: search is how a reader with a long board finds a job opportunity, and a column that contradicts
itself while searching reads as losing data.

**Exit**, from the board: read the file for a search or filtered state of the board and its columns and settle, in
DESIGN.md, what a column shows when a search hides its cards and what its count counts, asking the owner if the file is
silent; the column does that, and a story renders a filtered column with a live count of one.

## 1. The file does not settle it, and I checked before saying so

The exit sends me to Figma first. Three frames matter, read with `get_metadata` on 2026-09-17:

| frame                | node       | what its columns show                                                     |
| -------------------- | ---------- | ------------------------------------------------------------------------- |
| Desktop Board        | `241:2`    | counts 1, 1, 3, 4, 3 against 0, 1, 1, 2, 1 cards drawn                    |
| Desktop Search Empty | `305:1547` | every count «۰», the message in the FIRST column only, Board Message over |
| Desktop Empty        | `305:1696` | every count «۰», the message in the FIRST column only, Board Message over |

Two readings were available and the second is right.

**The «۰» in Search Empty is not an authored claim that the count counts matches.** `305:1547` and `305:1696` are the
same frame: identical counts, the same single message in the same first column, the same `Column Spacer` in the other
four, the same `Board Message` box at the same place. They differ in the Empty State's copy and its height, 297 against 319. That is a duplicate with the copy swapped.

**And the file already draws this card's defect, deliberately or not.** In `241:2`, column پیشنهاد کار has the count
text `1` at `241:43` AND the Empty Column frame `241:46`, with no card. The other columns disagree too: مصاحبه says 3
over one card, درخواست‌شده says 4 over two. The counts are the statuses' totals and the cards are a sample, with a
`Column Spacer` standing in for the rest. So the file's counts cannot be read as a statement about what a count counts.

**The file is therefore silent**, which is the condition the exit names for asking.

## 2. It also contradicted a closed card, which is why I asked rather than chose

- **KN-422**, done, critical, 3 points, exit: "A column's count and its deletability are the column's own, not the
  search's." It closed BECAUSE the searched count read zero, which enabled Delete, and `deleteStatus` then took every
  job opportunity in that status including the hidden ones.
- **KN-389**, this card, treats a count of one beside the empty message as the defect.

KN-422 mandates the state KN-389 calls a bug. The owner's rule of 2026-09-16 is that a contradiction gets asked about
and REMOVED, not re-decided, so it went to the question card with both quoted.

**The owner's answer, 2026-09-17: change the message.** The count keeps showing the status's real total, so KN-422
stands untouched and the delete guard cannot regress. The column emptied by a search says that instead, because the
message is the false half and the count is the true one.

## 3. The change, file by file

**The column cannot currently tell WHY it is empty.** `KanbanColumn.tsx` line 198 is
`Children.toArray(children).length === 0 ? <EmptyColumn /> : children`, and an empty list is all it gets.

The screen knows both halves, so the signal is derived there and passed down:

- **`KanbanColumn.tsx`**: a new optional prop saying the status holds job opportunities this search is hiding.
  `EmptyColumn` takes it and picks its sentence. Nothing else about the box changes: still `241:46`, still 80 tall,
  still dashed, still `text/secondary` at 12.
- **`JobsScreen.tsx`**, desktop: pass `sizeOf(column.id) > 0 && cardsOf(column.id).length === 0`. `sizeOf` is the
  status's own size and `cardsOf` applies the search, both already there.
- **`JobsScreen.tsx`**, the phone, line 549: it renders `<EmptyColumn />` directly for the chosen status, so it needs
  the same signal or it keeps the false sentence on a phone. KN-422's fourth finding was exactly a phone that did not
  draw this state; it must not regress to a phone that draws it wrongly.
- **Catalogs**, `en-US.ts` and `fa-IR.ts`: one new message, keyed by its English.
- **The copy.** English "Nothing at this stage matches your search". Persian «چیزی با این جستجو تو این مرحله نیست»,
  which borrows «تو این مرحله» from the column's own existing sentence rather than from the board's
  «چیزی با این عبارت پیدا نشد». KN-696's rule: the two languages are not translations of each other, so the Persian
  takes its idiom from its neighbour.
- **`story-docs`, both languages**: the introduction says "An empty column says so in a dashed box", the `children`
  entry says the column says it is empty when there are none, and the `EveryCardFiltered` entry says it says it is
  empty "as it does with no cards at all". All three are now wrong by omission, and all three are paired across the two
  files, which `guard.test.ts` checks structurally.
- **`KanbanColumn.stories.tsx`**: `EveryCardFiltered` currently passes `count` 0, so it proves nothing about the pair
  the card is about. The exit asks for a live count of ONE, which is the whole point: count 1, children that render
  nothing, and the search sentence rather than the stage sentence.
- **`DESIGN.md`**: record the rule under the kanban column, that the count is the status's own and never the search's,
  and that a column a search emptied says so in its own words. Record also that `241:2` draws count 1 beside `241:46`,
  so the next reader does not file this again as a mismatch.

## 4. What must not change

- **KN-422's guard.** `count` still comes from `sizeOf`, so `StatusMenu`'s `jobCount` and its `disabled: jobCount > 0`
  are untouched and a status holding hidden job opportunities still cannot be deleted. Nothing in this card goes near
  `deleteStatus`.
- **The stage sentence stays true where it is true.** A status with genuinely no job opportunities keeps
  «هنوز فرصت شغلی‌ای تو این مرحله نیست», search running or not. The new sentence appears only when the status holds
  something the search is hiding, which is why the signal is `sizeOf > 0 && cardsOf === 0` rather than "a search is
  running".
- **The box.** Node `241:46`'s geometry is settled and no part of this touches it.

## 5. Out of scope, deliberately

`JobsScreen.tsx` line 414 gives the phone's Filter Chips `cardsOf(column.id).length`, the SEARCHED count, while the
desktop column header shows the live total. After this card those two surfaces state different things about the same
status. That may be right, since a filter chip is a filter and a column header is a column, and it may be a defect.
It is not this card, which is about one column's message, and widening a card nobody asked to widen is how RALPH's rule
zero says gates get built. If the review judges it real it becomes its own entry.

## 6. The proof

**A component story proves the RENDERER only**, which the review said plainly: it hands the boolean over itself, so it
cannot show that the screen ever computes one. The proof is therefore two layers, and the screen layer is the real one.

**The screen story has a trap in it, and the review named it.** `JobsScreen.tsx` line 364 is
`const empty = records.jobs.length === 0 || found === 0`, and while `empty` is true the board replaces EVERY column
with the board level Empty State. So a story that searches away every card proves nothing at all: the columns are not
on the page to be looked at. One matching card has to survive somewhere else.

`seeded()` already builds exactly that board. It takes `set.jobs.slice(0, 5)` and spreads them one per status with
`at % statuses.length`, so five statuses hold one job opportunity each. A search matching ONE of them leaves `found` at
1, so `empty` is false and the columns render, while the other four statuses each hold one job opportunity the search
is hiding. That is this card's case four times over, with no new fixture invented.

**The search term may be written as a literal**, and an earlier draft of this plan said it may not. That draft said the
term must be read at run time "KN-685", which overstates that card: KN-685 forbids naming the fixtures' two SENTINEL
values and says nothing about ordinary words like a title or a company. `SelectingWhileSearching` already writes a
literal company word, with a comment naming which fixture jobs carry it, so the invented rule also departed from the
pattern of the very file this story joins. The rule kept is the real one: neither sentinel is named anywhere.

**The single match is ASSERTED, not assumed.** `matches`, `records.ts` line 136, searches five fields, the title, the
company, the location, the description and the note, as a case insensitive substring, and nothing makes a title unique
against another job's description; there is no uniqueness test over the fixtures, and `story-fixtures.test.ts` line 205
only asserts that some title reaches 60 characters. So the story asserts the PRECONDITION first, that exactly one
`article` is on the board once the search settles. A term that ever matches more then fails loudly on that line instead
of the story quietly asserting against fewer emptied columns and passing for the wrong reason.

**Three columns speak, not four, and the story says which.** `defaultStatuses` keeps the design's order with rejected
LAST, KN-070, and `seeded()` assigns `statuses[at % statuses.length]`, so the fifth seeded job opportunity lands in
rejected. `JobsScreen.tsx` line 198 is `(folded[id] ?? id === REJECTED) && dragExpanded !== id`, so rejected opens
COLLAPSED, and a collapsed column draws its `Title` alone with no cards and therefore no message. A search matching one
of the other four empties four statuses, of which three can speak. Asserting four, or asserting "every other column",
would fail for a reason easy to misread as the feature being broken.

- The screen story asserts, for a status the search emptied: the count still reads ONE in the reader's digits, beside
  the search sentence rather than the stage sentence.
- It asserts the same on the phone, since `JobsScreen.tsx` line 549 is its own call site with its own `EmptyColumn`.
- `EveryCardFiltered` and `MobileEmpty` stay exactly as they are, at count 0, still asserting the STAGE sentence. They
  are the counter case: a fix that swapped the sentence everywhere would fail them, which is the point of leaving them
  alone rather than editing them into the new behaviour.
- A new component story carries the live count of one that the exit names.
- `tsc --noEmit` and `eslint --max-warnings 0` clean, `npm run contract` clean after the DESIGN.md change, Prettier
  drift 0 on every file touched, and no em dash in any `.md`.

## 7. What the review changed, and what I checked myself

**The ruling**: the simplest viable change, and it meets the exit once the documented prop and the screen level wiring
proof are added. It confirmed the two library facts this plan rests on, that `Children.toArray` omits `null`,
`undefined` and booleans, which is what KN-353 relies on, and that `useLingui` still supplies `i18n`. It judged the
Persian consistent with the neighbouring column wording. Its correction is section 6 above.

**What I checked rather than asked, because each was mine to verify:**

- **`guard.test.ts` makes the documentation mandatory rather than tidy.** Line 294, every documented prop exists and
  every real prop is documented; line 391, the Persian side documents everything the English side does; line 377, every
  exported story has an entry and every entry names a real story. So the new prop and the new story each need paired
  entries in BOTH files, or the suite fails.
- **A collapsed column cannot show this message**: it renders `Title` alone inside a `ButtonBase`, with no cards.
- **No production call site passes `layout="mobile"` to the column.** Only `JobCard` and `SearchBar` take that value.
  The column's mobile branch is reached by its own stories, `Mobile` and `MobileEmpty`.
- **One change covers every KanbanColumn LAYOUT**, because line 198 computes `cards` above both the
  `layout === 'mobile'` branch at 200 and the desktop one below it. It does NOT cover every call site, and an earlier
  draft of this bullet said "every layout", which the review corrected: the phone screen is a separate direct
  `EmptyColumn` caller in `JobsScreen`, not a column layout at all, so it is wired and tested on its own.
- **`MobileEmpty` is `columnOf('fa-IR', 'offer', 0, 'mobile')`**, and `EveryCardFiltered` is count 0 with a list that
  renders nothing. Both are genuinely empty statuses, so both correctly keep the stage sentence, and neither is the
  story the exit asks for.

**The second round's ruling**: the boolean prop and the separate desktop and phone wiring are the smallest sound
change, the component story proving the rendering branch while the screen story proves the
`sizeOf > 0 && cardsOf === 0` derivation itself. Its one correction is the layout bullet above. It asked for the
explicit uniqueness and target status assertions, which section 6 now carries, and it confirmed a second time that
`Children.toArray` omits `null`, `undefined` and booleans, and that `useLingui` still exposes `i18n`.

**The review did not rule on section 5**, the Filter Chips showing the searched count while the column header shows the
live total. So that stays out of scope here and becomes its own entry after the close if it is real, rather than
quietly widening this card.
