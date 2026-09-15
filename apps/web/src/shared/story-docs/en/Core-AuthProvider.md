Who is signed in, and the mock that sends the sign-in code. No message is really
sent yet, so the mock hands the screen the code to show, through a context of its
own rather than the contract a real provider fills, and only to a screen reading
the mock's own value.

The stories render the provider around the real sign-in screen and a probe that
reads the mock's code the way the screen does, so the code the provider holds is
compared with the code the screen draws, and the code the screen draws is then
used to sign in.

## Stories

### Persian

A code asked for, and another after it once the minute before a resend has
passed on a held clock: each time the code the screen shows is exactly the one
the provider holds, and the last one signs in.

### English

The same, in English.

### NoCodeUnderAnotherProvider

Another provider mounted inside the mock, stood in for by one waiting for a code,
each around its own sign-in screen: once the mock has sent a code, the mock's
screen shows it and the other screen shows none.
