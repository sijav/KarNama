# KN-469 · F6 never reaches the page: the browser takes it first, so the bulk bar's key does nothing

**Why, from the board.** The card exists so a keyboard reader can reach the bar
from inside the list. As shipped they cannot, and the test says they can, which is
worse than not having done it.

**Exit condition, from the board.** The key reaches the page in Chrome and
Firefox, the bar takes focus, and the story says plainly what it can and cannot
prove about the browser's own dispatcher.

## What is there, read 2026-09-14

- **The bar**, `BulkActionBar.tsx`: while anything is selected, a `keydown`
  listener on the document takes `F6` without Alt, Ctrl or Meta, prevents its
  default and focuses the bar's first button. The status line says "Press F6 for
  the bulk actions.", «برای کارهای گروهی F6 را بزن.», and the region carries
  `aria-keyshortcuts="F6"`. One constant, `SHORTCUT`, feeds all three.
- **The story**, `ReachedFromInsideTheList`, focuses a row in the middle of a
  list, presses F6 with `vitest/browser`'s keyboard, and finds focus in the bar.
  Its comment calls the runner's key "a key the browser routes, not a synthetic
  event the page merely receives". Nothing established that: the runner drives a
  browser with no address bar, so nothing there could take F6 first, and whether a
  key sent through the automation channel meets the browser's own shortcut
  handling at all is not known.
- **The docs** argue for F6 over a letter and a chord, and say nothing of what a
  browser does with it.
- **The card's premise is a claim, not a measurement.** KN-330's roast said Chrome
  reserves F6 for the address bar and Firefox uses it for frame navigation, citing
  each browser's list of shortcuts. A list of shortcuts says what a key does when
  the page lets it; it does not say whether the page hears the key first and can
  keep it. My understanding, from memory and so to be checked, is that both
  browsers hand a page most shortcut keys first and honour its `preventDefault`,
  keeping a small reserved set for themselves. Whether F6 is in either set is the
  question, and neither list answers it.
- **KN-330's other finding**, the listener acting while a modal is open over the
  board, is KN-470, and it is not this card's.

## The approach

1. **Measure in real browsers, with real keys, before choosing a key.**
   - **The browsers.** Chrome as installed here, 152.0.7977.83. There is no
     Firefox installed on this machine, only Playwright's own Firefox build,
     `ms-playwright/firefox-1532`; it is started as a plain Firefox, without the
     automation switch, and the record names it for what it is.
   - **The keys come from the operating system**, `SendKeys` from PowerShell, so
     they enter the browser's window the way a reader's key does, and not through
     an automation channel. **What the page saw comes back through its own title**,
     which the window's title shows, so nothing reads the page through automation
     either.
   - **The page**: a field, the row, focused on load; two buttons, the bar; a
     `keydown` listener recording every key; the window's blur and focus recorded;
     `?key=F6` or `?key=F2`; and `?claim=1`, which prevents the key's default and
     focuses the first button, as the bar does.
   - **Each run**, per browser, per key, with and without claim, in a fresh
     window on a throwaway profile: a real `a`, which must land in the field and so
     shows real keys reach the page; the key; then, without claim, a real `x`,
     which lands in the field only if focus stayed in the page, and, with claim, a
     real Tab, which moves focus to the second button only if focus stayed in the
     page.
   - **Nothing lands anywhere else.** Before every key the script checks that the
     window in front belongs to the browser it started, and sends nothing
     otherwise. It stops only the processes whose command line holds its own
     throwaway profile.
2. **Decide from what was measured.**
   - F6 reaches the page and, claimed, keeps focus there in both browsers: F6
     stays, and the card's premise is recorded as measured untrue, with the
     versions.
   - F6 is taken first in either, and F2 reaches the page and keeps focus in both:
     the key becomes F2, through `SHORTCUT`, the message and its Persian, the
     story and the docs.
   - Neither works in both: stop, and put the measurement to the owner.
3. **The story says what it can and cannot prove.** Its comment says the runner
   presses the key inside a browser that has no address bar, so the story proves
   the bar answers the key once the page has it, and nothing about whether a
   browser gives the page the key; that is the measurement's, recorded in the
   docs with its date and the versions.
4. **The docs** of `ReachedFromInsideTheList`, in both languages, say what was
   measured.

## Files

- The measurement: a page and a PowerShell script in the session's scratchpad,
  not the repository; its result goes in this plan and in the docs.
- If the key changes: `BulkActionBar.tsx`, `i18n/locales/en-US.ts` and
  `fa-IR.ts`, since the message's English id names the key, the story, both docs.
- Either way: the story's comment and both docs.

## What I am unsure of

- **Whether `SendKeys` reaches a browser as a physical key does.** It goes through
  the Windows input queue to the window in front, which is the path a physical
  key takes after the keyboard driver, marked as injected; I know of no browser
  that treats an injected key differently for its shortcuts, but I have not
  checked.
- **Whether a script started from this session may bring a browser to the
  front.** Windows refuses the foreground to a process not allowed to take it. If
  the check before a key fails, the measurement stops rather than guessing, and
  the way to the answer is then the owner pressing the key.
- **Firefox's first run** on a fresh profile may open a tab of its own and take
  focus from the page. The profile gets preferences that skip it, and the
  baseline `a` shows whether the page has focus.
