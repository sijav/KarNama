# KN-560 - App/Shell's SignedInInAnotherTab fails in the published Storybook: the name step never appears

## The card

**Why**, from the board: A failed interaction on the shell's page in the published
Storybook tells whoever reviews the sign-in flow there that a working flow is
broken, and KN-226's check cannot guard the story until it holds.

**Exit condition**, from the board: SignedInInAnotherTab's play passes in a
production Storybook opened in a browser, bare and inside the manager, and still
passes in the Vitest runner, with the cause named at the close.

It blocks KN-226.

## What is there, read on 2026-09-15

- **The story**, `App.stories.tsx` line 529: the meta's decorator seeds an
  `AuthProvider` with a named reader; this story's own decorator puts an unseeded
  `AuthProvider` inside it, so the shell shows the sign-in screen. The play checks
  the number field, writes another tab's first-login session to the story's own
  storage under `karnama.session`, dispatches the `storage` event another tab's
  write would deliver, and waits for the name field.
- **The providers**, `AuthProvider.tsx` lines 137 to 150 and `RecordsProvider.tsx`
  around line 161: each listens for `storage` from a `useEffect`, a passive effect.
- **KN-419's plan**, `core/records/#KN-419 ....md`, built these listeners and
  this story, and proved the app's own wiring with `e2e/two-tabs.spec.ts`.

## Measured, 2026-09-15

On a production Storybook of bb953c8, opened headless, bare at `iframe.html`:

1. **What the page shows when the play gives up**, and four seconds later: the
   number step, «شماره موبایل», and nothing else.
2. **What it holds**: the story's own storage, not the real one, with
   `karnama.session` as the play wrote it, `{"phone":"09120000000","name":"",
   "since":"2026-09-12T00:00:00.000Z"}`. Four storage listeners were on the window,
   and none had heard the play's event. **The same event dispatched again from
   outside the play** reached all four, and the name step, «اسم و فامیل», was on
   screen 1.5 seconds later. So the providers and the stored session are right.
3. **The order, timed from the page's start**, by wrapping `addEventListener`,
   `removeEventListener` and `dispatchEvent` before the page's scripts ran:
   - `SignedInInAnotherTab`: the play dispatched `karnama.session` at **330 ms with
     0 listening**; the four listeners were added at **341 ms**.
   - `SignedOutInAnotherTab`, which passes: listeners at 310 ms, its dispatches at
     319 and 365 ms with 3 listening.
   - JobsScreen's `ChangedInAnotherTab`, which passes: listeners at 320 ms, its
     dispatches at 343 and 404 ms with 3 listening.

**The cause**: the play dispatches before the providers' passive effects have
added their listeners. In the Vitest runner a story renders under React's `act`,
which runs those effects before the play starts; a production canvas renders
without it, and React runs them in a task of its own, 11 milliseconds after this
play's dispatch. The event is not repeated, so it is lost. The other two stories
pass by 9 and 23 milliseconds.

## The approach

1. **A mark that the story's effects have run.** The story's decorator renders a
   `Listening` span beside the story, inside the unseeded provider, whose own
   `useEffect` sets the span's `hidden` property. React runs every passive effect
   of a commit in one pass, the span's and the providers' together, before
   anything else can run, so once the play sees the span hidden, the listeners
   from that commit are on the window.
2. **The play waits for the mark** before it writes the session and dispatches the
   event, and changes nothing else.
3. **The docs**, English and Persian: the story's entry says it waits until the
   shell is listening before another tab's sign-in arrives, since an event nobody
   listens for is lost.

## How I will know it works

- Red before: the measurement above.
- Plant: the wait taken out, the story fails again in a production build, where
  it failed before; restored by hash.
- App/Shell's stories under Vitest, the unit project, eslint, tsc, the docs guard.
- A production Storybook of the change: `app-shell--signed-in-in-another-tab`
  opened headless, bare and inside the manager, with no failure event and no
  console error, and the order timed again: the dispatch after the listeners.
- A look at the story in both languages and both schemes.

## What I am unsure of

- **Whether a whole commit's passive effects run in one pass** before a task the
  play queues. React's own flush does, in the builds this repository ships; if it
  ever split them, the mark could come before a provider's listener.
- **The two stories that pass by 9 and 23 milliseconds.** They race the same way
  and a slower machine could lose it. They are not this card's exit, so they
  become a card of their own, which can reuse the mark.
- **A mark drawn in the story's DOM.** An empty span beside the shell, hidden once
  the effects have run; it takes no room and no one reads it.
- **Other ways considered.** Dispatching again inside a `waitFor` until the name
  step appears works, since the providers take the same session in more than once
  harmlessly, but it repeats an event another tab sends once, a side effect in a
  retry loop. Waiting a frame or a timeout guesses at when React runs its effects.
  `act` exists only in React's development builds.
