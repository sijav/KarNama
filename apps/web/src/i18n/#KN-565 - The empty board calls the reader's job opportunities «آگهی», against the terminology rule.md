# KN-565 - The empty board calls the reader's job opportunities «آگهی», against the terminology rule

## The card

**Why.** The two words mean different things, which is why the rule has no exception, and the empty
board is the first screen a new reader meets, where the product teaches which is which.

**Exit.** The empty board's title and body say «فرصت شغلی» for the record, with «آگهی» kept only for
the link or text pasted, in the English ids and the Persian alike; nodes 243:64 and 305:1833 are read
with use_figma, and a file that says otherwise is recorded under KN-329; the catalog tests pass.

Seen on 2026-09-15 while KN-560 looked at App/Shell's `SignedInInAnotherTab` in the dev Storybook.

## Measured before planning, 2026-09-16

- **The rule**, DESIGN.md section 3 and the file's own frame `505:3`: «فرصت شغلی» is the record the
  reader tracks inside KarNama, «آگهی» is **only** the external source, the posting on a job board
  or the link or text pasted to extract from, and «فرصت» never appears alone. Without exception.
- **The two ids and every place they are used**, which is five and not four:
  - `locales/en-US.ts` lines 108 to 110 and `locales/fa-IR.ts` lines 112 to 114, the catalogs.
  - `screens/JobsScreen.tsx` lines 396 and 399, the empty board itself.
  - `shared/empty-state/EmptyState.stories.tsx` lines 25 and 26, the jobs specimen.
  - `e2e/sign-in.spec.ts` line 167, which asserts the RENDERED Persian title, «هنوز آگهی‌ای اضافه
    نکردی», to show a second reader's board is their own and empty, KN-421. Searching for the
    English ids could never have found it; searching for the Persian did.
- **The file, read with use_figma rather than metadata**, which the exit asks for and which turned
  out to matter. Both nodes are instances of the Empty State, `159:80`:
  - `243:64`, inside the frame named Column: the title «هنوز آگهی‌ای اضافه نکردی» at 16, the body
    «اولین آگهی‌ات را با لینک یا متن آگهی اضافه کن تا از همین‌جا پیگیری‌اش کنی.» at 14, and the
    button «افزودن فرصت شغلی» at 14.
  - `305:1833`, inside Board Message: the same title and the same button, and a body that differs,
    «اولین آگهی‌ات را با پیست‌کردن لینک یا متن آگهی اضافه کن تا از همین‌جا پیگیری‌اش کنی.». Its text
    layer is NAMED after the other body, so the name is stale against its own characters, which is
    exactly why reading the metadata was not enough.
  - So the file says «آگهی» for the reader's record in both, while the button of the very same
    instance says «افزودن فرصت شغلی».
- **The file's own rename list settles what kind of mistake this is.** Frame `505:3` carries the
  sixteen changes of that version, and the board's Empty State is not among them. Item 4, `506:6`,
  renames a neighbouring empty message, «هنوز آگهی‌ای در این مرحله نیست» to «هنوز فرصت شغلی‌ای تو
  این مرحله نیست», and item 7 renames the network's. So «آگهی» survives on the board's Empty State
  because that pass never reached it, not because anyone exempted it, and the file itself shows the
  construction the title should take.
- **The same list keeps «آگهی» where the source is meant.** Item 9, `506:11`, leaves the manual
  entry prefix «لینک یا متن آگهی نداری؟» untouched, item 8 keeps «داره آگهی رو می‌خونه…», and item
  10 says in as many words that «آگهی» is right there because it is the external source. «لینک یا
  متن آگهی» is therefore the file's own phrase for what is pasted, and it is what the body keeps.
- **The register is the file's decision too.** Frame `505:6` divides UI labels, which take neutral
  clean Persian, from microcopy, which takes gentle colloquial Persian, and names «تشویقِ حالت
  خالی», the encouragement of an empty state, as microcopy. The copy is already written that way, so
  the noun changes and the register does not.
- **Where the joiners sit**, measured rather than retyped. The title is «هنوز آگهی‌ای اضافه نکردی»
  with a zero-width non-joiner between «آگهی» and «ای», and the file's own item 4 puts one in the
  same place in «شغلی‌ای». The body carries three, and «آگهی» appears in it TWICE: «اولین آگهی‌ات»,
  the record, and «متن آگهی», the pasted source. So the change is the first occurrence only, and the
  Persian is derived from the catalog by replacement rather than typed out, since a hand-typed
  string moves a joiner without showing it.
- **DESIGN.md's Empty State section** names `243:64` and `305:1833` as the empty job list and records
  the component's geometry, the title's composed line height and the mark's contrast. It records
  none of its copy, and it records this kind of disagreement everywhere else, as it does for the
  bulk bar's count and the card menu's delete.
