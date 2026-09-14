# KN-226 - Nothing committed checks that the published Storybook renders its stories without errors

## The card

**Why**, from the board: Storybook is where the components are delivered, and it
is public. A story that throws in the published build is a broken component page
in front of whoever opens it, and nothing between a push and that page would say
so. Critical on the owner's order of 2026-09-10: it guards the component library.

**Exit condition**, from the board: A committed check builds Storybook for
production, opens every story in headless Chromium, and fails on any page error or
console error; it runs before the Pages workflow publishes; and a mutation removing
the Hover story's test-runner guard makes it fail on the emitted import error.

## What is there, read on 2026-09-14

- `.github/workflows/pages.yml` has one `build` job: `npm ci`, the app's build, the
  Storybook build with `KARNAMA_STORYBOOK_BASE=/KarNama/storybook/`, the two sites
  assembled into one artifact, a check that both index files exist, and the upload;
  `deploy` needs `build`. Nothing opens a story.
- The `storybook` Vitest project runs every story in Chromium against the DEV
  build. The production build differs: React's production bundle, Vite's output,
  and the base path.
- The production build keeps `await import('vitest/browser')` as a bare specifier
  in the 22 story chunks that drive the runner's pointer or keyboard, Checkbox's
  among them. A browser cannot resolve a bare specifier with
  no import map, so a story that reaches that line in the published canvas throws;
  the `__KARNAMA_STORY_TEST__` guard is what keeps it from reaching it.
- KN-522's scratch script heard a published story end on Storybook's channel,
  `window.__STORYBOOK_ADDONS_CHANNEL__`: `storyFinished`, and
  `playFunctionThrewException` when a play function throws, which Storybook also
  logs as a console error. It heard IconButton's `BlankName` fail that way, KN-554,
  and that story's `storyFinished` still said `success`.
- Storybook 10.5.10's preview runtime, `node_modules/storybook/dist/preview/runtime.js`
  read at lines 35557 to 35620 and 36277 to 36291, says why. A story loads, runs its
  `beforeEach`, mounts, and plays while listening for the window's `error` and
  `unhandledrejection`. A play that throws emits `playFunctionThrewException`, and is
  rethrown unless `throwPlayFunctionExceptions` is false, in which case it is logged
  with `console.error`; errors heard while playing emit
  `unhandledErrorsWhilePlaying`. Then it waits for animations, emits
  `storyRendered`, runs `afterEach`, and emits `storyFinished` with a status that is
  `error` only for unhandled errors or a failed report. So `storyFinished` comes
  after everything the play function does, and its status cannot be trusted to
  carry a thrown play. A docs page emits `docsRendered` when its container's render
  resolves, which does not wait on the stories drawn inside it.
- A production build of today's tree under `/KarNama/storybook/` has 423 entries in
  its `index.json`: 372 stories and 51 docs pages.

## Measured before planning

**The first probe measured nothing, and why is a design input.** A scratch script
served a production build under `/KarNama/storybook/` and opened all 423 entries,
six at a time. Every entry timed out after 30 seconds on 404s, 2137 seconds in all:
the build had been made from Git Bash with `KARNAMA_STORYBOOK_BASE=/KarNama/storybook/`,
which Git Bash rewrote into `/Program Files/Git/KarNama/storybook/` before Storybook
saw it, so `iframe.html` asked for its scripts under a base the server never served.
Two things follow for the check: a build made for the wrong base must fail in
seconds with that said, not in 423 timeouts, so the global setup fetches every
script and stylesheet `iframe.html` names before any test starts; and the base
reaches the build and the server from one place, not from a shell line.

**The second probe**, 2026-09-15, the base set in Node's own environment: the 73
scripts and stylesheets `iframe.html` names loaded through the server, and the 423
entries took 115 seconds six at a time, the median entry 1.3 seconds. Twelve had an
error:

| Entry | What it said | On the board |
| --- | --- | --- |
| AddJobModal `Review`; JobModal `Note`, `ChangeStatus`, `SaveAndDelete`, `StartsOverForAnotherRecord` | `onSave` never called | KN-494, the date saved as text, which fails these five in the runner too; inside the manager `Review` fails first on its size, KN-559 |
| IconButton `BlankName` | the story's spy saw no report, which the console carried | KN-554 |
| IconButton's Docs page | the same report, said on the page | KN-554, whose exit now names it |
| Button `States` | 0 forced cells counted in the first frame, where 45 are asserted | KN-561 |
| Input `ControlsMatchTheCanvasInEnglish` | the label stayed «عنوان شغلی» | KN-562; TECH-DEBT 16 keeps that half out of the runner |
| App/Shell `SignedInInAnotherTab` | no field labelled «اسم و فامیل» | KN-560 |
| SettingsDialog `Preferences` | `onLocaleChange` never called with `fa-IR` | KN-563 |
| Input `Multiline` | no end within 30 seconds | none: the probe's budget, below |

Run again one at a time, 120 seconds each, eleven failed the same way and
`Multiline` passed in 23.8 seconds: the eleven are not the load of six at a time,
and `Multiline`'s failure was the probe's 30 second budget, not the story.

