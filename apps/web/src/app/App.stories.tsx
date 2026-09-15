import type { I18n } from '@lingui/core'
import type { StoryObj } from '@storybook/react-vite'
import { useEffect, useRef, type ReactNode } from 'react'
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test'
import { AuthProvider, sessionFor, STORAGE_KEY as SESSION_KEY } from '../core/auth'
import { addressOf, siteBase } from './routes'
import { fixtures } from '../shared/story-fixtures'
import { STORAGE_KEY } from '../core/preferences'
import { defaultStatuses, jobFrom, STORAGE_KEY as RECORDS_KEY, type Records } from '../core/records'
import { emptyDraft } from '../shared/add-job'
import { i18nFor } from '../i18n'
import { CURRENT } from '../shared/navigation'
import type { StoryMeta } from '../shared/story-docs/story-meta'
import { semantic } from '../theme/tokens'
import { App } from './App'

/**
 * The shell, in both languages.
 *
 * Two stories rather than one because the done gate asks for every change to be
 * seen in Persian and in English: English strings are longer and the direction
 * flips, so a layout defect hides in exactly one of them. Setting the global
 * here rather than only in the toolbar means the browser test project checks
 * both on every run instead of only whichever the toolbar happened to be on.
 */
const meta = {
  title: 'App/Shell',
  component: App,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      // The shell is behind signing in, KN-046, and these stories are about the
      // shell: a reader with a name is seeded so they are the page they draw.
      <AuthProvider initial={sessionFor(READER, SINCE, fixtures('fa-IR').contacts[0]?.fullName ?? '')}>
        <Story />
      </AuthProvider>
    ),
  ],
  // The shell writes its page into the frame's address, KN-505, and Storybook
  // writes the next story's id onto whatever path the frame is at, so a page
  // opened here would open the next shell story on it, or 404 on a reload. The
  // path the story started on is put back when the story is torn down.
  beforeEach: () => {
    const { pathname } = window.location
    return () => {
      window.history.replaceState(window.history.state, '', `${pathname}${window.location.search}${window.location.hash}`)
    }
  },
} satisfies StoryMeta<typeof App>

// When the seeded reader signed in. Built rather than written: a date's own
// letters are not copy, and the reader's name is a fixture's, since a person's
// name is data and never translated.
const SINCE = new Date(Date.UTC(2026, 8, 12)).toISOString()

// The seeded reader's number.
const READER = '09120000000'


/** Relative luminance of an `rgb(r, g, b)` string, 0 for black and 1 for white. */
const luminanceOf = (colour: string) => {
  const [r = 0, g = 0, b = 0] = [...colour.matchAll(/\d+/g)].map((match) => Number(match[0]) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export default meta
type Story = StoryObj<typeof meta>

export const Persian: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The page's heading is the Page Header's, the current destination's name,
    // KN-355.
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('فرصت‌های شغلی من')
    // The navigation is in the shell, the board the current page.
    await expect(canvas.getByRole('button', { name: 'فرصت‌های شغلی من' }).getAttribute('aria-current')).toBe(CURRENT)
    await expect(document.documentElement).toHaveAttribute('dir', 'rtl')
  },
}

export const PersianDark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    // The design has no dark tokens, so this palette is derived. What can be
    // asserted is the direction of the derivation: the page is dark and the
    // text is light, which is the thing that breaks if the flip is dropped.
    const page = getComputedStyle(canvasElement.firstElementChild ?? canvasElement).backgroundColor
    await expect(luminanceOf(page)).toBeLessThan(0.3)
  },
}

export const SystemScheme: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'system' },
  play: async ({ canvasElement }) => {
    // Whatever the runner's OS says, the shell renders and picks one of the two.
    await expect(within(canvasElement).getByRole('heading', { level: 1 })).toBeVisible()
  },
}

export const English: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The English catalog is an identity map, so the id IS the rendered text.
    // That is what makes a missing Persian translation render English rather
    // than a key or an empty node.
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('My job opportunities')
    await expect(canvas.getByRole('button', { name: 'My job opportunities' }).getAttribute('aria-current')).toBe(CURRENT)
    await expect(document.documentElement).toHaveAttribute('dir', 'ltr')
  },
}

