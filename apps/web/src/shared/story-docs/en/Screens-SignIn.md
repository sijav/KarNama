Signing in: a mobile number, then the five digit code that was sent to it, then
a name the first time.

Page-map row 6 draws the three as three screens, and they are three steps of
one flow: the same card, a different heading and field. Everything in the
archive belongs to someone, so the product shows nothing until this is done.

**No message is really sent.** The provider is mocked for the MVP, the owner's
decision: the code is written to the browser console and the page says so,
rather than pretending an SMS is on its way. The real provider replaces the
same two calls when the API's auth lands.

A number is read however it is typed: Persian or Arabic digits, spaces and
dashes, `+98` or `0098`, and it is kept as `09xxxxxxxxx`.

## Stories

### Login

The first step, and what a number that is not one says.

### Code

The code step: where the code went, that nothing was really sent, and what a
wrong code says.

### Signup

The first login, which asks who this is and refuses an empty name.

### InEnglish

The first step with the language switched, where the direction flips.

### SigningIn

A reader signed in from end to end: a number given, a code asked for again, the
last one sent typed in, and the name the first login asks for taken, after
which the screen has nothing left to ask.

### SigningInOnAPhone

Signing in on a phone, where there is no console: the code is on the screen,
said plainly to be a stand-in until a real message is sent. The story knows the
codes the mock makes, so it sees a resend change the code on the screen, the
first code refused, and the new one sign the reader in.

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
