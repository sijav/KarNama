# KN-708 · Two more sentences in routes.ts overstate

From KN-701's roast. Both sentences are mine: one went stale when KN-697 landed and I did not update it, and one was
written by KN-701 itself, the card whose entire subject was an overclaim.

## 1. The count is wrong, and I counted rather than trusting the card

The module note says what is left is

> the three things it has no opinion about: which path each destination answers to, an address from when the page was in
> the hash, and the base.

`routes.ts` exports **five**, counted from the file:

| line | export        | what it is                                                      |
| ---- | ------------- | --------------------------------------------------------------- |
| 35   | `PATH`        | which path each destination answers to                          |
| 53   | `QUERY`       | the name the search goes under in the address, added by KN-697  |
| 75   | `searchStep`  | whether a settled search pushes a history entry or replaces one |
| 95   | `pathForHash` | an address from when the page was in the hash                   |
| 111  | `siteBase`    | the base                                                        |

react-router performs the write, but it has no opinion about the query key or the push and replace policy, so both belong
in that list. The note named three when there were three, and KN-697 made it five without touching the sentence.

## 2. The second sentence is true only past the auth gate

KN-701 wrote, above `PATH`:

> A destination with an entry and no route compiles, and the wildcard route in `App.tsx` then draws the board for it.

`App.tsx` line 93 is `if (!session || signingUp) return <AuthScreen />`, and it sits **before** `<Routes>`. So without a
session nothing draws any board, and the sentence describes the routed, signed in shell rather than the app.

The review asked for the guard traced rather than asserted, and the trace corrected me. `App` returns
`<BrowserRouter basename={BASE}><Shell /></BrowserRouter>` at lines 62 to 66, and `Shell` calls `useLocation` at 77,
`useNavigate` at 78 and `useMatch` at 87 and 88, every one of them ABOVE the guard at 93. `<Routes>` is at 160, inside
the single `return (` at 113 of that same component. So the router is not merely built before the gate: the shell has
already asked it which destination is showing. What the gate precedes is `<Routes>`, which is the only thing that
renders a route element, so there is exactly one path to a route and it passes the gate.

## 3. What each becomes

**The count goes, rather than growing.** The exit allows either listing what the module owns or naming the KIND of thing
left. I take the second: a list of five is a thing that goes stale exactly the way the list of three did, and this card
exists because a count went stale. Naming the kind, what the router has no opinion about, stays true when a sixth is
added.

**The fallback gets its condition, and the condition is the GATE rather than a session.** `AuthScreen` is what `Shell`
returns before `<Routes>` is reached. NOT before the router, which was my own overclaim, in this plan, in the card about
overclaims: `BrowserRouter` wraps `Shell` and the shell matches against the address before the gate. The gate precedes
the ROUTE TABLE, and the route table is what would have drawn the board.

**"A signed in reader" was ALSO false, and the third round caught that.** The gate is `!session || signingUp`, and
`signingUp` is `session !== null && needsName(session)` at `AuthProvider.tsx` line 194, which is a session whose person
has not given a name yet. So a reader can be signed in, holding a session, and still meet `AuthScreen`. The comment
names what the gate ASKS, anyone it is still asking to sign in or to give a name, rather than restating
`!session || signingUp`. That is the same decision as dropping the count and it is made for the same reason: a
restatement goes stale when the condition moves, and this card exists because a restatement went stale.

**And the sentence one clause later, which the review found and I had not.** The block ends **The type permits the gap;
the ROUTE decides what a reader sees in it.** That is a SECOND unconditional claim about what a reader sees, and adding
the condition above it while leaving this one standing would fix the sentence and not the paragraph, which is the exact
way both of the others survived KN-701. It becomes **what fills it**: the gap is what the route decides, which is the
boundary KN-701 drew, said without reaching past the router to the reader.

## 4. What must not change

- **The clause KN-701 deliberately left alone**, that react-router reads the address and writes it, which KN-700 made
  true by deleting the hand split. KN-701's close asserted it was untouched and this card keeps that.
- **The type boundary KN-701 drew**, that the mapped type permits the gap while the route decides what fills it. Its
  CAUSAL DIRECTION is untouched: the type still permits, the route still decides. What narrows is its reach, from what a
  reader sees to what fills the gap, because only the second of those is true before a session exists.

## 5. The proof

The exit asks for two things, and both are reading rather than running, which is right for a comment: read `routes.ts`
beside `App.tsx` so the fallback's condition matches the gate, and **count the module's exports against the sentence**,
which is what turned up five where the note says three.

`tsc --noEmit` and `eslint --max-warnings 0` clean, drift 0 on `routes.ts`, and **no em dash in this file**, though that
rule reaches `.md` and `.mdx` only, so the two already in `routes.ts` are out of its scope and KN-709 carries the wider
violation.

**None of those can prove a comment true**, which the review said plainly. So the close reads both comment blocks in
their FINAL form, whole, and classifies all five exports against the new sentence, rather than checking that the word
three is gone.

## 6. What the review changed, and what I checked myself

The review did not rule on naming the kind against listing the five, so that stands as argued: the list is the thing that
went stale here. It answered the question about KN-701's lesson instead, and its answer is the amendment above. Reread
each full comment block in its final form, classify all five exports against the new statement, and trace the guard
rather than assert it, because typecheck and lint cannot prove comment truth. **The most likely error it named was
leaving adjacent wording that still implies an exhaustive list or an unconditional fallback**, and there was exactly such
a sentence sitting one clause away.

**Is there a THIRD overstatement?** I checked this module's other countable claims rather than reading past them:

- the `QUERY` block's "the first thing in `src/screens` to import from `src/app`": nothing else in `src/screens` imports
  from `src/app`, only the two screens and only `QUERY, searchStep`. True.
- the same block's "this file imports `shared/navigation` and nothing else": one import line, line 1. True.
- the `searchStep` block's "proved by `routes.test.ts` with no clock at all": the file exists, names `searchStep`, and
  holds no fake timer. True.

So the two sentences this card names, plus the one the review turned up, are the whole of it in `routes.ts`.

**The second round then found a third overclaim, and it was in this plan.** It endorsed all three changes as the
simplest sufficient fix and confirmed react-router 7.18.3 still supports the approach, then named the likely mistake as
carrying an incorrect "before the router" explanation into the comment or the close note. It was already here, twice,
and is corrected above. KN-701's lesson is holding up under its own weight: I verified the sentence the card named and
then wrote a false one describing it.

**The third round then found a fourth, in the replacement wording.** It approved the work conditionally, with the
`signingUp` qualification fixed, and it was right: my own fix said "a signed in reader", and a reader mid signup is
signed in. Four rounds, four overclaims, each one inside the correction for the last. That is this card's real finding,
more than any single sentence: the paragraph I am FIXING is not the paragraph I am WRITING, and I check the first while
trusting the second.