// A phone's screen, the file's 390 by 844.
const PHONE = { width: 390, height: 844 }

export const LanguageOnAPhone: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // At a phone's width the sidebar gives way to the tab bar, and the
    // language switch is the Page Header's, DESIGN.md section 5, KN-355:
    // choosing English there turns the page and keeps the choice. The screen
    // is resized by the runner's own browser, which only the runner has,
    // KN-225; the story puts the screen back after. The choice is kept in the
    // story's own localStorage, which the preview gives every story, KN-178.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const canvas = within(canvasElement)
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await page.viewport(PHONE.width, PHONE.height)
      await waitFor(() => expect(canvasElement.querySelector('aside')).toBeNull())
      // The title keeps the whole of itself beside the header's controls, in
      // the page's own 342 between its gutters, KN-478.
      const uncut = async () => {
        const heading = canvas.getByRole('heading', { level: 1 })
        await expect(heading.scrollWidth).toBeLessThanOrEqual(heading.clientWidth)
      }
      await uncut()
      await userEvent.click(canvas.getByRole('button', { name: 'زبان' }))
      await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole('menuitem', { name: 'English' }))
      await waitFor(() => expect(window.document.documentElement).toHaveAttribute('dir', 'ltr'))
      await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('My job opportunities')
      await uncut()
      await expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({ locale: 'en-US' })
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}

export const SigningOutOnAPhone: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // A phone reader signs out from the Page Header's «خروج», KN-478 and
    // KN-418: the tab bar has no room for it and the sidebar is not drawn.
    // The screen is resized by the runner's own browser, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const canvas = within(canvasElement)
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await page.viewport(PHONE.width, PHONE.height)
      await waitFor(() => expect(canvasElement.querySelector('aside')).toBeNull())
      await userEvent.click(canvas.getByRole('button', { name: 'خروج' }))
      await expect(await canvas.findByRole('button', { name: 'ارسال کد' })).toBeInTheDocument()
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}

// The event a browser fires when the history moves by anything but a push,
// typed so the lint rule reads the name as a value.
const MOVED: keyof WindowEventMap = 'popstate'

/**
 * The address and the page follow each other, KN-505.
 *
 * The navigation pushes a path under the site's base, and a path the history
 * moves to by anything else, the back button or a shared link, is read back into
 * the page. A path pushed from outside fires no popstate of its own, so the story
 * fires the one a browser's Back would.
 */
export const Navigating: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const base = siteBase(import.meta.env.BASE_URL, window.location.href)
    // The frame's own address, its path, query and hash, put back whole after.
    const before = window.location.href
    try {
      // Going to another page writes the address, a path with no hash.
      await userEvent.click(canvas.getByRole('button', { name: 'شبکه من' }))
      await waitFor(async () => {
        await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('شبکه من')
      })
      await expect([window.location.pathname, window.location.hash]).toEqual([addressOf('network', base), ''])

      // Going to the page already shown adds nothing to the history.
      const pushed = spyOn(window.history, 'pushState')
      await userEvent.click(canvas.getByRole('button', { name: 'شبکه من' }))
      await expect(pushed).not.toHaveBeenCalled()
      pushed.mockRestore()

      // And an address the history moves to by anything else is read back into
      // the page: the add destination opens the add flow over the board, and
      // closing it puts the address back on the board rather than leaving it
      // asking for a flow that is no longer open, KN-044.
      window.history.pushState(null, '', addressOf('add', base))
      window.dispatchEvent(new PopStateEvent(MOVED))
      const adding = await body.findByRole('dialog')
      // The board stays the current page under the flow, as its frames draw
      // it, KN-481. The dialog takes the page out of the accessibility tree
      // while it is open, so the navigation is read with what is hidden.
      const current = canvas.getAllByRole('button', { hidden: true }).filter((button) => button.getAttribute('aria-current') === CURRENT)
      await expect(current.map((button) => button.textContent)).toEqual(['فرصت‌های شغلی من'])
      await userEvent.click(within(adding).getByRole('button', { name: 'انصراف' }))
      await waitFor(async () => {
        await expect(body.queryByRole('dialog')).toBeNull()
      })
      await expect([window.location.pathname, window.location.hash]).toEqual([addressOf('jobs', base), ''])
    } finally {
      window.history.replaceState(null, '', before)
    }
  },
}

