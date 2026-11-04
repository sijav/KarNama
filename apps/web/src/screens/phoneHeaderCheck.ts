import { expect, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../i18n'
import { GLYPHS, type IconName } from '../shared/icon'
import type { semantic } from '../theme/tokens'

type Palette = Record<keyof typeof semantic, string>

// The file's phone, 390 by 844.
const PHONE = { width: 390, height: 844 }

// Button S's height and the Icon Button's square, neither bound to a variable
// on the phone board's header, 1274:64229.
const BUTTON_S = 36
const ICON_BUTTON = 32

// What each page's action is, and the glyph that leads or draws it: the
// board's add, Button S led by its plus, and the network's add contact, the
// Icon Button with user-plus, KN-478.
const PLUS: IconName = 'plus'
const USER_PLUS: IconName = 'user-plus'
const ACTIONS = {
  board: { height: BUTTON_S, glyph: PLUS },
  network: { height: ICON_BUTTON, glyph: USER_PLUS },
}

// A colour as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

/**
 * A phone's Page Header as the owner's answer of 2026-11-04 has it, KN-850:
 * the title at the inline start, then the page's action, then the settings
 * gear, the shell's one control there, with no language or sign-out button,
 * all on one line on the band's bg/surface. The screen is resized by the
 * runner's own browser, which only the runner has, KN-225, and put back after.
 */
export const phoneHeaderIsTheFrames = async (canvasElement: HTMLElement, locale: Locale, palette: Palette, page: keyof typeof ACTIONS) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
  const browser = await import('vitest/browser')
  const i18n = i18nFor(locale)
  const action = ACTIONS[page]
  const before = { width: window.innerWidth, height: window.innerHeight }
  try {
    await browser.page.viewport(PHONE.width, PHONE.height)
    const band = canvasElement.querySelector('header')
    if (!(band instanceof HTMLElement)) throw new Error('the page has no header band')
    await expect(getComputedStyle(band).backgroundColor).toBe(computed(band, palette['bg/surface']))
    const header = within(band)
    const title = header.getByRole('heading', { level: 1 })
    const actionNamed = () => header.getByRole('button', { name: page === 'board' ? i18n._('Add job opportunity') : i18n._('Add contact') })
    // The page takes its phone layout a render after the window narrows, its
    // media query being React's, where the gear's is the style sheet's.
    await waitFor(() => expect(actionNamed().getBoundingClientRect().height).toBe(action.height))
    const added = actionNamed()
    const gear = header.getByRole('button', { name: i18n._('Settings') })
    await expect(added.querySelector('path')?.getAttribute('d')).toBe(GLYPHS[action.glyph].stroke[0])
    for (const name of [i18n._('Language'), i18n._('Sign out')]) await expect(header.queryByRole('button', { name })).toBeNull()
    // From the inline start: the title, the action, the gear, on one line.
    const rtl = getComputedStyle(band).direction === 'rtl'
    const [t, a, g] = [title, added, gear].map((element) => element.getBoundingClientRect())
    if (!t || !a || !g) throw new Error('the header lost a part')
    await expect(rtl ? [a.right <= t.left, g.right <= a.left] : [a.left >= t.right, g.left >= a.right]).toEqual([true, true])
    await expect(Math.round(a.top + a.height / 2)).toBe(Math.round(g.top + g.height / 2))
    await expect(a.left >= 0 && g.left >= 0 && a.right <= window.innerWidth && g.right <= window.innerWidth).toBe(true)
  } finally {
    await browser.page.viewport(before.width, before.height)
  }
}
