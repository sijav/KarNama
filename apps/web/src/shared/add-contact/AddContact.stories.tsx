import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { AddContact } from './AddContact'

// The width the file draws it at, the related people tab's.
const TAB_WIDTH = 672

const meta = {
  title: 'Shared/AddContact',
  component: AddContact,
  args: { onClick: fn() },
  render: (args) => (
    <Box sx={{ width: TAB_WIDTH }}>
      <AddContact {...args} />
    </Box>
  ),
} satisfies StoryMeta<typeof AddContact>

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

const rowIn = (canvasElement: HTMLElement) => within(canvasElement).getByRole('button')

// What node 961:101547 draws at rest, State=Default: the container's width by
// 46, an edge of one dashed in border/default drawn inside and out of the
// layout round radius md, 12 above and below, and centred the 16 plus leading
// the label at 14 on 22 and Medium in text/brand, 8 apart.
const isAtRest = async (row: HTMLElement, palette: Record<keyof typeof semantic, string>) => {
  const box = row.getBoundingClientRect()
  await expect([Math.round(box.width), Math.round(box.height)]).toEqual([TAB_WIDTH, 46])
  const style = getComputedStyle(row)
  await expect([px(style.paddingTop), px(style.paddingBottom), px(style.columnGap), px(style.borderTopLeftRadius)]).toEqual([12, 12, 8, 8])
  await expect([px(style.fontSize), px(style.lineHeight), style.fontWeight]).toEqual([14, 22, '500'])
  await expect(style.color).toBe(computed(row, palette['text/brand']))
  const edge = getComputedStyle(row, '::before')
  await expect([px(edge.borderTopWidth), edge.borderTopStyle]).toEqual([1, 'dashed'])
  await expect(edge.borderTopColor).toBe(computed(row, palette['border/default']))
  const plus = row.querySelector('svg')
  if (!plus) throw new Error('no plus')
  const plusBox = plus.getBoundingClientRect()
  await expect([plusBox.width, plusBox.height]).toEqual([16, 16])
  // The plus leads the label, and the two sit centred in the row.
  const rtl = style.direction === 'rtl'
  await expect(row.textContent.length).toBeGreaterThan(0)
  const contentStart = rtl ? box.right - plusBox.right : plusBox.left - box.left
  await expect(contentStart).toBeGreaterThan(TAB_WIDTH / 4)
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const row = rowIn(canvasElement)
    await isAtRest(row, semantic)
    await userEvent.click(row)
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isAtRest(rowIn(canvasElement), semantic)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isAtRest(rowIn(canvasElement), darkSemantic)
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const row = rowIn(canvasElement)
    // A real pointer, since :hover is the browser's hit-testing; in the
    // published Storybook there is none to move, so hover the row yourself.
    // The runner is known by the flag .storybook/vitest.setup.ts sets, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    // State=Hover: bg/surface-secondary under the same edge. Worked out before
    // waiting, KN-014.
    const fill = computed(row, semantic['bg/surface-secondary'])
    await browser.userEvent.hover(row)
    await waitFor(() => expect(getComputedStyle(row).backgroundColor).toBe(fill))
  },
}

export const KeyboardFocus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const row = rowIn(canvasElement)
    // A real Tab, which only the runner has; KN-225's flag, as Hover's.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('KeyboardFocus is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    await browser.userEvent.keyboard('{Tab}')
    await expect(row).toHaveFocus()
    // Three wide in border/focus inside the edge, since the file draws no focus.
    const ring = getComputedStyle(row, '::after')
    await expect([ring.borderTopStyle, px(ring.borderTopWidth)]).toEqual(['solid', 3])
    await expect(ring.borderTopColor).toBe(computed(row, semantic['border/focus']))
  },
}
