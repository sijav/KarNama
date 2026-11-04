The heading row at the top of a page: its title, a way back when there is one,
and the page's primary action.

The title is the page's heading for screen readers, at the Heading/M size.
When the page has somewhere to go back to, an arrow before the title leads
there; the design draws it pointing right, back in a right to left page, and an
English page turns it round. The arrow is 20, and the control round it takes a
press anywhere in 24 each way. The primary action, a button, sits at the other
end. The row is 44 tall whatever it holds, the height the design draws it at,
so a page with a small action or none keeps its header's height. On a narrow
screen the settings gear follows the action, the shell's one control there, with
the language and signing out inside its dialog, the owner's answer of
2026-11-04, since the tab bar at the bottom has room only for the three
destinations; on a wide screen the language, the settings and signing out live
at the foot of the sidebar instead.

## Props

### title

The page's title, already in the reader's language.

### onBack

Called when the back arrow is pressed. Leave it out and there is no arrow.

### action

The page's primary action, usually a primary button. Leave it out and the end
of the row is empty.

### onSignOut

Called when signing out is pressed inside the settings a narrow screen's gear
opens. Leave it out and that dialog has no sign-out button.

## Stories

### Default

The board's header: its title and the button that adds a job opportunity.

### WithBack

The title with the back arrow before it and no action.

### TitleOnly

The title alone, both optional parts left out.

### ControlsOnNarrowScreens

The settings gear showing after the action on a narrow screen and gone on a
wide one, the language and signing out in its dialog rather than the header,
and signing out pressed there. The story sets the width when it runs as a test; in Storybook itself,
resize the window.

### InEnglish

The header in English, the back arrow on the left, turned to point back.
