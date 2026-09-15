# KN-587 - The sign-in code step shows no countdown to a resend and no way back to change the number

## The card

Found by KN-518's reading of the sign-in frames with use_figma, 2026-09-15.

**Why.** A reader who mistyped the number has no way back but a reload, and a
resend that is disabled without a time says nothing about when it will work.

**Exit.** While a resend waits, the code step says how long in the file's words
and the reader's digits, counting down, and offers the resend when it ends;
«ویرایش شماره» returns to the number step with the number kept; both as the file
draws them at 1440 and 390, with stories, and the sign-in e2e changing a number.

## Read before planning, 2026-09-15

**The file.** Auth Desktop Code `407:6972` and Mobile Code `407:7043`, read with
use_figma. The Auth Card is a vertical auto layout, 24 between its parts. Under the
Primary Action, «تأیید و ورود», it draws:

- **Resend Timer**, `407:6996` and `407:7067`: a text layer filling the card's
  width, 376 and 278, hugging its 22 of height. «ارسال دوباره‌ی کد تا ۰۰:۵۹»,
  Vazirmatn Regular 14 on a line of 22, centred, `text/disabled`, no text style, no
  reaction. The time is in Persian digits, U+06F0 to U+06F9, and «دوباره‌ی» holds a
  zero-width non-joiner.
- **Change Number**, `407:6997` and `407:7068`: a frame filling the card's width, 22
  tall, centring one text, «ویرایش شماره», the layer named Footer Link, Vazirmatn
  Medium 14 on 22, `text/brand`. The frame's reaction on click navigates to Login,
  `407:6951` and `407:7022`.

**Nothing is drawn after the countdown.** No frame on the Screens page and no note
on the Documentation page shows the line once the time is up, searched for «ارسال»,
«دوباره» and «ویرایش».

**The code.**

- `AuthScreen.tsx` draws, under the action, a Text Button «ارسال کد دیگر», disabled
  while `now < auth.retryAt`, with `now` ticked once a second from the moment
  `retryAt` changes, and nothing that leaves the code step.
- The mocked `AuthProvider` is what the live site runs, `VITE_AUTH_MODE: demo` in
  `pages.yml`, and what the e2e runs. It sets no `retryAt`, so its resend is never
  disabled, and its `resend` sends at once.
- `RemoteAuthProvider`, `VITE_AUTH_MODE=live`, sets `retryAt` from the API's
  `retryAfterSeconds`, 60 in `auth.service.ts`, and refuses a resend before it; the
  API answers a send to the same number within the minute with `RESEND_TOO_SOON`.
  No test or story renders it.
- Nothing in `AuthValue` leaves the code step: `awaiting` is the mock's
  `sent !== null` and the remote's own flag.
- A message may not take a value until KN-221 compiles the catalogs, AGENTS.md
  section 7: the time goes beside the words.
- The catalog test fails an id the code no longer uses, and needs both catalogs to
  hold the same ids.
- `formatPhone` and `formatCount` write digits in the reader's script with
  `Intl.NumberFormat`.
- The add modal's «خودت دستی وارد کن» is the product's one text link: a `ButtonBase`
  at 14 on 22, Medium, `text/brand`, with two pixels of `border/focus` on keyboard
  focus.
- The sign-in stories `SigningIn` and `SigningInOnAPhone`, Core/AuthProvider's
  `Persian` and `English`, the provider's unit test and the e2e all press the resend
  right after a send.

## The approach

1. **The mock waits as the API does.** `auth.ts` gains `RESEND_SECONDS`, 60, the
   API's `retryAfterSeconds`, and a sent code carries `retryAt`, the send's time plus
   that. The mocked provider gives `retryAt` in its value and, like the remote one,
   sends nothing on a resend before it.
