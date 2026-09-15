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

## Replanned, 2026-09-15

The six cards that blocked this one are closed: KN-494, KN-554, KN-560, KN-561,
KN-562 and KN-563. The review's points are taken, and so there is no list of
known failures: a story that errors fails the check.

1. **No new dependency.** `@playwright/test` 1.62.1 is installed and already runs
   the e2e suite; `@storybook/test-runner` would bring Jest and needs the owner's
   yes to install. The check is a Playwright spec.
2. **A static server of its own**, `e2e/storybook/serve.ts`, run by Node 24 as it is,
   types stripped: it serves `storybook-static` under `KARNAMA_STORYBOOK_BASE`, or
   `/`, answers 404 outside it, and before it listens refuses a build whose
   `iframe.html` asks for files it does not hold under that base, naming how many
   and the first three, and a directory with no `index.json`. Measured with a draft:
   the build for `/KarNama/storybook/` served under another base, and a directory
   with no build, each stopped at once with its message and exit 1.
3. **Playwright's `webServer`**, not a global setup: `playwright.storybook.config.ts`
   starts the server on a port of its own, 6106, with `reuseExistingServer` off, so a
   server left from another build is never the one checked; the base reaches it
   through the config's `env`, from Node, since Git Bash rewrites a value that
   starts with `/`, measured again today on `/` itself. One Chromium project, fully
   parallel, no retries, a timeout of 120 seconds a story, the list reporter here
   and GitHub's with HTML under `playwright-report/storybook` in CI.
4. **The check**, `e2e/storybook/published.spec.ts`: one test per story in
   `index.json`, titled by its id; Docs pages are left out, since `docsRendered`
   does not wait on the stories inside and the exit names stories. Before the
   page's scripts run, an init script defines `__STORYBOOK_ADDONS_CHANNEL__` with a
   setter that subscribes as Storybook assigns it, as `agent/scripts/verify/KN-245.mjs`
   did, to `storyFinished` and to `playFunctionThrewException`,
   `unhandledErrorsWhilePlaying`, `storyThrewException`, `storyErrored` and
   `storyMissing`. Console errors and page errors are recorded. The test opens
   `iframe.html?id=<id>&viewMode=story`, waits for `storyFinished` or a failure,
   settles 400 milliseconds, and fails listing every failure event and every error,
   or saying the channel was never assigned, or that the story never ended.
   `storyFinished`'s status is not read.
5. **Kept out of `npm run e2e`**: `playwright.config.ts` ignores `storybook/**`.
6. **A script**, `check:storybook` in `apps/web/package.json`: `storybook build`, then
   the config.
7. **The workflow**: `KARNAMA_STORYBOOK_BASE` moves to the `build` job's `env`, read by
   the Storybook build and the check; after "Build Storybook", Chromium is installed
   with its system dependencies and the check runs against the build the job made,
   before the sites are assembled and uploaded, so a failure publishes nothing and
   Pages keeps serving the last good site; its report is uploaded when it fails.
8. **Records**: `AGENTS.md` section 5 names the check.

### How I will know it works

- The check passes on today's tree, every story.
- **The card's mutation**: the Checkbox `Hover` story's test-runner guard taken out,
  Storybook built, and the check run for that story fails naming the import error;
  restored by hash and built again.
- **A console error** said by a story as it renders, and **a play that throws after
  an await**, each fail the check naming it; restored by hash.
- A build under another base stops the run before any story, said.
- lint, tsc, and `npm run e2e -- --list` not listing the new spec.
- After the push, the Pages run is read to its end.

### Measured before building, 2026-09-15

A production build of 76beef5 under `/KarNama/storybook/`, the base set from
PowerShell, and the first probe opening every entry bare, six at a time, with 120
seconds each: the 73 files `iframe.html` asks for loaded under the base, and the
429 entries, stories and Docs pages, took 132 seconds with **none erroring**, no
failure event, no console error, no page error. The median entry took 1.4 seconds,
and Input's `Multiline` 40.2. `storyFinished` said `error` 37 times, the
accessibility addon's reports, which this check does not read, KN-063's.

### Replan review, Codex, 2026-09-15

