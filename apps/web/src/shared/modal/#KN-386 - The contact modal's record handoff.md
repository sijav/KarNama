# KN-386 · The contact modal's record handoff

Beside the component, per `agent/RALPH.md` step 2b. Child of KN-031, from the
KN-347 roast: two findings with one fix.

## The card

**Why.** Saving one contact's form into another's record is data loss the user
cannot see, and the page that opens this modal will load its record
asynchronously.

**Exit condition.** Edit's props require `recordId` and `initial` by type, a
discriminated union on mode; the form follows `initial` until the user edits it
and never after, so a record that arrives after the id, or late after opening,
fills the form; stories show the split handoff and the late record filling the
form, and a fresh copy mid-typing still keeping it.

## What is actually wrong

1. `recordId` is optional, so an Edit caller can leave it out. Swap `initial`
   from one contact to another while open and the form keeps the first one's
   values: the reset is keyed on an id that never changes. The Edit story
   itself omits the id.
2. The id and the data can arrive in different renders. When `recordId` becomes
   B while `initial` is still A, the reset writes A's values and marks B seen;
   the next render, which brings B's data, changes nothing. An Edit opened
   before its record has loaded starts empty and ignores the record when it
   arrives.

## The approach

**The type first.** `ContactModalProps` becomes a union on `mode`:

- `{ mode: 'add'; initial?: never; recordId?: never }`
- `{ mode: 'edit'; recordId: string; initial: ContactModalValues }`

with everything else shared. Then an Edit without its record cannot be written,
which is the first finding gone at compile time rather than at runtime.

**Then the rule.** Not "reset when the id changes", which is what makes a
late-arriving record invisible, but: **the form follows `initial` until the
reader edits it, and never after.** So

- a flag, `edited`, set the first time the reader changes any field;
- while `edited` is false, the values ARE `initial`: a record arriving late,
  in any order, simply appears;
- a new `recordId` clears `edited`, because that is a different record and the
  reader has not touched it;
- opening clears it too.

That makes the split handoff and the late record the same case, which is why
the card calls them one fix.

## What I am unsure about

- Whether to keep `values` in state at all while `edited` is false, or to
  derive. Deriving is simpler to reason about; the field components are
  controlled, so it has to stay controlled either way.
- What "the reader edits it" means for the job select, which is a choice rather
  than typing. It counts: it is a change the reader made.
- Whether the Delete action's presence should move to the edit branch of the
  union as well. It is `onDelete?`, and only Edit draws it, so the union can
  say that too; the card does not ask, and doing it is small and honest.

## How I will know it worked

Three stories: the id and the record arriving in different renders; an Edit
opened before its record exists, with the record arriving after; and a fresh
copy of the same record arriving while the reader is typing, which keeps what
they typed. And the existing Edit story, which omits the id, has to change,
because the type will no longer allow it.
