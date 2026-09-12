# Roast: KN-310, the Icon Button can be a Tooltip's trigger

Commit `1ff25a0`, closed by `d78efeb`. Read against `AGENTS.md`, `DESIGN.md`,
`agent/RALPH.md`, the KN-310 and KN-426 cards, MUI's own Tooltip and ButtonBase
sources at `@mui/material` 9.4.0, and a type probe run through `tsc --noEmit`.

**The work does what the card asked.** `npx vitest run --project storybook
src/shared/icon-button/IconButton.stories.tsx` is 7 of 7 green, and `InATooltip`
genuinely fails on the pre-change component: `aria-describedby` was never on the
DOM button, so line 219's `expect(describes).not.toBe('')` breaks before the
hover is ever reached. The exit condition is met literally.

What follows is everything wrapped around that.

---

## Critical 1. `TooltipTrigger` is decorative, and the mechanism depends on it being decorative

`apps/web/src/shared/icon-button/IconButton.tsx:19-22`, and the comment above it
at lines 6-18.

The comment states a contract: "Named and narrow rather than the whole of MUI's
surface: these are the props a trigger must carry, and nothing here invites a
caller to reach past the documented API into MUI's."

Both halves are false, measured rather than argued. A probe file compiled
against the real `tsconfig`:

| what was written                                      | `tsc --noEmit` |
| ----------------------------------------------------- | -------------- |
| `<IconButton {...{icon, 'aria-label', onKeyDown, id}} />` | **accepted**   |
| `<IconButton ... aria-haspopup="menu" aria-expanded={false} data-x="1" />` | **accepted** |
| `<IconButton ... onKeyDown={() => {}} />` (inline)      | refused        |

Two rules do this. TypeScript does not excess-property-check a JSX spread of a
variable, and it does not check a hyphenated JSX attribute name at all. So the
`Pick` refuses exactly one shape, a non-hyphenated prop written as an inline
attribute, and nothing else. `'aria-describedby'`, the one prop of the eight
that carries the accessibility contract, was already accepted before this
change and is dead weight on the list.

At runtime the narrowness does not exist either. `...trigger` on line 68 is a
rest spread: `Pick` is a type, not a filter, so `trigger` collects every prop
that is not one of the seven destructured by name. From MUI's
`node_modules/@mui/material/Tooltip/Tooltip.mjs:484-496` the clone actually
carries `title`, `className`, `...other`, and, in development,
`data-mui-internal-clone-element`, none of them on the eight.

**And that last one is load-bearing.** `Tooltip.mjs:500-504`:

```js
if (childNode && !childNode.getAttribute('data-mui-internal-clone-element')) {
  console.error(['MUI: The `children` component of the Tooltip is not forwarding its props correctly.', ...])
}
```

MUI's own props-forwarding detector reads an attribute that is not on the list
and only reaches the DOM because the spread is wide. So the code passes MUI's
check precisely by violating the contract its own comment declares. The next
person who reads that comment and tightens the runtime to match the eight, which
is the obvious tidy-up it invites, silently loses MUI's detector and keeps a
component that still looks correct.

**What it should be.** Either drop the `Pick` and extend the MUI props that are
actually forwarded, which is what the runtime already does, or keep the narrow
type and make the runtime match it with an explicit pick plus
`data-mui-internal-clone-element` passed on purpose. What must not stand is a
comment asserting a boundary that neither the compiler nor the runtime enforces.
At minimum the comment has to stop claiming narrowness it does not have.

## Critical 2. `ref` is typed to a button on a component that renders an anchor

`apps/web/src/shared/icon-button/IconButton.tsx:19-22`, the `'ref'` entry, read
against `href` on line 39.

`ComponentProps<typeof MuiIconButton>` resolves through the second call
signature of `OverridableComponent`
(`node_modules/@mui/material/OverridableComponent/index.d.ts:26`), which is
`React.ComponentPropsWithRef<'button'>`. So `IconButtonProps['ref']` is
`Ref<HTMLButtonElement>`, and the six handlers are
`…EventHandler<HTMLButtonElement>`.

But `href` makes the root an anchor:
`node_modules/@mui/material/ButtonBase/ButtonBase.mjs:146-150` switches
`ComponentProp` to `LinkComponent` when `href` is set. The probe:

