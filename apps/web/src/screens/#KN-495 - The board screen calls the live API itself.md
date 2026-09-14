# KN-495 · The board screen calls the live API itself, so its Adding story fails without a server

**Why, from the board.** A screen that reaches the network itself cannot be shown
or tested without a server, and its story now fails on every clean checkout.

**Exit condition, from the board.** JobsScreen takes onExtract as a prop that App
fills with extractJob; the Adding story passes a stub and passes with no
VITE_API_URL.

## What is there, read 2026-09-14

- **The screen reaches the network itself.** `JobsScreen.tsx` imports `extractJob`
  from `core/api` and hands it to `AddJobModal` as `onExtract`, so anything that
  renders the screen without a server fails the moment a link is read.
- **`extractJob`**, `core/api/client.ts`, sends the `extractJob` mutation through
  the Apollo client to `apiUrl`, which is `VITE_API_URL`, or empty when that is
  not set. This checkout's `apps/web/.env.local` sets it to
  `http://localhost:4000/graphql`, where nothing runs while the stories do. So
  here the Adding story fails on a refused connection, and on CI and in the
  Storybook build on an address that is not configured; either way the Review
  form never comes, and the story waits at line 516.
- **`AddJobModal` already takes the seam**: `onExtract: (source: string) =>
  Promise<Partial<JobDraft>>`, and its own stories pass `fn` stand-ins.
- **Who renders the screen.** `App.tsx` renders `JobsScreen` with `onSelecting`,
  `onSignOut`, `addOpen` and `onAddClose`. The e2e `add-job.spec.ts` drives the
  real app and answers `**/graphql` itself with `page.route`, so it keeps working
  whoever passes the extractor. `App.stories.tsx`'s `Navigating` opens the add flow
  and cancels without reading anything.
- **The screen's docs** list four props.

## The approach

1. **`JobsScreen` takes `onExtract`**, required, of the modal's own type, passes it
   through, and no longer imports `core/api`. Required, because a board that
   cannot read a posting is not the board the design draws, and a required prop
   makes every place that renders the screen say where reading comes from.
2. **`App` passes `onExtract={extractJob}`**: the shell is where the product meets
   the server, as its `apiErrorText` already does.
3. **The Jobs stories' meta** gains `onExtract`, an `fn` stand-in that gives back
   the link it was given, as the board's extractor did before the API, KN-042, so
   every story that opens the add flow reads without a server. The Adding story
   asserts it was called with the pasted link.
4. **The docs**, in both languages: `### onExtract`, and the Adding entry says the
   story's own extractor gives back the link.

## The tests

- **Red first**: the Adding story on today's screen fails at its wait for the
  Review form, run twice: once as the checkout is, with `.env.local`'s address,
  and once with `VITE_API_URL` set empty, which Vite keeps over the file, so the
  failure is the network's in both.
- **After**: the Adding story passes in both runs; the other Jobs stories and
  App's stories pass as before; and tsc refuses an App that does not pass the
  prop.
- **Plant**: the screen handing `extractJob` to the modal again, import and all,
  ignoring the prop, fails the Adding story again.

## Files

- `apps/web/src/screens/JobsScreen.tsx` and `JobsScreen.stories.tsx`.
- `apps/web/src/app/App.tsx`.
- `story-docs/en` and `fa`, `Screens-Jobs.md`.

## What I am unsure of

- **Required or optional.** Optional, with `extractJob` as its default, would
  leave App as it is, but the screen would still import the network, and a story
  that forgot the prop would reach it without a word. The card's exit asks for
  App to fill it, so required.
- **What the stand-in answers.** Giving back only the link matches what the story
  does next: it types the title, the company and the rest by hand. A richer answer
  would change what the story proves about the form.
- **KN-472's roast** is reading `JobsScreen.tsx` and its stories while this plan is
  written, so nothing is edited until it lands.

## Plan review, Codex, 2026-09-14

Codex approved the seam: a required prop typed from the modal's own `onExtract`,
filled by `App`, is the smallest correct change, where a provider would add a
dependency without stopping a direct import. `App` is the only renderer; its
stories open and cancel the add flow without reading; the Jobs docs page takes the
meta's stand-in; the e2e spec answers `**/graphql` itself. Taken from it:

- **An empty `VITE_API_URL` is not a missing one on this Windows checkout.** Codex
  ran Vite's own `loadEnv` after setting it empty, and it still returned
  `.env.local`'s address. So the red run above "with `VITE_API_URL` set empty" ran
  with the address after all, and it is not counted as a run without one. Red and
  green run as the checkout is, with `.env.local`; the runs with no address take
  `.env.local` out of the way for the run, confirm with `loadEnv` that no
  `VITE_API_URL` is left, and put the file back, checked by hash.
- **What the stand-in proves is that no extraction request is made**, not that
  nothing reads the address: `AddJobModal` imports `apiProblem` and `App` imports
  `apiErrorText`, both from `core/api`, so `client.ts` still reads the address and
  builds its Apollo client when the story loads, and fetches nothing.
- **The plant fails through the real request**, as the checkout is, with no change
  to the environment.

## Result, 2026-09-14

- **`JobsScreen.tsx`** takes `onExtract`, required, typed
  `AddJobModalProps['onExtract']`, hands it to the modal, and no longer imports
  `core/api`.
- **`App.tsx`** passes `onExtract={extractJob}`.
- **The Jobs stories' meta** hands the screen `fn(readsTheLink)`, which gives back
  the link it was given, and `Adding` asserts it was called with the pasted link.
- **The docs**, in both languages: `### onExtract`, and the Adding entry says the
  story's own reader gives the link back.

Red first, on the screen as it was: `Adding` failed at its wait for the Review
form, line 516, as the checkout is, with `.env.local`'s address; and again with
`.env.local` taken away for the run, when Vite's `loadEnv` saw no `VITE_API_URL`
and the process had none, the file put back byte for byte afterwards.

Green: `Adding` passes as the checkout is, and with no address at all by the same
check.

Plant, restored byte for byte: the screen importing `extractJob` again and handing
it to the modal fails `Adding` at line 517, the assertion that the story's reader
was called. That is one step before the wait for the Review form the review
expected, since the real reader is used and the stand-in never is.

Passing at the commit: the Jobs and App stories, 34 of 34, so the storybook project
no longer fails on `Adding`; the docs guard, 75; eslint and tsc clean;
`JobsScreen.tsx` and `App.tsx` formatted, as at HEAD, the stories file keeping the
four lines of drift it had at HEAD; the web unit project, 1382, run before any
browser run.
