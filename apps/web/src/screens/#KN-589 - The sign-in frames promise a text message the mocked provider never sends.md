# KN-589 - The sign-in frames promise a text message the mocked provider never sends

## The card

**Why.** A reader told a text message is coming, and then told on the next step that none was sent,
is told something untrue by the product's first screen.

**Exit, as amended on 2026-09-16.** While the login is mocked, neither sign-in step says or implies
that a message was sent: the Login body asks for the number, and the code step names whose code it
is without claiming delivery, with KN-459's notice showing the code. DESIGN.md records what the file
draws, what the build draws instead, why, and what is restored when a real provider sends. Both
steps are asserted at 1440 and 390 in Persian and in English.

Filed by Codex's review of KN-518's plan, 2026-09-15.

## Why the exit was amended, and who decided what

The exit said "The owner has chosen the Login body and the code step's line". Asked through the
question tool on 2026-09-16, the owner answered "Is that really important that you stopped working
for? Who cares!" — so they declined to choose and told me not to stop work for a question of that
kind. An exit that names them cannot then be satisfied by recording my own decision: that would
dress my judgement as theirs. So the exit now turns on what the screens say, which is checkable by
anyone, and **the substantive choice is mine and is labelled as mine wherever it is recorded.**

## Measured before planning, 2026-09-16

- **The file, read with use_figma**, all four frames. `407:6951` at 1440 and `407:7022` at 390 draw
  «ورود به کارنما» over «شماره موبایلت را وارد کن؛ یک کد پنج‌رقمی برایت پیامک می‌کنیم.». `407:6972`
  and `407:7043` draw «کد را وارد کن» over «کد پنج‌رقمی را به ۰۹۱۲ ۳۴۵ ۶۷۸۹ پیامک کردیم.». One
  promises a text message; the other says one was sent.
- **The Login body is already truthful**: `AuthScreen.tsx` line 284 draws `Sign in to KarNama` over
  `Write your mobile number`, «شماره موبایلت را وارد کن», which claims nothing.
- **The code step's line is NOT.** Line 218 draws `Sent to` and the number, «ارسال شده به ۰۹۱۲ ۳۴۵
  ۶۷۸۹». Nothing is sent to that number at all: the mock puts the code on the screen, which KN-459's
  notice at line 238 then says outright. That is the very shape this card's why condemns, a claim of
  delivery corrected a line later, so the notice does not cure it. **An earlier draft of this plan
  called that line true and proposed no copy change. That was wrong**, and Codex's review of the
  plan caught it.
- **What the mock does instead of sending.** `AuthProvider.tsx` line 177: `send` makes the code with
  `sendCode(phone, Date.now(), random)`, holds it pending with its `retryAt`, and writes
  `KarNama mock SMS to <phone>: <code>` to `console.info`, its own comment saying "Where the SMS
  would have gone". The screen then shows that code through KN-459's notice. Nothing leaves the
  browser, which is what the DESIGN.md record has to say.
- **Every place that carries the line**, eight of them, and three do not read the id at all:
  - `locales/fa-IR.ts` line 247 and `locales/en-US.ts` line 246, the id `Sent to`.
  - `AuthScreen.tsx` line 218, the one place it is drawn.
  - `AuthScreen.stories.tsx` line 478 and line 576, through `i18n._('Sent to')`.
  - `AuthScreen.stories.tsx` line 99, which hardcodes «ارسال شده به» with a comment saying the step
    "says where the code went" — a comment that is itself the mistaken claim.
  - `e2e/sign-in.spec.ts` line 39, inside the shared `signIn` helper, and line 115. **Because line
    39 is in the helper, every e2e test that signs in runs that assertion**, so this touches the
    whole e2e suite rather than one spec.
  - A search for the English id alone would have found four of the seven. The Persian search found
    the rest, which is the same trap KN-565 hit; that is now twice.
