import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import type { StoryMeta } from '../story-docs/story-meta'
import { AddColumn } from './KanbanColumn'

const meta = {
  title: 'Shared/AddColumn',
  component: AddColumn,
  args: { onAdd: fn() },
} satisfies StoryMeta<typeof AddColumn>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 241:34: 220 by 120, one pixel of border/default dashed, radius lg,
    // the 20 plus 8 above «افزودن وضعیت» at 12 and Medium, in the page's font;
    // a press adds a status.
    const tile = within(canvasElement).getByRole('button', { name: 'افزودن وضعیت' })
    const style = getComputedStyle(tile)
    await expect([tile.getBoundingClientRect().width, tile.getBoundingClientRect().height]).toEqual([220, 120])
    await expect([style.borderTopStyle, px(style.borderTopWidth), px(style.borderTopLeftRadius)]).toEqual(['dashed', 1, 16])
    await expect([px(style.fontSize), Number(style.fontWeight), px(style.lineHeight)]).toEqual([12, 500, 16])
    await expect(style.fontFamily).toBe(getComputedStyle(canvasElement).fontFamily)
    const icon = tile.querySelector('svg')
    if (!icon) throw new Error('the tile has no plus')
    await expect(icon.getBoundingClientRect().width).toBe(20)
    await userEvent.click(tile)
    await expect(args.onAdd).toHaveBeenCalledTimes(1)
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Add status' })).toBeInTheDocument()
  },
}
