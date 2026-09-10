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
