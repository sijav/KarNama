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

Deployment: the web app to GitHub Pages, the API to a Render free web service,
Postgres on Supabase. Render's free tier sleeps after 15 minutes, so the first
request after a nap takes roughly 50 seconds. That is a product constraint, not
a bug: the UI has to have an honest loading state for it and the app has to warm
the server on load.

## 3. Rules that are not negotiable

### Components before screens

Every component is built and storybooked on its own before any screen composes
it. The owner said it directly. A screen assembled out of components that were
never reviewed in isolation is a screen nobody can review, and the states that
never got drawn are the ones that break in production.

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

The line: **if it explains the code to whoever edits it, it is a comment. If it
explains the component to whoever uses it, it is markdown.**

### Prose in code files is English

Comments included. Persian belongs in the lingui catalog, in `story-docs/fa`, or
in the Persian readme. Quoting a Persian UI string inside an English comment is
fine and is often the clearest way to name what is being discussed.

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
asserts nothing is worse than no test, because it reports green. A component
whose behaviour is never exercised has not been finished, whatever the line
count says.

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
panel has to actually drive what is on screen. Spread args and fall back per
field, so sample copy follows the Language toolbar while a typed-in value wins.
Every callback prop gets an `fn()` so the Actions panel records it.

A story composing several instances has no single component to drive: either
spread args across all of them, or disable the panel and say why. An empty panel
is honest, a dead one is not.

`argTypes` carries the control shape only. Descriptions live in markdown.

### Style

Prettier: single quotes, no semicolons, width 140, organize-imports. ESLint must
pass with zero warnings.

## 5. Before saying you are done

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