/**
 * An address shared while the page was in the hash, KN-505: it opens the page it
 * names, and that page's path replaces it. The frame's address is given the old
 * hash before the shell renders, as a shared link gives it, and the whole address
 * is put back after.
 */
export const FromAnOldAddress: Story = {
  globals: { locale: 'fa-IR' },
  beforeEach: () => {
    const before = window.location.href
    // `#/network`, the address KN-042 wrote for the network page.
    window.history.replaceState(null, '', `#${addressOf('network', '/')}`)
    return () => {
      window.history.replaceState(null, '', before)
    }
  },
  play: async ({ canvasElement }) => {
    const base = siteBase(import.meta.env.BASE_URL, window.location.href)
    await expect(within(canvasElement).getByRole('heading', { level: 1 })).toHaveTextContent('شبکه من')
    await expect([window.location.pathname, window.location.hash]).toEqual([addressOf('network', base), ''])
  },
}

// The frames' desktop, 1440 by 900; the phone's is PHONE above.
const DESKTOP = { width: 1440, height: 900 }

// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick.
const colourOf = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

// Where a box sits in the page's own area, measured from the edge a line of
// text starts at, so one set of numbers holds in both directions.
const placed = (area: DOMRect, box: DOMRect, rtl: boolean) => ({
  start: Math.round(rtl ? area.right - box.right : box.left - area.left),
  end: Math.round(rtl ? box.left - area.left : area.right - box.right),
  top: Math.round(box.top - area.top),
  width: Math.round(box.width),
  height: Math.round(box.height),
})

/**
 * The board and the network laid out as their frames, `241:2`, `241:146`,
 * `252:2` and `252:411`, KN-481: the Header band, the page's gutters, the
 * toolbar and what follows it, with the sample data loaded the way a reader
 * loads it. Read from the shell rather than from a screen's own story, since a
 * screen rendered alone fills whatever canvas it is given, KN-452. The screen
 * is resized by the runner's own browser, KN-225, and put back after.
 */
