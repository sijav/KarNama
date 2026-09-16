import { expect, test } from '@playwright/test'
import { prepareBoard, prepareNetwork } from './session'

/**
 * The search WAITS before it filters, KN-695.
 *
 * The Search Bar has always reported every key through `onChange` and handed the
 * settled text to `onSearch` 300 ms after typing stopped. No screen passed
 * `onSearch`, so the board and the contacts page filtered on every keystroke and
 * the wait ran for nobody, while four cards refined its edge cases. The owner
 * ruled the wait mandatory, so this is the proof that a reader actually meets it.
 *
 * **Its own file, and that is the point.** Playwright's clock must be installed
 * before the first navigation, and both `board.spec.ts` and `network.spec.ts`
 * navigate in a `beforeEach`. The seeding they used moved into `./session` so
 * this spec drives the same real add flow rather than a storage shortcut.
 *
 * **Why the clock rather than a wait.** A test that really sleeps 300 ms proves
 * the end state and hides the beginning: it cannot say the board was UNCHANGED
 * in between, which is the whole claim. Held time asserts both halves, and it is
 * why the old wiring fails here rather than merely running faster.
 */
const FIRST = 'توسعه‌دهنده فرانت‌اند'
const SECOND = 'مدیر محصول'
const MINA = 'مینا رضایی'
const REZA = 'رضا کریمی'
// Only in REZA: «رضا» alone would match «مینا رضایی» too, which would make the
// search prove nothing about which card it hid.
const ONLY_REZA = 'کریمی'
const CLEAR = 'پاک کردن جستجو'
// What SearchBar.tsx calls DEBOUNCE_MS. Held here rather than imported, because
// this spec is about what a reader meets and should fail if the component's
// number changes without the product being looked at again.
const PAUSE = 300
// The name the search goes under in the address, KN-697. Held here rather than
// imported for the same reason PAUSE is: a reader SHARES an address, so renaming
// it is a change to what they meet and should fail here rather than pass quietly.
const QUERY = 'q'

// INSTALL DOES NOT STOP TIME, which cost this spec a whole run to learn. Playwright's
// `install()` replaces the timer functions with fake ones that go on FLOWING; its own
// `pauseAt` example says to install, "let the page load naturally", because "Date.now
// will progress as the timers fire", and only then pause. A first version installed
// and typed, and more than 300 ms of that flowing time passed while the assertions
// ran, so the debounce fired by itself and every run failed at the same assertion,
// mutated and restored alike. That is a spec that cannot tell the two apart.
//
// So: install at a fixed start, seed while time runs normally, pause, and only then
// step the clock by hand. Seeding with time flowing is also what makes the real add
// flow usable, since it waits on the app rather than on a frozen page.
const STARTED = new Date('2026-09-16T08:00:00')
const PAUSED = new Date('2026-09-16T10:00:00')

test('the board waits for typing to stop before it filters, and clearing does not wait', async ({ page }) => {
  await page.clock.install({ time: STARTED })
  await prepareBoard(page, [FIRST, SECOND])
  await page.clock.pauseAt(PAUSED)

  const cardFor = (title: string) => page.getByRole('article').filter({ hasText: title })
  // What the ADDRESS says the board is searching, KN-697, which is also what it
  // filters by: one value, so the two can never disagree.
  const searching = () => new URL(page.url()).searchParams.get(QUERY)
  await expect(cardFor(FIRST)).toBeVisible()
  await expect.poll(searching).toBeNull()

  // Typed key by key, which is what a reader does and what `fill()` cannot show:
  // fill sets the whole value in one change, so it would look the same either way.
  await page.getByRole('searchbox').pressSequentially(SECOND)

  // The moment after the last key: the field has the text and the board has NOT
  // moved. This is the assertion the old wiring fails, because it filtered on
  // every keystroke.
  await expect(page.getByRole('searchbox')).toHaveValue(SECOND)
  await expect(cardFor(FIRST)).toBeVisible()
  await expect(cardFor(SECOND)).toBeVisible()
  // And the ADDRESS has not moved either: the search reaches it when it settles,
  // not while it is being typed, or every key would be a new address.
  await expect.poll(searching).toBeNull()

  // Still unmoved a tick before the pause is up.
  await page.clock.runFor(PAUSE - 1)
  await expect(cardFor(FIRST)).toBeVisible()
  await expect.poll(searching).toBeNull()

  // And on the tick that completes it, the board narrows AND the address says what
  // it is showing, so this board can be shared, bookmarked and reloaded, KN-697.
  await page.clock.runFor(1)
  await expect(cardFor(FIRST)).toHaveCount(0)
  await expect(cardFor(SECOND)).toBeVisible()
  await expect.poll(searching).toBe(SECOND)

  // Clearing is not typing: the bar searches for nothing without the pause, so the
  // board comes back with the clock NOT advanced at all. Pressing the control
  // rather than emptying the field, because emptying it by keyboard is typing and
  // would wait like any other key.
  await page.getByRole('button', { name: CLEAR }).click()
  await expect(cardFor(FIRST)).toBeVisible()
  await expect(cardFor(SECOND)).toBeVisible()
  // And the address is clean again rather than carrying an empty q.
  await expect.poll(searching).toBeNull()
})

test('the contacts page waits the same way', async ({ page }) => {
  await page.clock.install({ time: STARTED })
  await prepareNetwork(page, [MINA, REZA])
  await page.clock.pauseAt(PAUSED)

  const cardFor = (name: string) => page.getByRole('article').filter({ hasText: name })
  const searching = () => new URL(page.url()).searchParams.get(QUERY)
  await expect(cardFor(MINA)).toBeVisible()

  await page.getByRole('searchbox').pressSequentially(ONLY_REZA)
  await expect(cardFor(MINA)).toBeVisible()
  await expect(cardFor(REZA)).toBeVisible()
  await expect.poll(searching).toBeNull()

  await page.clock.runFor(PAUSE - 1)
  await expect(cardFor(MINA)).toBeVisible()

  await page.clock.runFor(1)
  await expect(cardFor(MINA)).toHaveCount(0)
  await expect(cardFor(REZA)).toBeVisible()
  // The contacts page puts its search in the address exactly as the board does,
  // KN-697, so a filtered list of people is shareable too.
  await expect.poll(searching).toBe(ONLY_REZA)

  await page.getByRole('button', { name: CLEAR }).click()
  await expect(cardFor(MINA)).toBeVisible()
})
