# KN-461 - The sign-in docs and e2e comments describe a message that is sent, where the mock sends none

## The card

**Why.** Documentation that contradicts the product is worse than none: it is the stale mock
guidance the next person carries forward when the real sender lands.

**Exit.** Neither language's SignIn introduction mentions the console as where the code is or says
the code was sent, and `sign-in.spec.ts`'s comments say the mock makes and shows the code rather
than that a message is sent.

## Measured before planning, 2026-09-15

- **What the mock does.** `send` in `AuthProvider.tsx` makes the code, holds it for the screen, and
  logs `KarNama mock SMS to` the number and the code with `console.info`. The code step in
  `AuthScreen.tsx` shows the code at every width, in a status notice that says no message is really
  sent yet, KN-459. Its heading says the code was sent to the number, the product's own copy, which
  KN-589 puts to the owner.
- **Both introductions.** The first line says the five digit code was sent to the number, and the
  note says no message is really sent but that the code is written to the browser console and the
  page says so, which sends a reader to the console for a code the page shows.
- **One entry says the same.** `SigningInOnAPhone` says a phone is where there is no console and so
  the code is on the screen, as though the screen showed it only for want of a console. The `Code`
  entry already says nothing was really sent.
- **The spec.** `e2e/sign-in.spec.ts` reads the codes from the logged line, which is true of the
  mock. But its header says reading the console is exactly what whoever is testing the product
  does, the comment on `codesFrom` speaks of the codes the mock says it sent, the resend's comment
  says resending really sends another, and two test titles say the code it was sent and that
  another can be sent. No other spec says any of this.

## The approach

1. **The introductions**, in both languages: the code is the five digit code made for the number,
   and the note says the provider is mocked, no message is sent, and the code step shows the code
   itself, said plainly to be a stand-in. The console goes from the introduction.
2. **`SigningInOnAPhone`**, in both languages: a phone reads the code where every reader finds it,
   on the screen.
3. **The spec**: its header says the mock makes the code, shows it on the code step and logs it,
   that this test reads the logged line, and that the stories' `SigningInOnAPhone` reads the code
   where a reader does. `codesFrom`'s comment speaks of the codes the mock made, the resend's says
   asking again makes another, and the two titles say the code made for the number and that another
   can be asked for.
4. **Left as they are**: the code step's heading and the resend link's words, which are the
   product's copy and KN-589's question; the entries that say the resend link sends another code,
   which is that link's own word; and `KeyboardsForEachStep`'s message a code arrives in, which is
   what the field's hint does for a real message.

## What I will change

- `apps/web/src/shared/story-docs/en/Screens-SignIn.md`, `apps/web/src/shared/story-docs/fa/Screens-SignIn.md`
- `apps/web/e2e/sign-in.spec.ts`

## What I expect to be hard, and what I am unsure of

- **The spec is not run here.** It needs the app's server, which the loop does not start for a
  change of comments and titles; tsc and lint read it.
- **The Persian.** «ساخته می‌شود» for a code the mock makes, beside the product's «ارسال»; and the
  Persian lines are changed by their place in the file, each checked for the word it holds first,
  so a zero-width non-joiner typed differently cannot miss a match silently.
- **KN-589.** Whether the product should stop saying the code was sent is the owner's; the docs
  describe the product as it is.

## How I will know it works

- Neither SignIn page's introduction or `SigningInOnAPhone` entry mentions a console or says the
  code was sent, in either language, and no comment or title in the spec says a message or a code
  is sent.
- tsc, lint and the unit project pass, the docs guard parsing both pages, and no file's Prettier
  drift grows.
- The SignIn Docs page, read in fa-IR and en-US, shows the new introduction.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved. The docs describe the reader's path, a code the mock makes and shows on the screen, and
the console is only how Playwright learns a value it could not otherwise know, which the spec's
header says with enough by pointing at the phone story for what a reader sees. The sends left alone
are the product's copy, or describe the resend link's label and a real message's keyboard hint, and
none says a message is delivered now; KN-589 is where the product's wording is decided. Changing the
Persian by line, each checked first, avoids the likeliest mistake.

## Built, 2026-09-15

- **The introductions.** Both pages now open on the five digit code made for the number, «کد پنج
  رقمی‌ای که برایش ساخته می‌شود», and the note says the code step shows the code itself, said plainly
  to be a stand-in. The console is gone from both.
- **`SigningInOnAPhone`**, in both languages, reads the code where every reader finds it, on the
  screen. The Persian lines were changed by their place, each checked first for the word it held.
- **The spec.** Its header says the mock makes the code, shows it on the code step and logs it, that
  this test reads the logged line, and that the stories' `SigningInOnAPhone` reads the screen.
  `codesFrom` speaks of the codes the mock made, the resend comment says asking again makes another,
  and the two titles say the code made for the number and that another can be asked for.
- **Searched.** Neither page holds "console", "was sent", «کنسول» or «فرستاده» any more, and the spec
  holds none of the five phrases it had.
- **Checks.** tsc and lint pass, and so does the whole unit project, 1506 tests, the docs guard
  among them. Prettier drift is 0 in both pages, the spec and this plan.
- **The look.** The SignIn Docs page from the dev Storybook, read in fa-IR and en-US, opens on the new
  introduction, with no console and no code said to be sent, and no page error.
- **Not run.** The e2e spec itself, whose comments and titles alone changed.