**Inside the manager**, `index.html?path=/story/<id>` as a reader opens a story,
one at a time: the same eleven failed and `Multiline` passed, in 56.9 seconds
there. Ten failed on the same assertion; AddJobModal `Review` failed earlier, on
its size, `[560, 316]` where it asserts `[560, 606]`, the manager's canvas being
shorter than a bare page. So the eleven are what a reader of the published
Storybook meets, and the bare `iframe.html` is a faithful stand-in for them at
about half the time, 40 seconds against 79 for the twelve.

**The 35 entries whose `storyFinished` said `error`** had nothing on the console.
Opened again with the payload's reports read, 34 carried the accessibility addon's
check as failed: colour contrast on 31, a button with no name on 2, the
PreferencesProvider's two stories, and a dialog with no name on 1, AddJobModal's
`Loading`. The Tooltip's `DescribedAtFocusInPersian` reported no violation that
time. None of it is a page error or a console error, so this card's check does not
read it; KN-063, the accessibility gate, carries the list as a note.

**The app itself**, since the SettingsDialog story fails where the app's Settings
changes the language: `e2e/settings.spec.ts`, which changes it through the same
Select, passed against the app's production build on 2026-09-15.

## The approach

1. **A static server for a built Storybook**, `e2e/storybook/serve.ts`: serves a
   build directory under the base it was built for, `KARNAMA_STORYBOOK_BASE` or
   `/`, and answers 404 outside it, so a build made for the wrong base fails here
   as it fails on Pages. No dependency: `node:http`.
2. **Global setup**, `e2e/storybook/global-setup.ts`: refuses with a plain message
   when the directory has no `index.json` ("build Storybook first"), starts the
   server on a free port on 127.0.0.1, fetches every script and stylesheet
   `iframe.html` names through it and refuses, naming the first that does not
   load, when the build was made for another base, hands its address to the
   workers through the environment, and returns the teardown that closes it. Measured with
   Playwright 1.62.1 on 2026-09-14 in a throwaway config, since deleted: an address
   put in `process.env` by the global setup reached four tests across two workers,
   each fetching from that server, and the function the setup returned ran after
   them as the teardown. No fixed port, so no `reuseExistingServer` serving some
   other build.
3. **The check**, `e2e/storybook/published.spec.ts`: reads `index.json` as the file
   is collected and declares one test per entry, stories and docs pages, titled by
   the entry's id so a failure names it. Each runs in Playwright's own fresh
   context: before the page's scripts run it subscribes to the channel for
   `storyFinished`, `docsRendered`, `playFunctionThrewException`,
   `unhandledErrorsWhilePlaying`, `storyThrewException`, `storyErrored` and
   `storyMissing`; it records every console message of type error and every page
   error; it opens `iframe.html?id=<id>&viewMode=story` or `viewMode=docs`; it waits
   for the entry's end event or a failure event, then a settle for errors that
   land after it, the probe's 0.4 seconds, or 1.5 for a docs page, whose stories
   draw after `docsRendered`; and it fails listing everything it heard. It reads no status off
   `storyFinished`, which says `success` over a thrown play; the failure events and
   the console carry that. A channel that never
   appears fails the entry with that said, so a Storybook upgrade that renames the
   global fails loudly rather than passing.
4. **Its own Playwright config**, `playwright.storybook.config.ts`: `testDir`
   `e2e/storybook`, one Chromium project, fully parallel, the list reporter
   locally and GitHub's with HTML in CI. `playwright.config.ts` ignores
   `e2e/storybook`, so `npm run e2e` does not pick it up.
5. **A script**, `check:storybook` in `apps/web/package.json`: `storybook build`,
   then the config, so one command builds for production and opens every entry.
6. **The workflow**: `KARNAMA_STORYBOOK_BASE` moves from the build step to the
   job, so the build and the check read one value; after "Build Storybook",
   Chromium installed with its system dependencies, then the config run against
   `apps/web/storybook-static`, then the Playwright report uploaded if it failed.
   The app's build reads `KARNAMA_BASE`, not this variable, so the move changes
   nothing for it. It sits before the assembly and the upload, so a failure publishes
   nothing and Pages keeps serving the last good site. The step reuses the build
   the job already made rather than building twice.
7. **Records**: `AGENTS.md` section 5 names the check; `TECH-DEBT.md` carries
   anything held back, below.

## How I will know it works

- On today's tree the check passes, the eleven on its list failing as listed.
- **An entry put on the list that passes** fails the check, naming the entry and
  its card, so the list cannot keep a story that has been fixed.
- **The card's mutation**: the Checkbox `Hover` story's test-runner guard taken out,
  Storybook built, and the check run for that entry fails naming the import error.
  Restored by hash.
- **A story that says a console error as it renders** fails naming the message.
- **A play function that throws after an await** fails on
  `playFunctionThrewException`.
- **A build served under another base** stops in the global setup, in seconds,
  naming the first asset that did not load.
- lint, tsc, and `npm run e2e -- --list` not listing the new spec.
- After the push, the Pages run on GitHub is read to its end: the new step passes
  and the site deploys.

