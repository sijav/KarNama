import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { MIN_CONTRAST, contrast } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import { formatPhone } from '../contact-card'
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

// A computed rgb() colour as the hex the WCAG formula takes, as the Checkbox's stories read one:
// three channels or it throws. Tooltip's version defaults each channel to zero, which here would
// measure the label against black and pass whatever it is drawn in.
const hexOf = (rgb: string) => {
  const channels = rgb.match(/\d+/g)?.slice(0, 3) ?? []
  if (channels.length !== 3) throw new Error(`not an rgb colour: ${rgb}`)
  return `#${channels.map((channel) => Number(channel).toString(16).padStart(2, '0')).join('')}`
}

// The Section Label read where it is actually drawn, KN-666. The RENDERED colours rather than the
// tokens, so a wrong surface is caught as well as a wrong token; the palette test owns the
// token-level pairs and cannot see which surface a token is used on.
const labelIsReadable = async (aside: HTMLElement) => {
  const label = within(aside).getByText('فضای کار')
  const ratio = contrast(hexOf(getComputedStyle(label).color), hexOf(getComputedStyle(aside).backgroundColor))
  await expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST)
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
    // «فضای کار» is information, not an inactive control, so it takes the 4.5 the rest of the text
    // takes, KN-666. ReadableInDark reads the same thing in the other scheme.
    await labelIsReadable(aside)
    const sidebar = within(aside)
    await expect(sidebar.getByText('کارنما')).toBeInTheDocument()
    await expect(sidebar.getByText('ک')).toBeInTheDocument()
    // The name and the phone the Controls hold, found in the User Row, which
    // follows the Brand Row as 406:451 and 406:457 draw them, so text the rest of
    // the sidebar prints is never found twice; the phone as the Sidebar's own
    // formatPhone draws it in the Persian this story pins, each when there is
    // text to find, KN-574.
    const userRow = aside.children.item(1)
    if (!(userRow instanceof HTMLElement)) throw new Error('the sidebar has no user row')
    if (args.userName !== undefined && args.userName !== '') await expect(within(userRow).getByText(args.userName)).toBeInTheDocument()
    if (args.userPhone !== undefined && args.userPhone !== '') {
      await expect(within(userRow).getByText(formatPhone('fa-IR', args.userPhone))).toBeInTheDocument()
    }
    const nav = sidebar.getByRole('navigation', { name: 'فضای کار' })
    const items = within(nav).getAllByRole('button')
    await expect(items.map((item) => item.textContent)).toEqual(['فرصت‌های شغلی من', 'افزودن فرصت شغلی', 'شبکه من'])
    // The item args.current names is the current page, and only it, KN-574.
    const current = DESTINATIONS.indexOf(args.current)
    await expect(items.map((item) => item.getAttribute('aria-current'))).toEqual(
      items.map((_, index) => (index === current ? CURRENT : null)),
    )
    // At the foot, 24 from the bottom, the shell's own controls, KN-478: the
    // language, settings and «خروج» as Icon Buttons on one line, the first
    // centred on the destinations' icon column.
    const signOut = sidebar.getByRole('button', { name: 'خروج' })
    const language = sidebar.getByRole('button', { name: 'زبان' })
    const settings = sidebar.getByRole('button', { name: 'تنظیمات' })
    await expect(Math.round(box.bottom - signOut.getBoundingClientRect().bottom)).toBe(24)
    const foot = signOut.getBoundingClientRect().top
    await expect([language, settings].map((button) => button.getBoundingClientRect().top)).toEqual([foot, foot])
    const destinationIcon = items[0]?.querySelector('svg')
    if (!destinationIcon) throw new Error('a destination has lost its icon')
    const centreOf = (element: Element) => {
      const rect = element.getBoundingClientRect()
      return Math.round(rect.left + rect.width / 2)
    }
    await expect(centreOf(language)).toBe(centreOf(destinationIcon))
    await userEvent.click(items[1] ?? aside)
    await expect(args.onNavigate).toHaveBeenCalledWith('add')
    await userEvent.click(signOut)
    await expect(args.onSignOut).toHaveBeenCalledTimes(1)
  },
}

export const NetworkCurrent: Story = {
  // The current page is its point, so it is not offered, KN-574.
  parameters: { controls: { include: ['userName', 'userPhone'] } },
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
  // Its render passes no user, so only the current page is a control, KN-574.
  parameters: { controls: { include: ['current'] } },
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
    await userEvent.click(within(aside).getByRole('button', { name: 'زبان' }))
    const english = (await within(document.body).findAllByRole('menuitem'))[1]
    if (!english) throw new Error('the menu has no English')
    await userEvent.click(english)
    await expect(document.documentElement).toHaveAttribute('dir', 'ltr')
    await expect(within(aside).getByRole('button', { name: 'My job opportunities' })).toBeInTheDocument()
    await expect([px(getComputedStyle(aside).borderLeftWidth), px(getComputedStyle(aside).borderRightWidth)]).toEqual([0, 1])
  },
}

export const ReadableInDark: Story = {
  // The file's only dark story. A story proves a rendered line only where it pins the global,
  // KN-589, so the scheme is pinned here rather than threaded through a helper; the locale is
  // pinned with it because the label is found by its Persian words.
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  // The scheme is the whole story, so no control applies.
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement }) => {
    // KN-666: the dark palette derives text/secondary through ensureContrast against the dark
    // surface, while text/disabled gets no such guarantee, so this is the scheme where the old
    // colour had nothing holding it up at all.
    await labelIsReadable(asideIn(canvasElement))
  },
}

export const InEnglish: Story = {
  args: { userName: 'Mahdi Rezaei' },
  globals: { locale: 'en-US' },
  play: async ({ args, canvasElement }) => {
    // Left to right, the edge faces the page on the right and the brand mark
    // is at the left; the phone the Controls hold, in its User Row, in the English
    // this story pins, KN-574.
    const aside = asideIn(canvasElement)
    await expect(px(getComputedStyle(aside).borderRightWidth)).toBe(1)
    await expect(within(aside).getByText('K')).toBeInTheDocument()
    const userRow = aside.children.item(1)
    if (!(userRow instanceof HTMLElement)) throw new Error('the sidebar has no user row')
    if (args.userPhone !== undefined && args.userPhone !== '') {
      await expect(within(userRow).getByText(formatPhone('en-US', args.userPhone))).toBeInTheDocument()
    }
  },
}
