# KN-481 · Every page looks like its Figma frame

Beside the screens, per `agent/RALPH.md` step 2b: an audit of the pages against
canvas `5:7`, with the small fixes made here and the rest filed.

## The card

**Why.** The design is the contract, AGENTS.md: match the design exactly. The
owner tests the deployed app and sees pages that do not look like the file.

**Exit condition.** This card's notes hold, for each page at both widths, its
frame id and every difference found; each difference is fixed on main or filed
as a card; the fixed pages are screenshotted again beside their frames.

**The owner, 2026-09-14:** "nothing looks like the figma anyways, it should look
like the figma!"

## What is true today

- Canvas `5:7` holds the frames DESIGN.md section 8 names, read with `use_figma`
  on 2026-09-14. The ten this card compares, in fa-IR light:

  | Page      | 1440                                   | 390                                   | The app's state                      |
  | --------- | -------------------------------------- | ------------------------------------- | ------------------------------------ |
  | Board     | `241:2` My Jobs / Desktop, Board       | `241:146` My Jobs / Mobile, Board     | sample data loaded, `#/jobs`         |
  | Add flow  | `243:814` Add Job / Desktop, Paste     | `243:682` Add Job / Mobile, Paste     | `#/add`, the paste step              |
  | Job modal | `243:1213` Job Modal / Desktop, Info   | `243:1078` Job Modal / Mobile, Info   | a card opened on its Info tab        |
  | Network   | `252:2` Contacts / Desktop             | `252:411` Contacts / Mobile           | sample contacts, `#/network`         |
  | Sign in   | `407:6951` Auth / Desktop, Login       | `407:7022` Auth / Mobile, Login       | signed out                           |

- **Departures DESIGN.md already records are decisions, not differences**: the
  rejected column last and collapsed, KN-070; five job modal tabs with history
  second, KN-072; «فرصت شغلی» where the file says «آگهی», KN-329; the shell's own
  controls as Icon Buttons and the settings gear, KN-478; the language flag,
  KN-479; the Settings dialog, which no frame draws. They are listed as such and
  left.
- **Already on the board**: a phone's 24 of gutter where the file draws 16,
  KN-452; the Settings dialog's MUI parts, KN-507; clean paths, KN-505. A
  difference that matches a card is noted against that card, not filed twice.
- **The records differ from the file's specimens.** The sample data is not the
  frames' jobs and contacts, so names, counts and text lengths are not
  compared; sizes, spacing, type, colour, order and presence are.
- One difference is known before looking: a phone's board header draws its
  add button in `241:146`, and `JobsScreen` leaves it out on a phone by a code
  comment of its own, which DESIGN.md does not record as a decision.

## The approach

1. **Capture both sides at the frame's own size.** The frame through
   `use_figma`'s `node.screenshot()`, at one pixel to one; the app headless with
   Playwright against the dev server at the same viewport, 1440 by 900 or 390
   by 844, device scale one, fa-IR light, signed in, the sample data loaded from
   Settings where the frame shows records.
2. **Read them region by region**: the navigation, the page header, the toolbar
   of search, sort and chips, the content, and anything open over it.
3. **Measure what looks different, never judge it by eye alone**: the node's
   box, padding, gap, text size, weight and bound colour from `use_figma`,
   against the element's box and computed style in the app. A difference is
   written with both numbers.
4. **Write each page at each width into the card's notes** with `todo edit
   KN-481 --note`: the frame id, then every difference, each marked a recorded
   decision (with its DESIGN.md heading), a card already filed (with its id),
   fixed here (with its commit), or filed now (with its new id).
5. **Fix here what is under four points**, one page at a time, its stories
   updated and committed with it; **file the rest** with every field, `--area
   web --okr OKR-1`, sized honestly. If the fixes here would take this card
   well past its eight points, the smaller ones are filed too rather than
   letting the card swallow the page work.
6. **Screenshot every fixed page again** beside its frame, and say so in its
   note.

## What I expect to be hard, and what I am unsure about

- **Reaching each state headless**: the add flow is `#/add`; the job modal needs
  a card clicked; sign-in needs no session. The loading and review steps are
  not in this card's ten.
- **Type metrics**: the app loads Vazirmatn Variable, and the file names
  Vazirmatn; a pixel or two of line box is not a difference unless the node
  binds a size the app does not use.
- **"Under four points"** is read per difference. A page with twenty small
  differences is still twenty entries, and the card stays near its size by
  filing what does not fit.
- **The phone board header**: whether the file's add button fits beside the
  title and the shell's three controls at 342 is measured, and if it does not,
  where it goes is the owner's decision to ask for rather than mine to make.

## The plan review, and what changed

Codex, plan kind with web search, 2026-09-14, archived at
`%TEMP%/claude-roast/2b1874631dd1/20260914T125327-plan-kn-481-every-page-looks-like-its-figma-frame-set-74abb0.md`.

- **Screenshots region by region, then nodes against boxes and styles, is the
  right method**; `get_design_context` supplements it where a pair leaves a
  region ambiguous, and does not replace it. Accepted.
- **Captures need a fonts-ready barrier, animations off and the caret hidden**,
  or Vazirmatn arrives late and wraps lie. Accepted: the captures are taken
  again that way, each in a fresh browser context seeded the same way.
- **Ten fa-IR light pairs meet the Figma part, not the repository's four
  combinations.** Accepted: the same ten app states are captured in en-US light,
  fa-IR dark and en-US dark as layout checks, with no Figma counterpart claimed.
- **"Under four points" is not per difference.** Accepted: that rule is AGENTS.md's
  for a roast's finding joining its objective. This card fixes the related small
  corrections that fit its eight points and files coherent remaining work.
- **History second is not a decision.** Accepted: DESIGN.md calls its position an
  author proposal never put to the owner, so it is recorded as open, not waived.
- **The phone board's missing add button is a difference to fix, not an owner
  question**, since the frame draws it and nothing records its removal.
  Accepted as a difference. Measured first: at 342 the title, the file's 145
  wide Button M and KN-478's three controls with their gaps come to about 439,
  so the drawn button cannot sit beside the owner's controls as drawn; how it
  fits is then a question with named options, not an omission.

## How I will know it worked

The card's notes hold ten entries, five pages at two widths, each with its frame
id and each difference marked decided, already filed, fixed or filed now; the
fixed pages are screenshotted again beside their frames; the stories of any
changed component pass and lint and tsc are clean.

## What was fixed here, and what was filed

Every page's differences are in the card's notes. Fixed on main: the Header
band on the board and the network at both widths, with the page's gutters of 32
and 16 inside it and under it, which closes KN-452; the Page Header's 44; the
desktop board's toolbar, the search bar's 320 at the inline start and the sort
at the inline end; the columns 16 apart; the network's two columns 24 apart and
a phone's list 12 apart; the board staying current while the add flow is open.
The frames' numbers are asserted from the shell by `App/Shell`'s
`LaidOutAsTheFrames`, in both languages. Filed as cards: KN-512 to KN-518, three
of them waiting on the owner.