- **What is NOT met in the second half of the exit.** `LoginAsTheFrames` and `CodeAsTheFrames`
  assert each step's heading and body through `cardIsTheFrames`, and `atBothWidths` runs them at
  1440 by 900 and 390 by 844, but both pin `globals: { locale: 'fa-IR', colorScheme: 'light' }`. The
  `InEnglish` story, line 117, is `globals: { locale: 'en-US' }` with **no play at all**: it renders
  English and asserts nothing.
- **Five places pin Persian inside the helpers**, all read. `cardIsTheFrames` line 359 takes the
  brand name from `i18nFor('fa-IR')`, and the catalogs differ, `KarNama` being «کارنما» in Persian
  and `KarNama` in English, so it would look for the Persian word on an English page.
  `CodeAsTheFrames` builds its countdown with `formatClock('fa-IR', …)`. `codeRowIsTheFrames` line
  421 finds its field by `i18nFor('fa-IR')._('Five digit code')`. `linesUnderTheAction` line 439
  takes `i18nFor('fa-IR')` for `Confirm and sign in` and `Change the number`. And
  `formatPhone(locale, raw)` converts each digit through `Intl.NumberFormat(locale)`.
  `formatClock(locale, seconds)` already takes a locale. Everything else `cardIsTheFrames` asserts
  is locale-free, read to its end.
- **The English layout at 390, measured in the running Storybook rather than argued.** The card is
  342 wide; the Login step's title `Sign in to KarNama` is 24px and exactly 38 tall by 278 wide, its
  body 22 tall; driven on to the code step, `Enter the code` is 38 tall and `Sent to 0912 345 6789`
  is 22 by 278. Neither English step wraps at the narrow width, and 1440 is wider, so the height
  assertions hold. The status line read `No message is really sent yet. Your code is:93175`.
- **The house pattern for a pair of locales is already here**: `keyboardsIn`, a
  `(locale: Locale): NonNullable<Story['play']>` factory, with `KeyboardsForEachStep` and its
  English twin; `CountsDownToAResend` likewise. The docs for those twins are one line, "The same, in
  English." and «همان، به انگلیسی.».
- **DESIGN.md already records the divergence as an open question**, in section 8: "The build keeps
  its own words, until the owner says". After 2026-09-16 that is false.
- **Drift baselines**: `AuthScreen.stories.tsx` 0, `AuthScreen.tsx` 0, `DESIGN.md` 236. The sign-in
  stories pass 15 of 15 before any change, and `sign-in.spec.ts` 10 of 10.

## The approach

1. **The code step stops claiming delivery.** The id `Sent to` becomes `Code for`, «کد مربوط به», so
   the line reads `Code for 0912 345 6789` and «کد مربوط به ۰۹۱۲ ۳۴۵ ۶۷۸۹». It names whose code is
   on the screen, which is exactly what is true while the provider is mocked, and it keeps the shape
   of a label beside a formatted number, so every assertion's structure survives. The Login body is
   left alone, being already truthful.
2. **All eight places move together**, both catalogs, the one draw, the three story assertions and
   the two e2e assertions, with line 99's comment corrected: the step names whose code it is, and
   says plainly that nothing was sent. A search of the source for `Sent to` and «ارسال شده به» after
   the change is the guard against one being left behind.
3. **The two frame plays become locale factories**, `loginAsTheFramesIn(locale)` and
   `codeAsTheFramesIn(locale)`, shaped like `keyboardsIn`, with the existing stories passing
   `'fa-IR'` so what they assert today does not change.
4. **The five pinned helpers take the locale** they are asserting in.
5. **Two new stories**, `LoginAsTheFramesInEnglish` and `CodeAsTheFramesInEnglish`, pinning
   `{ locale: 'en-US', colorScheme: 'light' }`, which puts the English copy of both steps under
   assertion at 1440 and at 390.