const laidOutAsTheFrames = async (canvasElement: HTMLElement, i18n: I18n) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
  const { page } = await import('vitest/browser')
  const canvas = within(canvasElement)
  const body = within(canvasElement.ownerDocument.body)
  const rtl = window.document.documentElement.dir === 'rtl'
  // The page's area, whose clientWidth is the room a scrollbar leaves, and the
  // Header band at its top.
  const main = () => {
    const area = canvasElement.querySelector('main')
    if (!area) throw new Error('the shell has no main area')
    return area
  }
  const bandOf = () => {
    const found = main().querySelector('header')
    if (!found) throw new Error('the page has no Header band')
    return found
  }
  const at = (element: Element) => placed(main().getBoundingClientRect(), element.getBoundingClientRect(), rtl)
  const titleRow = () => {
    const row = canvas.getByRole('heading', { level: 1 }).parentElement?.parentElement
    if (!row) throw new Error('the title has no row round it')
    return row
  }
  const searchBar = () => {
    const bar = canvas.getByRole('searchbox').closest('div')?.parentElement
    if (!bar) throw new Error('the field has no bar round it')
    return bar
  }
  const open = async (name: string) => {
    await userEvent.click(canvas.getByRole('button', { name }))
    await waitFor(async () => {
      await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(name)
    })
  }
  const before = { width: window.innerWidth, height: window.innerHeight }
  const address = window.location.href
  try {
    await page.viewport(DESKTOP.width, DESKTOP.height)
    await waitFor(() => expect(canvasElement.querySelector('aside')).not.toBeNull())
    await userEvent.click(canvas.getByRole('button', { name: i18n._('Settings') }))
    const settings = await body.findByRole('dialog')
    await userEvent.click(within(settings).getByRole('button', { name: i18n._('Load sample data') }))
    await userEvent.click(within(settings).getByRole('button', { name: i18n._('Done') }))
    await waitFor(async () => {
      await expect(body.queryByRole('dialog')).toBeNull()
      await expect(canvas.getAllByRole('region').length).toBeGreaterThan(1)
    })

    // The board at 1440, 241:2: the band across the page and 144 tall, on
    // bg/surface with its pixel of border/default drawn inside; the title row
    // 32 in and 44 tall; the search bar's 320 at the inline start and the sort
    // at the other end; the columns 32 below the band and in, 16 apart.
    const board = bandOf()
    await expect(at(board)).toMatchObject({ start: 0, end: 0, top: 0, height: 144 })
    await expect(getComputedStyle(board).backgroundColor).toBe(colourOf(board, semantic['bg/surface']))
    const edge = getComputedStyle(board, '::after')
    await expect([Number.parseFloat(edge.borderBottomWidth), edge.borderBottomColor]).toEqual([1, colourOf(board, semantic['border/default'])])
    await expect(at(titleRow())).toMatchObject({ start: 32, end: 32, top: 32, height: 44 })
    await expect(at(searchBar())).toMatchObject({ start: 32, top: 92, width: 320 })
    const sort = canvas.getByText(i18n._('Sort:')).closest('.MuiInputBase-root')
    if (!sort) throw new Error('the sort has no control round it')
    await expect(at(sort)).toMatchObject({ end: 32, top: 92 })
    const [first, second] = canvas.getAllByRole('region')
    if (!first || !second) throw new Error('the board has fewer than two columns')
    await expect(at(first)).toMatchObject({ start: 32, top: 176 })
    await expect(at(second).start - at(first).start - at(first).width).toBe(16)

    // The network at 1440, 252:2: the same band, and the people in two columns
    // as wide as each other, 32 in and 24 apart.
    await open(i18n._('My network'))
    await expect(at(bandOf())).toMatchObject({ start: 0, top: 0, height: 144 })
    await expect(at(titleRow())).toMatchObject({ start: 32, top: 32, height: 44 })
    await expect(at(searchBar())).toMatchObject({ start: 32, top: 92, width: 320 })
    const column = (main().clientWidth - 2 * 32 - 24) / 2
    const [one, two] = canvas.getAllByRole('article')
    if (!one || !two) throw new Error('the network has fewer than two people')
    await expect(at(one)).toMatchObject({ start: 32, top: 176, width: Math.round(column) })
    await expect(at(two)).toMatchObject({ start: Math.round(32 + column + 24), top: 176, width: Math.round(column) })

    // The network on a phone, 252:411: the band 16 in, 12 below and between,
    // 128 tall; the search bar the row's 358; the people 16 in, 12 apart.
    await page.viewport(PHONE.width, PHONE.height)
    await waitFor(() => expect(canvasElement.querySelector('aside')).toBeNull())
    await expect(at(bandOf())).toMatchObject({ start: 0, top: 0, height: 128 })
    await expect(at(titleRow())).toMatchObject({ start: 16, top: 16, height: 44, width: main().clientWidth - 32 })
    await expect(at(searchBar())).toMatchObject({ start: 16, top: 72, width: main().clientWidth - 32 })
    const [near, next] = canvas.getAllByRole('article')
    if (!near || !next) throw new Error('the network has fewer than two people')
    await expect(at(near)).toMatchObject({ start: 16, top: 144, width: main().clientWidth - 32 })
    await expect(at(next).top - at(near).top - at(near).height).toBe(12)

    // The board on a phone, 241:146: the band closes on the status chips, 12
    // above its foot, and the chosen status's cards sit 16 below it and in.
    await open(i18n._('My job opportunities'))
    const narrow = bandOf()
    await expect(at(narrow)).toMatchObject({ start: 0, top: 0 })
    await expect(at(titleRow())).toMatchObject({ start: 16, top: 16, height: 44 })
    await expect(at(searchBar())).toMatchObject({ start: 16, top: 72, width: main().clientWidth - 32 })
    const chips = narrow.lastElementChild
    if (!(chips instanceof HTMLElement)) throw new Error('the band holds nothing')
    await expect(within(chips).getAllByRole('button').length).toBeGreaterThan(1)
    await expect(at(narrow).height - at(chips).top - at(chips).height).toBe(12)
    const [card] = canvas.getAllByRole('article')
    if (!card) throw new Error('the board shows no card')
    await expect(at(card)).toMatchObject({ start: 16, top: at(narrow).height + 16, width: main().clientWidth - 32 })
  } finally {
    await page.viewport(before.width, before.height)
    window.history.replaceState(null, '', address)
  }
}

