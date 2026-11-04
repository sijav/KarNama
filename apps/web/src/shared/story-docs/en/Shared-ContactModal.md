Adding a person to the network, or editing one: the form a person's row opens.

It asks for the full name, the role and the company, the relationship label, the
email and the phone, a social link, and the job opportunities the person is
linked to. A person saves with a full name and nothing else, so Add stays off
until a name is written; Edit opens filled from the record, its Save off until
something differs from it, and offers Delete from network at the start of the
footer. Cancel, Escape, the close and the scrim discard what was typed. Labels
made, renamed or deleted here are the reader's own, and change at once.

## Props

### open

Whether the modal is showing.

### mode

`add` for a new person, `edit` for one that exists.

### initial

What the form starts from. Adding may start from something, a job opportunity
already linked when the person is added from inside one; editing takes the
RECORD, which carries the id of the record it belongs to and is undefined until
it has loaded.

The id travels with the values on purpose, KN-386: a page knows which record it
wants before it has loaded it, so there is a render carrying the new id and the
old record's values. Without the id on the payload the modal could not tell that
apart from the values having arrived, and a reader typing in that render would
write one person's details into another's record.

The form FOLLOWS the record until the reader edits it, and never after. That
makes a record arriving late and a record arriving after its own id the same
case: while nothing has been typed, what the form shows is whatever record is
currently known.

### recordId

Which record is being edited. Required for an edit and impossible for an add,
because the props are a union on the mode: an Edit that does not say which
record it is on cannot be written at all.

### jobs

The reader's job opportunities, each with its title, company and status: the
ones the person is linked to are listed, and the rest offered to link. A link to
one that is no longer here is let go when the person is saved.

### labels

The reader's own relationship labels, each with how many people carry it.

### onCreateLabel

Called with the name of a label to make; it returns the new label's id, and the
modal chooses that label for the person.

### onRenameLabel

Called with a label's id and its new name.

### onDeleteLabel

Called with the id of a label to delete. If the person carries it, the form's
label becomes none.

### onSave

Called with the form's values when Add or Save is pressed, or Enter in a field.

### onCancel

Called when the form is closed without saving.

### onDelete

Called when Edit's delete is pressed; the page asks before it deletes. Required
when editing and refused when adding, which draws no delete.

## Stories

### Add

The empty form, measured against the design.

### Edit

The form filled from a record, a label chosen and two job opportunities linked,
with its delete at the start of the footer.

### AddTurnsOnWithAName

Add is off until a name is written, and off again when only spaces are left.

### EditTurnsOnWithAChange

Save is off over the record as it is, on once anything differs, and off again
when it is put back or the name is gone.

### SavesWithOnlyAName

A name and nothing else, saved.

### ChoosingAndMakingALabel

A default label chosen, then one of the reader's own made, chosen and saved; the
Enter that makes it saves nothing.

### RenamingALabel

The person's label renamed in its row with Enter, which saves nothing.

### DeletingTheChosenLabel

Another label deleted from its row leaves the person's as it is; their own,
deleted, leaves them with none to save.

### LinkingAndUnlinking

A job opportunity unlinked, another linked from the picker, and both saved.

### AddFromAJobOpportunity

Added from inside a job opportunity: linked to it from the start, Add still
waiting for a name.

### CancelDiscards

Typing, then cancelling, and the next opening empty again.

### KeepsTypingThroughARerender

The page renders again while a name is being typed, handing over a new copy of
the same record, and what was typed stays.

### InEnglish

The empty form in English.

### EditInEnglish

The filled form in English, its delete at the left.

### Dark

The filled form in the dark theme.

### DarkInEnglish

The filled form in English in the dark theme.

### EnterSaves

The fields are a form and its primary submits it, so Enter in a field saves.
The action sits in the modal's footer, outside the fields, and names the form by
id, which is how a button submits a form it does not sit inside.

### TheRecordArrivesAfterItsId

The id first and the record afterwards, which is what a page does when it knows
which record it wants before it has loaded it: the form shows nothing of the
record it was on, and fills itself when the right one lands.

### TheRecordArrivesAfterOpening

The same rule seen the other way: opened before its record exists, the form
fills itself when the record arrives rather than staying empty.

### KeyboardsForEachField

Every field tells a phone's keyboard what it holds: an email address, a phone
number and a link each ask for their own keyboard, and every field's key saves.
None offers the reader's own details, since the record is somebody else's.

### KeyboardsForEachFieldInEnglish

The same, in English.
