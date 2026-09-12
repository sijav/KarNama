Adding a person to the network, or editing one: the form a contact card opens.

It asks for the full name, the role and the company, the email and the phone,
a social link and the job opportunity the person belongs to. A contact saves
with a full name and nothing else; leave the name out and the field says so.
Edit opens filled from the record and offers to delete it. Cancel, Escape, the
close and the scrim discard what was typed.

## Props

### open

Whether the modal is showing.

### mode

`add` for a new contact, `edit` for one that exists.

### initial

What the form starts from. Adding may start from something, a job opportunity
already chosen when the person is added from inside one; editing takes the
RECORD, which carries the id of the record it belongs to and is undefined until
it has loaded.

The id travels with the values on purpose, KN-386: a page knows which record it
wants before it has loaded it, so there is a render carrying the new id and the
old record's values. Without the id on the payload the modal could not tell that
apart from the values having arrived, and a reader typing in that render would
write one contact's details into another's record.

The form FOLLOWS the record until the reader edits it, and never after. That
makes a record arriving late and a record arriving after its own id the same
case: while nothing has been typed, what the form shows is whatever record is
currently known.

### recordId

Which record is being edited. Required for an edit and impossible for an add,
because the props are a union on the mode: an Edit that does not say which
record it is on cannot be written at all.

### jobs

The job opportunities the contact can belong to: each an id and a label in the
reader's language.

### onSave

Called with the form's values when Save is pressed with a name.

### onCancel

Called when the form is closed without saving.

### onDelete

Called when Edit's delete is pressed; the page asks before it deletes.

## Stories

### Add

The empty form, measured against the design.

### Edit

The form filled from a record, with its delete.

### SavesWithOnlyAName

A name and nothing else, saved.

### NameIsRequired

Save pressed with no name: the name field shows its error.

### CancelDiscards

Typing, then cancelling, and the next opening empty again.

### KeepsTypingThroughARerender

The page renders again while a name is being typed, handing over a new copy of
the same record, and what was typed stays.

### InEnglish

The form in English.

### EnterSaves

The fields are a form and Save submits it, so Enter in a field saves. The action
sits in the modal's footer, outside the fields, and names the form by id, which
is how a button submits a form it does not sit inside.

### TheRecordArrivesAfterItsId

The id first and the record afterwards, which is what a page does when it knows
which record it wants before it has loaded it: the form shows nothing of the
record it was on, and fills itself when the right one lands.

### TheRecordArrivesAfterOpening

The same rule seen the other way: opened before its record exists, the form
fills itself when the record arrives rather than staying empty.
