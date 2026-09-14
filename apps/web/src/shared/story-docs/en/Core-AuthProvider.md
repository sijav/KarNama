Who is signed in, and the mock that sends the sign-in code, which it hands to the
screen as the code to show, since no message is really sent yet.

The story renders the provider around the real sign-in screen and a probe that
reads the provider by name, so the code the provider holds is compared with the
code the screen draws, and the code the screen draws is then used to sign in.

## Stories

### Persian

A code asked for, and another after it: each time the code the screen shows is
exactly the one the provider holds, and the last one signs in.

### English

The same, in English.