export const LaidOutAsTheFrames: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await laidOutAsTheFrames(canvasElement, i18nFor('fa-IR'))
  },
}

export const LaidOutAsTheFramesInEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await laidOutAsTheFrames(canvasElement, i18nFor('en-US'))
  },
}

// A press on a card as synthetic pointer events: they run the card's own hold,
// KN-428, and prove nothing about a phone's gesture recognition, which the
// board's e2e test holds with a real touch.
type Pointing = 'pointerdown' | 'pointerup'
type Finger = 'touch'
const FINGER: Finger = 'touch'
const touch = (target: Element, type: Pointing) => {
  const box = target.getBoundingClientRect()
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      isPrimary: true,
      pointerId: 1,
      pointerType: FINGER,
      button: 0,
      clientX: box.left + box.width / 2,
      clientY: box.top + box.height / 2,
    }),
  )
}

// What is fixed to the foot of the screen, KN-356: every element in the canvas
// whose computed position is fixed, that is drawn, and whose box meets the
// screen's lower 160 pixels, which hold the tab bar's 72 and the bulk bar's 108
// with its 24. Counted by the style itself rather than by roles, since the card
// is about two things painted over each other there, and a second bar drawn
// without a landmark would pass a query for landmarks. The canvas only, so a
// dialog or a menu portalled into the body is not counted.
const FOOT = 160
const fixedAtFoot = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll<HTMLElement>('*')].filter((element) => {
    const style = getComputedStyle(element)
    if (style.position !== 'fixed' || style.display === 'none' || style.visibility === 'hidden') return false
    const box = element.getBoundingClientRect()
    return box.height > 0 && box.top < window.innerHeight && box.bottom > window.innerHeight - FOOT
  })