```
error TS2322: Type 'RefObject<HTMLAnchorElement | null>' is not assignable to
type 'Ref<HTMLButtonElement> | undefined'.
```

That is not hypothetical. `apps/web/src/shared/contact-card/ContactCard.tsx:247`
already ships `<IconButton icon="mail" href={mailto:…} />`. A caller who wants a
ref on that button cannot type it, and the only way out is the `as` cast
`AGENTS.md` section 3 forbids without asking. The Tooltip itself is spared only
because `Tooltip.tsx:51` takes `Element | null`.

**What it should be.** `ref?: Ref<HTMLButtonElement | HTMLAnchorElement>`, or a
discriminated props union where the `href` variant carries the anchor ref, so
the type says what the component builds. `AGENTS.md` calls a type that does not
line up information, and this one is telling you the component has two shapes.

---

## High 1. The spread is on the wrong side, and the comment defends a hazard that cannot happen

`apps/web/src/shared/icon-button/IconButton.tsx:82-85`: "First, so what this
component documents wins: a tip describes a button, it does not rename or
disable one."

Walk the eight. `ref`, `aria-describedby`, `onFocus`, `onBlur`, `onMouseOver`,
`onMouseLeave`, `onTouchStart`, `onTouchEnd`: the component declares **none** of
them, so nothing later on the element collides with any of them. The ordering is
inert today.

The two props the comment names, `aria-label` and `disabled`, can never be in
`trigger` at all: they are destructured out by name on lines 62 and 65 before
the rest spread runs. And if a wrapper did inject them, the destructure would
apply them whatever the spread position, so `aria-label` would become the
button's name through `nameOf` and `disabled` would disable it. The ordering
supplies exactly none of the protection the comment claims for it.

Worse, first is the unsafe side. `Tooltip.mjs:512-521` composes the child's own
handler into the injected one:

```js
childrenProps.onMouseOver = composeEventHandler(handleTriggerMouseOver, childrenProps.onMouseOver)
```

so the injected handler already **is** the composite of MUI's and the child's.
The day this component grows an `onMouseOver` or an `onFocus` of its own, spread
first means the component's bare handler replaces MUI's composite, the tip stops
opening, and nothing says so: `Tooltip.tsx:51-67` only ever checks
`aria-describedby`, it never checks that a handler survived, and MUI's own
detector checks only the attribute. Two detectors, both blind to the exact
failure the ordering creates.

**What it should be.** `{...trigger}` last, with a comment saying the truth: MUI
has already folded the child's own handlers in, so the injected ones must win.

## High 2. The story's console watch starts too late to see the two reports that matter

`apps/web/src/shared/icon-button/IconButton.stories.tsx:208-211` and 239.

The spy is installed inside `play`, which runs after the story has rendered. The
two diagnostics that a half-fix would produce both fire before that:

- `Tooltip.tsx:62-65`, "took the ref but not the props", is called synchronously
  from the `ref` callback during commit. That is the exact partial failure, ref
  forwarded and props dropped, and the story cannot see it.
- MUI's own warning at `Tooltip.mjs:500-504` fires in a mount effect, also
  before `play`.

Only the 100 ms grace path at `Tooltip.tsx:42-50` survives long enough to be
caught, and that one is redundant: line 219 already fails first on the same
condition.

Second problem in the same three lines: `.mockImplementation()` **replaces**
`console.error` instead of calling through, so for the whole story the
`react-warnings.setup.ts` guard is blind. That guard records only format strings
containing `%s` and throws in `afterEach`; during `InATooltip` its `heard` array
can never fill. A React warning inside this story is downgraded from "fails the
test" to "noticed by `expect(said).toEqual([])` at line 239", and line 239 is
inside the `try`, so any earlier assertion throwing loses it entirely.

`BlankName`, eight lines above in the same file at lines 167-172, gets both
right: `beforeEach` so the watch predates the render, and a bare `spyOn` that
calls through, which is visibly true in the run above where its message still
printed to the real console. The new story diverged from a correct pattern in
its own file.

**What it should be.** Move the spy into `beforeEach` returning its teardown, as
`BlankName` does, and either call through or assert against the guard rather
than replacing it.