- **The story-docs already obey the rule**, checked for description and not only for quotation:
  `en/Shared-EmptyState.md` calls the state "the job list before the first job opportunity is added"
  and names its story the same way, and `en/Screens-Jobs.md` line 38 says "the pasted link or text of
  a posting", which is the source and is correct. No entry quotes this copy, so none changes.
- **What the catalog test requires**, `i18n/catalog.test.ts`: it walks every `.ts` and `.tsx` under
  `src` but not `i18n`, not `gate-fixtures` and not a `.test.ts`, reads `<Trans id="…">` and
  `i18n._('…')`, and then asks that every used id is in both catalogs, that English carries no id
  nothing uses, that both catalogs hold the same keys, that no Persian message is blank, and that no
  Persian message is its own id once both are casefolded and stripped to letters and digits. It
  checks no word of the copy. A `.stories.tsx` is scanned like any other source; an `e2e` spec is
  not, being outside `src`. It runs in the `unit` project in half a second, 484 cases, green before
  this change.
- **The code already follows the rule on the button.** `EmptyState.stories.tsx` line 22 and the
  screens read `Add job opportunity`, «افزودن فرصت شغلی», which is what the file draws there too,
  and `e2e/sign-in.spec.ts` line 149 already clicks that button by its Persian. Only the title and
  the body disagree.

## The approach

1. **The English ids say what the thing is.** The title becomes the id
   `You have not added a job opportunity yet`, and the body becomes the id
   `Add your first job opportunity from the link or text of a posting, and follow it from here.`
   What the reader adds is the record; what they add it from is the posting, and that is the one
   place «آگهی» survives.
2. **The Persian follows, changing as little as it can.** The title becomes «هنوز فرصت شغلی‌ای
   اضافه نکردی», which is the file's own construction from item 4 of its rename list, and the body
   becomes «اولین فرصت شغلی‌ات را با لینک یا متن آگهی اضافه کن تا از همین‌جا پیگیری‌اش کنی.», where
   «لینک یا متن آگهی» is kept word for word because it is the pasted source and the file keeps it
   too. Both are produced by replacing the first «آگهی» in the string the catalog already holds.
3. **The five call sites move with them**, in the same commit: both catalogs, the screen, the story,
   and the e2e spec's assertion on the rendered Persian.
4. **The e2e spec gains a second assertion, on the body, and both are made exact.** Nothing else
   proves the rendered Persian: the catalog test never reads a word of the copy, and the story
   compares the DOM against values read from that same catalog, so both stay green whatever words
   the catalog holds. The spec is the only place that reads what the screen actually says, so it
   asserts the title and the body both, each with `{ exact: true }`, since `getByText` otherwise
   matches a substring and would be satisfied by a longer string that still said «آگهی».
5. **The design contract records the disagreement in one line**, as it already does for the bulk
   bar's count and the card menu's delete: the file's title and body call the record «آگهی» where
   the same instance's button says «افزودن فرصت شغلی», the code follows the terminology rule, and
   the two instances' bodies differ, which is KN-662's. Not a transcription of both bodies, which
   would duplicate what KN-662 owns.
6. **KN-329 already carries the reading**, added on 2026-09-16 and present in the database and in
   the rendered board: both nodes, the button's disagreement with its own instance, the stale layer
   name, and the copy's absence from the sixteen.

## What I will change

- `apps/web/src/i18n/locales/en-US.ts` and `fa-IR.ts`, the two entries in each
- `apps/web/src/screens/JobsScreen.tsx`, lines 396 and 399
- `apps/web/src/shared/empty-state/EmptyState.stories.tsx`, lines 25 and 26
- `apps/web/e2e/sign-in.spec.ts`, the assertion at line 167, which gains a second for the body
- `DESIGN.md`, one entry in the Empty State section

No story-docs entry quotes or describes this copy wrongly, so none changes.

## What I expect to be hard, and what I am unsure of

- **The English body.** The old one said posting twice over, once for the record and once for the
  source, which is the defect. The new one names the record first and the source second and carries
  no possessive at all. It carries no apostrophe either, which Prettier would answer by turning the
  string's quotes around.
- **The e2e spec is the part a test run will not catch cheaply.** The unit project never reads it,
  so a stale Persian assertion there fails only under Playwright, which builds the app and serves it
  with `vite preview` across a desktop and a mobile project. It changes in the same commit and the
  spec is run.
- **Whether «پیست‌کردن» belongs in the code.** The two instances disagree and the code draws one
  board. Following the column instance is the smaller claim; the divergence is recorded rather than
  silently resolved, and nothing here claims one body matches both instances.