export const Selecting: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // KN-356: while a page is selecting, the Bulk Action Bar has the foot of the
    // screen to itself. On a desktop the sidebar stays beside the page while the
    // bar floats; on a phone the tab bar gives the bar its place, node 185:19,
    // and comes back when the selection is let go. The page tells the shell,
    // which is why this is the shell's story. The runner's own viewport, which
    // only the runner has, KN-225, put back after.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    const before = { width: window.innerWidth, height: window.innerHeight }
    const address = window.location.href
    const tabBar = () => canvas.queryByRole('navigation', { name: 'فضای کار' })
    try {
      // A desktop, with the sample data loaded from Settings as a reader loads it.
      await page.viewport(DESKTOP.width, DESKTOP.height)
      await waitFor(() => expect(canvasElement.querySelector('aside')).not.toBeNull())
      await userEvent.click(canvas.getByRole('button', { name: 'تنظیمات' }))
      const settings = await body.findByRole('dialog')
      await userEvent.click(within(settings).getByRole('button', { name: 'بارگذاری داده‌های نمونه' }))
      await userEvent.click(within(settings).getByRole('button', { name: 'تمام' }))
      await waitFor(async () => {
        await expect(body.queryByRole('dialog')).toBeNull()
        await expect(canvas.getAllByRole('article').length).toBeGreaterThan(1)
      })

      // A card chosen by its checkbox, folded until focus is inside the card,
      // KN-341: the bar floats and the sidebar stays beside the page.
      const [desk] = canvas.getAllByRole('article')
      if (!desk) throw new Error('the board shows no card')
      const box = within(desk).getByRole('checkbox')
      box.focus()
      await userEvent.click(box)
      const floating = await canvas.findByRole('region', { name: 'کارهای گروهی' })
      await expect(canvasElement.querySelector('aside')).not.toBeNull()
      await userEvent.click(within(floating).getByRole('button', { name: 'لغو انتخاب' }))
      await waitFor(async () => {
        await expect(canvas.queryByRole('region', { name: 'کارهای گروهی' })).toBeNull()
      })

      // A phone at rest: one thing fixed at its foot, flush with it, and it is
      // the tab bar, the navigation landmark inside it.
      await page.viewport(PHONE.width, PHONE.height)
      await waitFor(() => expect(canvasElement.querySelector('aside')).toBeNull())
      await waitFor(async () => {
        const foot = fixedAtFoot(canvasElement)
        await expect(foot).toHaveLength(1)
        await expect(foot[0]?.contains(tabBar())).toBe(true)
      })
      const [resting] = fixedAtFoot(canvasElement)
      if (!resting) throw new Error('nothing is fixed at the foot')
      await expect(Math.round(window.innerHeight - resting.getBoundingClientRect().bottom)).toBe(0)

      // A card held: the bar comes up, and it is the one thing fixed at the foot,
      // 24 above it, where the tab bar was. Counted before the landmark is asked
      // for, so a tab bar left behind fails the count, KN-356's plan review.
      const title = canvas.getAllByRole('article')[0]?.querySelector('.KarnamaJobCard-title')
      if (!(title instanceof HTMLElement)) throw new Error('the phone board shows no card')
      touch(title, 'pointerdown')
      const held = await canvas.findByRole('region', { name: 'کارهای گروهی' }, { timeout: 2000 })
      touch(title, 'pointerup')
      await waitFor(async () => {
        const foot = fixedAtFoot(canvasElement)
        await expect(foot).toHaveLength(1)
        await expect(foot[0]).toBe(held)
      })
      await expect(Math.round(window.innerHeight - held.getBoundingClientRect().bottom)).toBe(24)
      await expect(tabBar()).toBeNull()

      // Let go with the bar's own close: the tab bar comes back, the one thing
      // fixed at the foot again.
      await userEvent.click(within(held).getByRole('button', { name: 'لغو انتخاب' }))
      await waitFor(async () => {
        const foot = fixedAtFoot(canvasElement)
        await expect(foot).toHaveLength(1)
        await expect(foot[0]?.contains(tabBar())).toBe(true)
      })
      await expect(canvas.queryByRole('region', { name: 'کارهای گروهی' })).toBeNull()

      // The network on a phone, KN-533: a person held brings the bar up in the tab
      // bar's place, the one thing fixed at the foot and 24 above it, and letting
      // go brings the tab bar back.
      await userEvent.click(canvas.getByRole('button', { name: 'شبکه من' }))
      await waitFor(async () => {
        await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('شبکه من')
      })
      const name = canvas.getAllByRole('article')[0]?.querySelector('.KarnamaContactCard-name')
      if (!(name instanceof HTMLElement)) throw new Error('the phone network shows no person')
      touch(name, 'pointerdown')
      const choosing = await canvas.findByRole('region', { name: 'کارهای گروهی' }, { timeout: 2000 })
      touch(name, 'pointerup')
      await waitFor(async () => {
        const foot = fixedAtFoot(canvasElement)
        await expect(foot).toHaveLength(1)
        await expect(foot[0]).toBe(choosing)
      })
      await expect(Math.round(window.innerHeight - choosing.getBoundingClientRect().bottom)).toBe(24)
      await expect(tabBar()).toBeNull()
      await userEvent.click(within(choosing).getByRole('button', { name: 'لغو انتخاب' }))
      await waitFor(async () => {
        const foot = fixedAtFoot(canvasElement)
        await expect(foot).toHaveLength(1)
        await expect(foot[0]?.contains(tabBar())).toBe(true)
      })
    } finally {
      await page.viewport(before.width, before.height)
      window.history.replaceState(null, '', address)
    }
  },
}

// The event a browser hands every other open tab of the page when one of them
// writes its storage, typed so the lint rule reads the name as a value.
const STORED: keyof WindowEventMap = 'storage'

