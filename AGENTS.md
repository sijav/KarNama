# Working agreement: کارنما · KarNama

Instructions for any AI agent, and any human, working in this repo. Read this
before touching anything. The loop that drives the work is `agent/RALPH.md`, the
design contract is `DESIGN.md`, and the board is `agent/TODO_BOARD.md`.

---

## 1. What this product is

A job application tracker for a job seeker. The user adds an ad themselves, by
pasting a link or the text of it, the product structures it into a record, and
the record carries a status through the search: New, Applied, Interview,
Rejected, Offer, plus up to four the user defines.

**The value is the trail, not the listing.** Job boards already collect ads.
Nobody keeps the record of where you applied, when, and what came back. That
record is the whole product, and it is why the data compounds with time.

### Two scenarios, and the two that were cut

Scope was closed by the mentor's filters, and closed deliberately:

1. ~~Search for a job across boards~~ **cut**
2. ~~See aggregated ads from several sources~~ **cut**
3. **Organise.** The user adds an ad, gives it a status, and acts on it.
4. **Archive.** The user sees their saved ads with statuses, which gives them a
   view of the market and of their own position in it.

**Crawling job boards is out of scope, permanently.** It did not fall to a lack
of capacity, it failed filter 4, and a second person joining the team does not
bring it back. Anything that reintroduces scraping, aggregation or a feed of
ads the user did not add themselves is out, and reopening it is the owner's
decision, not a build decision.

Two additions the owner made on top:

- Third parties can leave comments or suggested changes, stored for later
  evaluation rather than applied.
- An admin panel over what users submit.

## 2. Shape of the repo

npm workspaces, one repo, because the GraphQL schema is the contract between the
two halves and a schema change has to fail at typecheck rather than at runtime.

```
apps/web        React 19, TypeScript, MUI, Apollo, Storybook, Vitest, Playwright
apps/api        NestJS, GraphQL code first, Prisma, Postgres
packages/graphql  the schema and the generated types both sides import
agent           the loop, the board and its tooling, the roast archive
```

**The board is the todo skill's database**, `.claude/todo.db`, committed, the
owner's choice of 2026-09-14. `todo` in these files means `node
~/.claude/skills/todo/todo.mjs` or `python ~/.claude/skills/todo/todo.py`, which
are the same tool. `agent/TODO_BOARD.md` is rendered from it with `todo render
--out agent/TODO_BOARD.md` and committed with it. `agent/board.json` is the
archive of the JSON board the loop ran on from 2026-09-07 until then, KN-482.

Deployment: the web app to GitHub Pages, the API to a Render free web service,
Postgres on Supabase. Render's free tier sleeps after 15 minutes, so the first
request after a nap takes roughly 50 seconds. That is a product constraint, not
a bug: the UI has to have an honest loading state for it and the app has to warm
the server on load.

## 3. Rules that are not negotiable

### Every task serves an objective, and the board keeps the objectives

The owner's, 2026-09-12. A board of four hundred cards says how much is left and
nothing about what is left before the product does its job, so the board carries
**objectives of its own**: records with an id, a name, a description and a
position in the order they are met. A task's objective is a **reference** to one
of them, checked when it is set and by `todo validate`: a name the board does
not hold is a typo pointing at nothing, not a new objective.

```bash
todo okr                                  # the objectives and what is left in each
todo okr add --name "..." --description "..."
todo okr done OKR-1                       # met; the next open one becomes current
todo set KN-123 --okr OKR-2               # which objective a task serves
```

The **current** objective is the first one still open, and `next` works through
it before it offers anything from a later one, whatever the severities say: what
the product needs first comes first. A task with no objective counts as current
work, because an unsorted card is something to do now.

**A roast's finding joins the objective in hand when it is small enough to fit,
under four story points; anything bigger goes to the next one.** The owner's
rule of the same day: a small fix belongs with the work it came out of, and a
large one is a project of its own that would stall what is shipping.

Which objectives exist, and which cards are in them, is the owner's to say and
changes with what they ask for. The rule above is how the board carries them.

### Components before screens

Every component is built and storybooked on its own before any screen composes
it. The owner said it directly. A screen assembled out of components that were
never reviewed in isolation is a screen nobody can review, and the states that
never got drawn are the ones that break in production.

**The owner's instruction of 2026-09-12 puts the screens first from here**: the
components exist, the pages are needed now, and a component that is missing or
broken for a page may be a **placeholder with a card behind it** rather than a
reason to stop. The rule above still holds for a component built from scratch.

### Match the design exactly

Not approximately, not in spirit. Every size, state, variant and token comes
from Figma. Where the code and the file disagree, Figma wins and `DESIGN.md`
gets corrected in the same change. A component missing one of its drawn states
is not finished. See `DESIGN.md` for the node ids and the full state lists.

### Every user-facing string goes through lingui, written in ENGLISH

**Message ids are English. Persian is a translation.** English is the source
locale, so the code holds English strings and `src/locales/fa-IR/messages.po`
holds the Persian. Never write a Persian string literal in a `.ts` or `.tsx`.

- Inside a component: `` t`…` `` from `useLingui()`, or `<Trans>` for JSX.
- Outside one, in module constants, thrown errors and fixtures: `` msg`…` ``
  from `@lingui/core/macro`, resolved at the call site with `i18n._(descriptor)`.

Enforced by `lingui/no-unlocalized-strings`, which catches any unlocalized
string, English included, so a bare English label fails exactly like a Persian
one. It runs with type information, so strings assigned to union types are
skipped automatically.

After adding strings: `npm run i18n:extract`, translate in the `.po`, then
`npm run i18n:compile`. **The fa-IR catalog must be 100 percent translated.**
The app defaults to Persian, so a missing translation shows English to a
Persian-reading user.

### Language and colour scheme are runtime settings

The app defaults to Persian and switches to English from a control in the
existing chrome, see `DESIGN.md` section 4 for exactly where it goes and why it
goes nowhere else. Switching flips direction too, so the Emotion cache, the MUI
theme direction, and `dir` and `lang` on `<html>` all move together.

Numbers and dates follow the locale through `useFormat()`. **Never call a
Persian-digit helper directly in a component.** Persian numerals are a property
of the Persian locale, and hardcoding them shows «۱۲» to an English reader.

### Never hardcode a colour, a spacing or a radius

Everything resolves through the theme, which is generated from the Figma tokens
in `DESIGN.md` section 1. If a component needs a value that is not a token, the
role gets added to the palette with a name. It does not get inlined.

The design defines **light values only**. Any dark palette is derived and has to
be labelled as derived in the code, so nobody later mistakes it for the
design's own.

### Documentation lives in markdown, never in the code

A `.ts` or `.tsx` carries code and the short comments that explain the code. It
does not carry documentation prose. Everything a Storybook Docs page prints, the
page description, each prop's description, each story's note, lives in
`src/shared/story-docs/{en,fa}/<slug>.md`.

No JSDoc above `const meta`, no docblock above a story export, no `description:`
inside `argTypes`. A guard test fails until both languages describe every prop
and story.

A file is its description, then `## Props` and `## Stories`, each `###` under
them one prop or one story. These fail the same guard, naming the file and the
line: another `##` section, a second `###` of one name, and an entry or text
outside every entry, KN-202; and, outside a fence, a line starting with one `#`
or with four to six and then a space, a tab or its end, a fence that never
closes, and an entry with no prose, KN-405.

