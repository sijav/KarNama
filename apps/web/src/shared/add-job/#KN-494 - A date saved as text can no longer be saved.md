# KN-494 - A date saved as text can no longer be saved, and five stories fail on it

## The card

**Why**, from the board: A reader's older records stop saving, whatever they
changed, and five failing stories hide the next real failure among them.

**Exit condition**, from the board: A stored job with postedAt «۱۰ شهریور ۱۴۰۵»
opens with its date visible and saves after a note edit; the five stories pass in
both languages.

From KN-477's review, W-04, C-01 and C-02. High, three points. It blocks KN-226.
KN-467's note: `EnterSaves` gives its record days so it can save, and that
override can go once the fixtures hold days.

## What is there, read and measured on 2026-09-15

- **`draft.ts`**: `validDay` takes an empty value or a real `yyyy-MM-dd` day, and
  `missingFields` flags `postedAt` or `expiresAt` otherwise, and an expiry before
  its posting. `AddJobModal.tsx` line 175 and `JobModal.tsx` line 266 refuse to
  save while anything is flagged, and the Job Modal goes to its Info tab.
- **`JobForm.tsx`**: `JobFields` draws each date as `Input type="date"`, which shows
  nothing for a value that is not a day.
- **Where these came from**: commit 2234d66 of 2026-09-12 turned both date fields
  from text into the picker and added `validDay` and its refusal, with the case
  `postedAt: 'not a date'` refused in `draft.test.ts`. Its "invalid dates no longer
  crash saved boards" is the guard in `job-modal/format.ts`'s `formatDay`, which
  gives back as written a date it cannot read.
