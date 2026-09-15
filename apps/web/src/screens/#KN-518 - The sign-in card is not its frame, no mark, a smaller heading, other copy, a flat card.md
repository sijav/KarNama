# KN-518 - The sign-in card is not its frame: no mark, a smaller heading, other copy, a flat card

## The card

KN-481's audit of Auth Login, 407:6951 and 407:7022, against `AuthScreen` at 1440
and 390 in fa-IR light: the card's radius, padding, gap and shadow, the Brand Row
with its mark, the heading's size, and the body, placeholder and note copy all
differ from the file. The code and signup steps, 407:6972 and 407:7000, share the
card and were not compared.

**Why.** Sign-in is the first screen every reader sees, and it is the one furthest
from its frame.

**Exit.** At 1440 and 390 in fa-IR light the sign-in card measures as 407:6951 and
407:7022 draw it, mark, type, copy, radius, padding, gap and shadow, the shadow
named in DESIGN.md's elevation table and the brand row shared with the sidebar's
rather than copied; the code and signup steps are compared and fixed the same way.

## What is there, read on 2026-09-15

**The app.** `AuthScreen.tsx` is one form card, 440 at most, over three steps. It
has padding lg, a gap of md, radius md and `bg/surface`, with no edge and no shadow.
From the top: «کارنما» as a line of text at Heading/L's size, with no mark; the
step's title at Heading/M's size; the body in `text/secondary`; the Input; the
Primary Button across the row; and, on every step, the note at Label's size in
`text/secondary`. The code step adds the mock's notice of the code (KN-459) and a
Text Button «ارسال کد دیگر». There are status lines while busy or restoring, and
an alert on an error.

**Measured** in a production Storybook of c4e8128, `Login` after its play and
`InEnglish`, at 1440 by 900 and 390 by 844: the card is 440 and 342 wide, as the
file draws, the page's 24 gutter already making 342. It has padding 24, a gap of
16, radius 8, no shadow and no border. The brand is 24 at 600, the title 20 at 600,
the body 14 at 400 in rgb(107, 114, 128). The placeholder is «۰۹۱۲ ۰۰۰ ۰۰۰۰», the
Button is 392 and 294 wide, and the note is 12 at 400 in rgb(107, 114, 128) at the
inline start.

**The file**, read with use_figma on 2026-09-15, all six frames: 407:6951,
407:6972 and 407:7000 on a desktop, and 407:7022, 407:7043 and 407:7071 on a phone.

- **The Auth Card** is the same on each. Fixed at 440 and 342, hugging its height,
  a column with a gap of 24, `spacing/lg`, and padding of 32, `spacing/xl`. Radius
  16, `radius/lg`, filled `bg/surface`, and one pixel of `border/default` inside.
  One drop shadow, black at 0.06, offset 0 4, blur 16, spread 0, bound to no effect
  style. It is centred on `bg/page`.
- **The Brand Row** is at the inline start. A 32 mark of `radius/md` in
  `bg/brand/default` holds «ک», 16 SemiBold in `text/on-accent` on a line of 26.
  Then «کارنما», 20 SemiBold in `text/primary` on a line of 32, 8 after it,
  `spacing/xs`. The sidebar draws the same row, 406:451, and `Sidebar.tsx` writes it
  inline.
- **The Heading** is a column of two lines 8 apart. The title is 24 SemiBold in
  `text/primary` on a line of 38, bound to no text style. The body is Body, 14 on
  22, in `text/secondary`.
- **Login**: the Input labelled «شماره موبایل», placeholder «۰۹۱۲ ۳۴۵ ۶۷۸۹»;
  Primary M «ارسال کد» filling the row; and the Terms Note «با ادامه‌دادن، قوانین و
  حریم خصوصی کارنما را می‌پذیری.», 12 Regular on a line of 19, in `text/disabled`,
  centred.
- **Code**: title «کد را وارد کن», body «کد پنج‌رقمی را به ۰۹۱۲ ۳۴۵ ۶۷۸۹ پیامک کردیم.»
  A Code Row of five boxes, 56 tall and 8 apart, radius md, one pixel of
  `border/default`, the current box two of `border/focus`, digits 20 SemiBold.
  Primary «تأیید و ورود». A Resend Timer, «ارسال دوباره‌ی کد تا ۰۰:۵۹», 14 Regular
  in `text/disabled`, centred. And «ویرایش شماره», 14 Medium in `text/brand`,
  centred. No terms note.
