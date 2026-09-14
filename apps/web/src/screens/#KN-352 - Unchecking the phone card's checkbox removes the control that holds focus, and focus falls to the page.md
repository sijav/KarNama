# KN-352 · Unchecking the phone card's checkbox removes the control that holds focus, and focus falls to the page

**Why, from the board.** A keyboard or switch user who unchecks a card has to
start again from the top of the page, on the screen where they select most.

**Exit condition, from the board.** Unchecking the phone card's checkbox leaves
focus on the card, either on a checkbox that stays and folds as the desktop's
does or on the title, and a story unchecks it by keyboard and asserts where
focus is.

## What changed under this card

KN-015's roast filed it when `JobCard` drew the phone card's checkbox only while
the card was selected, so unchecking it unmounted the control that held focus.
KN-428, 63f6870, changed that: the phone card's checkbox is always in the page,
folded to no room at rest, in view while the board is selecting, and unfolding
while the keyboard's focus is inside the card, `&:has(:focus-visible)`.

## Measured, 2026-09-14

In Chromium with the Pixel 7 profile at 390 by 844, against the dev server, in
Persian with the sample data loaded: a real touch held on the first card selected
it; the real keyboard Tabbed to that card's checkbox, 32 Tabs from the top of the
page; Space unchecked it, and since it was the only card selected the board
stopped selecting and the Bulk Action Bar went. Focus stayed on that checkbox, and
the checkbox stayed in view. Tab went on to the title and the three dots, the
checkbox still in view, and the next Tab left the card for the next card's
checkbox, when the first card's checkbox folded away.

So the first half of the exit condition already holds in the app. What is
missing is the story that proves it and would catch it breaking.

## The approach

1. **`UncheckingOnAPhone`, a story on the board at a phone's width**, in
   `JobsScreen.stories.tsx`, because there the board's own state ends the
   selection when the last card is unchecked, where a `JobCard` story would have
   to fake it by writing its args back. It:
   - resizes the runner's browser to 390 by 844 and puts it back after, as
     `OnAPhone` does;
   - holds the first card with the synthetic touch `SelectingOnAPhone` uses,
     waits for the bar, and waits for the unfold the hold began to finish, on
     its transitions' own `finished` promises;
   - focuses the card's title and presses Shift and Tab with the runner's own
     keyboard, which reaches the checkbox as the keyboard's focus;
   - presses Space with the runner's keyboard, and waits for the bar to go,
     which is the board ending the selection, rather than for the checkbox to
     show unchecked, which a card that took its checkbox out of the page never
     would;
   - asserts the checkbox still has focus, is unchecked, has no fold under way,
     `getAnimations()` empty on its fold, and is seen;
   - presses Shift and Tab once more, which takes focus back to the chips before
     the card, asserts focus is outside the card and not on the body, and waits
     for the checkbox to fold away, as the desktop's does.
2. **No product change.**
3. **Its entries in `story-docs/en` and `story-docs/fa`, `Screens-Jobs.md`.**

## Proof that the story can fail

Two plants, one at a time. The phone checkbox left out of the page whenever its
card is neither selected nor the board selecting, which is the bug as filed, must
fail the assertion that the checkbox still has focus. The `&:has(:focus-visible)`
unfold taken away must fail the assertion that no fold is under way on it.

## Files

- `apps/web/src/screens/JobsScreen.stories.tsx`: the story, reusing the `touch`
  and `seen` helpers `SelectingOnAPhone` added.
- `apps/web/src/shared/story-docs/en/Screens-Jobs.md` and
  `apps/web/src/shared/story-docs/fa/Screens-Jobs.md`: its entry.

## What I am unsure of

- **The keys.** `vitest/browser`'s `userEvent.tab` and `userEvent.keyboard` are
  the runner's own Playwright keys under the story-test flag, which `TabOrder`
  and `Pressed` already rely on for `:focus-visible`; testing-library's untrusted
  Tab would not reliably match it, AGENTS.md section 7. The installed
  `@vitest/browser` declares `tab(options?: { shift?: boolean })` and
  `keyboard(text)`.
- **Shift and Tab from the title reaching the checkbox.** The phone card's order
  is the checkbox, the title, the link when the posting has one, and the three
  dots, as measured; the story asserts the focus it lands on rather than
  assuming it.
- **The home.** The finding is the Job Card's, but the state that ends a
  selection is the board's; a `JobCard` story would need the KN-280 revision
  plumbing `ColorPicker.stories.tsx` uses to write `selected` back, for less.

## How I will know it worked

The story passes; each plant fails it on the assertion it aims at, and the
restored file passes again; lint, tsc and the unit project's docs guard pass.

## Plan review, Codex, 2026-09-14

Codex, with web search, found the board the right home, `vitest/browser`'s Tab
and keys the runner's real ones, a Shift and Tab enough to make the checkbox
match `:focus-visible` after a programmatic focus on the title, and no need for
a case where other cards stay selected, since `selecting` stays true there. It
asked for one correction, taken: an immediate check that the checkbox is still
seen would not catch the unfold rule being removed, because the fold is a 250 ms
transition and a checkbox part way through it still reads as seen. Codex's way
was to wait past the transition; the story asserts instead that no fold is under
way, `getAnimations()` on the fold empty. It also asked that leaving the card be
bounded and asserted as focus outside that card, rather than assumed to reach a
next card's checkbox, since the phone column holds one card: the story presses
Shift and Tab once, back to the chips, and asserts it.

**The first run failed that check with the product intact**, and the reason was
mine: I had written that with the rule in place nothing animates at all, which
held only once the hold's own unfold had finished. Replayed in the app with the
story's keys, 73 ms after the hold selected the card the checkbox already had
the keyboard's focus and matched `:focus-visible`, and the two transitions
running on it were the hold's unfold, opacity 0 to 1 and margin -32 to -4
pixels; 400 ms later none ran, and with the keys pressed after the unfold had
finished nothing animated after Space. So the story now waits for the unfold on
its transitions' `finished` promises before the keys, and the check that no fold
is under way after Space stands.
