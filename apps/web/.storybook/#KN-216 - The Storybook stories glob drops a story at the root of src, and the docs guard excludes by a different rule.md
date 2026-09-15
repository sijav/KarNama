# KN-216 - The Storybook stories glob drops a story at the root of src, and the docs guard excludes by a different rule

## The card

A child of KN-095, found by its roast.

**Why.** A story that silently is not a story is a component that is silently untested:
it never renders in the browser project and never reaches the published library, and
nothing fails. Two exclusion rules for one set of files is the shape of a drift nobody
notices until it has happened.

**Exit.** A story file directly under src is indexed by Storybook and run by the
storybook project, src/gate-fixtures is still excluded from both, and the docs guard
derives its list from the same rule Storybook uses rather than a second one, proved by a
fixture at the root of src that appears in Storybook's index and in the guard alike.

## Read before planning, 2026-09-15

- `.storybook/main.ts` indexes `'../src/!(gate-fixtures)/**/*.stories.@(ts|tsx)'`.
- Storybook finds its story files with `normalizeStories`, then
  `StoryIndexGenerator.findMatchingFilesForSpecifiers`, which runs globby over each
  specifier's directory and files, `storybook/internal/core-server` 10.5.10. The
  storybook Vitest project takes the same patterns: `@storybook/addon-vitest`'s plugin
  joins each to the config directory, hands them to Vitest's `include`, and matches its
  transforms with micromatch.
- The docs guard, `story-docs/guard.test.ts`'s `storyFiles`, globs
  `**/*.stories.@(ts|tsx)` under `src` with Node's `globSync`, excluding
  `gate-fixtures/**`: a second rule.
- Measured on a scratch tree outside the repository, `kn216-probe.mjs`, through
  Storybook's own finder, each specifier's `importPathMatcher`, micromatch and tinyglobby
  over the include the addon builds, and the guard's glob:
  - The committed pattern takes `src/app/Shell.stories.ts` and
    `src/shared/thing/Thing.stories.tsx`, and drops `src/Root.stories.tsx` and
    `src/RootTs.stories.ts`, in Storybook and in Vitest alike.
  - It drops `src/gate-fixtures-not/Near.stories.tsx` too: picomatch reads
    `!(gate-fixtures)` as a folder whose name does not start with `gate-fixtures`. The
    guard's glob takes that file and both root stories, so the guard and Storybook
    disagree in two ways today.
  - `'../src/{*,!(gate-fixtures)/**/*}.stories.@(ts|tsx)'` takes both root stories and
    both folder stories, and neither story under `gate-fixtures` or
    `gate-fixtures-not`, in all four.
  - Two patterns, one for the root beside the committed one, take the same files, but
    Storybook warns "No story files found for the specified pattern" for a specifier
    that finds nothing, which the root one would at every start while no story sits
    there.
- On the repository today, `kn216-baseline.mjs`: the guard's glob, Storybook's finder
  and the dev Storybook's `index.json` each take the same 53 story files, and the index
  holds 458 entries. No story sits at the root of `src`, whose root holds `main.tsx`
  alone.
- `stories-glob.test.ts` reads main.ts's patterns and refuses one for MDX.
  `agent/scripts/verify/KN-095.mjs` compares Storybook's indexed files with
  `git ls-files`, and does not read the pattern.
- The guard's one temporary fixture today is written under story-docs and deliberately
  not named `.stories.tsx`, so an interrupted run cannot leave a story Storybook picks up.

## The approach

1. **`main.ts` takes the one brace pattern**, and its comment says: a story at the root
   of `src` is a story; `gate-fixtures` stays out, and with it any first folder whose name
   starts with `gate-fixtures`, which is how picomatch reads the negation; and one
   specifier rather than two, since a second that finds nothing makes Storybook warn at
   every start.
2. **The guard lists what Storybook's own finder lists**: `getStoriesPathsFromConfig`
   from `storybook/internal/core-server`, which runs `normalizeStories`, the story
   index's own glob with its warnings off, and `storyFileNames`, given main.ts's
   `stories`, its config directory and the workspace; sorted. `beforeAll` awaits it. The
   glob and its `exclude` go, and the comment says the list is Storybook's.
3. **A test in the guard proves it with a fixture at the root of `src`.** It writes a
   scratch tree under the OS temp directory, a `.storybook` and a `src` holding a story
   at its root, one in a folder, one under `gate-fixtures` and one under a folder whose
   name starts with `gate-fixtures`, and asks the same call, with main.ts's `stories`, for
   the list: the root story and the folder story are in it, and neither `gate-fixtures`
   story is. The tree lies outside the repository, so an interrupted run leaves no story
   where Storybook or Vitest looks, and `finally` removes it.
