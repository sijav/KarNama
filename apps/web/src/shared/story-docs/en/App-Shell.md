The application shell: the providers, the direction, and whatever the current
route renders.

It exists as a story so that the four combinations the done gate asks for —
Persian light, Persian dark, English light, English dark — can be seen in one
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

At a phone's width the sidebar gives way to the tab bar, and the language switch
is in the page's header: choosing English there turns the page and keeps the
choice. The story resizes the screen when it runs as a test; in Storybook
itself, narrow the window and use the switch yourself.
