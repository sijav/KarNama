# KN-586 - The sign-in code step has one field where the file draws five code boxes

## The card

Found by KN-518's reading of the sign-in frames with use_figma, 2026-09-15.

**Why.** The code step is the one every reader types into, and one field does not
look like the file's five. Five boxes are a component of their own rather than a
restyle: typing, pasting a whole code, Backspace across the boxes, the phone's
one-time-code autofill, and a screen reader meeting one field.

**Exit.** The code step draws the file's Code Row at 1440 and 390 in fa-IR light,
five boxes 56 tall and 8 apart with the current box's focus edge and digits in the
reader's digits; a typed code, a pasted code and the phone's one-time-code autofill
fill the boxes, and Backspace moves back; a screen reader meets one field named for
the code; the sign-in stories and e2e sign in through it.

## Read before planning, 2026-09-15

**The file.** The Components page holds no code input: searched for code, OTP,
digit, pin and verification, it finds only the map-pin icon. The Code Row exists
only on the Auth Code frames, `407:6981` on the desktop's and `407:7052` on the
phone's, read with use_figma.

- The row fills the card, 376 and 278 wide, hugging its 56, 8 between its boxes, no
  reaction.
- Five boxes, each filling an equal share, 68.8 and 49.2 wide, fixed at 56: radius
  md, bound to `radius/md`; `bg/surface`; a stroke drawn inside, one pixel of
  `border/default`, and on the current box two of `border/focus`. No effect, no
  reaction.
- A digit: Vazirmatn SemiBold 20 on a line of 32, no tracking, `text/primary`,
  centred, bound to no text style; the file's Persian digits.
- Box 1, at the left, holds «۴», box 2 «۷», box 3 «۲», box 4 is empty with the focus
  edge, and box 5 is empty with the resting edge. The code runs left to right in the
  Persian frame, as a phone number does, and the box after the last digit is the
  current one.
- The file draws no error, hover or disabled state for the row, and no label.

**The code.** The code step is the Input, labelled «کد پنج رقمی», `inputMode`
numeric, `autoComplete` one-time-code, `enterKeyHint` go, `maxLength` 5, running left
to right, KN-458 and KN-464. Every story and test that reaches it does so by that
name: the sign-in and provider stories, KeyboardsForEachStep's expectation of its
attributes, and `sign-in.spec.ts`, `connected.spec.ts` and `two-tabs.spec.ts`. The
Input's error line is a 14 on 22 line in `text/error` 4 below the field, around a
`role="alert"` span that stays in the page, KN-286 and KN-287. `checkCode` reads the
code through `latinDigits`, which lives in `core/auth`.

## The approach

1. **`latinDigits` moves to `i18n/digits.ts`**, beside `formatCount` and
   `formatClock`: reading a reader's digits is the locale's business, and both
   `core/auth` and a shared component already import `i18n`, where a shared component
   importing `core/auth` would tie it to auth. Auth imports it from there, and its
   unit tests move with it.
2. **A Code Input, `shared/code-input`**, built and storied on its own before the
   screen takes it, the file's Code Row made a component.
   - **One field behind five boxes.** A real text `<input>` lies over the whole row:
     `inputMode` numeric, `autoComplete` one-time-code, `enterKeyHint` from its caller,
     and the accessible name its `label` prop gives, since the file draws no label. So
     typing, pasting, a phone's autofill and Backspace are the browser's own on one
     field. The five drawn boxes and their digits are `aria-hidden`, so a screen reader
     meets that one field and nothing else.
   - **The field draws nothing of its own.** Its text 16 pixels, so no phone zooms into
     it, and transparent; its caret transparent; its selection highlight transparent;
     and Chromium's `:-webkit-autofill` paint kept off, with a background transition
     too long to show and transparent text fill.
   - **Digits only, five at most, and no native `maxLength`**, which would cut a
     pasted «کد: ۴۷۲۱۹» before its digits arrive. What arrives, typed, pasted or filled
     in, keeps its digits, Persian and Arabic-Indic read as Latin, and the first five
     are the value; the value handed back is Latin, as `checkCode` reads it. When a
     change had to be filtered or cut, the caret goes after the last digit kept.
   - **Native selection stays.** Select All and a typed digit replace the code, and the
     arrow keys move the caret, as in any field. The **current box** is the one at the
     caret, `selectionStart`, the last box when all five are filled and the caret is
     after them, and it is read on every selection change. A press on a box puts the
     caret there, at most after the last digit, since the field's transparent text does
     not sit under the boxes.
   - **The boxes, as the file draws them.** Each digit in the reader's digits through
     `Intl.NumberFormat`, 20 at SemiBold on 32 composed from `heading/m`'s size and
     weight, as the Brand Row's name is; the row left to right whatever the page's
     direction, by `dir`, KN-458.
   - **Focus.** While the field has focus, the current box draws two pixels of
     `border/focus` inside, and the others keep one of `border/default`; without focus
     no box is current, as box 5 beside the focused box 4 suggests. This is the field's
     focus indicator.
   - **An error**, which the file does not draw: the Input's own line under the row, 4
     below it, 14 on 22 in `text/error`, around the same always-mounted alert span, and
     every box's resting edge in `border/error`; the current box keeps its two pixels of
     `border/focus`, so focus stays visible on a red row. The field carries
     `aria-invalid` and is described by the line.