2. **A way back in the contract.** `AuthValue` gains `changeNumber`, required, beside
   `resend`: it leaves the code step for the number step. The mock drops the code it
   holds, which ends `awaiting`. The remote clears its error and `awaiting`, and does
   nothing while a request is out, as its `signOut` does. The two stand-in values in
   the provider's test and stories gain it.
3. **The countdown.** Under the action, a `Resend` part of `AuthScreen.tsx`, keyed by
   `retryAt` so every send starts it again, holds the seconds left, rounded up. It
   looks at the clock four times a second and stops when none are left.
   - While seconds are left, it is the Resend Timer: «ارسال دوباره‌ی کد تا» and beside
     it the time, minutes and seconds of two digits each in the reader's digits, from
     a new `formatClock(locale, seconds)` beside `formatCount`. A line at 14 Regular on
     22, centred, `text/disabled`. It is no live region, since a screen reader
     announcing a clock every second is noise.
   - When none are left, the same line offers «ارسال دوباره‌ی کد», the file's words
     without the time, as a Footer Link. The file draws no state after the countdown;
     a link in the look of «ویرایش شماره» keeps the card's height and says what the
     line was waiting for. It resends, and is disabled while the provider is busy.
   - The once-a-second ticker and the Text Button go.
4. **«ویرایش شماره».** A Footer Link under the countdown, 14 Medium on 22,
   `text/brand`, centred, its press target the card's width as its frame is, disabled
   while busy.
   - Pressing it clears the code and the problem shown, calls `changeNumber`, and puts
     the reader in the number field, which still holds what they typed, since the
     screen keeps its own `phone` state. The link goes with its step, so focus would
     otherwise fall to the page's body.
   - The link marks the return in a ref; a layout effect on `awaiting` sees the
     number step back with that mark set, clears it, and focuses the one input of
     the card's form, held in a ref of its own. No `flushSync`, and nothing rests on
     where the pressed link sat.
   - The Footer Link is a small part of `AuthScreen.tsx` beside `Heading`, drawn on
     `ButtonBase` as the add modal's link is, plus `text/disabled` when disabled, the
     Button's disabled text; the file draws no disabled link.
5. **The words.** Three new ids in both catalogs, the Persian written from the file's
   code points: 'Send the code again in' «ارسال دوباره‌ی کد تا», 'Send the code again'
   «ارسال دوباره‌ی کد», and 'Change the number' «ویرایش شماره». 'Send another code'
   goes.
6. **Stories hold the clock.** `shared/story-fixtures/clock.ts` gains `holdClock`,
   which holds `Date.now` at a time, moves it forward on request and puts it back,
   with a unit test beside it. A play that waits out the countdown holds it rather
   than waiting sixty seconds, and after each move of the clock it waits for the
   countdown's next look at the clock, a quarter of a second, before it reads the
   line.
   - `CodeAsTheFrames` holds the clock one second past the send. At 1440 and 390 it
     measures the Resend Timer: «ارسال دوباره‌ی کد تا ۰۰:۵۹» exactly, the card's inner
     width, 22 tall, 14 at 400, centred, `text/disabled`, 24 under the action. And
     «ویرایش شماره»: the card's inner width, 22 tall, 14 at 500, centred, `text/brand`,
     24 under the timer.
   - `CountsDownToAResend`, new, fa-IR: «ارسال دوباره‌ی کد تا ۰۱:۰۰» right after the
     send and no resend offered; «۰۰:۰۱» at 59 seconds. At 60 the line offers «ارسال
     دوباره‌ی کد», which sends another code, said at the console, and the count starts
     again at «۰۱:۰۰». `CountsDownToAResendInEnglish` is the same in en-US, «Send the
     code again in 01:00».
   - `ChangingTheNumber`, new, fa-IR: a number sent, «ویرایش شماره» pressed, the
     number step back with the number in its field and focused, another number typed
     and sent, and the code step saying it went to that one.
   - `SigningIn`, `SigningInOnAPhone`, and Core/AuthProvider's `Persian` and
     `English` hold the clock and move it past the minute before their resend, under
     the new words.