- **Signup**: title «خوش آمدی», body «فقط اسمت را بگو تا برد آگهی‌هایت را بسازیم.»;
  the Input labelled «نام و نام خانوادگی», placeholder «مهدی رضایی»; Primary «شروع
  کن»; and a Skip Row, «بعداً کاملش می‌کنم», 14 Medium. No terms note.

**The contract and the code around it.**

- DESIGN.md section 4: "The user's name is asked only on first sign-in, and is
  required there", which the Skip Row contradicts.
- The terminology rule: «آگهی» is only the external source, and KN-329 has the code
  keep the rule where the file breaks it.
- No component passes values into a message (`i18n._(id, values)`), and the
  catalogs are plain maps loaded with no message compiler, `src/i18n/index.ts`.
  KN-221 says a placeholder then renders raw in production, so today's code step
  writes «ارسال شده به» and the number side by side.
- Shared ids: 'Full name', 'e.g. Sara Mohammadi' and 'Write the full name' are also
  the Contact Modal's; 'KarNama' is the Sidebar's.
- The copy is named in `e2e/sign-in.spec.ts`, `e2e/connected.spec.ts` (exact
  names), `AuthScreen.stories.tsx`, `AuthProvider.stories.tsx` and
  `App.stories.tsx`.
- `elevation` in `tokens.ts` holds seven shadows, listed by key and value in
  `tokens.test.ts` and `theme.test.ts`, and the token guard reads DESIGN.md's
  Elevation table.
- The job card draws its inside edge as a border on `::before`, DESIGN.md's rule for
  a stroke inside.

## The approach

1. **A Brand Row of its own**, `shared/navigation/BrandRow.tsx`, from the barrel:
   the Sidebar's row moved out as it is. That is the 32 mark of radius md in
   `bg/brand/default`, the name's first letter at Title's size and SemiBold in
   `text/on-accent`, and the name at Heading/M's size and SemiBold, 8 apart, both on
   the font's normal line. It gets its own story file, which measures the mark, the
   letter, the name and the gap in both languages, and docs in both. The Sidebar
   and the sign-in card both draw it.
2. **The card.** Padding xl, a gap of lg, radius lg and `bg/surface`. One pixel of
   `border/default` inside on `::before`, as the job card draws its edge. And
   `elevation.authCard`, a new token, `0 4px 16px 0 #0000000F`, whose DESIGN.md
   row is read from 407:6952, with both token tests updated. It stays 440 on a
   desktop and the page's 24 gutter on a phone.
3. **Each step's heading** is one block of two lines 8 apart. The title is at
   Heading/L's size and weight, 24 SemiBold, on the font's normal line, which is
   the file's 38; it binds no text style, as the Brand Row's name does not. The
   body is Body in `text/secondary`.
4. **The copy each step draws**, where the app has the element or the shared
   heading gives it one, and where it promises nothing the product does not do.
   English ids, as the catalog asks:

   | Where              | English id                                                             | Persian                                              |
   | ------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------- |
   | Login placeholder  | '0912 345 6789'                                                        | «۰۹۱۲ ۳۴۵ ۶۷۸۹»                                      |
   | Code action        | 'Confirm and sign in'                                                  | «تأیید و ورود»                                       |
   | Signup title       | 'Welcome'                                                              | «خوش آمدی»                                           |
   | Signup body        | 'Just tell us your name so we can build your job opportunities board.' | «فقط اسمت را بگو تا برد فرصت‌های شغلی‌ات را بسازیم.» |
   | Signup label       | 'First and last name'                                                  | «نام و نام خانوادگی»                                 |
   | Signup placeholder | 'Mehdi Rezaei'                                                         | «مهدی رضایی»                                         |
   | Signup action      | 'Start'                                                                | «شروع کن»                                            |

   The signup body says «فرصت‌های شغلی» where the file says «آگهی‌ها», under the
   terminology rule, as KN-329 does. New ids stand where an old one is shared, so
   the Contact Modal keeps «اسم و فامیل». The Login title and action, the labels
   and the code title are already the file's, and so is the Login body's first
   clause. **Kept as they are, for the owner**: the rest of the Login body and the
   code step's «ارسال شده به», which would promise a text message the mock never
   sends, KN-589; and the note's words, since the file's name terms and a privacy
   policy the product does not have, KN-590. The code step's number is
   `formatPhone`'s, the reader's digits grouped four, three and four, as the file
   writes it.

