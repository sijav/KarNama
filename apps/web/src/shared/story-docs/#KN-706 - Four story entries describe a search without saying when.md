# KN-706 · Four story entries describe a search without saying when it acts

From the PARENT round on KN-695 with KN-696, the round asking whether KN-695 is actually finished.

**This card's exit permits either answer**: add the timing to the four entries, or record why a story entry describes only
what its scenario shows. **Two review rounds have already split on it**, which is why the card records both readings, and
this plan argues for the second on evidence rather than on preference.

## 1. The four entries, in full

- **`Working`**, `en/Screens-Jobs.md`: _"A board being used: searching narrows every column, a card opens the job
  opportunity, and selecting one brings up the bulk bar, which moves it to another status; its confirmation, pressed again
  as it closes, moves it once."_ Persian at `fa/Screens-Jobs.md`, same shape.
- **`Keeping`**, `en/Screens-Network.md`: _"The page being used: somebody added from the empty state, a search that finds
  nobody and then does, their details opened and closed, and the two of them selected and deleted through the bar at the
  foot."_ Persian at `fa/Screens-Network.md`, same shape.

**Both are ITINERARIES**: a colon, then a comma-separated list of what the play walks through. In `Working` the search is
one item of four; in `Keeping` one of five. Neither is a statement about how the search behaves.

## 2. My first argument was wrong, and the check that killed it

I was going to argue that **no story entry in this format ever carries timing**, so adding it would be a first. That is
false, and I found it by grepping the other documents before writing rather than after:

- **`### Debounced`**, `en/Shared-SearchBar.md`: _"A word typed quickly: no search while the keys come, then one search
  with the whole word."_ Timing, in a story entry, with no clock language needed.
- **`### ResetWhilePending`**, same file: _"Typed, then emptied by the page before the pause ends…"_
- **`### CountsDownToAResend`**, `en/Screens-SignIn.md`: _"The minute before another code may be asked for, counted down
  in Persian digits on a held clock…"_, a SCREEN's story entry, stating timing outright.

So entries may carry timing. The convention I claimed does not exist.

**One near-miss worth recording**: `Shared-SearchBar.md` line 62 also states timing, but it is under `### onSearch`, a
**prop** entry, not a story. Citing it as a story entry would have been exactly the looseness this family of cards exists
to remove.

## 3. The distinction the evidence actually supports

**An entry states timing when the timing is what that story DEMONSTRATES.**

`Debounced` exists in order to show the pause, it is the whole story. `ResetWhilePending` exists to show what happens
when a page empties the field mid-pause. `CountsDownToAResend` exists to show the minute. In each, remove the timing and
there is no story left.

`Working` and `Keeping` are the opposite: remove the timing and every step still stands, because the timing was never what
they were showing. **They are the plays that exercise a board and a page end to end**, and the search is one move in the
sequence.

**So the contract belongs where it now is**, in the introductions, which KN-695 and KN-696 corrected in all four files, and the entries stay itineraries.

## 4. What this card therefore does

**No edit to the four entries.** It records, in this plan, why: the format puts a behaviour's contract in the
introduction and in any story built to demonstrate it, and lists steps in the entries that merely walk through it. The
exit's second branch, taken deliberately and with the counter-examples that nearly overturned it written down.

**And it names where the timing WOULD belong on these screens if it belonged in an entry at all**: a story built to show
the pause, as `Debounced` is for the component. Neither screen has one, because the wait is proved end to end instead, in
`search-waits.spec.ts` with Playwright's clock held.

**Why that proof lives in the e2e rather than in a story**, stated as the limitation it is rather than as an
impossibility, which the review corrected: **this repository's Storybook play context does not expose Playwright's
`page.clock`**, so `install`, `pauseAt` and `runFor` are not available to a play function. Fake timers exist outside that
API, so "a story cannot hold time" would be an absolute claim on a partial mechanism, which is the failure AGENTS.md
section 7 records more than any other.

## 5. What would change my mind

If the review judges that a reader-facing sentence naming the search must always say when it acts, regardless of whether
the story demonstrates it, then the four entries gain the introductions' phrasing and the plan is rewritten to say so.
That is the parent round's reading, and it is not unreasonable, it is the stricter half of the same exit.

## 6. Questions for the review

1. **The central one**: is "an entry states timing when the timing is what the story demonstrates" the right line, given
   `Debounced` and `CountsDownToAResend` on one side and `Working` and `Keeping` on the other? If it is, this card edits
   nothing and records why. If not, it edits four entries.
2. If the answer is to edit, should the entries borrow the introductions' exact phrasing, which would put "once typing
   pauses for a moment" into the middle of a four-item list, or say it more briefly in the itinerary's own voice?
3. Is there a fifth reader-facing description of either screen's search that neither this card nor KN-696 has found?
4. Does leaving them unedited leave KN-695 genuinely finished, or merely finished by definition?
