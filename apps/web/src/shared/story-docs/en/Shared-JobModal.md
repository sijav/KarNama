A job opportunity's whole record, where it can be read and changed in place:
there is no separate view and edit.

The header names the job opportunity and its company, and at its other end
holds the status, which changes at once, and the close. Five tabs follow: the
information, its history, the note, the related people and the files. The
information is the same fields the add modal fills, the posting's link with a
button that opens it, the description and the skills. The history lists every
change of status, newest first, with its day and whether the reader or the
product made it. The note keeps what is typed across tabs. The related people
are contact cards with a way to add one; the files can be downloaded, dropped
in or chosen. Cancel and Save sit at the inline start, the delete at the end;
saving without a title or a company says which is missing on the first tab.

## Props

### open

Whether the modal is open. Each opening starts from the record.

### job

The record: its fields, description, skills, note and when it was last edited,
related people, files and status history.

### statuses

The statuses the header's control offers.

### tab

The tab shown: `info`, the default, `history`, `note`, `contacts` or `files`.

### onStatusChange

Called with the status chosen in the header, at once.

### onAddStatus

Called when «+ وضعیت تازه» is pressed in the header's picker.

### onSave

Called with the fields, the description and the note when saved, never the
status, which the header changes at once through onStatusChange.

### onDelete

Called when the delete is pressed; the page asks before it deletes.

### onClose

Called when the modal is left.

### onAddContact

Called when «+ افزودن مخاطب» is pressed.

### onOpenContact

Called with a related person's id when their card is pressed.

### onDeleteContact

Called with a related person's id when their delete is pressed.

### onAddFiles

Called with the files dropped in or chosen.

### onDownloadFile

Called with a file's id when its download is pressed.

## Stories

### Info

The information tab, measured against the design.

### History

The status history, newest first.

### Note

The note, typed into, kept across a switch of tabs and saved.

### Contacts

The related people, one opened, one added and one deleted.

### Files

The files, one downloaded, one chosen and one dropped.

### ChangeStatus

The status changed from the header through the Change Status modal, then
Save pressed straight after, which carries no status and so cannot undo the
change.

### SaveAndDelete

Saving refused without a title, then saved, and the delete pressed.

### OpensFromCard

A card on the board opening the modal, and the modal closed.

### TabFollowsItsProp

The tab asked for while the modal is open.

### Phone

On a phone's width, the tabs scrolling.

### InEnglish

The tabs in English.