3. **The code step takes it.** `AuthScreen.tsx` draws the Code Input where the Input
   was, named «کد پنج رقمی», with the same value, change, error and `enterKeyHint`.
   Everything reaching the field by that name keeps working unchanged.
4. **Stories, `Shared/CodeInput`**, rendering from their args, the value bound back
   with a revision as the Input's are, KN-253 and KN-280.
   - `Default`, empty and unfocused, every edge at rest.
   - `Filled`, five digits in Persian digits.
   - `AsTheFrame`: three digits typed with the field focused, measured against
     `407:6981`: five boxes filling the row 8 apart, 56 tall, radius 8, one pixel of
     `border/default` inside, the fourth box two of `border/focus`, each digit 20 at 600
     on 32 in `text/primary`, centred, «۴۷۲» from left to right.
   - `Typing`, `Pasting` and `Backspace`: digits typed; a whole code pasted with other
     text around it; Backspace taking digits back; each read off the boxes and the value
     handed back.
   - `SelectingToReplace`: Select All and a digit typed replace the code, and a press on
     the second box puts the current box there.
   - `ReadsAsOneField`: the row's accessible tree holds one text field named for the
     code and no digit of its own, and the field declares numeric and one-time-code.
   - `WholeCodeAtOnce`: a whole code written into the field in one change, as a phone's
     autofill writes it, fills the five boxes. This proves the field takes what autofill
     writes and says it wants a one-time code; a phone's own suggestion also needs the
     text message to name the site's origin, which no story can show.
   - `Error`, and `InEnglish` in Latin digits.
5. **The code step's stories.** `CodeAsTheFrames` measures the Code Row in the card at
   1440 and 390, 376 and 278 wide, beside what it measures already. The stories that
   type into the field by name sign in as before.
6. **End to end.** `sign-in.spec.ts` types a code with the keyboard's own keys once,
   rather than `fill`, and sees the boxes show it in Persian digits before signing in;
   the rest keeps `fill`.
7. **The record.** DESIGN.md section 2 lists the Code Input, as the Code Row of the Auth
   Code frames and no library component; section 8 draws it as built, names the error,
   the current box and the selection as the build's reading, and no longer lists KN-586.
   Docs for the new component in both languages, and the sign-in docs' code step
   entries. A card for the live text message's origin-bound form, which a phone's
   one-time-code suggestion reads, if the board has none.

## File by file

- `apps/web/src/i18n/digits.ts`, `digits.test.ts`; `apps/web/src/core/auth/auth.ts`,
  `auth.test.ts`, `index.ts`
- `apps/web/src/shared/code-input/CodeInput.tsx`, `CodeInput.stories.tsx`, `index.ts`
- `apps/web/src/shared/story-docs/story-meta.ts`, `{en,fa}/Shared-CodeInput.md`,
  `{en,fa}/Screens-SignIn.md`
- `apps/web/src/screens/AuthScreen.tsx`, `AuthScreen.stories.tsx`
- `apps/web/e2e/sign-in.spec.ts`
- `DESIGN.md`

## What I expect to be hard, and what I am unsure of

- **A transparent field over drawn boxes.** Its text, caret, selection and autofill
  paint each have to be kept off, and each is checked by looking in a focused story,
  and with text selected.
- **The caret after a filtered change.** A controlled field whose value React changes
  from what was typed moves its caret; the caret is put after the last digit in a
  layout effect only when the change was filtered or cut.
- **A press on a box** is read from where on the row it landed, the row being five
  equal boxes 8 apart and left to right.
