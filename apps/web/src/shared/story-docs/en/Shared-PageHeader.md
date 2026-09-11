The heading row at the top of a page: its title, a way back when there is one,
and the page's primary action.

The title is the page's heading for screen readers, at the Heading/M size.
When the page has somewhere to go back to, an arrow before the title leads
there; the design draws it pointing right, back in a right to left page, and an
English page turns it round. The primary action, a button, sits at the other
end. On a narrow screen the language switch follows the action, since the tab
bar at the bottom has room only for the three destinations; on a wide screen it
lives in the sidebar instead.

## Props

### title

The page's title, already in the reader's language.

### onBack

Called when the back arrow is pressed. Leave it out and there is no arrow.

### action

The page's primary action, usually a primary button. Leave it out and the end
of the row is empty.

## Stories

### Default

The board's header: its title and the button that adds a job opportunity.

### WithBack

The title with the back arrow before it and no action.

### TitleOnly

The title alone, both optional parts left out.

### LanguageOnNarrowScreens

The language switch showing on a narrow screen and gone on a wide one. The
story sets the width when it runs as a test; in Storybook itself, resize the
window.

### InEnglish

The header in English, the back arrow on the left, turned to point back.
