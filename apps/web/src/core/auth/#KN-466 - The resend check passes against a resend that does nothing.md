# KN-466 · The resend check passes against a resend that does nothing

**Why, from the board.** The whole point of the resend half is that a reader who
asks for another code is shown the one that now works. As written it cannot tell
a working resend from a dead button.

**Exit condition, from the board.** The story uses a deterministic code maker,
asserts the notice shows a different code after a resend, and asserts the first
code no longer signs in.

## What is there, read 2026-09-14

- **The seam exists below the provider.** `makeCode(random)` and
  `sendCode(phone, now, random)`, `core/auth/auth.ts` lines 57 and 63, already take
  a source of randomness, and `auth.test.ts` feeds them fixed ones. The provider's
  `send`, `AuthProvider.tsx` line 154, calls `sendCode(phone, Date.now())` with
  none, so nothing above it can know the code it will make.
- **`SigningInOnAPhone`**, `screens/AuthScreen.stories.tsx`, sends, reads five
  digits off the notice, asks for another, waits for any five digits in the notice
  and signs in with them. A resend that did nothing leaves the first code showing,
  the first code still signs in, and the story passes, which KN-462's roast said
  and this card carries.
- **The provider's unit test**, "refuses a wrong code, sends another on request,
  and signs in on the right one", resends and signs in with the code the console
  last showed, but never asks that the first is refused, and two random codes may
  be the same.
- **The docs** of `SigningInOnAPhone` say it reads the code off the screen and
  finishes signing in, nothing of the resend.

## The approach

1. **The provider takes the source**: `AuthProviderProps.random?: () => number`,
   handed to `sendCode`, and `send`'s dependencies take it. Given nothing, the mock
   makes codes as it does today, from `Math.random`, through `makeCode`'s default.
2. **The sign-in stories' decorator** reads `parameters.codes`, numbers from zero
   to below one, and hands the provider a source that returns them in turn, its
   place kept in a ref inside a small wrapper, so a render of the decorator cannot
   restart the sequence. A story with no `codes` passes no source, as today.
3. **`SigningInOnAPhone`** takes `codes: [0.5, 0.25]`: after the send the notice
   shows `50000`; after the resend the story waits for it to show `25000`, so a dead
   resend times out rather than passing; `50000` typed in is refused with the wrong
   code's message and the name step does not come; `25000` typed in signs in.
   Why those two: `makeCode` multiplies by 100000 and floors, and 0.5 and 0.25 are
   exact in binary floating point, so the codes are exactly `50000` and `25000`,
   where a value like 0.11111 can floor a digit short.
4. **The provider's unit test** does the same on the node side with a fixed
   source: the code after `requestCode` is the first, after `resend` the second,
   `verify` refuses the first and accepts the second.
5. **The docs** of `SigningInOnAPhone`, in both languages, say the resend shows a
   new code and only the new one signs in.

## The tests

- **Red first**: on today's provider the story's `random` is ignored, the codes are
  random, and the notice does not show `50000`; the unit test's provider refuses the
  unknown prop as a type error and, at runtime, sends random codes, so its first
  assertion on the code fails.
- **Plants**, after the change: a resend that does nothing times the story out
  waiting for `25000` and fails the unit test where the second code must differ; a
  resend that shows its new code but keeps the first aside, `sent` moved and
  `pending` not, lets `50000` sign in, and fails both where the first must be
  refused.
- The other sign-in stories, `SigningIn`, `EnterFinishesTheStep` and the keyboard
  ones, keep random codes and read them, and still pass.

## Files

- `apps/web/src/core/auth/AuthProvider.tsx` and `AuthProvider.test.tsx`.
- `apps/web/src/screens/AuthScreen.stories.tsx`, its meta and `SigningInOnAPhone`.
- `apps/web/src/shared/story-docs/en/Screens-SignIn.md` and `fa/Screens-SignIn.md`.

## What I am unsure of

- **A prop on the product's provider that only stories and tests use**, as
  `initial` already is. The remote provider makes no codes, so it takes none.
- **Whether the wrong code's message is the right thing to assert** after typing
  `50000`, or the name step's absence alone; both, since the message is what the
  reader sees and the absence is what matters.
- **The Core/AuthProvider story from KN-465** keeps random codes and its own
  provider; nothing here changes it.

## Plan review, Codex, 2026-09-14

Codex approved the seam: a `random` prop through the `sendCode` boundary already
there is the smallest honest injection, where a `makeCode` prop would expose a
lower detail and a spy on `Math.random` or a module-level switch is global state
shared by every story running at once. A cursor in a ref inside the decorator's
wrapper survives renders, and the sequence is consumed only by the send and
resend clicks, never by rendering, so a strict render does not consume it. The
two plants are caught as planned: a dead resend leaves `50000` showing and the
wait for `25000` fails; a resend that moves `sent` and leaves `pending` shows
`25000` and accepts `50000`, and the refusal fails. The retry timer cannot mask
either, since this provider never sets `retryAt`, and the play clicks rather than
presses Enter. Taken from it:

- **The code field is cleared before the second code.** After `50000` is refused
  the field still holds it, and with a `maxLength` of 5, typing `25000` after it
  adds nothing, so the sign-in could never succeed. The story reads the field's
  value as `50000` first, which proves the refused code is the one typed, then
  clears it and types `25000`.
- **The wait for the second notice is an assertion that throws**, a `waitFor`
  expecting `25000`, never a read of whatever five digits show, which is the false
  pass this card exists to end.

## Result, 2026-09-14

Built as planned, with both of Codex's changes.

- **The provider** takes `random`, handed to `sendCode`, and `send` depends on it.
  The product passes none, so its codes still come from `Math.random`; only a
  story or a test hands one in.
- **The sign-in stories' decorator** renders `SeededAuth`, which reads
  `parameters.codes` and keeps its place in a ref. A story without `codes` passes
  no source.
- **`SigningInOnAPhone`** takes `[0.5, 0.25]`: the notice shows `50000`, the story
  waits for it to show `25000` after the resend, types `50000` and reads it back
  from the field, finds it refused with no name step, clears the field, and signs
  in with `25000`.
- **The provider's node test** sends and resends on the same two numbers, and
  finds `50000` refused and `25000` accepted.

Red first, before the provider took the source: the node test failed at its code
list, `[ '19102', '30730' ]` where `[ '50000', '25000' ]` was expected, and the
story at its first code, `50939` where `50000` was expected.

Plants, each restored byte for byte and checked by hash:

- **A resend that does nothing** fails the node test's code list, one code where
  two were expected, and the story's wait, `50000` still showing where `25000` was
  expected.
- **A resend that shows its new code and keeps the first aside** fails the node
  test's refusal of `50000`, and the story's wait for the refusal message.
- The older node test, "refuses a wrong code, sends another on request, and signs
  in on the right one", fails under both plants as well.

One thing changed while building: the helper that reads the notice first took
`ReturnType<typeof within>`, which lints as `any`, so it takes the canvas element
and calls `within` itself.

Passing at the commit: the sign-in and `Core/AuthProvider` stories, 11; the auth
unit tests, 38; the docs guard, 75; the web unit project, 1382; eslint and tsc
clean; the three code files formatted. Nothing a reader sees changed, so there was
nothing new to look at in the four combinations.

Still unsure: `SeededAuth` wraps around its list, so a third send would repeat
`50000`; no story sends three times. KN-549, the `Core/AuthProvider` story reading
the mock's console line, can now use the same source.
