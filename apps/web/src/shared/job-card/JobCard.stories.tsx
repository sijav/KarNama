import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { elevation, semantic, spacing, status } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { JobCard, type JobCardProps } from './JobCard'

type Job = Pick<JobCardProps, 'title' | 'company' | 'date' | 'status' | 'link'>

// A job opportunity from the story fixtures as the board hands it over, its
// date said the reader's way, two days back as node 137:44 says «۲ روز پیش»;
// always in numbers, since Persian's automatic wording says «پریروز».
const jobIn = (locale: Locale, index: number): Job => {
  const job = fixtures(locale).jobs[index]
  if (!job) throw new Error(`the story fixtures have no job ${String(index)}`)
  return {
    title: job.title,
    company: job.company,
    date: new Intl.RelativeTimeFormat(locale, { numeric: 'always' }).format(-2, 'day'),
    status: job.status,
    link: job.link,
  }
}

const CONTROLLED: (keyof JobCardProps)[] = ['title', 'company', 'date', 'status', 'link', 'layout', 'selected', 'interactive']
const LAYOUTS: NonNullable<JobCardProps['layout']>[] = ['desktop', 'mobile']
const TOKENS = Object.keys(status)

// The desktop card is 400 wide in the file and the phone's 358; the card fills
// its container, so the stories give it the file's width.
const WIDTHS = { desktop: 400, mobile: 358 } as const

const meta = {
  title: 'Shared/JobCard',
  component: JobCard,
  args: {
    ...jobIn('fa-IR', 0),
    layout: 'desktop',
    selected: false,
    interactive: true,
    onOpen: fn(),
    onSelectedChange: fn(),
    onDelete: fn(),
    onChangeStatus: fn(),
  },
  argTypes: { layout: { control: 'radio', options: LAYOUTS }, status: { control: 'select', options: TOKENS } },
  parameters: { controls: { include: CONTROLLED } },
  decorators: [
    (Story, { args }) => (
      <Box sx={{ width: WIDTHS[args.layout ?? 'desktop'] }}>
        <Story />
      </Box>
    ),
  ],
} satisfies StoryMeta<typeof JobCard>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's value as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, property: 'color' | 'backgroundColor' | 'boxShadow', value: string) => {
  const previous = host.style[property]
  host.style[property] = value
  const result = getComputedStyle(host)[property]
  host.style[property] = previous
  return result
}

// Whether the checkbox is seen: its root's, since the native input the role
// sits on is always transparent under the drawn frame.
const seen = (checkbox: HTMLElement) => checkbox.parentElement?.checkVisibility({ opacityProperty: true }) ?? false

