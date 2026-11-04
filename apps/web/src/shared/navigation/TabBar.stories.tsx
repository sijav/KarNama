import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import { GLYPHS, type IconName } from '../icon'
import type { StoryMeta } from '../story-docs/story-meta'
import { CURRENT } from './destinations'
import { TabBar, type TabBarProps } from './TabBar'

// The phone the file draws, 390 wide.
const PHONE = 390
// Tab Bar v2's three, 1273:103863, and their icons, file, chart and user, KN-783.
const DESTINATIONS: NonNullable<TabBarProps['current']>[] = ['jobs', 'stats', 'network']
const ICONS: readonly IconName[] = ['file', 'chart', 'user']

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

type Palette = Record<keyof typeof semantic, string>

// Node 1273:103863, each of its three variants, with 185:19's measures: 390 by
// 72, one pixel of border/default along the top, the three destinations in
// thirds of 130, the board at the inline start, file, chart and user each a 24
// icon over its label at 12 and Medium, the current one in text/brand and the
// others text/secondary. Exactly three: adding and the shell's controls are not
// among them, KN-783.
const isTheFiles = async (canvasElement: HTMLElement, current: NonNullable<TabBarProps['current']>, palette: Palette) => {
  const bar = within(canvasElement).getByRole('navigation', { name: 'فضای کار' })
  const box = bar.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([PHONE, 72])
  await expect(px(getComputedStyle(bar).borderTopWidth)).toBe(1)
  await expect(getComputedStyle(bar).backgroundColor).toBe(computed(bar, palette['bg/surface']))
  const tabs = within(bar).getAllByRole('button')
  await expect(tabs.map((tab) => tab.textContent)).toEqual(['فرصت‌های شغلی من', 'آمار من', 'شبکه من'])
  await expect(tabs.map((tab) => tab.querySelector('path')?.getAttribute('d'))).toEqual(ICONS.map((name) => GLYPHS[name].stroke[0]))
  await expect(tabs.map((tab) => Math.round(tab.getBoundingClientRect().width))).toEqual([130, 130, 130])
  const [jobs] = tabs
  if (!jobs) throw new Error('no tabs')
  await expect(Math.round(box.right - jobs.getBoundingClientRect().right)).toBe(0)
  const at = DESTINATIONS.indexOf(current)
  for (const [index, tab] of tabs.entries()) {
    await expect(tab.getAttribute('aria-current')).toBe(index === at ? CURRENT : null)
    await expect(getComputedStyle(tab).color).toBe(computed(tab, index === at ? palette['text/brand'] : palette['text/secondary']))
  }
  await expect(jobs.querySelector('svg')?.getBoundingClientRect().width).toBe(24)
  await expect([px(getComputedStyle(jobs).fontSize), Number(getComputedStyle(jobs).fontWeight)]).toEqual([12, 500])
  return tabs
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Active=فرصت‌ها, 1273:103821, whichever page the Controls choose, KN-574.
    const [, stats] = await isTheFiles(canvasElement, args.current, semantic)
    await userEvent.click(stats ?? canvasElement)
    await expect(args.onNavigate).toHaveBeenCalledWith('stats')
  },
}

export const StatsCurrent: Story = {
  // Active=آمار, 1273:103835.
  args: { current: 'stats' },
  parameters: { controls: { include: [] } },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isTheFiles(canvasElement, 'stats', semantic)
  },
}

export const NetworkCurrent: Story = {
  // Active=شبکه, 1273:103849.
  args: { current: 'network' },
  parameters: { controls: { include: [] } },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isTheFiles(canvasElement, 'network', semantic)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args.current, darkSemantic)
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
    await expect(
      within(bar)
        .getAllByRole('button')
        .map((tab) => tab.textContent),
    ).toEqual(['My job opportunities', 'My stats', 'My network'])
  },
}
