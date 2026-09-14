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
shared link, is read back into the page. While the add flow is open over the
board, the board stays the current page in the navigation.

### LaidOutAsTheFrames

The board and the network at the design's own screen sizes, 1440 by 900 and 390
by 844, with the sample data loaded from Settings the way a reader loads it:
the header band across the top of each page holding the title row, the search
bar and the sort where the design puts them, the page's margins of 32 on a
desktop and 16 on a phone, the board's columns 16 apart, and the network's
people in two columns 24 apart, or one column 12 apart on a phone. The story
resizes the screen when it runs as a test.

### LaidOutAsTheFramesInEnglish

The same measurements in English, where the direction flips: every distance is
read from the edge a line of text starts at, so the same numbers hold on the
other side.

### NobodySignedIn

What the app draws for somebody who has not signed in: the shell is not drawn
at all, because everything in the archive belongs to someone.
