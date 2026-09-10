# KN-245 · The Input's Controls show empty values while the canvas draws the specimen's copy

Beside `Input.stories.tsx`, which is where the change lands.

**Why, from the board.** Controls are how a reviewer reads a story's state, and
values that disagree with the canvas describe it wrongly. Critical on the
owner's order of 2026-09-10, as a finding on a built component.

**Exit condition, from the board.** With no control touched, every Controls
value in the args-driven Input stories is what the canvas draws, label,
placeholder and helper, in either language; changing one in Controls changes
the canvas to exactly that value, and clearing the placeholder or helper
removes it; a story asserts the rendered copy equals the args, and a mutation
reintroducing a hidden fallback fails it.

## What is there now

The meta's args are `label: ''` and no placeholder or helper. `JobTitle` puts the
catalog's specimen copy in for each: `''` or unset label means «عنوان شغلی»,
unset placeholder and helper mean theirs. So Controls show three empty values
over a field that has all three, and an untouched control looks the same as one
emptied on purpose.

## Why the args have to move

"In either language" is the hard clause. The specimen's copy follows the
Language toolbar, so for the Controls to show what the canvas draws, the args
themselves have to change when the language does. Storybook args are static,
and nothing but the channel changes them: `updateArgs` from `useArgs`, which
round-trips through the preview's store to the Controls panel. So the story
syncs them.

## The approach

1. **The specimen's copy is in the args.** The meta's args start as the copy in
   the language the stories file loads in, read from the catalog, so the
   Controls show from the first frame what the canvas draws. The canvas draws
   the args exactly as they are, nothing else: no sentinel, no fallback, so a
   cleared label is an empty label and a cleared placeholder or helper is gone.
2. **The render keeps them in the language on screen.** It remembers, per field,
   the value it last wrote, in Storybook's `useRef`, which lives with the story's
   hooks and so outlives the React remount a language switch causes. A field
   still holding exactly what the story put there, what it loaded with, which is
   also what Reset restores, or what it last wrote, and not this language's copy,
   gets this language's copy written into the args with `updateArgs`. Anything
   else was typed in Controls and stays. A typed value equal to what the story
   put there cannot be told apart from it and follows the language too; the
   args carry no record of who set them. Remembering every past copy instead
   would snap a label typed as the other language's copy straight back.
3. **The write is React's passive `useEffect`, in a child component.** Storybook
   runs its own hooks' effects only once play has finished in its preview, so a
   play could never see them, and Storybook's hooks may not share a function
   with React's, so the effect lives in `FollowTheLanguage` and the story render
   owns the args. A passive effect may run after paint, so an English screen can
   show the Persian copy for a frame, in the Controls and the canvas alike.
4. **Portable stories apply no args update.** Nothing in `@storybook/addon-vitest`
   or the portable-story code listens for `updateStoryArgs`, so under the test
   runner the write changes nothing and the args stay in the load language.
   There is no Controls panel there either. That is recorded as TECH-DEBT 16.
5. **`JobTitle` keeps its name for the fixed renders**, which offer no controls,
   and states the specimen's copy outright, any prop replacing it. The meta's
   render draws `Input` from the args instead.
6. **Two stories assert it**, `ControlsMatchTheCanvas` and its English twin: the
   meta's render inside a wrapper that records the args it was given, the
   store's, as data attributes, an unset one recording nothing. Everywhere they
   assert the canvas draws exactly those args. In Storybook's own preview, where
   the Controls are, they also wait for the args to be the specimen's copy in
   the language on screen; under the test runner that half cannot run, by the
   same environment split the Hover story already uses. The English twin is
   the one that needs a write, since the stories load in Persian.
7. **AGENTS.md's rule changes with it.** "Spread args and fall back per field" is
   what this card found misleading. It becomes: sample copy lives in the args and
   follows the Language toolbar there, a typed value wins, and a story never
   draws a value its Controls do not show. The Input is the only story file
   that falls back today, checked with a search.

## What the prototype showed, 2026-09-10

Built and run before this revision. Under Vitest the sixteen Input stories pass.
In a production Storybook: the English twin plays to completion with its
store args written into English, the preview rerendering once during play; the
manager's Controls panel shows exactly the label, placeholder and helper the
canvas draws, in fa-IR and in en-US; typing a label in the panel draws it;
switching to English keeps the typed label and moves the untouched placeholder
and helper to English, so the ref did outlive the remount; clearing the
placeholder and helper in the panel removes both; and switching back to Persian
leaves every edited value alone.

## What changes

- `Input.stories.tsx`: the meta's args and render, `JobTitle` stating its copy
  for the fixed renders, the two new stories.
- `story-docs/{en,fa}/Shared-Input.md`: the new stories' notes, both languages.
- `TECH-DEBT.md`: entry 16, portable stories applying no args update.
- The verifiers for KN-242, KN-246, KN-252 and KN-258, whose anchors are the
  meta's render line, which now draws `Input` rather than `JobTitle`.
- `AGENTS.md`: the rule under "Stories render from their args".
- `agent/scripts/verify/KN-245.mjs`.

## The verifier, clause by clause

Against a production Storybook build, its own static server and Playwright,
the harness KN-247's verifier used, reading the manager's real Controls panel:

1. **No control touched, either language**: for every args-driven Input story,
   in fa-IR and in en-US, the panel's label, placeholder and helper equal what
   the canvas draws; and every field the story does not set itself, as FromArgs
   sets its label and helper, is the specimen's copy in that language.
2. **Changing one**: a label typed into the panel is drawn exactly.
3. **Clearing**: emptying the placeholder and the helper in the panel removes
   both from the canvas.
4. **The language switched after a typed value**: the typed label stays, the
   untouched fields move to the new language, in the panel and on the canvas.
5. The Input stories pass under Vitest, the two new ones included.
6. **THE CASE**: the old hidden fallback back, `label: ''` in the args with the
   render drawing the copy for it, fails `ControlsMatchTheCanvas` by name under
   Vitest.
7. **The write taken out** fails the English twin in the production preview,
   read from its errored phase.

## What I am unsure about

- Whether an environment split in a story is acceptable. It is the pattern
  Hover already uses for the same kind of reason, a thing only one environment
  can do, and the verifier runs the half Vitest cannot in a real preview.
- Whether the write can race a play that types. It happens once, right after
  mount, and rewrites only copy fields, never value; in Vitest it does nothing.

## How I will know it worked

`node agent/scripts/verify/KN-245.mjs` passes, the Input stories, the unit
project, lint and tsc pass, and the Controls panel read by eye in both languages
shows the copy the canvas draws.

## The checks, and what changed after them

The first check found two faults in the first draft: Storybook runs its own
hooks' effects only after play in its preview, and before it in portable
stories, so a play waiting on one would pass in Vitest and time out in
Storybook; and '' as the label's sentinel would redraw the specimen when
someone clears the label. The prototype then showed portable stories apply no
args update at all, hence TECH-DEBT 16 and the environment split. The second
check, on the revision, asked for the React effect to leave the story render,
for the specimen-language assertion to skip the fields a story sets itself,
and noted that a remembered set of every past copy misreads a typed value;
all three are in the approach now.

The third check found the mechanism sound, the split and TECH-DEBT 16 honest,
and the production verifier the right proof. It asked that AGENTS.md not
promise a typed value always wins while the design makes one exception, a
value typed as exactly the copy the story put there; the rule names it now.
