The window that deletes a job opportunity. It asks why, and says the reader
does not have to choose: no longer wanted, no answer came, or added by mistake
or twice. With no reason, or a mistake, it offers Keep and Delete. No longer
wanted, or no answer, suggests moving the job opportunity to withdrawn or to no
response instead, where it is out of sight and still counts in the stats: the
main button moves it there, and Delete, in red text, still deletes it. Keep is
not called Cancel, since that is the name of a status. Keep has focus as the
window opens, and the close, Escape and a press outside keep the job
opportunity too.

## Props

### open

Whether the window is open; each opening starts with no reason chosen.

### withdrawnName

The withdrawn outcome's name, which the hint and the main button say.

### noResponseName

The no response outcome's name, which the hint and the main button say.

### onDelete

Called with the reason chosen, or null when none is.

### onMove

Called with `withdrawn` or `no-response` when the main button moves the job
opportunity there instead.

### onKeep

Called when the window is closed and the job opportunity kept.

## Stories

### NoReason

No reason chosen, measured against the design: Keep and Delete, which deletes
with no reason.

### NotWanted

No longer wanted: the hint, the main button that moves it to withdrawn, and
Delete in red text.

### NoAnswer

No answer: the hint and the main button name no response, and Delete still
deletes, with its reason.

### Mistake

Added by mistake: Keep and Delete, which deletes with its reason.

### Keep

Keep, the close and Escape keep the job opportunity; opened again, no reason is
chosen.

### InEnglish

In English, read from the left, the footer at the right.

### Dark

In the dark scheme, the hint in the theme's dark colours.