export const SignedOutInAnotherTab: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // KN-419: signing out in another tab signs this one out, where it used to
    // leave the board open for whoever finds the tab, and nothing else that tab
    // writes does. The other tab is stood in for by what its writes deliver
    // here: first a change to the board, taken in with the reader still signed
    // in, then its sign-out, the session gone from the story's own storage and
    // the event with its key and no value.
    const canvas = within(canvasElement)
    const set = fixtures('fa-IR')
    const statuses = defaultStatuses((token) => set.names[token])
    const elsewhere = set.jobs[5]?.title ?? ''
    const board: Records = {
      statuses,
      jobs: [jobFrom({ ...emptyDraft(statuses[0]?.id ?? ''), title: elsewhere, company: set.jobs[5]?.company ?? '' }, SINCE)],
      contacts: [],
    }
    // Under the bare key: the reader is seeded inside the providers the preview
    // wraps every story in, so the board's own provider, outside, has nobody
    // signed in, KN-421.
    const written = JSON.stringify(board)
    window.localStorage.setItem(RECORDS_KEY, written)
    window.dispatchEvent(new StorageEvent(STORED, { key: RECORDS_KEY, newValue: written }))
    await expect(await canvas.findByText(elsewhere)).toBeInTheDocument()

    window.localStorage.removeItem(SESSION_KEY)
    window.dispatchEvent(new StorageEvent(STORED, { key: SESSION_KEY, newValue: null }))
    await waitFor(async () => {
      await expect(canvas.getByLabelText('شماره موبایل')).toBeInTheDocument()
    })
    await expect(canvas.queryByRole('button', { name: 'شبکه من' })).toBeNull()
  },
}

// Hides its mark once its children's effects have run, KN-560. A provider adds its
// storage listener in an effect, which a production canvas runs after the play
// has started, and an event nobody listens for is lost; React runs a parent's
// passive effects after its children's, so once this one has run, the provider
// inside it is listening.
const ListeningAround = ({ children }: { children: ReactNode }) => {
  const mark = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (mark.current) mark.current.hidden = true
  }, [])
  return (
    <>
      <span data-testid="listening" ref={mark} />
      {children}
    </>
  )
}

export const SignedInInAnotherTab: Story = {
  globals: { locale: 'fa-IR' },
  decorators: [
    (Story) => (
      // Signed out here, as NobodySignedIn is, so the sign-in arrives from the
      // other tab.
      <ListeningAround>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </ListeningAround>
    ),
  ],
  play: async ({ canvasElement }) => {
    // KN-419: another tab's sign-in reaches this one. Its session has no name
    // yet, a first login's, so this tab comes to the name step, and the name
    // saved here is kept on that session. In a story the providers under the
    // preview's own board remount when a reader arrives, and read the session
    // back from storage, which the app's provider, above its board, never does:
    // so that the adoption itself keeps the session a name is saved on, and
    // drops a code this tab was waiting on, is proved by e2e/two-tabs.spec.ts,
    // where the providers are wired as the app wires them.
    const canvas = within(canvasElement)
    const i18n = i18nFor('fa-IR')
    const name = fixtures('fa-IR').contacts[0]?.fullName ?? ''
    await expect(canvas.getByLabelText(i18n._('Mobile number'))).toBeInTheDocument()
    // Another tab's write is sent only once this tab's provider listens for it,
    // KN-560.
    await waitFor(async () => {
      await expect(canvas.getByTestId('listening').hidden).toBe(true)
    })
    const theirs = JSON.stringify(sessionFor(READER, SINCE))
    window.localStorage.setItem(SESSION_KEY, theirs)
    window.dispatchEvent(new StorageEvent(STORED, { key: SESSION_KEY, newValue: theirs }))
    await userEvent.type(await canvas.findByLabelText(i18n._('First and last name')), name)
    await userEvent.click(canvas.getByRole('button', { name: i18n._('Start') }))
    await waitFor(async () => {
      await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(i18n._('My job opportunities'))
    })
    await expect(window.localStorage.getItem(SESSION_KEY)).toContain(name)
  },
}

export const NobodySignedIn: Story = {
  globals: { locale: 'fa-IR' },
  decorators: [
    (Story) => (
      // No session seeded and none in this story's own storage, KN-178: what
      // the app draws for somebody who has not signed in, KN-046.
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    // The shell is not drawn at all: there is no archive to show until
    // somebody has said who they are.
    const canvas = within(canvasElement)
    await expect(canvas.getByLabelText('شماره موبایل')).toBeInTheDocument()
    await expect(canvas.queryByRole('button', { name: 'شبکه من' })).toBeNull()
  },
}