## High 3. The tooltip's copy is a sentence fragment borrowed from somewhere it means something else

`apps/web/src/shared/icon-button/IconButton.stories.tsx:193`.

`'This status has'` is not a message. It is the first third of one.
`apps/web/src/shared/menu/StatusMenu.tsx:37` is where it lives:

```ts
return `${i18n._('This status has')} ${formatCount(locale, jobCount)} ${rest}`
```

and `apps/web/src/shared/tooltip/Tooltip.stories.tsx:140` composes the whole
thing, count and "job opportunities; to delete it, first move them to another
column." included. `StatusMenu.stories.tsx:96` asserts against the composed
string, not the fragment.

So the Docs page for the Icon Button now shows a tooltip whose entire text is
«این وضعیت», "this status", cut off mid sentence, presented as the example of an
icon-only control explaining itself. `AGENTS.md` section 5 item 7 asks the Docs
page to be read in both languages; read in either, this one shows a control
whose explanation stops before it explains anything. The story took the fragment
to avoid needing `formatCount`, and paid for it in the one thing the story is
demonstrating.

**What it should be.** Compose the real reason the way `Tooltip.stories.tsx:140`
already does, or add a message of its own. A tooltip story whose tip says
nothing is a walk-through of the plumbing, not of the component.

## High 4. KN-426 states a mechanism that is not the mechanism, and the smaller fix is not mentioned

`node agent/scripts/todo.mjs show KN-426`, and the same sentence repeated into
`apps/web/src/shared/story-docs/en/Shared-IconButton.md:83` and the Persian
file's line 81: "the browser fires no pointer events on a disabled control".

That is not what blocks it. `ButtonBase.mjs:73-76`:

```js
[`&.${buttonBaseClasses.disabled}`]: { pointerEvents: 'none', cursor: 'default' }
```

MUI's own CSS is the block, and it is the only block in the `href` case, where
`ButtonBase.mjs:254-256` renders an anchor with `aria-disabled` and
`tabIndex={-1}` and no native `disabled` attribute at all. The card's own
evidence, a story that "fails with 'pointer-events: none'", is quoting the CSS
rule and then attributing it to the browser.

It also makes the card larger than the problem. The hover half opens today with
no change to any component and no design decision, using the wrapper MUI itself
documents:

```tsx
<Tooltip title={reason}><span><IconButton disabled … /></span></Tooltip>
```

The span is not disabled, so it receives the `mouseover`; KarNama's Tooltip is
satisfied because a span takes a ref and spreads props. Only the focus half
needs a decision. So "a tip wrapped round one never opens" is false as written,
and what is actually owed to the owner is one question about the tab order, not
a 2 point card.

**What it should be.** Correct the mechanism in the card and in both markdown
files, and say which half already works.

## Medium 1. The deferral is dressed as a design conflict that DESIGN.md does not contain

KN-426 says fixing it "would change what the Icon Button's Disabled story pins
from design node 512:742, that a disabled button is out of the tab order".

Node 512:742 draws a visual state. "Out of the tab order" is not in the file and
not in `DESIGN.md`: it is
`apps/web/src/shared/icon-button/IconButton.stories.tsx:139-140`, an assertion
the story made about MUI's behaviour, and `Shared-IconButton.md:8` and 35
repeating it. A story's own assertion is being cited to the owner as a Figma
constraint.

Meanwhile `DESIGN.md:611-613` has already decided the analogous case, in the one
place the file actually draws it:

> Delete blocked, `259:295`, is the Disabled item with the reason in a Tooltip
> beside the menu at its inline start; **the item stays in the keyboard's path so
> the reason can be read.**

`Menu.tsx:77` implements exactly that. So the contract already answers "a
control that cannot be reached, or one that can be reached and explains why it
is off" for the drawn case, and KN-426 offers it back to the owner as open.

**In fairness, the deferral itself is defensible and the roast should say so.**
The blocked delete the design draws at 259:295 is a Menu item, not an Icon
Button, and the Menu already does it. There is no drawn case of a disabled Icon
Button with a tooltip. What is wrong is KN-310's `why`, which claims the design
"explains a disabled action on hover, the delete that is off while a column
holds job opportunities" as the reason the Icon Button needs this, and then
closes without it. The card's stated reason for existing and the card's
deliverable are two different things, and the gap is not named in the close.

