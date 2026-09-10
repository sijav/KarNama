# Plan — KN-201, the guard only sees `export const` stories

## The defect, reproduced

Appending this to `LanguageSwitch.stories.tsx` leaves the guard green, with no
markdown entry required:

```tsx
export function KeyboardOnly() {
  return null
}
```

`readStoryFile`'s AST walk collects story names from `ts.isVariableStatement`
only, so a function declaration, a class declaration and an export list are all
invisible. KN-007's headline promise — *adding a story with no markdown entry
fails the guard* — is therefore true for `export const` and false for every
other way CSF lets you export a story.

The same walk has a second hole of the same shape: `component` is read only when
it is an identifier, and the prop check then does `if (!entry.component)
continue`. So a meta with an inline component expression is asked for **no prop
documentation at all**. That one fails OPEN by design: the less a meta declares,
the less it is required to document.

## What changes, all in `readStoryFile` and one line of the prop check

**1. Collect every export form.** One helper that yields exported names from:

- `export const A = …`, which already works
- `export function A() {}` and `export class A {}`
- `export { A, B }` and `export { A as B }`, where the EXPORTED name is what
  matters, since that is what Storybook indexes
- and never `default`, which is the meta

**2. Stop skipping a meta whose `component` is not an identifier.** Record that
it was present but unreadable, and make the prop check REPORT it rather than
`continue`. A guard that declines to check when it does not understand
something is a guard that rewards being hard to understand.

There is a real distinction to keep: a meta with **no** `component` at all is
legitimate — `App/Shell`'s meta has one, but a docs-only entry need not — and
that must stay skippable. So the three states are: absent (skip), an identifier
(check), present but not an identifier (**fail, naming the file**).

## What must not break

The four existing story files, all of which use `export const`, and the guard
staying green on the repository as it is. `export default meta` must not be
collected as a story, which is what the current `!== 'meta'` check does by
accident rather than on purpose — it works because the variable is named `meta`,
and it would stop working for `export default { … }` written inline. Worth
handling now since I am in the function.

## What I am unsure of

**Whether an export list can name something that is not a story.** CSF treats
every named export as a story unless `excludeStories` says otherwise, and this
guard ignores `excludeStories` entirely. That is a pre-existing gap rather than
one this card introduces, and widening the export collection makes it more
likely to bite: a helper re-exported for a test would now be demanded as a
documented story. I will check whether any story file does that, and if the gap
is real I will file it rather than silently handle it.

## How I will know it worked

Each export form is a named failing case, planted in a real story file, run
against the real guard, failing before the fix and passing after: a function
declaration, a class declaration, an export list, and a renaming export list.
A meta with a non-identifier component is a fifth. The mutation that must
SURVIVE: the four existing files keep passing unchanged, so the fix widened what
is seen without changing what is demanded of what was already seen.

---

## Revision 2: I asked the indexer instead of guessing, and it corrected everyone

The plan check said Storybook 10 indexes exported variables and functions and
NOT classes, export lists, renamed export lists or re-exports, and that guarding
those would make this stricter than Storybook. That was worth checking rather
than believing, so I ran the installed `loadCsf(...).parse().indexInputs`
against a file containing every form.

**The oracle disagrees with the check, and with my plan, in different places:**

| form | indexed by Storybook 10.5.10 |
| --- | --- |
| `export const A` | yes |
| `export function A()` | yes |
| `export { A }` | **yes**, contrary to the plan check |
| `export { A as B }` | **yes**, contrary to the plan check, and `B` is the name |
| `export class A` | **no**, contrary to my plan |
| `export default` | never a story |
| `__namedExportsOrder` | excluded automatically |
| `includeStories` / `excludeStories` | honoured, arrays and regexes |

So my plan was wrong about classes and the check was wrong about export lists.
Guarding classes would have demanded documentation for something that never
appears in the sidebar.

## What that led to: stop reimplementing CSF

The real lesson is bigger than the card. The hand-rolled AST walk was wrong
twice in one card — it missed `export function`, and it found the meta by
looking for a variable literally named `meta`, so renaming it lost the title —
and both failures are the same thing: deriving CSF semantics from TypeScript
syntax and drifting from what Storybook does.

**`readStoryFile` now calls Storybook's own CSF parser.** It returns the title,
the component as source text, and exactly the story list Storybook will index.
Sixty lines of walking are gone, three filtering rules I had not written come
for free, and the guard can no longer disagree with the tool it guards.

The one thing the parser cannot give is whether `component` is something
`react-docgen-typescript` can be matched against. It hands back source text, so
`LanguageSwitch`, `memo(Thing)` and `() => null` all arrive as strings; a plain
identifier is usable and anything else is present-but-unreadable, which FAILS
rather than skipping.

## Mutations, as run

Four caught: a story exported as a function declaration, one added to an export
list, one renamed in an export list, and a meta whose component is not an
identifier. Four held: an exported class, `__namedExportsOrder`, a story named
in `excludeStories`, and the meta variable renamed.

One mutation was my own fixture being wrong rather than a defect, and it is
recorded in the harness: a partial `__namedExportsOrder` makes Storybook's index
generator refuse the file outright with `MultipleIndexingError`. It has to list
every story to be valid.
