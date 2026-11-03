import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { PopoverClose, type PopoverCloseProps } from './PopoverClose'

// The close named from the catalog, since its name is copy; the args give the
// size and the press.
const Named = (args: PopoverCloseProps) => {
  const { i18n } = useLingui()
  return <PopoverClose {...args} aria-label={i18n._('Close')} />
}

const meta = {
  title: 'Shared/PopoverClose',
  component: PopoverClose,
  args: { 'aria-label': '', size: 22, onClick: fn() },
  argTypes: { size: { control: 'radio', options: [22, 20, 16] } },
  parameters: { controls: { include: ['size'] } },
  render: (args) => <Named {...args} />,
} satisfies StoryMeta<typeof PopoverClose>

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

const closeIn = (canvasElement: HTMLElement) => within(canvasElement).getByRole('button')

// Node 848:2247 at rest, State=Default, at the size the args give: a square of
// that side and radius 6 with no fill, centring the x at 16 in text/secondary.
const isAtRest = async (button: HTMLElement, size: number, palette: Record<keyof typeof semantic, string>) => {
  const box = button.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([size, size])
  const style = getComputedStyle(button)
  await expect(px(style.borderTopLeftRadius)).toBe(6)
  await expect(alphaOf(style.backgroundColor)).toBe(0)
  await expect(style.color).toBe(computed(button, palette['text/secondary']))
  const icon = button.querySelector('svg')
  if (!icon) throw new Error('the close has no icon')
  const mark = icon.getBoundingClientRect()
  await expect([mark.width, mark.height]).toEqual([16, 16])
  await expect([mark.left - box.left, mark.top - box.top]).toEqual([(size - 16) / 2, (size - 16) / 2])
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const button = closeIn(canvasElement)
    await isAtRest(button, 22, semantic)
    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // State=Hover: bg/surface-secondary under the same x, by the runner's real
    // pointer, since :hover is the browser's hit-testing, KN-225.
    const button = closeIn(canvasElement)
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    const [fill, icon] = [computed(button, semantic['bg/surface-secondary']), computed(button, semantic['text/secondary'])]
    await browser.userEvent.hover(button)
    await waitFor(() => expect(getComputedStyle(button).backgroundColor).toBe(fill))
    await expect(getComputedStyle(button).color).toBe(icon)
  },
}

export const At20: Story = {
  // Every redesigned modal's header draws it at 20.
  args: { size: 20 },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isAtRest(closeIn(canvasElement), 20, semantic)
  },
}

export const At16: Story = {
  // The Search Bar's Filled clear draws it at 16, the x filling it.
  args: { size: 16 },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isAtRest(closeIn(canvasElement), 16, semantic)
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isAtRest(closeIn(canvasElement), 22, semantic)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isAtRest(closeIn(canvasElement), 22, darkSemantic)
  },
}

export const KeyboardFocus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Reached by Tab, it wears the product's outline, two of border/focus at an
    // offset of two, since a ring inside a square this small would cover its x;
    // the file draws no focus.
    const button = closeIn(canvasElement)
    await userEvent.tab()
    await expect(button).toHaveFocus()
    const style = getComputedStyle(button)
    await expect([style.outlineStyle, px(style.outlineWidth), px(style.outlineOffset)]).toEqual(['solid', 2, 2])
    await expect(style.outlineColor).toBe(computed(button, semantic['border/focus']))
  },
}

export const NamesItself: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // An icon-only button, so it names itself with Tooltip / Label, KN-777.
    const button = closeIn(canvasElement)
    await userEvent.hover(button)
    const tip = await within(document.body).findByRole('tooltip', {}, { timeout: 1000 })
    await expect(tip).toHaveTextContent(button.getAttribute('aria-label') ?? '')
  },
}
