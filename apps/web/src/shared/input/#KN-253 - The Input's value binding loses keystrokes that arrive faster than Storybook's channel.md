# KN-253 · The Input's value binding loses keystrokes that arrive faster than Storybook's channel

Beside `Input.stories.tsx`, which is where the change lands.

**Why, from the board.** Pasted or composed text that silently loses characters
makes the component look broken to the person trying it. Critical on the
owner's order of 2026-09-10, as a finding on a built component.

**Exit condition, from the board.** The field shows every edit as it happens and
the arg follows without a stale value overwriting newer input: 20 keys typed
with no delay all arrive in both the field and the arg, and a composition
driven through the browser's own IME input ends with the composed text in both;
a mutation back to the plain round trip loses keys again.

## What is there now

With `value` set in Controls the field is controlled by `args.value`, and each
edit goes out with `updateArgs({ value })` and comes back through Storybook's
channel before React sees it. Until it comes back the field still holds the old
arg, so a key typed in between lands on the old value, and a stale echo that
arrives after a newer key overwrites it. KN-249 measured 20 keys at 0ms apart
keeping 2, and at 10ms keeping 11.

## The approach

1. **The field holds its own copy of a bound value.** A child component,
   `Bound`, draws the Input for the meta's render. While `args.value` is set it
   keeps the value in React state: an edit sets the state at once, so the field
   shows it the moment it is made, and then goes to the args with `updateArgs`.
2. **An arg that comes back is told apart from one set in Controls** by a queue
   of the values sent from here, kept in the same state. When `args.value`
   changes, the component adjusts during render, React's pattern for state that
   follows a prop, since this repository's hooks lint forbids a state update in
   an effect and reading a ref during render. A value found in the queue is an
   echo: it and every older one leave the queue and the field keeps what it
   has, so a stale echo can no longer overwrite a newer key, however far behind
   the channel is. A value not in the queue was set in Controls, and is taken.
   The channel may drop intermediate echoes and deliver only the newest, which
   the same rule handles, since everything before it goes too.
3. **Unbound, nothing changes**: with `value` unset the field stays uncontrolled
   and keyed on `defaultValue`, KN-246, and setting or clearing `value` still
   starts it over, KN-252.
4. **Storybook hooks stay in the story render, React's in the child**, the split
   KN-245 needed: `useArgs` and Storybook's `useRef` in `Render`, `useState` in
   `Bound`.
5. **A story that types fast into a bound value**, `TypingIntoABoundValue`:
   value set in its args, twenty keys typed with no delay, and the field must
   hold every one. Under the test runner the args never change, TECH-DEBT 16, so
   the plain round trip there refuses every key and fails it outright. In
   Storybook's own preview it also waits for the recorded args to equal the
   field, the environment split KN-245 set up.

## What the prototype showed, 2026-09-10

Built before the check. The hooks lint accepts the adjustment during render,
tsc needed one narrowing under `exactOptionalPropertyTypes`, and the seventeen
Input stories pass under Vitest, the new one included. In a production
Storybook, on Default with `value` set to x7 through the URL args: twenty keys
typed with no delay end as x7 followed by all twenty, in the field and in the
story store's args alike; a Persian composition driven through
`Input.imeSetComposition` step by step and committed with `Input.insertText`
ends with «سلام» in both; and a value then set with `updateStoryArgs` is taken
by the field.

## What changes

- `Input.stories.tsx`: `Bound`, the meta's render drawing it, the new story.
- `story-docs/{en,fa}/Shared-Input.md`: the new story, both languages.
- The verifiers whose anchors are the lines this moves: KN-242, KN-246, KN-252
  and KN-258 on the render line, KN-249 on the binding, KN-245 on the Input
  line.
- `agent/scripts/verify/KN-253.mjs`.

## The verifier, clause by clause

Against a production Storybook build, served here, in Playwright's Chromium, the
field set bound with Storybook's URL args:

1. **Twenty keys with no delay**: typed into the bound field, the field ends with
   all twenty and the story store's args, what the Controls panel shows, end
   equal to the field.
2. **A composition through the browser's own IME**: through the DevTools
   protocol, `Input.imeSetComposition` step by step and `Input.insertText` to
   commit, Persian; the field and the args end with the composed text.
3. **Controls still win**: a value set with `updateStoryArgs` after typing is
   taken by the field.
4. The Input stories pass under Vitest, the new one included.
5. **THE CASE**: the plain round trip back, the field drawing `args.value`
   again, loses keys in the production build, and fails `TypingIntoABoundValue`
   under Vitest by name.
6. KN-249's verifier still passes: setting value in Controls, typing, the arg
   following.

## What I am unsure about

- Whether adjusting state during render passes `eslint-plugin-react-hooks` 7's
  compiler rules. It is the pattern React documents; if the lint refuses it the
  fallback is a keyed remount on a value set in Controls.
- Whether the echo queue can misread a value set in Controls that equals one
  still pending. It would be taken as an echo and ignored; the next edit or the
  next Controls change recovers it. That is rare enough to name and leave.
- Whether a real IME in Chromium drives React's onChange through composition
  the same way the protocol calls do. The protocol is what Chromium's own
  input goes through, which is why the card asks for it.

## How I will know it worked

`node agent/scripts/verify/KN-253.mjs` passes, the Input stories, the unit
project, lint and tsc pass, and typing fast into a bound field in the published
Storybook keeps every key.

## The check, and what changed after it

The second model found `Bound` and the adjustment during render sound, and
the ordered echoes right under dropped updates and batching. Two corrections,
both taken. A value set in Controls that equals one of the field's own edits
still in flight cannot be told from its echo, so "Controls still win" now names
that exception, in the component's comment and the verifier, the way KN-245's
rule names its own; the Controls check sets a value the field never sent. And
a final text is not proof of a composition, so the verifier now records the
field's native events and requires compositionstart, an update per step with
composing input events, and compositionend carrying the composed text. Probed
before writing it: the protocol calls produce exactly that sequence.
