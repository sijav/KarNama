A job opportunity's whole record, where it can be read and changed in place:
there is no separate view and edit.

The header names the job opportunity and its company, and at its other end
holds the status, the «…» menu with the posting's link and the delete, and the
close. Five tabs follow: the information, the note, the related people, the
files and, last, the history. The information is the same fields the add modal
fills, the posting's link with a button that opens it, the description and the
skills. The note keeps what is typed across tabs. The related people show, at
the top, the people of the company in the network who are not linked yet, then
the linked people in a list, whom removing only unlinks, and a way to add one;
the files can be downloaded, dropped in or chosen. The history lists the
changes of status and the interview rounds, newest first, the job's first entry
locked; where the page changes their dates, a row's date asks for it. «ذخیره»
and «انصراف» sit at the inline end, «ذخیره» off until something changes; a stage
chosen in the header waits for it, while a closed status is handed to the page
at once. Saving without a title or a company says which is missing on the first
tab, and leaving with something changed asks first.

## Props

### open

Whether the modal is open. Each opening starts from the record.

### job

The record: its fields, description, skills, note and when it was last edited,
related people, files, status history and interview rounds.

Which record this is. The modal copies the record into its own state to be
edited, and the id is how it tells one record from another: a page that swaps
the record while the modal stays open used to draw the new record's header over
the OLD record's editable fields, and Save wrote those onto the new record,
KN-363. The id rather than the object, because the provider builds a new object
for the same record on every change.

### statuses

The statuses the header's control offers.

### sources

The reader's own sources and the common ones, which the Info tab's Source
Picker offers.

### matches

The people of the job opportunity's company in the reader's network who are not
linked to it, offered at the top of the related people.

### tab

The tab shown: `info`, the default, `note`, `contacts`, `files` or `history`.

### onStatusChange

Called with a closed status chosen in the header, at once; the page closes the
modal. A stage waits for «ذخیره».

### onAddStatus

Called when a new status is asked for in the header's picker.

### onSave

Called with the fields, the status the header holds, the description and the
note when «ذخیره» is pressed.

### onDelete

Called when the delete is chosen in the «…» menu, once the menu has closed; the
page asks before it deletes.

### onClose

Called when the modal is left, after asking when something changed.

### onAddContact

Called when «+ افزودن نفر» is pressed.

### onConnectContact

Called with a matched person's id when their Connect is pressed.

### onUnlinkContact

Called with a related person's id when their remove is pressed; they stay in the
network.

### onCopied

Called when a related person's email or number is copied, for the page to say
so.

### onAddFiles

Called with the files dropped in or chosen.

### onDownloadFile

Called with a file's id when its download is pressed.

### onEditHistory

Called with a history entry's id when its date is pressed. Leave it out and the
dates cannot be pressed, and the hint over the list is not shown.

## Stories

### Info

The information tab, measured against the design: the header, the tabs, the
fields and the footer with «ذخیره» off.

### MoreMenu

The «…» menu: the posting opened in a new tab, and the delete handed over with
focus back on the «…».

### MoreMenuWithoutALink

A posting with no link: the menu holds only the delete.

### SaveWaitsForAChange

«ذخیره» off, on once a field changes, off again when the change is undone, and
saving with the status.

### ChangeStatus

A stage chosen in the header shows there and turns «ذخیره» on, and is saved with
it.

### ChooseAClosedStatus

A closed status chosen in the header is handed to the page at once.

### LeavingAsks

Leaving with a change asks: going back, saving from the question, and closing
without saving.

### Note

The note, typed into, kept across a switch of tabs and saved.

### People

The related people: the company's match connected, a person unlinked, and one
added.

### PeopleWithNobodyToMatch

Nobody of the company left to link: no box, the list first.

### PeopleInEnglishInTheDark

The related people in English and the dark scheme.

### Files

The files, one downloaded, one chosen and one dropped.

### History

The history with an interview round, newest first, the first entry locked, and
a date pressed.

### HistoryWithoutEdits

A page that changes no dates: no hint and nothing to press.

### HistoryInEnglishInTheDark

The history in English and the dark scheme.

### SaveNeedsATitle

Saving refused without a title on the first tab, then saved.

### EnterSaves

The fields are a form and Save submits it, so Enter in a field of one line does
what Save does: without a title it says the title is missing and saves nothing,
and with one it saves. Enter in the description starts a new line instead.

### OpensFromCard

A card on the board opening the modal, and the modal closed with nothing
changed.

### TabFollowsItsProp

The tab asked for while the modal is open.

### Phone

On a phone's width, the tabs scrolling and the header's controls on its row.

### InEnglish

The tabs, the header and the footer in English, and a note saved in English
with the record's dates the days the fixtures hold.

### KeepsAWrittenDate

A record kept before the date picker, whose posting date no calendar reads: the
Info tab shows it as written, in a field of text, a note saves with it unchanged,
and cleared it is a picker again.

### StartsOverForAnotherRecord

The record swapped while the modal stays open: the fields become the new
record's, «ذخیره» is off again, and saving writes the new record's own values
rather than what was typed into the one before it.

### KeepsTypingForTheSameRecord

The same record handed over as a new object, which is what the provider does on
every change: what the reader is typing stays.

### InfoInTheDark

The Info tab in the derived dark scheme, in Persian. The posting date's field is
the browser's own date field, whose calendar glyph the browser draws, so the page
tells the browser it is dark, and the glyph is drawn light on the dark field.

### InEnglishOnAPhone

The modal in English at a phone's 390: «انصراف» and «ذخیره» keep one line each
and the Button's height, at the inline end.
