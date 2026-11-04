A message at the top of the Stats page, in a light blue band the width of the
page: a sentence a fixed rule makes from the reader's own applications, such
as how many have gone unanswered for more than three weeks, and at the other
end a small outlined button that goes where the message points. The page
shows at most two, and never one telling the reader to follow up.

The message wraps when the page is narrow, and the band grows with it; the
button keeps its size and stays in the middle of the band's height.

## Props

### message

The sentence, written by the page from its rule.

### action

The button at the end, `{ label, onClick }`; leave it out for none, when the
message fills the band.

## Stories

### Default

The first message, about unanswered applications, measured against the design.

### QuietWeek

The second message, a week with no application while job opportunities are
saved, measured the same way.

### Action

The button pressed with a pointer, then with the keyboard.

### WithoutAnAction

A message with no button, filling the band.

### Wraps

A narrow page: the message on two lines, the band taller, the button centred.

### InEnglish

The first message in English, read from the left.

### Dark

The band in the dark scheme, in the theme's dark colours.