7. **Unit tests.**
   - `auth.test.ts`: a sent code's `retryAt` is the send plus 60 seconds; the
     literal code in it gains one.
   - `AuthProvider.test.tsx`: a resend before `retryAt` sends nothing, and one after
     it sends. `changeNumber` drops the code, so the code no longer signs in and a
     resend sends nothing.
   - `formatClock.test.ts`: 59 seconds, a minute and zero, in both locales.
8. **End to end.** `sign-in.spec.ts` installs Playwright's clock, 1.62.1, in its
   `beforeEach` before the first navigation, as Playwright requires; the clock runs
   on naturally until a test moves it.
   - The resend test sees «ارسال دوباره‌ی کد تا», runs the clock a minute on with
     `runFor`, which fires the countdown's interval where `fastForward` fires each
     due timer once, and presses «ارسال دوباره‌ی کد».
   - A new test sends a code to one number and presses «ویرایش شماره». It finds the
     number still in the field, sends to another, and signs in with that number's code.
9. **The record.**
   - DESIGN.md section 8 draws the two lines as built, and names the state after the
     countdown as the build's own reading.
   - The Screens/SignIn and Core/AuthProvider docs describe the new and changed
     stories in both languages.
   - KN-591 gets a note: the Resend Timer draws its 14 in the Terms Note's
     `text/disabled`.

## File by file

- `apps/web/src/core/auth/auth.ts` and `auth.test.ts`
- `apps/web/src/core/auth/AuthProvider.tsx`, `AuthProvider.test.tsx` and `AuthProvider.stories.tsx`
- `apps/web/src/core/auth/RemoteAuthProvider.tsx`
- `apps/web/src/screens/AuthScreen.tsx` and `AuthScreen.stories.tsx`
- `apps/web/src/i18n/formatClock.ts`, `formatClock.test.ts`, `locales/en-US.ts` and `locales/fa-IR.ts`
- `apps/web/src/shared/story-fixtures/clock.ts` and `clock.test.ts`
- `apps/web/src/shared/story-docs/{en,fa}/Screens-SignIn.md` and `Core-AuthProvider.md`
- `apps/web/e2e/sign-in.spec.ts`
- `DESIGN.md`

## What I expect to be hard, and what I am unsure of

- **Holding `Date.now` in a play.** React's scheduler reads `performance.now`, and
  testing-library's `waitFor` and Vitest's timeouts run on timers. So I expect a held
  `Date.now` to move only the provider and the countdown. If Storybook's instrumenter
  or user-event reads it, a play will show it.
- **What the line becomes at zero is not drawn.** A Footer Link with the file's own
  words is my reading. The Text Button there now is 44 tall, so switching to it as
  the count ends would grow the card by 22.
- **The same number again.** After «ویرایش شماره», sending the same number within
  the minute gets a new code from the mock at once. The API refuses it with
  `RESEND_TOO_SOON`, which the number step shows as a minute to wait. I leave that
  as the API's answer rather than carrying the countdown back to the number step.
- **`RemoteAuthProvider` has no test or story**, though coverage includes it, so its
  `changeNumber` is as unproven as the rest of it. KN-503 already holds that: what
  Codex added to the web app, the live auth provider first, runs in no test. It gets
  a note naming `changeNumber`.
- **Focus through the form's ref** is the one imperative step. `Input` takes no ref
  and no `autoFocus`, and adding either would change a shared component's props and
  Docs.
- **`text/disabled` at 14 is 2.54 to one**, as the Terms Note is, KN-591's question
  for the owner. Drawn as the file draws it.

## Plan review, Codex gpt-5.6-terra, 2026-09-15

"Do not build it exactly as written: fix the e2e clock setup first." Three
corrections, all taken, and the rest confirmed.

1. **The e2e clock goes in before the first navigation.** The spec's `beforeEach`
   loads the page before a test body could install it, and a reload after does not
   meet Playwright's ordering rule; `runFor` rather than `fastForward`, since the
   screen updates on a repeating interval. Taken in step 8.
