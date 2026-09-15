# KN-432 - The delete confirmation says 'this job opportunity' while deleting several

## The card

**Why.** The confirmation is the last thing between a reader and losing records; if it describes one
when it means five, it is not a confirmation. Persian and English pluralise differently, which is why
the bar already has the branch.

**Exit.** The confirmation names how many are going in both languages, and a story deleting two
reads it.

## Read before planning, 2026-09-15

- **Both confirmations say one.** `JobsScreen.tsx:740` titles its Confirm modal «حذف این فرصت
  شغلی؟» and says this job opportunity is deleted for good, and `NetworkScreen.tsx:281` titles its
  own «حذف مخاطب» and says this contact is, whatever `deleting` holds, one id or several.
- **The Bulk Action Bar sets the pattern.** Its `useCountText` writes the number in the reader's
  digits with `formatCount` and `usePreferences`, then the noun in the plural the number takes;
  Persian keeps the noun singular after a number.
- **A count goes beside a message, never inside it.** The catalogs load uncompiled, and a message
  holding a value renders raw in the production build until KN-221, AGENTS.md section 7.
- **The stories.** The board's `Selecting` deletes two through the bar and reads no copy; several
  other board stories find the one-item confirmation by its title, «حذف این فرصت شغلی؟», so that
  wording stays. The network page's `Keeping` deletes one person.

## The approach

1. **The stories first.** The board's `Selecting`, which deletes two, finds the confirmation by the
   title for several, «این فرصت‌های شغلی حذف شوند؟», and reads the count, two in Persian digits, at
   the head of its body. No network story deletes two: `LettingGoOfASelection` chooses two and lets
   them go, so with two chosen it opens the bar's Delete, reads «این مخاطب‌ها حذف شوند؟» and the
   count, and cancels before it goes on. Run against today's code; both must fail on the title.
2. **The copy.** One id keeps today's title and body. Several take a title with no number, "Delete
   these job opportunities?" and "Delete these contacts?", and a body that is the count in the
   reader's digits beside a message, "job opportunities are deleted for good and cannot be brought
   back." and "contacts are deleted for good and cannot be brought back." The branch is one against
   several, this against these, not a grammatical plural.
3. **The Persian.** «این فرصت‌های شغلی حذف شوند؟» and «این مخاطب‌ها حذف شوند؟»; after the count,
   «فرصت شغلی برای همیشه حذف می‌شود و برگشتی ندارد.» with the noun singular, and «مخاطب برای همیشه
   حذف می‌شوند و برگشتی ندارند.» for people. Nothing says «فرصت» alone.

## What I will change

- `screens/JobsScreen.tsx`, `screens/NetworkScreen.tsx`
- `screens/JobsScreen.stories.tsx`, `screens/NetworkScreen.stories.tsx`
- `i18n/locales/en-US.ts`, `i18n/locales/fa-IR.ts`

## What I expect to be hard, and what I am unsure of

- **A number beside a sentence** reads naturally in both languages only when the number leads it,
  which both bodies do; the titles stay free of it.
- **The Persian verb.** Inanimate plurals often keep a singular verb and people take a plural one;
  the two bodies differ for that reason.
- **The network story reads without deleting.** `LettingGoOfASelection` cancels the confirmation,
  so the network page's copy is read for two while the deletion of two is the board's story.

## How I will know it works

- `Selecting` and the network check fail against today's code on the title, and pass after.
- The board and network stories, the unit project with the catalog test, lint and tsc are clean;
  the confirmation for several is seen in fa-IR and en-US, light and dark.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved. It confirmed the body composed as a string, the count through `formatCount` in the
reader's locale, a space and a separate message; one id against several as the honest rule for this
and these, since Persian's plural rule puts 0 and 1 alike in `one`; and the bar as the only road that
deletes several, cards and modals passing one id. Its warning, that a raw `deleting.length` shows
Latin digits in Persian, is why the count goes through `formatCount` and the network page takes
`usePreferences`. Not taken: its ask to check the new strings in a production Storybook, which the
owner's rule of 2026-09-11 leaves out of a close; the counts stay outside the messages, so the
production build has nothing to interpolate.

## Built, 2026-09-15

- **Stories first.** Against today's code `Selecting` and `LettingGoOfASelection` found the
  confirmation named by its one-item title where two were going; both pass now.
- **The copy.** One id keeps today's title and body; several take the title for several and a body
  of `formatCount(locale, going)`, a space and the message. The network page reads `locale` from
  `usePreferences`, and both catalogs carry the four new ids, which the catalog test reads in both
  languages: 1503 unit tests where there were 1495.
- **Caught before closing.** The first build read the count straight from `deleting`, which a
  confirm or a cancel clears while the dialog dissolves for 150 ms, so its copy turned singular as
  it closed. A check reading the dialog's text right after the press failed on both screens. The
  count is now held in state and adjusted during render, as `ContactModal.tsx` follows its record,
  and both checks pass.