No MDX either: Storybook indexes `*.stories.ts(x)` alone. No lint block reads an
`.mdx`, so a story or a docs page written in one would carry copy the lingui
rule never sees, KN-097; the docs pages are built from the story-docs markdown.

The line: **if it explains the code to whoever edits it, it is a comment. If it
explains the component to whoever uses it, it is markdown.**

### Prose in code files is English

Comments included. Persian belongs in the lingui catalog, in `story-docs/fa`, or
in the Persian readme. Quoting a Persian UI string inside an English comment is
fine and is often the clearest way to name what is being discussed.

### A synthetic Enter cannot prove a form submits, when the button is outside it

Implicit submission is the BROWSER's: pressing Enter in a field runs the
form's default button, the first submit button whose form owner is that form,
wherever it sits. testing-library stands that behaviour in by clicking a submit
button it finds INSIDE the form, so a modal whose action lives in a footer and
names the form by id, `form={id}`, looks broken to a synthetic Enter and works
in every real browser, KN-463.

Prove it with the runner's own keyboard, which is a real key event:

```ts
if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
const browser = await import('vitest/browser')
await browser.userEvent.keyboard('{Enter}')
```

The Browser pane cannot stand in for this either: its `type` action inserts
text without key events, so nothing reaches a keydown listener.

### A declaration the RTL plugin must not mirror says so with `@noflip`

Emotion runs `@mui/stylis-plugin-rtl` in Persian, and it mirrors every
declaration it understands: `direction: ltr` becomes `rtl`, `text-align: right`
becomes `left`. So a rule written to make a field of latin data run left to
right was flipped into the very thing it was fixing, KN-458, and the story
caught it as `expected 'rtl' to be 'ltr'`.

A declaration that must survive the mirror carries the plugin's own comment in
its value, which stylis reads and honours:

```ts
{ direction: 'ltr /* @noflip */', textAlign: 'right /* @noflip */' }
```

Only for content that is genuinely direction-bound: a phone number, an email, a
URL. Layout still mirrors, and a physical side written by hand instead of a
logical one is a separate mistake.

