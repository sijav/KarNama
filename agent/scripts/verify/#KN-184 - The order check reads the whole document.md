# Plan — KN-184, read the block, not the document

## The task, from the board

`agent/scripts/verify/KN-166.mjs` says in its own comment that it checks the
command block rather than the prose. It does not. It takes `indexOf` of the
first `todo move <id> done` and the first `roast.py task` anywhere in the
whitespace-collapsed document and compares those positions. An editor who leaves
a correctly ordered example anywhere above, and reverses the real step 5 block,
passes it.

**Exit condition.** The check extracts the fenced code block belonging to the
close-and-roast step and compares the order of the commands WITHIN it, so a
document carrying an earlier correctly-ordered example and a reversed real block
is reported rather than passed.

## Why this is not a new gate

Rule zero forbids inventing gates. This invents nothing: the check already
exists, already runs, and already claims in a comment to read the block. The
work is making the claim true. A check that overstates what it reads is worse
than a narrow one, because the comment tells the next reader the block is
covered and they stop looking.

## What is actually there

The file has exactly two fenced blocks, at lines 113 and 153. The second is the
close-and-roast one. So "find the block" is real parsing rather than counting:
picking "the second fence" would break the moment someone adds a third.

## The approach

1. Collapse nothing. Work on the RAW text, because fences are line-structured
   and the current code destroys that by collapsing whitespace first. The
   existing prose checks keep their collapsed copy; this one needs the original.
2. Extract every fenced block, ```` ```lang ... ``` ````, as a list of bodies.
3. Select the ones containing BOTH commands. There should be exactly one; if
   there are none the check fails saying the block could not be found, and if
   there are several it checks all of them, because a second block giving the
   opposite order is exactly the defect.
4. Inside each, compare the line index of the close against the roast.

## How I will know it worked, and the mutation that matters

The mutation is the one the roast described, and it must fail:

> a document with a correctly ordered example block ABOVE, and the real step 5
> block reversed.

That is the case today's check passes. Two more: the real block reversed with no
decoy, which the current check does catch, and the fences removed entirely so no
block is found, which must report that rather than passing.

## What I am unsure about

- **Whether to check every matching block or only one.** Checking all of them is
  stricter and could reject a file that deliberately shows a wrong-order example
  to warn against it. Nothing does that today, and I would rather be strict and
  find out.
- **Whether the prose check should stay.** The file says the right thing in
  prose and did the wrong thing in the block, so both matter, and they are
  different assertions. I intend to keep both and let each fail with its own
  message.