- **`readRecords`** in `records.ts`, the one reading of a stored board
  (`RecordsProvider`'s `readBack`), keeps a job's draft as it was stored, so a
  written date reaches the form as written.
- **What reads the dates**: `records.ts`'s `dayOf` and `deadlineOf`, which compare
  them as strings to sort, and the board's cards: `JobsScreen.tsx` line 292 draws
  each card's posting date through `formatDay`, so a date kept as text is drawn as
  written. Corrected on 2026-09-15 before building: this line first said nothing
  formats a draft's date.
- **Where a written date comes from**: the API's extraction returns an empty value
  or a day (`z.iso.date()`), so from a board stored before 2026-09-12, and from the
  story fixtures: `extraction.postedAt` «۱۰ شهریور ۱۴۰۵» and `expiresAt` «۱۳ شهریور
  ۱۴۰۵» in `fa-IR.json`, «1 September 2026» and «4 September 2026» in
  `en-US.json`, which `AddJobModal.stories.tsx`'s `foundIn` and
  `JobModal.stories.tsx`'s `recordIn` spread into their drafts.
- **Measured**: AddJobModal `Review` and JobModal `Note`, `Change Status`, `Save And
Delete` and `Starts Over For Another Record` fail, each on `onSave` never called
  with the draft, and 26 other stories of the two files pass. `EnterSaves` passes
  through `savable()`, which gives the record 2026-09-01 and 2026-09-04.
- **Measured in this Node, ICU 78.3**: `Intl.DateTimeFormat('fa-IR-u-ca-persian',
{ year: 'numeric', month: 'long', day: 'numeric' })` formats 2026-09-01 as «۱۰
  شهریور ۱۴۰۵», the fixture's own text, so the platform's calendar can read it
  back.

## The approach

1. **Reading a written date**, `src/shared/add-job/days.ts`, new and pure:
   `isDay(value)`, moved from `draft.ts`'s `validDay`, and `dayFrom(written)`: an
   empty value or a day is itself; otherwise the text, with Persian and Arabic-Indic
   digits made Latin and its spaces and direction marks evened out, is compared
   with the long formatting of the days its year can be: in the Persian calendar in
   Persian, from 1 March of the year plus 621 to 30 April of the next, and in the
   Gregorian calendar in English, day before month and month before day, through
   that year. The first day formatted as the text is written is its day; none, or a
   platform without the calendar, is `undefined`.
2. **When a record is read**: `readRecords` gives each job's `postedAt` and
   `expiresAt` the day `dayFrom` reads, and leaves one it cannot read as written.
3. **A date that cannot be read stays visible and editable**: `JobFields` draws a
   date that is neither empty nor a day as a text `Input` holding it, since the
   picker would show nothing, and cleared it is a picker again. `missingFields`
   stops refusing a date that is not a day, since the picker makes only days and
   anything else was written before the picker existed; it still refuses an expiry
   before its posting when both are days.
4. **The fixtures hold days**: `extraction.postedAt` 2026-09-01 and `expiresAt`
   2026-09-04 in both languages, and `savable()` goes, `EnterSaves` using the record
   as it is.
5. **Tests**: `days.test.ts` in the node project: «۱۰ شهریور ۱۴۰۵», the same with
   Latin digits, «1 September 2026» and «September 1, 2026» to 2026-09-01; a day and
   an empty value to themselves; «۳۱ اسفند ۱۴۰۴», a day no year has, and text that
   is no date to `undefined`. `records.test.ts`: a stored job posted «۱۰ شهریور
   ۱۴۰۵» reads back as 2026-09-01, and one posted «last spring» as written.
   `draft.test.ts`: a date that is not a day is no longer refused, a reversed pair
   still is. Stories: the five pass; a new JobModal story, `KeepsAWrittenDate`, has
   a record whose `postedAt` no calendar reads, shows it in the Info tab, and saves
   a note edit with it unchanged. e2e: a board stored with a job posted «۱۰ شهریور
   ۱۴۰۵» opens it with 2026-09-01 in the posted field, saves a note edit, and keeps
   both across a reload.

## How I will know it works

- The unit project; the AddJobModal and JobModal stories in both languages; eslint;
  tsc; coverage of `days.ts`, `draft.ts`, `records.ts` and `JobForm.tsx`.
- The e2e spec on desktop and mobile.
- Plants: `readRecords` without the reading, `JobFields` drawing every date as a
  picker, and `missingFields` refusing text again, each failing a test.
- Seen: the Info tab with a date read into a day and with one kept as written, in
  fa-IR and en-US, light and dark.

## What I am unsure of

- **Which written forms old boards hold**: the base kept what the reader typed, and
  the fixtures show two forms. The plan reads those two calendars' long forms and
  keeps anything else as written and visible, the card's own fallback.
- **Dropping the refusal of text**: 2234d66 added it with the picker. The card
  draws a date it cannot read as written, through `formatDay`'s guard, so text
  breaks no drawing, and the picker cannot make text, so only a stored date meets
  the change.
- **A text field in place of the picker**: no new copy says why; the value is the
  explanation. A line under it would be copy in both catalogs.
- **Cost on load**: only a date that is not a day is read, up to about 425
  formattings in each calendar.

## Plan review, Codex, 2026-09-15

Nearly right, with corrections, all taken. `readRecords` is the right place: every
stored board passes it before a form or a sort reads it, and the next save writes
the day back; data a story hands `RecordsProvider` directly skips it, which is why
the fixtures move to days too. Stopping the refusal of text and drawing it in a
text field is right, since a date input takes only `yyyy-mm-dd`. The late
correction above, that the board's cards draw the date through `formatDay`, is
confirmed, and its guard keeps unread text visible.

**The corrections**:

- English is read in both long forms, «September 1, 2026» and «1 September 2026»;
  `en-US` alone writes only the first, and the fixture is the second.
- The days are made and written in UTC, `Date.UTC` and `timeZone: 'UTC'`, or a
  browser west of Greenwich writes the day before.
- The exit's "in both languages" is proven rather than assumed: the e2e opens the
  stored Persian date under the English page as well as the Persian, and the
  stories that save run in English too.

**The details**: the formatters are made once; the comparison of an expiry with its
posting stays behind `isDay` for both; and no line of copy explains the text field.

## Result, 2026-09-15

Built as planned and reviewed, with three differences.

- **No calendar or second English locale is named**: `'fa-IR'` is formatted on its
  own calendar, the Persian one, and the day-first English form is the month-first
  one rearranged, so `days.ts` names only `'fa-IR'`, `'en-US'` and `'UTC'`, and
  `timeZone` joins the lint rule's structural props beside `day`, `month` and
  `year`.
- **More stories than planned**: `InEnglish` in the Job Modal now saves a note, and
  a new `ReviewInEnglish` saves the add flow's Review in English, which is how the
  review's "in both languages" is shown for the stories.
- **The escapes**: the digit ranges and the direction marks in `days.ts` are written
  as `\u` escapes, after a first draft held the characters themselves.

The checks:

- The unit project, 1442 tests in 40 files; `days.test.ts` and `records.test.ts`
  also with `TZ` America/Los_Angeles and Pacific/Kiritimati, measured to take
  effect on this machine through PowerShell.
- AddJobModal and JobModal stories, 33 of 33: `Review`, `Note`, `Change Status`,
  `Save And Delete` and `Starts Over For Another Record` among them, `EnterSaves`
  without `savable()`, `KeepsAWrittenDate`, `ReviewInEnglish` and `InEnglish`.
- e2e: `written-dates.spec.ts` 4 of 4, in fa-IR and en-US on desktop and mobile, and
  `add-job.spec.ts` 10 of 10.
- eslint, tsc and prettier clean.
- Plants, each restored by hash: `readRecords` without `withDays`, every date a
  picker, text ordered against a day, a written posting date refused, and the
  Persian calendar skipped, each failing a test. The formatters without
  `timeZone: 'UTC'` fail eight date tests in Los Angeles and none in Berlin, this
  machine's zone, so a run here does not catch that one.
- Coverage: `days.ts` and `draft.ts` at 100 in their tests. `records.ts`'s lines 69
  and 141, two fallbacks older than this change, are uncovered in those tests.
  `JobForm.tsx`'s text field and the picker's `min` are covered by the stories;
  onChange callbacks of fields no story in these two files types into are not.
- Seen on the dev server, with two jobs written into its stored board and taken
  out after: a job posted «۱۰ شهریور ۱۴۰۵» opened with 2026-09-01 and 2026-09-04 in
  its pickers, its card drawing «۱۰ شهریور ۱۴۰۵» in fa-IR light and September 1,
  2026 in en-US dark; a job posted «۱۴۰۵/۰۶/؟؟» opened with it in a field of text
  and the expiry an empty picker, in both. The screenshots caught the dialog as it
  faded in, so the values read off the page are what was seen.

## After the roast, 2026-09-15

Codex's roast found two claims above untrue, each confirmed in the code and filed
as a child of KN-494:

- **"Up to about 425 formattings in each calendar"** undercounts: a date with a
  four-digit year that matches nothing is compared with 426 Persian days and 366
  Gregorian ones, formatting each twice, about 1,584 `Intl` calls, and Codex timed
  200 such dates at about 2.2 seconds, on every load of the board.
- **"A date kept as text is drawn as written"** is not true of the board: the card's
  `formatDay` hands anything that is not a day to `new Date`, and V8 reads
  «2026/09/01» or «Tuesday, September 1, 2026» as a date and draws it in the
  reader's calendar; and `dayOf` and `deadlineOf` still sort kept text as a string,
  so «last spring» can sort as the newest job and «when it is filled» as the most
  urgent.
