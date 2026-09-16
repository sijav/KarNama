Signing in: a mobile number, then the five digit code made for it, then a name
the first time.

Page-map row 6 draws the three as three screens, and they are three steps of
one flow: the same card, a different heading and field. Everything in the
archive belongs to someone, so the product shows nothing until this is done.

**No message is really sent.** The provider is mocked for the MVP, the owner's
decision: the code step shows the code itself, said plainly to be a stand-in,
rather than pretending an SMS is on its way. The real provider replaces the
same two calls when the API's auth lands.

A number is read however it is typed: Persian or Arabic digits, spaces and
dashes, `+98` or `0098`, and it is kept as `09xxxxxxxxx`.

On the code step another code can be asked for a minute after the last, as the
API allows. Until then the step counts the minute down in the reader's digits,
and then offers to send another. Changing the number goes back to the number
step, with the number kept as it was typed.

## Stories

### Login

The first step, and what a number that is not one says.

### Code

The code step: whose code is on the screen, that nothing was really sent, and
what a wrong code says.

### Signup

The first login, which asks who this is and refuses an empty name.

### InEnglish

The first step with the language switched, where the direction flips.

### SigningIn

A reader signed in from end to end: a number given, a code asked for again once
the minute before a resend is up, the last one sent typed in, and the name the
first login asks for taken, after which the screen has nothing left to ask.

### SigningInOnAPhone

Signing in on a phone, with the code read where every reader finds it, on the
screen, said plainly to be a stand-in until a real message is sent. The story
knows the codes the mock makes, so it sees a resend, once the minute is up,
change the code on the screen, the first code refused, and the new one sign the
reader in.

### EnterFinishesTheStep

The card is a form, so Enter in a field does what the step's own button does:
it asks for the code, and on the next step it signs the reader in.

### KeyboardsForEachStep

Each step's field tells a phone what it holds and what its key does: the number
asks for a phone pad and its key sends the code, the code asks for digits and its
key signs in, and the name's key finishes. The number and the code are offered
from what the phone already holds, the number it knows and the message the code
arrives in.

### KeyboardsForEachStepInEnglish

The same, in English.

### LoginAsTheFrames

The first step at the design's two widths, 1440 and 390, measured against the
card the design draws: its width, the room inside it and between its parts, its
corners, edge and shadow, the Brand Row, the heading's title and line under it,
the field's example number, and the note under the action.

### LoginAsTheFramesInEnglish

The same, in English.

### CodeAsTheFrames

The code step at both widths, measured against the same card: the heading names
whose code is on the screen, the Code Row's five boxes fill the card's inner width 8 apart
and 56 tall, and under the action come the countdown to a resend, a second after
the send as the design draws it, and the link back to the number, each the card's
inner width, 22 tall and 24 apart, in the design's type and colours.

### CodeAsTheFramesInEnglish

The same, in English.

### LoginNoteInDark

The note under the first step, read in the dark scheme against the dark palette:
the card's own surface, and the note in the colour that clears the contrast its
12 pixel text needs.

### CodeTimerInDark

The countdown under the code step, read the same way in the dark scheme.

### SignupAsTheFrames

The first login's step at both widths, measured against the same card, with the
name's field and the action that starts.

### CountsDownToAResend

The minute before another code may be asked for, counted down in Persian digits
on a held clock: a minute right after the send with no resend offered, the
design's 00:59 a second later, one second left, and then a link that sends
another code and starts the count again.

### CountsDownToAResendInEnglish

The same, in English, in Latin digits.

### ChangingTheNumber

A mistyped number changed from the code step: the number step comes back with
the number as it was typed, in its field and focused, and the code goes to the
number typed instead.
