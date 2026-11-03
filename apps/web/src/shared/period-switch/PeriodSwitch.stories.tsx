import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { PERIODS, PeriodSwitch, type Period } from './PeriodSwitch'

const meta = {
  title: 'Shared/PeriodSwitch',
  component: PeriodSwitch,
  args: { value: 'daily', onChange: fn() },
  argTypes: { value: { control: 'radio', options: PERIODS } },
} satisfies StoryMeta<typeof PeriodSwitch>

export default meta
type Story = StoryObj<typeof meta>

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

// How opaque a computed colour is: rgb() is whole, rgba() says.
const alphaOf = (colour: string) => Number(/rgba\([^)]*,\s*([\d.]+)\)$/.exec(colour)?.[1] ?? 1)

// The group and its two options by their names, each option's square, the
// radio's root, and the pill drawn in it.
const partsOf = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement)
  const group = canvas.getByRole('radiogroup', { name: i18n._('Period') })
  const option = (name: string) => {
    const radio = canvas.getByRole('radio', { name })
    const root = radio.parentElement
    const pill = root?.lastElementChild
    if (!(root instanceof HTMLElement) || !(pill instanceof HTMLElement)) throw new Error(`the ${name} option has no pill`)
    return { radio, root, pill }
  }
  return { group, daily: option(i18n._('Daily')), weekly: option(i18n._('Weekly')) }
}

// Node 1236:3207 as drawn, Value=روزانه or Value=هفتگی: a row 32 high on
// bg/surface-secondary, 4 round it and between its options, radius md; each
// option 24 high, 4 above and below and 12 at the sides, radius sm, its word in
// Label, the chosen one on bg/surface in text/primary and the other with no
// fill in text/secondary-strong, KN-730; daily at the inline start.
const isDrawn = async (canvasElement: HTMLElement, chosen: Period, palette: Record<keyof typeof semantic, string>) => {
  const parts = partsOf(canvasElement)
  const { group, daily, weekly } = parts
  const style = getComputedStyle(group)
  await expect(group.getBoundingClientRect().height).toBe(32)
  await expect([style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(px)).toEqual([4, 4, 4, 4])
  await expect([px(style.columnGap), px(style.borderTopLeftRadius)]).toEqual([4, 8])
  await expect(style.backgroundColor).toBe(computed(group, palette['bg/surface-secondary']))
  const options = { daily, weekly } satisfies Record<Period, unknown>
  for (const period of PERIODS) {
    const { radio, root, pill } = options[period]
    const on = period === chosen
    await expect(radio).toHaveProperty('checked', on)
    await expect(root.getBoundingClientRect().height).toBe(24)
    const look = getComputedStyle(pill)
    await expect([look.paddingTop, look.paddingRight, look.paddingBottom, look.paddingLeft].map(px)).toEqual([4, 12, 4, 12])
    await expect(px(look.borderTopLeftRadius)).toBe(4)
    await expect([px(look.fontSize), px(look.lineHeight), look.fontWeight, px(look.letterSpacing)]).toEqual([12, 16, '500', 0.2])
    await expect(look.color).toBe(computed(pill, on ? palette['text/primary'] : palette['text/secondary-strong']))
    if (on) await expect(look.backgroundColor).toBe(computed(pill, palette['bg/surface']))
    else await expect(alphaOf(look.backgroundColor)).toBe(0)
  }
  // Daily leads: on the right in Persian, on the left in English.
  const rtl = style.direction === 'rtl'
  const [first, second] = [daily.root.getBoundingClientRect(), weekly.root.getBoundingClientRect()]
  await expect(rtl ? first.left > second.left : first.left < second.left).toBe(true)
  return parts
}

export const Daily: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isDrawn(canvasElement, 'daily', semantic)
  },
}

export const Weekly: Story = {
  args: { value: 'weekly' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isDrawn(canvasElement, 'weekly', semantic)
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isDrawn(canvasElement, 'daily', semantic)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isDrawn(canvasElement, 'daily', darkSemantic)
  },
}

export const ChoosingByPress: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // A press on the other option asks for it; a press on the chosen one asks
    // for nothing. Whatever the pointer presses in a pill is its radio, which
    // covers it.
    const { daily, weekly } = partsOf(canvasElement)
    for (const { radio, root } of [daily, weekly]) {
      const box = root.getBoundingClientRect()
      await expect(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)).toBe(radio)
    }
    await userEvent.click(daily.radio)
    await expect(args.onChange).not.toHaveBeenCalled()
    await userEvent.click(weekly.radio)
    await expect(args.onChange).toHaveBeenCalledOnce()
    await expect(args.onChange).toHaveBeenCalledWith('weekly')
  },
}

export const ChoosingByArrows: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // One Tab stop, on the chosen option, wearing the three pixel ring inside its
    // pill, since the file draws no focus; the left arrow then goes left, to
    // weekly in a right to left page, and asks for it, KN-301.
    const { daily } = partsOf(canvasElement)
    await userEvent.tab()
    await expect(daily.radio).toHaveFocus()
    const ring = getComputedStyle(daily.root, '::after')
    await expect([ring.borderTopStyle, px(ring.borderTopWidth)]).toEqual(['solid', 3])
    await expect(ring.borderTopColor).toBe(computed(daily.root, semantic['border/focus']))
    await userEvent.keyboard('{ArrowLeft}')
    await expect(args.onChange).toHaveBeenCalledOnce()
    await expect(args.onChange).toHaveBeenCalledWith('weekly')
  },
}