6. **DESIGN.md records a decision, not a pending question**: what the file draws on both steps, what
   the build draws instead, that the choice is mine after the owner declined on 2026-09-16 and their
   words, and that the file's two lines are what to restore when a real provider sends. KN-590's
   half of that sentence, the terms note, is left exactly as it stands.
7. **The docs gain both entries in both languages**, in the one-line form the existing twins use,
   and the existing `CodeAsTheFrames` entry is corrected in both: it says the heading "says where the
   code went", «سرآغاز می‌گوید کد کجا رفته», which is the same delivery claim again, in prose. A
   change of copy that leaves its own documentation asserting the thing removed has not been made.

## What I will change

- `apps/web/src/i18n/locales/fa-IR.ts` and `en-US.ts`, the one id
- `apps/web/src/screens/AuthScreen.tsx`, line 218
- `apps/web/src/screens/AuthScreen.stories.tsx`, the assertions and the two new stories
- `apps/web/e2e/sign-in.spec.ts`, lines 39 and 115
- `apps/web/src/shared/story-docs/en/Screens-SignIn.md` and `fa/Screens-SignIn.md`, two entries added
  and the `CodeAsTheFrames` one corrected, in each
- `DESIGN.md`, one sentence in section 8

## What I expect to be hard, and what I am unsure of

- **The new Persian must read naturally, not merely be true.** The first draft was «کد برای ۰۹۱۲
  ۳۴۵ ۶۷۸۹»; the second review judged «کد مربوط به» the more natural and the more neutral, which is
  the register frame `505:6` asks of a heading's subline rather than of microcopy, and that is what
  is built. It is a different width from the line it replaces, eleven characters against twelve but
  different glyphs, and rendered width is not character count, so the 390 measurement is taken again
  after the change rather than reasoned about.
- **The shared `signIn` helper means the whole e2e suite is in scope.** Line 39 runs for every test
  that signs in, so the proof is a full `playwright test` run and not `sign-in.spec.ts` alone, with
  KN-601 and KN-651 expected to fail as they already do.
- **The English stories could pass vacuously.** They are planted with the Persian body they must not
  find, and must fail; restored by hash, they must pass. A story that renders a language and asserts
  nothing is the defect being fixed here, so the new ones have to be shown to fail.
- **Dark is not a consequence of these stories.** Both new ones pin `colorScheme: 'light'` for the
  comparison with the file, so the look in dark is an explicit run through an unpinned English
  story, not something the frame stories cover.
- **Not widening the card.** The note's contrast is KN-591, decided by the owner the same day, and
  the terms wording is KN-590. Neither is touched beyond leaving their sentences alone.

## How I will know it works

- The four frame stories pass, the two Persian ones unchanged and the two English ones new, each at
  1440 and at 390; the sign-in stories as a whole go from 15 to 17.
- **The positive control**: each English story is planted with the Persian body, must fail, and must
  pass again once restored, checked by hash.
- The full e2e suite runs, since `signIn` is shared; its only failures are KN-601 and KN-651.
- The unit project passes, the docs guard among it, two stories being added; `tsc` and eslint pass;
  no changed file's drift grows and this plan's is 0.
- **The subline does not wrap at 390**, asserted rather than eyeballed: `cardIsTheFrames` checks the
  body's text, size and colour but not its height, its line count or its overflow, so a wrapped
  Persian line would pass it unnoticed. The frame stories assert the body is one line of 22 and that
  the card scrolls no wider than itself. The 390 measurement taken before the change was of the old
  wording and does not carry over.
- A look at both steps in English, light and dark, at both widths, through an unpinned story.

## Plan review, 2026-09-16, Codex gpt-5.6-terra

