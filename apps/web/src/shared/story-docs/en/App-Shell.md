The application shell: the providers, the direction, and whatever the current
route renders.

It exists as a story so that the four combinations the done gate asks for, Persian light, Persian dark, English light, English dark, can be seen in one
place rather than assembled by hand each time.

## Stories

### Persian

The product default: Persian, right-to-left, light.

### PersianDark

The same, in the derived dark scheme.

### SystemScheme

Following the operating system rather than pinning a scheme, which is the
setting most users will actually be on.

### English

English, left-to-right. Strings are longer here and the direction flips, so this
is where a layout bug shows.

### LanguageOnAPhone

At a phone's width the sidebar gives way to the tab bar, and the shell's own
controls are in the page's header: choosing English from the language button
there turns the page and keeps the choice, and the page's title stays whole
beside the controls in both languages. The story resizes the screen when it
runs as a test; in Storybook itself, narrow the window and use the switch
yourself.

### SigningOutOnAPhone

At a phone's width, signing out from the page header's controls, since the tab
bar has no room for it: the sign-in screen comes back. The story resizes the
screen when it runs as a test.

### Navigating

The address and the page following each other: the navigation writes the hash,
and a hash written by anything else, the back button, a typed address, a
shared link, is read back into the page.

### NobodySignedIn

What the app draws for somebody who has not signed in: the shell is not drawn
at all, because everything in the archive belongs to someone.
