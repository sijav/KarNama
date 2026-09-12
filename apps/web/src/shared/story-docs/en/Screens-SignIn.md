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
