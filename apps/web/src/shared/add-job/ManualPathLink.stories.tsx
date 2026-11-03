import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { ManualPathLink } from './ManualPathLink'

const meta = {
  title: 'Shared/ManualPathLink',
  component: ManualPathLink,
  args: { onClick: fn() },
} satisfies StoryMeta<typeof ManualPathLink>

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

const linkIn = (canvasElement: HTMLElement) => within(canvasElement).getByRole('button', { name: i18n._('Manual entry') })

// What node 961:101603 draws at rest, State=Default: «لینک یا متن آگهی ندارید؟»
// at 14 on 22 in text/secondary, and 4 after it «ورود دستی» at 14 on 22 and
// Medium in text/brand, not underlined.
const isAtRest = async (canvasElement: HTMLElement, palette: Record<keyof typeof semantic, string>) => {
  const link = linkIn(canvasElement)
  const prefix = link.previousElementSibling
  if (!(prefix instanceof HTMLElement)) throw new Error('the link has no question before it')
  await expect(prefix).toHaveTextContent(i18n._('No link or posting text?'))
  const asked = getComputedStyle(prefix)
  await expect([px(asked.fontSize), px(asked.lineHeight), asked.fontWeight]).toEqual([14, 22, '400'])
  await expect(asked.color).toBe(computed(prefix, palette['text/secondary']))
  const style = getComputedStyle(link)
  await expect([px(style.fontSize), px(style.lineHeight), style.fontWeight]).toEqual([14, 22, '500'])
  await expect(style.color).toBe(computed(link, palette['text/brand']))
  await expect(style.textDecorationLine).toBe('none')
  // The question first, at the inline start, and the link 4 after it.
  const rtl = style.direction === 'rtl'
  const [first, second] = [prefix.getBoundingClientRect(), link.getBoundingClientRect()]
  await expect(Math.round(rtl ? first.left - second.right : second.left - first.right)).toBe(4)
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isAtRest(canvasElement, semantic)
    await userEvent.click(linkIn(canvasElement))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // State=Hover: the link underlined, by the runner's real pointer, since
    // :hover is the browser's hit-testing, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    const link = linkIn(canvasElement)
    await browser.userEvent.hover(link)
    await waitFor(() => expect(getComputedStyle(link).textDecorationLine).toBe('underline'))
  },
}

export const KeyboardFocus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Reached by Tab, the product's outline, two of border/focus.
    const link = linkIn(canvasElement)
    await userEvent.tab()
    await expect(link).toHaveFocus()
    const style = getComputedStyle(link)
    await expect([style.outlineStyle, px(style.outlineWidth)]).toEqual(['solid', 2])
    await expect(style.outlineColor).toBe(computed(link, semantic['border/focus']))
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isAtRest(canvasElement, semantic)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isAtRest(canvasElement, darkSemantic)
  },
}
