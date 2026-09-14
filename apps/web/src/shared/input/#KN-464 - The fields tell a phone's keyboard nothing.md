# KN-464 · The fields tell a phone's keyboard nothing: no input type, no inputMode, no enterKeyHint, no autocomplete

**Why, from the board.** The owner opened the product on a phone twice today and
both times what was wrong was the phone, not the desktop. A form is what KN-463
gives; this is what actually changes the keyboard that comes up and whether
anything can be filled in for the reader.

**Exit condition, from the board.** Each field declares the type, inputMode,
enterKeyHint and autocomplete its content wants, and a story reads them off the
rendered inputs in both languages.

## What is there, read 2026-09-14

The card was written before part of it was built, so first what is already true:

- **The Input takes `type`, `inputMode` and `autoComplete`**, `Input.tsx` lines 27
  to 29: `inputMode` reaches the element through `inputProps`, line 205, and the
  other two through the field spread onto `InputBase`.
- **The sign-in steps declare them**, `AuthScreen.tsx`: the number `type="tel"`,
  `inputMode="tel"`, `autoComplete="tel"`; the code `inputMode="numeric"`,
  `autoComplete="one-time-code"` and a `maxLength` of 5; the name
  `autoComplete="name"`. The card asks for `inputMode="numeric"` on the number;
  `tel` is the value HTML gives a telephone number, which keeps the plus key a
  `+98` needs, so it stays.
- **Both posting links are `type="url"`**, `JobForm.tsx` and `JobModal.tsx`, and
  the dates `type="date"`.
- **Every form is `noValidate`**, KN-463, so a field's type changes its keyboard
  and never raises the browser's own validation bubble.

What is not:

- **`enterKeyHint` nowhere.** The Input does not take it, and the Search Bar's own
  input has none, so a phone's action key never says Send, Go, Done or Search.
- **The contact modal's fields declare nothing**, `ContactModal.tsx` lines 171 to
  186: its email, phone and social link bring up the letters keyboard.
- **No story reads any of these** off a rendered input.

## The approach

1. **The Input takes `enterKeyHint`**, passed to the element beside `inputMode`,
   with its entry in the Input's docs in both languages.
2. **Each field says what its action key does**, which since KN-463 is what Enter
   does in its form, so the hint never promises what pressing it will not do:
   - the number's step sends the code, `send`; the code's step signs in, `go`; the
     name's step finishes, `done`;
   - the contact modal, the add flow's form, the job modal's posting link and the
     board's rename save, `done`, on every single-line field;
   - the Search Bar, which filters as the reader types, `search`;
   - the add flow's paste field and the description are several lines, where the
     key makes a new line, and are left as the browser has them.
3. **The contact modal's fields take their keyboards**: the email `type="email"`,
   the phone `type="tel"` and `inputMode="tel"`, the social link `type="url"`.
4. **Autocomplete where it is the reader's own**: the sign-in fields already, and
   `off` on the contact modal's name, role, company, email and phone, which hold
   somebody else's: a `name`, `email` or `tel` there would offer the reader their
   own details for another person's record.

## The tests

- **The Input**: a story, `KeyboardHints`, that renders an Input given a type, an
  input mode, an enter key hint and an autocomplete, and reads all four off the
  rendered input.
- **The sign-in**: a story, `KeyboardsForEachStep`, in Persian and in English,
  that walks the three steps and reads each field's type, input mode, enter key
  hint and autocomplete.
- **The contact modal**: a story, `KeyboardsForEachField`, in both languages, that
  reads its six fields.
- **The rest** by one assertion each in a story that already opens them: the add
  flow's form, the job modal's link, the board's rename and the Search Bar.
- **Red first**: every new assertion fails on today's code where it reads an
  enter key hint, and the contact modal's where it reads a type.
- **Plant**: the Input dropping `enterKeyHint` fails the Input's story and every
  field's.

## Files

- `apps/web/src/shared/input/Input.tsx` and `Input.stories.tsx`, and the Input's
  docs in both languages.