Sound, with one correction, taken. The Playwright spec against the build the job
already made is the simplest honest way without a dependency; `webServer` on its
own port with no reuse fails rather than check some other server; an init script
runs before the page's scripts, so the setter hears Storybook assign its channel,
and the six event names are the runtime's own; the Hover mutation proves the
failure the exit names; Docs pages stay out.

**The correction**: the plan said two cores, and Playwright's default is half the
logical cores, so on two it would be one worker and about 13 minutes. The
repository is public, where GitHub's `ubuntu-latest` runner has four, so two
workers by default, and the 132 seconds measured six at a time here suggest about
seven minutes there, an estimate until the first run. `workers` is left at its
default rather than raised before a run has shown four Chromium pages stable
there.

**The detail**: the check hears a story until `storyFinished` and for the 400
milliseconds after it; an error a story schedules later than that is not heard,
and the spec says so rather than claim more.

## Put back, 2026-09-15

Built as the Replanned section says, items 1 to 8, and run before any commit.

**What the check measured.** On the production build of 76beef5 above, at
Playwright's default workers, half of this machine's 32 threads: 377 stories
passed and SearchBar's `Debounced` failed, its play throwing `expected "onSearch"
to be called 1 times, but got 0 times`. Alone, at one worker, it passed 10 of 10.
The stories of the five files that write their args back while they play,
ColorPicker, Input, SearchBar, SettingsDialog and Tabs, each run six times at the
default workers: `Debounced` failed 6 of 6 and the other 360 passed. The probe
above ran six at a time and saw nothing, so the load is what shows it.

**Why.** KN-563's mechanism, in a story KN-563 did not touch. Each keystroke writes
the args back through `useArgs`; the preview renders the story again at once while
it plays, `rerender` in Storybook 10.5.10's runtime; that render runs the loaders
again, and `resetAllMocksLoader` calls `mockRestore` on every `fn()`, which wipes
its calls. The search runs 300 ms after the last key, so when the last key's render
lands later than that, the call is gone before the play reads it. Filed as
**KN-584**, which blocks this card: wired in as it stands, the check would stop
Pages deploys, the app's with them, whenever the runner is busy.

**Found in the check itself.** The spec read `STORYBOOK_DIR` against the working
directory, so the config named from the repository root found no build and no
tests; `serve.ts` was changed to resolve from `apps/web`, the spec not yet. To fix
on return.

**Taken out of the tree and saved**, a patch and a tarball in this session's
scratchpad under `kn226-work`: `e2e/storybook/serve.ts`,
`e2e/storybook/published.spec.ts` and `playwright.storybook.config.ts`, new; and
`playwright.config.ts`'s ignore, the `check:storybook` script, `pages.yml`'s job
env and three check steps, and the `AGENTS.md` section 5 line, changed. The patch
applied cleanly to the reverted tree. Still to do then: the spec's path, prettier
on the two new e2e files, the Hover mutation, the console error and the throw
after an await, the other base, and the Pages run.

## Replanned again, 2026-09-15

KN-584 is closed (080f4b4), and the saved code is back in the tree. Its probe
changed two things in that code; the rest of the Replanned section stands.

1. **The build is named from `apps/web`.** `published.spec.ts` read `STORYBOOK_DIR`
   against the working directory, so the config named from the repository root
   found no build and no tests, measured. It resolves from its own directory, two
   up, as `serve.ts` does, and a missing build still fails the run as it loads.
2. **A story ends when its play has.** A play that writes its args says
   `storyFinished` for each render that causes: SearchBar's `Debounced` and Input's
   `TypingIntoABoundValue` said it before their plays ended in 10 runs of 10. So the
   first `storyFinished` is not the end, and a failure later than it and the 400
   milliseconds after goes unheard. The init script also hears
   `storyRenderPhaseChanged`. When a `playing` phase came, the story ends at a
   `storyFinished` after the phase `played` or `errored`; with none, at the first
   `storyFinished`; and at once on a failure event. The 400 milliseconds stay.
3. **KN-585 is not a blocker.** Input's `TypingIntoABoundValue` fails with the CPU
   slowed four times and passed slowed twice. If the check's first run on
   `ubuntu-latest` fails on it, that card blocks this one; nothing is let through.

### How I will know it works, again

- From the repository root, `--list` names every story of the build.
- On the build of 080f4b4, today's stories, the check passes every story at the
  default workers, from `apps/web`, its workers line recorded.
- **One mutated build carrying three plants.** The Checkbox `Hover` story's
  test-runner guard is taken out, the card's mutation. A `console.error` is added
  to a story's render. And `Debounced`'s play throws 1.5 seconds after its last
  assertion, later than its first `storyFinished` and 400 milliseconds. The saved
  spec, before its end is changed, runs `Debounced` on that build and should pass it,
  not hearing the throw. The changed spec runs the three and fails each, naming the
  import error, the console error and the throw. Restored by hash, and built again.
- The check run under a base other than the build's stops before any story, said.
- lint, tsc, prettier on the two new files, and `npm run e2e -- --list` not listing
  the spec.
- After the push, the Pages run is read to its end.

### Second replan review, Codex, 2026-09-15

`gpt-5.6-terra` at medium, `gpt-5.6` being out of usage for four more minutes.
Sound, and not to gate Pages until it is built: the spec in the tree is still the
saved one, which it read, and which ends at the first `storyFinished` and resolves
the build from the working directory; `--list` from the repository root failed on
`<repo>/storybook-static/index.json`, and listed 378 from `apps/web`. The phase end
is right, read against `runPhase`, `played`, `playFunctionThrewException`,
`storyThrewException` and `storyFinished` in the runtime: it covers a story with
no play, a render that throws, a play that destructures `mount` and one that writes
its args, failure events still end at once, and the test's timeout bounds it. It is
the runtime's internal contract, not a documented API, so the pinned Storybook and
the mutation matter. `import.meta.dirname` is stable in Node 24. The mutated build
proves the paths it plants, not every future change to the channel. Taken:

1. **The wait's timeout** is what is left of the test's, measured from the test's
   start less a margin, not the whole timeout less ten seconds, since the page's
   load is spent from the same budget.
2. **The bound is said**: no finite check hears every later error. This one hears
   a story until its play has ended and 400 milliseconds more; the spec, the
   `AGENTS.md` line, the card's note and the close say so.

## Result, 2026-09-15

Built as the Replanned sections say, and measured on production builds made under
`/KarNama/storybook/` from PowerShell.

- **The build is found from anywhere.** `--list` from the repository root named
  378 tests. The main e2e config lists 98 in 13 files, none from `e2e/storybook`.
- **Today's stories pass.** On the build of 080f4b4: "Running 378 tests using 16
  workers", 378 passed in 2.1 minutes.
- **Another base stops the run.** Under `/other/`, `serve.ts` refused before any
  story: "This build was not made for /other/: 72 of the 73 files its iframe.html
  asks for are not under it", three of them named. The run ended with the web
  server unable to start, exit 1.
- **One mutated build with three plants**, each found in its built bundle. The
  saved spec, which ends at the first `storyFinished`, ran `Debounced` and passed
  it in 1.4 seconds, not hearing the throw planted 1.5 seconds after its last
  assertion. The changed spec ran the three and failed all three, naming each:
  - Checkbox `Hover`, the card's mutation: `playFunctionThrewException` and
    "vitest/browser can be imported only inside the Browser Mode. Instead, it was
    imported outside of Vitest."
  - `Debounced`: `playFunctionThrewException` and "KN-226 planted: a throw after
    an await".
  - StatusChip `Default`: "KN-226 planted: a console error as the story renders",
    twice.
- **Restored.** The three story files were checked out again, and their hashes
  match the ones recorded before planting: 3b6dd4c, 6ee4d84 and cfab005. Storybook
  was built again from them.
- **Clean.** eslint and tsc are clean. The three new files have formatter drift 0;
  the plan and `AGENTS.md` keep HEAD's.
- **Records.** `AGENTS.md` section 5 names the check and what it hears; section 7
  says where a play ends.
- **On `ubuntu-latest`**, the Pages run for c4e8128, read to its end after the push:
  Chromium installed in 22 seconds, "Running 378 tests using 2 workers", "378
  passed (6.5m)", the report step skipped, and the site deployed. Input's
  `TypingIntoABoundValue`, KN-585's, passed there.
