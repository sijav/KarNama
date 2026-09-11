# KN-280 · The bound Input takes a Controls value equal to an edit still in flight for its echo, and can stay apart from the arg

Beside `Input.stories.tsx`, where `Bound` lives.

**Why, from the board.** Controls are how a reviewer drives a story, and a
panel value the canvas silently ignores describes the field wrongly, the
failure KN-245 fixed for the copy. Critical on the owner's order of 2026-09-10,
as a finding on a built component.

**Exit condition, from the board.** Bound tells its own writes from anything
else by a revision carried with each write, not by value, so an arg whose value
is not the one sent at its revision is taken, whatever the queue holds; a check
in a production build reproduces the sequence, an edit in flight, a Controls
value equal to it arriving after a newer edit, and ends with the field and the
arg equal; the exception is gone from the comment; the revision never reaches
the Input or shows as a control; and KN-253's and KN-249's verifiers still pass.

## What is there now

- `Bound` holds the value it shows, the values it has sent and not yet seen
  come back, and the arg it last saw. An arg found among the sent values is
  taken as the echo of that edit, and the queue drops up to it; one not found
  was set elsewhere and is taken. Its comment names the case it cannot tell
  apart: a Controls value equal to one of its own edits still in flight.
- Storybook's preview writes each `updateStoryArgs` into the store at once and
  renders later with whatever the store then holds, so renders coalesce.
  **Reproduced on 2026-09-11 in the static build**: in one tick, two edits,
  `x7a` then `x7ab`, then Controls set to `x7a`. The store takes each at once
  and ends at `x7a`; one render delivers `x7a`, found at the head of the queue
  and taken as the first edit's echo, and the field settles at `x7ab` with the
  arg at `x7a`. Nothing repairs it.

## The approach

1. **Each write carries a revision.** A counter in a React ref, started at the
   revision the store holds, so a remount keeps counting past it; incremented
   in `onChange`, which writes `updateArgs({ value, revision })`. The queue
   holds `[revision, value]` pairs.
2. **An echo is an arg whose revision this field sent, carrying the value it
   sent at that revision.** Then the field keeps its own value, which may be
   ahead, and drops the pairs up to that revision. Anything else was set
   elsewhere and is taken, the queue cleared. A Controls value leaves the
   revision where the field's last write put it, so its value is not the one
   sent at that revision, whatever the queue holds: the case the value alone
   could not tell apart.
3. **The revision never reaches the Input.** `Bound` takes it out of its args
   before spreading them, the rest still named `args` so the lines KN-245's and
   KN-253's verifiers anchor on stay. The meta's args are typed as the Input's
   props and the revision, and `argTypes` disables the revision's table row, so
   neither Controls nor Docs shows it.
4. **The comment loses the exception**, and so does KN-253's verifier's header.

## The sequences, walked

- **Coalesced**, the bug: the store goes `(x7a, 1)`, `(x7ab, 2)`, then Controls
  `(x7a, 2)`, and one render delivers `(x7a, 2)`. Sent at 2 was `x7ab`, so it is
  taken: the field shows `x7a`, as the arg does.
- **A late echo**: `(x7a, 1)` arrives while the field is at `x7ab`. Sent at 1
  was `x7a`: an echo, the field keeps `x7ab`, and `(x7ab, 2)` follows as the
  next echo.
- **Controls between an edit and its arrival**: the store holds `(x7a, 1)`,
  Controls sets `z9`, `(z9, 1)`: not what was sent at 1, taken. Then the edit
  still in flight lands, `(x7ab, 2)`: the queue was cleared, so it is taken
  too, and the field and the arg agree on the later edit.
- **A revision in the address bar** on load: the counter starts from it, and
  the first write is one past it.

## What changes

- `Input.stories.tsx`: `Held`, `Bound`, the meta's args type and `argTypes`,
  the comment.
- `agent/scripts/verify/KN-249.mjs`: its anchor on the write, which now carries
  the revision.
- `agent/scripts/verify/KN-253.mjs`: its header, which names the exception.
- `agent/scripts/verify/KN-280.mjs`: new.

## The verifier, clause by clause

1. The Input stories pass, with lint and the type checker.
2. **THE CASE, in a production build**: the sequence, two edits and then a
   Controls value equal to the first, fired in one tick so the renders
   coalesce, ends with the field and the arg equal, at `x7a`. A second build
   with the echo tested by value alone, the revision ignored, is the positive
   control: there they end apart, `x7ab` against `x7a`.
3. **The revision never reaches the Input**: after edits, the store holds a
   revision and no element in the story's root carries a `revision` attribute;
   a mutation spreading the whole args onto the Input puts one there and fails.
4. **No control shows it**: in the manager, `index.html`, after edits, the
   Controls panel for Default lists no row named revision; a mutation removing
   the `argTypes` entry makes one appear and fails.
5. The comment and KN-253's header no longer name the exception.
6. KN-253's and KN-249's verifiers pass.

## What I am unsure about

- Storybook's manager writes changed args into the address bar, so a revision
  will appear there after an edit. It is not a control, but it is visible, and
  a shared link carries it; the counter starting from it handles that.
- Whether disabling the table row also keeps the Controls panel from showing
  it in Storybook 10, which the manager check settles rather than assumes.
- The counter is a React ref read and written only in the handler, which
  eslint-plugin-react-hooks 7's rule against reading refs during render allows.

## The check, and what changed after it

The second model found the approach right for the one Bound the meta renders,
and confirmed that Storybook 10.5 stores an undeclared arg and hides a row whose
table is disabled. Taken: the revision is a declared numeric arg from 0, so an
address-bar revision parses as a number; the counter counts on from the larger
of itself and the store's revision; the change watched is the pair of value
and revision; the comment says Bound is one stream of revisions; and the check
covers a reset and an address-bar revision.

## What the build showed

Storybook's runtime, read while writing the check: an args update writes the
store at once, a rerender reads the store when it starts, and one asked for
while another is pending only sets a flag, so one later render delivers what
the store holds by then. So the one-tick sequence renders twice, `(x7a, 1)` then
`(x7a, 2)`, and the pre-KN-280 field failed it only because it watched the
value alone and saw no change in the second. The card's own case, one render
bringing only the final `(x7a, 2)` with `x7a` still among the sends, needs a
render already pending: the check puts one in flight first. Each sequence has
its own positive control, the echo by value alone for the first and the change
watched in the value alone for the second, and each ends apart, `x7ab` against
`x7a`. Storybook also trims a story's arg types to the controls it offers, so
Default carries no revision arg type and drops one from the address bar, while
a story that offers no list declares it numeric and out of every table.
