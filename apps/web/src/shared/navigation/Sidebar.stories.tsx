import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { CURRENT } from './destinations'
import { Sidebar, type SidebarProps } from './Sidebar'

// The sidebar is the screen's height, 720 in the file's component.
const HEIGHT = 720
const DESTINATIONS: NonNullable<SidebarProps['current']>[] = ['jobs', 'add', 'network']

const meta = {
  title: 'Shared/Sidebar',
  component: Sidebar,
  args: {
    current: 'jobs',
    userName: 'مهدی رضایی',
    userPhone: '09123456789',
    onNavigate: fn(),
    onSignOut: fn(),
  },
  argTypes: { current: { control: 'radio', options: DESTINATIONS } },
  parameters: { controls: { include: ['current', 'userName', 'userPhone'] } },
  decorators: [
    (Story) => (
      <Box sx={{ height: HEIGHT }}>
        <Story />
      </Box>
    ),
  ],
} satisfies StoryMeta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's value as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.borderLeftColor
  host.style.borderLeftColor = value
  const result = getComputedStyle(host).borderLeftColor
  host.style.borderLeftColor = previous
  return result
}

const asideIn = (canvasElement: HTMLElement) => {
  const aside = canvasElement.querySelector('aside')
  if (!aside) throw new Error('no sidebar')
  return aside
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 185:11: 240 by the screen's height, 24 above and below and 16 at
    // the sides, bg/surface, one pixel of border/default on the edge facing the
    // page, the left in Persian. The brand, the user with the phone in the
    // reader's digits, «فضای کار», the three destinations with the board
    // current, and at the foot the language switch and «خروج», 24 from the
    // bottom.
    const aside = asideIn(canvasElement)
    const box = aside.getBoundingClientRect()
    const style = getComputedStyle(aside)
    await expect([box.width, box.height]).toEqual([240, HEIGHT])
    await expect([px(style.paddingTop), px(style.paddingLeft)]).toEqual([24, 16])
    await expect([px(style.borderLeftWidth), px(style.borderRightWidth)]).toEqual([1, 0])
    await expect(style.borderLeftColor).toBe(computed(aside, semantic['border/default']))
    const sidebar = within(aside)
    await expect(sidebar.getByText('کارنما')).toBeInTheDocument()
    await expect(sidebar.getByText('ک')).toBeInTheDocument()
    await expect(sidebar.getByText(args.userName ?? 'missing')).toBeInTheDocument()
    await expect(sidebar.getByText('۰۹۱۲ ۳۴۵ ۶۷۸۹')).toBeInTheDocument()
    const nav = sidebar.getByRole('navigation', { name: 'فضای کار' })
    const items = within(nav).getAllByRole('button')
    await expect(items.map((item) => item.textContent)).toEqual(['فرصت‌های شغلی من', 'افزودن فرصت شغلی', 'شبکه من'])
    await expect(items[0]?.getAttribute('aria-current')).toBe(CURRENT)
    const signOut = sidebar.getByRole('button', { name: 'خروج' })
    await expect(Math.round(box.bottom - signOut.getBoundingClientRect().bottom)).toBe(24)
    const language = sidebar.getByRole('button', { name: 'فارسی' })
    await expect(Math.round(signOut.getBoundingClientRect().top - language.getBoundingClientRect().bottom)).toBe(8)
    await expect(language.getBoundingClientRect().height).toBe(44)
    await userEvent.click(items[1] ?? aside)
    await expect(args.onNavigate).toHaveBeenCalledWith('add')
    await userEvent.click(signOut)
    await expect(args.onSignOut).toHaveBeenCalledTimes(1)
  },
}

export const NetworkCurrent: Story = {
  args: { current: 'network' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const nav = within(asideIn(canvasElement)).getByRole('navigation')
    const current = within(nav)
      .getAllByRole('button')
      .filter((item) => item.getAttribute('aria-current') === CURRENT)
    await expect(current.map((item) => item.textContent)).toEqual(['شبکه من'])
  },
}

export const WithoutUser: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  // The props a signed-in page gives are left out.
  render: (args) => <Sidebar current={args.current} onNavigate={args.onNavigate} />,
  play: async ({ canvasElement }) => {
    // Before anyone signs in there is no user to show and nothing to sign out
    // of: the rows are left out rather than drawn empty.
    const aside = within(asideIn(canvasElement))
    await expect(aside.queryByText('۰۹۱۲ ۳۴۵ ۶۷۸۹')).toBeNull()
    await expect(aside.queryByRole('button', { name: 'خروج' })).toBeNull()
  },
}

export const SwitchLanguage: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // The switch at the foot changes the language and the direction: the
    // sidebar speaks English and its edge moves to the right.
    const aside = asideIn(canvasElement)
    await userEvent.click(within(aside).getByRole('button', { name: 'فارسی' }))
    const english = (await within(document.body).findAllByRole('menuitem'))[1]
    if (!english) throw new Error('the menu has no English')
    await userEvent.click(english)
    await expect(document.documentElement).toHaveAttribute('dir', 'ltr')
    await expect(within(aside).getByRole('button', { name: 'My job opportunities' })).toBeInTheDocument()
    await expect([px(getComputedStyle(aside).borderLeftWidth), px(getComputedStyle(aside).borderRightWidth)]).toEqual([0, 1])
  },
}

export const InEnglish: Story = {
  args: { userName: 'Mahdi Rezaei' },
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    // Left to right, the edge faces the page on the right and the brand mark
    // is at the left.
    const aside = asideIn(canvasElement)
    await expect(px(getComputedStyle(aside).borderRightWidth)).toBe(1)
    await expect(within(aside).getByText('K')).toBeInTheDocument()
    await expect(within(aside).getByText('0912 345 6789')).toBeInTheDocument()
  },
}