const cardOf = (canvasElement: HTMLElement) => {
  const card = canvasElement.querySelector('article')
  if (!card) throw new Error('no card')
  return card
}
// The stripe is the card's first child, drawn at its inline start.
const stripeOf = (card: HTMLElement) => {
  const stripe = card.firstElementChild
  if (!(stripe instanceof HTMLElement)) throw new Error('no stripe')
  return stripe
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 137:44 at rest: 400 by 148, 24 of padding, radius lg, one pixel of
    // border/default; the title at 16 and 600, the company in text/secondary,
    // the date 16 below it, and the 4 stripe at the inline start in the
    // status's colour; the checkbox and delete folded away, unseen and taking
    // no room, so the title starts at the card's inline start.
    const card = cardOf(canvasElement)
    const style = getComputedStyle(card)
    await expect([card.getBoundingClientRect().width, card.getBoundingClientRect().height]).toEqual([400, 148])
    await expect([px(style.paddingTop), px(style.borderTopLeftRadius), px(getComputedStyle(card, '::before').borderTopWidth)]).toEqual([
      24, 16, 1,
    ])
    const stripe = stripeOf(card)
    await expect(stripe.getBoundingClientRect().width).toBe(4)
    await expect(Math.round(card.getBoundingClientRect().right - stripe.getBoundingClientRect().right)).toBe(0)
    await expect(getComputedStyle(stripe).backgroundColor).toBe(computed(stripe, 'backgroundColor', status.applied.base))
    const title = within(card).getByRole('button', { name: args.title })
    await expect([px(getComputedStyle(title).fontSize), Number(getComputedStyle(title).fontWeight)]).toEqual([16, 600])
    // The page's font, not the one the browser gives a button.
    await expect(getComputedStyle(title).fontFamily).toBe(getComputedStyle(card).fontFamily)
    await expect(seen(within(card).getByRole('checkbox'))).toBe(false)
    await expect(
      within(card)
        .getByRole('button', { name: /حذف|Delete/u })
        .getBoundingClientRect().width,
    ).toBe(0)
    await expect(Math.round(card.getBoundingClientRect().right - px(style.paddingRight) - title.getBoundingClientRect().right)).toBe(0)
    await expect(within(card).getByRole('link')).toHaveAttribute('href', args.link ?? 'missing')
    await userEvent.click(title)
    await expect(args.onOpen).toHaveBeenCalledTimes(1)
    // Put down, so the story shows the card at rest and not focused.
    title.blur()
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 137:44 Hover: the edge at one and a half of border/focus with
    // Elevation/Card, the checkbox unfolding before the title, which moves
    // over by 28, and the delete at the inline end, over the reaction's 200 ms;
    // the card keeps its 148. The browser's own pointer, which only the runner
    // has, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    const card = cardOf(canvasElement)
    const title = within(card).getByRole('button', { name: args.title })
    const before = title.getBoundingClientRect()
    // At rest the folded checkbox lies under the title's start and takes no
    // press: the pointer there opens the job opportunity.
    await browser.userEvent.click(title, { position: { x: before.width - spacing['2xs'], y: before.height / 2 } })
    await expect(args.onOpen).toHaveBeenCalledTimes(1)
    await expect(args.onSelectedChange).not.toHaveBeenCalled()
    await browser.userEvent.hover(card)
    const checkbox = within(card).getByRole('checkbox')
    await waitFor(() => expect(getComputedStyle(card).boxShadow.includes('inset')).toBe(true))
    await waitFor(() => expect(Math.round(Math.abs(title.getBoundingClientRect().right - before.right))).toBe(28))
    await expect(seen(checkbox)).toBe(true)
    await expect(card.getBoundingClientRect().height).toBe(148)
    await expect(getComputedStyle(card).transitionDuration.split(', ')).toEqual(['0.2s', '0.2s'])
    await userEvent.click(within(card).getByRole('button', { name: /حذف|Delete/u }))
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
  },
}

export const TabOrder: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Tab from before the card meets its controls in the order they are drawn:
    // the checkbox, folded at rest and unfolding as it takes focus, then the
    // title, the link and the delete, KN-341. The browser's own Tab, which only
    // the runner has, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    const card = cardOf(canvasElement)
    const checkbox = within(card).getByRole('checkbox')
    const order = [
      checkbox,
      within(card).getByRole('button', { name: args.title }),
      within(card).getByRole('link'),
      within(card).getByRole('button', { name: /حذف|Delete/u }),
    ]
    // Focus starts just before the card.
    canvasElement.tabIndex = -1
    canvasElement.focus()
    for (const control of order) {
      await browser.userEvent.tab()
      await expect(control).toHaveFocus()
    }
    canvasElement.removeAttribute('tabindex')
    await expect(seen(checkbox)).toBe(true)
  },
}

export const Pressed: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 137:44 Pressed: bg/surface-secondary while held, here by the keyboard's
    // Space on the card's own button, under the runner, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    const card = cardOf(canvasElement)
    const pressed = computed(card, 'backgroundColor', semantic['bg/surface-secondary'])
    within(card).getByRole('button', { name: args.title }).focus()
    await browser.userEvent.keyboard('{Space>}')
    await waitFor(() => expect(getComputedStyle(card).backgroundColor).toBe(pressed))
    await browser.userEvent.keyboard('{/Space}')
  },
}

export const Selected: Story = {
  args: { selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Node 137:44 Selected: bg/brand/container, the lifted edge, the checkbox
    // checked and the delete in view.
    const card = cardOf(canvasElement)
    await expect(getComputedStyle(card).backgroundColor).toBe(computed(card, 'backgroundColor', semantic['bg/brand/container']))
    await expect(within(card).getByRole('checkbox')).toBeChecked()
    await expect(getComputedStyle(card).boxShadow).toContain(computed(card, 'boxShadow', elevation.card).split(', ')[0] ?? 'missing')
  },
}

export const Static: Story = {
  args: { interactive: false },
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Node 137:44 Static: drawn at rest with nothing to press but the link.
    const card = cardOf(canvasElement)
    await expect(within(card).queryAllByRole('button')).toHaveLength(0)
    const title = within(card).getByText(args.title)
    const style = getComputedStyle(title)
    await expect([px(style.fontSize), Number(style.fontWeight), px(style.lineHeight)]).toEqual([16, 600, 24])
  },
}

