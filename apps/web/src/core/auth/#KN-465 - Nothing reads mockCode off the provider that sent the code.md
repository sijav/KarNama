# KN-465 · Nothing reads mockCode off the provider that sent the code, which KN-462's exit asked for

**Why, from the board.** The code on the screen has to be the code the provider
will accept, and today the only thing joining those two is that both read the
same field in the same render. A probe says it directly.

**Exit condition, from the board.** A story reads mockCode from the provider
after a send and after a resend, and asserts the screen shows exactly that.

## What is there, read 2026-09-14

- **`AuthProvider`**, `core/auth/AuthProvider.tsx`, holds the code it last sent
  and hands it out as `mockCode`, the code the mock would have texted, null when
  nothing is pending; `requestCode` sends one to a number and `resend` sends
  another to the same number.
- **`AuthScreen`**, `screens/AuthScreen.tsx`, draws it on the code step, KN-459:
  a `role="status"` box whose last span, `dir="ltr"`, is the code alone.
- **KN-462** made `SigningInOnAPhone` read the code off the screen, ask for another
  and sign in with what the screen shows then, and took out a node assertion that
  read a fresh provider's `mockCode` and could not fail. Its roast filed this card,
  since no test reads `mockCode` off the provider that sent the code, and
  **KN-466**, since nothing makes a resend's code differ from the first. That one
  owns deterministic codes and the first code no longer signing in; this card does
  not touch it.
- **The node project cannot see it**: `AuthProvider.test.tsx` renders with
  `renderToString`, once, so a code sent after that render is never observed.
- **The shape already in the repository**: `Core/PreferencesProvider`'s stories
  put a probe inside the stories file, where coverage does not reach, reading the
  context and writing what it holds into `data-testid` spans, and render the
  provider from the story.

## The approach

1. **`core/auth/AuthProvider.stories.tsx`**, titled `Core/AuthProvider`: a
   provider of its own around the real `AuthScreen` and a probe beside it, the
   probe reading `useAuth()` and writing `mockCode` into a `data-testid` span.
   The provider is the story's own, inside the one the preview wraps every story
   in, so the screen and the probe read the same one.
2. **One play, in Persian and in English**: type a number and press the screen's
   own send; the probe then holds a code of five digits and the screen's code span
   shows exactly it; press the screen's own resend; the probe's code and the
   screen's are again the same. Nothing asserts the two codes differ, which two
   random codes need not, KN-466.
3. **Docs** in both languages, as the preferences provider's are: what the probe
   is for, and the two stories.
4. **The note KN-462 left in `AuthProvider.test.tsx`**, saying where a sent code is
   covered instead, points at this story.

## The tests

- **Red first**: the play fails if the probe or the screen shows nothing, or if
  they differ. To show it can fail at all, a plant makes the screen draw a
  different value than the provider holds, the code with its last digit changed,
  and the story fails after the send; a second plant makes the resend leave the
  screen showing the first code while the provider moves on, which fails it after
  the resend.
- The sign-in's own stories, and the unit project with its docs guard, still pass.

## Files

- `apps/web/src/core/auth/AuthProvider.stories.tsx`, new.
- `apps/web/src/shared/story-docs/en/Core-AuthProvider.md` and
  `apps/web/src/shared/story-docs/fa/Core-AuthProvider.md`, new.
- `apps/web/src/core/auth/AuthProvider.test.tsx`, the note.

## What I am unsure of

- **The second plant** has to make a screen that lags the provider; `AuthScreen`
  reads `auth.mockCode` in its render, so the plant keeps the first code it saw in
  a ref and draws that, which is the defect the story exists to catch.
- **A probe beside the screen** reads the provider in the same render as the
  screen does. What it adds is that the value is read from the provider by name,
  not from the markup, and compared with what the markup shows, which is what the
  exit asks for.
- **The docs guard reads a meta's component's props**; a probe wrapper with no
  props should owe no Props entries, and the guard will say if it does.

## Plan review, Codex, 2026-09-14

Codex approved the plan for the literal exit: the probe reads the nearest, inner
provider, so it does catch a screen that changes, drops or keeps an old code. Taken
from it, each checked against the code:

- **A shown code the provider will not accept passes the probe.** `mockCode` is
  state, `sent?.code`, while `verify` checks the ref `pending.current`; `send` sets
  both, but a defect that moved `sent` and left `pending` would show a code the
  provider refuses, and a comparison of the two reads would not see it, since a ref
  changing does not render. The why is that the code on the screen is the code the
  provider will accept, so the play ends by signing in with the code the screen
  shows after the resend, and the name step must come. Accepting the code of a
  first send is already proved by the sign-in's `EnterFinishesTheStep`, which reads
  the code off the screen and signs in with it.
- **The title has to be registered**: `shared/story-docs/story-meta.ts` lists every
  story title in `StoryTitle`, and `Core/AuthProvider` joins it, or the meta's
  `satisfies StoryMeta` fails.
- **The plants are deterministic.** A plant that keeps the first code on the screen
  only fails when the second random code differs, so each forces the difference: the
  screen drawing the code with its last digit changed, from the send; the screen
  doing so only after its resend button is pressed; and the provider's resend
  setting `pending` to a code other than the one it shows, which the final sign-in
  must catch.
- **The home is right**: the story tests the provider's contract, importing the
  screen is what that needs, and a story's import makes no dependency of `core` on
  `screens` in what ships.

## Result, 2026-09-14

- **Not red first, by design.** The screen already draws the provider's code and
  the provider already accepts it, so the story passes on today's code; what shows
  it can fail is the three plants below. The card is a missing test, not a defect.
- **The story.** `Core/AuthProvider`, in Persian and in English: the real sign-in
  screen and a probe reading `useAuth()` under one provider of the story's own.
  After the send and after the resend it waits until the probe holds the exact code
  the mock logged, since a render can lag the send, finds the screen showing exactly
  that, and ends by signing in with the code the screen shows. The title joins
  `StoryTitle`, KN-462's note in `AuthProvider.test.tsx` points here, and the docs
  are in both languages.
- **The meta** first named the probe wrapper as its `component`, and the docs
  guard found no component by that name: react-docgen reports nothing for a wrapper
  that takes no props. It renders the wrapper with `render` instead, as the network
  page's stories do for the same reason.
- **Plants**, deterministic, each restored byte for byte, checked by hash: the
  screen drawing the code with its last digit changed failed the comparison after
  the send, line 70; the screen changing it only after its resend button failed the
  comparison after the resend, line 77; and the provider keeping aside a different
  code from the one it shows failed the sign-in, line 84, where the name step never
  came. They ran before the meta took `render`, which changes neither the tree nor
  the play.
- **The rest.** The two stories pass; tsc and lint are clean; the new story and
  the two edited files are formatted; the web unit project passes, 1381, the docs
  guard among them.
