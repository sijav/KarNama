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

The address and the page following each other: the navigation writes the page's
path under the site's base, and a path the history moves to by anything else,
the back button or a shared link, is read back into the page. Going to the page
already shown adds nothing to the history. While the add flow is open over the
board, the board stays the current page in the navigation.

### BackFromAConfirmation

The reader is asked to confirm a deletion on the board, and then goes back. The
screen is replaced under the open confirmation, which takes the board, the
dialog and the control that opened it away together, so what the browser tries
to give focus back to is no longer in the page and the page body takes it
instead. The shell puts focus on the page region, so the next Tab carries on
from the page that arrived rather than from the top of it. The story loads the
sample data, makes two entries of its own so that going back has somewhere of
the application's to go, and uses the browser's own back rather than standing in
for it.

### OpeningTheAddFlowKeepsFocus

The control for the story above. The add flow is a modal over the board, so
opening it changes the address without changing the screen, and focus stays in
the dialog rather than moving to the page region. Telling those two apart is
what the shell's rule turns on: the address and the current destination both say
add, while the screen underneath is still the board.

### NavigatingKeepsFocus

An ordinary navigation, where the reader activates a control that belongs to the
shell and is still there afterwards. The screen changes and their focus stays
where they put it: the page region does not take it. This is the boundary the
shell keeps, since the case above, a screen replaced under an open confirmation,
is the only one it settles focus for.

### NavigatingWithAPointer

The same navigation driven by a real pointer rather than a simulated one, which
only the test runner can do. It asserts the one thing this card claims, that the
shell did not take focus, and records where a pointer actually leaves it rather
than deciding that question here.

### NavigatingAwayFromAFocusedCardKeepsTheShellOut

An ordinary navigation where the reader's focus was on a card that goes with the
screen, so focus is lost. The shell still leaves them alone: losing focus is not
why it settles, only a condition on the one case where it does. This is the story
that draws the line, since in the plainer navigation above focus survives and
either half of the rule would have been enough on its own.

### FromAnOldAddress

An address shared while the page was in the hash, #/network, opens the network
page, and the network page's path takes its place in the address.

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

### Selecting

While a page is selecting, the Bulk Action Bar has the foot of the screen to
itself: on a desktop the sidebar stays beside the page while the bar floats, and
on a phone the tab bar gives the bar its place and comes back when the selection
is let go, on the board and on the network, where a card is held to choose it.
The story loads the sample data and resizes the screen when it runs as a test.

### SignedOutInAnotherTab

Signing out in another open tab signs this one out too, so the tab left behind
does not keep the board open for whoever finds it, and nothing else that tab
writes does: its change to the board comes first, and is taken in here with the
reader still signed in. The other tab is stood in for by the storage events its
writes deliver, sent only once this tab's own providers are listening, since an
event that arrives before the listener is lost.

### SignedInInAnotherTab

Signing in in another open tab reaches this one: a first login's session, with no
name yet, brings this tab to the name step, and the name saved here is kept on
that session. That a tab part way through signing in keeps the arriving session
to save the name on, and drops the code it was waiting on, is checked end to end,
where the providers are wired as the app wires them. The story sends the other
tab's sign-in only once its own provider is listening, since an event that
arrives before the listener is lost.

### NobodySignedIn

What the app draws for somebody who has not signed in: the shell is not drawn
at all, because everything in the archive belongs to someone.