- **The error look is not drawn.** The Input's line and red edges are the product's one
  error language, so I follow them; the owner may want otherwise.
- **Device autofill is not provable here**, as step 4 says: the exit's autofill is met
  as far as the field can meet it, and the close will say so.

## Plan review, Codex gpt-5.6-terra, 2026-09-15

"Do not build this unchanged." Its corrections, all taken.

1. **No native `maxLength`**: browsers limit the raw string, so a pasted code with text
   around it is cut before its digits arrive. The limit to five comes after filtering.
2. **The boxes `aria-hidden`**, so a screen reader meets the one labelled field rather
   than the field and five static digits.
3. **The caret, the selection highlight and the autofill paint neutralised
   explicitly**; transparent text alone hides none of them. The field's text stays 16.
4. **Native selection, not the caret forced to the end**, which made Select All and a
   correction hostile: the current box is read from `selectionStart`. Taken, with a
   press on a box placing the caret there.
5. **`latinDigits` out of `core/auth`**: the review said `shared`; it goes to `i18n`,
   which both `core` and `shared` already import, where `core` importing `shared` would
   turn the layers round.
6. **Autofill is not provable in a story or an e2e**; a phone's suggestion also needs a
   text message bound to the site's origin, which the live SMS does not yet send. The
   story says what it proves, and a card holds the message's form.

**Confirmed.** One text field with `inputMode` numeric and `autocomplete` one-time-code,
16 pixels of its own text and 20 pixel digits drawn in the boxes, is the right shape;
and the error, an always-mounted alert line with red resting edges and the focus edge
kept, is consistent with the codebase.

## How I will know it works

- The Code Input's stories and the sign-in stories under Vitest, the component's
  coverage at 100 from its stories; the unit project, eslint and tsc.
- The sign-in e2e, desktop and mobile.
- The code step seen at 1440 and 390, fa-IR and en-US, light and dark, beside the file's
  screenshot, focused and with text selected; the Shared/CodeInput and Screens/SignIn
  Docs pages read in both languages.

## Result, 2026-09-15

Built as planned after the review.

- **The Code Input.** One text field lies behind five `aria-hidden` boxes. It is
  numeric, with the one-time-code hint and no `maxLength`. What arrives keeps its
  digits, Persian and Arabic-Indic read as Latin, five at most. Native selection
  stays: the current box is read from `selectionStart`, and a press on a box puts the
  caret there. The field's text, caret and selection are transparent, and Chromium's
  autofill paint is kept off. A refused code takes the Input's line with red resting
  edges, while the current box keeps its focus edge.
- **`latinDigits`** moved to `i18n/digits.ts` with its test; `core/auth` imports it from
  there.
- **The code step** takes the Code Input, named «کد پنج رقمی», so everything that reached
  the field by that name works unchanged.

**Found along the way.**

1. **KN-600.** A phone's own one-time-code suggestion needs the live text message's
   template to name the site's origin, which lives in Kavenegar's panel.
2. **KN-601.** The two-tabs e2e's second test waits for «اسم و فامیل» and «ادامه», the
   contact modal's name and a word no catalog holds, where the signup step says «نام و
   نام خانوادگی» and «شروع کن». It times out there on desktop, after its Code Input
   line, 82, passed.

**Checks.**

- The Code Input's 11 stories, the sign-in stories' 15 and the provider's 3, 29 of 29.
  `CodeInput.tsx` is fully covered by its own stories: the run exits clean with the 100
  threshold applied to that file.
- The unit project, 1487 of 1487; tsc and eslint clean; every touched file formatted as
  it was at HEAD, and the new ones formatted.
- The sign-in e2e, 10 of 10 on desktop and mobile. Its first test types the sent code
  with the keyboard's own keys and sees the boxes show it in Persian digits before
  signing in. The two-tabs e2e: one test passed, and the other failed at KN-601's line.
- The look, headless against the dev Storybook, reached by a real send, at 1440 and 390,
  fa-IR and en-US, light and dark. Three digits typed read «۴۷۲», or 4 7 2 in English, in
  the first three boxes with the fourth current, the boxes 68.8 and 49.2 wide, and the
  field's text and caret transparent. Everything selected kept its selection with the
  first box current, and focus moved away left no box current; no page error in any of
  the eight.
- Both Docs pages print their entries checked in fa-IR and en-US.
- **Autofill is met as far as the field can meet it.** The field declares the
  one-time-code hint, and a whole code written at once fills the boxes. A phone's own
  suggestion needs KN-600.
