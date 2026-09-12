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

The record Edit opens with. Leave it out to start empty.

### recordId

The id of the record being edited. The form starts again when the modal opens
or this id changes, never when the same record arrives as a new object, so a
page that renders again while someone types does not undo their typing.

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