- `apps/web/src/screens/AuthScreen.tsx` and its stories and docs.
- `apps/web/src/shared/modal/ContactModal.tsx` and its stories and docs.
- `apps/web/src/shared/add-job/JobForm.tsx`, `apps/web/src/shared/job-modal/JobModal.tsx`,
  `apps/web/src/screens/JobsScreen.tsx` and `apps/web/src/shared/search-bar/SearchBar.tsx`,
  with an assertion each in a story they already have.

## What I am unsure of

- **Whether a browser honours `autoComplete="off"`** on an email or a phone field:
  some offer saved addresses anyway. It is still the honest declaration of whose
  details the field holds.
- **`done` against `go` or `send`** for the forms that save: `done` is what the
  platforms show for finishing a form, and it closes the keyboard as the save
  closes the modal.
- **The Search Bar's `search`**: pressing it filters nothing new, since the list
  follows the typing, but it is the key a reader expects on a search field, and
  it closes the keyboard over the results.
- **How much the stories can see**: they read attributes; which keyboard a phone
  then draws is the platform's, and only a phone shows it.

## Plan review, Codex, 2026-09-14

Codex approved the plan as the smallest change that meets the card: the Input's
new prop reaches the element, since MUI forwards `inputProps` to it and React
19 types `enterKeyHint`; `send`, `go` and `done` fit the sign-in steps and the
forms that save, because their submit already does what the key says; `tel`
rather than `numeric` is right for the number; and `autoComplete="off"` is the
most honest declaration a web page can make for fields holding somebody else's
details, no token meaning "never offer my own". Taken from it:

- **The Search Bar keeps no `search` hint.** A hint changes the key's label, not
  what it does, and the Search Bar has no submit and no Enter handler: the list
  follows the typing. Its `type="search"` already asks a phone for its search
  keyboard. Whether pressing that key should close the keyboard over the results
  is a choice for the product, not this card: filed as its own card.
- **No `inputMode` where the type already says it**: the email `type="email"`, the
  link `type="url"`, the phone `type="tel"`, nothing more.
- **The social link declares `autoComplete="off"` too**, so every field of the
  contact modal says whose it is.
- **A request, not a guarantee**: Safari ignores `autocomplete="off"` for its
  AutoFill, and Chrome applies heuristics, so a phone may still offer the reader's
  own email or number in the contact modal. The attributes are what the page can
  say; which keyboard and which suggestions a phone shows is only seen on one.

## Result, 2026-09-14

- **Red first.** All ten checks failed on today's code where they read a
  keyboard: the Input's `KeyboardHints`; the sign-in's number in both languages,
  its first read; the contact modal's and the add form's first field in both
  languages; the job modal's link in `Info` and `InEnglish`, at its key hint after
  its `type="url"` check had passed; and the rename's key hint in `Managing`.
- **The change.** The Input takes `enterKeyHint` into `inputProps`; the sign-in's
  keys say `send`, `go` and `done`; every single-line field of the contact modal,
  the add form, the job modal's link and the rename says `done`; the contact
  modal's email, phone and link take `email`, `tel` and `url`, and all six of its
  fields `autoComplete="off"`. The Search Bar keeps `type="search"` and no hint,
  and what its key should do is **KN-547**. A reader for the four attributes,
  `shared/story-fixtures/keyboard.ts`, serves the four story files, with its own
  unit test.
- **Lint.** The translation rule flagged every `enterKeyHint` value, 21 times,
  though React types it as a list of literals; `enterKeyHint` joined the rule's
  structural props, with why beside it.
- **Green.** The ten checks pass, and the contact modal's and the sign-in's story
  files whole, 21; tsc is clean; the web unit project passes, 1379, the docs guard
  and the reader's tests among them.
- **Plant.** The Input dropping `enterKeyHint` failed all ten checks, and was
  restored byte for byte, checked by hash.
- **Formatting.** The contact modal's five fields this change lengthened, and the
  sign-in stories' import block its new import moved, were brought to the
  formatter's shape by hand; both files are now fully formatted, where they had
  16 and 4 differences at HEAD, all on those same lines. Every other changed file
  keeps the differences it had at HEAD.
- **Not seen.** Which keyboard a phone draws, and whether Safari offers the
  reader's own details in the contact modal regardless, is only seen on a phone.
