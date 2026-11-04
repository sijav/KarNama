One person on the network page, as a row of the list. From the start of the
row: a checkbox, which shows under the pointer, with keyboard focus inside and
while the page is selecting; the person's name over their role and company;
how the reader knows them, as a small label; the first job opportunity they
are linked to, with its status's stripe, and how many more there are; and, at
the row's end, buttons that open their link, copy their number and copy their
email, each only when there is one, shown under the pointer. The row turns
light grey under the pointer and light blue when selected. Pressing the name
opens the person, or, while selecting, chooses them.

## Props

### name

The person's name.

### role

Their role, shown before the company.

### company

Their company.

### label

How the reader knows them, such as a recruiter or a former colleague; none
draws no label.

### jobs

The job opportunities they are linked to, each with its title and status: the
first is shown, and the rest counted.

### email

Their email, which a button copies.

### phone

Their number, which a button copies.

### link

Their page, LinkedIn or a site, which a button opens in a new tab.

### selected

Whether the person is selected.

### selecting

Whether the page is selecting, which shows the checkbox and makes pressing the
name choose the person.

### onOpen

Called when the name is pressed, to open the person.

### onSelectedChange

Called with whether the person is now selected.

### onCopied

Called with `email` or `phone` once it is on the clipboard, for the page's
message.

## Stories

### Default

The row at rest, measured against the design.

### Hover

Under a real pointer, the grey row with its checkbox and actions. In Storybook
itself, hover it yourself.

### Selectable

While the page selects: the checkbox shows, the actions do not, and pressing the
name chooses the person.

### Selected

A selected person, the row light blue and the checkbox ticked.

### Opening

Pressing the name opens the person, and the checkbox chooses them.

### KeyboardFocus

Tab reaches the checkbox first, focus inside draws the hover look, and Tab
reaches the name and the actions.

### CopyEmail

The email goes to the clipboard and the page is told; the link opens in a new
tab.

### NoLabelNoJobs

A person with no label, no job opportunity and nothing to copy.

### InEnglish

The row in English, the checkbox at the left.

### Dark

A selected person in the dark scheme, in the theme's dark colours.
