import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { elevation, semantic, spacing, status } from '../../theme/tokens'
import { HOLD_MS, SLOP } from '../hold'
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

const CONTROLLED: (keyof JobCardProps)[] = ['title', 'company', 'date', 'status', 'link', 'layout', 'selected', 'selecting', 'interactive']
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
    selecting: false,
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

// Where the title ends, from the card's inline start inside its padding: 0 when
// nothing stands before it, 28 when the checkbox does. Right to left, as the
// Persian stories are.
const titleInset = (card: HTMLElement, title: HTMLElement) =>
  Math.round(card.getBoundingClientRect().right - px(getComputedStyle(card).paddingRight) - title.getBoundingClientRect().right)

// What a finger does to a phone's card, dispatched as the browser would, KN-428:
// a press, a drift, a lift, the browser taking the touch for a scroll, a finger
// leaving the card. These prove the card's own handlers, not a phone's gesture
// recognition, which the board's e2e test holds with a real touch.
type Pointing = 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel' | 'pointerout'
type Finger = 'touch'
const FINGER: Finger = 'touch'
type Mouse = 'mouse'
const MOUSE: Mouse = 'mouse'
const pointer = (target: Element, type: Pointing, init: PointerEventInit = {}) => {
  const box = target.getBoundingClientRect()
  return target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      isPrimary: true,
      pointerId: 1,
      pointerType: FINGER,
      button: 0,
      clientX: box.left + box.width / 2,
      clientY: box.top + box.height / 2,
      ...init,
    }),
  )
}
// The click a release sends, with a detail of 1, or a key, with 0.
type Clicking = 'click'
const CLICK: Clicking = 'click'
const clickOn = (target: Element, detail: number) =>
  target.dispatchEvent(new MouseEvent(CLICK, { bubbles: true, cancelable: true, detail }))
// A contextmenu, as a phone's browser may send for its own long press: true when
// nothing prevented it.
type Menuing = 'contextmenu'
const CONTEXT: Menuing = 'contextmenu'
const contextOn = (target: Element) => target.dispatchEvent(new MouseEvent(CONTEXT, { bubbles: true, cancelable: true }))
// A wait of the hold's own length, begun after the card's timer: timers of one
// delay run in the order they were set, so when it ends the card's hold would
// already have run, and a check that nothing was selected is not a guess.
const pastTheHold = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, HOLD_MS)
  })

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
    await expect(titleInset(card, title)).toBe(0)
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
  play: async ({ args, canvasElement }) => {
    // Node 137:44 Selected: bg/brand/container, the lifted edge, the checkbox
    // checked and the delete in view.
    const card = cardOf(canvasElement)
    await expect(getComputedStyle(card).backgroundColor).toBe(computed(card, 'backgroundColor', semantic['bg/brand/container']))
    // Named for the job opportunity it selects, on the input the role belongs
    // to, KN-423.
    await expect(within(card).getByRole('checkbox', { name: `${i18nFor('fa-IR')._('Select')} ${args.title}` })).toBeChecked()
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
    // view, opening the Card menu. No checkbox at rest: it is folded away,
    // unseen and taking no room, so the title starts at the card's inline
    // start, KN-428.
    const card = cardOf(canvasElement)
    await expect([card.getBoundingClientRect().width, card.getBoundingClientRect().height]).toEqual([358, 141])
    const title = within(card).getByRole('button', { name: args.title })
    await expect(seen(within(card).getByRole('checkbox'))).toBe(false)
    await expect(titleInset(card, title)).toBe(0)
    const more = within(card)
      .getAllByRole('button')
      .find((button) => button !== title)
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
  play: async ({ args, canvasElement }) => {
    // Node 491:749: the pale fill and the checkbox checked. Holding a card that
    // is already selected changes nothing, KN-428.
    const card = cardOf(canvasElement)
    await expect(getComputedStyle(card).backgroundColor).toBe(computed(card, 'backgroundColor', semantic['bg/brand/container']))
    await expect(within(card).getByRole('checkbox')).toBeChecked()
    const title = within(card).getByRole('button', { name: args.title })
    pointer(title, 'pointerdown')
    await pastTheHold()
    pointer(title, 'pointerup')
    await expect(args.onSelectedChange).not.toHaveBeenCalled()
  },
}

export const MobileSelecting: Story = {
  args: { layout: 'mobile', selecting: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // While the board is selecting, every phone card shows its checkbox, as the
    // Checkbox 204:11 says: unchecked on a card not chosen, before the title,
    // which moves over by 28 as the desktop's does, KN-428.
    const card = cardOf(canvasElement)
    const title = within(card).getByRole('button', { name: args.title })
    const checkbox = within(card).getByRole('checkbox', { name: `${i18nFor('fa-IR')._('Select')} ${args.title}` })
    await expect(seen(checkbox)).toBe(true)
    await expect(checkbox).not.toBeChecked()
    await expect(titleInset(card, title)).toBe(28)
    await userEvent.click(checkbox)
    await expect(args.onSelectedChange).toHaveBeenCalledWith(true)
    await expect(args.onOpen).not.toHaveBeenCalled()
  },
}