- **Whether an id is a stored key anywhere.** lingui's English ids are the catalog keys and nothing
  persists them: no storage key, no API field, no fixture holds one. Checked by searching the
  repository for both English strings and for both Persian ones.
- **KN-560's plan quotes the old id.** Plans stay as they were written; the catalog scan reads no
  markdown, so it neither breaks nor is broken.

## How I will know it works

- The unit project passes, `i18n/catalog.test.ts` among it, which proves the ids and the catalogs
  moved together and nothing about the words.
- `apps/web/e2e/sign-in.spec.ts` passes on both projects, asserting the rendered Persian title and
  the rendered Persian body, which is the only independent check of the words themselves.
- **The mutation goes against the e2e assertion, not the catalog.** Putting the old Persian body
  back and running the catalog test would leave it GREEN, because that test reads ids and never the
  copy, so it would prove nothing about terminology. The proof is to put the old Persian body back
  in the catalog and show the spec's body assertion FAILS, then restore and show it passes, with the
  file verified by hash either side.
- `tsc` and eslint pass, and no changed file's Prettier drift grows; this plan's is 0.
- A look at both in Persian and in English, in light and in dark: the Jobs screen with no records,
  and `Shared/EmptyState`'s jobs specimen, which draws the same copy from the catalog.

## Plan review, 2026-09-16, Codex gpt-5.6-terra

Sound, with one verification gap, taken as step 4. **The gap**: nothing in the plan independently
proved the rendered Persian body, since the catalog test checks only that the keys agree and the
story compares the DOM with values drawn from that same catalog; the e2e spec is the one place that
reads the words. It confirmed the change list as complete, having searched for both forms itself,
and noted that a dynamic or described id would evade the catalog scan in principle but is refused by
this repository's lint inside `src`. It confirmed that following `243:64` and filing the divergence
is right, and would be wrong only if the plan claimed one body matched both instances.

**Where I did not take its wording.** It proposed the body id
`Add your first job opportunity from a posting link or its text, and follow it from here.` I kept my
own, on the ground that "its" there could bind to the link.

## Second plan review, 2026-09-16, Codex gpt-5.6-terra

Two corrections, both taken, and one claim checked and found false.

**The mutation was wrong, and this is the one that mattered.** Restoring the old Persian body and
running the catalog test leaves it green: that test reads ids, presence, blankness and untranslated
values, and never a word of the copy, so the mutation I planned would have proved only that the keys
move together while reading as though it proved the terminology. The mutation now targets the new
Playwright body assertion, and the catalog run stays as the check on key synchronisation.

**The DESIGN.md entry was too much for a one point card.** Transcribing both contradictory bodies
duplicates what KN-662 owns, so the section gains the one line the house pattern uses for this kind
of disagreement and the two-instance decision stays with KN-662.

**It withdrew the wording objection**, judging that a link has no text in the sense meant, so the
ambiguity I worried about is not there; it reads the chosen id as clearer without context and not
worse, so the id stands. It also confirmed the body assertion is durable, Playwright normalising
whitespace but not a zero-width non-joiner, so a mismatch there is a real difference in the rendered
copy rather than an artefact.

**The claim I checked and did not take**: it said KN-329 does not yet record this and the exit is
therefore unmet. It does. The note was added on 2026-09-16 and is in both the database and the
rendered `agent/TODO_BOARD.md`, counted in each. The review had the card's description and not its
notes.

## Third plan review, 2026-09-16, Codex gpt-5.6-terra

Approved: sound, and meeting the exit once built. It read the source itself and confirmed the call
sites are exactly the two catalog entries, `JobsScreen`, the EmptyState story and the spec's Persian
title, with no persistence, API field or fixture holding either id; and it confirmed the KN-329 note
is in the rendered board, which the second review had denied. It agreed the single line in DESIGN.md
is the right amount, the contract already using short KN-329 references for this class of
divergence, and that the retargeted mutation is real proof: with the title assertion beside it, the
pair proves the Persian the screen renders rather than the catalog's consistency with itself.

**The refinement, taken.** `getByText` matches a SUBSTRING unless told otherwise, so the assertion as
it stands could be satisfied by a longer string that still said «آگهی». Both assertions now pass
`{ exact: true }`. Whitespace is normalised even then and a zero-width non-joiner is not, so a
broken joiner still fails honestly.

**What I did not take.** It preferred the title found by its heading role, which is churn beyond a
card about a noun. It also offered an English-side assertion after a language switch; but the
English wording IS the catalog key here, and the catalog test already refuses a key that no source
uses or that either catalog lacks, so what that assertion would add is a judgement of the wording,
which is a reading and not a test.
