import { expect, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import type { semantic } from '../../theme/tokens'

// Storybook only: the modals' stories use it, and nothing that ships imports
// it.

type Palette = Record<keyof typeof semantic, string>

const px = (value: string) => Number.parseFloat(value) || 0

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
 * The redesigned modals' close, KN-838, as 150:92 and 150:93 draw it: Popover
 * / Close at 20 round the x at 16 in text/secondary, at the inline end of the
 * header and centred on the title's 28, the title at the header's inline
 * start. Read inside the header's padding, which the panel modal has and the
 * shell does not.
 */
export const closeIsTheFiles = async (dialog: HTMLElement, locale: Locale, palette: Palette) => {
  const close = within(dialog).getByRole('button', { name: i18nFor(locale)._('Close') })
  const header = close.parentElement
  if (!header) throw new Error('the close has no header')
  const title = within(header).getByRole('heading', { level: 2 })
  const box = close.getBoundingClientRect()
  const named = title.getBoundingClientRect()
  const row = header.getBoundingClientRect()
  const style = getComputedStyle(header)
  const rtl = style.direction === 'rtl'
  await expect([box.width, box.height, close.querySelector('svg')?.getBoundingClientRect().width]).toEqual([20, 20, 16])
  await expect(named.height).toBe(28)
  await expect(Math.round((box.top + box.bottom) / 2 - (named.top + named.bottom) / 2)).toBe(0)
  const [left, right] = [row.left + px(style.paddingLeft), row.right - px(style.paddingRight)]
  await expect(Math.round(rtl ? box.left - left : right - box.right)).toBe(0)
  await expect(Math.round(rtl ? right - named.right : named.left - left)).toBe(0)
  await expect(getComputedStyle(close).color).toBe(computed(close, palette['text/secondary']))
}
