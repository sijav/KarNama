Adding a job opportunity: paste a posting's link or its whole text, let the
product read it, and correct what it found before adding it.

The flow is Paste, then reading, then Review. Extract waits until the field is
filled and has been touched. While the posting is read, a small panel says so,
and past fifteen seconds says why it is slow; Escape there goes back to the
paste field. Review is the form filled from the posting, every field open to
correction, the title and the company marked as required; under the company,
how many of the reader's network are there, and under the source, that the
posting's link filled it in. The form scrolls, and a fade at its foot says there
is more until it is scrolled to its end. Manual, reached by «ورود دستی», is the
same form, empty: the title and the company over «جزئیات بیشتر», which opens the
rest. The footer's Status Select chooses the status the job opportunity is added
in, and «افزودن» adds it. If reading fails, the title says so, the field keeps
what was pasted and says why, and «تلاش دوباره» reads it again, or the form is
still there to fill by hand. Adding without a title or a company says which is
missing, and a field behind the toggle that stops it opens the rest. Leaving
with anything entered asks first.

## Props

### open

Whether the modal is open. Each opening starts over.

### stages

The stages the footer's Status Select offers, in the board's order.

### outcomes

The outcomes it offers under them, Rejected.

### status

The id of the status a new job opportunity starts in.

### sources

The reader's own sources and the common ones, which the form's Source Picker
offers.

### peopleAt

Given a company, how many of the reader's network are there; the form says so
under the company when there are any. Without it, nothing is said.

### step

Where the modal opens: `paste`, the default, `review`, `manual` or `error`.

### source

The link or text the paste field opens with.

### draft

The fields the form opens with, at Review or Manual. At Review its source is
the one reading found.

### onExtract

Called with what was pasted; returns what reading it found, or fails.

### onSave

Called with the form's fields and the status chosen when «افزودن» is pressed;
the page adds the job opportunity and closes the modal.

### onAddStatus

Called when a new status is asked for in the Status Select.

### onClose

Called when the modal is left, after asking when something was entered.

## Stories

### Paste

The paste field, empty, Extract waiting, measured against the frame.

### PasteFilled

A pasted link; Extract waits until the field is touched.

### ExtractsToReview

Extracting a link lands on Review with what was found.

### Loading

The panel shown while the posting is read.

### LeaveWhileReading

Escape while reading goes back to the paste field, the link kept.

### Review

The filled form, measured against the frame: the company's network, the source
read from the link, the fade that leaves at the form's end and the footer;
corrected and added.

### ReviewInEnglish

The filled form in English, added with the days reading found.

### OnePersonAtTheCompany

One person of the network at the company, said in the singular.

### Dark

The filled form in the dark theme.

### Manual

The empty form, the title and the company over the toggle, refusing to add
without a title and a company.

### ManualDetails

The toggle opening the rest of the form, which keeps what was typed when it is
closed and opened again.

### ManualShowsWhatStopsTheSave

A field behind the toggle that stops the adding opens the rest, so its error is
seen.

### ManualPath

«ورود دستی» going to the empty form.

### ErrorStep

Reading failed: the field says why, and «تلاش دوباره» reads it again.

### LeavingAsks

Leaving with something entered asks, and closes only when told to.

### Phone

On a phone's width, the fields in one column and the footer's actions on a row
of their own.

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

### KeyboardsOnTheForm

The form's single-line fields tell a phone's keyboard that their key saves, and
the posting link asks for a link's keyboard.

### KeyboardsOnTheFormInEnglish

The same, in English.