2. **A story waits for the tick.** After each move of the held clock the screen
   changes only at its next quarter-second look, so a play reads the line through
   `findByText` or `waitFor`. Taken in step 6.
3. **Focus without `flushSync`.** A form ref and a layout effect run only on the
   return to the number step, rather than `flushSync` and the pressed link's
   `closest('form')`; React documents `flushSync` as a last resort. Taken in step 4.

**Confirmed.** In the installed user-event 14 and DOM Testing Library, interactions
and `waitFor` run on real timers and mutation observers, not `Date.now`, so a held
`Date.now` stalls no click, typing, instrumenter or `waitFor`. My own reading agrees:
Storybook's test bundle reads `Date.now` once, for a chai cache key; its instrumenter
never; React's scheduler and Vitest's runner take `performance.now`. The Footer Link
at zero is the closest grounded reading, keeping the file's 22 where the Text Button
would bring back 44, and recording it in DESIGN.md as the build's is honest.
`changeNumber` belongs in `AuthValue`, and the screen keeping the typed number meets
the exit. The live provider's missing tests are KN-503's, not made worse in a new way.

## How I will know it works

- The new and changed stories under Vitest, in both story files; the unit project;
  eslint and tsc.
- The sign-in e2e, desktop and mobile.
- The code step seen at 1440 and 390 in fa-IR and en-US, light and dark, beside the
  file's screenshots; the Screens/SignIn Docs page read in both languages.

## Result, 2026-09-15

Built as planned after the review.

- **The contract.** The mock gives `retryAt`, a minute after each send, and sends
  nothing on a resend before it. Both providers have `changeNumber`: the mock drops
  its code, and the live one clears its error and `awaiting` unless a request is
  out.
- **The screen.** Under the action, the Resend Timer counts down in the reader's
  digits and becomes the Footer Link «ارسال دوباره‌ی کد» at zero. «ویرایش شماره»
  under it returns to the number step, which keeps the number and takes focus
  through the form's ref and a layout effect. The once-a-second ticker and the Text
  Button «ارسال کد دیگر» are gone, and so is the id 'Send another code'.
- **The words.** The three new Persian messages were written from 407:6996's and
  407:6998's code points and read back against them: all three match.

**Checks.**

- The unit project, 1477 of 1477 in 42 files, the catalog and docs guards among
  them; tsc and eslint on every changed file clean; the formatter clean at HEAD and
  after on all fourteen code files.
- The sign-in and provider stories, 18 of 18, the three new ones and the four that
  now wait out the minute before their resend among them.
- Coverage of what KN-587 added is whole. `auth.ts`, `formatClock.ts` and
  `clock.ts` are at 100 under the unit project. `AuthProvider.tsx` misses there only
  the other tab's storage listener, lines 157 to 167, KN-419's. `AuthScreen.tsx`
  under its two story files misses nothing KN-587 added: its misses are the
  busy-or-restoring return, the submit's and the resend's `catch`, the expired-code
  arm, and the restoring, error and busy branches of the live sign-in, all older
  and noted on KN-503.
- The sign-in e2e, 10 of 10, desktop and mobile: the resend test runs Playwright's
  clock a minute on, and the new test changes a number and signs in with the other.
- The look, headless at a scale of two against the dev Storybook, reached by a real
  send: at 1440 and 390, fa-IR and en-US, light and dark, the lines under the action
  read «ارسال دوباره‌ی کد تا ۰۰:۵۹» and «ویرایش شماره», or «Send the code again in
  00:59» and «Change the number», a second in. Pressed, the number step came back
  holding the number with its field focused, and no page error came in any of the
  eight.
- The Screens/SignIn Docs page prints the new description paragraph and the six
  entries checked, in fa-IR and in en-US, with LoginAsTheFrames as the control.