### No em dashes in documentation, use commas

Every `.md` and `.mdx`. Persian text takes the Persian comma `،`. Check with a
Unicode-aware matcher, not a byte-wise `grep`, which compares bytes and reports
false hits inside Persian characters.

### No TypeScript escape hatches without asking

No `as X` to paper over a mismatch, no `@ts-ignore`, no `@ts-expect-error`, no
`any`, no `unknown` cast as a workaround. If the types do not line up, that is
information. Ask what the correct type is.

### Verify versions and docs from source, never from memory

```bash
npm view <pkg> version
npm view <pkg> peerDependencies --json
```

Read the library's current documentation. The owner has 13 years of experience
and has been burned by confident code written against APIs that no longer exist.

Prefer the latest stable release. If a constraint blocks it, say so explicitly
rather than silently pinning older. If `npm install` reports `No matching
version found ... with a date before <date>`, that is `min-release-age` in the
owner's global npmrc refusing packages published in the last seven days. It is
deliberate supply-chain protection. Do not override it.

### Coverage is total, and the tests have to be real

The target is 100 percent, and it is a floor rather than a trophy. A test that
asserts nothing is worse than no test, because it reports green. A test that
makes React warn fails, in both projects, through
`.storybook/react-warnings.setup.ts`, KN-134: a warning printed into a log
nobody reads trains everyone to skip the next one. Every story has a
localStorage of its own, `.storybook/own-storage.ts`, KN-178, since the story
files the runner has open at once share the real one: a story that persists a
choice asserts on `localStorage` and puts nothing back. A component
whose behaviour is never exercised has not been finished, whatever the line
count says.

**It covers the PRODUCT, not the agent's own tooling.** The owner's rule of
2026-09-10: 100 percent applies to the shipped source, `apps/*` and
`packages/*`. It does not apply to `agent/scripts/**`, which is the machinery
that runs the loop rather than anything a user gets, and there is no coverage of
markdown at all — **markdown has no tests**. A verifier under
`agent/scripts/verify` is held to its own standard, which is that it fails when
the thing it checks is broken, proved by mutation. That is a different question
from whether a line of it executed.

### Ask instead of assuming, but never stop to wait

If something is genuinely ambiguous and the answer changes the work, ask through
the question tool, which is the only channel that reaches the owner. Do not ask
about what you can determine yourself, and never end a turn to wait for
confirmation.

## 4. Conventions

### Structure, apps/web

```
src/
  core/       singletons: apollo client, i18n, theme, auth
  pages/      one folder per route
  shared/     components, operations, types, utils
  locales/    lingui catalogs, en-US source, fa-IR translation
```

Only these. `src/` itself holds `App.tsx`, `main.tsx` and the Storybook landing
page. End-to-end tests live in `e2e/` at the workspace root, outside `src/`.

Two folders under `shared/` are Storybook only and never reach the bundle:
`shared/story-fixtures` for demo data, `shared/story-docs` for the prose.

### Imports

- Every folder with more than one file has an `index.ts` barrel.
- Cross-module imports target the barrel: `src/shared/status-chip`, never
  `src/shared/status-chip/StatusChip`.
- No relative parent imports. Absolute `src/...` always.
- Never import from `'.'`, use `'./Component'`.
- MUI from the top-level barrel only: `import { Button } from '@mui/material'`.

### Browser globals

Through `window.*`. Keeps them mockable and greppable, enforced by
`no-restricted-globals`.

### GraphQL

- Operations live beside the component that runs them, named for the file:
  `getJobs.query.graphql` exports through the generated `useGetJobsQuery`.
- Types are generated into `packages/graphql`, never hand-written, and never
  duplicated by a local interface that will drift.
- A mutation lives where it is used. Children own their own mutations and update
  the cache themselves rather than a parent passing handlers down.
- The schema is the contract. Changing it without regenerating is a build
  failure, and that is deliberate.

### Components

- Build on MUI primitives. Do not hand-roll what `Chip`, `Menu` or `Checkbox`
  already does correctly, including keyboard and accessibility. Restyle them to
  the design instead.
- **Every component gets a story, written before the component.**
- Pages hold no styling. They call components with props.
- If a component needs an `sx` to match the design, ask whether the **theme**
  should carry it instead.

### Stories render from their args

A Docs page exists to demonstrate a component through its props, so the Controls
panel has to actually drive what is on screen, and show what is on screen.
Sample copy lives IN the args and follows the Language toolbar there, written
back with `updateArgs`; a value typed in Controls wins, except one typed as
exactly the copy the story put there, which the args cannot tell apart from that
copy and which follows the language with it; and a story never draws a value
its Controls do not show, so no field falls back to copy behind an empty
control. The Input's stories are the worked example, KN-245. Every callback prop
gets an `fn()` so the Actions panel records it.

