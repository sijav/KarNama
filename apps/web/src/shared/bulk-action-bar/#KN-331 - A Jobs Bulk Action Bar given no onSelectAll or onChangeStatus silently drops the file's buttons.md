# KN-331 - A Jobs Bulk Action Bar given no onSelectAll or onChangeStatus silently drops the file's buttons

## The card

A child of KN-025, found by its roast.

**Why.** A bar that quietly loses Change status looks finished and is not, and the next screen to
use it is the board.

**Exit.** A Jobs bar cannot be written without both callbacks, by its type or by two components,
and the docs guard still reads every prop.

## Read before planning, 2026-09-15

- **The code.** `BulkActionBarProps` makes `onChangeStatus` and `onSelectAll` optional for both
  types, and the Jobs type draws Select all and Change status only when their callback is given,
  so a Jobs bar missing one draws a bar the file's `205:18` does not, with no warning.
- **The callers.** The board screen, `JobsScreen.tsx`, passes both callbacks; the network screen
  passes `type="contacts"` and neither; the stories' meta gives both. No bar in the product is
  short a button today.
- **Measured: docgen reads every prop of a union.** The card says react-docgen reads only the
  props a union shares. react-docgen-typescript 2.4.0, which `main.ts` and the docs guard use,
  run with `main.ts`'s options on a probe component, listed all six props for a union whose
  Jobs member requires both callbacks, both when the Contacts member declares them as optional
  `never` and when it does not declare them.
- **Measured: the checker refuses the wrong bars.** TypeScript 6.0.3, strict with
  `exactOptionalPropertyTypes` as `apps/web` is, refused a Jobs bar without Select all and a
  Contacts bar given Change status, and took the right bar of each type.
- **No type tests.** `apps/web` runs no Vitest typecheck and holds no `.test-d.ts`, and AGENTS.md
  asks before any `@ts-expect-error`.

## The approach

1. **The type.** `BulkActionBarProps` becomes a union: `count`, `onClear` and `onDelete` shared;
   a Jobs member of `type: 'jobs'` whose `onChangeStatus` and `onSelectAll` are required; and a
   Contacts member of `type: 'contacts'` that declares both as optional `never`, so docgen reads
   them as optional props of the one component and a Contacts bar cannot be given them.
2. **The component.** It narrows on `type` rather than on the callbacks: the Jobs type always
   draws Select all and Change status, and the checks for an undefined callback go, since the
   type no longer lets one be missing.
3. **The stories.** Every story draws its bar through one render, `barFor`, the bar a caller
   could write for the type its args hold: all four callbacks for the job list's type, and
   `count`, `onClear` and `onDelete` alone for the network's. It is the meta's render, and the two
   stories that render a page of their own call it where they spread their args into the bar. The
   args are unchanged, every callback's `fn()` in the meta, so the docs guard and the Actions
   panel read what they read today. The Contacts story then hands the bar only its own props, and
   Show code offers only a call that compiles.
4. **The proof that it cannot be written.** A plant, taken out again: a scratch file that imports
   the real component and writes a Jobs bar without `onSelectAll` and a Contacts bar with
   `onChangeStatus`, compiled with the repository's TypeScript and `apps/web`'s tsconfig; both
   must be refused, and the right bar of each type taken.
5. **The words.** The two callbacks' entries in both story docs say they are required for the job
   list's bar and cannot be given to the network's.

## File by file

- `apps/web/src/shared/bulk-action-bar/BulkActionBar.tsx`
- `apps/web/src/shared/bulk-action-bar/BulkActionBar.stories.tsx`
- `apps/web/src/shared/story-docs/en/Shared-BulkActionBar.md` and `fa/Shared-BulkActionBar.md`

## What I expect to be hard, and what I am unsure of

- **The render's type.** The meta's render is handed the component's props, and a story's render
  the args Storybook maps over them, whose network member holds the job callbacks as optional
  mocks; neither is assignable to the other. So `barFor` takes a type both are: the job list's
  member, or the network's without the two callbacks.
- **Docgen in Storybook itself.** The probe read a probe component; the guard and the Controls
  table read the real one, which the unit project and the look show.
- **What keeps it from coming back.** tsc refuses a short Jobs bar anywhere in `apps/web`, and
  `npm run build` and `lint:tsc` both run tsc; the plant shows it does today.

## How I will know it works

- The plant: tsc refuses the Jobs bar without Select all and the Contacts bar with Change
  status, and takes the right ones.
- The Bulk Action Bar's stories pass, the Jobs story still pressing all four buttons, and the
  unit project, the docs guard among it, lint and tsc are clean.
- On the Docs page, the Contacts story's Show code names neither `onChangeStatus` nor
  `onSelectAll`, and the Jobs story's names both.
- Seen in Storybook, both bars look as they did, in both languages and both schemes.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

It agreed that the union is the smallest correct change, that optional `never` is the right shape
for the network's member under `exactOptionalPropertyTypes`, that the docs guard reads all six
props, and that a compiler plant taken out again is an honest one-time proof. It found one
consequence the plan had missed, and it is real: the stories' meta gives both job callbacks and
the Contacts story sets only its type, so the Contacts story hands the bar two props the union
refuses. It asked for four changes to `BulkActionBar.stories.tsx`.

Measured before judging:

- **tsc refuses the stories as they are.** The whole `apps/web` program, with the union served in
  memory in place of the component, gave two errors, both in the stories: `ReachedBeforeTheList`
  and `ReachedFromInsideTheList` spread their args into the bar, and a story's args type holds,
  for the network's type, the meta's two job callbacks as optional mocks, which optional `never`
  refuses, TS2375. Nothing else in the program errs, the two screens included.
- **Show code offers the refused call.** On the Docs page in the dev Storybook, the Contacts
  story's snippet is a bar of `type="contacts"` given `onChangeStatus={() => {}}` and
  `onSelectAll={() => {}}`: Storybook builds it from the element the story renders.
- **The docs guard needs every callback in the meta.** `story-docs/guard.test.ts`'s
  `callbackProblems` fails a component with an `on*` prop that has no `fn()` in the meta's args,
  KN-207, and a story that sets its own callback to anything but `fn()`, KN-230.
- **A play runs on mount and on Remount only.** Storybook's `StoryRender.render` runs the play only
  when `forceRemount` is set, which the first render and Remount set and an args change, through
  `rerender`, does not.

Judged:

1. **Move the job callbacks out of the meta's args: not taken as written.** The guard fails the
   file for it, and the union keeps both callbacks props of the component, so the guard still
   asks for them. The problem it names is taken, in 3.
2. **Give every Jobs story one complete Jobs args object: already so.** The meta's args are that
   object, and every Jobs story takes them.
3. **Give Contacts only the shared callbacks and its type: taken where the bar receives them.**
   `barFor`, approach step 3, hands the network's bar `count`, `onClear` and `onDelete` alone.
4. **Offer no `type` control on a Jobs story whose play needs the job buttons: not taken.** A
   Controls change re-renders without the play, so the control cannot meet the Jobs story's
   assertions, and through `barFor` it draws a bar the props allow for either type. Only a reader
   who switches the type and then presses Remount runs the Jobs play against the network's bar,
   and that is so today, unchanged by this card.

tsc on the amended stories beside the union, both served in memory: no errors in the whole
program. Their lint cannot be measured in memory, since ESLint's types come from the component on
disk, so lint runs on the files once they are written.
