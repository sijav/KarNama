Switches the interface language between Persian and English.

The control names the **current** language in that language, and that one label
is never translated. A reader who cannot read the language the interface is
currently in still has to be able to find their own.

## Props

### placement

Where the switch sits. `sidebar` fills the available width and aligns to the
start, which is what the desktop navigation rail needs. `header` shrinks to its
content, for the page header.

## Stories

### Sidebar

The default, as it appears in the desktop navigation rail.

### Header

The narrow variant, sized to its content.

### Open

The menu open, showing both languages. Each names itself in its own language;
the only translated string here is the menu's accessible name.

### Switching

The point of the control. Choosing English updates the button, and the document
direction and language attribute follow it.

### InEnglish

The same control with the interface already in English, which is what proves the
catalog reached the menu even though it renders in a portal.
