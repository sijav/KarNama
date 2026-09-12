Adding a job opportunity: paste a posting's link or its whole text, let the
product read it, and correct what it found before saving.

The flow is Paste, then reading, then Review. Extract waits until the field is
filled and has been touched. While the posting is read, a small panel says so,
and past fifteen seconds says why it is slow; Escape there goes back to the
paste field. Review is the form filled from the posting, every field open to
correction, the title and the company marked as required; Manual is the same
form, empty, reached by «خودت دستی وارد کن». If reading fails, the title says
so, the field keeps what was pasted and explains, and Try again reads it again
or the form is still there to fill by hand. Saving without a title or a company
says which is missing. Leaving with anything entered asks first.

## Props

### open

Whether the modal is open. Each opening starts over.

### statuses

The statuses the form's picker offers.

### status

The id of the status a new job opportunity starts in.

### step

Where the modal opens: `paste`, the default, `review`, `manual` or `error`.

### source

The link or text the paste field opens with.

### draft

The fields the form opens with, at Review or Manual.

### onExtract

Called with what was pasted; returns what reading it found, or fails.

### onSave

Called with the form's fields when saved; the page saves and closes the modal.

### onAddStatus

Called when «+ وضعیت تازه» is pressed in the form's picker.

### onClose

Called when the modal is left, after asking when something was entered.

## Stories

### Paste

The paste field, empty, Extract waiting.

### PasteFilled

A pasted link; Extract waits until the field is touched.

### ExtractsToReview

Extracting a link lands on Review with what was found.

### Loading

The panel shown while the posting is read.

### LeaveWhileReading

Escape while reading goes back to the paste field, the link kept.

### Review

The filled form, corrected and saved.

### Manual

The empty form, refusing to save without a title and a company.

### ManualPath

«خودت دستی وارد کن» going to the empty form.

### ErrorStep

Reading failed: the field explains, and Try again reads it again.

### LeavingAsks

Leaving with something entered asks, and closes only when told to.

### Phone

On a phone's width, the fields in one column.

### InEnglish

The paste field in English.

### StepFromItsArgs

The step changed while the modal is open, as the Controls change it: the modal
starts again on that step.

### RestartWhileReading

The step changed while the posting is being read: the modal starts again on that
step, and the reading it left, when it comes back, changes nothing.

### AnswerAfterLeaving

A reading that was left, answering afterwards: Escape goes back to the paste
field, and when the reading it walked away from comes back, it lands nowhere
rather than filling a form the reader is no longer looking at.