**What it should be.** Drop the 512:742 citation, cite `IconButton.stories.tsx`
line 139 as the thing that would change, and cite `DESIGN.md:611-613` as the
precedent that already points one way.

## Medium 2. Eight public props were added and the page that documents this component says nothing about them

`apps/web/src/shared/story-docs/en/Shared-IconButton.md:13-47` and the Persian
file.

The `## Props` section still lists seven. `ref`, `aria-describedby`, `onFocus`,
`onBlur`, `onMouseOver`, `onMouseLeave`, `onTouchStart` and `onTouchEnd` are now
part of the component's public type and none of them has an entry. The page
description at lines 1-11, the part `AGENTS.md` calls "explains the component to
whoever uses it", was not touched at all: the single most useful new fact about
this component, that it can be a Tooltip's trigger, appears only in a story note
at the bottom of the page.

The guard does not catch it, by design: `guard.test.ts:158` filters
`prop.parent?.fileName.includes('node_modules')`, and all eight are declared in
`@types/react`. That filter is the right policy for a component that spreads
onto a DOM element; it is the wrong fit for eight props chosen by hand and
advertised in a comment as the component's contract.

**What it should be.** One paragraph in the description in both languages saying
the button can be a tooltip's trigger and what it forwards. The prop entries are
arguably covered by the guard's stated policy and can be left.

## Low 1. The new story is pinned to Persian while KN-212 is open about exactly that

`IconButton.stories.tsx:201`, `globals: { locale: 'fa-IR' }`, with hardcoded
Persian at lines 213, 224, 230 and 237.

Locale pinning is a repo-wide convention, 210 occurrences, so this is not a
novel sin, and `Explained` does render through `i18n._` so the copy itself is
localised. But KN-212 is open and says "The tooltip stories are Persian-only, so
the four language and theme combinations cannot be checked", and this commit
adds one more tooltip story that an English reader on the Docs page sees in
Persian. It is also the only locale-pinned story in this file.
`StatusMenu.stories.tsx:96` shows the alternative: assert through
`i18n._('This status has')` rather than against a frozen literal.

## Low 2. Two board ids in a Docs page that 44 of 46 pages manage without

`Shared-IconButton.md:83` and `fa/Shared-IconButton.md:81` cite KN-426. Only
`Shared-Tooltip.md` does anything similar. A board id explains nothing to
whoever is using the component, which is the line `AGENTS.md` draws for what
belongs in this markdown at all.

## Low 3. The wrapper Boxes that exist only to be an anchor could now go

`KanbanColumn.tsx:237` and `JobCard.tsx:322` both wrap an `IconButton` in a
`<Box ref={…}>` purely to get an element for the Menu to hang from, because the
button forwarded no ref. It forwards one now. `JobCard`'s Box still earns its
keep on layout, `KanbanColumn`'s carries negative margins, so neither disappears
outright, but the ref can move to the button and nothing was filed to do it.

---

## What is right, said plainly

- The fix works, and the story proves it rather than narrating it: line 219
  fails on the old component before the hover is ever reached. 7 of 7 green.
- Asserting the description is present from the **first render**, before the tip
  opens, is the right clause to pin, and it is the one KN-231 exists for.
- Opening on focus alone, line 235-237, is the clause a hover-only trigger
  fails, and it is tested separately from hover rather than assumed from it.
- Asserting the button keeps its own name, not the tip's, is the KN-209 failure
  and it is checked at line 213 by querying the button by that name.
- Finding the disabled case and filing it instead of shipping a red story is the
  right shape of move under `RALPH.md` step 4, whatever is wrong with the card's
  wording.

## Note on the worktree

This roast wrote a throwaway type probe at
`apps/web/src/shared/icon-button/__probe.tsx` to answer the `Pick` question with
the compiler rather than from memory. A concurrent loop iteration's `git add -A`
swept it into commit `f740ba7` before it could be deleted. It has been removed
in `e0514c8`, which touches that path and nothing else. The three files modified
in the tree at the time, `JobsScreen.tsx`, `NetworkScreen.tsx` and
`SearchBar.tsx`, belong to that concurrent iteration and were not touched.

VERDICT
score: 6/10
criticals: 2