A story composing several instances has no single component to drive: either
spread args across all of them, or disable the panel and say why. An empty panel
is honest, a dead one is not.

A story with a play function offers only the controls its play holds for, through
`parameters.controls.include`, or reads its expectations from its args, or
disables the panel and says why, KN-255: Storybook offers every control unless
told otherwise, and a reviewer who changes one and presses Rerun meets a failure
nothing caused. The first story's controls are the Docs page's, so it keeps every
control that holds, or a story with no play goes first, as StatusChip's `Default`
does. `node agent/scripts/storybook/controls-sweep.mjs` measures it by hand.

`argTypes` carries the control shape only. Descriptions live in markdown.

### Style

Prettier: single quotes, no semicolons, width 140, organize-imports. ESLint must
pass with zero warnings.

## 5. Before saying you are done

**A parent and a child, since the rest of this section turns on it.** A roast's
findings are filed as CHILDREN of the task that was roasted, one level deep. That
is provenance, not blocking: a child exists BECAUSE its parent was reviewed, and
the parent is usually already `done`. When the last open child closes, the parent
and all its children are roasted together, and what that round finds becomes a
new child, until a round finds nothing.

**How much of this you run, the owner's rule of 2026-09-11**, which replaces the
2026-09-10 rule that a root task closes on the full suite: "there's no proof,
just put the task on done, since if there's bugs you'll do it later". A task is
done when the tests for what it changed pass, its stories and unit tests, lint
and the type checker are clean on the workspace it touched, and it has been
looked at, items 5 to 7 below. No per-task verifier script and nothing re-run
at the close; the full suite and the build, items 3 and 4, run before a batch
is pushed, and the Pages workflow builds the app and Storybook on every push,
and opens every story of that Storybook build before it publishes, failing on a
page error, a console error or a thrown play heard until the story's play has
ended and 400 milliseconds after, KN-226: `npm run check:storybook` in
`apps/web` builds and runs the same check here. A bug found later is a later
card.

1. `npm run lint`, zero warnings.
2. `npm run lint:tsc`, clean.
3. `npm test`, passing, and read the output rather than the exit code.
4. `npm run build`, succeeds.
5. **Actually run it.** Open the app or the story and look at the rendered
   result. A computed style is not proof.
6. **Check all four combinations.** Storybook has Language and Theme toolbars. A
   change is not done until it has been seen in fa-IR light, fa-IR dark, en-US
   light and en-US dark. English strings are longer and the direction flips, so
   layout bugs hide in exactly one of the four.
7. **Read the Docs page in both languages.** The page, not just the stories:
   description, Controls table and every story heading. A page that is Persian
   at the top and English once you scroll is the failure mode here, and it is
   invisible from the Canvas tab.
8. Report honestly. If something is partial, say which part.

### Do not verify by inference

**Test the thing in front of you, not a thing like it.** Open the page being
asked about, not a page that resembles it.

**A tool that finds nothing has not proved anything.** When a check comes back
clean, confirm it can find a case you plant by hand. A greedy regex and a
byte-wise grep have both reported clean while being broken.

## 6. Suppressions and workarounds

Nothing gets silenced without an entry in `TECH-DEBT.md`: what is suppressed,
what causes it, what would fix it, and the check that says it can be removed.
That covers lint disables, ignore patterns, CLI flags that hide output, pinned
versions, raised limits, widened timeouts, and anything routed around rather
than fixed.

A suppressed warning with no record is a decision nobody can revisit, because
the reason is the first thing lost. "Nothing to do about it right now" is the
reason to write it down, not the reason to skip it.

Deliberate scope cuts go in `PHASE-NEXT.md` instead. Those are decisions, not
debt.

## 7. What keeps going wrong, one line each

Moved here from `agent/STATE.md` on 2026-09-14, so the compressed head stays
short and the lessons sit in a file every iteration reads.

