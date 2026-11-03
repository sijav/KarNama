A person linked to a job opportunity, a row in its related people tab: their
name, their role and company under it, and the tag they carry in a small grey
chip. At the other end are three small buttons: unlink them from this job
opportunity, which keeps them in the network, copy their email and copy their
number, each only when there is one to copy. On a desktop the buttons show
when the pointer is on the row, when keyboard focus is inside it, and always
on a device with no pointer to hover; the row turns light grey and the chip
white with them. On a phone the buttons always show and the chip sits under
the role.

The row is a group named after the person, so each button is heard with whose
it is. A copy goes to the clipboard and tells the page, which says so.

## Props

### name

The person's name.

### role

Their role, written before their company.

### company

Their company, after their role.

### tag

The tag they carry in the network, in the chip; leave it out for none.

### email

Their email; without one there is no copy email button.

### phone

Their number; without one there is no copy number button.

### layout

`desktop`, the default, or `mobile`, the phone's detail page.

### onUnlink

Called when they are unlinked from this job opportunity.

### onCopied

Called with `email` or `phone` once that is on the clipboard.

## Stories

### Default

The row measured against the design, its buttons hidden.

### Hover

The pointer on the row: the grey row, the white chip and the buttons.

### KeyboardFocus

Reached by Tab, the buttons show as they do on hover.

### Unlink

The unlink pressed.

### CopyEmail

The email copied, and the page told.

### CopyNumber

The number copied, and the page told.

### CopyRefused

A browser that refuses the clipboard: nothing copied, nothing said.

### WithNothingToCopy

No email, no number and no tag: only the unlink.

### Mobile

The phone's row, its buttons always shown and the chip under the role.

### InEnglish

The same row in English, the name at the left.

### Dark

The row in the dark scheme, in the theme's dark colours.
