Switches the interface language between Persian and English.

An icon button whose icon is the flag of the current language's region, Iran's
for Persian and the United States' for English, named «زبان» in Persian and
Language in English. Its tip is the current language's own name, the one label
here that is never translated: a reader who cannot read the interface still
recognises their language, by its flag or by its name. Pressing it opens a menu
of both languages, each naming itself in its own language beside its flag, and
the menu never covers the button.

## Props

### placement

Where the switch sits, which decides where its menu opens. `sidebar`, at the
foot of the desktop navigation, opens it above the button, running from the
button's start; `header`, in a phone's page header, opens it below, running back
from the button's end.

## Stories

### Sidebar

The switch at rest as the sidebar holds it: a 32 pixel square, the 20 pixel
flag, its name and its tip.

### Header

The switch as a phone's page header holds it.

### Open

The menu open from the sidebar, both languages with their own flags, four
pixels above the button and flush with its start, the right in Persian.

### OpenInEnglish

The same menu in English, where the button's start is its left.

### OpenInTheHeader

The menu open from a page header, four pixels below the button and flush with
its end.

### OpenInTheHeaderInEnglish

The same, in English.

### Switching

The point of the control. Choosing English renames the button, changes its
flag and its tip, and the document's direction and language follow it.
