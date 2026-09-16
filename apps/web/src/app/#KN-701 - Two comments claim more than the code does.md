# KN-701 · Two comments in the router work claim more than the code does

From KN-698's roast, and both comments are mine. **Half of this card has already been fixed by another card**, which is
the first thing to establish rather than the last.

## 1. The second overclaim is now TRUE, and KN-700 made it so

The card says `routes.ts` and `App.tsx` "both say react-router reads and writes the address, while `Shell` still parses
route segments itself". That was exactly right when it was filed. **KN-700 deleted the hand-split**: `current` now comes
from `useMatch` against the same `PATH` values the routes are given.

So `routes.ts`'s module note — _"react-router reads the address and writes it… What is left is the three things it has no
opinion about: which path each destination answers to, an address from when the page was in the hash, and the base"_ — is
now accurate. The router reads through `useLocation`, `useMatch` and `useSearchParams`, and writes through `useNavigate`
and `setSearchParams`. The three things it names are precisely what remains: `PATH`, `pathForHash`, `siteBase`. The only
hand-parsing left is inside `pathForHash`, which is the LEGACY HASH migration, and the same sentence scopes it that way.

**So this half is left alone and recorded, not reworded.** Editing a sentence that has become true, to make it look
edited, would be worse than leaving it.

## 2. The first overclaim is real, and it makes two false claims in one sentence

Above `PATH`:

> The mapped type ties each to its own key, so a destination added with no route, or a route pointed at the wrong page, is
> a type error rather than a page that quietly falls through to the board.

`PATH` is typed `{ [D in Destination]: `/${D}` }`. What that **does** enforce:

- **An entry for every destination.** Adding a member to `Destination` without adding its entry is a type error.
- **Each entry's value is its own key's path.** `{ jobs: '/network' }` is a type error.

What it does **not** enforce, and the sentence claims both:

- **That a `<Route>` exists.** A destination with a `PATH` entry and no route compiles, and falls through to the wildcard
  — the board — which is the exact outcome the sentence promises it prevents.
- **That a route renders the right page.** `<Route path={PATH.add} element={<NetworkScreen />} />` is well-typed.

## 3. What it becomes

Say what the mapped type enforces, and name what it does not:

- an entry for every destination, and each entry's value being its own key's path;
- and that **no `<Route>` is required to exist**.

**The fallback is NOT a property of the type**, and this is the trap the review flagged. The type merely PERMITS the
omission; it is this `App.tsx`'s wildcard route that draws the board. A replacement comment that says "the type makes it
fall through to the board" swaps one overclaim for another, so the causal boundary has to be explicit: the type allows the
gap, the wildcard route decides what a reader sees in it.

That last clause is the useful half for the next reader: it is the thing they would otherwise assume the compiler catches.

## 4. The proof

The card's exit says "checked by reading the two files", and reading settles the wording. But the sentence I am replacing
was wrong _about the compiler_, so the replacement is **demonstrated rather than asserted**: a temporary experiment adds a
fourth member to `Destination` and runs `tsc --noEmit`, which should error on the missing `PATH` entry and say **nothing**
about the absent `<Route>`. Then the same experiment with the entry added and no route, which should compile clean. Both
are reverted from a byte snapshot and the restore is verified by comparison, not by Git state.

**IT RAN, AND IT PROVED BOTH HALVES.** Step one, a fourth `Destination` with no `PATH` entry: `tsc --noEmit` FAILED, and
the failure named `routes.ts` and the missing key. Step two, that entry added and still no `<Route>` anywhere:
`tsc --noEmit` PASSED. Both files restored byte for byte, verified by comparison rather than by Git state. So the
replacement sentence is demonstrated rather than asserted — and the causal boundary is demonstrated with it, since the
type permitted the gap and nothing but the wildcard route decides what fills it.

**Safe to run because nothing else is keyed exhaustively by `Destination`**, checked before writing the experiment:
`DESTINATIONS` is an ARRAY of `{ id, icon }`, `useDestinationName` ends in a plain `return`, and `Sidebar` and `TabBar`
merely take a `Destination`. Otherwise step two's clean run could have been some other map being satisfied rather than the
absent route being tolerated.

**Drift 0** on `routes.ts`, and `tsc` and `eslint` clean afterwards.

## 5. What the review settled

**Approved, and the second half IS moot — checked rather than taken from me.** Normal path and query reading and writing
go through `useLocation`, `useMatch`, `useNavigate` and the screens' `useSearchParams`, with no hand-split of route
segments left anywhere. The only direct `window.location` and `history` work is the legacy-hash migration and resolving
the configured base before the router exists, and the module note names both as exceptions. **So it is left unchanged**,
and this card is not closing half-done.

**The mapped-type reading is exact**: a property for every `Destination`, each value that key's `/${D}` literal, and
nothing about `<Route>` declarations or route elements. It also guarantees nothing about runtime completeness, routing,
rendering, or `DESTINATION_IDS` being updated — worth knowing, since that is a separate array the type does not police.

**No third comment overclaims** in either file. The `useMatch` comment is sound, because both concrete routes are given
the same `PATH.network` and `PATH.add` values it matches against.

**The experiment is worth it on a one-point card, kept minimal**, in two steps: prove the missing property fails
`tsc --noEmit`, then add only its `PATH` entry and prove `tsc --noEmit` passes with no route. Snapshot and byte-restore.

**And the guard that changed the wording**, now in section 3: the fallback is not a property of the type. The type permits
the omission; the wildcard route draws the board.