- **Screen readers.** KN-330's roast said NVDA, JAWS and VoiceOver give F6 with
  modifiers meanings of their own. The bar takes F6 only without Alt, Ctrl or
  Meta, a screen reader's own commands are outside what can be measured here, and
  the card's exit is about the browsers.

## Plan review, Codex, 2026-09-14

Codex, with web search, found the premise false from the browsers' own source.
Chromium's accelerator table maps F6 to focusing the next pane, and
`BrowserCommandController::IsReservedCommandOrKey` does not reserve that command,
so the page hears the key first. Firefox dispatches F6 to the page, honours its
`preventDefault`, and only then moves focus through its frames and the address
bar. So F6 stays, and F2 is not needed. Taken from it:

- **Real input through `SendInput`, not `SendKeys`.** Microsoft documents that
  `SendKeys` may use an older journal hook depending on the environment, so the
  keys are sent with `SendInput` itself, checked against the exact window in front
  before each one, and each answer is read from that window's own title.
- **The record names the operating system and each browser's exact build**, the
  Firefox one as Playwright's packaged build.
- **Shift+F6 is left to the browser.** The bar's guard excludes Alt, Ctrl and Meta
  but not Shift, so while anything is selected it takes Shift+F6, which both
  browsers use to go back through their panes and frames. The guard takes Shift
  too; the story shows Shift+F6 leaving focus on the row with its default not
  prevented, and F6 moving it to the bar with its default prevented, red first;
  and the measurement shows a real Shift+F6 going to the browser.

## Measured, 2026-09-14, a first look

The measurement as first planned, with `SendKeys`, before the review asked for
`SendInput`. In both browsers the page heard F6. Without `preventDefault` the
browser then took focus from the page, so a real `x` never reached the field, and
Chrome also blurred the window. With `preventDefault` the first button took focus
and a real Tab moved on to the second, inside the page. F2 behaved the same with
no browser action at all. The run with `SendInput` is the record, below.

## Measured with SendInput, 2026-09-14, the record

Windows 11 Pro for Workstations 10.0.26200; Chrome 152.0.7977.83; Firefox 151.0,
build 20260611193205, Playwright's packaged build, started without its automation
switch. Keys were sent with `SendInput`, each only after the exact window of the
browser that run started was confirmed in front, and each answer was read from
that window's title.

| Browser | Run | The key | Then |
| --- | --- | --- | --- |
| Chrome | F6, not taken | the page heard F6, then the window blurred | a real `x` never reached the page |
| Chrome | F6, taken as the bar does | heard, the first button focused, no blur | a real Tab moved to the second button |
| Chrome | Shift+F6, left alone as the bar now does | heard, not taken, the window blurred | a real `x` never reached the page |
| Firefox | F6, not taken | the page heard F6 | a real `x` never reached the page |
| Firefox | F6, taken as the bar does | heard, the first button focused | a real Tab moved to the second button |
| Firefox | Shift+F6, left alone as the bar now does | heard, not taken | a real `x` never reached the page |

Every run began with a real `a` landing in the field, so real keys reached the
page each time. **F6 reaches the page first in both browsers, and a page that
prevents its default keeps focus; left alone, F6 and Shift+F6 take focus out of
the page in both, so these keys did pass through each browser's own handling.**
Firefox fired no blur and its title kept saying the document had focus, yet the
`x` went elsewhere, so its answer is read from where the `x` went.

**Decided: F6 stays.** The card's premise is measured untrue for these two
browsers. The guard now leaves Shift+F6 to the browser, the story says what it
can and cannot prove, and the docs record the measurement.

Red first: the story's new Shift+F6 step failed on the bar as it was, at
`expect(middle).toHaveFocus()`, line 265, since the bar took Shift+F6 and pulled
focus to itself.

## Result, 2026-09-14

- **`BulkActionBar.tsx`**: the guard leaves Shift+F6 to the browser, and the
  comment records what was measured.
- **`ReachedFromInsideTheList`** presses Shift+F6, which leaves focus on the row
  with its default not prevented, then F6, which brings focus to the bar with its
  default prevented, each default read on the window after the bar's listener. Its
  comment says the runner's Chromium is headless, with no panes, so the story shows
  what the bar does with a key and not what a browser does with it first.
- **The docs**, in both languages, record the measurement: the date, the system,
  the browsers' versions, Firefox as Playwright's build, and Shift+F6 left alone.

Plants on `BulkActionBar.tsx`, each restored byte for byte and checked by hash,
each run against `ReachedFromInsideTheList` alone:

- **The guard takes Shift+F6 again** fails at the row's focus, line 265.
- **F6 taken without its default prevented** fails at the record of defaults,
  line 273, `false` where `true` was expected. The runner has no panes, so only
  that assertion can see it.
- **F6 taken and nothing focused** fails waiting for focus in the bar, line 271.

Passing at the commit: the bar's seven stories; the docs guard, 75; eslint and
tsc clean; both code files formatted; the web unit project, 1382, run with
nothing else running. Run straight after the plants, it failed both cases of
`core/api/session.test.ts` again, after 12.7 and 1.0 seconds, as it did after
KN-467's plants; alone that file passes in 1.3 seconds. That is KN-551, noted
there.
