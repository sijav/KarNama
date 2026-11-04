# KN-800 · The Job Modal gained a History tab and was redrawn

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and the job modal is where a job opportunity is
read and edited.

**Exit**, from the board: the plan lists every difference between 210:276 in the
copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its stories
then draw the original's version of every variant, each new variant with a story
of its own, in fa-IR and en-US, light and dark, with both story-docs entries;
sizes, gaps, radii and colours resolve through the tokens; DESIGN.md's section
is corrected; lint, tsc and its tests pass.

## Every difference, read 2026-11-04

Job Modal `210:276`: the copy is 3060 wide with four variants, the original
3840 with five. The shell is the same in both: 720 by 617, the header 97 with 24
above and at the sides and 16 below, the title at 20 and SemiBold over the
company in Body `text/secondary`, 4 apart; the tabs 44, 16 at the sides and 4
between; the body 400, 24 round and 16 between its parts; the footer 76, 16 and
24, with an edge of `border/default` above it.

| Part                | The copy                                                                                                     | The original                                                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header, inline end  | the 20 close and the Status Control, 12 apart                                                                | the 20 close (Popover / Close), the More Button (Icon Button Neutral, `more`) and the Status Control, 12 apart                                                                                          |
| Tabs                | four: «اطلاعات فرصت شغلی», «یادداشت», «افراد مرتبط», «فایل‌ها»                                               | five, «تاریخچه» last                                                                                                                                                                                    |
| Info                | ten fields, the source an Input; the link row; the description; the skills; under a rule, the status history | the fields with the Source Picker; the link row; a rule; the description; the skills; no history                                                                                                        |
| Note                | «آخرین ویرایش: …» under the 200 field                                                                        | the same                                                                                                                                                                                                |
| Contacts            | Contact Cards and «+ افزودن مخاطب»                                                                           | Company Match, then the Related Person rows in a list of `bg/surface` at radius md with an edge of `border/default`, a rule between rows, then «+ افزودن نفر»                                           |
| Files               | «فایل را اینجا رها کن»                                                                                       | «فایل رو اینجا رها کنید»; the meta «۲۴۰ کیلوبایت · ۱۰ شهریور ۱۴۰۵ · PDF», size, day, kind                                                                                                               |
| History `760:47508` | none                                                                                                         | «تاریخ هر مرحله رو می‌تونید ویرایش کنید.» at 12 in `text/secondary`, 16 above the History List: History / Row, newest first, the status changes and the interview rounds, the saved row Locked and last |
| Footer              | «حذف فرصت شغلی» at the inline end, «ذخیره» and «انصراف» at the inline start                                  | «ذخیره» and «انصراف» at the inline end, 12 apart; no delete; «ذخیره» drawn Disabled                                                                                                                     |

The handoff of 2026-11-03, «جزئیات فرصت شغلی», adds: every tab is edited where
it stands and «ذخیره» is off until something changes; closing with unsaved
changes asks in Modal / Unsaved; a status change in the modal is recorded with
«ذخیره», and choosing a closed status closes the modal for the board's undo; the
«…» menu, `894:75677`, is Menu Type=Card with «باز کردن لینک آگهی» and «حذف فرصت
شغلی»; the history holds only status changes and interview rounds, newest first,
and the saved row is locked; the related people show the company's match at the
top, and removing a person only unlinks them.

## The approach

1. Stories first, for every variant and behaviour, measured to the frames, in
   both languages and both schemes; then the component.
2. The header: Popover Close at 20, the More Button opening the Card Menu
   without its change of status, the Status Control. The Card Menu's change of
   status becomes optional, with a story of its own.
3. The tabs in the original's order, History «تاریخچه» last. KN-517's question,
   second or last, is the redesign's to answer, and it draws it last.
4. The status is the draft's: a stage chosen in the header waits for «ذخیره»; an
   outcome is handed to the page at once, which closes the modal for the
   board's undo, KN-812. `JobSaved` carries the status, and the page moves the
   job when it differs.
5. «ذخیره» is off until the draft, the description or the note differs from the
   record; closing with a difference asks in the Unsaved modal: save, discard,
   or keep editing.
6. The related people: Company Match over the Related Person rows in their list,
   unlinking rather than deleting, and Add Contact. The page hands the modal the
   network's people at the company who are not linked.
7. The history: the status changes and the interview rounds the page hands over,
   newest first, the job's first entry locked; the rounds' own record and the
   date edits, what an edited date writes, are KN-733's and KN-734's, so the
   rows offer an edit only when the page asks for one, and the hint with them.
8. The files' meta in the original's order, and the dropzone's copy.
9. The screen's wiring, the catalog, both docs, DESIGN.md; the board's stories
   that delete from the footer delete from the «…» menu.

## How it is checked

The stories with planted wrong values failing them, the board's stories, lint,
tsc, a look against the frames in both languages and schemes, and the
published check.
