The settings control of the shell: an icon button that opens the Settings
dialog.

The design draws no settings, so the owner's instruction made it an icon: a
gear, which the icon set gained for it from Lucide, the family the design's own
icons are drawn from. It is named Settings, which its label tip shows, and its
description says what is inside: the
language, the theme and the sample data. The dialog holds focus while it is open
and gives it back to the button when it closes. Given a way to sign out, the
dialog carries it, as a phone's page header needs.

## Props

### onSignOut

Called when «خروج» is pressed inside the dialog, which closes first. Leave it
out, as the sidebar's gear does beside its own sign-out button, and the dialog
has none.

## Stories

### Default

The control in Persian, opening the dialog and taking focus back.

### InEnglish

The same, in English.

### SigningOut

The dialog's «خروج» pressed: it closes and signs out.

### WithoutSigningOut

The sidebar's gear, whose dialog has no sign-out button.