5. **The note** shows on Login alone, as drawn. It is 12 Regular on the font's
   normal line, centred, in `text/disabled`, which is 2.54 to one on `bg/surface`.
   That is KN-591, for the owner, as KN-396 was for the Destructive button.
6. **Not built here, each a card of its own.** The Code Row is KN-586. The
   countdown and «ویرایش شماره» are KN-587. The Skip Row, which the required name
   contradicts, is KN-588. The mock's notice, the status lines and the error stay,
   24 apart like the rest.
7. **DESIGN.md**: the Elevation row, and its prose counting the shadows bound to no
   style, which gains an eighth while there are still exactly two effect styles.
   And section 8's row 6: the card's measures, the heading's line, the note and the
   six cards.
8. **Stories and tests.** New stories measure the card as the file draws it on
   each step, Login, Code and Signup, at 1440 and at 390; the phone ones go through
   `vitest/browser`'s viewport, as `SigningInOnAPhone` does. Each reads the padding,
   gap, radius, edge and shadow, the Brand Row, the title's size and weight, and
   the copy. The existing stories and both e2e specs take the new copy, and the docs
   describe the new stories in both languages.

**File by file**:

- `shared/navigation/BrandRow.tsx` and `BrandRow.stories.tsx`, new; `index.ts` and
  `Sidebar.tsx` changed.
- `shared/story-docs/{en,fa}/Shared-BrandRow.md`, new, and `Screens-SignIn.md`.
- `screens/AuthScreen.tsx` and `AuthScreen.stories.tsx`.
- `theme/tokens.ts`, `tokens.test.ts` and `theme.test.ts`.
- `i18n/locales/en-US.ts` and `fa-IR.ts`.
- `e2e/sign-in.spec.ts` and `e2e/connected.spec.ts`.
- `DESIGN.md`.

## How I will know it works

- The layout stories pass under Vitest. Planted once, with the padding put back to
  lg and the shadow taken out, they fail naming the values, and then are restored by
  hash.
