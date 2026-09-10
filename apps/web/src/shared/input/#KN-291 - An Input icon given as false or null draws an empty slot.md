# KN-291 · An Input icon given as false or null draws an empty slot, moving the text as if an icon were there

Beside `Input.tsx`, which is where the change lands.

**Why, from the board.** The conditional that turns an icon off is the way
callers write it, and it leaves a hole in the field the width of an icon.
Critical on the owner's order of 2026-09-10, as a finding on a built component.

**Exit condition, from the board.** An Input given null, false, true or an empty
string for either icon draws no slot and its text sits 16 from that edge, as
with no icon at all; a story passes false for one icon and null for the other
and asserts no slot and the 16, and a mutation back to the undefined check fails
it by name.

## The approach

1. A `drawn` test in `Input.tsx`: a node draws something unless it is
   undefined, null, a boolean or an empty string, the values React renders as
   nothing. A slot is drawn only for a node that draws something.
2. A story, `IconsTurnedOff`, two fields: one given `false` and `null`, one
   given `true` and `''`, each asserting no slot on either side and its text box
   16 from both edges, through the same `slotsAreTheFiles` as the icon stories.
3. KN-267's verifier anchors its swap mutation on the two adornment lines,
   which change; they follow.
4. A verifier: the stories pass; the leading check back to `=== undefined`
   fails `IconsTurnedOff` by name, and the trailing one too.

## The check, and what changed after it

The second model confirmed React 19 renders nothing for the four values and
that the direct check is right, and found what it misses: an empty array, an
empty fragment, or an icon component that returns null, which the Input
cannot know about before React renders it, would still get a 20 by 20 slot.
So the slot also collapses when it renders empty, `:empty` taking it out of
the flex row and its gap, and the story covers an empty fragment and a
component that renders nothing as well. The text's 16 is measured to the
input's box, the proxy KN-283 replaces for every Input story.