export const MobileHold: Story = {
  args: { layout: 'mobile' },
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // A press held on the phone's card selects it, the file's «نگه‌داشتن»,
    // 491:751, KN-428, and the click its release sends opens nothing.
    const card = cardOf(canvasElement)
    const title = within(card).getByRole('button', { name: args.title })
    // Waited for with room past the hold's own half second, which a loaded
    // runner can stretch; the wait ends as soon as the call arrives.
    pointer(title, 'pointerdown')
    await waitFor(() => expect(args.onSelectedChange).toHaveBeenCalledTimes(1), { timeout: HOLD_MS * 4 })
    await expect(args.onSelectedChange).toHaveBeenLastCalledWith(true)
    pointer(title, 'pointerup')
    clickOn(title, 1)
    await expect(args.onOpen).not.toHaveBeenCalled()

    // A hold whose release sends no click, as a phone may after a long press,
    // leaves the tap after it to open the card, KN-428's plan review.
    pointer(title, 'pointerdown')
    await waitFor(() => expect(args.onSelectedChange).toHaveBeenCalledTimes(2), { timeout: HOLD_MS * 4 })
    pointer(title, 'pointerup')
    pointer(title, 'pointerdown')
    pointer(title, 'pointerup')
    clickOn(title, 1)
    await expect(args.onOpen).toHaveBeenCalledTimes(1)

    // A contextmenu during a press, which a phone's browser may send for its own
    // long press, is that hold arriving first: it selects at once and shows no
    // menu, and one just after the hold shows none either.
    pointer(title, 'pointerdown')
    await expect(contextOn(title)).toBe(false)
    await expect(args.onSelectedChange).toHaveBeenCalledTimes(3)
    await expect(contextOn(title)).toBe(false)
    pointer(title, 'pointerup')

    // After a hold the keyboard's Enter still opens the card: the click it sends
    // carries a detail of 0. The runner's own key, KN-225; elsewhere that click.
    title.focus()
    if ('__KARNAMA_STORY_TEST__' in globalThis) {
      const browser = await import('vitest/browser')
      await browser.userEvent.keyboard('{Enter}')
    } else {
      clickOn(title, 0)
    }
    await expect(args.onOpen).toHaveBeenCalledTimes(2)
    title.blur()
  },
}

export const MobileNotAHold: Story = {
  args: { layout: 'mobile' },
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // What does not select a phone's card, KN-428. Each check waits the hold's
    // own length, begun after the card's timer, so the card's hold would have
    // run by the time it looks.
    const card = cardOf(canvasElement)
    const title = within(card).getByRole('button', { name: args.title })
    const box = title.getBoundingClientRect()

    // A tap, which opens the job opportunity.
    pointer(title, 'pointerdown')
    const tapped = pastTheHold()
    pointer(title, 'pointerup')
    clickOn(title, 1)
    await tapped
    await expect(args.onOpen).toHaveBeenCalledTimes(1)

    // A press that drifts further than the slop, a scroll beginning, and the
    // moves after it.
    pointer(title, 'pointerdown')
    const drifted = pastTheHold()
    pointer(title, 'pointermove', { clientX: box.left + box.width / 2 + SLOP + 1 })
    pointer(title, 'pointermove', { clientX: box.left + box.width / 2 + 2 * SLOP })
    await drifted
    pointer(title, 'pointerup')

    // One the browser takes over for a scroll, and one that leaves the card.
    pointer(title, 'pointerdown')
    const cancelled = pastTheHold()
    pointer(title, 'pointercancel')
    await cancelled
    pointer(title, 'pointerdown')
    const left = pastTheHold()
    pointer(title, 'pointerout', { relatedTarget: canvasElement.ownerDocument.body })
    await left

    // A second finger, a press on the three dots, and a right click, whose menu
    // is the browser's to show.
    pointer(title, 'pointerdown', { isPrimary: false, pointerId: 2 })
    await pastTheHold()
    const more = within(card)
      .getAllByRole('button')
      .find((button) => button !== title)
    if (!more) throw new Error('no three dots')
    pointer(more, 'pointerdown')
    await pastTheHold()
    pointer(title, 'pointerdown', { button: 2, pointerType: MOUSE })
    const right = pastTheHold()
    await expect(contextOn(title)).toBe(true)
    await right

    await expect(args.onSelectedChange).not.toHaveBeenCalled()
    await expect(args.onOpen).toHaveBeenCalledTimes(1)
  },
}

export const MobileTabOrder: Story = {
  args: { layout: 'mobile' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // The phone's folded checkbox is still in the keyboard's path, KN-341: Tab
    // from before the card reaches it first, and it unfolds while it has the
    // keyboard's focus, KN-428. The browser's own Tab, which only the runner
    // has, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    const card = cardOf(canvasElement)
    const checkbox = within(card).getByRole('checkbox')
    await expect(seen(checkbox)).toBe(false)
    canvasElement.tabIndex = -1
    canvasElement.focus()
    await browser.userEvent.tab()
    await expect(checkbox).toHaveFocus()
    canvasElement.removeAttribute('tabindex')
    await waitFor(() => expect(seen(checkbox)).toBe(true))
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
  play: async ({ args, canvasElement }) => {
    // Left to right, the stripe is at the left.
    const card = cardOf(canvasElement)
    await expect(Math.round(stripeOf(card).getBoundingClientRect().left - card.getBoundingClientRect().left)).toBe(0)
    // Its checkbox named in English, folded at rest, KN-423.
    await expect(within(card).getByRole('checkbox', { name: `${i18nFor('en-US')._('Select')} ${args.title}` })).not.toBeChecked()
  },
}
