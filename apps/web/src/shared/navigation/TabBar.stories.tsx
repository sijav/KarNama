import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { CURRENT } from './destinations'
import { TabBar, type TabBarProps } from './TabBar'

// The phone the file draws, 390 wide.
const PHONE = 390
const DESTINATIONS: NonNullable<TabBarProps['current']>[] = ['jobs', 'add', 'network']

const meta = {
  title: 'Shared/TabBar',
  component: TabBar,
  args: { current: 'jobs', onNavigate: fn() },
  argTypes: { current: { control: 'radio', options: DESTINATIONS } },
  parameters: { controls: { include: ['current'] } },
  decorators: [
    (Story) => (
      <Box sx={{ width: PHONE }}>
        <Story />
      </Box>
    ),
  ],
} satisfies StoryMeta<typeof TabBar>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's value as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 185:19: 390 by 72, one pixel of border/default along the top, the
    // three destinations in thirds of 130, the board at the right and current
    // in text/brand, each a 24 icon over its label at 12 and Medium. Exactly
    // three: the language switch is not among them.
    const bar = within(canvasElement).getByRole('navigation', { name: 'فضای کار' })
    const box = bar.getBoundingClientRect()
    await expect([box.width, box.height]).toEqual([PHONE, 72])
    await expect(px(getComputedStyle(bar).borderTopWidth)).toBe(1)
    const tabs = within(bar).getAllByRole('button')
    await expect(tabs.map((tab) => tab.textContent)).toEqual(['فرصت‌های شغلی من', 'افزودن فرصت شغلی', 'شبکه من'])
    await expect(tabs.map((tab) => Math.round(tab.getBoundingClientRect().width))).toEqual([130, 130, 130])
    const [jobs, add] = tabs
    if (!jobs || !add) throw new Error('fewer than two tabs')
    await expect(Math.round(box.right - jobs.getBoundingClientRect().right)).toBe(0)
    await expect(jobs.getAttribute('aria-current')).toBe(CURRENT)
    await expect(getComputedStyle(jobs).color).toBe(computed(jobs, semantic['text/brand']))
    await expect(getComputedStyle(add).color).toBe(computed(add, semantic['text/secondary']))
    await expect(jobs.querySelector('svg')?.getBoundingClientRect().width).toBe(24)
    await expect([px(getComputedStyle(jobs).fontSize), Number(getComputedStyle(jobs).fontWeight)]).toEqual([12, 500])
    await userEvent.click(add)
    await expect(args.onNavigate).toHaveBeenCalledWith('add')
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    // Left to right, the board is the leftmost tab.
    const bar = within(canvasElement).getByRole('navigation')
    const [jobs] = within(bar).getAllByRole('button')
    if (!jobs) throw new Error('no tabs')
    await expect(Math.round(jobs.getBoundingClientRect().left - bar.getBoundingClientRect().left)).toBe(0)
    await expect(jobs).toHaveTextContent('My job opportunities')
  },
}
