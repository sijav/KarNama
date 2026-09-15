# KN-230 - The callback fn() rule reads only the meta's args, not what each story actually passes

## The card

A child of KN-207 by its prose, found by KN-207's roast.

**Why.** The rule's point is that every story's interactions are recorded, and it checks
the default rather than what each story resolves to. Medium: nothing does this today, and
the meta default covers every current story.

**Exit**, as corrected after the plan review below. The guard fails for a story whose own
args object writes a callback key with anything but Storybook's fn(), and for an fn not
imported from storybook/test, proved by a planted story of each kind, while the current
stories still pass; args written as a spread, one call or one member stay out of its
reach, and the guard says so.

## Read before planning, 2026-09-15

- `story-docs/guard.test.ts`'s `readStoryFile` collects `spied`, the meta's args whose
  value is a call to an identifier named `fn`, from `_metaAnnotations.args`, and the test
  'every callback prop has an fn() in the meta args' requires each of the component's
  `on*` props, from react-docgen, to be in it. A story's own args are never read, and any
  function called `fn` counts.
- Read through Storybook's own CSF parser, `kn230-probe.mjs`: `_storyAnnotations` is keyed
  by the story's export name, as `indexInputs` is, and holds each story's own `args` node.
  Written as an object, its keys are `ObjectProperty` nodes whose values can be read, as
  AddJobModal's `onExtract=call(fn)` and KanbanColumn's `onCollapse=call(fn)` are; a spread
  shows as a `SpreadElement`, and args written as a call, `columnOf(...)`, or a member,
  `FA.contacts`, are one expression the parser cannot open.
- `CsfFile.imports` holds only the import sources, pushed from each `ImportDeclaration`, so
  which local name is storybook/test's `fn` is read from `_ast.program.body`'s import
  declarations, where every story file today binds `fn <- fn from storybook/test`.
- The 33 `on*:` keys written in the story files are all calls to `fn`, in metas and in
  stories' own args, and every story file that uses `fn` imports it from `storybook/test`.
- The guard's one planted file today is written under story-docs, not named `.stories.tsx`;
  KN-216's test writes its tree under the OS temp directory.

## The approach

1. **`readStoryFile` reads the spy's local name**: the name an import declaration binds to
   `fn` from `storybook/test`, an alias included, or none when the file imports none.
   `spied` counts a meta key only when its value calls that name, so a local `fn` counts for
   nothing.
2. **`readStoryFile` reads each story's own callbacks**: every key matching `^on[A-Z]`
   written in a story's own args object, from `_storyAnnotations`, with whether its value
   calls the spy.
3. **One function says what is wrong with a story file's callbacks**, given its callback
   props: each one missing from the meta's spies, as today, and each story's own callback
   key that does not call the spy. The existing test asks it of every story file, with the
   same message for the meta as today.
4. **Planted story files, one of each kind**, written under the OS temp directory and read
   with `readStoryFile`: a story whose own args set `onPress` to a plain function; a file
   whose `fn` is a local function, not storybook/test's, in the meta and in a story; and,
   as the positive controls, a file that imports `fn` and one that imports it as `spy`, both
   with nothing wrong.
5. **Out of reach, said in the comment**: callbacks inside a spread, or args written as one
   call or member, which the parser cannot open, and a render that replaces a callback, which
   the card also names and its exit does not.

## File by file

- `apps/web/src/shared/story-docs/guard.test.ts`

## What I expect to be hard, and what I am unsure of

- **What a callback is.** The meta check reads the component's props from react-docgen; a
  story's own args are read by the key pattern `^on[A-Z]`, the same filter the meta check
  applies to those props, so a story whose render composes several components is covered
  too. A callback named otherwise would go unread.
- **`guard.test.ts` carries 17 lines of formatting drift at HEAD**, which it keeps.

## Plan review, Codex gpt-5.6-terra, 2026-09-15

"The direct-object part of the plan is correct and minimal." It confirmed that `^on[A-Z]`
matches the callback convention react-docgen reports in this repository, that every
callback a story writes in its own args is storybook/test's `fn()`, that reading the
import binding, `fn as spy` included, closes both holes, and that the planted cases prove
an own-args override refused and a local `fn` not accepted. It noted that
`_storyAnnotations` and `_ast` are fields Storybook marks internal, which makes the planted
files the tripwire for an upgrade.

One correction, taken: the guard cannot check what a story passes through args written
as a call, a member or a spread, and no static reading of those is sound, so the card's
exit now names callback keys written in a story's own args object and says the rest is out
of its reach, rather than claiming them checked.

## How I will know it works

- The guard's tests pass, the planted files among them: the two kinds each give the problem
  they plant, and the two controls none.
- With RestartWhileReading's own `onExtract` changed by hand to a plain function, the guard
  fails naming that story; then it is put back.
- `npm run lint` and `npm run lint:tsc` clean, and the unit project passes.
- Nothing a reader sees changes.

## Result, 2026-09-15

Built as planned after the review.

- `readStoryFile` reads the name the file gives storybook/test's `fn` from its import
  declarations, an alias included, and counts a meta key as spied only when its value
  calls that name.
- It reads each story's own callback keys, `^on[A-Z]`, from `_storyAnnotations`, each with
  whether its value calls the spy.
- `callbackProblems` says what is wrong with a story file's callbacks; the callback test
  asks it of every story file, with a component or not, and a new test reads four planted
  files under the OS temp directory.
- The card's exit was corrected after the plan review to callback keys written in a story's
  own args object.

**Checks.**

- The guard, 12 of 12 where it was 11: the planted story whose own `onPress` is a plain
  function gives its problem; the file whose `fn` is a local function gives both, the
  meta's and the story's; and the files importing `fn`, and `fn as spy`, give none.
- On the real tree, `kn230-own-plant.mjs`, with RestartWhileReading's own `onExtract` made
  a call to `String`: the guard failed on the callback test alone, "Shared/AddJobModal:
  RestartWhileReading sets onExtract in its own args to something other than
  storybook/test's fn()", the other 11 passing; then the story was put back exactly. Its
  first version made that value a parenthesised expression with a trailing comma, a syntax
  error that stopped Vitest while indexing the stories, so its exit of 1 proved nothing, as
  the saved output showed.
- The unit project, 1489 of 1489; `npm run lint` and `npm run lint:tsc` clean.
  `guard.test.ts` keeps the 17 lines of formatting drift it had at HEAD, two of the new
  lines put in Prettier's shape by hand; this plan is formatted.
