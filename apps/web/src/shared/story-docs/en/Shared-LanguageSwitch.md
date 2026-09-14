Switches the interface language between Persian and English.

The control names the **current** language in that language, and that one label
is never translated. A reader who cannot read the language the interface is
currently in still has to be able to find their own. The flag of the language's
region leads its name, Iran's for Persian and the United States' for English,
because a flag is found before a word in a script one cannot read. The flag is
decoration: the control's accessible name is the language's name alone.

## Props

### placement

Where the switch sits. `sidebar` fills the available width and is laid out as a
navigation item, with the flag where an item has its icon, so the language's
name starts where the items' names start. `header` shrinks to its content, for
the page header, with the flag before the name.

## Stories

### Sidebar

The default, as it appears in the desktop navigation rail: the current
language's flag twelve pixels in from the edge, and its name eight after it.

### Header

The narrow variant, sized to its content, with the flag eight pixels before the
name.

### Open

The menu open, showing both languages, each led by its own flag. Each names
itself in its own language; the only translated string here is the menu's
accessible name.

### Switching

The point of the control. Choosing English updates the button and its flag, and
the document direction and language attribute follow it.

### InEnglish

The same control with the interface already in English, which is what proves the
catalog reached the menu even though it renders in a portal, and that the flag
leading the button is English's.
