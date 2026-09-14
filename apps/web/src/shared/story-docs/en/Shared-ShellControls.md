The shell's own controls: the language, the settings and signing out, as a row
of icon buttons.

The design draws none of the three as an icon, and the owner asked for all of
them as icons, so they sit together in chrome the design already has: at the
foot of the desktop sidebar and, on a phone, in each page's header after its
action. From the start of the row: the language, its icon the current
language's flag; the settings, a gear; and signing out, when there is someone to
sign out. They are 12 pixels apart, and each has a tip that says what it does
beyond its name.

## Props

### placement

Where the row sits, which decides where the language menu opens: `sidebar`,
above its button, or `header`, below it.

### onSignOut

Called when signing out is pressed. Without it there is no sign-out button, as
before anyone signs in.

## Stories

### InTheSidebar

The row as the sidebar holds it, in Persian: three buttons 12 pixels apart,
their names and tips, and signing out pressed.

### InTheHeader

The row as a phone's page header holds it.

### WithoutSigningOut

The row with nobody to sign out: the language and the settings alone.

### InEnglish

The row in English, running from the left.