**Not approved as written, and it was right twice.** First, the plan could not honestly claim "no
copy changes": `Sent to {phone}` still asserts delivery to that number while the mock only puts the
code on the screen, so the plan's own stated rule and its proposed implementation contradicted each
other, and it "documents away a remaining false delivery claim". That is taken in full — the code
step's line changes, and the catalogs, the screen, the stories and the e2e specs come with it.
Second, the exit named the owner, who declined to choose, so recording my own decision under it
would only appear to meet it; the exit is amended to a factual condition and the choice is labelled
as mine. It confirmed the two English stories are right scope rather than creep, since `InEnglish`
is only a smoke render; that the locale-factory approach is sound and `cardIsTheFrames`'s
`i18nFor('fa-IR')._('KarNama')` is the definite English break; and that the helpers' assertions are
strong enough that an English story cannot pass on matching text found elsewhere. Its warning that a
wrapped English body could evade the layout assertions is answered by measurement above: neither
step wraps at 390. Its note that the new stories pin `colorScheme: 'light'` and so cannot serve as
the dark look is taken into the checks.

## Second plan review, 2026-09-16, Codex gpt-5.6-terra

**Taken**: «کد مربوط به» rather than «کد برای», which it judged the more natural and more neutral
Persian for a subline — a native reading is what that question was asked for. It endorsed the exit
amendment as legitimate rather than a quiet weakening, since the board keeps the original condition,
the owner's refusal and the factual replacement, and said not to drop and refile the card. Its
account of the remaining SMS items matches the sweep I made before reading it: the one-time-code
autofill hint is not reader-facing copy, the API delivery errors belong to live mode through
`apiErrorText`, and `sendCode`, `SentCode` and the console line are internal names rather than
things a reader is told.

**Not taken as written, and this is a judgement rather than a deferral.** It holds that the resend
controls must change in THIS card, because «ارسال دوباره‌ی کد», again, presupposes a first send. On
the substance it is right, and the Login action «ارسال کد» is the weaker case, being imperative and
drawn by the file itself. But its reason is that my own amended exit said "neither step says or
implies", and it then reasons from my phrasing outwards into the timer, the link, the Login action,
their stories, `connected.spec.ts` and the mock provider's naming — on a one point card filed about
two heading sublines. **When an exit's phrasing drags in more than the card is about, the exit is
narrowed to the card, not the card swelled to the phrasing.** So the exit now names the two
sublines, and the resend vocabulary is filed as **KN-664**, medium and 2 points, carrying this
review's reasoning and the fuller change list it named.

Its last point is taken into the checks: the wrapping measured at 390 was of the old wording, so it
is measured again once «کد مربوط به» is in place.

## Third plan review, 2026-09-16, Codex gpt-5.6-terra

**Approved with three corrections, all taken.** Asked to argue the opposite side of the scope call,
it came down on the side of the split: KN-664 is properly filed with the wider surface and its own
proof, and the resend controls are "a real, known product defect" but not a failure of this card's
now-explicit two-subline exit. Its condition is one I am bound by: **KN-589 is not to be described
as making all sign-in language truthful.**

**The count.** It found a stale "all seven places" in the approach that I had corrected only in the
measured list. Eight live locations: two catalog entries, one screen, three story assertions, two
e2e assertions. A source search after the change now guards it.

**The DESIGN.md sentence, which it calls the likeliest mistake in the whole card.** The replacement
must be scoped in as many words to the Login and Code heading sublines, name the four Figma lines
against the two the build draws, say those Figma lines return when a real provider sends, and point
at KN-664 for the resend controls that still speak of delivery. Left unscoped, "the build keeps its
own words" reads as though nothing anywhere still implies a send, which would be false the moment it
was written.

**The no-wrap assertion.** `cardIsTheFrames` reads the body's text, size and colour and not its
height, line count or overflow, so a wrapped Persian subline passes it. Since «کد مربوط به» is not
the string that was measured at 390, the frame stories now assert the body is one line of 22 with no
horizontal overflow, and the look is taken again afterwards.

It confirmed the rest: the locale factories are necessary rather than overengineering, the two
English stories are the minimal way to satisfy the exit's both-languages clause, the e2e change is
required because the shared `signIn` helper carries the first assertion across the suite, and the
docs correction is required because the entry repeats the delivery claim in prose.
