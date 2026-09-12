# KN-457 · The tip and the link say the same thing

Beside the component, per `agent/RALPH.md` step 2b. Child of KN-453, from its
roast, and it is the doubt KN-453's own summary raised.

## The card

**Why.** That story exists to prove a tip describes a control rather than
renaming it, which on an icon-only control is the difference between a screen
reader saying what the button does and saying a sentence about it. As written it
cannot see the difference.

**Exit condition.** The link's name and the tip's text are different strings,
and removing `describeChild` from the Tooltip makes the story fail.

## The approach

`ALinkInATooltip` titles its tip with `Send an email`, which is also the link's
accessible name. So every assertion in it survives `describeChild` being
dropped: MUI would then LABEL the anchor with the tip's text, and the expected
name and the tip's text are the same string.

The tip gets copy of its own that explains rather than names. A `mailto:` link
hands the address to whatever the reader writes mail with, which is the thing
worth saying and is not the control's name: **Opens in your mail app**,
«در برنامهٔ ایمیلت باز می‌شود».

Then the story asserts the two independently: the link's accessible name is
still `Send an email`, and its description resolves to the new sentence.

## File by file

- `src/i18n/locales/{en-US,fa-IR}.ts` — the new id and its Persian.
- `src/shared/icon-button/IconButton.stories.tsx` — the tip's title, and the two
  assertions now reading different strings.
- `src/shared/story-docs/{en,fa}/Shared-IconButton.md` — the entry says what the
  story now distinguishes.

## How I will know it worked

The story is green, and dropping `describeChild` from `Tooltip.tsx` makes it
fail on the NAME assertion rather than on anything else. That mutation is run by
hand and reverted, not committed: it is the check the card names, not a
verifier.