4. **Once, by hand, on the repository itself**: a story planted at the root of `src`
   shows in the dev Storybook's `index.json`, runs in the storybook Vitest project, and
   makes the guard ask for its markdown; then it is removed, `kn216-live.mjs`. That is the
   exit's indexed and run on the real configuration, which a committed test could only
   show by leaving a story in `src`. It is not committed.

## File by file

- `apps/web/.storybook/main.ts`
- `apps/web/src/shared/story-docs/guard.test.ts`

## What I expect to be hard, and what I am unsure of

- **Loading `storybook/internal/core-server` in the unit project.** It is Storybook's node
  server, and the guard already loads `storybook/internal/csf-tools`. It is an internal
  surface an upgrade may change; the type checker reads the call.
- **The brace pattern in the real build and in Vitest's collector.** Measured with
  globby, micromatch and tinyglobby on a scratch tree; the planted story covers the real
  tree once.

## Plan review, Codex gpt-5.6-terra, 2026-09-15

"The plan is sound and will meet the exit, with one simplification", taken: the guard
calls Storybook's exported `getStoriesPathsFromConfig` rather than composing
`normalizeStories`, `findMatchingFilesForSpecifiers` and `storyFileNames` itself. Read in
10.5.10 before taking it: it runs exactly those three, with the empty-pattern warning
off, and is typed for the purpose, so the guard depends on one exported call rather than
on how the index is built.

It confirmed the brace pattern against Storybook's normalized matcher and
addon-vitest's micromatch include, root and nested stories in and both `gate-fixtures`
folders out; found no plainer single glob keeping one specifier; and named the planted
story the right proof that a root story is indexed and run, with the scratch tree
guarding against a regression without a false story in the repository.

## How I will know it works

- The guard's new test passes, and fails with the committed pattern put back, run once by
  hand.
- The unit project passes, and the guard reads the same 53 story files it read before.
- The dev Storybook's `index.json` lists the same 458 entries after the change.
- `npm run lint` and `npm run lint:tsc` clean in `apps/web`.
- The planted root story: in `index.json`, run by the storybook project, and asked for by
  the guard; then removed.

## Result, 2026-09-15

Built as planned after the review.

- `main.ts` indexes `'../src/{*,!(gate-fixtures)/**/*}.stories.@(ts|tsx)'`, its comment
  saying why one brace pattern and how picomatch reads `!(gate-fixtures)`.
- The guard's `storyFilesFor` returns Storybook's own `getStoriesPathsFromConfig` for
  main.ts's `stories`, sorted. The type checker refused main.ts's `stories` as they are,
  since Storybook also takes a function there, so the guard narrows them to a list and
  throws otherwise, as `stories-glob.test.ts` does. The guard's own glob and its
  `exclude` are gone.
- The guard's new test writes a tree under the OS temp directory and finds the root
  story and the folder story listed, and neither `gate-fixtures` story.
- AGENTS.md section 7 holds the glob lesson.

**Checks.**

- The guard, 11 of 11, and the unit project, 1488 of 1488, one more than before. With the
  committed pattern put back by hand, `kn216-plant-check.mjs`, the new test fails,
  listing `src/shared/thing/Thing.stories.ts` without `src/Root.stories.tsx`, and
  `main.ts` came back exactly.
- A story planted at the root of the real `src`, `kn216-live.mjs`, with the dev Storybook
  restarted on the new pattern: `index.json` listed `kn216-root--docs` and
  `kn216-root--planted`; the storybook project ran it, 1 of 1; the guard asked for
  `en/Kn216-Root.md` and `fa/Kn216-Root.md`. Then it was removed. The script's last read
  of the index was reset once while the dev server hot-reloaded after the removal; read
  again, the index held 458 entries and none of the plant.
- After the change and before the plant, `kn216-baseline.mjs`: the dev Storybook's index,
  Storybook's finder and the old guard glob take the same 53 story files, and the index
  holds the same 458 entries. Nothing a reader sees changed, so no page was looked at
  again.
- `npm run lint` and `npm run lint:tsc` clean in `apps/web`. `main.ts` is formatted, and
  `guard.test.ts` keeps the 17 lines of formatting drift it had at HEAD.
