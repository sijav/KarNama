import { setupI18n } from '@lingui/core'
import type { StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { messages as en } from '../../i18n/locales/en-US'
import { messages as fa } from '../../i18n/locales/fa-IR'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { BrandRow } from './BrandRow'

const meta = {
  title: 'Shared/BrandRow',
  // It takes no props, the name being the product's in the reader's language, so
  // there is no component for the props table or the docs guard to read.
  render: () => <BrandRow />,
  parameters: { controls: { disable: true } },
} satisfies StoryMeta<typeof BrandRow>

export default meta
type Story = StoryObj<typeof meta>

// The product's name, read from the catalog in the language a story pins.
const nameIn = (locale: Locale) => {
  const i18n = setupI18n({ locale, messages: { [locale]: locale === 'fa-IR' ? fa : en } })
  return i18n._('KarNama')
}

const px = (value: string) => Number.parseFloat(value) || 0

// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

// What node 407:6953 draws, in either direction: a 32 row, the 32 mark of node
// 576:7665 at the inline start, decoration beside the name, and 8 after it the
// name at 20 and SemiBold in text/primary. The mark's own drawing is LogoMark's
// stories' to measure.
const isTheFiles = async (canvasElement: HTMLElement, locale: Locale) => {
  const name = nameIn(locale)
  const text = within(canvasElement).getByText(name)
  const row = text.parentElement
  const mark = row?.querySelector('svg')
  if (!row || mark?.parentElement !== row) throw new Error('the mark and the name are not one row')
  const rowBox = row.getBoundingClientRect()
  const markBox = mark.getBoundingClientRect()
  const textBox = text.getBoundingClientRect()
  await expect(rowBox.height).toBe(32)
  await expect([markBox.width, markBox.height]).toEqual([32, 32])
  await expect(mark.getAttribute('aria-hidden')).toBe('true')
  const textStyle = getComputedStyle(text)
  await expect([px(textStyle.fontSize), textStyle.fontWeight]).toEqual([20, '600'])
  await expect(textStyle.color).toBe(computed(row, semantic['text/primary']))
  const rtl = getComputedStyle(row).direction === 'rtl'
  await expect(Math.round(rtl ? rowBox.right - markBox.right : markBox.left - rowBox.left)).toBe(0)
  await expect(Math.round(rtl ? markBox.left - textBox.right : textBox.left - markBox.right)).toBe(8)
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isTheFiles(canvasElement, 'fa-IR')
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isTheFiles(canvasElement, 'en-US')
  },
}