export const Focus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 137:44 Focus: focused by the keyboard, two pixels of border/focus
    // and the file's halo, elevation.cardFocus; Enter opens it.
    const card = cardOf(canvasElement)
    const title = within(card).getByRole('button', { name: args.title })
    title.focus()
    await userEvent.tab()
    await userEvent.tab({ shift: true })
    await expect(title).toHaveFocus()
    await waitFor(() => expect(getComputedStyle(card).boxShadow).toBe(computed(card, 'boxShadow', elevation.cardFocus)))
    await expect(px(getComputedStyle(card, '::before').borderTopWidth)).toBe(2)
    await userEvent.keyboard('{Enter}')
    await expect(args.onOpen).toHaveBeenCalledTimes(1)
  },
}

export const Mobile: Story = {
  args: { layout: 'mobile' },
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Node 491:751 Default: 358 by 141, no hover, and the three dots always in
    // view, opening the Card menu.
    const card = cardOf(canvasElement)
    await expect([card.getBoundingClientRect().width, card.getBoundingClientRect().height]).toEqual([358, 141])
    const more = within(card)
      .getAllByRole('button')
      .find((button) => button !== within(card).getByRole('button', { name: args.title }))
    if (!more) throw new Error('no three dots')
    await expect(more.getBoundingClientRect().width).toBe(32)
    await userEvent.click(more)
    await within(canvasElement.ownerDocument.body).findByRole('menu')
    await userEvent.keyboard('{Escape}')
  },
}

export const MobileSelected: Story = {
  args: { layout: 'mobile', selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const card = cardOf(canvasElement)
    await expect(getComputedStyle(card).backgroundColor).toBe(computed(card, 'backgroundColor', semantic['bg/brand/container']))
    await expect(within(card).getByRole('checkbox')).toBeChecked()
  },
}

export const StripeInEveryColour: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  // Node 358:430: one card per status, the stripe in each one's base colour.
  render: (args) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.sm}px` }}>
      {TOKENS.map((token) => (
        <JobCard key={token} {...args} status={token} />
      ))}
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const cards = [...canvasElement.querySelectorAll('article')]
    await expect(cards).toHaveLength(9)
    for (const [index, card] of cards.entries()) {
      const stripe = stripeOf(card)
      const token = TOKENS[index]
      const pair = token === undefined ? undefined : Object.entries(status).find(([name]) => name === token)?.[1]
      if (!pair) throw new Error('a status is missing')
      await expect(getComputedStyle(stripe).backgroundColor).toBe(computed(stripe, 'backgroundColor', pair.base))
    }
  },
}

export const UnknownStatus: Story = {
  args: { status: 'gone' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // A status deleted or unknown takes the new colour, never no stripe.
    const stripe = stripeOf(cardOf(canvasElement))
    await expect(getComputedStyle(stripe).backgroundColor).toBe(computed(stripe, 'backgroundColor', status.new.base))
  },
}

export const CheckboxRingIsWhole: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // The Title Group's host contract, KN-293: from the title, Shift+Tab
    // reaches the checkbox, and every ancestor that clips, the card among
    // them, holds its whole 28 by 28 root.
    const card = cardOf(canvasElement)
    within(card).getByRole('button', { name: args.title }).focus()
    await userEvent.tab({ shift: true })
    const checkbox = within(card).getByRole('checkbox')
    await expect(checkbox).toHaveFocus()
    const root = checkbox.parentElement
    if (!root) throw new Error('the checkbox has no root')
    const ring = root.getBoundingClientRect()
    await expect([Math.round(ring.width), Math.round(ring.height)]).toEqual([28, 28])
    for (let node = root.parentElement; node && node !== canvasElement; node = node.parentElement) {
      const clip = getComputedStyle(node)
      if (clip.overflowX === 'visible' && clip.overflowY === 'visible') continue
      const box = node.getBoundingClientRect()
      await expect(ring.left >= box.left && ring.right <= box.right && ring.top >= box.top && ring.bottom <= box.bottom).toBe(true)
    }
  },
}

export const LongTitle: Story = {
  args: jobIn('fa-IR', 1),
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // A long title and company are cut with an ellipsis; the card keeps its 148.
    const card = cardOf(canvasElement)
    await expect(card.getBoundingClientRect().height).toBe(148)
    const title = within(card).getByRole('button', { name: args.title })
    await expect(title.scrollWidth).toBeGreaterThan(title.clientWidth)
  },
}

export const InEnglish: Story = {
  args: jobIn('en-US', 0),
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    // Left to right, the stripe is at the left.
    const card = cardOf(canvasElement)
    await expect(Math.round(stripeOf(card).getBoundingClientRect().left - card.getBoundingClientRect().left)).toBe(0)
  },
}
