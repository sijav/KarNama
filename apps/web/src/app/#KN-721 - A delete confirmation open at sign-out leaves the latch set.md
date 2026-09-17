# KN-721 · Dropped, because the shell cannot hold a stale latch across a sign-out

KN-721 said the shell's one-shot delete-confirmation latch, KN-716, could survive a sign-out and settle focus on a
later ordinary navigation. It was filed from KN-716's roast, taken, planned, built, measured, and **dropped: the state
it describes is one the tree cannot reach.** This file is the record, so the same line in that roast does not become
the same card again.

## What the card claimed

With the board's delete confirmation open the latch is `true`. The shell's signed-out branch at `App.tsx:128` clears
`shown` and returns without touching the latch. So a stale `true` survives into the next sign-in and settles focus on
the navigation after it.

## The first correction, from reading

`JobsScreen`'s reporting effect has no cleanup, which is the part that gets remembered. But it is a layout effect
with `[deleting, onJobDeleteConfirmationOpenChange]` as dependencies, so it also runs on MOUNT, and React runs a
child's layout effects before its parent's. A board coming back reports `deleting !== null`, which is `false`, before
the shell's effect looks at anything. So the plain path in the card clears the latch on its own way in.

That left a narrower path: sign out with the confirmation open, move the route while signed out so the screen that
returns is the NETWORK page, which reports nothing, then navigate to the board. The plan was built around it and a
story was written to drive it.

## The second correction, from measuring

**The story passed.** A story whose whole job is to show a defect passing is the wrong outcome, so the shell was
instrumented with a per-mount identity and a log of every effect run and every report from the board:

```
board reports open=true
run life=886 in=false up=false screen=jobs    before=jobs      latch=true
run life=886 in=false up=false screen=network before=undefined latch=true
run life=865 in=true  up=false screen=network before=undefined latch=false
board reports open=false
run life=865 in=true  up=false screen=jobs    before=network   latch=false
```

The latch survives the sign-out and the Back, exactly as the card said, and is `true` at both. Then `life` changes
from 886 to 865 at the sign-in: **the shell was remounted**, so `useRef(false)` was rebuilt and the latch was gone
before any effect could read it.

## Why, and why it is not a story artifact

`AppProviders` renders `OwnBoard`, which is:

```tsx
const owner = session?.phone ?? ''
return <RecordsProvider key={owner} owner={owner}>{children}</RecordsProvider>
```

KN-421 put that key there so signing in as somebody else reads that reader's own board rather than keeping the last
one's in memory. `main.tsx` renders `<AppProviders><App /></AppProviders>`, so `App`, `Shell` and every ref the shell
holds are inside that key. **Any change of reader changes the key and unmounts the subtree**, in the product exactly
as in a story.

The one asymmetry is which side of the sign-out the remount lands on. A story seeds its session in its own
`AuthProvider` BELOW `OwnBoard`, so `owner` is `''` throughout and the remount happens only at the sign-in. The
application has a single provider above it, so `owner` goes from the phone to `''` and the remount happens at the
sign-out, even earlier. Either way, a latch cannot outlive the session it was set under.

## What was kept, and what was not

Nothing was kept. The two stories written for this, and their entries in both docs files, were removed rather than
left passing: they pass because the remount makes them blind to the latch entirely, so they would go on passing if
the latch logic were deleted. A test that cannot fail for the reason it names is the defect KN-722 and KN-659 are
about, and committing two more of them to record a non-defect would be worse than having no story at all.

`App.tsx` is untouched. The latch and its consumption are correct as KN-716 shipped them.

## What to do instead, if this comes up again

The question worth asking is not whether the latch goes stale, which it cannot, but whether the remount itself is
right. Every session change throws away the whole app tree, and that is deliberate, KN-421. It also means no
cross-session staleness bug of this shape can exist anywhere in the shell, which is worth knowing BEFORE writing a
plan about one.