## What I expect to be hard, and what I am unsure of

- **What the check does to the deploy.** One job builds both sites into one
  artifact, so a failing entry stops the app's deploy as well as Storybook's, and
  Pages keeps serving the last good site. That is what the card asks, a check
  before publishing, and it stays that way: a separate job the deploy needs would
  stop the same deploy.
- **The entries that fail today.** The check fails on any entry that errors, with
  one committed exception, `e2e/storybook/known-failures.ts`: each entry named with
  the card that carries it, and the check fails when a named entry stops erroring,
  so the list only shrinks and nothing on it rots unseen. Without it, the first
  push after this lands stops every deploy until those stories are fixed on cards
  of their own, KN-494's five among them, which would make a Storybook story the
  gate on the app's deploys; with it, a new failure stops the deploy and a known
  one is a card. The list goes in `TECH-DEBT.md` with the check that retires it,
  as `AGENTS.md` section 6 asks. It starts with the eleven, every one of which a
  reader meets inside the manager as well: KN-494's five, AddJobModal `Review` and
  JobModal `Note`, `ChangeStatus`, `SaveAndDelete` and `StartsOverForAnotherRecord`;
  KN-554's two, IconButton `BlankName` and its Docs page; App/Shell
  `SignedInInAnotherTab`, KN-560; Button `States`, KN-561; Input
  `ControlsMatchTheCanvasInEnglish`, KN-562; and SettingsDialog `Preferences`,
  KN-563.
- **Time.** An entry may take up to 90 seconds: `Multiline` types twenty lines and
  took 23.8 seconds alone. Four workers on the runner; the local 115 seconds at six
  suggests three to four minutes there, an estimate until the first run, plus the
  Chromium install. Pages runs on every push to main, board commits included, and
  each of its last six runs took 1 minute 3 to 1 minute 17 seconds, so every run
  grows by those minutes.
- **Docs pages.** The card says stories; a Docs page is where a reader of a
  component lands first, and it renders every story of that component. Included:
  the measurement opened all 51, and the one that failed, IconButton's, failed on
  a real report.
- **What production cannot hear.** React's production bundle says nothing about
  keys, act or props, so the check cannot catch what KN-401's guard catches in the
  runner. Searched: no asset of today's production build carries the text of
  React's duplicate key warning, so the note on this card about the `job-10` key is
  a dev warning this check will not see.
- **Flake.** A story that fails only sometimes in production would stop a deploy
  only sometimes. No retries: an entry that fails once is shown that time and
  becomes a card like any other, where a retry would hide it.
- **What opening an entry bare does not meet.** The check opens `iframe.html` at
  Playwright's default 1280 by 720, where the manager gives a story less room:
  AddJobModal's `Review` gets past its size assertion bare and fails on it inside
  the manager. A story that needs more room than the manager leaves is its own
  card, not something this check can see.
- **What it does not read.** The accessibility addon's failed reports, which
  Storybook counts in `storyFinished`'s status and prints nowhere, are KN-063's.
- **A private global.** The channel global is Storybook's own, not an API; the check
  fails every entry loudly if it goes.

## Plan review, Codex, 2026-09-15

Written to `%TEMP%/claude-roast/2b1874631dd1/20260914T222308-plan-kn-226-nothing-committed-checks-that-the-publish-deac8d.md`.
Judged against the code and the measurements above:

- **The list of known failures contradicts the exit condition. Real.** The card
  fails on any console error; a list that lets eleven through, and fails when one
  is fixed, is a different gate from the one the card sets. Wired as the card
  asks, the check stops every Pages deploy, the app's included, until the eleven
  are fixed. So the six cards carrying them, KN-494, KN-554 and KN-560 to KN-563,
  block this card, which goes back to the backlog, to be replanned from here when
  they are done. KN-559 does not block it: the check opens stories bare, where
  `Review` gets past its size.
- **The channel is not there when the init script runs, so the check hears
  nothing. Wrong as stated.** The probe's init script retries every 10
  milliseconds until the channel exists, and it heard 786 `storyFinished` events
  and the thrown play of every one of the eleven. The coupling to a private global
  is real and was already above; the replan hooks the channel with a property
  setter, as `agent/scripts/verify/KN-245.mjs` did, which attaches as Storybook
  assigns it rather than on the next retry.
- **`docsRendered` does not wait on the stories inside a Docs page. Real**, and
  said above; the 1.5 seconds was a guess. Docs pages come out of this card, whose
  exit condition says stories. IconButton's Docs page stays on KN-554, whose exit
  names it.
- **`@storybook/test-runner` against the static build, with `--failOnConsole`, is
  simpler. Weighed at the replan.** It is Storybook's own, runs play functions and
  has the console flag, but it brings Jest and a new dependency into a Vitest and
  Playwright repository, and installing it needs the owner's yes.
- **Playwright's `webServer` rather than a global setup. Weighed at the replan.**
  The review agrees the global setup works; a fixed port with `reuseExistingServer`
  off would do the same with less.
- **The per-test timeout has to be set, Playwright's default being 30 seconds.
  Real**: `Multiline` needs 24 seconds alone and 57 inside the manager.
