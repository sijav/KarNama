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

### InEnglish

The form in English.