- A button draws in the browser's font, Arial in Chromium: since KN-351 the theme gives every ButtonBase the product's face; a native `<button>` outside ButtonBase still needs it.
- A button centres its text: a name that fills a flex row sits mid-row unless the row sets `textAlign: 'start'`; measure where a name starts with a Range over its text, not with its box (KN-479).
- An open MUI Menu or Dialog hides the rest of the page from roles: take the trigger's box before opening it, or select the trigger by CSS. A Select's list is portalled outside its dialog, so find its options on the page (KN-480).
- A pipeline's status is its last command's: `check | tail && commit` commits after a failed check. Read the exit code apart, `check; echo $?`, or compare with `cmp -s`, never `diff | head && echo same`.
- Vitest never type-checks: a missing type import passes every story and fails `npm run build`, which the e2e web server runs first. Run `tsc --noEmit` before e2e.
- A flex item with `overflow: hidden` may shrink below its content: a list of cards in a scrolling flex column needs `flex-shrink: 0` on them.
- MUI's Chip is `max-width: 100%` of its group: beside a count, hold it in a `min-width: 0` item or the count is pushed out.
- Figma's hidden layer gives up its room: fold a control to no room and fade it, never `display: none`, which drops it from the Tab order.
- A bare literal `'x' as const` skips the lingui rule entirely (KN-217); type the binding against a union instead. The rule also skips a literal compared with `===`, ignores every string under an `sx` key, and recognises `i18n._()` only on an instance named `i18n`.
- `useTsTypes` passes a literal only when its contextual type is a union made wholly of string literals, so a literal returned from a function typed `Section | null` is copy to the lingui rule: return the value a comparison narrowed instead (KN-215).
- Stories that drive the real pointer collide when story files run in parallel (KN-365): rerun a lone failure alone before reading it as a regression.
- A radio group's arrows: Blink flips left and right by direction, WebKit never does; the pickers take the two keys themselves (KN-301).
- The Browser pane's key action wants `ArrowLeft`, not `Left`, and a click first; its type action inserts text without key events, its drag does not start an HTML5 drag, and while the window is hidden it runs no animation frames and its screenshots time out: look headless with Playwright from a scratchpad script, `createRequire` from `apps/web/package.json`, at `deviceScaleFactor` 2.
- Storybook's resetMousePosition never runs here: addon-vitest adds its setup file only when the ROOT config enables the browser; parkPointer is the one reset, TECH-DEBT 19.
- A story's expected colour borrowed on the element under test reads the start of that element's own transition: compute tokens on an element without one, KN-365. Never compute one inside `waitFor`: it rewrites the style, the observer reruns, and the loop kills the browser connection (KN-014).
- The component's own prototype reaction beats the prototype map's summary: hovers are 200 ms ease in and out or 120 ms ease out, never the map's 300 (KN-350).
- `prettier --write` on a file committed unformatted rewrites all of it: the catalogs and DESIGN.md are kept by hand. Format a file only after checking its committed copy was formatted.
- An absence proves nothing without a positive control: plant the failure once, see the check catch it, and check the plant really happened. A silently ignored prop looks exactly like a working one; assert the DOM.
- `npm run` truncates arguments at a newline on Windows: call node or python directly. The Bash tool's heredocs turn a doubled backslash into one: write scripts with Write, or build a backslash with chr(92).
- `String.replace` with a string expands `$'` and `$&`: pass a function.
- `roast.py` keeps its sessions under `.claude/` of the directory it runs in: run it from the repository root. A background roast that names `HEAD~1` reads whatever HEAD is when it starts: name the commit.
- A Docs page draws its stories inline, so a story whose modal is open lays its dialog and scrim over the whole page (KN-594); `parameters.docs.story.inline: false` frames it, but the frame follows neither the Language nor the Theme toolbar, and it turned the page's prose Persian under English, measured. Open a modal from the start only where the render's `viewMode` is not `docs` (KN-571).
- The Docs page's Controls block draws the primary story's arg types, trimmed by `include` and never by `parameters.controls.disable`, so a first story with its panel disabled keeps its page's table, and a control no story can hold, such as a union's discriminant, needs `control: false`, which drops its editor from the page and the panel alike (KN-571).
- `roast.py`'s task and plan chains end in `claude/sonnet`, and their Codex reserve, `gpt-5.6`, is refused on this ChatGPT account with a 400, so when terra is out of usage Claude's work goes to Claude, which the owner forbids: KN-533's first roast did, and was stopped. Pass `--model gpt-5.6-terra` for Claude's work, which tries terra alone; a failed run prints only Codex's first 300 characters, the banner, so read the error from `codex exec` itself (2026-09-15).
- The production Storybook is not the Vitest one: body box-sizing, and act(). Portable stories apply no updateArgs, so anything that needs the store is proved in a production build. A story's pinned globals beat URL globals; view dark through an unpinned story.
- Read the file with use_figma before trusting a code comment about it.
- Forced colours: box-shadow removed, borders kept, SVG author strokes kept.
- Python on Windows prints `\r\n` where Node prints `\n`, and a test reading pipes as text cannot see it: compare bytes. node:sqlite's busy timeout defaults to zero: pass `{ timeout }`.
- A second checkout for comparison needs `git -c core.longpaths=true` and node_modules as junctions, removed with `cmd /c rmdir` before `git worktree remove`; the Storybook browser project cannot load its setup file through junctioned node_modules.
- When two stores claim one truth, retire one in the same change: the JSON board and the skill's database drifted for a week unnoticed.
- A pixel count of a focused text field includes the selection Tab makes: collapse it first.
- Storybook 10: `inferControls` trims a story's arg types to its listed controls, so a URL arg outside the list is dropped.
- A story's own play may have focused its control: blur, click an empty corner, then Tab. `:focus-visible` after Storybook's untrusted `userEvent.tab()` depends on the page's earlier input; a real Tab comes from Playwright.
- The Emotion cache's RTL plugin flips `direction` in styles: set it by `dir` in a mutation, or write `ltr /* @noflip */`.
- A story that writes args back must carry a revision (the KN-280 Held pattern) or a late render brings an older value back; the production build shows it, the runner does not.
- In RTL the story root puts inline content at the right: clip screenshots to the element, not to the root's left.
- MUI's sx reads a bare width or height from 0 to 1 as a fraction: a width of 1 is 100 percent. Write one pixel as `1px`, which the literal guard refuses, so name it.
- MUI's Popper mirrors only the -start and -end placements in RTL, never left and right (KN-335); Popover places by left and right and does not mirror at all.
- A synthetic hover sets no `:hover`: use `vitest/browser`'s pointer under the story-test flag, and aim at an element nothing covers.
- A menu under a trigger at the viewport's edge is clamped 16 from it: give story triggers room.
- A focus trap takes focus back while it is open: refocus after it closes, in the transition's onExited.
- A test that starts a process has no speed budget: vitest fails a case whose blocked worker overran its budget; start the runs together with an async spawn and a hang guard (KN-167).
- React warns in plain strings and through console.warn too; a guard keyed on `%s` hears only the printf ones (KN-401).
- A long Bash line of board commands died on its quoting after filing half its work, and the notes never landed: write notes, evidence and commit messages to files and run the board through a script with `execFileSync` (KN-481).
- A layout story that works out the expected size from the element it measures proves the implementation, not the frame: assert the frame's own numbers, and a width the frame never drew is a reading to record, not a fact (KN-481's roast).
- The unit project's guards read every story file, the literal guard among them: when a story changes, run the unit project too, and when a set grows, grep the stories for its old count. KN-481's `'1px'` and KN-478's thirty-first glyph each broke a suite nobody ran (found by KN-401).
- Figma's component descriptions and prototype reactions carry rules no variant draws: the phone card's held press, and the Checkbox on every card while selecting, were in 491:751's and 204:11's descriptions and on every phone card's ON_PRESS, and readings of the variants alone missed them twice, KN-015's and Codex's always-visible checkbox (KN-428). Read `description` and `reactions` with use_figma before building an interaction.
- Vitest writes no coverage report when a test fails: pass `--coverage.reportOnFailure=true` to measure beside a known failing story (KN-427).
- A coverage card's counts and line numbers rot as its file changes: measure before planning, and re-point the card when the count grew; KN-427's fifteen arms were fifty-two by the time it was taken.
- Every story sits inside the preview's `AppProviders`, whose own session provider keys the board: the board in every story keeps the bare key, and a sign-in arriving from storage remounts everything a story decorates, so a story's provider starts fresh. Which key the board reads, and a provider's state across a sign-in, are proved end to end, where the wiring is the app's; two plants passed every story before that was seen (KN-419).
- `ReturnType<typeof within>` lints as `any`, four unsafe-member errors: a helper that queries a story's canvas takes the element and calls `within` itself (KN-466).
- The runner's keyboard types into a field only after the runner's own click: after testing-library's click the field has focus, yet a real key types nothing into it, while a real Enter in an input still submits its form. Click with `vitest/browser`'s `userEvent.click` before real keys that edit (KN-467).
- Git Bash rewrites a value that starts with `/` into a Windows path on its way to a Windows program: `KARNAMA_STORYBOOK_BASE=/KarNama/storybook/ npx storybook build` built for `/Program Files/Git/KarNama/storybook/`, and a probe of that build spent 35 minutes timing out on 404s. Set such a value in Node's own `env`, or in PowerShell, and fetch a build's own assets before measuring it (KN-226).
- A play that writes its args says `storyFinished` for every render that causes, before the play has ended: SearchBar's `Debounced` and Input's `TypingIntoABoundValue` did in 10 runs of 10. A story's end is the `storyFinished` after the phase `played` or `errored`, heard on `storyRenderPhaseChanged`; the first `storyFinished` read a story before its play failed (KN-584, KN-226).
- A message that takes a value renders raw in the production build: the catalogs load uncompiled, and `@lingui/core` 6.6.0 interpolates `i18n._(id, values)` only in development, returning `{phone}` itself with `NODE_ENV=production`. Put a value beside a message, never inside one, until KN-221 compiles the catalogs (measured for KN-518).
- react-docgen-typescript reports no component that takes no props, so the docs guard says it found none for a meta that names one: the story's meta leaves `component` out and renders it, as `Shared/BrandRow` does. A new story's title joins `StoryTitle` in `story-docs/story-meta.ts`, or tsc refuses the meta (KN-518).
- A story whose play changes its args is rendered again at once in a production Storybook, and that render's loaders restore every `storybook/test` mock, so a call a spy recorded is gone before the play reads it; the runner applies no args update and never shows it. Keep the mocks across that story's renders with `parameters.test.restoreMocks` false, on the story alone, and clear them when its play starts, since nothing else then clears the calls the file's shared spies hold (KN-563).
- The args a play writes stay in its story for the session, and a remount, Rerun among them, plays again from them: a play that assumes its story's own args fails the second time (KN-563's remount).
- GitHub Pages has no rewrites, but it serves `/x` from `x.html` with 200, a directory with a 301 to its trailing slash, and a path it has no file for from `404.html` with 404, all measured on the live site. The app routed by hash from KN-042 on the claim that Pages could not serve a deep link, while the workflow was already serving one through `404.html` (KN-505).
- Storybook's Vite builder sets `base: './'`, and `.storybook/main.ts` replaces it only when `KARNAMA_STORYBOOK_BASE` is set, so a build without it compiles `import.meta.env.BASE_URL` as `./`: resolve it against the page before reading a path under it. The preview writes each selected story's id onto the frame's current pathname, so a path a story pushes outlives the story unless it is put back (KN-505).
- A play that must reach the end of a timer holds `Date.now` with `holdClock`, `shared/story-fixtures/clock.ts`: user-event, testing-library's `waitFor`, Storybook's instrumenter, React's scheduler and Vitest read no `Date.now` at call time, checked in node_modules, and a component that reads the clock on an interval shows the move at its next look, so the play waits with `findBy` (KN-587).
- Playwright's `page.clock.install()` goes before the first navigation, in the spec's `beforeEach`; `runFor` fires a repeating interval where `fastForward` fires each due timer once (KN-587's plan review).
- A Codex roast runs in a read-only sandbox where Vite cannot write its config bundle, so it runs no Vitest: its findings come from reading, and a claim that a test fails is to be run here before it is believed (KN-587's roast).
- picomatch, under Storybook's story finder and Vitest's collector alike, reads `!(gate-fixtures)` as a folder whose name does not start with `gate-fixtures`, so `gate-fixtures-kept` is left out too; and Storybook warns at every start for a `stories` specifier that finds nothing. A story at the root of `src` is taken by one brace pattern, `{*,!(gate-fixtures)/**/*}`, and a list of the story files comes from Storybook's own `getStoriesPathsFromConfig`, never a second glob (KN-216).
- `@storybook/addon-vitest` injects Storybook's `previewHead`, `previewBody` and main.ts's `viteFinal` into the Vitest page, so nothing on Storybook's side tells the published Storybook from the runner; Vite's documented `import.meta.env.MODE` does, `test` in the storybook project and `development` or `production` in Storybook. `--mode` on Vitest's command line does not reach a browser project's page, which stays `test`; a `mode` in the project's own config does (KN-228).
- ripgrep's count mode, `rg --count` and the Grep tool's `count`, counts matching lines, not matches, and a lint's count of reports is not a count of what it reads: KN-257's plan wrote 42 selector literals beside a breakdown that made 44, two lines holding two each and two literals under an `eslint-disable`. Sum a breakdown before writing its total, and count occurrences with `grep -o` or a parser (KN-257's plan review).
- lingui's `useTsTypes` reads a call's argument through the resolved overload's parameter and passes it only when that parameter is a union of string literals, so `getContext('2d')`, whose 2d overload types it `'2d'` alone, is copy to the rule; away from a call a contextual type of one string literal is enough. Bind the value first, as `Tabs.stories.tsx` does with a binding typed `OffscreenRenderingContextId` (KN-304).
- The storybook project's runner drew every story at 0.8: Vitest's orchestrator scales the tester iframe to fit its own page, `@vitest/browser-playwright` leaves that page at Playwright's 1280 by 720, and `@storybook/addon-vitest` gives each story 1200 by 900, some plays resizing to 1440 by 900, so a tab 65 by 44 screenshotted at 53 by 36 and a one-pixel row read as a blend. The page is 1440 by 900 in `vitest.config.ts`, the largest a story asks for; a story that reads drawn pixels refuses a scale that is not a whole number (KN-304).
- A tap on a touch screen leaves `:hover` on what was tapped, so a hover fill drawn for every device stays after the tap, measured in Playwright's Pixel 7 (KN-313). MUI resets its own hover under `(hover: none)` only in the style it gives a button with a ripple, and an sx `&:hover` replaces it anyway: put a control's hover under `@media (hover: hover)`, and prove it in a `devices['Pixel 7']` context, which the storybook runner's shared context cannot give a story.
- The Grep tool matches a glob with a slash in it against the path from the session's working directory, the repo root here, whatever `path` the search is given, and a `*` in it crosses no slash: from `apps/web` the glob `src/shared/tabs/*.stories.tsx` finds nothing, and so does a brace list of such folders, and `*/Shared-PageHeader.md` finds neither story doc. The search reports no match, not a glob that matched no file, so write a glob with a folder from the repo root, or give a bare file name, which matches at any depth, and give an empty search a positive control, the same glob finding a file known to be there. KN-304's plan said no story sets a viewport on such a search, and its review found the plays that do (KN-321's plan).
- eslint-plugin-react-hooks 7.1.1's recommended rules, which apps/web turns on, include `purity`, `set-state-in-render` and `set-state-in-effect`: calling `Date.now()` while a component renders is an error, where the same read inside a snapshot handed to `useSyncExternalStore`, or inside a timer, lints clean. A design can be linted before it is written: ESLint's `lintText`, given the file's own path, lints text in memory with the workspace's rules, types included, and `calculateConfigForFile` lists the rules the file gets (KN-325's plan). The types are the text's own only: whatever it imports is typed from the files on disk, so a draft that imports a second draft lints against the file not yet written. KN-331's stories draft drew two reports, a redundant `never` and an always-false comparison, from the component still on disk, and the lint of both files once written drew none. Check such a pair with a TypeScript compiler host that serves both drafts in place of the files, and lint once both are written (KN-331's plan).
- `@storybook/addon-docs`' Stories block leaves out every story whose play destructures `mount`, whatever `parameters.docs.story.autoplay` says, and autoplay only lets a single Story block draw one: KN-326's first story drew in the runner and on its own page and was missing from the Docs page in both languages, measured, and `blocks.js` filters out `usesMount`. A story that must see a state mount renders a button that mounts it and presses it with `fireEvent`, which Storybook runs inside its act, so the play reads the mounting render before any timer (KN-326).
- Storybook runs a story's play only when the story mounts: `StoryRender.render` plays only with `forceRemount`, which the first render and Remount set, and an args change from Controls goes through `rerender` without it. A control therefore fails no play in the running Storybook until the reader presses Remount, which plays against the args the control set (KN-331's plan review).
- A story's args type lays the meta's args over each member of a union of props, so where the meta gives a prop that one member names as optional `never`, a story's `{...args}` spread into the component is refused, TS2375, and at run time every story of that member still holds the prop. Storybook's Show code, for a story whose render takes args, prints the element the render returns with those args, so it offered a Contacts Bulk Action Bar given both job callbacks. The docs guard wants every callback's `fn()` in the meta, KN-207, so the args stay, and one render hands the component only the props of the member the args hold, `barFor` in `BulkActionBar.stories.tsx` (KN-331's plan review).
- Storybook's iframe URL args, `&args=value[0]:remote;value[1]:full-time`, left the Select's `readonly string[]` value as the story set it, the English field keeping Full-time. A look that must hand a story a list calls `window.__STORYBOOK_PREVIEW__.onUpdateArgs({ storyId, updatedArgs })` in the page, the call a Controls change ends in, which re-renders without the play. Give such a look a value the story could not show by itself, remote before full-time, so an update that did not take cannot pass (KN-332's look).
- While an MUI Select's list is open, MUI hides the rest of the page from assistive technology, so Playwright's `getByRole('combobox')` found nothing once the list was up and the look timed out on it: measure the field before opening the list, or find it by its `role` attribute with a CSS locator (KN-332's look).
- A story at a smaller viewport is not a software keyboard: a keyboard shrinks the visual viewport and leaves the layout viewport in Safari on iOS and Chrome on Android, and at a literal 390 by 544 MUI's cap already kept the panel's Save in view while at 390 by 844 it ended at 695. `window.visualViewport` is the window's own configurable property in Chromium: stand it in inside the story's `beforeEach`, under the runner flag so a Docs page keeps the real one, so the component subscribes to the stand-in from its first render, and put it back in the cleanup (KN-349).
- The lingui rule reads `Object.defineProperty(window, 'visualViewport', ...)`'s key and `new Event('resize')`'s name as copy, and `setupI18n(...)._('Save')` too, since it knows `i18n._()` only on a binding named `i18n`: bind the key to a type of its one literal, the event to `keyof VisualViewportEventMap`, and the instance to `i18n` (KN-349).
- A board story that deletes asserts where focus lands, not only the data: KN-348's Confirm modal had no opener or fallback, and focus after a confirmed delete fell on the job modal's `div` with role presentation, which `DeletingAPersonAsksFirst` never read (KN-628).
