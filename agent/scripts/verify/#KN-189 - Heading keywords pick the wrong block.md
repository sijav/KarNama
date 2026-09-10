# Plan — KN-189, mark the normative block instead of guessing it

## The task, from the board

`lib/prompt-order.mjs` selects the normative block with `findIndex` over
numbered lines containing both "done" and "roast". Any EARLIER numbered step
whose prose happens to contain both words wins. The KN-184 reviewer ran a
fixture with step 2 headed *"If a task is done, roast it only after closing
it"* and step 5 headed *"Close the task, then request review"*, and
`closesBeforeRoasting` returned `ok: true` while step 5's block was reversed.

**Exit condition.** The normative block is identified by an explicit stable
marker rather than by keywords in a heading; both fixtures the reviewer ran are
covered as cases; and each fails before the fix and passes after.

## Why the previous two attempts failed, since this is the third

1. **Whole document.** Compared the first close command and the first roast
   command anywhere in the text. A decoy example above defeated it.
2. **Heading keywords.** Reads the right block only when the right step is the
   first one whose prose contains both words. Prose defeated it again.

The pattern is the point: **every version so far INFERRED which block was
normative from the words around it, and words are what an editor changes.** A
third inference will fail a third way. What is needed is a declaration.

## The approach

An HTML comment immediately above the fence:

```
<!-- roast-order -->
```

- It is invisible in every markdown renderer, so it costs the reader nothing.
- It cannot be produced by accident: no amount of rewording a heading creates
  one.
- It is greppable, so "which block is normative" has a literal answer.

`closeAndRoastBlock` finds the marker, takes the next fence, and reads inside
it. **If there is no marker it says so** rather than falling back to guessing,
because a fallback is the inference this card exists to remove: a file with no
marker would silently go back to being checked the old way.

That refusal is not a new gate. It is this check reporting that it cannot answer
the question it was asked, which is the honest result when the input carries no
answer.

## What I will change

- `agent/scripts/verify/lib/prompt-order.mjs`, the selection.
- `agent/scripts/verify/KN-184.mjs`, whose fixtures gain the marker, plus the
  two the reviewer ran as new cases.
- Both loop prompts, KarNama's and SkipBureau's, gain the marker line.

## What I expect to be hard, and what I am unsure about

- **Editing the sibling's prompt again.** That session is live. The marker is
  one line and additive, and the last change there is still uncommitted, so this
  compounds an already-open edit rather than starting a new one. Still worth
  saying out loud rather than doing quietly.
- **Whether a marker is really different in kind, or just a better guess.** I
  think it is different: a heading keyword is a property the text happens to
  have, and a marker is a statement somebody made on purpose. But the failure
  mode is now "somebody moves the marker", and I want that checked rather than
  assumed away.
- **What the check should do about a SECOND marker.** Two markers means two
  normative blocks, which is either a mistake or a file that has grown a second
  rule. I lean towards checking every marked block, since each one claims to be
  normative, and that is different from checking every fence.

## How I will know it worked

Both of the reviewer's fixtures fail before the change and pass after, the
existing KN-184 and KN-166 checks still pass, and a fixture with no marker is
reported as unmarked rather than guessed at.