- The AuthScreen, Sidebar and BrandRow stories pass, the unit project passes
  (tokens, and the catalog's every English id having Persian), and lint and tsc are
  clean.
- `playwright test sign-in.spec.ts` passes on the desktop and phone projects.
  `connected.spec.ts` takes the new names too; it runs only against the scenario
  server, and the close says whether it ran.
- A look at Login, Code and Signup at 1440 and 390 in fa-IR light and dark and
  en-US light and dark, beside the file's frames. The Docs pages of the sign-in
  screen and the Brand Row read in both languages.

## What I expect to be hard, and what I am unsure of

- **The heading's line.** Heading/L says 32, and the file draws 38, which is the
  font's automatic line at 24. The normal line matches the frame's height, as the
  Brand Row's name already does; the role's 32 would make each card 6 shorter than
  drawn. The Empty State took the role's line instead.
- **Reaching the code and signup steps in a layout story.** The code step needs a
  number sent, with the mock's fixed codes as `SigningInOnAPhone` uses them. The
  signup step needs the `session` parameter the `Signup` story already uses.
- **Moving the Brand Row out of the Sidebar.** Its DOM must stay what the Sidebar's
  stories read: the name, the letter, the mark's place, and the row's height.

## Plan review, Codex, 2026-09-15

`gpt-5.6-terra` at medium. It found sound: moving the Brand Row out of the Sidebar,
as the simplest honest reading of the exit's "shared"; the heading on the normal
line; `text/disabled` as drawn with a card for the owner; and Vitest's
`page.viewport` and a `::before` edge through `sx`. Taken:

1. **The exit's scope.** The plan left the Code Row, the countdown and the skip to
   cards, so it could not also claim the code and signup steps fixed. KN-518's exit
   now says those steps take the same card, brand row and heading, measured at both
   widths, with the rest in KN-586 to KN-588. The layout stories measure all three
   steps.
2. **Copy that promises what the product does not do** is the owner's to settle,
   not the file's alone: KN-589 for the text message, and KN-590 for the terms and
   privacy note. Those lines keep their words.
3. **DESIGN.md's prose** counting the shadows bound to no style gains the new one.

Not taken, measured: the review ran `@lingui/core` 6.6.0 and saw `i18n._(id,
values)` interpolate a plain catalog string, so the code step's sentence could take
the number as a value. That holds only in development. With `NODE_ENV=production`
the same call prints "Uncompiled message detected!" and returns `{phone}` raw,
which is KN-221's premise, now noted on that card. No message takes a value, and
the code step's line waits on KN-589 anyway.

### Second plan review, Codex, 2026-09-15

`gpt-5.6-terra` at medium, on the amended plan. The account of the copy that stays
is honest, the layout stories' route through the mock and the session is sound in
the runner and in the published Storybook, and nothing is an invented gate. Taken:

1. **The terminology exception is written down.** DESIGN.md's row 6 says the
   signup body keeps the rule where the file breaks it, as KN-329 does, rather than
   leaving that to this plan.
2. **The stories measure the card's width and the title's rendered box**, not only
   sizes and weights: the normal line is an assumption until the title's height is
   read at both widths.

Not taken: that the Login title differs from the frame. Node 407:6958 reads «ورود
به کارنما», as DESIGN.md's row 6 does; the review read another title. And that
`BrandRow.tsx` already existed: it was being built while the review read the tree.

## Result, 2026-09-15

Built as the amended plan says.

- **The Brand Row** is `shared/navigation/BrandRow.tsx`, and the Sidebar and the
  sign-in card both draw it. Its meta names no `component`: react-docgen reports no
  component that takes no props, which failed the docs guard until the meta
  rendered the row itself, as the sign-in screen's does. Its stories pass in both
  languages, and so do the Sidebar's and the Navigation's, 16 of 16.
- **The card, heading, note and copy** are as steps 2 to 5 say, with
  `elevation.authCard` in the tokens, both token tests and DESIGN.md's table and
  prose. Row 6 of DESIGN.md records the card, the terminology exception and the six
  cards.
- **Measured under Vitest**: `LoginAsTheFrames`, `CodeAsTheFrames` and
  `SignupAsTheFrames` pass at 1440 and at 390. The card is 440 and 342 wide, with
  padding 32, gap 24, radius 16, `bg/surface`, a one pixel `border/default` edge
  and the shadow. The title is 24 at 600 and its box measures 38, the font's
  normal line matching the file's; the body is 14 in `text/secondary`. The Login
  note is 12 at 400, centred, in `text/disabled`. The sign-in stories pass 12 of 12.
- **Planted**, each once and each restored to hash 10be847. The padding put back to
  lg failed the three layout stories on `expected [ 24, 24, 24, 24 ] to deeply
equal [ 32, 32, 32, 32 ]`. The shadow taken out, alone, failed them on `expected
'none' to be 'rgba(0, 0, 0, 0.06) 0px 4px 16px 0px'`.
- **The unit project** passes 1457 of 1457: the catalogs, with 'Sign in', 'What
  should we call you?' and 'Continue' gone as nothing uses them; the token guard;
  and the docs guard. eslint and tsc are clean. After it, the token test also reads
  DESIGN.md's `407:6952` row, as it reads every other shadow's. With the row taken
  out it failed on that match, and DESIGN.md was restored to hash 0af860b. The
  token and theme tests pass 66 of 66, and DESIGN.md, kept by hand, differs from
  prettier by HEAD's 234 lines, the new row written as prettier writes it.
- **e2e**: `sign-in.spec.ts` passes 8 of 8 on the desktop and phone projects.
  `connected.spec.ts` takes the new names, and was not run: it needs the scenario
  server.
- **Seen**, in a production Storybook of the change built under
  `/KarNama/storybook/`, 16 screenshots with no console or page error: Login, Code
  and Signup in Persian light and dark, and Login in English light and dark, at
  1440 and 390. The Login card is 386 tall at both widths, where the file draws 387
  on a desktop and 409 on a phone, whose body wraps the text message KN-589 holds
  back. Signup is 344, the file's 390 less the skip, KN-588. The code step is 530,
  with the mock's notice, the one field and the resend. The dark English note is
  dim, which is KN-591's question.
