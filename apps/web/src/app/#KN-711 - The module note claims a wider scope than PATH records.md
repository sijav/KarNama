# KN-711 · The module note says `routes.ts` holds the paths this app answers to, and the app answers more

From KN-708's roast, 2026-09-17. Child of KN-698 by the one level rule. The sentence is mine: KN-708 wrote it while
removing a stale count, so this is the fifth overclaim in that chain and the smallest of them.

**Why**, from the board: a reader adding a route learns from this note what `routes.ts` is for. Told it holds the paths
the app answers to, they either look here for the wildcard and do not find it, or they add an entry to `PATH` for a
path that has no destination, which the mapped type then rejects for a reason the note has made confusing rather than
clear.

**Exit**, from the board: the `routes.ts` module note names `PATH`'s scope as the path each DESTINATION answers to
rather than every path the app answers, while keeping the kind and not count framing KN-708 chose. Checked by reading
the whole note beside `App.tsx`'s route table, the wildcard included, so the note is true of the table rather than of
one entry in it.

## 1. The claim, and what the app actually answers

The note reads, as it stands:

> What is left is what the router has NO OPINION about: the paths this app answers to, how it spells a search in the
> address and steps through one, the address from when the page was in the hash, and the base.

`PATH` is `{ [D in Destination]: `/${D}` }`, so it records three: `/jobs`, `/add`, `/network`.

The app answers more than three, and the route table says so itself. `App.tsx` line 166 is
`<Route path="*" element={board(false)} />`, under a comment that reads: "Anything else is the board, which keeps what
Pages serves from `404.html` showing the archive rather than redirecting a mistyped address somewhere else, KN-505 and
KN-698." So every path reaches this app, and every unmatched one draws the board.

"The paths this app answers to" therefore describes the ROUTE TABLE, not `PATH`. The two differ by exactly the wildcard,
which is the entry a reader would come here looking for and not find.

## 2. What changes: one phrase

> which path each destination answers to

That was the wording before KN-708, and it was exact. It goes back, inside the kind framing KN-708 introduced, which is
the part of that card worth keeping.

Nothing else in the note moves. The sentence after it, that this is "a kind and not a count, deliberately", with the
history of the number that went stale, is KN-708's fix for the original defect and stays exactly as it is.

## 3. What must not change

- **The kind, not a count.** The list is not re-numbered and no count returns.
- **The clause KN-700 made true**, that react-router reads the address and writes it, which KN-701 protected and
  KN-708 left alone.
- **The count history sentence**, which records why the note stopped counting. Removing it would lose the lesson that
  this whole chain exists to keep.
- **`App.tsx` is READ, not edited.** Nothing about the route table changes. The review flagged this because the file
  list I sent it named `App.tsx` as a changed file, contradicting this bullet. The bullet was right and the list was
  wrong: one file changes, `routes.ts`, and by one phrase.

**What the review sharpened, and it matters to the wording.** Its warning was against treating the mapped type as a
runtime routing contract: it guarantees a `` `/${D}` `` literal for every `Destination` key and says nothing about
route declarations. Reading the table with `/jobs` in mind, as it asked, shows how far that goes. `App.tsx` declares
THREE routes, `PATH.network` at 161, `PATH.add` at 162 and `*` at 166, and there is **no route for `PATH.jobs` at
all**: `/jobs` reaches the board through the wildcard exactly as an unmatched address does, and `PATH.jobs` appears in
that file only in `navigate` calls at 108 and 133.

So the note is describing the MAP, not the route table, which is the whole narrowing this card makes: "the paths this
app answers to" is a claim about the table, and the table answers everything. "Which path each destination answers to"
is a claim about the map, and it is the phrase the `PATH` block's own comment already uses, so restoring it also keeps
the file consistent with itself.

## 4. The proof

Reading, which is right for a comment, and the exit names both halves: read the WHOLE note, not the phrase, and read it
beside `App.tsx`'s route table with the wildcard included, so the note is judged true of the table rather than of one
entry in it. That distinction is the lesson of KN-701 and of KN-708: verifying the clause a card names is not verifying
the paragraph it sits in.

`tsc --noEmit` and `eslint --max-warnings 0` clean, Prettier drift 0 on `routes.ts` against its committed copy, which
measured 0 before the edit, and the change is comments only. Per `AGENTS.md` line 461, recorded by KN-710 an hour ago,
that last claim is NOT proved by stripping comments and comparing: it is proved by reading the changed lines, which for
a one phrase edit is the whole of the diff.

## 5. What the review ruled, and what I checked myself

**The ruling**: the simplest correct implementation is one comment phrase edit in `routes.ts`, with `App.tsx` read
only. It confirmed the library facts from source, react-router 7.18.3, a declarative `Route` rendering its element when
its pattern matches, and star routes as the mechanism for unmatched addresses. Its one correction was to the FILE LIST
I sent it, which named `App.tsx` as changed; section 3 records that.

**Question 1 is answered by a warning rather than a yes.** Do not treat the mapped type as a runtime routing contract:
it guarantees a `` `/${D}` `` literal for every `Destination` key and says nothing about route declarations. Read
against the table, as it asked, that is sharper than it sounds, because `/jobs` has no route of its own. So the phrase
is exact ABOUT THE MAP, which is what this module owns, and section 3 carries the check.

**Question 2, the second defect a clause away, which four of the five cards in this chain found.** I checked the
remaining items against their exports rather than assuming: "how it spells a search in the address and steps through
one" is `QUERY` and `searchStep`; "the address from when the page was in the hash" is `pathForHash`; "the base" is
`siteBase`. Each names its own export and claims nothing about the router or the route table, so none of them
overstates the way the first did. This is the first card in the chain where the answer is genuinely no.

**Question 3, whether a paragraph corrected five times should be shortened rather than patched again**, the review did
not answer and this card does not act on. Shortening it would delete the count history that records why the note
stopped counting, which is the lesson the whole chain exists to keep. If it is genuinely too long that is its own card
and its own decision, not something to do quietly inside a one phrase fix.
