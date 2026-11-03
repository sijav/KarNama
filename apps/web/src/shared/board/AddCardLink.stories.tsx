import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { AddCardLink, type AddCardLinkProps } from './AddCardLink'

// The link sits under a column's cards, as wide as they are: Card / Kanban's 276.
const CARDS = 276

const InAColumn = (args: AddCardLinkProps) => (
  <Box sx={{ width: CARDS }}>
    <AddCardLink {...args} />
  </Box>
)

const meta = {
  title: 'Shared/AddCardLink',
  component: AddCardLink,
  args: { column: fixtures('fa-IR').names.interview, onAdd: fn() },
  parameters: { controls: { include: ['column'] } },
  render: (args) => <InAColumn {...args} />,
} satisfies StoryMeta<typeof AddCardLink>

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

const linkIn = (canvasElement: HTMLElement) => within(canvasElement).getByRole('button')

// What node 961:95525 draws at rest, State=Default: a row the cards' 276 wide
// and 36 tall, 8 above and below and 12 at the sides, radius 8 and no fill;
// the 16 plus at the inline start and 6 after it the label at 13 on 20 and
// Medium, both in text/secondary.
const isAtRest = async (link: HTMLElement, palette: Record<keyof typeof semantic, string>) => {
  const style = getComputedStyle(link)
  const box = link.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([CARDS, 36])
  await expect([px(style.paddingTop), px(style.paddingBottom), px(style.paddingInlineStart), px(style.paddingInlineEnd)]).toEqual([8, 8, 12, 12])
  await expect([px(style.borderTopLeftRadius), px(style.columnGap)]).toEqual([8, 6])
  await expect(alphaOf(style.backgroundColor)).toBe(0)
  await expect([px(style.fontSize), px(style.lineHeight), style.fontWeight]).toEqual([13, 20, '500'])
  await expect(style.color).toBe(computed(link, palette['text/secondary']))
  const plus = link.querySelector('svg')
  if (!plus) throw new Error('no plus')
  const mark = plus.getBoundingClientRect()
  await expect([mark.width, mark.height]).toEqual([16, 16])
  await expect(getComputedStyle(plus).color).toBe(computed(link, palette['text/secondary']))
  // The plus leads the label: on its right in Persian, on its left in English.
  const rtl = style.direction === 'rtl'
  await expect(Math.round(rtl ? box.right - 12 - mark.right : mark.left - box.left - 12)).toBe(0)
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const link = linkIn(canvasElement)
    await isAtRest(link, semantic)
    // It shows «افزودن فرصت شغلی», and its name says which column, beginning
    // with what it shows.
    await expect(link).toHaveTextContent(i18n._('Add job opportunity'))
    await expect(link).toHaveAccessibleName(`${i18n._('Add a job opportunity to')} ${args.column}`)
    await expect((link.getAttribute('aria-label') ?? '').startsWith(i18n._('Add job opportunity'))).toBe(true)
    await userEvent.click(link)
    await expect(args.onAdd).toHaveBeenCalledOnce()
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const link = linkIn(canvasElement)
    // A real pointer, since :hover is the browser's hit-testing, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    // State=Hover: the same row on bg/surface-secondary. Worked out before
    // waiting, KN-014.
    const [fill, words] = [computed(link, semantic['bg/surface-secondary']), computed(link, semantic['text/secondary'])]
    await browser.userEvent.hover(link)
    await waitFor(() => expect(getComputedStyle(link).backgroundColor).toBe(fill))
    await expect(getComputedStyle(link).color).toBe(words)
  },
}

export const KeyboardFocus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const link = linkIn(canvasElement)
    // A real Tab, which only the runner has; KN-225's flag, as Hover's.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('KeyboardFocus is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    await browser.userEvent.keyboard('{Tab}')
    await expect(link).toHaveFocus()
    // The Add Stage's ring, three wide in border/focus inside the row, since
    // the file draws it no focus.
    const ring = getComputedStyle(link, '::after')
    await expect([ring.borderTopStyle, px(ring.borderTopWidth)]).toEqual(['solid', 3])
    await expect(ring.borderTopColor).toBe(computed(link, semantic['border/focus']))
  },
}

export const InEnglish: Story = {
  args: { column: fixtures('en-US').names.interview },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const link = linkIn(canvasElement)
    await isAtRest(link, semantic)
    await expect(link).toHaveAccessibleName(`${i18n._('Add a job opportunity to')} ${args.column}`)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isAtRest(linkIn(canvasElement), darkSemantic)
  },
}
